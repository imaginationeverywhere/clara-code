import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { startCapture } from "../src/lib/audio-capture.js";

describe("startCapture", () => {
	it("returns a capture object that supports stop() and cancel()", async () => {
		const capture = startCapture();
		assert.equal(typeof capture.stop, "function");
		assert.equal(typeof capture.cancel, "function");
		assert.equal(typeof capture.isReal, "boolean");
		// Regardless of whether sox is installed, stop() must resolve to a Buffer so the caller
		// can base64 it and still drive the dev-stub end-to-end.
		capture.cancel();
		const audio = await capture.stop();
		assert.ok(Buffer.isBuffer(audio));
	});

	it("cancel() is idempotent", async () => {
		const capture = startCapture();
		capture.cancel();
		capture.cancel();
		const audio = await capture.stop();
		assert.equal(audio.length, 0);
	});
});
