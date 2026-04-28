import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { runAgentDeployUnifiedFirst } from "../src/lib/agent-deploy.js";
import { NETWORK_FAILURE_MESSAGE } from "../src/lib/http-errors.js";

describe("runAgentDeployUnifiedFirst", () => {
	it("returns unified payload when /v1/run succeeds", async () => {
		const r = await runAgentDeployUnifiedFirst("my-agent", "tok", "https://api.example.com", {
			token: "tok",
			gatewayBase: "https://gw.example.com",
			fetch: async (input) => {
				assert.match(String(input), /\/v1\/run$/);
				return new Response(JSON.stringify({ reply: "accepted", status: "queued" }), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				});
			},
		});
		assert.equal(r.kind, "unified");
		if (r.kind === "unified") {
			assert.match(String(r.payload.reply), /accepted/);
		}
	});

	it("falls back to legacy POST when /v1/run is unavailable", async () => {
		const r = await runAgentDeployUnifiedFirst("my-agent", "tok", "https://api.example.com", {
			token: "tok",
			gatewayBase: "https://gw.example.com",
			fetch: async (input) => {
				const url = String(input);
				if (url.endsWith("/v1/run")) {
					return new Response("", { status: 404 });
				}
				assert.match(url, /\/api\/agents\/my-agent\/deploy$/);
				return new Response(JSON.stringify({ ok: true }), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				});
			},
		});
		assert.equal(r.kind, "legacy");
		if (r.kind === "legacy") {
			assert.equal(r.response.ok, true);
		}
	});

	it("falls back when gateway network fails", async () => {
		const r = await runAgentDeployUnifiedFirst("my-agent", "tok", "https://api.example.com", {
			token: "tok",
			gatewayBase: "https://gw.example.com",
			fetch: async (input) => {
				const url = String(input);
				if (url.endsWith("/v1/run")) {
					throw new Error(NETWORK_FAILURE_MESSAGE);
				}
				assert.match(url, /\/api\/agents\/my-agent\/deploy$/);
				return new Response("{}", { status: 200 });
			},
		});
		assert.equal(r.kind, "legacy");
	});
});
