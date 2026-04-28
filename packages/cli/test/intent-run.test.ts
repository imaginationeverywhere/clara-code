import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { isIntentGatewayPendingBody, postIntentRun } from "../src/lib/intent-run.js";

describe("isIntentGatewayPendingBody", () => {
	it("detects intent_gateway_pending", () => {
		assert.equal(isIntentGatewayPendingBody({ error: "intent_gateway_pending" }), true);
		assert.equal(isIntentGatewayPendingBody({ error: "other" }), false);
		assert.equal(isIntentGatewayPendingBody(null), false);
	});
});

describe("postIntentRun", () => {
	it("POSTs JSON to /api/v1/run with Bearer", async () => {
		const { status, body } = await postIntentRun(
			{ intent: "test" },
			{
				backendFlag: "https://api.example.com",
				bearerToken: "tok",
				fetch: async (input, init) => {
					assert.equal(String(input), "https://api.example.com/api/v1/run");
					assert.equal(init?.method, "POST");
					const h = new Headers(init?.headers as HeadersInit);
					assert.equal(h.get("Authorization"), "Bearer tok");
					assert.equal(h.get("Content-Type"), "application/json");
					assert.equal(init?.body, JSON.stringify({ intent: "test" }));
					return new Response(JSON.stringify({ ok: false, error: "intent_gateway_pending" }), {
						status: 501,
						headers: { "Content-Type": "application/json" },
					});
				},
			},
		);
		assert.equal(status, 501);
		assert.equal(isIntentGatewayPendingBody(body), true);
	});
});
