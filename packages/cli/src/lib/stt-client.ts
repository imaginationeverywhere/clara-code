export type SttRequestOptions = {
	backendUrl: string;
	token: string;
	/** Captured audio. May be an empty buffer when running against the dev stub. */
	audio: Buffer;
	mimeType?: string;
	/** Forwarded to the backend as `x-clara-stub-text`; only honored under CLARA_VOICE_DEV_STUB. */
	stubText?: string;
	signal?: AbortSignal;
};

export type SttResult = {
	transcript: string;
	stub: boolean;
};

/**
 * POST audio to the Clara backend's speech-to-text endpoint (`/api/voice/stt`).
 * See `backend/src/routes/voice.ts` — in dev-stub mode the backend returns a mock transcript
 * without requiring real audio, which lets the CLI exercise the whole loop offline.
 */
export async function requestTranscript(opts: SttRequestOptions): Promise<SttResult> {
	const url = `${opts.backendUrl}/api/voice/stt`;
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		Authorization: `Bearer ${opts.token}`,
	};
	if (opts.stubText && opts.stubText.length > 0) {
		headers["x-clara-stub-text"] = opts.stubText;
	}

	const body: Record<string, unknown> = {
		audioBase64: opts.audio.length > 0 ? opts.audio.toString("base64") : "",
		mimeType: opts.mimeType ?? "audio/wav",
	};
	if (opts.stubText && opts.stubText.length > 0) {
		body.stubText = opts.stubText;
	}

	const init: RequestInit = {
		method: "POST",
		headers,
		body: JSON.stringify(body),
	};
	if (opts.signal) init.signal = opts.signal;

	const response = await fetch(url, init);
	const text = await response.text().catch(() => "");
	if (!response.ok) {
		throw new Error(`stt ${response.status}: ${text || response.statusText}`);
	}
	let parsed: unknown;
	try {
		parsed = JSON.parse(text);
	} catch {
		throw new Error(`stt: non-json response (${text.slice(0, 120)})`);
	}
	if (parsed === null || typeof parsed !== "object") {
		throw new Error("stt: response missing transcript");
	}
	const obj = parsed as { transcript?: unknown; stub?: unknown };
	const transcript = typeof obj.transcript === "string" ? obj.transcript : "";
	const stub = obj.stub === true;
	return { transcript, stub };
}
