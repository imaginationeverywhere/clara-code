import { OperationCredits } from "@/models/OperationCredits";
import { CREDIT_BUDGETS, OPERATION_WEIGHTS, type OperationCategory } from "@/services/operation-weights";
import { PLAN_LIMITS, type PlanTier } from "@/services/plan-limits";
import { logger } from "@/utils/logger";

const PRICING_URL = "https://claracode.ai/pricing";

function billingMonthKey(date = new Date()): string {
	return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

function categoryCountField(
	category: OperationCategory,
): "mediumOps" | "heavyOps" | "criticalOps" | "agentBuilds" | null {
	if (category === "medium") return "mediumOps";
	if (category === "heavy") return "heavyOps";
	if (category === "critical") return "criticalOps";
	if (category === "agent_build") return "agentBuilds";
	return null;
}

export type CreditGateResult = {
	allowed: boolean;
	creditsRemaining: number | null;
	upgradeUrl?: string;
};

/**
 * @returns `null` = Custom (Enterprise / Business no-cap); positive = monthly cap.
 */
function budgetFor(tier: PlanTier): number | null {
	const b = CREDIT_BUDGETS[tier];
	if (b === null) {
		return null;
	}
	return b;
}

/**
 * Check whether a weighted operation is allowed (no side effects; no DB for passive/light).
 */
export async function canUseOperationCredits(
	userId: string,
	agentId: string,
	planTier: PlanTier,
	category: OperationCategory,
): Promise<CreditGateResult> {
	const weight = OPERATION_WEIGHTS[category];
	if (weight <= 1) {
		return { allowed: true, creditsRemaining: null };
	}

	if (category === "agent_build" && !PLAN_LIMITS[planTier].canBuildAgents) {
		return { allowed: false, creditsRemaining: 0, upgradeUrl: PRICING_URL };
	}

	const cap = budgetFor(planTier);
	if (cap === 0) {
		return { allowed: false, creditsRemaining: 0, upgradeUrl: PRICING_URL };
	}

	const billingMonth = billingMonthKey();
	const row = await OperationCredits.findOne({
		where: { userId, agentId, billingMonth },
	});
	const used = row?.creditsUsed ?? 0;

	if (cap === null) {
		return { allowed: true, creditsRemaining: null };
	}

	if (used + weight > cap) {
		return { allowed: false, creditsRemaining: cap - used, upgradeUrl: PRICING_URL };
	}

	return { allowed: true, creditsRemaining: cap - used - weight };
}

/**
 * Record weighted usage after a successful request. Skips weight 0/1. Idempotent
 * for callers: only call after the operation completes.
 */
export async function applyOperationCreditUsage(
	userId: string,
	agentId: string,
	planTier: PlanTier,
	category: OperationCategory,
): Promise<void> {
	const weight = OPERATION_WEIGHTS[category];
	if (weight <= 1) {
		return;
	}
	if (category === "agent_build" && !PLAN_LIMITS[planTier].canBuildAgents) {
		return;
	}
	const cap = budgetFor(planTier);
	if (cap === 0) {
		return;
	}

	const billingMonth = billingMonthKey();
	const countField = categoryCountField(category);
	const defaults = {
		userId,
		agentId,
		billingMonth,
		creditsUsed: 0,
		mediumOps: 0,
		heavyOps: 0,
		criticalOps: 0,
		agentBuilds: 0,
	};

	try {
		const [row] = await OperationCredits.findOrCreate({
			where: { userId, agentId, billingMonth },
			defaults,
		});
		await row.increment("creditsUsed", { by: weight });
		if (countField) {
			await row.increment(countField, { by: 1 });
		}
	} catch (err) {
		logger.error("[operation-credits] apply failed", err);
	}
}

export const operationCreditService = {
	canUse: canUseOperationCredits,
	apply: applyOperationCreditUsage,
	billingMonthKey,
};
