import { strict as assert } from "node:assert";
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { formatLastErrorDoctorLines, readLastClaraError, writeLastClaraError } from "../src/lib/last-error.js";

describe("formatLastErrorDoctorLines", () => {
	it("returns no lines for null or empty record", () => {
		assert.deepEqual(formatLastErrorDoctorLines(null), []);
		assert.deepEqual(formatLastErrorDoctorLines({}), []);
	});

	it("includes command, message, and at", () => {
		const lines = formatLastErrorDoctorLines({
			command: "clara init",
			message: "tier_lock",
			at: "2026-04-27T12:00:00.000Z",
		});
		assert.ok(lines[0]?.includes("last error"));
		assert.ok(lines[1]?.includes("clara init"));
		assert.ok(lines[1]?.includes("tier_lock"));
		assert.ok(lines[1]?.includes("2026-04-27"));
	});

	it("uses summary when message absent", () => {
		const lines = formatLastErrorDoctorLines({ summary: "network failure" });
		assert.ok(lines[1]?.includes("network failure"));
	});
});

describe("readLastClaraError", () => {
	it("reads JSON from a given path", () => {
		const p = join(tmpdir(), `clara-last-error-${String(Date.now())}.json`);
		writeFileSync(p, JSON.stringify({ command: "x", message: "y" }), "utf8");
		const r = readLastClaraError(p);
		assert.deepEqual(r, { command: "x", message: "y" });
	});

	it("round-trips with writeLastClaraError", () => {
		const p = join(tmpdir(), `clara-last-error-w-${String(Date.now())}.json`);
		writeLastClaraError({ command: "clara init foo", message: "oops", at: "2026-01-01T00:00:00.000Z" }, p);
		const r = readLastClaraError(p);
		assert.equal(r?.command, "clara init foo");
		assert.equal(r?.message, "oops");
	});
});
