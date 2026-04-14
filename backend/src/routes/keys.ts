import { requireAuth } from "@clerk/express";
import { type Response, Router } from "express";
import type { AuthenticatedRequest } from "@/middleware/clerk-auth";
import { apiKeyCreateLimiter } from "@/middleware/rate-limit";
import { ApiKey } from "@/models/ApiKey";
import { logger } from "@/utils/logger";

const router = Router();

// All key routes require authentication
router.use(requireAuth());

// GET /api/keys — list user's API keys
router.get("/", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
	try {
		const auth = await (req.auth?.() ?? null);
		if (!auth?.userId) {
			res.status(401).json({ error: "Unauthorized" });
			return;
		}

		const keys = await ApiKey.findAll({
			where: { userId: auth.userId, isActive: true },
			attributes: ["id", "name", "key", "lastUsedAt", "createdAt"],
			order: [["createdAt", "DESC"]],
		});

		// Mask keys — only show last 4 chars
		const maskedKeys = keys.map((k: ApiKey) => ({
			id: k.id,
			name: k.name,
			key: k.key ? `sk-clara-...${k.key.slice(-4)}` : k.keyPrefix ? `${k.keyPrefix}...` : "—",
			lastUsedAt: k.lastUsedAt,
			createdAt: k.createdAt,
		}));

		res.json({ keys: maskedKeys });
	} catch (error) {
		logger.error("List API keys error:", error);
		res.status(500).json({ error: "Failed to list keys" });
	}
});

// POST /api/keys — create new API key
router.post("/", apiKeyCreateLimiter, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
	try {
		const auth = await (req.auth?.() ?? null);
		if (!auth?.userId) {
			res.status(401).json({ error: "Unauthorized" });
			return;
		}

		const { name } = req.body as { name?: string };
		if (!name || typeof name !== "string") {
			res.status(400).json({ error: "Key name is required" });
			return;
		}
		if (name.length > 255) {
			res.status(400).json({ error: "Key name must be 255 characters or fewer" });
			return;
		}

		const key = await ApiKey.create({ userId: auth.userId, name });

		// Return the FULL key only on creation — never shown again
		res.status(201).json({
			id: key.id,
			name: key.name,
			key: key.key,
			message: "Save this key — it will not be shown again",
		});
	} catch (error) {
		logger.error("Create API key error:", error);
		res.status(500).json({ error: "Failed to create key" });
	}
});

// DELETE /api/keys/:id — revoke API key
router.delete("/:id", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
	try {
		const auth = await (req.auth?.() ?? null);
		if (!auth?.userId) {
			res.status(401).json({ error: "Unauthorized" });
			return;
		}

		const key = await ApiKey.findOne({ where: { id: req.params.id, userId: auth.userId } });
		if (!key) {
			res.status(404).json({ error: "Key not found" });
			return;
		}

		await key.update({ isActive: false });
		res.json({ success: true });
	} catch (error) {
		logger.error("Delete API key error:", error);
		res.status(500).json({ error: "Failed to revoke key" });
	}
});

export default router;
