import { existsSync, readFileSync, unlinkSync } from "node:fs";
import { CLARA_CREDENTIALS_FILE } from "./paths.js";

const KEYTAR_SERVICE = "clara-code";
const KEYTAR_ACCOUNT = "default";

export type ClaraCredentials = {
	/** Primary session credential (e.g. Clerk JWT). */
	token: string;
	/** Clara API key (cc_live_* or sk-clara-*) when issued alongside the session. */
	apiKey?: string;
};

/** Prefer API key for Bearer when it looks like a generated key; otherwise the session token. */
export function pickBearerToken(c: ClaraCredentials): string {
	const k = c.apiKey?.trim();
	if (k && (k.startsWith("cc_live_") || k.startsWith("sk-clara-"))) {
		return k;
	}
	const t = c.token?.trim();
	if (t) {
		return t;
	}
	return k ?? "";
}

async function loadKeytar() {
	return import("keytar");
}

/**
 * Read credentials: OS keyring (Keychain / Credential Manager / libsecret) first, then
 * one-time migration from legacy ~/.clara/credentials.json.
 */
export async function readClaraCredentials(): Promise<ClaraCredentials | null> {
	const keytar = await loadKeytar();
	const fromRing = await keytar.getPassword(KEYTAR_SERVICE, KEYTAR_ACCOUNT);
	if (fromRing) {
		try {
			const p = JSON.parse(fromRing) as { token?: unknown; apiKey?: unknown };
			const token = typeof p.token === "string" ? p.token : "";
			if (token.length > 0) {
				const apiKey = typeof p.apiKey === "string" && p.apiKey.length > 0 ? p.apiKey : undefined;
				return { token, ...(apiKey ? { apiKey } : {}) };
			}
		} catch {
			// fall through
		}
	}

	if (existsSync(CLARA_CREDENTIALS_FILE)) {
		try {
			const raw = readFileSync(CLARA_CREDENTIALS_FILE, "utf8");
			const parsed: unknown = JSON.parse(raw);
			if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
				const obj = parsed as Record<string, unknown>;
				const token = obj.token;
				if (typeof token === "string" && token.length > 0) {
					const c: ClaraCredentials = { token };
					await writeClaraCredentials(c);
					try {
						unlinkSync(CLARA_CREDENTIALS_FILE);
					} catch {
						// best-effort
					}
					return c;
				}
			}
		} catch {
			// fall through
		}
	}

	return null;
}

/**
 * Store credentials in the OS keyring. Removes legacy plain JSON credentials file.
 */
export async function writeClaraCredentials(c: ClaraCredentials): Promise<void> {
	if (!c.token.trim()) {
		throw new Error("refusing to store empty token");
	}
	const keytar = await loadKeytar();
	const password = JSON.stringify({ token: c.token, apiKey: c.apiKey });
	await keytar.setPassword(KEYTAR_SERVICE, KEYTAR_ACCOUNT, password);
	if (existsSync(CLARA_CREDENTIALS_FILE)) {
		try {
			unlinkSync(CLARA_CREDENTIALS_FILE);
		} catch {
			// best-effort
		}
	}
}

export async function deleteClaraCredentials(): Promise<boolean> {
	const keytar = await loadKeytar();
	if (existsSync(CLARA_CREDENTIALS_FILE)) {
		try {
			unlinkSync(CLARA_CREDENTIALS_FILE);
		} catch {
			// best-effort
		}
	}
	return (await keytar.deletePassword(KEYTAR_SERVICE, KEYTAR_ACCOUNT)) || false;
}
