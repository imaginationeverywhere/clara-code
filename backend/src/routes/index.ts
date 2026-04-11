import { Router } from "express";
import keysRoutes from "./keys";
import voiceRoutes from "./voice";
import waitlistRoutes from "./waitlist";

const router = Router();

router.use("/keys", keysRoutes);
router.use("/waitlist", waitlistRoutes);
router.use("/voice", voiceRoutes);

export default router;
