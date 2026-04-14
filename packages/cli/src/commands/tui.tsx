import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import { render } from "ink";
import React from "react";
import { App } from "../tui.js";
import { patchClaraConfig, readClaraConfig } from "../lib/config-store.js";

const DEFAULT_GATEWAY = "https://info-24346--hermes-gateway.modal.run";

export function registerTuiCommand(program: Command): void {
	program
		.command("tui")
		.description("Launch full-screen Clara Code TUI (Ink)")
		.option("-u, --user <name>", "User id sent to gateway")
		.option("-g, --gateway <url>", "Clara gateway URL (default: from config or Hermes Modal URL)")
		.option("--voice", "Opt in to audio when the gateway supports it (placeholder)", false)
		.action((opts: { user?: string; gateway?: string; voice?: boolean }) => {
			const cfg = readClaraConfig();
			const userId = opts.user ?? cfg.userId ?? "dev";
			const gatewayUrl = opts.gateway ?? cfg.gatewayUrl ?? DEFAULT_GATEWAY;
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
