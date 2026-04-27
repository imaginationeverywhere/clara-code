import { strict as assert } from "node:assert";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, it } from "node:test";
import { readCognitiveTextArg, runCognitive } from "../src/lib/cognitive.js";

const originalFetch = globalThis.fetch;

function stubFetch(handler: (url: string, init: RequestInit | undefined) => Promise<Response>): void {
	globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => handler(String(input), init)) as typeof fetch;
}

describe("readCognitiveTextArg", () => {
	it("returns inline text", () => {
		const r = readCognitiveTextArg("  hello world  ");
		assert.equal(r.text, "hello world");
		assert.equal(r.isFile, false);
	});

	it("reads @ file path", () => {
		const dir = mkdtempSync(join(tmpdir(), "clara-cog-"));
		const p = join(dir, "sample.md");
		writeFileSync(p, "file contents", "utf8");
		const r = readCognitiveTextArg(`@${p}`);
		assert.equal(r.text, "file contents");
		assert.equal(r.isFile, true);
	});
});

describe("runCognitive", () => {
	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	it("returns reply on 200 JSON", async () => {
		stubFetch(async (url) => {
			assert.match(url, /\/v1\/think$/);
			return new Response(JSON.stringify({ reply: "ok" }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		});
		const r = await runCognitive("think", { prompt: "x" }, false, {
			token: "sk-clara-test",
			gatewayBase: "https://gw.example",
		});
		assert.equal(r.reply, "ok");
		assert.equal(r.json, false);
	});

	it("throws on 401 with login hint", async () => {
		stubFetch(async () => new Response("{}", { status: 401 }));
		await assert.rejects(
			() =>
				runCognitive("think", { prompt: "x" }, false, {
					token: "t",
					gatewayBase: "https://gw.example",
				}),
			/Sign in/,
		);
	});

	it("throws on 403 tier_lock with upgrade CTA", async () => {
		stubFetch(
			async () =>
				new Response(
					JSON.stringify({
						reason: "tier_lock",
						required_tier: "Cook",
						current_tier: "Taste",
						upgrade_url: "https://claracode.ai/pricing",
					}),
					{ status: 403, headers: { "Content-Type": "application/json" } },
				),
		);
		await assert.rejects(
			() =>
				runCognitive("facts", { topic: "x" }, false, {
					token: "t",
					gatewayBase: "https://gw.example",
				}),
			/Upgrade/,
		);
	});
});
