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

const router: ReturnType<typeof Router> = Router();

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

function hermesApiKey(): string | undefined {
	const k = process.env.HERMES_API_KEY?.trim();
	return k && k.length > 0 ? k : undefined;
}

// Modal A10G GPU scales to zero; first request after idle loads Whisper + XTTS (60–120s).
// Give ourselves headroom so the CLI's warmup UX is what the user sees, not an axios timeout.
const HERMES_TIMEOUT_MS = 150_000;

function hermesHeaders(extra?: Record<string, string>): Record<string, string> {
	const key = hermesApiKey();
	return {
		...(extra ?? {}),
		...(key ? { Authorization: `Bearer ${key}` } : {}),
	};
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
//
// Auth scheme (Option B, cp-team handoff 2026-04-19):
//   1. Edge validates Clerk JWT / sk-clara key via `requireClaraOrClerk`.
//   2. Edge injects HERMES_API_KEY as Bearer for the Modal call. Modal never sees the user token.
//
// Dev stub (CLARA_VOICE_DEV_STUB=1): returns { transcript } from
// `x-clara-stub-text` header, body.stubText, or a default. No Modal call.
// Real mode: proxies to HERMES_GATEWAY_URL/voice/stt (Whisper on Modal, cp-team owned).
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
			if (!hermesApiKey()) {
				logger.error("HERMES_API_KEY is not set — refusing to proxy to Modal");
				res.status(503).json({ error: "Voice service is not available" });
				return;
			}
			const response = await axios.post(
				`${base}/voice/stt`,
				{ audio_base64: body.audioBase64, mime_type: body.mimeType ?? "audio/wav" },
				{ timeout: HERMES_TIMEOUT_MS, headers: hermesHeaders() },
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
//
// Auth: same Option B scheme as /stt — edge validates the user's Clerk/Clara key, then swaps in
// HERMES_API_KEY when calling Modal.
//
// Dev stub: returns a 1-second silence WAV so callers can exercise audio plumbing.
// Real mode: proxies to HERMES_GATEWAY_URL/voice/tts (XTTS on Modal, cp-team owned).
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
			if (!hermesApiKey()) {
				logger.error("HERMES_API_KEY is not set — refusing to proxy to Modal");
				res.status(503).json({ error: "Voice service is not available" });
				return;
			}
			const response = await axios.post(
				`${base}/voice/tts`,
				{ text, voice_id: voice_id ?? "clara" },
				{ responseType: "arraybuffer", timeout: HERMES_TIMEOUT_MS, headers: hermesHeaders() },
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

function converseVoiceBase(): string | undefined {
	const specific = process.env.VOICE_SERVER_URL?.trim();
	if (specific) return specific.replace(/\/$/, "");
	return hermesVoiceBase();
}

function converseApiKey(): string | undefined {
	const specific = process.env.CLARA_VOICE_API_KEY?.trim();
	if (specific && specific.length > 0) return specific;
	return hermesApiKey();
}

// POST /api/voice/converse — single-round-trip voice: audio in → STT → LLM → TTS → audio out
// Request body: { audio_base64: string (required), voice_id?, history?, max_tokens? }
// Response: { transcript, response_text, audio_base64 } — proxied from voice server
// Auth scheme: same as /stt — edge validates Clerk/Clara key, injects CLARA_VOICE_API_KEY server-side
router.post(
	"/converse",
	requireClaraOrClerk,
	voiceLimiter,
	voiceLimitMiddleware,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		const {
			audio_base64,
			voice_id = "clara",
			history = [],
			max_tokens = 300,
		} = (req.body ?? {}) as {
			audio_base64?: string;
			voice_id?: string;
			history?: unknown[];
			max_tokens?: number;
		};

		if (typeof audio_base64 !== "string" || audio_base64.length === 0) {
			res.status(400).json({ error: "audio_base64 is required" });
			return;
		}

		const base = converseVoiceBase();
		if (!base) {
			res.status(503).json({ error: "Voice service is not available" });
			return;
		}

		const apiKey = converseApiKey();
		if (!apiKey) {
			logger.error("CLARA_VOICE_API_KEY / HERMES_API_KEY is not set — refusing to proxy to voice server");
			res.status(503).json({ error: "Voice service is not available" });
			return;
		}

		try {
			const response = await axios.post(
				`${base}/voice/converse`,
				{ audio_base64, voice_id, history, max_tokens },
				{
					timeout: HERMES_TIMEOUT_MS,
					headers: { Authorization: `Bearer ${apiKey}` },
				},
			);
			const userId = req.claraUser?.userId;
			const usageTier = (req.claraUser?.tier ?? "free") as VoiceTier;
			if (userId) {
				await voiceUsageService.incrementAfterSuccess(userId, usageTier);
			}
			res.json(response.data);
		} catch (error) {
			logger.error("[voice/converse] proxy error:", error);
			res.status(502).json({ error: "Voice server unreachable" });
		}
	},
);

// GET /api/voice/health — no auth required, proxies to voice server health check
router.get("/health", async (_req, res: Response): Promise<void> => {
	const base = converseVoiceBase();
	if (!base) {
		res.status(503).json({ voice_server: "unreachable", reason: "not configured" });
		return;
	}
	try {
		const upstream = await axios.get(`${base}/voice/health`, { timeout: 5_000 });
		res.json({ voice_server: upstream.data });
	} catch {
		res.status(503).json({ voice_server: "unreachable" });
	}
});

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
