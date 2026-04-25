import { Router } from "express";
import checkoutRoutes from "./checkout";
import keysRoutes from "./keys";
import mcpRoutes from "./mcp";
import modelsRoutes from "./models";
import onboardingRoutes from "./onboarding";
import registryAuthRoutes from "./registry-auth";
import userApiKeyRoutes from "./user-api-key";
import userUsageRoutes from "./user-usage";
import voiceRoutes from "./voice";
import waitlistRoutes from "./waitlist";

const router: ReturnType<typeof Router> = Router();

router.use("/mcp", mcpRoutes);
router.use("/checkout", checkoutRoutes);
router.use("/onboarding", onboardingRoutes);
router.use("/models", modelsRoutes);
router.use("/registry", registryAuthRoutes);
router.use("/keys", keysRoutes);
router.use("/user", userApiKeyRoutes);
router.use("/user", userUsageRoutes);
router.use("/waitlist", waitlistRoutes);
router.use("/voice", voiceRoutes);

export default router;
