#!/usr/bin/env node
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const dir = dirname(fileURLToPath(import.meta.url));
const cli = join(dir, "../../cli/dist/index.js");

const child = spawn(process.execPath, [cli, ...process.argv.slice(2)], { stdio: "inherit" });
child.on("exit", (code, signal) => {
	if (signal) {
		process.exit(1);
	} else {
		process.exit(code === null || code === undefined ? 0 : code);
	}
});
