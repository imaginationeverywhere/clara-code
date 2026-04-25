import { type Response, Router } from "express";
import { type ApiKeyRequest, requireClaraOrClerk } from "@/middleware/api-key-auth";
import type { AuthenticatedRequest } from "@/middleware/clerk-auth";
import { claraScrumService } from "@/services/clara-scrum.service";
import { sprintService } from "@/services/sprint.service";
import { logger } from "@/utils/logger";

const router: ReturnType<typeof Router> = Router();

router.get(
	"/active",
	requireClaraOrClerk,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		const userId = req.claraUser?.userId;
		if (!userId) {
			res.status(401).json({ error: "Authenticated user required" });
			return;
		}
		const sprint = await sprintService.getActiveSprint(userId);
		res.json(sprint ?? null);
	},
);

router.get(
	"/velocity",
	requireClaraOrClerk,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		const userId = req.claraUser?.userId;
		if (!userId) {
			res.status(401).json({ error: "Authenticated user required" });
			return;
		}
		const velocity = await sprintService.getVelocity(userId);
		res.json(velocity);
	},
);

router.get(
	"/profile",
	requireClaraOrClerk,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		const userId = req.claraUser?.userId;
		if (!userId) {
			res.status(401).json({ error: "Authenticated user required" });
			return;
		}
		const profile = await claraScrumService.getUserProfile(userId);
		res.json(profile);
	},
);

router.get(
	"/standup/agent",
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
		const summary = await claraScrumService.getAgentSummaryForUser(userId, agentId);
		res.json(summary);
	},
);

router.post(
	"/standup/team",
	requireClaraOrClerk,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		const userId = req.claraUser?.userId;
		if (!userId) {
			res.status(401).json({ error: "Authenticated user required" });
			return;
		}
		const { sprint_id } = req.body as { sprint_id?: string };
		try {
			const report = await claraScrumService.runTeamStandup(userId, sprint_id);
			const prompt = claraScrumService.buildStandupPrompt(report);
			res.json({ report, prompt });
		} catch (err) {
			logger.error("[sprints/standup/team] error:", err);
			res.status(500).json({ error: "Failed to run team standup" });
		}
	},
);

router.post(
	"/",
	requireClaraOrClerk,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		const userId = req.claraUser?.userId;
		if (!userId) {
			res.status(401).json({ error: "Authenticated user required" });
			return;
		}
		const { goal } = req.body as { goal?: string };
		if (!goal) {
			res.status(400).json({ error: "goal is required" });
			return;
		}
		const sprint = await sprintService.createSprint(userId, goal);
		res.status(201).json(sprint);
	},
);

router.post(
	"/:sprintId/tasks",
	requireClaraOrClerk,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		const userId = req.claraUser?.userId;
		if (!userId) {
			res.status(401).json({ error: "Authenticated user required" });
			return;
		}
		const { agent_id, title, description } = req.body as {
			agent_id?: string;
			title?: string;
			description?: string;
		};
		if (!agent_id || !title) {
			res.status(400).json({ error: "agent_id and title are required" });
			return;
		}
		const task = await sprintService.addTask(req.params.sprintId, userId, agent_id, title, description);
		res.status(201).json(task);
	},
);

router.patch(
	"/tasks/:taskId",
	requireClaraOrClerk,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		const { status, blocker } = req.body as { status?: string; blocker?: string };
		if (!status) {
			res.status(400).json({ error: "status is required" });
			return;
		}
		if (status !== "in_progress" && status !== "blocked" && status !== "done") {
			res.status(400).json({ error: "invalid status" });
			return;
		}
		await sprintService.updateTask(req.params.taskId, status, blocker);
		res.json({ ok: true });
	},
);

router.post(
	"/:sprintId/standup",
	requireClaraOrClerk,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		const userId = req.claraUser?.userId;
		if (!userId) {
			res.status(401).json({ error: "Authenticated user required" });
			return;
		}
		const { agent_id } = req.body as { agent_id?: string };
		if (!agent_id) {
			res.status(400).json({ error: "agent_id is required" });
			return;
		}
		const report = await sprintService.generateStandupReport(userId, agent_id, req.params.sprintId);
		res.json(report);
	},
);

export default router;
