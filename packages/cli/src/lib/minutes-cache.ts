import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { CLARA_CONFIG_DIR } from "./paths.js";

const FILE = join(CLARA_CONFIG_DIR, "minutes-cache.json");

export type MinutesCache = { minutesRemaining: number; updatedAt: string };

export function readMinutesCache(): MinutesCache | null {
	try {
		const raw = readFileSync(FILE, "utf8");
		const p: unknown = JSON.parse(raw);
		if (p === null || typeof p !== "object" || Array.isArray(p)) {
			return null;
		}
		const o = p as Record<string, unknown>;
		const m = o.minutesRemaining;
		if (typeof m !== "number" || !Number.isFinite(m)) {
			return null;
		}
		const u = o.updatedAt;
		return { minutesRemaining: m, updatedAt: typeof u === "string" ? u : new Date().toISOString() };
	} catch {
		return null;
	}
}

export function writeMinutesCache(value: number): void {
	mkdirSync(CLARA_CONFIG_DIR, { recursive: true });
	const payload: MinutesCache = { minutesRemaining: value, updatedAt: new Date().toISOString() };
	writeFileSync(FILE, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}
