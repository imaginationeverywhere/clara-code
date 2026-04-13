import type { Agent, ClaraClient, ClaraConfig, ClaraMessage, VoiceSession } from "./types.js";
import { joinHermesUrl } from "./url.js";

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

function authHeaders(config: ClaraConfig): HeadersInit {
	return {
		Authorization: `Bearer ${config.apiKey}`,
		...JSON_HEADERS,
	};
}

function parseClaraMessage(data: unknown): ClaraMessage {
	if (!data || typeof data !== "object") {
		throw new Error("Hermes returned invalid JSON for message");
	}
	const o = data as Record<string, unknown>;
	const role = o.role;
	const content = o.content;
	if (role !== "user" && role !== "assistant") {
		throw new Error("Hermes message missing valid role");
	}
	if (typeof content !== "string") {
		throw new Error("Hermes message missing content string");
	}
	const voiceUrl = o.voiceUrl;
	return {
		role,
		content,
		voiceUrl: typeof voiceUrl === "string" ? voiceUrl : undefined,
	};
}

async function readErrorBody(res: Response): Promise<string> {
	try {
		const t = await res.text();
		return t.slice(0, 500);
	} catch {
		return "";
	}
}

async function* parseSseTextStream(body: ReadableStream<Uint8Array> | null): AsyncIterable<string> {
	if (!body) return;
	const reader = body.getReader();
	const decoder = new TextDecoder();
	let buffer = "";
	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			buffer += decoder.decode(value, { stream: true });
			const parts = buffer.split(/\r?\n\r?\n/);
			buffer = parts.pop() ?? "";
			for (const part of parts) {
				for (const line of part.split(/\r?\n/)) {
					const trimmed = line.trim();
					if (trimmed.length === 0 || trimmed.startsWith(":")) continue;
					if (trimmed.startsWith("data:")) {
						const payload = trimmed.slice(5).trimStart();
						if (payload === "[DONE]") continue;
						yield payload;
					}
				}
			}
		}
	} finally {
		reader.releaseLock();
	}
}

class VoiceSessionImpl implements VoiceSession {
	private _id = "";
	private closed = false;
	private readonly settleReady: () => void;
	readonly ready: Promise<void>;

	constructor(private readonly config: ClaraConfig) {
		let settle!: () => void;
		this.ready = new Promise<void>((r) => {
			settle = r;
		});
		this.settleReady = settle;
		void this.create();
	}

	get id(): string {
		return this._id;
	}

	private async create(): Promise<void> {
		const url = joinHermesUrl(this.config.hermesUrl, "/v1/voice/sessions");
		const res = await fetch(url, {
			method: "POST",
			headers: authHeaders(this.config),
			body: JSON.stringify({}),
		});
		if (!res.ok) {
			this.settleReady();
			throw new Error(`Hermes voice session failed (${res.status}): ${await readErrorBody(res)}`);
		}
		const data = (await res.json()) as { id?: unknown };
		if (typeof data.id !== "string" || data.id.length === 0) {
			this.settleReady();
			throw new Error("Hermes voice session response missing id");
		}
		this._id = data.id;
		this.settleReady();
	}

	async send(text: string): Promise<ClaraMessage> {
		await this.ready;
		if (this.closed) throw new Error("Voice session is closed");
		const url = joinHermesUrl(this.config.hermesUrl, `/v1/voice/sessions/${encodeURIComponent(this._id)}/messages`);
		const res = await fetch(url, {
			method: "POST",
			headers: authHeaders(this.config),
			body: JSON.stringify({ text: text.trim(), model: this.config.model, voice: this.config.voice }),
		});
		if (!res.ok) {
			throw new Error(`Hermes voice message failed (${res.status}): ${await readErrorBody(res)}`);
		}
		const data = (await res.json()) as { message?: unknown };
		if (!data.message) {
			throw new Error("Hermes voice response missing message");
		}
		return parseClaraMessage(data.message);
	}

	async close(): Promise<void> {
		await this.ready;
		if (this.closed) return;
		this.closed = true;
		const url = joinHermesUrl(this.config.hermesUrl, `/v1/voice/sessions/${encodeURIComponent(this._id)}`);
		try {
			await fetch(url, { method: "DELETE", headers: authHeaders(this.config) });
		} catch {
			// best-effort
		}
	}
}

class AgentImpl implements Agent {
	constructor(
		readonly id: string,
		readonly name: string,
		readonly soul: string,
		private readonly config: ClaraConfig,
	) {}

	async ask(prompt: string): Promise<ClaraMessage> {
		const url = joinHermesUrl(this.config.hermesUrl, `/v1/agents/${encodeURIComponent(this.id)}/ask`);
		const res = await fetch(url, {
			method: "POST",
			headers: authHeaders(this.config),
			body: JSON.stringify({
				prompt,
				model: this.config.model,
				voice: this.config.voice,
			}),
		});
		if (!res.ok) {
			throw new Error(`Hermes agent ask failed (${res.status}): ${await readErrorBody(res)}`);
		}
		const data = (await res.json()) as { message?: unknown };
		if (!data.message) throw new Error("Hermes agent ask response missing message");
		return parseClaraMessage(data.message);
	}

	stream(prompt: string): AsyncIterable<string> {
		const config = this.config;
		const agentId = this.id;
		return streamAgentChunks(config, agentId, prompt);
	}
}

async function* streamAgentChunks(config: ClaraConfig, agentId: string, prompt: string): AsyncIterable<string> {
	const url = joinHermesUrl(config.hermesUrl, `/v1/agents/${encodeURIComponent(agentId)}/stream`);
	const res = await fetch(url, {
		method: "POST",
		headers: authHeaders(config),
		body: JSON.stringify({ prompt, model: config.model, voice: config.voice }),
	});
	if (!res.ok) {
		throw new Error(`Hermes agent stream failed (${res.status}): ${await readErrorBody(res)}`);
	}
	for await (const chunk of parseSseTextStream(res.body)) {
		yield chunk;
	}
}

class ClaraClientImpl implements ClaraClient {
	constructor(private readonly config: ClaraConfig) {}

	async ask(prompt: string): Promise<ClaraMessage> {
		const url = joinHermesUrl(this.config.hermesUrl, "/v1/ask");
		const res = await fetch(url, {
			method: "POST",
			headers: authHeaders(this.config),
			body: JSON.stringify({
				prompt,
				model: this.config.model,
				voice: this.config.voice,
			}),
		});
		if (!res.ok) {
			throw new Error(`Hermes ask failed (${res.status}): ${await readErrorBody(res)}`);
		}
		const data = (await res.json()) as { message?: unknown };
		if (!data.message) throw new Error("Hermes ask response missing message");
		return parseClaraMessage(data.message);
	}

	stream(prompt: string): AsyncIterable<string> {
		const config = this.config;
		return streamChunks(config, prompt);
	}

	startVoice(): VoiceSession {
		return new VoiceSessionImpl(this.config);
	}

	async createAgent(name: string, soul: string): Promise<Agent> {
		const url = joinHermesUrl(this.config.hermesUrl, "/v1/agents");
		const res = await fetch(url, {
			method: "POST",
			headers: authHeaders(this.config),
			body: JSON.stringify({ name: name.trim(), soul: soul.trim() }),
		});
		if (!res.ok) {
			throw new Error(`Hermes createAgent failed (${res.status}): ${await readErrorBody(res)}`);
		}
		const data = (await res.json()) as { id?: unknown; name?: unknown; soul?: unknown };
		if (typeof data.id !== "string" || typeof data.name !== "string" || typeof data.soul !== "string") {
			throw new Error("Hermes createAgent response missing id, name, or soul");
		}
		return new AgentImpl(data.id, data.name, data.soul, this.config);
	}
}

async function* streamChunks(config: ClaraConfig, prompt: string): AsyncIterable<string> {
	const url = joinHermesUrl(config.hermesUrl, "/v1/stream");
	const res = await fetch(url, {
		method: "POST",
		headers: {
			...authHeaders(config),
			Accept: "text/event-stream",
		},
		body: JSON.stringify({ prompt, model: config.model, voice: config.voice }),
	});
	if (!res.ok) {
		throw new Error(`Hermes stream failed (${res.status}): ${await readErrorBody(res)}`);
	}
	for await (const chunk of parseSseTextStream(res.body)) {
		yield chunk;
	}
}

export function createClient(config: ClaraConfig): ClaraClient {
	return new ClaraClientImpl(config);
}
