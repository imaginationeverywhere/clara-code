import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const cliRoot = join(root, "..");
const entry = join(cliRoot, "src", "index.ts");

test("the-brain quiknation exits 1 and prints locked error", () => {
	const r = spawnSync("npx", ["tsx", entry, "the-brain", "quiknation"], {
		encoding: "utf8",
		cwd: cliRoot,
	});
	assert.equal(r.status, 1);
	assert.match(r.stderr, /restricted to founders/);
});

test("the-brain (no arg) exits 0 and mentions claracode", () => {
	const r = spawnSync("npx", ["tsx", entry, "the-brain"], {
		encoding: "utf8",
		cwd: cliRoot,
	});
	assert.equal(r.status, 0);
	assert.match(r.stdout, /brain-api\.claracode\.ai/);
});
