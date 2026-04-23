#!/usr/bin/env node
/**
 * Entry point for the unscoped `clara` npm package — delegates to @clara/cli.
 * Publishes as `npm i -g clara@latest` (same binary name as the scoped package).
 */
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const entry = require.resolve("@clara/cli/dist/index.js");
const result = spawnSync(process.execPath, [entry, ...process.argv.slice(2)], { stdio: "inherit" });
if (result.error) {
	console.error("clara:", result.error);
	process.exit(1);
}
process.exit(result.status === null ? 1 : result.status);
