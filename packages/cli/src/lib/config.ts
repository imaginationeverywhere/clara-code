import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export interface ClaraConfig {
	gatewayUrl: string;
	userId: string;
	lastProject?: string;
	lastSessionDate?: string;
	sixSideProjectsAsked?: boolean;
}

const CONFIG_PATH = join(homedir(), ".clara", "config.json");

const DEFAULTS: ClaraConfig = {
	gatewayUrl: "",
	userId: "dev",
};

export function loadConfig(): ClaraConfig {
	if (!existsSync(CONFIG_PATH)) {
		return { ...DEFAULTS };
	}
	try {
		const raw = JSON.parse(readFileSync(CONFIG_PATH, "utf-8")) as Partial<ClaraConfig>;
		return { ...DEFAULTS, ...raw };
	} catch {
		return { ...DEFAULTS };
	}
}

export function saveConfig(config: Partial<ClaraConfig>): void {
	const dir = join(homedir(), ".clara");
	if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
	const current = loadConfig();
	writeFileSync(CONFIG_PATH, JSON.stringify({ ...current, ...config }, null, 2));
}

export function isReturnSession(cfg: ClaraConfig): boolean {
	return Boolean(cfg.lastSessionDate || cfg.lastProject);
}
