import { type Response, Router } from "express";
import { requireAbuseCheck } from "@/middleware/abuse-protection";
import type { ApiKeyRequest } from "@/middleware/api-key-auth";
import { requireClaraOrClerk } from "@/middleware/api-key-auth";
import type { AuthenticatedRequest } from "@/middleware/clerk-auth";
import { Subscription } from "@/models/Subscription";
import { logger } from "@/utils/logger";

const router: ReturnType<typeof Router> = Router();

/**
 * Platform contract for CLI / Hermes: current subscription tier and billing window end.
 * `minutes_remaining` is reserved for future metering; Clara product remains unlimited for paid work.
 */
router.get(
	"/tier-status",
	requireClaraOrClerk,
	requireAbuseCheck,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		try {
			const userId = req.claraUser?.userId;
			const tier = req.claraUser?.tier ?? "basic";
			if (!userId) {
				res.status(401).json({ error: "Unauthorized" });
				return;
			}
			const sub = await Subscription.findOne({ where: { userId } });
			res.json({
				tier,
				minutes_remaining: null,
				billing_cycle_end: sub?.currentPeriodEnd?.toISOString() ?? null,
			});
		} catch (error) {
			logger.error("GET /api/v1/tier-status error:", error);
			res.status(500).json({ error: "Failed to load tier status" });
		}
	},
);

/** Reserved for Hermes intent dispatch; implementation follows gateway rollout. */
router.post(
	"/run",
	requireClaraOrClerk,
	requireAbuseCheck,
	async (_req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		res.status(501).json({
			ok: false,
			error: "intent_gateway_pending",
			message: "POST /api/v1/run is reserved for Hermes intent dispatch; not enabled on this deployment yet.",
		});
	},
);

export default router;
