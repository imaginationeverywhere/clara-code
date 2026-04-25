/**
 * Subscription tier ordering for product gates. Maps loose API tier strings
 * (from Clerk / API keys) onto a single `PlanTier` order.
 * Full PLAN_LIMITS table lives in prompt-11; this is the shared comparator for MCP, etc.
 */

export type PlanTier = "free" | "basic" | "pro" | "max" | "business" | "enterprise";

export const TIER_ORDER: Record<PlanTier, number> = {
	free: 0,
	basic: 1,
	pro: 2,
	max: 3,
	business: 4,
	enterprise: 5,
};

const ALIASES: Record<string, PlanTier> = {
	free: "free",
	basic: "basic",
	starter: "basic",
	pro: "pro",
	max: "max",
	ultimate: "max",
	business: "business",
	team: "business",
	enterprise: "enterprise",
};

/**
 * Coerce a subscription or API key tier string into a `PlanTier`.
 * Unknown values map to `free` so feature gates default closed when unsure.
 */
export function toPlanTier(raw: string | undefined | null): PlanTier {
	if (raw == null || raw.length === 0) {
		return "free";
	}
	const n = raw.toLowerCase().trim();
	return ALIASES[n] ?? (n in TIER_ORDER ? (n as PlanTier) : "free");
}

export function tierGte(tier: PlanTier, min: PlanTier): boolean {
	return TIER_ORDER[tier] >= TIER_ORDER[min];
}

/** Runtime (customer-facing) agents require Business or Enterprise — maps to "Small Business" in product copy. */
export function tierCanBuildRuntimeAgents(tier: PlanTier): boolean {
	return tier === "business" || tier === "enterprise";
}
