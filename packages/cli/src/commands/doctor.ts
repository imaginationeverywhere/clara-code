import type { Command } from "commander";
import { resolveBackendUrl } from "../lib/backend.js";
import { pickBearerToken, readClaraCredentials } from "../lib/credentials-store.js";
import { intentDispatchProbeEnabled } from "../lib/feature-flags.js";
import { isIntentGatewayPendingBody, postIntentRun } from "../lib/intent-run.js";
import { formatLastErrorDoctorLines, readLastClaraError } from "../lib/last-error.js";
import { fetchTierStatus } from "../lib/tier-status.js";

export function registerDoctorCommand(program: Command): void {
	program
		.command("doctor")
		.description("Check auth (OS keyring), backend reachability, subscription tier, and local setup")
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
			lines.push(...formatLastErrorDoctorLines(readLastClaraError()));
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
			if (creds) {
				try {
					const tier = await fetchTierStatus();
					lines.push(`ok  tier: ${tier.tier} (GET /api/v1/tier-status)`);
					if (tier.billing_cycle_end) {
						lines.push(`info billing cycle ends: ${tier.billing_cycle_end}`);
					}
				} catch (e) {
					const m = e instanceof Error ? e.message : "unreachable";
					lines.push(`warn tier status: ${m}`);
				}
			}
			if (creds && intentDispatchProbeEnabled()) {
				try {
					const { status, body } = await postIntentRun({ intent: "doctor_probe" });
					if (status === 501 && isIntentGatewayPendingBody(body)) {
						lines.push(
							"info POST /api/v1/run: intent_gateway_pending (Hermes intent dispatch not enabled on this deployment)",
						);
					} else if (status >= 200 && status < 300) {
						lines.push(`ok  POST /api/v1/run returned ${String(status)}`);
					} else {
						const err =
							typeof body === "object" &&
							body !== null &&
							"error" in body &&
							typeof (body as { error?: unknown }).error === "string"
								? (body as { error: string }).error
								: "";
						lines.push(`warn POST /api/v1/run returned ${String(status)}${err.length > 0 ? ` (${err})` : ""}`);
					}
				} catch (e) {
					const m = e instanceof Error ? e.message : "unreachable";
					lines.push(`warn intent dispatch probe: ${m}`);
				}
			}
			for (const line of lines) {
				console.log(line);
			}
		});
}
