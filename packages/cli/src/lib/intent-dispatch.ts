import { resolveClaraGatewayUrl } from "./config-resolved.js";
import { pickBearerToken, readClaraCredentials } from "./credentials-store.js";
import { mapHttpError, NETWORK_FAILURE_MESSAGE } from "./http-errors.js";

export type CliRunContext = {
	cwd: string;
	git_remote?: string;
	active_files: string[];
};

export function buildCliRunContext(): CliRunContext {
	return { cwd: process.cwd(), active_files: [] };
}

function parseJsonObject(text: string): Record<string, unknown> | null {
	try {
		const v: unknown = JSON.parse(text);
		if (v !== null && typeof v === "object" && !Array.isArray(v)) {
			return v as Record<string, unknown>;
		}
	} catch {
		return null;
	}
	return null;
}

/** True when gateway does not implement unified POST /v1/run yet — fall back to legacy per-verb paths. */
export function isUnifiedRunUnavailable(status: number, bodyText: string): boolean {
	if (status === 404 || status === 501) {
		return true;
	}
	const j = parseJsonObject(bodyText);
	if (j?.error === "intent_gateway_pending") {
		return true;
	}
	return false;
}

export type UnifiedRunPayload = {
	reply: string;
	raw: unknown;
};

function extractUnifiedPayload(raw: unknown): UnifiedRunPayload {
	if (raw !== null && typeof raw === "object" && !Array.isArray(raw)) {
		const o = raw as Record<string, unknown>;
		const reply =
			typeof o.reply === "string" ? o.reply : typeof o.text === "string" ? o.text : JSON.stringify(o, null, 2);
		return { reply, raw: o };
	}
	const reply = String(raw);
	return { reply, raw };
}

export type RunIntentUnifiedOverrides = {
	token?: string;
	fetch?: typeof fetch;
	gatewayBase?: string;
};

/**
 * POST `${gateway}/v1/run` with `{ intent, surface, params, context }`.
 * Returns **`null`** when the gateway does not implement unified dispatch — caller should use legacy routes.
 */
export async function tryRunIntentUnified(
	intent: string,
	params: Record<string, unknown>,
	jsonMode: boolean,
	overrides?: RunIntentUnifiedOverrides,
): Promise<UnifiedRunPayload | null> {
	const { value: gateway } = resolveClaraGatewayUrl(overrides?.gatewayBase);
	const fetchImpl = overrides?.fetch ?? globalThis.fetch;
	let bearer: string;
	if (overrides?.token) {
		bearer = overrides.token;
	} else {
		const creds = await readClaraCredentials();
		if (!creds) {
			throw new Error("Not authenticated. Run: clara login");
		}
		bearer = pickBearerToken(creds);
		if (!bearer) {
			throw new Error("Not authenticated. Run: clara login");
		}
	}
	const base = gateway.replace(/\/$/, "");
	const url = `${base}/v1/run`;

	let response: globalThis.Response;
	try {
		response = await fetchImpl(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${bearer}`,
			},
			body: JSON.stringify({
				intent,
				surface: "cli",
				params,
				context: buildCliRunContext(),
			}),
		});
	} catch {
		throw new Error(NETWORK_FAILURE_MESSAGE);
	}

	const text = await response.text().catch(() => "");

	if (!response.ok && isUnifiedRunUnavailable(response.status, text)) {
		return null;
	}

	if (!response.ok) {
		const msg = mapHttpError(response.status, text, "cli").message;
		throw new Error(msg);
	}

	const ct = response.headers.get("content-type") ?? "";
	if (ct.includes("text/event-stream") && text.length > 0) {
		const lines = text.split(/\r?\n/);
		let last = "";
		for (const line of lines) {
			if (line.startsWith("data:")) {
				last = line.slice(5).trim();
			}
		}
		const streamRaw = { stream: true, body: text };
		if (jsonMode) {
			return { reply: last || text, raw: streamRaw };
		}
		return { reply: last || text, raw: streamRaw };
	}

	let raw: unknown;
	try {
		raw = text.length > 0 ? JSON.parse(text) : {};
	} catch {
		if (jsonMode) {
			return { reply: text, raw: { _text: text } };
		}
		return { reply: text, raw: { _text: text } };
	}

	const { reply, raw: parsed } = extractUnifiedPayload(raw);
	return { reply, raw: parsed };
}
