import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { CLARA_CONFIG_DIR, CLARA_CONFIG_FILE } from "./paths.js";

export type ClaraConfig = {
	apiKey?: string;
	gatewayUrl?: string;
	userId?: string;
	lastProject?: string;
	lastSessionDate?: string;
	/** Set after at least one completed Clara TUI session */
	hasPriorSession?: boolean;
	sixSideProjectsAsked?: boolean;
};

export function readClaraConfig(): ClaraConfig {
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
	writeFileSync(CLARA_CONFIG_FILE, `${JSON.stringify(config, null, 2)}\n`, "utf8");
}

export function patchClaraConfig(patch: Partial<ClaraConfig>): void {
	writeClaraConfig({ ...readClaraConfig(), ...patch });
}
