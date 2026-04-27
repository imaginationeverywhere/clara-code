import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { startCliAuthLoopback } from "../src/lib/login-loopback.js";

describe("startCliAuthLoopback", () => {
	it("accepts POST JSON and resolves payload", async () => {
		const { port, waitForCallback, close } = await startCliAuthLoopback({ timeoutMs: 10_000 });
		const done = waitForCallback();
		const r = await fetch(`http://127.0.0.1:${String(port)}/`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				email: "u@example.com",
				sessionToken: "sess",
				apiKey: "cc_live_abc",
			}),
		});
		assert.equal(r.status, 200);
		const out = await done;
		assert.equal(out.email, "u@example.com");
		assert.equal(out.sessionToken, "sess");
		assert.equal(out.apiKey, "cc_live_abc");
		close();
	});
});
