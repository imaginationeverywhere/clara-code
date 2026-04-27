import { sequelize } from "@/config/database";
import { pricingUrl } from "@/config/models";
import { OperationCredits } from "@/models/OperationCredits";
import { CREDIT_BUDGETS, OPERATION_WEIGHTS, type OperationCategory } from "@/services/operation-weights";
import { PLAN_LIMITS, type PlanTier } from "@/services/plan-limits";
import { logger } from "@/utils/logger";

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

function budgetFor(tier: PlanTier): number | null {
	const b = CREDIT_BUDGETS[tier];
	if (b === null) {
		return null;
	}
	return b;
}

/**
 * Read-only preflight for UX. Does not prevent races; use {@link reserveOperationCredits} before work.
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
		return { allowed: false, creditsRemaining: 0, upgradeUrl: pricingUrl() };
	}
	const cap = budgetFor(planTier);
	if (cap === 0) {
		return { allowed: false, creditsRemaining: 0, upgradeUrl: pricingUrl() };
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
		return { allowed: false, creditsRemaining: cap - used, upgradeUrl: pricingUrl() };
	}
	return { allowed: true, creditsRemaining: cap - used - weight };
}

export type ReserveCreditsResult =
	| { ok: true; didReserve: boolean }
	| { ok: false; creditsRemaining: number | null; upgradeUrl: string };

/**
 * Locks the monthly row and reserves credits if under cap (single check+apply, no inter-call TOCTOU).
 * Call `refundOperationCredits` with the same category if the request does not complete successfully and `didReserve` is true.
 */
export async function reserveOperationCredits(
	userId: string,
	agentId: string,
	planTier: PlanTier,
	category: OperationCategory,
): Promise<ReserveCreditsResult> {
	const weight = OPERATION_WEIGHTS[category];
	if (weight <= 1) {
		return { ok: true, didReserve: false };
	}
	if (category === "agent_build" && !PLAN_LIMITS[planTier].canBuildAgents) {
		return { ok: false, creditsRemaining: 0, upgradeUrl: pricingUrl() };
	}
	const cap = budgetFor(planTier);
	if (cap === 0) {
		return { ok: false, creditsRemaining: 0, upgradeUrl: pricingUrl() };
	}

	return sequelize.transaction(async (t) => {
		const billingMonth = billingMonthKey();
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
		const [row] = await OperationCredits.findOrCreate({
			where: { userId, agentId, billingMonth },
			defaults,
			transaction: t,
			lock: t.LOCK.UPDATE,
		});
		if (cap !== null && row.creditsUsed + weight > cap) {
			return { ok: false, creditsRemaining: cap - row.creditsUsed, upgradeUrl: pricingUrl() };
		}
		const countField = categoryCountField(category);
		await row.increment("creditsUsed", { by: weight, transaction: t });
		if (countField) {
			await row.increment(countField, { by: 1, transaction: t });
		}
		return { ok: true, didReserve: true };
	});
}

export async function refundOperationCredits(
	userId: string,
	agentId: string,
	_planTier: PlanTier,
	category: OperationCategory,
): Promise<void> {
	const weight = OPERATION_WEIGHTS[category];
	if (weight <= 1) {
		return;
	}
	const countField = categoryCountField(category);
	const billingMonth = billingMonthKey();
	try {
		await sequelize.transaction(async (t) => {
			const row = await OperationCredits.findOne({
				where: { userId, agentId, billingMonth },
				transaction: t,
				lock: t.LOCK.UPDATE,
			});
			if (!row) {
				return;
			}
			await row.decrement("creditsUsed", { by: weight, transaction: t });
			if (countField) {
				await row.decrement(countField, { by: 1, transaction: t });
			}
		});
	} catch (e) {
		logger.error("[operation-credits] refund failed", e);
	}
}

/**
 * @deprecated use {@link reserveOperationCredits} after work removed double-check gap
 */
export async function commitOperationCreditUsage(
	userId: string,
	agentId: string,
	planTier: PlanTier,
	category: OperationCategory,
): Promise<boolean> {
	const r = await reserveOperationCredits(userId, agentId, planTier, category);
	return r.ok;
}

/**
 * @deprecated
 */
export async function applyOperationCreditUsage(
	userId: string,
	agentId: string,
	planTier: PlanTier,
	category: OperationCategory,
): Promise<void> {
	await commitOperationCreditUsage(userId, agentId, planTier, category);
}

export const operationCreditService = {
	canUse: canUseOperationCredits,
	reserve: reserveOperationCredits,
	refund: refundOperationCredits,
	apply: applyOperationCreditUsage,
	commit: commitOperationCreditUsage,
	billingMonthKey,
};
