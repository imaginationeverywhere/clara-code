import axios from "axios";
import { HermesClient } from "@/services/hermes-client.service";
import type { ModelChoice, RoutingContext } from "@/services/model-router.service";

jest.mock("@/utils/logger", () => ({ logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() } }));

const oldEnv = { ...process.env };
const ctx: RoutingContext = {
	userId: "u1",
	tier: "basic",
	taskType: "voice_convo",
	inputTokenEstimate: 100,
	userHasDeepestPlugin: false,
	explicitPremiumRequest: false,
};

describe("HermesClient", () => {
	const client = new HermesClient();
	let postSpy: jest.SpyInstance;

	beforeEach(() => {
		Object.assign(process.env, oldEnv);
		process.env.HERMES_GATEWAY_URL = "https://hermes.test";
		process.env.HERMES_API_KEY = "secret";
		postSpy = jest.spyOn(axios, "post");
	});
	afterEach(() => {
		postSpy?.mockRestore();
		jest.clearAllMocks();
	});
	afterAll(() => {
		Object.assign(process.env, oldEnv);
	});

	it("isConfigured when url and key set", () => {
		expect(client.isConfigured()).toBe(true);
	});

	it("POST /inference maps JSON fields to HermesResponse", async () => {
		postSpy.mockResolvedValue({
			data: {
				text: "hi",
				input_tokens: 1,
				output_tokens: 2,
				modal_compute_seconds: 0.1,
				cache_hit: false,
			},
		});
		const h = await client.inference({ model: "gemma_27b" as ModelChoice, prompt: "x" }, ctx);
		expect(h.modelUsed).toBe("gemma_27b");
		expect(h.text).toBe("hi");
		expect(h.inputTokens).toBe(1);
		const calledUrl = (postSpy.mock.calls[0]?.[0] as string) ?? "";
		expect(calledUrl).toBe("https://hermes.test/inference");
	});

	it("on 500 falls back to next model in chain", async () => {
		postSpy.mockRejectedValueOnce({ response: { status: 500 } }).mockResolvedValueOnce({
			data: {
				text: "ok",
				input_tokens: 0,
				output_tokens: 0,
				modal_compute_seconds: 0,
				cache_hit: false,
			},
		});
		const h = await client.inference({ model: "gemma_27b" as ModelChoice, prompt: "a" }, ctx);
		expect(h.modelUsed).toBe("kimi_k2");
	});

	it("426 no retry: throws", async () => {
		postSpy.mockRejectedValue({ response: { status: 400 } });
		await expect(client.inference({ model: "gemma_27b" as ModelChoice, prompt: "a" }, ctx)).rejects.toBeDefined();
	});
});
