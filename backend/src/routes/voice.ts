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
import { silenceWav } from "@/utils/silence-wav";

const router = Router();

function voiceDevStubEnabled(): boolean {
	const v = process.env.CLARA_VOICE_DEV_STUB;
	return v === "1" || v === "true";
}

function hermesVoiceBase(): string | undefined {
	const hermes = process.env.HERMES_GATEWAY_URL?.trim();
	if (hermes) return hermes.replace(/\/$/, "");
	const legacy = voiceEnvBase();
	return legacy ? legacy.replace(/\/$/, "") : undefined;
}

function voiceEnvBase(): string | undefined {
	return process.env.CLARA_VOICE_URL?.trim();
}

if (!voiceEnvBase()) {
	logger.warn("CLARA_VOICE_URL is not set — voice endpoints will fail gracefully");
}

function ttsBaseUrl(inferenceBackend: string): string {
	const base = inferenceBackend.trim().replace(/\/$/, "");
	if (base.length > 0) return base;
	const v = voiceEnvBase();
	if (!v) return "";
	return v.replace(/\/$/, "");
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
				if (error instanceof Error && error.message.includes("Clara voice service is not configured")) {
					res.status(503).json({ error: "Voice service is not available" });
					return;
				}
				throw error;
			}
			const base = ttsBaseUrl(resolvedModel.inferenceBackend);
			if (!base) {
				res.status(503).json({ error: "Voice service is not available" });
				return;
			}
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
				if (error instanceof Error && error.message.includes("Clara voice service is not configured")) {
					res.status(503).json({ error: "Voice service is not available" });
					return;
				}
				throw error;
			}
			const base = ttsBaseUrl(resolvedModel.inferenceBackend);
			if (!base) {
				res.status(503).json({ error: "Voice service is not available" });
				return;
			}
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

// POST /api/voice/stt — Clerk session or Clara API key. Speech-to-text.
// Request body (JSON): { audioBase64: string, mimeType?: string, stubText?: string }
// Dev stub (CLARA_VOICE_DEV_STUB=1): returns { transcript } from
// `x-clara-stub-text` header, body.stubText, or a default. No Modal call.
// Real mode: proxies to HERMES_GATEWAY_URL/stt (cp-team owned).
router.post(
	"/stt",
	requireClaraOrClerk,
	voiceLimiter,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		try {
			if (voiceDevStubEnabled()) {
				const headerStub = req.get("x-clara-stub-text");
				const body = (req.body ?? {}) as { stubText?: string };
				const transcript =
					(typeof headerStub === "string" && headerStub.length > 0 ? headerStub : undefined) ??
					(typeof body.stubText === "string" && body.stubText.length > 0 ? body.stubText : undefined) ??
					"add a hello world function to this file";
				res.json({ transcript, stub: true });
				return;
			}

			const body = (req.body ?? {}) as { audioBase64?: string; mimeType?: string };
			if (typeof body.audioBase64 !== "string" || body.audioBase64.length === 0) {
				res.status(400).json({ error: "audioBase64 is required" });
				return;
			}
			const base = hermesVoiceBase();
			if (!base) {
				res.status(503).json({ error: "Voice service is not available" });
				return;
			}
			const response = await axios.post(
				`${base}/stt`,
				{ audio_base64: body.audioBase64, mime_type: body.mimeType ?? "audio/wav" },
				{ timeout: 30_000 },
			);
			const data = response.data as { transcript?: string };
			res.json({ transcript: data.transcript ?? "", stub: false });
		} catch (error) {
			logger.error("Voice stt error:", error);
			res.status(502).json({ error: "Speech recognition failed" });
		}
	},
);

// POST /api/voice/tts — Clerk session or Clara API key. Text-to-speech.
// Request body: { text: string, voice_id?: string }
// Dev stub: returns a 1-second silence WAV so callers can exercise audio plumbing.
// Real mode: proxies to HERMES_GATEWAY_URL/tts.
router.post(
	"/tts",
	requireClaraOrClerk,
	voiceLimiter,
	voiceLimitMiddleware,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		try {
			const { text, voice_id } = (req.body ?? {}) as { text?: string; voice_id?: string };
			if (!text) {
				res.status(400).json({ error: "text is required" });
				return;
			}

			if (voiceDevStubEnabled()) {
				res.set("Content-Type", "audio/wav");
				res.set("x-clara-voice-stub", "1");
				res.send(silenceWav(1));
				return;
			}

			const base = hermesVoiceBase();
			if (!base) {
				res.status(503).json({ error: "Voice service is not available" });
				return;
			}
			const response = await axios.post(
				`${base}/tts`,
				{ text, voice_id: voice_id ?? "clara" },
				{ responseType: "arraybuffer", timeout: 30_000 },
			);

			const userId = req.claraUser?.userId;
			const usageTier = (req.claraUser?.tier ?? "free") as VoiceTier;
			if (userId) {
				await voiceUsageService.incrementAfterSuccess(userId, usageTier);
			}

			res.set("Content-Type", "audio/wav");
			res.send(Buffer.from(response.data as ArrayBuffer));
		} catch (error) {
			logger.error("Voice tts error:", error);
			res.status(502).json({ error: "Text-to-speech failed" });
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

		const base = ttsBaseUrl("");
		if (!base) {
			res.status(503).json({ error: "Voice service is not available" });
			return;
		}
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
