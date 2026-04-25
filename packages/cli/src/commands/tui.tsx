import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import { render } from "ink";
import React from "react";
import { App } from "../tui.js";
import { resolveBackendUrl, voiceDevStubEnabled } from "../lib/backend.js";
import { patchClaraConfig, readClaraConfig } from "../lib/config-store.js";
import { readClaraCredentials } from "../lib/credentials-store.js";

const CLARA_GATEWAY_DEFAULT = "https://api.claracode.ai/api";

function resolveGatewayUrl(opts: { gateway?: string }): string {
	const fromOpt = opts.gateway?.trim();
	if (fromOpt) {
		return fromOpt;
	}
	const fromEnv = process.env.CLARA_GATEWAY_URL?.trim();
	if (fromEnv) {
		return fromEnv;
	}
	return readClaraConfig().gatewayUrl?.trim() || CLARA_GATEWAY_DEFAULT;
}

export type LaunchTuiOptions = {
	user?: string;
	gateway?: string;
	backend?: string;
	/** Commander sets this to `false` when `--no-voice` is passed; default (audio on) is `undefined`. */
	voice?: boolean;
};

export function launchTui(opts: LaunchTuiOptions): void {
	const cfg = readClaraConfig();
	const userId = opts.user ?? cfg.userId ?? "dev";
	const voiceOn = opts.voice !== false;
	// Gateway URL may be empty on first run — the TUI still launches so the user can paste a token
	// via the first-run prompt; gateway calls surface their own "not configured" error if missing.
	const gatewayUrl = resolveGatewayUrl(opts);
	const backend = resolveBackendUrl(opts.backend);
	patchClaraConfig({
		userId,
		backendUrl: backend.url,
		...(gatewayUrl ? { gatewayUrl } : {}),
	});

	const creds = readClaraCredentials();
	const initialToken = creds?.token ?? null;

	const __dirname = dirname(fileURLToPath(import.meta.url));
	const pkgPath = join(__dirname, "..", "..", "package.json");
	const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { version: string };

	render(
		<App
			userId={userId}
			gatewayUrl={gatewayUrl}
			backendUrl={backend.url}
			version={pkg.version}
			voiceAudioEnabled={voiceOn}
			initialToken={initialToken}
			devStubMode={voiceDevStubEnabled()}
		/>,
	);
}

export function registerTuiCommand(program: Command): void {
	program
		.command("tui")
		.description("Launch full-screen Clara Code TUI (Ink)")
		.option("-u, --user <name>", "User id sent to gateway")
		.option("-g, --gateway <url>", "Clara gateway URL (default: CLARA_GATEWAY_URL or ~/.clara/config.json)")
		.option(
			"-b, --backend <url>",
			"Clara backend URL hosting /api/voice/stt and /api/voice/tts (default: CLARA_BACKEND_URL or https://api.claracode.ai)",
		)
		.option("--no-voice", "Disable audio playback (text-only mode)")
		.action((opts: LaunchTuiOptions) => {
			launchTui(opts);
		});
}
