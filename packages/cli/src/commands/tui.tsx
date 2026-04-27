import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import { render } from "ink";
import React from "react";
import { App } from "../tui.js";
import { resolveBackendUrl, voiceDevStubEnabled } from "../lib/backend.js";
import { resolveClaraGatewayUrl } from "../lib/config-resolved.js";
import { patchClaraConfig, readClaraConfig } from "../lib/config-store.js";
import { pickBearerToken, readClaraCredentials } from "../lib/credentials-store.js";
import { DEFAULT_GATEWAY_URL } from "../lib/gateway.js";

function resolveGatewayUrl(opts: { gateway?: string }): string {
	return resolveClaraGatewayUrl(opts.gateway).value;
}

export type LaunchTuiOptions = {
	user?: string;
	gateway?: string;
	backend?: string;
	/** Commander sets this to `false` when `--no-voice` is passed; default (audio on) is `undefined`. */
	voice?: boolean;
};

export async function launchTui(opts: LaunchTuiOptions): Promise<void> {
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

	const creds = await readClaraCredentials();
	const initialToken = creds ? pickBearerToken(creds) : null;

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

function registerTuiOrChat(program: Command, cmd: "tui" | "chat"): void {
	const desc =
		cmd === "tui"
			? "Launch full-screen Clara Code TUI (Ink)"
			: "Streaming TUI chat against the gateway (same experience as clara tui; preferred name)";
	program
		.command(cmd)
		.description(desc)
		.option("-u, --user <name>", "User id sent to gateway")
		.option(
			"-g, --gateway <url>",
			`Clara gateway URL (default: CLARA_GATEWAY_URL, ~/.clara/config.json, then ${DEFAULT_GATEWAY_URL})`,
		)
		.option(
			"-b, --backend <url>",
			"Clara backend URL hosting /api/voice/stt and /api/voice/tts (default: CLARA_BACKEND_URL or https://api.claracode.ai)",
		)
		.option("--no-voice", "Disable audio playback (text-only mode)")
		.action((opts: LaunchTuiOptions) => {
			void launchTui(opts).catch((e: unknown) => {
				console.error(e instanceof Error ? e.message : e);
				process.exit(1);
			});
		});
}

export function registerTuiCommand(program: Command): void {
	registerTuiOrChat(program, "tui");
}

/** Canonical `clara chat` entry (prompt 10); identical to `clara tui`. */
export function registerChatCommand(program: Command): void {
	registerTuiOrChat(program, "chat");
}
