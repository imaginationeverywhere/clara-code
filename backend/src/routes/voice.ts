import axios from "axios";
import { type Response, Router } from "express";
import { type ApiKeyRequest, requireClaraOrClerk } from "@/middleware/api-key-auth";
import type { AuthenticatedRequest } from "@/middleware/clerk-auth";
import { voiceLimitMiddleware } from "@/middleware/voice-limit";
import { voiceLimiter } from "@/middleware/rate-limit";
import { type VoiceTier, voiceUsageService } from "@/services/voice-usage.service";
import { logger } from "@/utils/logger";

const router = Router();

const VOICE_URL = process.env.CLARA_VOICE_URL || "https://quik-nation--clara-voice-server-web.modal.run";

// POST /api/voice/greet — Clerk session or Clara API key (sk-clara / cc_live)
router.post(
	"/greet",
	requireClaraOrClerk,
	voiceLimiter,
	voiceLimitMiddleware,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		try {
			const { text, voice_id } = req.body as { text?: string; voice_id?: string };
			const response = await axios.post(
				`${VOICE_URL}/tts`,
				{
					text: text || "Hello! I'm Clara. How can I help you code today?",
					voice_id: voice_id || "clara",
				},
				{ responseType: "arraybuffer", timeout: 30000 },
			);

			const userId = req.claraUser?.userId;
			const tier = (req.claraUser?.tier ?? "free") as VoiceTier;
			if (userId) {
				await voiceUsageService.incrementAfterSuccess(userId, tier);
			}

			res.set("Content-Type", "audio/wav");
			res.send(Buffer.from(response.data as ArrayBuffer));
		} catch (error) {
			logger.error("Voice greet error:", error);
			res.status(500).json({ error: "Voice generation failed" });
		}
	},
);

// POST /api/voice/speak — Clerk session or Clara API key
router.post(
	"/speak",
	requireClaraOrClerk,
	voiceLimiter,
	voiceLimitMiddleware,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		try {
			const { text, voice_id } = req.body as { text?: string; voice_id?: string };
			if (!text) {
				res.status(400).json({ error: "text is required" });
				return;
			}

			const response = await axios.post(
				`${VOICE_URL}/tts`,
				{ text, voice_id },
				{ responseType: "arraybuffer", timeout: 30000 },
			);

			const userId = req.claraUser?.userId;
			const tier = (req.claraUser?.tier ?? "free") as VoiceTier;
			if (userId) {
				await voiceUsageService.incrementAfterSuccess(userId, tier);
			}

			res.set("Content-Type", "audio/wav");
			res.send(Buffer.from(response.data as ArrayBuffer));
		} catch (error) {
			logger.error("Voice speak error:", error);
			res.status(500).json({ error: "Voice generation failed" });
		}
	},
);

export default router;
