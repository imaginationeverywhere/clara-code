import { resolveBackendUrl } from "./backend.js";
import { pickBearerToken, readClaraCredentials } from "./credentials-store.js";

export type TierStatusResponse = {
	tier: string;
	minutes_remaining: number | null;
	billing_cycle_end: string | null;
};

/**
 * Authenticated Clara backend: subscription tier and billing window (platform contract).
 */
export async function fetchTierStatus(overrides?: {
	backendFlag?: string;
	fetch?: typeof fetch;
	signal?: AbortSignal;
	/** Skip keyring (unit tests only). */
	bearerToken?: string;
}): Promise<TierStatusResponse> {
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
	const r = await fetchFn(`${url}/api/v1/tier-status`, {
		headers: { Authorization: `Bearer ${bearer}` },
		signal: overrides?.signal ?? AbortSignal.timeout(8_000),
	});
	const text = await r.text();
	if (!r.ok) {
		throw new Error(`${String(r.status)} ${text.slice(0, 160)}`);
	}
	return JSON.parse(text) as TierStatusResponse;
}
