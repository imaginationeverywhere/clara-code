import { type Response, Router } from "express";
import { requireAbuseCheck } from "@/middleware/abuse-protection";
import { type ApiKeyRequest, requireClaraOrClerk } from "@/middleware/api-key-auth";
import type { AuthenticatedRequest } from "@/middleware/clerk-auth";
import { Agent } from "@/models/Agent";
import { AgentTemplate } from "@/models/AgentTemplate";
import { agentConfigService } from "@/services/agent-config.service";
import {
	canTierInitAgentRepo,
	createRepositoryFromTemplate,
	deriveVpHandle,
	getAgentInitConfigFromEnv,
	resolveUserForAgentInit,
	validateAgentNameForInit,
} from "@/services/agent-init.service";
import { agentMessagingService, type SendMessageInput } from "@/services/agent-messaging.service";
import { agentPhaseService } from "@/services/agent-phase.service";
import { attachSkills } from "@/services/agent-skill.service";
import { configAgentService } from "@/services/config-agent.service";
import { tierCanBuildRuntimeAgents, toPlanTier } from "@/services/plan-limits";
import type { AgentPhase } from "@/types/agent";
import { logger } from "@/utils/logger";

const router: ReturnType<typeof Router> = Router();

function pricingUrl(): string {
	if (process.env.FRONTEND_URL) {
		return `${process.env.FRONTEND_URL.replace(/\/$/, "")}/pricing`;
	}
	return "https://claracode.ai/pricing";
}

// Harness agents (`user_agents` table) — template → named VP team member. See `/config-agent` CLI.
router.get(
	"/templates",
	requireClaraOrClerk,
	requireAbuseCheck,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		const where: { isPublic: boolean; category?: string; industryVertical?: string } = { isPublic: true };
		const cat = typeof req.query.category === "string" ? req.query.category.trim() : "";
		if (cat.length > 0) {
			where.category = cat;
		}
		const ind = typeof req.query.industry_vertical === "string" ? req.query.industry_vertical.trim() : "";
		if (ind.length > 0) {
			where.industryVertical = ind;
		}
		const templates = await AgentTemplate.findAll({
			where,
			order: [
				["category", "ASC"],
				["sortOrder", "ASC"],
				["displayName", "ASC"],
			],
		});
		res.json({ templates });
	},
);

router.get(
	"/",
	requireClaraOrClerk,
	requireAbuseCheck,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		const userId = req.claraUser?.userId;
		if (!userId) {
			res.status(401).json({ error: "Authenticated user required" });
			return;
		}
		const agents = await configAgentService.listActiveAgents(userId);
		res.json({ agents });
	},
);

router.post(
	"/configure",
	requireClaraOrClerk,
	requireAbuseCheck,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		const userId = req.claraUser?.userId;
		if (!userId) {
			res.status(401).json({ error: "Authenticated user required" });
			return;
		}
		const tier = toPlanTier(req.claraUser?.tier);
		const body = req.body as {
			template_id?: string;
			name?: string;
			voice?: { source: string; voiceId?: string; audioBase64?: string };
			skill_ids?: string[];
			personality_tweaks?: Record<string, string>;
		};
		if (!body.template_id || !body.name || !body.voice) {
			res.status(400).json({ error: "template_id, name, and voice are required" });
			return;
		}
		const v = body.voice;
		let voice: { source: "library"; voiceId: string } | { source: "clone"; audioBase64: string };
		if (v.source === "clone" && typeof v.audioBase64 === "string") {
			voice = { source: "clone", audioBase64: v.audioBase64 };
		} else if (v.source === "library" && typeof v.voiceId === "string") {
			voice = { source: "library", voiceId: v.voiceId };
		} else {
			res.status(400).json({ error: "invalid_voice_payload" });
			return;
		}
		try {
			const payload: Parameters<typeof configAgentService.configure>[0] = {
				userId,
				tier,
				templateId: body.template_id,
				name: body.name,
				voice,
				skillIds: Array.isArray(body.skill_ids) ? body.skill_ids : [],
			};
			if (body.personality_tweaks) {
				payload.personalityTweaks = body.personality_tweaks;
			}
			const agent = await configAgentService.configure(payload);
			res.status(201).json({ agent });
		} catch (err) {
			const message = err instanceof Error ? err.message : "error";
			res.status(400).json({ error: message });
		}
	},
);

/** Provision a dedicated GitHub repo for an agent from the org template (Sprint 3 `clara init`). */
router.post(
	"/init",
	requireClaraOrClerk,
	requireAbuseCheck,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		const claraUserId = req.claraUser?.userId;
		if (!claraUserId) {
			res.status(401).json({ error: "Authentication required" });
			return;
		}

		const tier = toPlanTier(req.claraUser?.tier);
		if (!canTierInitAgentRepo(tier)) {
			res.status(403).json({
				reason: "tier_lock",
				error: "plan_limit",
				message: "Creating a standalone agent repository requires a plan that includes agent repository builds.",
				upgrade_url: pricingUrl(),
			});
			return;
		}

		const body = req.body as { name?: string };
		const name = typeof body.name === "string" ? body.name : "";
		const v = validateAgentNameForInit(name);
		if (!v.valid) {
			res.status(400).json({ error: "invalid_agent_name", message: v.message });
			return;
		}

		const user = await resolveUserForAgentInit(claraUserId);
		if (!user) {
			res.status(404).json({
				error: "user_not_found",
				message: "User record not found. Complete account setup first.",
			});
			return;
		}

		const gh = getAgentInitConfigFromEnv();
		if (!gh) {
			res.status(503).json({
				error: "agent_init_unavailable",
				message: "Repository provisioning is not enabled on this server (missing GITHUB_TOKEN).",
			});
			return;
		}

		const handle = deriveVpHandle(user);
		const repoName = `${handle}-${name.trim().toLowerCase()}`;

		try {
			const created = await createRepositoryFromTemplate({ config: gh, repoName });
			res.status(201).json({
				cloneUrl: created.cloneUrl,
				repoUrl: created.repoUrl,
				repository: created.fullName,
			});
		} catch (e) {
			const msg = e instanceof Error ? e.message : "error";
			if (msg === "repo_name_unavailable") {
				res.status(409).json({
					error: "repo_name_unavailable",
					message: "A repository with this name may already exist. Try a different agent name.",
				});
				return;
			}
			res.status(502).json({
				error: "provisioning_failed",
				message: "Could not create the repository. Try again later.",
			});
		}
	},
);

router.post(
	"/",
	requireClaraOrClerk,
	requireAbuseCheck,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		const userId = req.claraUser?.userId;
		if (!userId) {
			res.status(401).json({ error: "Authenticated user required" });
			return;
		}

		const body = req.body as {
			name?: string;
			soul?: string;
			soul_md?: string;
			phase?: AgentPhase;
			industry_vertical?: string;
			skills?: string[];
		};
		const name = body.name;
		const soulRaw = body.soul ?? body.soul_md ?? "";
		const phase: AgentPhase = body.phase ?? "builder";
		const industryVertical = body.industry_vertical ?? null;
		const skills = Array.isArray(body.skills) ? body.skills : [];

		if (!name || typeof name !== "string") {
			res.status(400).json({ error: "name is required" });
			return;
		}

		const tier = toPlanTier(req.claraUser?.tier);
		if (phase === "runtime" && !tierCanBuildRuntimeAgents(tier)) {
			res.status(403).json({
				error: "plan_limit",
				message:
					"Building runtime agents requires the Small Business plan. " +
					"Your current plan supports builder agents — the dev team that creates your product.",
				upgrade_url: pricingUrl(),
			});
			return;
		}

		const incompatible = skills.filter((sk) => !agentPhaseService.isSkillCompatible(sk, phase));
		if (incompatible.length > 0) {
			res.status(400).json({
				error: "skill_phase_mismatch",
				message: `These skills are not compatible with ${phase} agents: ${incompatible.join(", ")}`,
			});
			return;
		}

		try {
			const soul = agentConfigService.sanitizeSoulMd(soulRaw, name);
			const row = await Agent.create({
				userId,
				name,
				soul,
				slotIndex: 0,
				role: "frontend",
				voiceId: null,
				modelTier: "fast",
				isActive: true,
				phase,
				industryVertical,
			});

			const skillsToAttach = skills.length > 0 ? skills : agentPhaseService.getDefaultSkills(phase);
			await attachSkills(row.id, skillsToAttach);

			res.status(201).json({ agent: { id: row.id, name: row.name, phase: row.phase } });
		} catch (err) {
			logger.error("[agents] create failed:", err);
			res.status(500).json({ error: "Failed to create agent" });
		}
	},
);

router.post(
	"/message",
	requireClaraOrClerk,
	requireAbuseCheck,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		const userId = req.claraUser?.userId;
		if (!userId) {
			res.status(401).json({ error: "Authenticated user required" });
			return;
		}

		const {
			from_agent_id,
			to_agent_id,
			message_type = "request",
			content,
			thread_id,
			metadata,
		} = req.body as {
			from_agent_id?: string;
			to_agent_id?: string;
			message_type?: string;
			content?: string;
			thread_id?: string;
			metadata?: Record<string, unknown>;
		};

		if (!from_agent_id || !to_agent_id || !content) {
			res.status(400).json({ error: "from_agent_id, to_agent_id, and content are required" });
			return;
		}

		if (to_agent_id === "all" && from_agent_id !== "clara") {
			res.status(403).json({ error: "Only Clara can broadcast to all agents" });
			return;
		}

		try {
			const sendPayload: SendMessageInput = {
				userId,
				fromAgentId: from_agent_id,
				toAgentId: to_agent_id,
				messageType: message_type as "request" | "response" | "broadcast" | "escalate",
				content,
			};
			if (thread_id) sendPayload.threadId = thread_id;
			if (metadata) sendPayload.metadata = metadata;
			const message = await agentMessagingService.send(sendPayload);
			res.status(201).json({ id: message.id, thread_id: message.threadId });
		} catch (err) {
			logger.error("[agents/message] error:", err);
			res.status(500).json({ error: "Failed to send message" });
		}
	},
);

router.get(
	"/inbox",
	requireClaraOrClerk,
	requireAbuseCheck,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		const userId = req.claraUser?.userId;
		if (!userId) {
			res.status(401).json({ error: "Authenticated user required" });
			return;
		}

		const agentId = typeof req.query.agent_id === "string" ? req.query.agent_id : null;
		if (!agentId) {
			res.status(400).json({ error: "agent_id is required" });
			return;
		}

		const messages = await agentMessagingService.readInbox(userId, agentId);
		res.json({ messages, count: messages.length });
	},
);

router.get(
	"/thread/:threadId",
	requireClaraOrClerk,
	requireAbuseCheck,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		const userId = req.claraUser?.userId;
		if (!userId) {
			res.status(401).json({ error: "Authenticated user required" });
			return;
		}

		const { threadId } = req.params;
		const messages = await agentMessagingService.getThread(userId, threadId);
		res.json({ messages });
	},
);

router.delete(
	"/:id",
	requireClaraOrClerk,
	requireAbuseCheck,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		const userId = req.claraUser?.userId;
		if (!userId) {
			res.status(401).json({ error: "Authenticated user required" });
			return;
		}
		try {
			await configAgentService.retireAgent(userId, req.params.id);
			res.status(204).end();
		} catch {
			res.status(404).json({ error: "not_found" });
		}
	},
);

export default router;
