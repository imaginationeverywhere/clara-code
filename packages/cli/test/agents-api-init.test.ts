import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { postAgentInit } from "../src/lib/agents-api.js";

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
