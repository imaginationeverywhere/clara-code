import { randomUUID } from "node:crypto";
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
import type { HookContext } from "@/lib/hooks";
import { requireAbuseCheck } from "@/middleware/abuse-protection";
import { filterConverseResponsePayload } from "@/middleware/agent-output-filter";
import { type ApiKeyRequest, requireClaraOrClerk } from "@/middleware/api-key-auth";
import type { AuthenticatedRequest } from "@/middleware/clerk-auth";
import { voiceLimiter } from "@/middleware/rate-limit";
import { UserVoiceClone } from "@/models/UserVoiceClone";
import {
	type AbuseModelUsed,
	abuseModelFromModelChoice,
	abuseProtectionService,
} from "@/services/abuse-protection.service";
import { hermesClient } from "@/services/hermes-client.service";
import { hookBus } from "@/services/hook-bus.service";
import { inferenceCache } from "@/services/inference-cache.service";
import { type HistoryEntry, memoryService } from "@/services/memory.service";
import { type ModelChoice, modelRouter } from "@/services/model-router.service";
import { refundOperationCredits, reserveOperationCredits } from "@/services/operation-credit.service";
import { classifyOperation } from "@/services/operation-weights";
import { type PlanTier, toPlanTier } from "@/services/plan-limits";
import { type VoiceTier, voiceUsageService } from "@/services/voice-usage.service";
import { logger } from "@/utils/logger";
import { silenceWav } from "@/utils/silence-wav";

const router: ReturnType<typeof Router> = Router();

function voiceDevStubEnabled(): boolean {
	const v = process.env.CLARA_VOICE_DEV_STUB;
	return v === "1" || v === "true";
}

/** Voice STT/TTS /converse edge (server-to-server). Prefer CLARA_*; HERMES_* is deprecated. */
function claraGatewayEdgeBase(): string | undefined {
	const u = process.env.CLARA_GATEWAY_URL?.trim() || process.env.HERMES_GATEWAY_URL?.trim();
	if (u) return u.replace(/\/$/, "");
	const legacy = voiceEnvBase();
	return legacy ? legacy.replace(/\/$/, "") : undefined;
}

function claraGatewayEdgeApiKey(): string | undefined {
	const k = process.env.CLARA_GATEWAY_API_KEY?.trim() || process.env.HERMES_API_KEY?.trim();
	return k && k.length > 0 ? k : undefined;
}

// Modal A10G GPU scales to zero; first request after idle loads Whisper + XTTS (60–120s).
// Give ourselves headroom so the CLI's warmup UX is what the user sees, not an axios timeout.
const CLARA_GATEWAY_TIMEOUT_MS = 150_000;

function ttsModelUsed(m: ModelConfig | undefined): AbuseModelUsed {
	if (!m) {
		return "gemma";
	}
	if (m.name === "mary" || m.name === "nikki") {
		return "premium";
	}
	return "gemma";
}

function inferConverseModel(data: unknown): {
	modelUsed: AbuseModelUsed;
	inputTokens: number;
	outputTokens: number;
	modalSeconds: number;
	cacheHit: boolean;
} {
	const d = (data && typeof data === "object" ? (data as Record<string, unknown>) : {}) as Record<string, unknown>;
	const raw = d.model_used;
	let modelUsed: AbuseModelUsed = "gemma";
	if (raw === "kimi" || raw === "deepseek" || raw === "premium" || raw === "gemma") {
		modelUsed = raw;
	}
	return {
		modelUsed,
		inputTokens:
			typeof d.bedrock_input_tokens === "number"
				? d.bedrock_input_tokens
				: typeof d.input_tokens === "number"
					? d.input_tokens
					: 0,
		outputTokens:
			typeof d.bedrock_output_tokens === "number"
				? d.bedrock_output_tokens
				: typeof d.output_tokens === "number"
					? d.output_tokens
					: 0,
		modalSeconds: typeof d.modal_seconds === "number" ? d.modal_seconds : 1.2,
		cacheHit: d.cache_hit === true,
	};
}

function claraGatewayEdgeHeaders(extra?: Record<string, string>): Record<string, string> {
	const key = claraGatewayEdgeApiKey();
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
	requireAbuseCheck,
	voiceLimiter,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		try {
			const { text, voice_id, model } = req.body as { text?: string; voice_id?: string; model?: string };
			const tier = (req.claraUser?.tier ?? "base") as ClaraTier;
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
			const usageTier = (req.claraUser?.tier ?? "basic") as VoiceTier;
			if (userId) {
				await voiceUsageService.incrementAfterSuccess(userId, usageTier);
				await abuseProtectionService.recordUsage({
					userId,
					agentId: "clara",
					modelUsed: ttsModelUsed(resolvedModel),
					taskType: "voice_greet",
					bedrockInputTokens: 0,
					bedrockOutputTokens: 0,
					modalComputeSeconds: 0.4,
					cacheHit: false,
				});
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
	requireAbuseCheck,
	voiceLimiter,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		try {
			const { text, voice_id, model } = req.body as { text?: string; voice_id?: string; model?: string };
			if (!text) {
				res.status(400).json({ error: "text is required" });
				return;
			}

			const tier = (req.claraUser?.tier ?? "base") as ClaraTier;
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
			const usageTier = (req.claraUser?.tier ?? "basic") as VoiceTier;
			if (userId) {
				await voiceUsageService.incrementAfterSuccess(userId, usageTier);
				await abuseProtectionService.recordUsage({
					userId,
					agentId: "clara",
					modelUsed: ttsModelUsed(resolvedModel),
					taskType: "voice_speak",
					bedrockInputTokens: 0,
					bedrockOutputTokens: 0,
					modalComputeSeconds: Math.max(0.1, (text as string).length * 0.0005),
					cacheHit: false,
				});
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
//   2. Edge injects CLARA_GATEWAY_API_KEY (or legacy HERMES_API_KEY) as Bearer for the upstream call. User token is not forwarded.
//
// Dev stub (CLARA_VOICE_DEV_STUB=1): returns { transcript } from
// `x-clara-stub-text` header, body.stubText, or a default. No Modal call.
// Real mode: proxies to configured gateway /voice/stt.
router.post(
	"/stt",
	requireClaraOrClerk,
	requireAbuseCheck,
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
				if (req.claraUser?.userId) {
					void abuseProtectionService.recordUsage({
						userId: req.claraUser.userId,
						agentId: "clara",
						modelUsed: "gemma",
						taskType: "voice_stt",
						bedrockInputTokens: 0,
						bedrockOutputTokens: 0,
						modalComputeSeconds: 0.1,
						cacheHit: true,
					});
				}
				res.json({ transcript, stub: true });
				return;
			}

			const body = (req.body ?? {}) as { audioBase64?: string; mimeType?: string };
			if (typeof body.audioBase64 !== "string" || body.audioBase64.length === 0) {
				res.status(400).json({ error: "audioBase64 is required" });
				return;
			}
			const base = claraGatewayEdgeBase();
			if (!base) {
				res.status(503).json({ error: "Voice service is not available" });
				return;
			}
			if (!claraGatewayEdgeApiKey()) {
				logger.error("CLARA_GATEWAY_API_KEY (or HERMES_API_KEY) is not set — refusing to proxy to voice gateway");
				res.status(503).json({ error: "Voice service is not available" });
				return;
			}
			const response = await axios.post(
				`${base}/voice/stt`,
				{ audio_base64: body.audioBase64, mime_type: body.mimeType ?? "audio/wav" },
				{ timeout: CLARA_GATEWAY_TIMEOUT_MS, headers: claraGatewayEdgeHeaders() },
			);
			const data = response.data as { transcript?: string };
			if (req.claraUser?.userId) {
				void abuseProtectionService.recordUsage({
					userId: req.claraUser.userId,
					agentId: "clara",
					modelUsed: "gemma",
					taskType: "voice_stt",
					bedrockInputTokens: 0,
					bedrockOutputTokens: 0,
					modalComputeSeconds: 0.35,
					cacheHit: false,
				});
			}
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
// CLARA_GATEWAY_API_KEY when calling the voice gateway.
//
// Dev stub: returns a 1-second silence WAV so callers can exercise audio plumbing.
// Real mode: proxies to configured gateway /voice/tts.
router.post(
	"/tts",
	requireClaraOrClerk,
	requireAbuseCheck,
	voiceLimiter,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		try {
			const { text, voice_id } = (req.body ?? {}) as { text?: string; voice_id?: string };
			if (!text) {
				res.status(400).json({ error: "text is required" });
				return;
			}

			if (voiceDevStubEnabled()) {
				const uid = req.claraUser?.userId;
				if (uid) {
					void abuseProtectionService.recordUsage({
						userId: uid,
						agentId: "clara",
						modelUsed: "gemma",
						taskType: "voice_tts",
						bedrockInputTokens: 0,
						bedrockOutputTokens: 0,
						modalComputeSeconds: 0.05,
						cacheHit: true,
					});
				}
				res.set("Content-Type", "audio/wav");
				res.set("x-clara-voice-stub", "1");
				res.send(silenceWav(1));
				return;
			}

			const base = claraGatewayEdgeBase();
			if (!base) {
				res.status(503).json({ error: "Voice service is not available" });
				return;
			}
			if (!claraGatewayEdgeApiKey()) {
				logger.error("CLARA_GATEWAY_API_KEY (or HERMES_API_KEY) is not set — refusing to proxy to voice gateway");
				res.status(503).json({ error: "Voice service is not available" });
				return;
			}
			const response = await axios.post(
				`${base}/voice/tts`,
				{ text, voice_id: voice_id ?? "clara" },
				{ responseType: "arraybuffer", timeout: CLARA_GATEWAY_TIMEOUT_MS, headers: claraGatewayEdgeHeaders() },
			);

			const userId = req.claraUser?.userId;
			const usageTier = (req.claraUser?.tier ?? "basic") as VoiceTier;
			if (userId) {
				await voiceUsageService.incrementAfterSuccess(userId, usageTier);
				await abuseProtectionService.recordUsage({
					userId,
					agentId: "clara",
					modelUsed: "gemma",
					taskType: "voice_tts",
					bedrockInputTokens: 0,
					bedrockOutputTokens: 0,
					modalComputeSeconds: Math.max(0.1, text.length * 0.0005),
					cacheHit: false,
				});
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
	return claraGatewayEdgeBase();
}

function converseApiKey(): string | undefined {
	const specific = process.env.CLARA_VOICE_API_KEY?.trim();
	if (specific && specific.length > 0) return specific;
	return claraGatewayEdgeApiKey();
}

// GET /api/voice/memory?agent_id=clara
// Returns memory context for (user, agent) pair. agent_id defaults to 'clara'.
router.get(
	"/memory",
	requireClaraOrClerk,
	requireAbuseCheck,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		const userId = req.claraUser?.userId;
		if (!userId) {
			res.status(401).json({ error: "Authenticated user required" });
			return;
		}
		const agentId =
			typeof req.query.agent_id === "string" && req.query.agent_id.length > 0 ? req.query.agent_id : "clara";
		const context = await memoryService.getMemoryContext(userId, agentId);
		res.json(context);
	},
);

// POST /api/voice/converse — single-round-trip voice: audio in → STT → LLM → TTS → audio out
// Request body: { audio_base64?, text?, voice_id?, history?, max_tokens?, session_id?, agent_id?, surface? }
// Response: { transcript, response_text, audio_base64 } — proxied from voice server
// Auth scheme: same as /stt — edge validates Clerk/Clara key, injects CLARA_VOICE_API_KEY server-side
router.post(
	"/converse",
	requireClaraOrClerk,
	requireAbuseCheck,
	voiceLimiter,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		const body = (req.body ?? {}) as {
			audio_base64?: string;
			text?: string;
			voice_id?: string;
			history?: unknown[];
			max_tokens?: number;
			session_id?: string;
			agent_id?: string;
			surface?: string;
			deployment_id?: string;
			agent_name?: string;
			agent_soul_md?: string;
			explicit_premium?: boolean;
			deepest_plugin?: boolean;
		};
		const {
			audio_base64,
			voice_id = "clara",
			history = [],
			max_tokens = 300,
			session_id,
			agent_id = "clara",
			surface = "cli",
			agent_soul_md,
			explicit_premium,
			deepest_plugin,
		} = body;
		let text: string | undefined = typeof body.text === "string" ? body.text : undefined;

		const hasAudio = typeof audio_base64 === "string" && audio_base64.length > 0;
		const hasText = typeof text === "string";
		if (!hasAudio && !hasText) {
			res.status(400).json({ error: "audio_base64 or text is required" });
			return;
		}

		const userId = req.claraUser?.userId;
		const useRoutedTextInference =
			!hasAudio &&
			hasText &&
			Boolean(userId) &&
			(process.env.ENABLE_INFERENCE_ROUTER === "1" || process.env.ENABLE_INFERENCE_ROUTER === "true") &&
			hermesClient.isConfigured();
		const planTier: PlanTier = toPlanTier(req.claraUser?.tier);
		const userMessageForCredits = typeof body.text === "string" ? body.text : "";
		const opCategory = classifyOperation(userMessageForCredits);
		let opCreditsReserved = false;
		if (userId) {
			const cr = await reserveOperationCredits(userId, agent_id, planTier, opCategory);
			if (!cr.ok) {
				res.status(402).json({
					error: "credit_limit_reached",
					message: "You've used your monthly operation credits. Upgrade to continue.",
					credits_remaining: cr.creditsRemaining,
					upgrade_url: cr.upgradeUrl,
				});
				return;
			}
			opCreditsReserved = cr.didReserve;
		}
		const refundOpCredits = async () => {
			if (!userId || !opCreditsReserved) {
				return;
			}
			opCreditsReserved = false;
			await refundOperationCredits(userId, agent_id, planTier, opCategory);
		};
		const sessionId = session_id ?? (userId ? `${userId}-${agent_id}-fallback` : "anonymous");
		const usageTier = (req.claraUser?.tier ?? "basic") as VoiceTier;

		const deploymentIdFromBody =
			typeof body.deployment_id === "string" && body.deployment_id.length > 0 ? body.deployment_id : null;
		const hookCtx: HookContext = {
			userId: userId ?? "anonymous",
			agentId: agent_id,
			sessionId,
			turnId: randomUUID(),
			...(deploymentIdFromBody ? { deploymentId: deploymentIdFromBody } : {}),
			tier: (req.claraUser?.tier ?? "basic") as string,
			metadata: {
				agentName:
					typeof body.agent_name === "string" && body.agent_name.length > 0 ? body.agent_name : "your agent",
			},
		};

		if (userId) {
			try {
				await hookBus.runSessionStart({ startingSoulMd: "", initialMemory: [] }, hookCtx);
			} catch (err) {
				logger.error("[hooks] runSessionStart failed", err);
			}
		}

		if (userId && typeof text === "string") {
			const promptResult = await hookBus.runUserPromptSubmit({ rawPrompt: text, modality: "text" }, hookCtx);
			if (promptResult.blocked) {
				await refundOpCredits();
				res.status(400).json({ error: promptResult.blockReason ?? "prompt_blocked" });
				return;
			}
			if (promptResult.deflectionResponse) {
				res.json({ response_text: promptResult.deflectionResponse, deflected: true, transcript: "" });
				return;
			}
			if (promptResult.sanitizedPrompt !== undefined) {
				text = promptResult.sanitizedPrompt;
			}
		}

		let memoryHistory: HistoryEntry[] = [];
		if (userId) {
			const [context] = await Promise.all([
				memoryService.getMemoryContext(userId, agent_id),
				memoryService.touchSession(userId, agent_id, surface, sessionId),
			]);
			memoryHistory = memoryService.buildHistory(context);
		}

		const base = converseVoiceBase();
		const apiKey = converseApiKey();
		if (!useRoutedTextInference) {
			if (!base) {
				await refundOpCredits();
				res.status(503).json({ error: "Voice service is not available" });
				return;
			}
			if (!apiKey) {
				logger.error("CLARA_VOICE_API_KEY / CLARA_GATEWAY_API_KEY is not set — refusing to proxy to voice server");
				await refundOpCredits();
				res.status(503).json({ error: "Voice service is not available" });
				return;
			}
		}

		const includeText = typeof text === "string";

		try {
			/** Opt-in: text-only, Hermes /inference + local routing + cache. Falls back to full voice proxy on error. */
			if (useRoutedTextInference && userId && includeText) {
				const userMsg = text as string;
				const soul = typeof agent_soul_md === "string" && agent_soul_md.length > 0 ? agent_soul_md : "";
				const histForKey: unknown[] = (memoryHistory as unknown[]) ?? [];
				const tokenEst = Math.max(
					1,
					Math.floor(JSON.stringify({ history: memoryHistory, user: userMsg }).length / 4),
				);
				try {
					const cached = await inferenceCache.get(soul, histForKey, userMsg);
					if (cached) {
						const abuseM = abuseModelFromModelChoice(cached.modelUsed);
						await voiceUsageService.incrementAfterSuccess(userId, usageTier);
						await abuseProtectionService.recordUsage({
							userId,
							agentId: agent_id,
							modelUsed: abuseM,
							taskType: "voice_convo",
							bedrockInputTokens: 0,
							bedrockOutputTokens: 0,
							modalComputeSeconds: 0,
							cacheHit: true,
						});
						void memoryService
							.saveTurn(userId, agent_id, sessionId, surface, "user", userMsg)
							.then(() => memoryService.saveTurn(userId, agent_id, sessionId, surface, "assistant", cached.text))
							.catch((err) => logger.error("[memory] background save failed:", err));
						const { payload: safe } = filterConverseResponsePayload(
							{ response_text: cached.text, transcript: userMsg, cached: true, routed_inference: true },
							userId,
							agent_id,
						);
						res.json(safe);
						return;
					}
					const routingCtx = {
						userId,
						tier: planTier,
						taskType: "voice_convo" as const,
						inputTokenEstimate: tokenEst,
						userHasDeepestPlugin: deepest_plugin === true,
						explicitPremiumRequest: explicit_premium === true,
					};
					const selectedModel: ModelChoice = modelRouter.selectModel(routingCtx);
					const reqBody: {
						model: ModelChoice;
						prompt: string;
						history: Array<{ role: "user" | "assistant"; content: string }>;
						maxTokens: number;
						systemPrompt?: string;
					} = {
						model: selectedModel,
						prompt: userMsg,
						history: memoryHistory as Array<{ role: "user" | "assistant"; content: string }>,
						maxTokens: max_tokens,
					};
					if (soul.length > 0) {
						reqBody.systemPrompt = soul;
					}
					const inf = await hermesClient.inference(reqBody, routingCtx);
					await inferenceCache.set(soul, histForKey, userMsg, inf);
					const abuseOut = abuseModelFromModelChoice(inf.modelUsed);
					await voiceUsageService.incrementAfterSuccess(userId, usageTier);
					await abuseProtectionService.recordUsage({
						userId,
						agentId: agent_id,
						modelUsed: abuseOut,
						taskType: "voice_convo",
						bedrockInputTokens: inf.inputTokens,
						bedrockOutputTokens: inf.outputTokens,
						modalComputeSeconds: inf.modalComputeSeconds,
						cacheHit: false,
					});
					void memoryService
						.saveTurn(userId, agent_id, sessionId, surface, "user", userMsg)
						.then(() => memoryService.saveTurn(userId, agent_id, sessionId, surface, "assistant", inf.text))
						.catch((err) => logger.error("[memory] background save failed:", err));
					const { payload: safePl } = filterConverseResponsePayload(
						{
							response_text: inf.text,
							transcript: userMsg,
							routed_inference: true,
							latency_ms: inf.latencyMs,
						},
						userId,
						agent_id,
					);
					res.json(safePl);
					return;
				} catch (e) {
					if (!base || !apiKey) {
						throw e;
					}
					logger.warn("[voice/converse] routed text inference failed, falling back to full voice proxy", e);
				}
			}

			if (!base || !apiKey) {
				await refundOpCredits();
				res.status(503).json({ error: "Voice service is not available" });
				return;
			}
			const response = await axios.post(
				`${base}/voice/converse`,
				{
					...(hasAudio ? { audio_base64 } : {}),
					...(includeText ? { text } : {}),
					voice_id,
					history: userId ? memoryHistory : Array.isArray(history) ? history : [],
					max_tokens,
					...(userId ? { session_id: sessionId, agent_id, surface } : {}),
				},
				{
					timeout: CLARA_GATEWAY_TIMEOUT_MS,
					headers: { Authorization: `Bearer ${apiKey}` },
					responseType: "json",
				},
			);
			if (userId) {
				await voiceUsageService.incrementAfterSuccess(userId, usageTier);
				const inf = inferConverseModel(response.data);
				void abuseProtectionService.recordUsage({
					userId,
					agentId: agent_id,
					modelUsed: inf.modelUsed,
					taskType: "voice_convo",
					bedrockInputTokens: inf.inputTokens,
					bedrockOutputTokens: inf.outputTokens,
					modalComputeSeconds: inf.modalSeconds,
					cacheHit: inf.cacheHit,
				});
			}
			if (userId) {
				const userContent = hasText ? (text ?? "") : "[audio]";
				const d0 = response.data as {
					response_text?: string;
					reply_text?: string;
					transcript?: string;
				};
				const assistantContent =
					typeof d0?.response_text === "string" && d0.response_text.length > 0
						? d0.response_text
						: typeof d0?.reply_text === "string" && d0.reply_text.length > 0
							? d0.reply_text
							: typeof d0?.transcript === "string" && d0.transcript.length > 0
								? d0.transcript
								: "";

				void Promise.all([
					userContent
						? memoryService.saveTurn(userId, agent_id, sessionId, surface, "user", userContent)
						: Promise.resolve(),
					assistantContent
						? memoryService.saveTurn(userId, agent_id, sessionId, surface, "assistant", assistantContent)
						: Promise.resolve(),
				]).catch((err) => logger.error("[memory] background save failed:", err));
			}

			const uid = userId ?? "anonymous";
			const aid = agent_id;

			let payload: unknown = response.data;
			if (userId && response.data && typeof response.data === "object" && !Array.isArray(response.data)) {
				const o: Record<string, unknown> = { ...((response.data as object) ?? {}) };
				const extracted =
					typeof o.response_text === "string" && o.response_text.length > 0
						? o.response_text
						: typeof o.reply_text === "string" && o.reply_text.length > 0
							? o.reply_text
							: typeof o.transcript === "string" && o.transcript.length > 0
								? o.transcript
								: "";
				if (extracted.length > 0) {
					const stop = await hookBus.runStop({ agentResponseText: extracted, toolCallsExecuted: 0 }, hookCtx);
					const st = stop.sanitizedResponseText ?? extracted;
					if (typeof o.response_text === "string") {
						o.response_text = st;
					}
					if (typeof o.reply_text === "string") {
						o.reply_text = st;
					}
				}
				payload = o;
			}
			const { payload: safePayload } = filterConverseResponsePayload(payload, uid, aid);
			res.json(safePayload);
		} catch (error) {
			logger.error("[voice/converse] proxy error:", error);
			await refundOpCredits();
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
