import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { validateAgentName } from "../../src/lib/agent-name.js";

describe("validateAgentName", () => {
	it("accepts valid kebab-case names", () => {
		assert.equal(validateAgentName("my-first-agent").ok, true);
		assert.equal(validateAgentName("a").ok, true);
		assert.equal(validateAgentName("ab-cd-ef").ok, true);
	});

	it("rejects empty and bad patterns", () => {
		assert.equal(validateAgentName("").ok, false);
		assert.equal(validateAgentName("  ").ok, false);
		assert.equal(validateAgentName("My-Agent").ok, false);
		assert.equal(validateAgentName("my_agent").ok, false);
		assert.equal(validateAgentName("-bad").ok, false);
		assert.equal(validateAgentName("bad-").ok, false);
	});

	it("rejects long names", () => {
		const s = "a".repeat(33);
		const r = validateAgentName(s);
		assert.equal(r.ok, false);
	});

	it("rejects reserved words", () => {
		assert.equal(validateAgentName("clara").ok, false);
		assert.equal(validateAgentName("git").ok, false);
	});
});
