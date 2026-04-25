import type { NextFunction, Response } from "express";
import type { ApiKeyRequest } from "@/middleware/api-key-auth";
import type { AuthenticatedRequest } from "@/middleware/clerk-auth";

/**
 * @deprecated Replaced by `AbuseProtectionService` + `requireAbuseCheck` (invisible rate/COGS limits).
 * Kept as a no-op so any stale imports do not reintroduce a customer-facing 100/mo cap.
 */
export const voiceLimitMiddleware = async (
	_req: ApiKeyRequest & AuthenticatedRequest,
	_res: Response,
	next: NextFunction,
): Promise<void> => {
	next();
};
