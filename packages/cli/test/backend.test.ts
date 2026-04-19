import { strict as assert } from "node:assert";
import { afterEach, beforeEach, describe, it } from "node:test";
import { resolveBackendUrl, voiceDevStubEnabled } from "../src/lib/backend.js";

describe("resolveBackendUrl", () => {
	let prevEnv: string | undefined;
	beforeEach(() => {
		prevEnv = process.env.CLARA_BACKEND_URL;
		delete process.env.CLARA_BACKEND_URL;
	});
	afterEach(() => {
		if (prevEnv === undefined) delete process.env.CLARA_BACKEND_URL;
		else process.env.CLARA_BACKEND_URL = prevEnv;
	});

	it("prefers the --backend flag over everything else", () => {
		process.env.CLARA_BACKEND_URL = "http://env.example";
		const r = resolveBackendUrl("http://flag.example/");
		assert.equal(r.url, "http://flag.example");
		assert.equal(r.source, "flag");
	});

	it("falls back to CLARA_BACKEND_URL", () => {
		process.env.CLARA_BACKEND_URL = "http://env.example/";
		const r = resolveBackendUrl();
		assert.equal(r.url, "http://env.example");
		assert.equal(r.source, "env");
	});

	it("falls back to config/default when no flag or env", () => {
		const r = resolveBackendUrl();
		assert.ok(r.source === "config" || r.source === "default");
		assert.ok(r.url.length > 0);
		assert.ok(!r.url.endsWith("/"));
	});
});

describe("voiceDevStubEnabled", () => {
	let prev: string | undefined;
	beforeEach(() => {
		prev = process.env.CLARA_VOICE_DEV_STUB;
	});
	afterEach(() => {
		if (prev === undefined) delete process.env.CLARA_VOICE_DEV_STUB;
		else process.env.CLARA_VOICE_DEV_STUB = prev;
	});

	it('returns true for "1" or "true"', () => {
		process.env.CLARA_VOICE_DEV_STUB = "1";
		assert.equal(voiceDevStubEnabled(), true);
		process.env.CLARA_VOICE_DEV_STUB = "true";
		assert.equal(voiceDevStubEnabled(), true);
	});

	it("returns false otherwise", () => {
		delete process.env.CLARA_VOICE_DEV_STUB;
		assert.equal(voiceDevStubEnabled(), false);
		process.env.CLARA_VOICE_DEV_STUB = "yes";
		assert.equal(voiceDevStubEnabled(), false);
	});
});
