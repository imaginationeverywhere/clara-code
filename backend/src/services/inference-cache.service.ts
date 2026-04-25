import { createHash } from "node:crypto";
import { getRedis } from "@/lib/redis";
import type { HermesResponse } from "./hermes-client.service";
import type { ModelChoice } from "./model-router.service";

const DEFAULT_TTL_SECONDS = 90 * 60;

function cacheEnabled(): boolean {
	return process.env.ENABLE_INFERENCE_CACHE !== "0" && process.env.ENABLE_INFERENCE_CACHE !== "false";
}

function cacheTtlSeconds(): number {
	const m = process.env.CACHE_TTL_MINUTES;
	if (m == null || m === "") {
		return DEFAULT_TTL_SECONDS;
	}
	const n = Number(m);
	if (!Number.isFinite(n) || n <= 0) {
		return DEFAULT_TTL_SECONDS;
	}
	return Math.floor(n * 60);
}

type CachedPayload = {
	text: string;
	modelUsed: ModelChoice;
	inputTokens: number;
	outputTokens: number;
	modalComputeSeconds: number;
};

export class InferenceCache {
	/**
	 * Key = hash of (soulMd + recent conversation + user message).
	 */
	private cacheKey(soulMd: string, history: unknown[], userMessage: string): string {
		const payload = JSON.stringify({ soulMd, history, userMessage });
		return `inference:cache:${createHash("sha256").update(payload).digest("hex")}`;
	}

	async get(
		soulMd: string,
		history: unknown[],
		userMessage: string,
	): Promise<(HermesResponse & { modelUsed: ModelChoice }) | null> {
		if (!cacheEnabled()) {
			return null;
		}
		const key = this.cacheKey(soulMd, history, userMessage);
		const raw = await getRedis().get(key);
		if (!raw) {
			return null;
		}
		try {
			const parsed = JSON.parse(raw) as CachedPayload;
			if (typeof parsed.text !== "string" || typeof parsed.modelUsed !== "string") {
				return null;
			}
			return {
				text: parsed.text,
				modelUsed: parsed.modelUsed,
				inputTokens: parsed.inputTokens,
				outputTokens: parsed.outputTokens,
				modalComputeSeconds: parsed.modalComputeSeconds,
				cacheHit: true,
				latencyMs: 0,
			};
		} catch {
			return null;
		}
	}

	async set(soulMd: string, history: unknown[], userMessage: string, response: HermesResponse): Promise<void> {
		if (!cacheEnabled()) {
			return;
		}
		const key = this.cacheKey(soulMd, history, userMessage);
		const payload: CachedPayload = {
			text: response.text,
			modelUsed: response.modelUsed,
			inputTokens: response.inputTokens,
			outputTokens: response.outputTokens,
			modalComputeSeconds: response.modalComputeSeconds,
		};
		const ttl = cacheTtlSeconds();
		await getRedis().set(key, JSON.stringify(payload), "EX", ttl);
	}
}

export const inferenceCache = new InferenceCache();
