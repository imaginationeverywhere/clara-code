#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import { registerAskCommand } from "./commands/ask.js";
import { registerAuthCommand } from "./commands/auth.js";
import { registerConfigCommand } from "./commands/config.js";
import { registerGreetCommand } from "./commands/greet.js";
import { registerHelloCommand } from "./commands/hello.js";
import { registerTuiCommand } from "./commands/tui.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgPath = join(__dirname, "..", "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf-8")) as { version: string };

const program = new Command();

registerHelloCommand(program);
registerAskCommand(program);
registerConfigCommand(program);
registerAuthCommand(program);
registerGreetCommand(program);
registerTuiCommand(program);

program
	.command("tui")
	.description("Launch full-screen voice TUI")
	.option("-u, --user <name>", "User name sent to gateway", "dev")
	.option("-g, --gateway <url>", "Clara gateway URL", "https://info-24346--hermes-gateway.modal.run")
	.option("--voice", "Opt in to audio output (reserved for future use)", false)
	.action((opts: { user: string; gateway: string; voice: boolean }) => {
		render(
			React.createElement(App, {
				userId: opts.user,
				gatewayUrl: opts.gateway,
				voiceOptIn: opts.voice,
				version: pkg.version,
			}),
		);
	});

const argv = process.argv.slice(2);
if (argv.length === 0) {
	program.help();
	process.exit(0);
}

program.parse(process.argv);
