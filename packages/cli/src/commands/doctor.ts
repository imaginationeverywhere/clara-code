import type { Command } from "commander";
import { resolveBackendUrl } from "../lib/backend.js";
import { pickBearerToken, readClaraCredentials } from "../lib/credentials-store.js";

export function registerDoctorCommand(program: Command): void {
	program
		.command("doctor")
		.description("Check auth (OS keyring), backend reachability, and local setup")
		.action(async () => {
			const lines: string[] = [];
			try {
				await import("keytar");
				lines.push("ok  keyring module loadable");
			} catch {
				lines.push("err  could not load OS keyring (keytar). Reinstall the CLI on this platform.");
			}
			const creds = await readClaraCredentials();
			if (creds) {
				const bearer = pickBearerToken(creds);
				lines.push(`ok  credentials in OS keyring (token length ${String(bearer.length)} chars, not shown)`);
			} else {
				lines.push("warn no credentials in keyring — run `clara login`");
			}
			const { url, source } = resolveBackendUrl();
			lines.push(`info backend ${url} (source: ${source})`);
			try {
				const r = await fetch(`${url}/health`, {
					signal: AbortSignal.timeout(8_000),
				});
				if (r.ok) {
					lines.push("ok  GET /health reachable");
				} else {
					lines.push(`warn GET /health returned ${String(r.status)}`);
				}
			} catch (e) {
				const m = e instanceof Error ? e.message : "unreachable";
				lines.push(`warn backend health: ${m}`);
			}
			for (const line of lines) {
				console.log(line);
			}
		});
}
