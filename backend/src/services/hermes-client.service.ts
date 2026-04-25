import axios, { type AxiosError } from "axios";
import { logger } from "@/utils/logger";
import { type ModelChoice, modelRouter, type RoutingContext } from "./model-router.service";

const HERMES_TIMEOUT_MS = 150_000;

export interface HermesRequest {
	model: ModelChoice;
	prompt: string;
	systemPrompt?: string;
	history?: Array<{ role: "user" | "assistant"; content: string }>;
	maxTokens?: number;
	temperature?: number;
}

export interface HermesResponse {
	text: string;
	modelUsed: ModelChoice;
	inputTokens: number;
	outputTokens: number;
	modalComputeSeconds: number;
	cacheHit: boolean;
	latencyMs: number;
}

function hermesBaseUrl(): string | undefined {
	const h = process.env.HERMES_GATEWAY_URL?.trim();
	return h ? h.replace(/\/$/, "") : undefined;
}

function hermesApiKey(): string | undefined {
	const k = process.env.HERMES_API_KEY?.trim();
	return k && k.length > 0 ? k : undefined;
}

export class HermesClient {
	isConfigured(): boolean {
		return Boolean(hermesBaseUrl() && hermesApiKey());
	}

	async inference(request: HermesRequest, routingContext: RoutingContext): Promise<HermesResponse> {
		let currentModel: ModelChoice = request.model;
		const attempts: ModelChoice[] = [];
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		while (currentModel) {
			attempts.push(currentModel);
			try {
				const response = await this.callHermes({ ...request, model: currentModel });
				if (attempts.length > 1) {
					logger.info("hermes_fallback_recovered", { attempted: attempts, succeededOn: currentModel });
				}
				return { ...response, modelUsed: currentModel };
			} catch (err) {
				const status = (err as AxiosError).response?.status;
				const retriable = !status || status >= 500 || status === 429;
				if (!retriable) {
					throw err;
				}

				const premiumFallbackDisabled = process.env.ENABLE_PREMIUM_FALLBACK === "0";
				let fallback = modelRouter.selectFallback(routingContext, currentModel);
				if (premiumFallbackDisabled && fallback === "bedrock_premium") {
					fallback = null;
				}
				if (!fallback) {
					logger.error("hermes_all_models_failed", { attempts, err });
					throw new Error("model_fallback_exhausted");
				}

				logger.warn("hermes_fallback", { from: currentModel, to: fallback, reason: status });
				currentModel = fallback;
			}
		}

		throw new Error("unreachable");
	}

	private async callHermes(request: HermesRequest): Promise<Omit<HermesResponse, "modelUsed">> {
		const base = hermesBaseUrl();
		const key = hermesApiKey();
		if (!base || !key) {
			throw new Error("hermes_not_configured");
		}
		const start = Date.now();
		const response = await axios.post(
			`${base}/inference`,
			{
				model: request.model,
				prompt: request.prompt,
				system_prompt: request.systemPrompt,
				history: request.history,
				max_tokens: request.maxTokens ?? 1024,
				temperature: request.temperature ?? 0.7,
			},
			{
				headers: { Authorization: `Bearer ${key}` },
				timeout: HERMES_TIMEOUT_MS,
			},
		);

		const data = response.data as {
			text?: string;
			input_tokens?: number;
			output_tokens?: number;
			modal_compute_seconds?: number;
			cache_hit?: boolean;
		};

		if (typeof data.text !== "string") {
			throw new Error("hermes_invalid_response");
		}

		return {
			text: data.text,
			inputTokens: typeof data.input_tokens === "number" ? data.input_tokens : 0,
			outputTokens: typeof data.output_tokens === "number" ? data.output_tokens : 0,
			modalComputeSeconds: typeof data.modal_compute_seconds === "number" ? data.modal_compute_seconds : 0,
			cacheHit: data.cache_hit === true,
			latencyMs: Date.now() - start,
		};
	}
}

export const hermesClient = new HermesClient();
