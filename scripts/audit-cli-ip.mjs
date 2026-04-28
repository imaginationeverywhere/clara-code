#!/usr/bin/env node
/**
 * Static scan: packages/cli shipped paths must not contain founder-only brain host or marker.
 * Aligns with scripts/verify-customer-brain-ship.mjs patterns for source-time checks (no build required).
 *
 * Usage: node scripts/audit-cli-ip.mjs
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const FORBIDDEN_HOST = "brain-api.quiknation.com";
const FOUNDER_ONLY_PHRASE = "Constitution + Live Brain Discipline";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLI_SRC = join(ROOT, "packages/cli/src");
const CLI_DIST = join(ROOT, "packages/cli/dist/index.js");

function walkTs(dir, acc = []) {
	for (const name of readdirSync(dir)) {
		if (name === "node_modules") {
			continue;
		}
		const p = join(dir, name);
		const st = statSync(p);
		if (st.isDirectory()) {
			walkTs(p, acc);
		} else if (name.endsWith(".ts") || name.endsWith(".tsx")) {
			acc.push(p);
		}
	}
	return acc;
}

/**
 * @returns {boolean} false if a violation was found
 */
function scan(label, content) {
	if (content.includes(FORBIDDEN_HOST)) {
		console.error(`audit-cli-ip: ${label}: forbidden host '${FORBIDDEN_HOST}'`);
		return false;
	}
	if (content.includes(FOUNDER_ONLY_PHRASE)) {
		console.error(`audit-cli-ip: ${label}: founder-only marker phrase`);
		return false;
	}
	return true;
}

function main() {
	let ok = true;
	for (const f of walkTs(CLI_SRC)) {
		const rel = relative(ROOT, f);
		const text = readFileSync(f, "utf8");
		if (!scan(rel, text)) {
			ok = false;
		}
	}
	if (existsSync(CLI_DIST)) {
		if (!scan(relative(ROOT, CLI_DIST), readFileSync(CLI_DIST, "utf8"))) {
			ok = false;
		}
	}
	if (!ok) {
		process.exit(1);
	}
	console.log("audit-cli-ip: ok (packages/cli/src" + (existsSync(CLI_DIST) ? " + dist/index.js" : "") + ")");
}

main();
