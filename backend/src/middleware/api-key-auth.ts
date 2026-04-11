import type { NextFunction, Request, Response } from "express";
import { ApiKey } from "@/models/ApiKey";
import { logger } from "@/utils/logger";

export interface ApiKeyRequest extends Request {
	apiKeyUserId?: string;
}

/**
 * Validates Bearer sk-clara-* tokens. Updates lastUsedAt on success.
 * Use on any route the Clara Code IDE calls with an API key.
 */
export const requireApiKey = async (req: ApiKeyRequest, res: Response, next: NextFunction): Promise<void> => {
	try {
		const header = req.headers.authorization;
		if (!header?.startsWith("Bearer sk-clara-")) {
			res.status(401).json({ error: "API key required. Include: Authorization: Bearer sk-clara-..." });
			return;
		}

		const rawKey = header.slice(7); // strip "Bearer "
		const apiKey = await ApiKey.findOne({
			where: { key: rawKey, isActive: true },
		});

		if (!apiKey) {
			res.status(401).json({ error: "Invalid or revoked API key" });
			return;
		}

		// Track usage without blocking the request
		ApiKey.update({ lastUsedAt: new Date() }, { where: { id: apiKey.id } }).catch((err: unknown) =>
			logger.error("Failed to update lastUsedAt:", err),
		);

		req.apiKeyUserId = apiKey.userId;
		next();
	} catch (error) {
		logger.error("API key validation error:", error);
		res.status(500).json({ error: "Authentication failed" });
	}
};
