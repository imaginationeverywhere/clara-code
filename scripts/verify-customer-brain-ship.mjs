#!/usr/bin/env node
/**
 * Release gate: customer bundles must not ship founder brain host or founder-only command marker.
 * See docs/architecture/BRAIN_API_ACCESS_CONTROL.md
 *
 * Usage: node scripts/verify-customer-brain-ship.mjs [--vsix path/to.vsix]
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { readdir as readdirAsync, readFile as readFileAsync, stat as statAsync } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";

const FORBIDDEN_HOST = "brain-api.quiknation.com";
const FOUNDER_ONLY_PHRASE = "Constitution + Live Brain Discipline";

async function walkFiles(dir) {
	/** @type {string[]} */
	const out = [];
	const entries = await readdirAsync(dir, { withFileTypes: true });
	for (const e of entries) {
		const p = join(dir, e.name);
		if (e.isDirectory() && e.name !== "node_modules" && e.name !== ".git") {
			out.push(...(await walkFiles(p)));
		} else if (
			e.isFile() &&
			(e.name.endsWith(".md") ||
				e.name.endsWith(".js") ||
				e.name.endsWith(".mjs") ||
				e.name.endsWith(".json") ||
				e.name.endsWith(".ts"))
		) {
			out.push(p);
		}
	}
	return out;
}

/**
 * @param {string} label
 * @param {string} content
 */
function scanContent(label, content) {
	if (content.includes(FORBIDDEN_HOST)) {
		console.error(`\n\u274c RELEASE BLOCKED: ${label} contains '${FORBIDDEN_HOST}'\n   This is a constitutional violation per BRAIN_API_ACCESS_CONTROL.md.\n   Customer-facing surfaces MUST NOT contain founder-only brain endpoints.\n`);
		process.exit(1);
	}
	if (content.includes(FOUNDER_ONLY_PHRASE)) {
		console.error(`\n\u274c RELEASE BLOCKED: ${label} contains founder-only command marker: "${FOUNDER_ONLY_PHRASE}"\n   Ship the-brain-customer, not the founder the-brain command file.\n`);
		process.exit(1);
	}
}

const args = process.argv.slice(2);
const vsixIdx = args.indexOf("--vsix");
const vsixPath = vsixIdx >= 0 ? args[vsixIdx + 1] : null;
const skipCli = args.includes("--vsix-only");
const withVsix = vsixPath != null && vsixPath.length > 0;

if (args.includes("-h") || args.includes("--help")) {
	console.log(
		"Usage: node scripts/verify-customer-brain-ship.mjs [--vsix path/to.vsix] [--vsix-only]\n   --vsix-only: only scan the VSIX (no packages/cli dist required; use on IDE jobs).\n   Default: requires pnpm -C packages/cli run build for CLI dist.",
	);
	process.exit(0);
}

const root = process.cwd();
const cliDir = join(root, "packages/cli");
const distJs = join(cliDir, "dist", "index.js");
const claudeDir = join(cliDir, ".claude");

if (!skipCli) {
	if (await statAsync(distJs).catch(() => null)) {
		scanContent("packages/cli/dist/index.js", await readFileAsync(distJs, "utf8"));
	} else {
		console.error("verify-customer-brain-ship: packages/cli/dist/index.js missing; run: pnpm -C packages/cli run build");
		process.exit(1);
	}
	if (await statAsync(claudeDir).catch(() => null)) {
		for (const f of await walkFiles(claudeDir)) {
			scanContent(relative(root, f), await readFileAsync(f, "utf8"));
		}
	}
	const mcp = join(cliDir, "mcp-brain-customer.example.json");
	if (await statAsync(mcp).catch(() => null)) {
		scanContent("packages/cli/mcp-brain-customer.example.json", await readFileAsync(mcp, "utf8"));
	}
} else if (!withVsix) {
	console.error("verify-customer-brain-ship: --vsix-only requires --vsix <path>");
	process.exit(1);
}

if (withVsix) {
	if (!existsSync(vsixPath)) {
		console.error(`verify-customer-brain-ship: vsix not found: ${vsixPath}`);
		process.exit(1);
	}
	const tmp = mkdtempSync(join(tmpdir(), "clara-vsix-"));
	try {
		execFileSync("unzip", ["-q", "-o", vsixPath, "-d", tmp], { stdio: "inherit" });
		for (const f of await walkFiles(tmp)) {
			scanContent(`vsix:${relative(tmp, f)}`, await readFileAsync(f, "utf8"));
		}
	} finally {
		rmSync(tmp, { recursive: true, force: true });
	}
}
const parts = skipCli
	? []
	: ["clara dist", ".claude", "mcp example"];
if (withVsix) parts.push(`vsix ${vsixPath}`);
console.log(`verify-customer-brain-ship: ok (${parts.join(" + ")})`);
