import { strict as assert } from "node:assert/strict";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { defaultCacheDirectory, readGreetingFromCache, writeGreetingToCache } from "../src/greeting-cache.js";

const testDir = join(tmpdir(), `clara-cache-test-${Date.now()}`);
process.env.XDG_CACHE_HOME = testDir;

void test("readGreetingFromCache returns null when cache directory is missing", async () => {
	await rm(testDir, { recursive: true, force: true });
	const result = await readGreetingFromCache();
	assert.equal(result, null);
});

void test("writeGreetingToCache + readGreetingFromCache roundtrip", async () => {
	await rm(testDir, { recursive: true, force: true });

	const bytes = Buffer.from("fake-audio-bytes");
	const contentType = "audio/mpeg";
	await writeGreetingToCache({ bytes, contentType });

	const result = await readGreetingFromCache();
	assert.ok(result !== null);
	assert.deepEqual(result!.bytes, bytes);
	assert.equal(result!.contentType, contentType);
});

void test("readGreetingFromCache returns null when data file is empty", async () => {
	await rm(testDir, { recursive: true, force: true });
	await mkdir(join(testDir, "clara-code"), { recursive: true });
	await writeFile(join(testDir, "clara-code", "greeting-canonical"), Buffer.alloc(0));

	const result = await readGreetingFromCache();
	assert.equal(result, null);
});

void test("readGreetingFromCache uses application/octet-stream when mime file is missing", async () => {
	await rm(testDir, { recursive: true, force: true });
	await mkdir(join(testDir, "clara-code"), { recursive: true });
	await writeFile(join(testDir, "clara-code", "greeting-canonical"), Buffer.from("audio"));

	const result = await readGreetingFromCache();
	assert.ok(result !== null);
	assert.equal(result!.contentType, "application/octet-stream");
});

void test("defaultCacheDirectory uses XDG_CACHE_HOME when set", () => {
	const dir = defaultCacheDirectory();
	assert.ok(dir.startsWith(testDir), `Expected dir to start with ${testDir}, got ${dir}`);
});
