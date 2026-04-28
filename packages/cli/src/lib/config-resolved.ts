import { resolveBackendUrl } from "./backend.js";
import { readClaraConfig } from "./config-store.js";
import { DEFAULT_GATEWAY_URL } from "./gateway.js";

export type ConfigValueSource = "env" | "config" | "default" | "flag";

const DEFAULT_BRAIN_URL = "https://brain-api.claracode.ai";

function stripTrailingSlash(url: string): string {
	return url.endsWith("/") ? url.slice(0, -1) : url;
}

/** Rejects empty / slash-only values so `gatewayUrl: "/"` does not yield `""` after stripping. */
function normalizeGatewayUrlInput(raw: string | undefined): string | undefined {
	if (raw === undefined) {
		return undefined;
	}
	const t = raw.trim();
	if (t.length === 0) {
		return undefined;
	}
	const v = stripTrailingSlash(t);
	return v.length > 0 ? v : undefined;
}

/**
 * Gateway URL: `CLARA_GATEWAY_URL` → `~/.clara/config.json` `gatewayUrl` → public default (Hermes).
 * Aligns with `DEFAULT_GATEWAY_URL` in `gateway.ts` (not the legacy TUI-only `/api` default).
 */
export function resolveClaraGatewayUrl(override?: string): { value: string; source: ConfigValueSource } {
	const fromFlag = normalizeGatewayUrlInput(override);
	if (fromFlag) {
		return { value: fromFlag, source: "flag" };
	}
	const fromEnv = normalizeGatewayUrlInput(process.env.CLARA_GATEWAY_URL);
	if (fromEnv) {
		return { value: fromEnv, source: "env" };
	}
	const fromCfg = normalizeGatewayUrlInput(readClaraConfig().gatewayUrl);
	if (fromCfg) {
		return { value: fromCfg, source: "config" };
	}
	return { value: DEFAULT_GATEWAY_URL, source: "default" };
}

/**
 * Brain API base: `CLARA_BRAIN_URL` → `~/.clara/config.json` `brainUrl` → public default.
 */
export function resolveClaraBrainUrl(): { value: string; source: ConfigValueSource } {
	const fromEnv = process.env.CLARA_BRAIN_URL?.trim();
	if (fromEnv) {
		return { value: stripTrailingSlash(fromEnv), source: "env" };
	}
	const fromCfg = readClaraConfig().brainUrl?.trim();
	if (fromCfg) {
		return { value: stripTrailingSlash(fromCfg), source: "config" };
	}
	return { value: DEFAULT_BRAIN_URL, source: "default" };
}

/**
 * Re-export backend resolution for `clara config` list/get (same rules as `resolveBackendUrl()`).
 */
export function resolveClaraBackendUrlForDisplay(): { value: string; source: ConfigValueSource } {
	const r = resolveBackendUrl();
	return { value: r.url, source: r.source === "flag" ? "config" : r.source };
}

export function resolveClaraUserId(): { value: string; source: "config" | "default" } {
	const v = readClaraConfig().userId?.trim();
	if (v) {
		return { value: v, source: "config" };
	}
	return { value: "dev", source: "default" };
}
