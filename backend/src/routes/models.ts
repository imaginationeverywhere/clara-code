import { type Response, Router } from "express";
import { DEFAULT_MODEL, MODELS, type ClaraModelName } from "@/config/models";
import { resolveRequestTier } from "@/utils/request-tier";
import { logger } from "@/utils/logger";

const router = Router();

router.get("/", async (req, res: Response): Promise<void> => {
	try {
		const tier = await resolveRequestTier(req);
		const names: ClaraModelName[] = tier === "free" ? ["maya"] : ["maya", "mary", "nikki"];
		const models = names.map((n) => {
			const m = MODELS[n];
			return { name: m.name, displayName: m.displayName, thinking: m.thinking };
		});
		res.json({ models, default: DEFAULT_MODEL });
	} catch (error) {
		logger.error("GET /api/models error:", error);
		res.status(500).json({ error: "Failed to list models" });
	}
});

export default router;
