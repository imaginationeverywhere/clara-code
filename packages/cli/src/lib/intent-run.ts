import { resolveBackendUrl } from "./backend.js";
import { pickBearerToken, readClaraCredentials } from "./credentials-store.js";

/** Backend body when dispatch is not deployed (POST /api/v1/run stub). */
export function isIntentGatewayPendingBody(body: unknown): boolean {
	return (
		typeof body === "object" &&
		body !== null &&
		"error" in body &&
		(body as { error?: string }).error === "intent_gateway_pending"
	);
}

/**
 * Authenticated Clara backend: intent dispatch. Often returns 501 until the gateway is wired.
 */
export async function postIntentRun(
	body: Record<string, unknown>,
	overrides?: {
		backendFlag?: string;
		fetch?: typeof fetch;
		signal?: AbortSignal;
		/** Skip keyring (unit tests only). */
		bearerToken?: string;
	},
): Promise<{ status: number; body: unknown }> {
	const { url } = resolveBackendUrl(overrides?.backendFlag);
	let bearer: string;
	if (overrides?.bearerToken !== undefined) {
		bearer = overrides.bearerToken;
	} else {
		const c = await readClaraCredentials();
		if (!c) {
			throw new Error("not_authenticated");
		}
		bearer = pickBearerToken(c);
		if (bearer.length === 0) {
			throw new Error("not_authenticated");
		}
	}
	const fetchFn = overrides?.fetch ?? globalThis.fetch;
	const r = await fetchFn(`${url}/api/v1/run`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${bearer}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
		signal: overrides?.signal ?? AbortSignal.timeout(8_000),
	});
	const text = await r.text();
	let parsed: unknown;
	try {
		parsed = JSON.parse(text) as unknown;
	} catch {
		parsed = text;
	}
	return { status: r.status, body: parsed };
}
