import { strict as assert } from "node:assert";
import { afterEach, describe, it } from "node:test";
import { isUnifiedRunUnavailable, tryRunIntentUnified } from "../src/lib/intent-dispatch.js";

const originalFetch = globalThis.fetch;

function stubFetch(handler: (url: string, init: RequestInit | undefined) => Promise<Response>): void {
	globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => handler(String(input), init)) as typeof fetch;
}

describe("isUnifiedRunUnavailable", () => {
	it("is true for 404/501", () => {
		assert.equal(isUnifiedRunUnavailable(404, ""), true);
		assert.equal(isUnifiedRunUnavailable(501, ""), true);
	});

	it("is true for intent_gateway_pending JSON", () => {
		assert.equal(isUnifiedRunUnavailable(501, JSON.stringify({ error: "intent_gateway_pending" })), true);
	});

	it("is false for other 4xx bodies", () => {
		assert.equal(isUnifiedRunUnavailable(403, "{}"), false);
	});
});

describe("tryRunIntentUnified", () => {
	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	it("returns null on 501 so caller can fall back", async () => {
		stubFetch(async (url) => {
			assert.match(url, /\/v1\/run$/);
			return new Response(JSON.stringify({ error: "intent_gateway_pending" }), {
				status: 501,
				headers: { "Content-Type": "application/json" },
			});
		});
		const r = await tryRunIntentUnified("think", { prompt: "x" }, false, {
			token: "t",
			gatewayBase: "https://gw.example",
		});
		assert.equal(r, null);
	});

	it("returns payload on 200 JSON", async () => {
		stubFetch(async (url) => {
			assert.match(url, /\/v1\/run$/);
			return new Response(JSON.stringify({ reply: "hi" }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		});
		const r = await tryRunIntentUnified("think", { prompt: "x" }, false, {
			token: "t",
			gatewayBase: "https://gw.example",
		});
		assert.ok(r);
		assert.equal(r.reply, "hi");
	});
});
