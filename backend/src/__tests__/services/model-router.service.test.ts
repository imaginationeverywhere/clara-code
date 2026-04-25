import { ModelRouterService, type RoutingContext } from "@/services/model-router.service";

const router = new ModelRouterService();

function baseCtx(over: Partial<RoutingContext>): RoutingContext {
	return {
		userId: "u1",
		tier: "basic",
		taskType: "code_gen",
		inputTokenEstimate: 1_000,
		userHasDeepestPlugin: false,
		explicitPremiumRequest: false,
		...over,
	};
}

describe("ModelRouterService", () => {
	describe("selectModel", () => {
		it("returns user_deepest when userHasDeepestPlugin", () => {
			expect(router.selectModel(baseCtx({ userHasDeepestPlugin: true }))).toBe("user_deepest");
		});
		it("returns bedrock_premium when explicitPremiumRequest", () => {
			expect(router.selectModel(baseCtx({ explicitPremiumRequest: true }))).toBe("bedrock_premium");
		});
		it("routes enterprise reasoning to bedrock_premium", () => {
			expect(router.selectModel(baseCtx({ tier: "enterprise", taskType: "reasoning" }))).toBe("bedrock_premium");
		});
		it("routes enterprise code_gen to deepseek_v3", () => {
			expect(router.selectModel(baseCtx({ tier: "enterprise", taskType: "code_gen" }))).toBe("deepseek_v3");
		});
		it("routes long reasoning to deepseek_v3", () => {
			expect(router.selectModel(baseCtx({ taskType: "reasoning", inputTokenEstimate: 30_000 }))).toBe("deepseek_v3");
		});
		it("routes short reasoning to kimi_k2", () => {
			expect(router.selectModel(baseCtx({ taskType: "reasoning", inputTokenEstimate: 1_000 }))).toBe("kimi_k2");
		});
		it("routes agent_build to kimi_k2", () => {
			expect(router.selectModel(baseCtx({ taskType: "agent_build" }))).toBe("kimi_k2");
		});
		it("routes voice_convo to gemma_27b", () => {
			expect(router.selectModel(baseCtx({ taskType: "voice_convo" }))).toBe("gemma_27b");
		});
	});
	describe("selectFallback", () => {
		it("gemma to kimi to deepseek to premium", () => {
			expect(router.selectFallback(baseCtx({}), "gemma_27b")).toBe("kimi_k2");
			expect(router.selectFallback(baseCtx({}), "kimi_k2")).toBe("deepseek_v3");
			expect(router.selectFallback(baseCtx({}), "deepseek_v3")).toBe("bedrock_premium");
		});
		it("returns null for premium", () => {
			expect(router.selectFallback(baseCtx({}), "bedrock_premium")).toBeNull();
		});
		it("user_deepest falls back to gemma_27b", () => {
			expect(router.selectFallback(baseCtx({}), "user_deepest")).toBe("gemma_27b");
		});
	});
});
