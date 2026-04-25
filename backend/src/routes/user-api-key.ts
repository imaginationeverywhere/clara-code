import { requireAuth } from "@clerk/express";
import { type Response, Router } from "express";
import { Op } from "sequelize";
import type { AuthenticatedRequest } from "@/middleware/clerk-auth";
import { ApiKey } from "@/models/ApiKey";
import { Subscription } from "@/models/Subscription";
import { toPlanTier } from "@/services/plan-limits";
import { type ApiKeyTier, generateApiKey } from "@/utils/api-key";
import { logger } from "@/utils/logger";

const router: ReturnType<typeof Router> = Router();
router.use(requireAuth());

router.get("/api-key", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
	try {
		const auth = await (req.auth?.() ?? null);
		if (!auth?.userId) {
			res.status(401).json({ error: "Unauthorized" });
			return;
		}

		const sub = await Subscription.findOne({ where: { userId: auth.userId } });
		const row = await ApiKey.findOne({
			where: { userId: auth.userId, isActive: true, keyHash: { [Op.ne]: null } },
			order: [["createdAt", "DESC"]],
		});

		if (!row) {
			res.json({ prefix: null, tier: sub?.tier ?? "free" });
			return;
		}

		res.json({
			prefix: row.keyPrefix,
			tier: row.tier,
			created_at: row.createdAt?.toISOString() ?? "",
			last_used_at: row.lastUsedAt?.toISOString() ?? null,
		});
	} catch (error) {
		logger.error("GET /api/user/api-key error:", error);
		res.status(500).json({ error: "Failed to load API key" });
	}
});

router.post("/api-key/regenerate", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
	try {
		const auth = await (req.auth?.() ?? null);
		if (!auth?.userId) {
			res.status(401).json({ error: "Unauthorized" });
			return;
		}

		const sub = await Subscription.findOne({ where: { userId: auth.userId } });
		const plan = toPlanTier(sub?.tier);
		if (plan === "free") {
			res.status(403).json({ error: "Active paid subscription required" });
			return;
		}
		const tier = plan as ApiKeyTier;

		await ApiKey.update({ isActive: false }, { where: { userId: auth.userId, keyHash: { [Op.ne]: null } } });

		const { key, hash, prefix } = generateApiKey(tier);
		await ApiKey.create({
			userId: auth.userId,
			name: "Subscription",
			key: null,
			keyHash: hash,
			keyPrefix: prefix,
			tier,
			isActive: true,
		});

		res.json({
			key,
			message: "Copy this key now — it will not be shown again",
		});
	} catch (error) {
		logger.error("POST /api/user/api-key/regenerate error:", error);
		res.status(500).json({ error: "Failed to regenerate API key" });
	}
});

export default router;
