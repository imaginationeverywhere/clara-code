import { strict as assert } from "node:assert";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { createSessionLogger } from "../src/lib/session-log.js";

describe("createSessionLogger", () => {
	let dir: string;

	beforeEach(() => {
		dir = mkdtempSync(join(tmpdir(), "clara-session-"));
	});

	afterEach(() => {
		rmSync(dir, { recursive: true, force: true });
	});

	it("writes to <cwd>/.clara/session-YYYY-MM-DD.log", () => {
		const fixed = new Date("2026-04-19T12:34:56Z");
		const logger = createSessionLogger(dir, fixed);
		assert.ok(logger.path.endsWith(".clara/session-2026-04-19.log"));
		const body = readFileSync(logger.path, "utf8");
		assert.match(body, /session start/);
	});

	it("appends user/assistant/system entries with HH:MM:SS prefixes", () => {
		const logger = createSessionLogger(dir);
		logger.log("user", "add hello world");
		logger.log("assistant", "done");
		logger.log("system", "cancelled");
		const body = readFileSync(logger.path, "utf8");
		assert.match(body, /\[\d{2}:\d{2}:\d{2}\] user: add hello world/);
		assert.match(body, /\[\d{2}:\d{2}:\d{2}\] assistant: done/);
		assert.match(body, /\[\d{2}:\d{2}:\d{2}\] system: cancelled/);
	});

	it("escapes newlines in messages onto a single line", () => {
		const logger = createSessionLogger(dir);
		logger.log("assistant", "line one\nline two");
		const body = readFileSync(logger.path, "utf8");
		assert.match(body, /assistant: line one\\nline two/);
	});

	it("creates the .clara directory if missing", () => {
		const logger = createSessionLogger(dir);
		assert.ok(logger.path.includes(`${dir}/.clara/`));
	});
});
