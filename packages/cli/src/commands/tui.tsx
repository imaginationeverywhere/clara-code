import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import { render } from "ink";
import React from "react";
import { App } from "../tui.js";
import { patchClaraConfig, readClaraConfig } from "../lib/config-store.js";

function resolveGatewayUrl(opts: { gateway?: string }): string {
	const fromOpt = opts.gateway?.trim();
	if (fromOpt) return fromOpt;
	const fromEnv = process.env.HERMES_GATEWAY_URL?.trim();
	if (fromEnv) return fromEnv;
	return readClaraConfig().gatewayUrl?.trim() ?? "";
}

export function registerTuiCommand(program: Command): void {
	program
		.command("tui")
		.description("Launch full-screen Clara Code TUI (Ink)")
		.option("-u, --user <name>", "User id sent to gateway")
		.option("-g, --gateway <url>", "Clara gateway URL (default: HERMES_GATEWAY_URL or ~/.clara/config.json)")
		.option("--voice", "Opt in to audio when the gateway supports it (placeholder)", false)
		.action((opts: { user?: string; gateway?: string; voice?: boolean }) => {
			const cfg = readClaraConfig();
			const userId = opts.user ?? cfg.userId ?? "dev";
			const gatewayUrl = resolveGatewayUrl(opts);
			if (!gatewayUrl) {
				console.error(
					"clara tui: set HERMES_GATEWAY_URL, add gatewayUrl to ~/.clara/config.json, or pass --gateway <url>",
				);
				process.exitCode = 1;
				return;
			}
			patchClaraConfig({ userId, gatewayUrl });

			const __dirname = dirname(fileURLToPath(import.meta.url));
			const pkgPath = join(__dirname, "..", "..", "package.json");
			const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { version: string };

			render(
				<App
					userId={userId}
					gatewayUrl={gatewayUrl}
					version={pkg.version}
					voiceAudioEnabled={opts.voice === true}
				/>,
			);
		});
}
