#!/usr/bin/env node
import { Command } from "commander";
import { registerAskCommand } from "./commands/ask.js";
import { registerAuthCommand } from "./commands/auth.js";
import { registerConfigCommand } from "./commands/config.js";
import { registerGreetCommand } from "./commands/greet.js";
import { registerHelloCommand } from "./commands/hello.js";
import { registerTuiCommand } from "./commands/tui.js";
import { launchVoiceConverseMode } from "./launch-voice-converse.js";

const program = new Command();
program.name("clara").description("Clara Code — conversational AI voice coding CLI");

registerHelloCommand(program);
registerAskCommand(program);
registerConfigCommand(program);
registerAuthCommand(program);
registerGreetCommand(program);
registerTuiCommand(program);

// Default: `clara` with no subcommand = greeting + `/voice/converse` loop (see
// `prompts/.../03-cli-npm-clara-converse-default.md`). Full terminal IDE experience: `clara tui`.
const argv = process.argv.slice(2);
if (argv.length === 0) {
	launchVoiceConverseMode();
} else {
	program.parse(process.argv);
}
