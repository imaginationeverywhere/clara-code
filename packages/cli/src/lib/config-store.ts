import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { CLARA_CONFIG_DIR, CLARA_CONFIG_FILE } from "./paths.js";

export type ClaraConfig = {
	apiKey?: string;
	gatewayUrl?: string;
	/** Optional override; default `https://brain-api.claracode.ai`. See `lib/config-resolved.ts`. */
	brainUrl?: string;
	/** Clara backend base URL hosting /api/voice/{stt,tts}. See lib/backend.ts for resolution. */
	backendUrl?: string;
	userId?: string;
	lastProject?: string;
	lastSessionDate?: string;
	/** Set after at least one completed Clara TUI session */
	hasPriorSession?: boolean;
	sixSideProjectsAsked?: boolean;
};

export function readClaraConfig(): ClaraConfig {
	/** Unit tests only: bypass disk so resolution is deterministic on developer machines. */
	const injected = process.env.CLARA_TEST_CONFIG_JSON;
	if (injected !== undefined) {
		try {
			const parsed: unknown = JSON.parse(injected);
			if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
				return parsed as ClaraConfig;
			}
		} catch {
			// invalid JSON -> empty
		}
		return {};
	}
	try {
		const raw = readFileSync(CLARA_CONFIG_FILE, "utf8");
		const parsed: unknown = JSON.parse(raw);
		if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
			return parsed as ClaraConfig;
		}
	} catch {
		// missing or invalid file
	}
	return {};
}

export function writeClaraConfig(config: ClaraConfig): void {
	mkdirSync(CLARA_CONFIG_DIR, { recursive: true });
	// Never persist API keys to disk — keyring only (prompt 11 / strategy briefing).
	const { apiKey: _drop, ...rest } = config;
	writeFileSync(CLARA_CONFIG_FILE, `${JSON.stringify(rest, null, 2)}\n`, "utf8");
}

export function patchClaraConfig(patch: Partial<ClaraConfig>): void {
	writeClaraConfig({ ...readClaraConfig(), ...patch });
}
