import { requireAuth } from "@clerk/express";
import axios from "axios";
import { type Response, Router } from "express";
import {
	type ClaraTier,
	type ModelConfig,
	ModelTierError,
	modelTierErrorResponse,
	resolveModel,
} from "@/config/models";
import { type ApiKeyRequest, requireClaraOrClerk } from "@/middleware/api-key-auth";
import type { AuthenticatedRequest } from "@/middleware/clerk-auth";
import { voiceLimiter } from "@/middleware/rate-limit";
import { voiceLimitMiddleware } from "@/middleware/voice-limit";
import { UserVoiceClone } from "@/models/UserVoiceClone";
import { type VoiceTier, voiceUsageService } from "@/services/voice-usage.service";
import { logger } from "@/utils/logger";

const router = Router();

const VOICE_FALLBACK =
	process.env.CLARA_VOICE_URL || "https://info-24346--clara-voice-server-voiceserver-fastapi-app.modal.run";

function ttsBaseUrl(inferenceBackend: string): string {
	const base = inferenceBackend.trim().replace(/\/$/, "");
	return base.length > 0 ? base : VOICE_FALLBACK;
}

// POST /api/voice/greet — Clerk session or Clara API key (sk-clara / cc_live)
router.post(
	"/greet",
	requireClaraOrClerk,
	voiceLimiter,
	voiceLimitMiddleware,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		try {
			const { text, voice_id, model } = req.body as { text?: string; voice_id?: string; model?: string };
			const tier = (req.claraUser?.tier ?? "free") as ClaraTier;
			let resolvedModel: ModelConfig;
			try {
				resolvedModel = resolveModel(model, tier);
			} catch (error) {
				if (error instanceof ModelTierError) {
					res.status(403).json(modelTierErrorResponse(error));
					return;
				}
				throw error;
			}
			const base = ttsBaseUrl(resolvedModel.inferenceBackend);
			const response = await axios.post(
				`${base}/tts`,
				{
					text: text || "Hello! I'm Clara. How can I help you code today?",
					voice_id: voice_id || "clara",
				},
				{ responseType: "arraybuffer", timeout: 30000 },
			);

			const userId = req.claraUser?.userId;
			const usageTier = (req.claraUser?.tier ?? "free") as VoiceTier;
			if (userId) {
				await voiceUsageService.incrementAfterSuccess(userId, usageTier);
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
			const { text, voice_id, model } = req.body as { text?: string; voice_id?: string; model?: string };
			if (!text) {
				res.status(400).json({ error: "text is required" });
				return;
			}

			const tier = (req.claraUser?.tier ?? "free") as ClaraTier;
			let resolvedModel: ModelConfig;
			try {
				resolvedModel = resolveModel(model, tier);
			} catch (error) {
				if (error instanceof ModelTierError) {
					res.status(403).json(modelTierErrorResponse(error));
					return;
				}
				throw error;
			}
			const base = ttsBaseUrl(resolvedModel.inferenceBackend);
			const response = await axios.post(
				`${base}/tts`,
				{ text, voice_id },
				{ responseType: "arraybuffer", timeout: 30000 },
			);

			const userId = req.claraUser?.userId;
			const usageTier = (req.claraUser?.tier ?? "free") as VoiceTier;
			if (userId) {
				await voiceUsageService.incrementAfterSuccess(userId, usageTier);
			}

			res.set("Content-Type", "audio/wav");
			res.send(Buffer.from(response.data as ArrayBuffer));
		} catch (error) {
			logger.error("Voice speak error:", error);
			res.status(500).json({ error: "Voice generation failed" });
		}
	},
);

// POST /api/voice/clone — Clerk session only (onboarding voice clone)
router.post("/clone", requireAuth(), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
	try {
		const auth = await (req.auth?.() ?? null);
		if (!auth?.userId) {
			res.status(401).json({ error: "Unauthorized" });
			return;
		}
		const body = req.body as { audioBase64?: string };
		if (typeof body.audioBase64 !== "string" || body.audioBase64.length === 0) {
			res.status(400).json({ error: "audioBase64 required" });
			return;
		}

		const base = ttsBaseUrl(VOICE_FALLBACK);
		const voiceId = `${auth.userId}-custom`;
		const cloneUrl = `${base}/voice/clone`;

		await axios.post(
			cloneUrl,
			{
				voice_id: voiceId,
				audio_base64: body.audioBase64,
				sample_rate: 16000,
			},
			{ timeout: 120_000 },
		);

		const existingClone = await UserVoiceClone.findByUserId(auth.userId);
		if (existingClone) {
			await existingClone.update({ voiceId, sampleUrl: null, isDefault: true });
		} else {
			await UserVoiceClone.create({
				userId: auth.userId,
				voiceId,
				sampleUrl: null,
				isDefault: true,
			});
		}

		const ttsResponse = await axios.post(
			`${base}/voice/tts`,
			{
				text: "That sounded just like you.",
				voice_id: voiceId,
			},
			{ responseType: "arraybuffer", timeout: 30_000 },
		);

		const mime = (ttsResponse.headers["content-type"] as string | undefined) ?? "audio/mpeg";
		const b64 = Buffer.from(ttsResponse.data as ArrayBuffer).toString("base64");
		const playbackUrl = `data:${mime};base64,${b64}`;

		res.json({ voiceId, playbackUrl });
	} catch (error) {
		logger.error("Voice clone error:", error);
		res.status(502).json({ error: "Voice clone failed" });
	}
});

export default router;
