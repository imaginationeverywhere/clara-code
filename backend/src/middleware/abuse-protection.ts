import type { NextFunction, Response } from "express";
import type { ApiKeyRequest } from "@/middleware/api-key-auth";
import { abuseProtectionService } from "@/services/abuse-protection.service";
import { toPlanTier } from "@/services/plan-limits";
import { logger } from "@/utils/logger";

export async function requireAbuseCheck(req: ApiKeyRequest, res: Response, next: NextFunction): Promise<void> {
	const userId = req.claraUser?.userId;
	const tier = toPlanTier(req.claraUser?.tier);

	if (!userId) {
		res.status(401).json({ error: "unauthorized" });
		return;
	}

	try {
		const result = await abuseProtectionService.preflight(userId, tier);
		if (!result.allowed) {
			if (result.reason === "rate_limit") {
				res.status(429).json({
					error: "rate_limit",
					message: "Slow down — Clara's catching her breath.",
					retry_after: result.retryAfter,
				});
			} else {
				res.status(403).json({
					error: "account_review",
					message: "We've paused your account due to unusually high usage. Please contact support.",
					support_url: "https://claracode.ai/support",
				});
			}
			return;
		}
	} catch (err) {
		// If Redis/DB is down, do not block paid routes — ops must restore infra.
		logger.error("requireAbuseCheck failed (failing open)", err);
		next();
		return;
	}

	next();
}
