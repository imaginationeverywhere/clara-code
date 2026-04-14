import type { NextFunction, Response } from "express";
import type { ApiKeyRequest } from "@/middleware/api-key-auth";
import type { AuthenticatedRequest } from "@/middleware/clerk-auth";
import {
	FREE_MONTHLY_LIMIT,
	getNextResetDateKey,
	type VoiceTier,
	voiceUsageService,
} from "@/services/voice-usage.service";

const DEFAULT_UPGRADE_URL = "https://claracode.ai/pricing";

function upgradeUrl(): string {
	return process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL.replace(/\/$/, "")}/pricing` : DEFAULT_UPGRADE_URL;
}

/**
 * Runs after `requireClaraOrClerk`. Blocks free users who have exhausted the monthly voice quota.
 * Does not increment usage — callers must call `voiceUsageService.incrementAfterSuccess` after a successful exchange.
 */
export const voiceLimitMiddleware = async (
	req: ApiKeyRequest & AuthenticatedRequest,
	res: Response,
	next: NextFunction,
): Promise<void> => {
		const userId = req.claraUser?.userId;
		const tierRaw = req.claraUser?.tier ?? "free";
		const tier = tierRaw as VoiceTier;

		if (!userId) {
			res.status(401).json({ error: "Authentication required" });
			return;
		}

		const allowed = await voiceUsageService.checkAndIncrement(userId, tier);
		if (!allowed) {
			const used = await voiceUsageService.getUsedCountForCurrentMonth(userId);
			res.status(402).json({
				error: "voice_limit_reached",
				message: "You've used all 100 voice exchanges for this month.",
				used,
				limit: FREE_MONTHLY_LIMIT,
				reset_date: getNextResetDateKey(),
				upgrade_url: upgradeUrl(),
			});
			return;
		}

		next();
};
