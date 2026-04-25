import { type Response, Router } from "express";
import { requireAbuseCheck } from "@/middleware/abuse-protection";
import type { ApiKeyRequest } from "@/middleware/api-key-auth";
import { requireClaraOrClerk } from "@/middleware/api-key-auth";
import type { AuthenticatedRequest } from "@/middleware/clerk-auth";
import type { VoiceTier } from "@/services/voice-usage.service";
import { logger } from "@/utils/logger";

const router: ReturnType<typeof Router> = Router();

router.get(
	"/usage",
	requireClaraOrClerk,
	requireAbuseCheck,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		try {
			const userId = req.claraUser?.userId;
			const tierRaw = req.claraUser?.tier ?? "free";
			const tier = tierRaw as VoiceTier;

			if (!userId) {
				res.status(401).json({ error: "Unauthorized" });
				return;
			}

			res.json({
				tier,
				unlimited_usage: true,
				usage: { unlimited: true, note: "Clara does not show usage meters for paid work." },
			});
		} catch (error) {
			logger.error("GET /api/user/usage error:", error);
			res.status(500).json({ error: "Failed to load usage" });
		}
	},
);

export default router;
