import { type Response, Router } from "express";
import { type ClaraModelName, DEFAULT_MODEL, MODELS } from "@/config/models";
import { logger } from "@/utils/logger";
import { resolveRequestTier } from "@/utils/request-tier";

const router: ReturnType<typeof Router> = Router();

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
