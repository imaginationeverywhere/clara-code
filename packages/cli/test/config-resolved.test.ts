import { strict as assert } from "node:assert";
import { afterEach, beforeEach, describe, it } from "node:test";
import { resolveClaraGatewayUrl } from "../src/lib/config-resolved.js";
import { DEFAULT_GATEWAY_URL } from "../src/lib/gateway.js";

describe("resolveClaraGatewayUrl", () => {
	let prevEnv: string | undefined;
	beforeEach(() => {
		prevEnv = process.env.CLARA_GATEWAY_URL;
		delete process.env.CLARA_GATEWAY_URL;
	});
	afterEach(() => {
		if (prevEnv === undefined) delete process.env.CLARA_GATEWAY_URL;
		else process.env.CLARA_GATEWAY_URL = prevEnv;
	});

	it("uses env over default", () => {
		process.env.CLARA_GATEWAY_URL = "https://example.com/gw";
		const r = resolveClaraGatewayUrl();
		assert.equal(r.value, "https://example.com/gw");
		assert.equal(r.source, "env");
	});

	it("resolves a non-empty gateway when no override flag (env, file, or default chain)", () => {
		const r = resolveClaraGatewayUrl();
		assert.ok(r.value.length > 0);
		assert.ok(r.value.startsWith("https://"));
		assert.ok(["env", "config", "default"].includes(r.source));
		if (r.source === "default") {
			assert.equal(r.value, DEFAULT_GATEWAY_URL);
		}
	});

	it("uses flag override", () => {
		const r = resolveClaraGatewayUrl("https://flag.example/p/");
		assert.equal(r.value, "https://flag.example/p");
		assert.equal(r.source, "flag");
	});
});
