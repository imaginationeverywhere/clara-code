import type { Command } from "commander";
import { readClaraConfig } from "../lib/config-store.js";
import { readClaraCredentials } from "../lib/credentials-store.js";
import { DEFAULT_GATEWAY_URL } from "../lib/gateway.js";

const DEFAULT_BRAIN_URL = "https://brain-api.claracode.ai";
const DEFAULT_BACKEND_URL = "https://api.claracode.ai";
const PROBE_TIMEOUT_MS = 5000;

type ProbeStatus = "ok" | "degraded" | "unreachable";

type ProbeResult = {
	url: string;
	status: ProbeStatus;
	detail: string;
};

function statusGlyph(status: ProbeStatus): string {
	switch (status) {
		case "ok":
			return "✓";
		case "degraded":
			return "~";
		default:
			return "✗";
	}
}

async function probe(url: string): Promise<ProbeResult> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
	try {
		const response = await fetch(url, { method: "GET", signal: controller.signal });
		if (response.ok) {
			return { url, status: "ok", detail: `HTTP ${response.status}` };
		}
		return { url, status: "degraded", detail: `HTTP ${response.status} ${response.statusText || ""}`.trim() };
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		return { url, status: "unreachable", detail: message };
	} finally {
		clearTimeout(timer);
	}
}

export function registerDoctorCommand(program: Command): void {
	program
		.command("doctor")
		.description("Run a diagnostic on Clara connectivity and configuration")
		.action(async () => {
			const config = readClaraConfig();
			const creds = readClaraCredentials();

			const gatewayUrl = config.gatewayUrl?.trim() || process.env.CLARA_GATEWAY_URL?.trim() || DEFAULT_GATEWAY_URL;
			const brainUrl = process.env.CLARA_BRAIN_URL?.trim() || DEFAULT_BRAIN_URL;
			const backendUrl = config.backendUrl?.trim() || process.env.CLARA_BACKEND_URL?.trim() || DEFAULT_BACKEND_URL;

			console.log("Clara doctor — checking surfaces");
			console.log("");

			const [gateway, brain, backend] = await Promise.all([
				probe(gatewayUrl),
				probe(`${brainUrl}/health`),
				probe(`${backendUrl}/health`),
			]);

			console.log(`  ${statusGlyph(gateway.status)} gateway     ${gatewayUrl}`);
			console.log(`      ${gateway.detail}`);
			if (gateway.status !== "ok") {
				console.log(`      Clara gateway is coming online — set CLARA_GATEWAY_URL to override.`);
			}
			console.log("");

			console.log(`  ${statusGlyph(brain.status)} brain       ${brainUrl}`);
			console.log(`      ${brain.detail}`);
			console.log("");

			console.log(`  ${statusGlyph(backend.status)} backend     ${backendUrl}`);
			console.log(`      ${backend.detail}`);
			console.log("");

			const authPresent = Boolean(creds?.token);
			console.log(`  ${authPresent ? "✓" : "✗"} auth        ~/.clara/credentials.json`);
			console.log(`      ${authPresent ? "Token saved." : "Not signed in. Run `clara auth login`."}`);
			console.log("");

			console.log("Tier and minute pool — reported by the gateway once middleware ships.");

			const allOk = gateway.status === "ok" && brain.status === "ok" && backend.status === "ok" && authPresent;
			if (!allOk) {
				process.exitCode = 1;
			}
		});
}
