import type { NextFunction, Request, Response } from "express";
import { Op } from "sequelize";
import type { AuthenticatedRequest } from "@/middleware/clerk-auth";
import { ApiKey } from "@/models/ApiKey";
import { Subscription } from "@/models/Subscription";
import { validateApiKeyAgainstHash } from "@/utils/api-key";
import { logger } from "@/utils/logger";

export interface ApiKeyRequest extends Request {
	apiKeyUserId?: string;
	claraUser?: { userId: string; tier: string; apiKeyId?: string };
}

export type ClaraUser = NonNullable<ApiKeyRequest["claraUser"]>;

/**
 * Validates Bearer sk-clara-* (legacy) or cc_live_* (bcrypt hashed) API keys.
 * Sets `req.apiKeyUserId` and `req.claraUser` on success.
 */
export const requireApiKey = async (req: ApiKeyRequest, res: Response, next: NextFunction): Promise<void> => {
	try {
		const header = req.headers.authorization;
		if (!header?.startsWith("Bearer ")) {
			res.status(401).json({
				error: "API key required. Include: Authorization: Bearer <sk-clara-...> or cc_live_...",
			});
			return;
		}

		const rawKey = header.slice(7);

		if (rawKey.startsWith("sk-clara-")) {
			const apiKey = await ApiKey.findOne({
				where: { key: rawKey, isActive: true },
			});

			if (!apiKey) {
				res.status(401).json({ error: "Invalid or revoked API key" });
				return;
			}

			void ApiKey.update({ lastUsedAt: new Date() }, { where: { id: apiKey.id } }).catch((err: unknown) =>
				logger.error("Failed to update lastUsedAt:", err),
			);

			req.apiKeyUserId = apiKey.userId;
			req.claraUser = { userId: apiKey.userId, tier: apiKey.tier, apiKeyId: apiKey.id };
			next();
			return;
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
					void ApiKey.update({ lastUsedAt: new Date() }, { where: { id: row.id } }).catch((err: unknown) =>
						logger.error("Failed to update lastUsedAt:", err),
					);
					req.apiKeyUserId = row.userId;
					req.claraUser = { userId: row.userId, tier: row.tier, apiKeyId: row.id };
					next();
					return;
				}
			}

			res.status(401).json({ error: "Invalid or revoked API key" });
			return;
		}

		res.status(401).json({ error: "Unsupported bearer token for API key auth" });
	} catch (error) {
		logger.error("API key validation error:", error);
		res.status(500).json({ error: "Authentication failed" });
	}
};

/**
 * For /api/voice/* — accepts Clerk session JWT or Clara API keys (sk-clara / cc_live).
 */
export const requireClaraOrClerk = async (
	req: ApiKeyRequest & AuthenticatedRequest,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	const header = req.headers.authorization ?? "";
	if (header.startsWith("Bearer sk-clara-") || header.startsWith("Bearer cc_live_")) {
		await requireApiKey(req, res, next);
		return;
	}

	try {
		const auth = await (req.auth?.() ?? null);
		if (!auth?.userId) {
			res.status(401).json({ error: "Authentication required" });
			return;
		}
		const sub = await Subscription.findOne({ where: { userId: auth.userId } });
		const tier = sub?.tier ?? "free";
		req.claraUser = { userId: auth.userId, tier };
		next();
	} catch (error) {
		logger.error("Clara/Clerk auth error:", error);
		res.status(500).json({ error: "Authentication failed" });
	}
};
