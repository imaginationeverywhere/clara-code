import { readFileSync } from "node:fs";
import { resolveClaraGatewayUrl } from "./config-resolved.js";
import { pickBearerToken, readClaraCredentials } from "./credentials-store.js";
import { mapHttpError, NETWORK_FAILURE_MESSAGE } from "./http-errors.js";
import { tryRunIntentUnified } from "./intent-dispatch.js";

/**
 * Read `@path` or inline text.
 */
export function readCognitiveTextArg(arg: string): { text: string; isFile: boolean } {
	const t = arg.trim();
	if (t.startsWith("@")) {
		const path = t.slice(1).trim();
		const text = readFileSync(path, "utf8");
		return { text, isFile: true };
	}
	return { text: t, isFile: false };
}

export type CognitiveRunResult = { reply: string; raw: unknown; json: boolean };

export type RunCognitiveOverrides = {
	/** When set, skip keyring and use this bearer token. */
	token?: string;
	/** Injected fetch (tests). */
	fetch?: typeof fetch;
	/** Gateway base URL override (tests); passed to `resolveClaraGatewayUrl`. */
	gatewayBase?: string;
};

/**
 * Legacy: POST `${gateway}/v1/<verb>` with JSON body (`surface: "cli"` merged in).
 */
async function runCognitiveLegacy(
	verb: string,
	body: Record<string, unknown>,
	jsonMode: boolean,
	overrides?: RunCognitiveOverrides,
): Promise<CognitiveRunResult> {
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
	const url = `${base}/v1/${verb}`;

	let response: globalThis.Response;
	try {
		response = await fetchImpl(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${bearer}`,
			},
			body: JSON.stringify({ ...body, surface: "cli" }),
		});
	} catch {
		throw new Error(NETWORK_FAILURE_MESSAGE);
	}
	const text = await response.text().catch(() => "");
	const ct = response.headers.get("content-type") ?? "";

	if (ct.includes("text/event-stream") && text.length > 0) {
		const lines = text.split(/\r?\n/);
		let last = "";
		for (const line of lines) {
			if (line.startsWith("data:")) {
				last = line.slice(5).trim();
			}
		}
		if (jsonMode) {
			return { reply: last || text, raw: { stream: true, body: text }, json: true };
		}
		return { reply: last || text, raw: { stream: true, body: text }, json: false };
	}

	if (!response.ok) {
		const msg = mapHttpError(response.status, text, "cli").message;
		throw new Error(msg);
	}

	let raw: unknown;
	try {
		raw = text.length > 0 ? JSON.parse(text) : {};
	} catch {
		if (jsonMode) {
			return { reply: text, raw: { _text: text }, json: true };
		}
		return { reply: text, raw: { _text: text }, json: false };
	}
	if (raw !== null && typeof raw === "object" && !Array.isArray(raw)) {
		const o = raw as Record<string, unknown>;
		const reply =
			typeof o.reply === "string" ? o.reply : typeof o.text === "string" ? o.text : JSON.stringify(o, null, 2);
		return { reply, raw: o, json: jsonMode };
	}
	const reply = String(raw);
	return { reply, raw, json: jsonMode };
}

/**
 * Tries **`POST /v1/run`** (unified intent dispatch), then falls back to **`POST /v1/&lt;verb&gt;`** when the gateway does not implement unified dispatch yet.
 */
export async function runCognitive(
	verb: string,
	body: Record<string, unknown>,
	jsonMode: boolean,
	overrides?: RunCognitiveOverrides,
): Promise<CognitiveRunResult> {
	const unified = await tryRunIntentUnified(verb, body, jsonMode, overrides);
	if (unified !== null) {
		return { reply: unified.reply, raw: unified.raw, json: jsonMode };
	}
	return runCognitiveLegacy(verb, body, jsonMode, overrides);
}
