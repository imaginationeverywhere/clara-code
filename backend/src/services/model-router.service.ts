import type { PlanTier } from "./plan-limits";

export type ModelChoice = "user_deepest" | "gemma_27b" | "kimi_k2" | "deepseek_v3" | "bedrock_premium";

export type TaskType = "voice_convo" | "code_gen" | "code_review" | "reasoning" | "debug" | "research" | "agent_build";

export interface RoutingContext {
	userId: string;
	tier: PlanTier;
	taskType: TaskType;
	inputTokenEstimate: number;
	userHasDeepestPlugin: boolean;
	explicitPremiumRequest: boolean;
	priorModel?: ModelChoice;
}

export class ModelRouterService {
	/**
	 * Choose the cheapest sufficient model for this request.
	 * Used before Hermes /inference calls.
	 */
	selectModel(ctx: RoutingContext): ModelChoice {
		if (ctx.userHasDeepestPlugin) {
			return "user_deepest";
		}

		if (ctx.explicitPremiumRequest) {
			return "bedrock_premium";
		}
		if (ctx.tier === "enterprise") {
			return ctx.taskType === "reasoning" || ctx.taskType === "debug" ? "bedrock_premium" : "deepseek_v3";
		}

		if (ctx.taskType === "reasoning" || ctx.taskType === "research" || ctx.taskType === "debug") {
			return ctx.inputTokenEstimate > 20_000 ? "deepseek_v3" : "kimi_k2";
		}

		if (ctx.taskType === "agent_build") {
			return "kimi_k2";
		}
		if (ctx.taskType === "voice_convo") {
			return "gemma_27b";
		}
		return "gemma_27b";
	}

	/**
	 * On primary model failure, pick the next model in the chain.
	 * User-visible failure only if the chain is exhausted.
	 */
	selectFallback(_ctx: RoutingContext, failed: ModelChoice): ModelChoice | null {
		if (failed === "user_deepest") {
			return "gemma_27b";
		}
		const chain: ModelChoice[] = ["gemma_27b", "kimi_k2", "deepseek_v3", "bedrock_premium"];
		const failedIdx = chain.indexOf(failed);
		if (failedIdx === -1 || failedIdx === chain.length - 1) {
			return null;
		}
		return chain[failedIdx + 1] ?? null;
	}
}

export const modelRouter = new ModelRouterService();
