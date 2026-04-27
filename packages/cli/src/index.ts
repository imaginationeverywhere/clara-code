#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import { registerAskCommand } from "./commands/ask.js";
import { registerAuthCommand } from "./commands/auth.js";
import { registerConfigCommand } from "./commands/config.js";
import { registerConfigAgentCommand } from "./commands/config-agent.js";
import { registerGreetCommand } from "./commands/greet.js";
import { registerHelloCommand } from "./commands/hello.js";
import { registerTheBrainCustomerCommand } from "./commands/the-brain.js";
import { registerTuiCommand } from "./commands/tui.js";
import { launchVoiceConverseMode } from "./launch-voice-converse.js";

const pkg = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../package.json"), "utf8")) as {
	version: string;
};

const program = new Command();
program
	.name("clara")
	.description("Clara Code — conversational AI voice coding CLI")
	.version(pkg.version, "-V, --version", "print version");

registerHelloCommand(program);
registerAskCommand(program);
registerConfigCommand(program);
registerConfigAgentCommand(program);
registerAuthCommand(program);
registerGreetCommand(program);
registerTuiCommand(program);
registerTheBrainCustomerCommand(program);

// Default: `clara` with no subcommand = greeting + `/voice/converse` loop (see
// `prompts/.../03-cli-npm-clara-converse-default.md`). Full terminal IDE experience: `clara tui`.
const argv = process.argv.slice(2);
if (argv.length === 0) {
	launchVoiceConverseMode();
} else {
	program.parse(process.argv);
}
