import axios from "axios";
import { type Request, type Response, Router } from "express";
import { logger } from "@/utils/logger";

const router = Router();

const VOICE_URL = process.env.CLARA_VOICE_URL || "https://quik-nation--clara-voice-server-web.modal.run";

// POST /api/voice/greet — generate Clara greeting
router.post("/greet", async (req: Request, res: Response): Promise<void> => {
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

		res.set("Content-Type", "audio/wav");
		res.send(Buffer.from(response.data as ArrayBuffer));
	} catch (error) {
		logger.error("Voice greet error:", error);
		res.status(500).json({ error: "Voice generation failed" });
	}
});

// POST /api/voice/speak — general TTS
router.post("/speak", async (req: Request, res: Response): Promise<void> => {
	try {
		const { text, voice_id } = req.body as { text?: string; voice_id?: string };
		if (!text) {
			res.status(400).json({ error: "text is required" });
			return;
		}

		const response = await axios.post(
			`${VOICE_URL}/tts`,
			{ text, voice_id },
			{
				responseType: "arraybuffer",
				timeout: 30000,
			},
		);

		res.set("Content-Type", "audio/wav");
		res.send(Buffer.from(response.data as ArrayBuffer));
	} catch (error) {
		logger.error("Voice speak error:", error);
		res.status(500).json({ error: "Voice generation failed" });
	}
});

export default router;
