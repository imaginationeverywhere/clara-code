import assert from "node:assert";
import { describe, it } from "node:test";
import { VoiceBar } from "../src/components/voice-bar.js";

describe("VoiceBar", () => {
	it("renders one line in idle state with shortcut hint", () => {
		const bar = new VoiceBar();
		const lines = bar.render(80);
		assert.strictEqual(lines.length, 1);
		assert.ok(lines[0].includes("Ctrl+Space"));
	});

	it("shows Listening label after switching to listening and tick", () => {
		const bar = new VoiceBar();
		bar.setState("listening");
		bar.tick();
		const lines = bar.render(80);
		assert.ok(lines[0].includes("Listening"));
	});

	it("tick returns false when idle", () => {
		const bar = new VoiceBar();
		assert.strictEqual(bar.tick(), false);
	});

	it("tick returns true when listening", () => {
		const bar = new VoiceBar();
		bar.setState("listening");
		assert.strictEqual(bar.tick(), true);
	});
});
