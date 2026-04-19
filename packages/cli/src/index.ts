#!/usr/bin/env node
import { Command } from "commander";
import { registerAskCommand } from "./commands/ask.js";
import { registerAuthCommand } from "./commands/auth.js";
import { registerConfigCommand } from "./commands/config.js";
import { registerGreetCommand } from "./commands/greet.js";
import { registerHelloCommand } from "./commands/hello.js";
import { launchTui, registerTuiCommand } from "./commands/tui.js";

const program = new Command();
program.name("clara").description("Clara Code — conversational AI voice coding CLI");

registerHelloCommand(program);
registerAskCommand(program);
registerConfigCommand(program);
registerAuthCommand(program);
registerGreetCommand(program);
registerTuiCommand(program);

// Default action: `clara` with no subcommand launches the full TUI. This keeps the `npx
// claracode@latest` / `clara` zero-arg entry point identical to `clara tui`, which is the CLI-first
// MVP surface defined in prompts/2026/April/19/00-create-clara-app-architecture-overview.md.
const argv = process.argv.slice(2);
if (argv.length === 0) {
	launchTui({});
} else {
	program.parse(process.argv);
}
