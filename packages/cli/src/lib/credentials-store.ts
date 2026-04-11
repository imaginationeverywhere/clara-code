import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { CLARA_CONFIG_DIR, CLARA_CREDENTIALS_FILE } from "./paths.js";

export type ClaraCredentials = {
	token: string;
};

export function readClaraCredentials(): ClaraCredentials | null {
	try {
		const raw = readFileSync(CLARA_CREDENTIALS_FILE, "utf8");
		const parsed: unknown = JSON.parse(raw);
		if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
			const obj = parsed as Record<string, unknown>;
			const token = obj.token;
			if (typeof token === "string" && token.length > 0) {
				return { token };
			}
		}
	} catch {
		// missing or invalid file
	}
	return null;
}

export function writeClaraCredentials(creds: ClaraCredentials): void {
	mkdirSync(CLARA_CONFIG_DIR, { recursive: true });
	writeFileSync(CLARA_CREDENTIALS_FILE, `${JSON.stringify(creds, null, 2)}\n`, "utf8");
}
