import type { Request } from "express";
import { Op } from "sequelize";
import type { AuthenticatedRequest } from "@/middleware/clerk-auth";
import { ApiKey } from "@/models/ApiKey";
import { Subscription } from "@/models/Subscription";
import { validateApiKeyAgainstHash } from "@/utils/api-key";

export type RequestTier = "base" | "pro" | "business";

/**
 * Resolves subscription tier for tier-gated public routes (e.g. `GET /api/models`).
 * Never returns 401 — invalid or missing auth maps to the public `base` access bucket.
 */
export async function resolveRequestTier(req: Request): Promise<RequestTier> {
	const header = req.headers.authorization ?? "";
	if (header.startsWith("Bearer sk-clara-") || header.startsWith("Bearer cc_live_")) {
		const rawKey = header.slice(7);
		if (rawKey.startsWith("sk-clara-")) {
			const apiKey = await ApiKey.findOne({
				where: { key: rawKey, isActive: true },
			});
			return (apiKey?.tier as RequestTier) ?? "base";
		}
		if (rawKey.startsWith("cc_live_")) {
			const prefix = rawKey.slice(0, 16);
			const candidates = await ApiKey.findAll({
				where: {
					keyPrefix: prefix,
					isActive: true,
					keyHash: { [Op.ne]: null },
				},
			});
			for (const row of candidates) {
				if (row.keyHash && (await validateApiKeyAgainstHash(rawKey, row.keyHash))) {
					return row.tier as RequestTier;
				}
			}
			return "base";
		}
	}

	const authReq = req as AuthenticatedRequest;
	try {
		const auth = await (authReq.auth?.() ?? null);
		if (auth?.userId) {
			const sub = await Subscription.findOne({ where: { userId: auth.userId } });
			return (sub?.tier as RequestTier) ?? "base";
		}
	} catch {
		// optional auth
	}
	return "base";
}
