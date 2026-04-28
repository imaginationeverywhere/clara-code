import { strict as assert } from "node:assert";
import { afterEach, beforeEach, describe, it } from "node:test";
import { intentDispatchProbeEnabled } from "../src/lib/feature-flags.js";

describe("intentDispatchProbeEnabled", () => {
	let prev: string | undefined;
	beforeEach(() => {
		prev = process.env.CLARA_FEATURE_INTENT_DISPATCH;
		delete process.env.CLARA_FEATURE_INTENT_DISPATCH;
	});
	afterEach(() => {
		if (prev === undefined) delete process.env.CLARA_FEATURE_INTENT_DISPATCH;
		else process.env.CLARA_FEATURE_INTENT_DISPATCH = prev;
	});

	it("is false when unset", () => {
		assert.equal(intentDispatchProbeEnabled(), false);
	});

	it("is true for 1", () => {
		process.env.CLARA_FEATURE_INTENT_DISPATCH = "1";
		assert.equal(intentDispatchProbeEnabled(), true);
	});

	it("is true for true (case-insensitive)", () => {
		process.env.CLARA_FEATURE_INTENT_DISPATCH = "TRUE";
		assert.equal(intentDispatchProbeEnabled(), true);
	});
});
