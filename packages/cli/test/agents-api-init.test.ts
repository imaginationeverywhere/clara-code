import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { extractAgentInitFromUnifiedRaw, postAgentInit, postAgentInitWithUnifiedFirst } from "../src/lib/agents-api.js";
import { NETWORK_FAILURE_MESSAGE } from "../src/lib/http-errors.js";

describe("extractAgentInitFromUnifiedRaw", () => {
	it("parses camelCase and snake_case", () => {
		assert.deepStrictEqual(
			extractAgentInitFromUnifiedRaw({
				cloneUrl: "https://g/o.git",
				repoUrl: "https://g/o",
				repository: "o/r",
			}),
			{ cloneUrl: "https://g/o.git", repoUrl: "https://g/o", repository: "o/r" },
		);
		assert.deepStrictEqual(
			extractAgentInitFromUnifiedRaw({
				clone_url: "https://g/o.git",
				repo_url: "https://g/o",
			}),
			{ cloneUrl: "https://g/o.git", repoUrl: "https://g/o" },
		);
	});

	it("returns null without both URLs", () => {
		assert.equal(extractAgentInitFromUnifiedRaw({ cloneUrl: "x" }), null);
		assert.equal(extractAgentInitFromUnifiedRaw(null), null);
	});
});

describe("postAgentInitWithUnifiedFirst", () => {
	it("uses unified response when clone/repo URLs are present", async () => {
		const result = await postAgentInitWithUnifiedFirst("my-agent", "https://api.example.com", {
			token: "test-token",
			gatewayBase: "https://gw.example.com",
			fetch: async (input) => {
				const url = String(input);
				if (url.endsWith("/v1/run")) {
					return new Response(
						JSON.stringify({
							cloneUrl: "https://github.com/o/u.git",
							repoUrl: "https://github.com/o/u",
						}),
						{ status: 200, headers: { "Content-Type": "application/json" } },
					);
				}
				throw new Error(`unexpected fetch: ${url}`);
			},
		});
		assert.equal(result.cloneUrl, "https://github.com/o/u.git");
		assert.equal(result.repoUrl, "https://github.com/o/u");
	});

	it("falls back to POST /api/agents/init when /v1/run is unavailable", async () => {
		const result = await postAgentInitWithUnifiedFirst("my-agent", "https://api.example.com", {
			token: "test-token",
			gatewayBase: "https://gw.example.com",
			fetch: async (input) => {
				const url = String(input);
				if (url.endsWith("/v1/run")) {
					return new Response("", { status: 501 });
				}
				if (url.includes("/api/agents/init")) {
					return new Response(
						JSON.stringify({
							cloneUrl: "https://github.com/o/r.git",
							repoUrl: "https://github.com/o/r",
							repository: "o/r",
						}),
						{ status: 201, headers: { "Content-Type": "application/json" } },
					);
				}
				throw new Error(`unexpected fetch: ${url}`);
			},
		});
		assert.equal(result.cloneUrl, "https://github.com/o/r.git");
		assert.equal(result.repoUrl, "https://github.com/o/r");
	});

	it("falls back to backend when gateway network fails", async () => {
		const result = await postAgentInitWithUnifiedFirst("my-agent", "https://api.example.com", {
			token: "test-token",
			gatewayBase: "https://gw.example.com",
			fetch: async (input) => {
				const url = String(input);
				if (url.endsWith("/v1/run")) {
					throw new Error(NETWORK_FAILURE_MESSAGE);
				}
				if (url.includes("/api/agents/init")) {
					return new Response(
						JSON.stringify({
							cloneUrl: "https://github.com/o/r.git",
							repoUrl: "https://github.com/o/r",
						}),
						{ status: 201, headers: { "Content-Type": "application/json" } },
					);
				}
				throw new Error(`unexpected fetch: ${url}`);
			},
		});
		assert.equal(result.cloneUrl, "https://github.com/o/r.git");
	});

	it("falls back when unified returns 200 without clone URLs", async () => {
		const result = await postAgentInitWithUnifiedFirst("my-agent", "https://api.example.com", {
			token: "test-token",
			gatewayBase: "https://gw.example.com",
			fetch: async (input) => {
				const url = String(input);
				if (url.endsWith("/v1/run")) {
					return new Response(JSON.stringify({ reply: "queued" }), {
						status: 200,
						headers: { "Content-Type": "application/json" },
					});
				}
				if (url.includes("/api/agents/init")) {
					return new Response(
						JSON.stringify({
							cloneUrl: "https://github.com/o/r.git",
							repoUrl: "https://github.com/o/r",
						}),
						{ status: 201, headers: { "Content-Type": "application/json" } },
					);
				}
				throw new Error(`unexpected fetch: ${url}`);
			},
		});
		assert.equal(result.cloneUrl, "https://github.com/o/r.git");
	});
});

describe("postAgentInit", () => {
	it("returns clone and repo URLs on 201", async () => {
		const result = await postAgentInit("my-agent", "https://api.example.com", {
			token: "test-token",
			fetch: async () =>
				new Response(
					JSON.stringify({
						cloneUrl: "https://github.com/o/r.git",
						repoUrl: "https://github.com/o/r",
						repository: "o/r",
					}),
					{ status: 201, headers: { "Content-Type": "application/json" } },
				),
		});
		assert.equal(result.cloneUrl, "https://github.com/o/r.git");
		assert.equal(result.repoUrl, "https://github.com/o/r");
	});

	it("throws unauthorized on 401", async () => {
		await assert.rejects(
			async () =>
				postAgentInit("my-agent", "https://api.example.com", {
					token: "t",
					fetch: async () => new Response("{}", { status: 401 }),
				}),
			(e: unknown) => e instanceof Error && e.message === "unauthorized",
		);
	});

	it("throws tier_lock on 403 with reason", async () => {
		await assert.rejects(
			async () =>
				postAgentInit("my-agent", "https://api.example.com", {
					token: "t",
					fetch: async () =>
						new Response(JSON.stringify({ reason: "tier_lock", upgrade_url: "https://price.example" }), {
							status: 403,
							headers: { "Content-Type": "application/json" },
						}),
				}),
			(e: unknown) => e instanceof Error && e.message === "tier_lock",
		);
	});
});
