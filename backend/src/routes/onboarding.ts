import { requireAuth } from "@clerk/express";
import { type Response, Router } from "express";
import type { AuthenticatedRequest } from "@/middleware/clerk-auth";
import { Agent, type AgentModelTier, type AgentRole } from "@/models/Agent";
import { logger } from "@/utils/logger";

const router: ReturnType<typeof Router> = Router();

const NAME_REGEX = /^[a-zA-Z0-9 -]{1,40}$/;

router.post("/team", requireAuth(), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
	try {
		const auth = await (req.auth?.() ?? null);
		if (!auth?.userId) {
			res.status(401).json({ error: "Unauthorized" });
			return;
		}

		const body = req.body as {
			agents?: Array<{
				slotIndex: number;
				role: AgentRole;
				name: string;
				voiceId: string | null;
				modelTier: AgentModelTier;
			}>;
		};

		if (!body.agents || !Array.isArray(body.agents) || body.agents.length !== 3) {
			res.status(400).json({ error: "Exactly 3 agents required" });
			return;
		}

		const slots = new Set<number>();
		for (const a of body.agents) {
			if (![0, 1, 2].includes(a.slotIndex)) {
				res.status(400).json({ error: "slotIndex must be 0, 1, or 2" });
				return;
			}
			slots.add(a.slotIndex);
			if (!NAME_REGEX.test(a.name.trim())) {
				res.status(400).json({ error: "Invalid agent name" });
				return;
			}
		}
		if (slots.size !== 3) {
			res.status(400).json({ error: "Duplicate slotIndex" });
			return;
		}

		await Agent.destroy({ where: { userId: auth.userId } });

		await Agent.bulkCreate(
			body.agents.map((a) => ({
				userId: auth.userId,
				name: a.name.trim(),
				soul: "{}",
				slotIndex: a.slotIndex,
				role: a.role,
				voiceId: a.voiceId,
				modelTier: a.modelTier,
				isActive: false,
			})),
		);

		res.json({ success: true });
	} catch (error) {
		logger.error("onboarding team error:", error);
		res.status(500).json({ error: "Failed to save team" });
	}
});

router.post("/activate", requireAuth(), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
	try {
		const auth = await (req.auth?.() ?? null);
		if (!auth?.userId) {
			res.status(401).json({ error: "Unauthorized" });
			return;
		}

		const [affected] = await Agent.update({ isActive: true }, { where: { userId: auth.userId } });

		res.json({ success: true, agentCount: affected });
	} catch (error) {
		logger.error("onboarding activate error:", error);
		res.status(500).json({ error: "Failed to activate agents" });
	}
});

export default router;
