import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

export type SessionLogger = {
	readonly path: string;
	log(role: "user" | "assistant" | "system", text: string): void;
};

/**
 * Append-only session transcript under `<cwd>/.clara/session-YYYY-MM-DD.log`.
 *
 * This is *project-local* on purpose so a user can drop into a repo, run `clara`, and leave
 * a checkable breadcrumb trail next to the code they touched. Global user history lives in
 * `~/.clara/` and is handled elsewhere.
 */
export function createSessionLogger(cwd: string = process.cwd(), now: Date = new Date()): SessionLogger {
	const dir = join(cwd, ".clara");
	mkdirSync(dir, { recursive: true });
	const filename = `session-${formatDate(now)}.log`;
	const fullPath = join(dir, filename);

	appendFileSync(fullPath, `\n--- session start ${now.toISOString()} ---\n`, "utf8");

	return {
		path: fullPath,
		log(role, text) {
			const line = `[${formatTime(new Date())}] ${role}: ${sanitize(text)}\n`;
			try {
				appendFileSync(fullPath, line, "utf8");
			} catch {
				// Never crash the TUI on a failed log write.
			}
		},
	};
}

function pad2(n: number): string {
	return n < 10 ? `0${n}` : `${n}`;
}

function formatDate(d: Date): string {
	return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function formatTime(d: Date): string {
	return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

function sanitize(text: string): string {
	return text.replace(/\r?\n/g, "\\n");
}
