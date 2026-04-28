import { existsSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import type { Command } from "commander";
import { runAgentDeployUnifiedFirst } from "../lib/agent-deploy.js";
import { resolveBackendUrl } from "../lib/backend.js";
import { pickBearerToken, readClaraCredentials } from "../lib/credentials-store.js";
import { claraHttpErrorMessage } from "../lib/http-errors.js";
import type { UnifiedRunPayload } from "../lib/intent-dispatch.js";
import { formatTierLockMessage } from "../lib/tier-lock.js";

function readAgentName(cwd: string, explicit?: string): string | null {
	if (explicit?.trim()) {
		return explicit.trim();
	}
	try {
		const p = join(cwd, "clara.json");
		if (existsSync(p)) {
			const j = JSON.parse(readFileSync(p, "utf8")) as { name?: string };
			if (typeof j.name === "string" && j.name.trim().length > 0) {
				return j.name.trim();
			}
		}
	} catch {
		// fall through
	}
	const b = basename(cwd);
	if (b && b !== "/") {
		return b;
	}
	return null;
}

function printUnifiedDeploySuccess(payload: UnifiedRunPayload): void {
	const raw = payload.raw;
	if (
		raw !== null &&
		typeof raw === "object" &&
		!Array.isArray(raw) &&
		"stream" in raw &&
		(raw as { stream?: boolean }).stream === true
	) {
		console.log((raw as { body?: string }).body ?? payload.reply);
		return;
	}
	const text = typeof payload.reply === "string" ? payload.reply : JSON.stringify(payload.raw);
	if (text.trim().length > 0) {
		try {
			console.log(JSON.stringify(JSON.parse(text), null, 2));
		} catch {
			console.log(JSON.stringify(payload.raw, null, 2));
		}
		return;
	}
	console.log("Deploy request accepted. Watch your dashboard for build progress.");
}

export function registerDeployCommand(program: Command): void {
	program
		.command("deploy")
		.description("Trigger agent build + deploy via the Clara API (orchestrated on the server)")
		.option("--backend <url>", "Clara API base URL (overrides CLARA_BACKEND_URL and config)")
		.option("--gateway <url>", "Clara gateway base for unified POST /v1/run (overrides CLARA_GATEWAY_URL / config)")
		.option("--name <n>", "Agent name (default: from ./clara.json or current folder name)")
		.action(async (opts: { backend?: string; gateway?: string; name?: string }) => {
			const c = await readClaraCredentials();
			if (!c) {
				console.error("Run `clara login` first.");
				process.exit(1);
			}
			const bearer = pickBearerToken(c);
			if (!bearer) {
				console.error("Run `clara login` first.");
				process.exit(1);
			}
			const cwd = process.cwd();
			const agentName = readAgentName(cwd, opts.name);
			if (!agentName) {
				console.error("Could not determine agent name — use --name or create ./clara.json with a name field.");
				process.exit(1);
			}
			const { url: base } = resolveBackendUrl(opts.backend);
			const deployUrl = `${base}/api/agents/${encodeURIComponent(agentName)}/deploy`;
			try {
				const result = await runAgentDeployUnifiedFirst(agentName, bearer, base, {
					gatewayBase: opts.gateway,
				});
				if (result.kind === "unified") {
					printUnifiedDeploySuccess(result.payload);
					return;
				}
				const r = result.response;
				const text = result.bodyText;
				if (r.status === 403) {
					let j: { reason?: string; upgrade_url?: string; current_tier?: string; required_tier?: string } = {};
					try {
						j = JSON.parse(text) as typeof j;
					} catch {
						// ignore
					}
					if (j.reason === "tier_lock") {
						console.error(formatTierLockMessage(j));
					} else {
						console.error(claraHttpErrorMessage(r.status, text));
					}
					process.exit(1);
				}
				if (r.status === 404) {
					console.error("The deploy API is not available on this server yet, or the agent was not found.");
					console.error(`Tried: POST ${deployUrl}`);
					console.error(`Details: ${claraHttpErrorMessage(r.status, text)}`);
					process.exit(1);
				}
				if (!r.ok) {
					console.error(claraHttpErrorMessage(r.status, text));
					process.exit(1);
				}
				const ct = r.headers.get("content-type") ?? "";
				if (ct.includes("text/event-stream") || text.includes("event:")) {
					console.log(text);
					return;
				}
				if (text.trim().length > 0) {
					try {
						console.log(JSON.stringify(JSON.parse(text), null, 2));
					} catch {
						console.log(text);
					}
					return;
				}
				console.log("Deploy request accepted. Watch your dashboard for build progress.");
			} catch (e) {
				console.error(e instanceof Error ? e.message : String(e));
				process.exit(1);
			}
		});
}
