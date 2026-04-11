#!/usr/bin/env node
import { Command } from "commander";
import { registerAskCommand } from "./commands/ask.js";
import { registerAuthCommand } from "./commands/auth.js";
import { registerConfigCommand } from "./commands/config.js";
import { registerGreetCommand } from "./commands/greet.js";
import { registerHelloCommand } from "./commands/hello.js";
import { registerTuiCommand } from "./commands/tui.js";

const program = new Command();

registerHelloCommand(program);
registerAskCommand(program);
registerConfigCommand(program);
registerAuthCommand(program);
registerGreetCommand(program);
registerTuiCommand(program);

const argv = process.argv.slice(2);
if (argv.length === 0) {
	program.help();
	process.exit(0);
}

program.parse(process.argv);
