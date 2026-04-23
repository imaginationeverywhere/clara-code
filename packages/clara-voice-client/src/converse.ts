/**
 * POST {base}/voice/converse — quikvoice. Body shape may evolve; keep fields optional.
 */

export type ConverseRequestBody = {
	audio_base64?: string;
	mime_type?: string;
	text?: string;
	session_id?: string;
	extra?: Record<string, unknown>;
};

export type ConverseSuccess = {
	ok: true;
	reply_text?: string;
	reply_audio_base64?: string;
	mime_type?: string;
	rawJson?: unknown;
};

export type ConverseFailure = {
	ok: false;
	offline?: boolean;
	error: string;
};

export type ConverseResult = ConverseSuccess | ConverseFailure;

/**
 * Trailing slashes are stripped; path is always `/voice/converse` on the voice service host.
 */
export function resolveConverseUrl(voiceServiceBase: string): string {
	const b = voiceServiceBase.trim().replace(/\/$/, "");
	if (b.length === 0) {
		return "/voice/converse";
	}
	return `${b}/voice/converse`;
}

/**
 * Calls `POST /voice/converse` with JSON body. On network errors returns `{ ok: false, offline: true }` without throwing.
 */
export async function postVoiceConverse(
	voiceServiceBase: string,
	body: ConverseRequestBody,
	options: { apiKey?: string; signal?: AbortSignal } = {},
): Promise<ConverseResult> {
	const url = resolveConverseUrl(voiceServiceBase);
	if (!url.startsWith("http")) {
		return { ok: false, error: "Voice service base URL is not configured or invalid." };
	}
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		Accept: "application/json,audio/*;q=0.9",
	};
	const { apiKey } = options;
	if (apiKey && apiKey.length > 0) {
		headers.Authorization = `Bearer ${apiKey}`;
	}
	try {
		const response = await fetch(url, {
			method: "POST",
			headers,
			body: JSON.stringify(body),
			signal: options.signal,
		});
		const text = await response.text().catch(() => "");
		if (!response.ok) {
			return {
				ok: false,
				error: text || response.statusText || `HTTP ${response.status}`,
			};
		}
		const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
		if (contentType.includes("application/json") || (text.length > 0 && text.trim().startsWith("{"))) {
			let data: unknown;
			try {
				data = JSON.parse(text) as unknown;
			} catch {
				return { ok: true, reply_text: text, rawJson: undefined };
			}
			if (data && typeof data === "object" && !Array.isArray(data)) {
				const o = data as Record<string, unknown>;
				const reply_text =
					(typeof o.reply === "string" && o.reply) ||
					(typeof o.reply_text === "string" && o.reply_text) ||
					(typeof o.replyText === "string" && o.replyText) ||
					(typeof o.text === "string" && o.text) ||
					(typeof o.transcript === "string" && o.transcript) ||
					undefined;
				const reply_audio_base64 = typeof o.reply_audio_base64 === "string" ? o.reply_audio_base64 : undefined;
				const mime_type = typeof o.mime_type === "string" ? o.mime_type : undefined;
				return { ok: true, reply_text, reply_audio_base64, mime_type, rawJson: data };
			}
			return { ok: true, reply_text: text, rawJson: data };
		}
		if (contentType.startsWith("audio/")) {
			return {
				ok: true,
				mime_type: contentType,
				reply_text: undefined,
				rawJson: { _note: "audio/ response: prefer fetch+arrayBuffer in a thin wrapper" },
			};
		}
		return { ok: true, reply_text: text || undefined, rawJson: { raw: text } };
	} catch (e) {
		const err = e instanceof Error ? e.message : String(e);
		const isAbort = e instanceof Error && e.name === "AbortError";
		if (isAbort) {
			return { ok: false, error: "Aborted" };
		}
		return { ok: false, error: err, offline: true };
	}
}
