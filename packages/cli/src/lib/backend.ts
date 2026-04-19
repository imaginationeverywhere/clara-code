import { readClaraConfig } from "./config-store.js";

const DEFAULT_BACKEND_URL = "https://api.claracode.ai";

export type BackendResolution = {
	url: string;
	source: "flag" | "env" | "config" | "default";
};

/**
 * Resolve the Clara backend base URL (hosts /api/voice/stt and /api/voice/tts).
 *
 * Priority: --backend flag → CLARA_BACKEND_URL env → ~/.clara/config.json.backendUrl → default.
 */
export function resolveBackendUrl(flag?: string): BackendResolution {
	const fromFlag = flag?.trim();
	if (fromFlag) return { url: stripTrailingSlash(fromFlag), source: "flag" };

	const fromEnv = process.env.CLARA_BACKEND_URL?.trim();
	if (fromEnv) return { url: stripTrailingSlash(fromEnv), source: "env" };

	const cfg = readClaraConfig();
	const fromConfig = cfg.backendUrl?.trim();
	if (fromConfig) return { url: stripTrailingSlash(fromConfig), source: "config" };

	return { url: DEFAULT_BACKEND_URL, source: "default" };
}

export function voiceDevStubEnabled(): boolean {
	const v = process.env.CLARA_VOICE_DEV_STUB;
	return v === "1" || v === "true";
}

function stripTrailingSlash(url: string): string {
	return url.endsWith("/") ? url.slice(0, -1) : url;
}
