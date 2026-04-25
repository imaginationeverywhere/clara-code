import { test } from "node:test";
import { strict as assert } from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const shim = join(dirname(fileURLToPath(import.meta.url)), "../bin/clara.mjs");

test("shim --version exits 0 and prints a version string", () => {
	const r = spawnSync(process.execPath, [shim, "--version"], { encoding: "utf8" });
	assert.equal(r.status, 0, `expected exit 0, got ${r.status}\nstderr: ${r.stderr}`);
	assert.match(r.stdout.trim(), /\d+\.\d+\.\d+/, "expected semver in stdout");
});

test("shim --help exits 0 and prints usage", () => {
	const r = spawnSync(process.execPath, [shim, "--help"], { encoding: "utf8" });
	assert.equal(r.status, 0, `expected exit 0, got ${r.status}\nstderr: ${r.stderr}`);
	assert.ok(
		r.stdout.includes("clara") || r.stdout.includes("Usage") || r.stderr.length > 0,
		`expected usage text, got: ${r.stdout.slice(0, 200)}`,
	);
});

test("shim forwards non-zero exit code from CLI", () => {
	const r = spawnSync(process.execPath, [shim, "hello"], { encoding: "utf8" });
	assert.notEqual(r.status, 0, "expected non-zero exit from stub hello command");
	assert.equal(r.error, undefined, `unexpected spawn error: ${r.error}`);
});

test("shim passes unknown flag to CLI (not shim error)", () => {
	const r = spawnSync(process.execPath, [shim, "--xyz-unknown-flag"], { encoding: "utf8" });
	assert.equal(r.error, undefined, "shim should not throw a spawn error");
	assert.notEqual(r.status, null, "shim should not be killed by signal");
	assert.notEqual(r.status, 0, "expected non-zero for unknown flag");
});
