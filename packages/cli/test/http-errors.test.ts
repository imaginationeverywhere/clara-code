import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { mapHttpError } from "../src/lib/http-errors.js";

describe("mapHttpError", () => {
	it("401", () => {
		const m = mapHttpError(401, "{}", "cli");
		assert.match(m.message, /clara login/);
		assert.equal(m.exitCode, 1);
	});

	it("403 tier_lock", () => {
		const body = JSON.stringify({
			reason: "tier_lock",
			required_tier: "Cook",
			current_tier: "Taste",
			upgrade_url: "https://claracode.ai/pricing",
		});
		const m = mapHttpError(403, body, "cli");
		assert.match(m.message, /Cook/);
		assert.match(m.message, /Upgrade/);
	});

	it("429 minutes_exhausted", () => {
		const body = JSON.stringify({ reason: "minutes_exhausted", topup_url: "https://claracode.ai/topup" });
		const m = mapHttpError(429, body, "cli");
		assert.match(m.message, /minute allotment/);
		assert.match(m.message, /Top up/);
	});

	it("5xx", () => {
		const m = mapHttpError(503, "{}", "cli");
		assert.match(m.message, /coming online/);
	});
});
