import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { CLARA_LAST_ERROR_FILE } from "./paths.js";

export type LastErrorRecord = {
	command?: string;
	message?: string;
	at?: string;
	summary?: string;
};

/** Persist for **`clara doctor`** replay. Default path `~/.clara/last-error.json`. */
export function writeLastClaraError(rec: LastErrorRecord, path: string = CLARA_LAST_ERROR_FILE): void {
	const dir = dirname(path);
	mkdirSync(dir, { recursive: true });
	const payload: LastErrorRecord = {
		...rec,
		at: rec.at ?? new Date().toISOString(),
	};
	writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

export function readLastClaraError(path: string = CLARA_LAST_ERROR_FILE): LastErrorRecord | null {
	try {
		const raw = readFileSync(path, "utf8");
		const parsed: unknown = JSON.parse(raw);
		if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
			return parsed as LastErrorRecord;
		}
	} catch {
		// missing or invalid
	}
	return null;
}

/** Plain lines for `clara doctor` when `last-error.json` exists and is readable. */
export function formatLastErrorDoctorLines(rec: LastErrorRecord | null): string[] {
	if (!rec) {
		return [];
	}
	const bits: string[] = [];
	if (typeof rec.command === "string" && rec.command.trim().length > 0) {
		bits.push(`command ${rec.command.trim()}`);
	}
	const msg =
		typeof rec.message === "string" && rec.message.trim().length > 0
			? rec.message.trim()
			: typeof rec.summary === "string"
				? rec.summary.trim()
				: "";
	if (msg.length > 0) {
		bits.push(msg);
	}
	if (typeof rec.at === "string" && rec.at.trim().length > 0) {
		bits.push(`at ${rec.at.trim()}`);
	}
	if (bits.length === 0) {
		return [];
	}
	return [
		"info last error (~/.clara/last-error.json):",
		`info   ${bits.join(" — ")}`,
		"info   fix or clear the file, then retry the command",
	];
}
