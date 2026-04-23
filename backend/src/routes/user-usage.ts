import { type Response, Router } from "express";
import type { ApiKeyRequest } from "@/middleware/api-key-auth";
import { requireClaraOrClerk } from "@/middleware/api-key-auth";
import type { AuthenticatedRequest } from "@/middleware/clerk-auth";
import { type VoiceTier, voiceUsageService } from "@/services/voice-usage.service";
import { logger } from "@/utils/logger";

const router: ReturnType<typeof Router> = Router();

router.get(
	"/usage",
	requireClaraOrClerk,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		try {
			const userId = req.claraUser?.userId;
			const tierRaw = req.claraUser?.tier ?? "free";
			const tier = tierRaw as VoiceTier;

			if (!userId) {
				res.status(401).json({ error: "Unauthorized" });
				return;
			}

			const { used, limit, resetDate } = await voiceUsageService.getUsage(userId, tier);
			const unlimited = tier === "pro" || tier === "business";

			res.json({
				tier,
				voice_exchanges: {
					used,
					limit: unlimited ? null : limit,
					reset_date: resetDate,
					unlimited,
				},
			});
		} catch (error) {
			logger.error("GET /api/user/usage error:", error);
			res.status(500).json({ error: "Failed to load usage" });
		}
	},
);

export default router;
