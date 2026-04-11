#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import { registerAskCommand } from "./commands/ask.js";
import { registerConfigCommand } from "./commands/config.js";
import { registerHelloCommand } from "./commands/hello.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgPath = join(__dirname, "..", "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { version: string };

const program = new Command();
program.name("clara").description("Clara Code CLI").version(pkg.version, "-V, --version", "Print CLI version");

registerHelloCommand(program);
registerAskCommand(program);
registerConfigCommand(program);

program.parse();
