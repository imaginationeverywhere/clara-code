import { type Response, Router } from "express";
import { requireAbuseCheck } from "@/middleware/abuse-protection";
import { type ApiKeyRequest, requireClaraOrClerk } from "@/middleware/api-key-auth";
import type { AuthenticatedRequest } from "@/middleware/clerk-auth";
import { planTierForAttach, talentService } from "@/services/talent.service";

const router: ReturnType<typeof Router> = Router();

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
		const ind = req.query.industry;
		const indStr = typeof ind === "string" ? ind : undefined;
		const filters: {
			category?: string;
			domain?: string;
			industry?: string;
			industryVertical?: string;
		} = {};
		if (typeof req.query.category === "string") filters.category = req.query.category;
		if (typeof req.query.domain === "string") filters.domain = req.query.domain;
		if (indStr !== undefined) {
			filters.industry = indStr;
			filters.industryVertical = indStr;
		}
		const out = await talentService.browseInventory(userId, filters);
		res.json({ talents: out });
	},
);

router.post(
	"/acquire",
	requireClaraOrClerk,
	requireAbuseCheck,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		const userId = req.claraUser?.userId;
		if (!userId) {
			res.status(401).json({ error: "Authenticated user required" });
			return;
		}
		const body = req.body as { talent_id?: string };
		if (typeof body.talent_id !== "string" || body.talent_id.length === 0) {
			res.status(400).json({ error: "talent_id required" });
			return;
		}
		try {
			const result = await talentService.acquire(userId, body.talent_id);
			res.json(result);
		} catch (err) {
			const msg = err instanceof Error ? err.message : "error";
			res.status(400).json({ error: msg });
		}
	},
);

router.post(
	"/attach",
	requireClaraOrClerk,
	requireAbuseCheck,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		const userId = req.claraUser?.userId;
		if (!userId) {
			res.status(401).json({ error: "Authenticated user required" });
			return;
		}
		const body = req.body as { agent_id?: string; talent_id?: string };
		if (typeof body.agent_id !== "string" || typeof body.talent_id !== "string") {
			res.status(400).json({ error: "agent_id and talent_id required" });
			return;
		}
		const tier = planTierForAttach(req.claraUser?.tier);
		try {
			await talentService.attach(userId, tier, body.agent_id, body.talent_id);
			res.json({ attached: true });
		} catch (err) {
			const msg = err instanceof Error ? err.message : "error";
			res.status(400).json({ error: msg });
		}
	},
);

router.post(
	"/detach",
	requireClaraOrClerk,
	requireAbuseCheck,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		const userId = req.claraUser?.userId;
		if (!userId) {
			res.status(401).json({ error: "Authenticated user required" });
			return;
		}
		const body = req.body as { agent_id?: string; talent_id?: string };
		if (typeof body.agent_id !== "string" || typeof body.talent_id !== "string") {
			res.status(400).json({ error: "agent_id and talent_id required" });
			return;
		}
		await talentService.detach(userId, body.agent_id, body.talent_id);
		res.json({ detached: true });
	},
);

router.get(
	"/agent/:agentId",
	requireClaraOrClerk,
	requireAbuseCheck,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		const userId = req.claraUser?.userId;
		if (!userId) {
			res.status(401).json({ error: "Authenticated user required" });
			return;
		}
		const t = await talentService.listAgentTalentsForUser(userId, req.params.agentId);
		if (t === null) {
			res.status(404).json({ error: "agent_not_found" });
			return;
		}
		res.json({ talents: t });
	},
);

export default router;
