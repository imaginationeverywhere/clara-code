import type { PlanTier } from "@/services/plan-limits";

export type OperationWeight = 0 | 1 | 3 | 5 | 10 | 20;

export type OperationCategory =
	| "passive" // weight 0 — never counted
	| "light" // weight 1 — never counted
	| "medium" // weight 3
	| "heavy" // weight 5
	| "critical" // weight 10
	| "agent_build"; // weight 20

export const OPERATION_WEIGHTS: Record<OperationCategory, OperationWeight> = {
	passive: 0,
	light: 1,
	medium: 3,
	heavy: 5,
	critical: 10,
	agent_build: 20,
};

/** Per-tier credit budget per billing month. `null` = Custom (Enterprise contract). */
export const CREDIT_BUDGETS: Record<PlanTier, number | null> = {
	basic: 500,
	pro: 1_500,
	max: 4_000,
	business: null,
	enterprise: null,
};

/**
 * Classify an operation by keyword/intent. Used by the voice converse route.
 */
export function classifyOperation(intent: string): OperationCategory {
	const lower = intent.toLowerCase();

	if (/\b(explain|describe|what is|what does|show me|list|log|status|read|help)\b/.test(lower)) {
		return "passive";
	}

	if (/\b(build.*(agent|soul)|create.*(agent|harness)|publish.*agent|new agent)\b/.test(lower)) {
		return "agent_build";
	}

	if (/\b(scaffold|full.*(app|application)|orchestrate|multi.?agent|entire)\b/.test(lower)) {
		return "critical";
	}

	if (/\b(research|audit|pipeline|devops|deploy|integrate|full.*(feature|flow|page))\b/.test(lower)) {
		return "heavy";
	}

	if (/\b(build|create|implement|write|generate|add|fix|refactor|migrate|setup)\b/.test(lower)) {
		return "medium";
	}

	return "light";
}
