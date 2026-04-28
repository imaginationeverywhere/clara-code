import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { fetchTierStatus } from "../src/lib/tier-status.js";

describe("fetchTierStatus", () => {
	it("GETs /api/v1/tier-status with Bearer and parses JSON", async () => {
		const r = await fetchTierStatus({
			backendFlag: "https://api.example.com",
			bearerToken: "test-token",
			fetch: async (input, init) => {
				assert.equal(String(input), "https://api.example.com/api/v1/tier-status");
				const h = new Headers(init?.headers as HeadersInit);
				assert.equal(h.get("Authorization"), "Bearer test-token");
				return new Response(
					JSON.stringify({
						tier: "pro",
						minutes_remaining: null,
						billing_cycle_end: "2026-06-01T00:00:00.000Z",
					}),
					{ status: 200, headers: { "Content-Type": "application/json" } },
				);
			},
		});
		assert.equal(r.tier, "pro");
		assert.equal(r.minutes_remaining, null);
		assert.equal(r.billing_cycle_end, "2026-06-01T00:00:00.000Z");
	});

	it("throws with status on non-2xx", async () => {
		await assert.rejects(
			async () =>
				fetchTierStatus({
					backendFlag: "https://api.example.com",
					bearerToken: "t",
					fetch: async () => new Response("{}", { status: 401 }),
				}),
			(e: unknown) => e instanceof Error && e.message.startsWith("401"),
		);
	});
});
