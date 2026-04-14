import { Router } from "express";
import checkoutRoutes from "./checkout";
import keysRoutes from "./keys";
import modelsRoutes from "./models";
import registryAuthRoutes from "./registry-auth";
import userApiKeyRoutes from "./user-api-key";
import userUsageRoutes from "./user-usage";
import voiceRoutes from "./voice";
import waitlistRoutes from "./waitlist";

const router = Router();

router.use("/checkout", checkoutRoutes);
router.use("/models", modelsRoutes);
router.use("/registry", registryAuthRoutes);
router.use("/keys", keysRoutes);
router.use("/user", userApiKeyRoutes);
router.use("/user", userUsageRoutes);
router.use("/waitlist", waitlistRoutes);
router.use("/voice", voiceRoutes);

export default router;
