import * as log from "./log.js";

/**
 * Clara Gateway (Hermes) adapter for mom.
 * Routes LLM requests through the Hermes gateway on Modal instead of direct Anthropic API.
 *
 * Gateway: https://info-24346--hermes-gateway.modal.run
 * Model: Bedrock DeepSeek V3.2 (via Hermes)
 */

export interface HermesMessage {
	role: "user" | "assistant" | "system";
	content: string;
}

export interface HermesRequest {
	messages: HermesMessage[];
	max_tokens?: number;
	stream?: boolean;
}

export interface HermesResponse {
	content: string;
	model: string;
	usage?: {
		input_tokens: number;
		output_tokens: number;
	};
}

export class HermesClient {
	private readonly gatewayUrl: string;

	constructor(gatewayUrl: string) {
		this.gatewayUrl = gatewayUrl.replace(/\/$/, "");
	}

	async complete(request: HermesRequest): Promise<HermesResponse> {
		const url = `${this.gatewayUrl}/v1/chat`;

		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Client": "clara-code-mom/1.0",
			},
			body: JSON.stringify({
				messages: request.messages,
				max_tokens: request.max_tokens ?? 4096,
				stream: false,
			}),
		});

		if (!response.ok) {
			const body = await response.text();
			throw new Error(`Hermes gateway error ${response.status}: ${body}`);
		}

		return response.json() as Promise<HermesResponse>;
	}

	/**
	 * Streaming completion — yields text chunks
	 */
	async *stream(request: HermesRequest): AsyncGenerator<string> {
		const url = `${this.gatewayUrl}/v1/chat`;

		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Client": "clara-code-mom/1.0",
			},
			body: JSON.stringify({
				messages: request.messages,
				max_tokens: request.max_tokens ?? 4096,
				stream: true,
			}),
		});

		if (!response.ok) {
			const body = await response.text();
			throw new Error(`Hermes gateway error ${response.status}: ${body}`);
		}

		const reader = response.body?.getReader();
		if (!reader) return;

		const decoder = new TextDecoder();
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			const chunk = decoder.decode(value, { stream: true });
			for (const line of chunk.split("\n")) {
				if (line.startsWith("data: ")) {
					const data = line.slice(6);
					if (data === "[DONE]") return;
					try {
						const parsed = JSON.parse(data) as {
							choices?: Array<{ delta?: { content?: string } }>;
						};
						const text = parsed?.choices?.[0]?.delta?.content ?? "";
						if (text) yield text;
					} catch {
						// Skip malformed SSE lines
					}
				}
			}
		}
	}

	/**
	 * Health check — returns true if gateway is reachable
	 */
	async ping(): Promise<boolean> {
		try {
			const response = await fetch(`${this.gatewayUrl}/health`, {
				signal: AbortSignal.timeout(5000),
			});
			return response.ok;
		} catch {
			return false;
		}
	}
}

/**
 * Create a HermesClient from env, or return null if not configured.
 */
export function createHermesFromEnv(): HermesClient | null {
	const url = process.env.HERMES_GATEWAY_URL;
	if (!url) return null;
	return new HermesClient(url);
}

/**
 * Log which inference backend is available. Does not change the agent run loop.
 */
export async function logHermesGatewayStatus(): Promise<void> {
	const hermesClient = createHermesFromEnv();
	if (!hermesClient) {
		log.logInfo("Model router: Anthropic claude-sonnet-4-5 (direct)");
		return;
	}
	const alive = await hermesClient.ping().catch(() => false);
	if (alive) {
		log.logInfo("Model router: Clara Gateway (Hermes) reachable — Bedrock DeepSeek V3.2 (full routing TBD)");
	} else {
		log.logWarning("HERMES_GATEWAY_URL set but gateway unreachable — falling back to Anthropic for agent runs");
	}
}
