import assert from "node:assert";
import { describe, it } from "node:test";
import { VoiceBar } from "../src/components/voice-bar.js";

describe("VoiceBar", () => {
	it("idle: one line with shortcut hint", () => {
		const bar = new VoiceBar();
		const lines = bar.render(80);
		assert.strictEqual(lines.length, 1);
		assert.ok(lines[0]?.includes("Ctrl+Space"));
	});

	it("listening: shows label after tick", () => {
		const bar = new VoiceBar();
		bar.setState("listening");
		assert.strictEqual(bar.tick(), true);
		const lines = bar.render(80);
		assert.ok(lines[0]?.includes("Listening"));
	});

	it("idle tick returns false", () => {
		const bar = new VoiceBar();
		assert.strictEqual(bar.tick(), false);
	});
});
