import { createHash } from "node:crypto";
import { PassThrough } from "node:stream";
import archiver from "archiver";
import { Op } from "sequelize";
import { sanitize } from "@/lib/ip-firewall";
import { presignGetObject, putZipObject } from "@/lib/s3";
import { ConversationTurn } from "@/models/ConversationTurn";
import { Ejection } from "@/models/Ejection";
import { Subscription } from "@/models/Subscription";
import type { AttachedSkillId } from "@/models/UserAgent";
import { UserAgent } from "@/models/UserAgent";
import { UserVoiceClone } from "@/models/UserVoiceClone";
import { PLAN_LIMITS, toPlanTier } from "@/services/plan-limits";
import { logger } from "@/utils/logger";

function skillNamesOnly(skills: AttachedSkillId[]): string[] {
	return skills.map((s) => (typeof s === "string" ? s : s.name));
}

export class EjectionService {
	async requestEjection(userId: string, tierRaw: string, userAgentId: string): Promise<Ejection> {
		const tier = toPlanTier(tierRaw);
		const monthKey = new Date().toISOString().slice(0, 7);
		const cap = PLAN_LIMITS[tier].runtimeAgentBuildsPerMonth;

		if (tier !== "enterprise" && cap !== null) {
			if (cap === 0) {
				throw new Error("ejection_not_available_on_tier");
			}
			const used = await Ejection.count({ where: { userId, monthKey } });
			if (used >= cap) {
				throw new Error(`ejection_cap_reached:${String(cap)}`);
			}
		}

		const userAgent = await UserAgent.findOne({ where: { id: userAgentId, userId } });
		if (!userAgent) {
			throw new Error("agent_not_found");
		}

		const timestamp = Date.now();
		const fingerprintInput = `${userAgent.soulMd}:${userId}:${String(timestamp)}`;
		const fingerprintHash = createHash("sha512").update(fingerprintInput).digest("hex");

		const s3Key = `ejections/${userId}/${userAgent.id}-${String(timestamp)}.zip`;

		const { pass, finalize } = await this.buildExportZipStream(userAgent, fingerprintHash, userId);
		const upload = putZipObject(s3Key, pass, { userId, agentId: userAgent.id, fingerprint: fingerprintHash });
		await finalize;
		await upload;

		const sub = await Subscription.findOne({ where: { userId } });
		const subscriptionActive = sub == null || sub.status === "active" || sub.status === "trialing";

		const ejection = await Ejection.create({
			userId,
			userAgentId: userAgent.id,
			monthKey,
			fingerprintHash,
			s3Key,
			status: "pending_attestation",
			exportedAt: new Date(),
			subscriptionActive,
		});

		logger.info("ejection_requested", { userId, agentId: userAgent.id, fingerprintHash });
		return ejection;
	}

	/** Pre-signed GET for download (24h). */
	async getDownloadUrl(ejection: Ejection): Promise<string> {
		return presignGetObject(ejection.s3Key, 60 * 60 * 24);
	}

	private async buildExportZipStream(
		userAgent: UserAgent,
		fingerprint: string,
		userId: string,
	): Promise<{ pass: PassThrough; finalize: Promise<void> }> {
		const pass = new PassThrough();
		const archive = archiver("zip", { zlib: { level: 9 } });
		archive.on("error", (err: Error) => {
			pass.destroy(err);
		});
		archive.pipe(pass);

		const safeName = userAgent.name.replace(/[/\\]/g, "_");
		const base = `agents/${safeName}`;

		const sanitizedSoul = sanitize(userAgent.soulMd);
		archive.append(sanitizedSoul, { name: `${base}/soul.md` });

		archive.append(
			JSON.stringify(
				{
					name: userAgent.name,
					skillNames: skillNamesOnly(userAgent.attachedSkills),
					personalityTweaks: userAgent.personalityTweaks,
					voiceId: userAgent.voiceId,
				},
				null,
				2,
			),
			{ name: `${base}/configuration.json` },
		);

		const turns = await ConversationTurn.findAll({
			where: { userId, agentId: userAgent.id },
			order: [["createdAt", "ASC"]],
			limit: 5000,
		});
		archive.append(
			JSON.stringify(
				turns.map((t) => ({
					role: t.role,
					content: t.content,
					createdAt: t.createdAt?.toISOString() ?? null,
				})),
				null,
				2,
			),
			{ name: `${base}/conversations.json` },
		);

		const clone = await UserVoiceClone.findByUserId(userId);
		if (clone?.sampleUrl) {
			archive.append(JSON.stringify({ voiceId: clone.voiceId, hasSample: Boolean(clone.sampleUrl) }, null, 2), {
				name: `${base}/voice/clone_info.json`,
			});
		}

		archive.append(this.buildReadme(userAgent.name, fingerprint), { name: "README.md" });
		archive.append(this.buildWhatYouHave(), { name: "what-you-have.md" });
		archive.append(this.buildWhatYouNeed(), { name: "what-you-need.md" });
		archive.append(this.buildAttestationTemplate(userId, fingerprint), { name: "ATTESTATION.pdf.txt" });

		const finalize = archive.finalize();
		return { pass, finalize };
	}

	private buildReadme(agentName: string, fingerprint: string): string {
		return `# ${agentName} — Clara Export

This ZIP contains your agent's identity + data. It does NOT contain Clara's platform (Hermes runtime, knowledge engine, skill implementations, voice server).

## Fingerprint
\`${fingerprint}\`

This fingerprint is registered with Clara. Using this exported agent configuration on a competing AI platform (Anthropic Managed Agents, OpenAI GPTs, etc.) while maintaining active Clara subscription of the same agent is a material breach of Clara's Terms of Service.

## Files
- \`soul.md\` — your agent's personality
- \`configuration.json\` — name, skills (by name only), personality tweaks
- \`conversations.json\` — conversation history (when available)
- \`what-you-have.md\` — full inventory
- \`what-you-need.md\` — what you'd need to run this elsewhere
- \`ATTESTATION.pdf.txt\` — sign and return

## Ejection ≠ Cancellation
Your Clara subscription remains active unless you explicitly cancel. Many customers build on Clara and deploy elsewhere while continuing to use Clara for new builds.
`;
	}

	private buildWhatYouHave(): string {
		return `# What You Have

- Your agent's identity and personality
- Your voice (if cloned) — see clone_info when present
- Your data (conversations, memory)
- Your skill selections (by name, not by implementation)
- A cryptographic fingerprint proving ownership

`;
	}

	private buildWhatYouNeed(): string {
		return `# What You Need to Run This

To actually operate your agent on your own infrastructure, you'll need:

1. **LLM inference** — your own access to an LLM (OpenAI, Anthropic, self-hosted). Clara's routing logic is not exported.
2. **Voice pipeline** — Whisper or similar for STT; any TTS for voice output. Clara's voice server weights are not exported.
3. **Skill implementations** — every skill name you selected needs its code rebuilt. Clara's implementations are not exported.
4. **Orchestration** — the agent harness (tool dispatch, memory management, context injection). LangChain or a custom framework will do.
5. **Memory system** — a knowledge or memory store you control.

Most customers find this is weeks of work — and they often prefer to stay on Clara. Enterprise customers get dedicated migration engineering help.
`;
	}

	private buildAttestationTemplate(userId: string, fingerprint: string): string {
		return `ATTESTATION — Clara Agent Export

I, as the owner of Clara account ${userId}, acknowledge:

1. This exported agent configuration is my IP. I own it.
2. Clara's platform (Hermes, Cognee, skill code, voice server, routing) remains Clara's IP and is NOT exported.
3. I will NOT run this exported agent configuration on a competing AI platform (Anthropic, OpenAI, etc.) while maintaining active Clara hosting of the same agent. Doing so is a material breach of Clara's Terms of Service.
4. Clara may cryptographically fingerprint-match this export against competing platforms' public directories. If matched with active Clara hosting, my subscription will be terminated without refund.
5. Exporting this agent does NOT cancel my Clara subscription.

Fingerprint: ${fingerprint}

Signed: ____________________  Date: __________
Print name: ________________
`;
	}

	async recordAttestation(ejectionId: string, userId: string, attestationS3Key: string): Promise<void> {
		const n = await Ejection.update(
			{
				attestationSignedAt: new Date(),
				attestationS3Key,
				status: "attested",
			},
			{ where: { id: ejectionId, userId } },
		);
		if (n[0] === 0) {
			throw new Error("ejection_not_found");
		}
	}

	/** Nightly job: match fingerprints against stub scanners + active subscription. */
	async runFingerprintScan(): Promise<void> {
		const { scanAnthropicMarketplace, scanOpenAiGptStore } = await import("@/services/fingerprint-scanners");
		const { alertOps } = await import("@/services/alert-ops.service");

		const [anth, openai] = await Promise.all([scanAnthropicMarketplace(), scanOpenAiGptStore()]);

		for (const match of [...anth, ...openai]) {
			const ejection = await Ejection.findOne({ where: { fingerprintHash: match.fingerprint } });
			if (!ejection) {
				continue;
			}
			const activeSub = await Subscription.findOne({
				where: { userId: ejection.userId, status: { [Op.in]: ["active", "trialing"] } },
			});
			if (!activeSub) {
				continue;
			}

			await ejection.update({
				detectedDoubleHosting: true,
				doubleHostingEvidence: {
					platform: match.platform,
					url: match.url,
					detected_at: new Date().toISOString(),
				},
			});

			logger.error("double_hosting_detected", {
				userId: ejection.userId,
				ejectionId: ejection.id,
				platform: match.platform,
				url: match.url,
			});

			await alertOps("double_hosting_violation", {
				userId: ejection.userId,
				ejectionId: ejection.id,
				evidence: match,
			});
		}
	}
}

export const ejectionService = new EjectionService();
