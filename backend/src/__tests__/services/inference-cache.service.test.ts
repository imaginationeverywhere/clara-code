import { _resetInMemoryRedisForTests } from "@/lib/redis";
import type { HermesResponse } from "@/services/hermes-client.service";
import { InferenceCache } from "@/services/inference-cache.service";

const old = process.env.ENABLE_INFERENCE_CACHE;

describe("InferenceCache", () => {
	beforeEach(() => {
		_resetInMemoryRedisForTests();
		delete process.env.CACHE_TTL_MINUTES;
		process.env.ENABLE_INFERENCE_CACHE = "1";
	});
	afterAll(() => {
		if (old === undefined) {
			delete process.env.ENABLE_INFERENCE_CACHE;
		} else {
			process.env.ENABLE_INFERENCE_CACHE = old;
		}
	});

	const sample: HermesResponse = {
		text: "x",
		modelUsed: "gemma_27b",
		inputTokens: 0,
		outputTokens: 0,
		modalComputeSeconds: 0,
		cacheHit: false,
		latencyMs: 1,
	};

	it("returns null on miss", async () => {
		const c = new InferenceCache();
		expect(await c.get("s", [], "m1")).toBeNull();
	});

	it("get returns cached payload", async () => {
		const c = new InferenceCache();
		await c.set("soul", [], "m1", sample);
		const g = await c.get("soul", [], "m1");
		expect(g?.text).toBe("x");
		expect(g?.modelUsed).toBe("gemma_27b");
	});

	it("different key for different user message", async () => {
		const c = new InferenceCache();
		const s2: HermesResponse = { ...sample, text: "b" };
		await c.set("s", [], "a", sample);
		await c.set("s", [], "b", s2);
		expect((await c.get("s", [], "a"))?.text).toBe("x");
		expect((await c.get("s", [], "b"))?.text).toBe("b");
	});

	it("disabled when ENABLE_INFERENCE_CACHE=0", async () => {
		process.env.ENABLE_INFERENCE_CACHE = "0";
		const c = new InferenceCache();
		await c.set("s", [], "z", sample);
		expect(await c.get("s", [], "z")).toBeNull();
	});
});
