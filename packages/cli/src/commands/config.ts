import type { Command } from "commander";
import {
	resolveClaraBackendUrlForDisplay,
	resolveClaraBrainUrl,
	resolveClaraGatewayUrl,
	resolveClaraUserId,
} from "../lib/config-resolved.js";
import { type ClaraConfig, patchClaraConfig, readClaraConfig, writeClaraConfig } from "../lib/config-store.js";
import { readClaraCredentials, writeClaraCredentials } from "../lib/credentials-store.js";

const SERVER_CONTROLS = "Server controls inference parameters.";

const INFERENCE_KEYS = new Set(["model", "system_prompt", "temperature", "top_p"]);

function rejectInferenceKey(key: string): void {
	if (INFERENCE_KEYS.has(key)) {
		console.error(SERVER_CONTROLS);
		process.exit(1);
	}
}

function normalizeKey(raw: string): string {
	const k = raw.trim();
	if (k === "api-key") {
		return "apiKey";
	}
	return k;
}

function isAllowedKey(k: string): boolean {
	return k === "gatewayUrl" || k === "brainUrl" || k === "backendUrl" || k === "userId" || k === "apiKey";
}

export function registerConfigCommand(program: Command): void {
	const config = program
		.command("config")
		.description("Read or write ~/.clara/config.json and keyring (gateway, brain, backend, user, api key)");

	config
		.command("get")
		.description("Print the resolved value for a key")
		.argument("<key>", "gatewayUrl | brainUrl | backendUrl | userId | apiKey")
		.action(async (rawKey: string) => {
			const key = normalizeKey(rawKey);
			rejectInferenceKey(key);
			if (!isAllowedKey(key)) {
				console.error(`clara config: unsupported key "${rawKey}"`);
				process.exit(1);
			}
			if (key === "gatewayUrl") {
				console.log(resolveClaraGatewayUrl().value);
				return;
			}
			if (key === "brainUrl") {
				console.log(resolveClaraBrainUrl().value);
				return;
			}
			if (key === "backendUrl") {
				console.log(resolveClaraBackendUrlForDisplay().value);
				return;
			}
			if (key === "userId") {
				console.log(resolveClaraUserId().value);
				return;
			}
			const c = await readClaraCredentials();
			const v = c?.apiKey?.trim() ?? "";
			console.log(v);
		});

	config
		.command("set")
		.description("Set a configuration value (apiKey → OS keyring, not disk)")
		.argument("<key>", "gatewayUrl | brainUrl | backendUrl | userId | apiKey")
		.argument("<value>", "Value")
		.action(async (rawKey: string, value: string) => {
			const key = normalizeKey(rawKey);
			rejectInferenceKey(key);
			if (!isAllowedKey(key)) {
				console.error(`clara config: unsupported key "${rawKey}"`);
				process.exit(1);
			}
			if (key === "apiKey") {
				const existing = await readClaraCredentials();
				const token =
					existing?.token?.trim() && existing.token.trim().length > 0
						? existing.token
						: "__clara_config_api_key_pending__";
				await writeClaraCredentials({ token, apiKey: value });
				console.log("Saved apiKey to OS keyring");
				return;
			}
			if (key === "gatewayUrl") {
				patchClaraConfig({ gatewayUrl: value });
			} else if (key === "brainUrl") {
				patchClaraConfig({ brainUrl: value });
			} else if (key === "backendUrl") {
				patchClaraConfig({ backendUrl: value });
			} else if (key === "userId") {
				patchClaraConfig({ userId: value });
			}
			console.log(`Saved ${key} to ~/.clara/config.json`);
		});

	config
		.command("list")
		.description("List known keys and resolved values (with source: env / config / default / keyring)")
		.action(async () => {
			const gw = resolveClaraGatewayUrl();
			const br = resolveClaraBrainUrl();
			const be = resolveClaraBackendUrlForDisplay();
			const uid = resolveClaraUserId();
			const creds = await readClaraCredentials();
			const hasApiKey = Boolean(creds?.apiKey?.trim());
			const lines: string[] = [
				`gatewayUrl = ${gw.value}  (${gw.source})`,
				`brainUrl     = ${br.value}  (${br.source})`,
				`backendUrl   = ${be.value}  (${be.source})`,
				`userId       = ${uid.value}  (${uid.source})`,
				hasApiKey ? "apiKey       = <set in keyring>  (keyring)" : "apiKey       =  (keyring, not set)",
			];
			console.log(lines.join("\n"));
		});

	config
		.command("unset")
		.description("Remove a file-backed override; apiKey clears the key in keyring (see implementation)")
		.argument("<key>", "gatewayUrl | brainUrl | backendUrl | userId | apiKey")
		.action(async (rawKey: string) => {
			const key = normalizeKey(rawKey);
			rejectInferenceKey(key);
			if (!isAllowedKey(key)) {
				console.error(`clara config: unsupported key "${rawKey}"`);
				process.exit(1);
			}
			if (key === "apiKey") {
				const c = await readClaraCredentials();
				if (c) {
					await writeClaraCredentials({ token: c.token });
					console.log("Removed apiKey from keyring (session token kept)");
				} else {
					console.log("apiKey not set");
				}
				return;
			}
			const full = readClaraConfig();
			if (key === "gatewayUrl") {
				const next: ClaraConfig = { ...full };
				delete next.gatewayUrl;
				writeClaraConfig(next);
			} else if (key === "brainUrl") {
				const next: ClaraConfig = { ...full };
				delete next.brainUrl;
				writeClaraConfig(next);
			} else if (key === "backendUrl") {
				const next: ClaraConfig = { ...full };
				delete next.backendUrl;
				writeClaraConfig(next);
			} else if (key === "userId") {
				const next: ClaraConfig = { ...full };
				delete next.userId;
				writeClaraConfig(next);
			}
			console.log(`Unset ${key} in ~/.clara/config.json`);
		});
}
