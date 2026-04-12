import type { Agent, StreamFn } from "@mariozechner/pi-agent-core";
import type {
	Api,
	AssistantMessage,
	AssistantMessageEvent,
	Context,
	Model,
	OpenAICompletionsCompat,
	SimpleStreamOptions,
	StopReason,
	Tool,
	ToolCall,
} from "@mariozechner/pi-ai";
import { createAssistantMessageEventStream, streamSimple } from "@mariozechner/pi-ai";
import { convertMessages } from "@mariozechner/pi-ai/openai-completions";
import * as log from "./log.js";

/** POST body uses this model id (Hermes routes to Bedrock DeepSeek V3.2). */
export const HERMES_DEEPSEEK_MODEL_ID = "deepseek.v3.2";

const DEFAULT_HERMES_GATEWAY_URL = "http://localhost:3031";

const HERMES_OPENAI_COMPAT: Required<OpenAICompletionsCompat> = {
	supportsStore: false,
	supportsDeveloperRole: false,
	supportsReasoningEffort: true,
	reasoningEffortMap: {},
	supportsUsageInStreaming: true,
	maxTokensField: "max_completion_tokens",
	requiresToolResultName: false,
	requiresAssistantAfterToolResult: false,
	requiresThinkingAsText: false,
	thinkingFormat: "openai",
	openRouterRouting: {},
	vercelGatewayRouting: {},
	zaiToolStream: false,
	supportsStrictMode: true,
};

export function getHermesGatewayUrl(): string {
	const raw = process.env.HERMES_GATEWAY_URL?.trim();
	return raw && raw.length > 0 ? raw.replace(/\/$/, "") : DEFAULT_HERMES_GATEWAY_URL;
}

function convertTools(tools: Tool[], compat: Required<OpenAICompletionsCompat>) {
	return tools.map((tool) => ({
		type: "function" as const,
		function: {
			name: tool.name,
			description: tool.description,
			parameters: tool.parameters as Record<string, unknown>,
			...(compat.supportsStrictMode !== false && { strict: false }),
		},
	}));
}

function forwardStream(
	target: ReturnType<typeof createAssistantMessageEventStream>,
	source: AsyncIterable<AssistantMessageEvent>,
): void {
	void (async () => {
		for await (const event of source) {
			target.push(event);
		}
		target.end();
	})();
}

function assistantMessageToEventStream(
	stream: ReturnType<typeof createAssistantMessageEventStream>,
	msg: AssistantMessage,
): void {
	stream.push({ type: "start", partial: { ...msg } });
	const doneReason =
		msg.stopReason === "toolUse" ? "toolUse" : msg.stopReason === "length" ? "length" : ("stop" as const);
	stream.push({ type: "done", reason: doneReason, message: msg });
	stream.end();
}

function mapFinishReason(reason: string | null | undefined): { stopReason: StopReason; errorMessage?: string } {
	if (reason === null || reason === undefined) return { stopReason: "stop" };
	switch (reason) {
		case "stop":
		case "end":
			return { stopReason: "stop" };
		case "length":
			return { stopReason: "length" };
		case "function_call":
		case "tool_calls":
			return { stopReason: "toolUse" };
		case "content_filter":
			return { stopReason: "error", errorMessage: "Provider finish_reason: content_filter" };
		default:
			return { stopReason: "error", errorMessage: `Provider finish_reason: ${reason}` };
	}
}

function parseUsage(raw: {
	prompt_tokens?: number;
	completion_tokens?: number;
	prompt_tokens_details?: { cached_tokens?: number; cache_write_tokens?: number };
}): AssistantMessage["usage"] {
	const promptTokens = raw.prompt_tokens || 0;
	const reportedCached = raw.prompt_tokens_details?.cached_tokens || 0;
	const cacheWrite = raw.prompt_tokens_details?.cache_write_tokens || 0;
	const cacheRead = cacheWrite > 0 ? Math.max(0, reportedCached - cacheWrite) : reportedCached;
	const input = Math.max(0, promptTokens - cacheRead - cacheWrite);
	const output = raw.completion_tokens || 0;
	return {
		input,
		output,
		cacheRead,
		cacheWrite,
		totalTokens: input + output + cacheRead + cacheWrite,
		cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
	};
}

function assistantMessageFromOpenAiChoice(
	choice: {
		finish_reason?: string | null;
		message?: {
			content?: string | null;
			tool_calls?: Array<{
				id: string;
				function: { name: string; arguments: string };
			}>;
		};
	},
	displayModel: Model<Api>,
	rawUsage: AssistantMessage["usage"],
): AssistantMessage {
	const msg = choice.message;
	const content: AssistantMessage["content"] = [];
	if (msg?.content && String(msg.content).trim().length > 0) {
		content.push({ type: "text", text: String(msg.content) });
	}
	if (msg?.tool_calls && msg.tool_calls.length > 0) {
		for (const tc of msg.tool_calls) {
			let args: Record<string, unknown> = {};
			try {
				args = JSON.parse(tc.function.arguments || "{}") as Record<string, unknown>;
			} catch {
				args = {};
			}
			const block: ToolCall = {
				type: "toolCall",
				id: tc.id,
				name: tc.function.name,
				arguments: args,
			};
			content.push(block);
		}
	}
	const { stopReason, errorMessage } = mapFinishReason(choice.finish_reason ?? null);
	return {
		role: "assistant",
		content,
		api: displayModel.api,
		provider: displayModel.provider,
		model: displayModel.id,
		usage: rawUsage,
		stopReason,
		errorMessage,
		timestamp: Date.now(),
	};
}

function extractReplyString(data: Record<string, unknown>): string {
	if (typeof data.reply === "string" && data.reply) return data.reply;
	if (typeof data.text === "string" && data.text) return data.text;
	if (typeof data.message === "string" && data.message) return data.message;
	const choices = data.choices as Array<{ message?: { content?: string } }> | undefined;
	const c0 = choices?.[0]?.message?.content;
	if (typeof c0 === "string") return c0;
	return "";
}

export class HermesClient {
	constructor(public readonly baseUrl: string) {}

	static fromEnv(): HermesClient {
		return new HermesClient(getHermesGatewayUrl());
	}

	/**
	 * Lightweight reachability check (short timeout). Used before routing to Hermes.
	 * Bedrock DeepSeek V3.2 via Hermes (full routing to Bedrock).
	 */
	async ping(timeoutMs = 3000): Promise<boolean> {
		const url = this.baseUrl.replace(/\/$/, "");
		try {
			const response = await fetch(url, {
				method: "GET",
				signal: AbortSignal.timeout(timeoutMs),
			});
			const ok = response.status < 500;
			log.logInfo(
				`Hermes gateway ${url}: ${response.status} — Bedrock DeepSeek V3.2 (full routing via Hermes → Bedrock)`,
			);
			return ok;
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			log.logWarning("Hermes gateway ping failed", msg);
			return false;
		}
	}

	/**
	 * POST /v1/chat — simple text-oriented helper (non-streaming).
	 */
	async sendChat(
		messages: Array<{ role: string; content: string }>,
		surface?: string,
		signal?: AbortSignal,
	): Promise<string> {
		const url = `${this.baseUrl.replace(/\/$/, "")}/v1/chat`;
		const body: Record<string, unknown> = {
			model: HERMES_DEEPSEEK_MODEL_ID,
			messages,
		};
		if (surface !== undefined) body.surface = surface;

		const response = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
			signal,
		});

		const text = await response.text();
		if (!response.ok) {
			throw new Error(`Hermes /v1/chat failed: HTTP ${response.status} ${text}`);
		}
		let data: Record<string, unknown>;
		try {
			data = JSON.parse(text) as Record<string, unknown>;
		} catch {
			return text;
		}
		return extractReplyString(data) || text;
	}

	/**
	 * POST /v1/chat and parse the assistant message. Throws {@link HermesChatError} on HTTP errors
	 * (callers use {@link shouldFallbackToAnthropic} for 5xx / network / timeout → Claude fallback).
	 */
	async completeHermesTurn(
		convertModel: Model<"openai-completions">,
		displayModel: Model<Api>,
		context: Context,
		options?: SimpleStreamOptions,
		surface?: string,
	): Promise<AssistantMessage> {
		const url = `${this.baseUrl.replace(/\/$/, "")}/v1/chat`;
		const output: AssistantMessage = {
			role: "assistant",
			content: [],
			api: displayModel.api,
			provider: displayModel.provider,
			model: displayModel.id,
			usage: {
				input: 0,
				output: 0,
				cacheRead: 0,
				cacheWrite: 0,
				totalTokens: 0,
				cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
			},
			stopReason: "stop",
			timestamp: Date.now(),
		};

		const messages = convertMessages(convertModel, context, HERMES_OPENAI_COMPAT);
		const body: Record<string, unknown> = {
			model: HERMES_DEEPSEEK_MODEL_ID,
			messages,
		};
		if (context.tools && context.tools.length > 0) {
			body.tools = convertTools(context.tools, HERMES_OPENAI_COMPAT);
			body.tool_choice = "auto";
		}
		if (surface !== undefined) body.surface = surface;
		if (options?.maxTokens !== undefined) {
			body.max_tokens = options.maxTokens;
		}
		if (options?.temperature !== undefined) {
			body.temperature = options.temperature;
		}

		const response = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
			signal: options?.signal,
		});

		const rawText = await response.text();
		if (!response.ok || response.status >= 500) {
			throw new HermesChatError(response.status, rawText);
		}

		let data: Record<string, unknown>;
		try {
			data = JSON.parse(rawText) as Record<string, unknown>;
		} catch {
			throw new Error(`Hermes /v1/chat: invalid JSON: ${rawText.slice(0, 200)}`);
		}

		const choices = data.choices as
			| Array<{
					finish_reason?: string | null;
					message?: {
						content?: string | null;
						tool_calls?: Array<{ id: string; function: { name: string; arguments: string } }>;
					};
			  }>
			| undefined;

		const usageRaw = data.usage as Parameters<typeof parseUsage>[0] | undefined;
		const usage = usageRaw ? parseUsage(usageRaw) : output.usage;

		if (!choices?.[0]) {
			const replyOnly = extractReplyString(data);
			if (replyOnly) {
				output.content = [{ type: "text", text: replyOnly }];
				output.usage = usage;
				output.stopReason = "stop";
			} else {
				throw new Error("Hermes /v1/chat: missing choices[0] in response");
			}
		} else {
			const merged = assistantMessageFromOpenAiChoice(choices[0], displayModel, usage);
			Object.assign(output, merged);
		}

		return output;
	}
}

export async function logHermesGatewayStatus(): Promise<void> {
	await HermesClient.fromEnv().ping();
}

export class HermesChatError extends Error {
	constructor(
		public readonly status: number,
		public readonly body: string,
	) {
		super(`Hermes /v1/chat HTTP ${status}: ${body.slice(0, 500)}`);
		this.name = "HermesChatError";
	}
}

function shouldFallbackToAnthropic(error: unknown): boolean {
	if (error instanceof HermesChatError) {
		return error.status >= 500;
	}
	if (error instanceof TypeError && (error.message.includes("fetch") || error.message.includes("network"))) {
		return true;
	}
	const name = error instanceof Error ? error.name : "";
	if (name === "TimeoutError" || name === "AbortError") return true;
	return false;
}

export function createHermesModelForConversion(gatewayUrl: string): Model<"openai-completions"> {
	return {
		id: HERMES_DEEPSEEK_MODEL_ID,
		name: "DeepSeek V3.2",
		api: "openai-completions",
		provider: "hermes",
		baseUrl: gatewayUrl,
		reasoning: false,
		input: ["text", "image"],
		cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
		contextWindow: 200000,
		maxTokens: 8192,
	};
}

export function createHermesDisplayModel(gatewayUrl: string): Model<Api> {
	return {
		id: HERMES_DEEPSEEK_MODEL_ID,
		name: "DeepSeek V3.2 (Hermes)",
		api: "openai-completions",
		provider: "hermes",
		baseUrl: gatewayUrl,
		reasoning: false,
		input: ["text", "image"],
		cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
		contextWindow: 200000,
		maxTokens: 8192,
	};
}

/**
 * Routes LLM calls through Hermes /v1/chat (DeepSeek V3.2) when the gateway is reachable;
 * otherwise uses Claude Sonnet. Per-request fallback on HTTP 5xx / timeout / network errors.
 */
export function createMomHermesStreamFn(
	hermes: HermesClient,
	fallbackModel: Model<Api>,
	hermesConvertModel: Model<"openai-completions">,
	hermesDisplayModel: Model<Api>,
	getAgent: () => Agent,
): StreamFn {
	let pingResolved: boolean | undefined;
	let pingPromise: Promise<boolean> | undefined;

	async function resolvePing(): Promise<boolean> {
		if (pingResolved !== undefined) return pingResolved;
		pingPromise ??= hermes.ping();
		const ok = await pingPromise;
		pingResolved = ok;
		if (!ok) {
			getAgent().state.model = fallbackModel;
		}
		return ok;
	}

	return (_model, context, options) => {
		const stream = createAssistantMessageEventStream();
		void (async () => {
			try {
				const ok = await resolvePing();
				if (!ok) {
					forwardStream(stream, streamSimple(fallbackModel, context, options));
					return;
				}
				try {
					const msg = await hermes.completeHermesTurn(hermesConvertModel, hermesDisplayModel, context, options);
					assistantMessageToEventStream(stream, msg);
				} catch (error) {
					if (shouldFallbackToAnthropic(error)) {
						log.logWarning(
							"Hermes request failed; falling back to Anthropic",
							error instanceof Error ? error.message : String(error),
						);
						forwardStream(stream, streamSimple(fallbackModel, context, options));
						return;
					}
					const errMsg = error instanceof Error ? error.message : String(error);
					const output: AssistantMessage = {
						role: "assistant",
						content: [],
						api: hermesDisplayModel.api,
						provider: hermesDisplayModel.provider,
						model: hermesDisplayModel.id,
						usage: {
							input: 0,
							output: 0,
							cacheRead: 0,
							cacheWrite: 0,
							totalTokens: 0,
							cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
						},
						stopReason: options?.signal?.aborted ? "aborted" : "error",
						errorMessage: errMsg,
						timestamp: Date.now(),
					};
					stream.push({
						type: "error",
						reason: output.stopReason === "aborted" ? "aborted" : "error",
						error: output,
					});
					stream.end(output);
				}
			} catch (error) {
				log.logWarning(
					"Hermes stream setup failed; falling back to Anthropic",
					error instanceof Error ? error.message : String(error),
				);
				forwardStream(stream, streamSimple(fallbackModel, context, options));
			}
		})();
		return stream;
	};
}
