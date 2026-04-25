import { type Response, Router } from "express";
import { type ApiKeyRequest, requireClaraOrClerk } from "@/middleware/api-key-auth";
import type { AuthenticatedRequest } from "@/middleware/clerk-auth";
import { Agent } from "@/models/Agent";
import { agentConfigService } from "@/services/agent-config.service";
import { agentMessagingService, type SendMessageInput } from "@/services/agent-messaging.service";
import { agentPhaseService } from "@/services/agent-phase.service";
import { attachSkills } from "@/services/agent-skill.service";
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

router.post(
	"/",
	requireClaraOrClerk,
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

export default router;
