import { Router } from "express";
import agentsRoutes from "./agents";
import checkoutRoutes from "./checkout";
import ejectionsRoutes from "./ejections";
import keysRoutes from "./keys";
import mcpRoutes from "./mcp";
import mobileUpdatesRoutes from "./mobile-updates";
import modelsRoutes from "./models";
import onboardingRoutes from "./onboarding";
import registryAuthRoutes from "./registry-auth";
import siteOwnerRoutes from "./site-owner";
import sprintsRoutes from "./sprints";
import userApiKeyRoutes from "./user-api-key";
import userUsageRoutes from "./user-usage";
import voiceRoutes from "./voice";
import waitlistRoutes from "./waitlist";

const router: ReturnType<typeof Router> = Router();

router.use("/agents", agentsRoutes);
router.use("/mcp", mcpRoutes);
router.use("/site-owner", siteOwnerRoutes);
router.use("/mobile-updates", mobileUpdatesRoutes);
router.use("/sprints", sprintsRoutes);
router.use("/checkout", checkoutRoutes);
router.use("/ejections", ejectionsRoutes);
router.use("/onboarding", onboardingRoutes);
router.use("/models", modelsRoutes);
router.use("/registry", registryAuthRoutes);
router.use("/keys", keysRoutes);
router.use("/user", userApiKeyRoutes);
router.use("/user", userUsageRoutes);
router.use("/waitlist", waitlistRoutes);
router.use("/voice", voiceRoutes);

export default router;
