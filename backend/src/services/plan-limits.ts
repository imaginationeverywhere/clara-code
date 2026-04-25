/**
 * Subscription tier ordering and plan limits. Maps loose API tier strings
 * (Clerk, API keys) to `PlanTier` and exposes canonical `PLAN_LIMITS` (prompt 11).
 *
 * NOTE: There is no Free tier. The lowest paid tier is `basic` ($39). Defaults
 * fall through to `basic` only AFTER auth has been validated; unauthenticated
 * routes must 401 before this resolves.
 */

export type PlanTier = "basic" | "pro" | "max" | "business" | "enterprise";

export type MarketplaceTier = "none" | "list" | "publish" | "publish_white_label";
export type MemoryScope = "personal_vault" | "team_vault" | "federated";

export interface PlanConfig {
	price: number;
	/** null = Custom (Enterprise contract) */
	configurableAgents: number | null;
	/** null = no per-agent cap (Enterprise contract) */
	talentsPerAgent: number | null;
	canBuildAgents: boolean;
	runtimeAgentBuildsPerMonth: number | null;
	marketplaceTier: MarketplaceTier;
	memoryScope: MemoryScope;
	/** null = no auto-freeze (Enterprise contract) */
	monthlyCogsHardCap: number | null;
}

export const PLAN_LIMITS: Record<PlanTier, PlanConfig> = {
	basic: {
		price: 39,
		configurableAgents: 3,
		talentsPerAgent: 5,
		canBuildAgents: false,
		runtimeAgentBuildsPerMonth: 1,
		marketplaceTier: "none",
		memoryScope: "personal_vault",
		monthlyCogsHardCap: 30,
	},
	pro: {
		price: 69,
		configurableAgents: 6,
		talentsPerAgent: 7,
		canBuildAgents: false,
		runtimeAgentBuildsPerMonth: 3,
		marketplaceTier: "none",
		memoryScope: "personal_vault",
		monthlyCogsHardCap: 50,
	},
	max: {
		price: 99,
		configurableAgents: 9,
		talentsPerAgent: 10,
		canBuildAgents: false,
		runtimeAgentBuildsPerMonth: 6,
		marketplaceTier: "list",
		memoryScope: "personal_vault",
		monthlyCogsHardCap: 75,
	},
	business: {
		price: 299,
		configurableAgents: 24,
		talentsPerAgent: 15,
		canBuildAgents: true,
		runtimeAgentBuildsPerMonth: 12,
		marketplaceTier: "publish",
		memoryScope: "team_vault",
		monthlyCogsHardCap: 250,
	},
	enterprise: {
		price: 4000,
		configurableAgents: null,
		talentsPerAgent: null,
		canBuildAgents: true,
		runtimeAgentBuildsPerMonth: null,
		marketplaceTier: "publish_white_label",
		memoryScope: "federated",
		monthlyCogsHardCap: null,
	},
};

export const TIER_ORDER: Record<PlanTier, number> = {
	basic: 0,
	pro: 1,
	max: 2,
	business: 3,
	enterprise: 4,
};

const ALIASES: Record<string, PlanTier> = {
	basic: "basic",
	starter: "basic",
	pro: "pro",
	max: "max",
	ultimate: "max",
	business: "business",
	team: "business",
	enterprise: "enterprise",
};

export const UNIVERSAL_INCLUSIONS = {
	premiumVoice: true,
	customVoiceCloning: true,
	aiThinkingQuality: "best" as const,
} as const;

/** Per-minute request ceiling (all tiers) — anti-bot, not a product cap. */
export const RATE_LIMIT_PER_MINUTE = 120;

/** Excessive "active" hours in a month → support review; does not block. */
export const REVIEW_TRIGGER_HOURS = 300;

export function toPlanTier(raw: string | undefined | null): PlanTier {
	if (raw == null || raw.length === 0) {
		return "basic";
	}
	const n = raw.toLowerCase().trim();
	const fromAlias = ALIASES[n];
	if (fromAlias) {
		return fromAlias;
	}
	if (n in TIER_ORDER) {
		return n as PlanTier;
	}
	return "basic";
}

export function tierGte(tier: PlanTier, min: PlanTier): boolean {
	return TIER_ORDER[tier] >= TIER_ORDER[min];
}

export function tierCanBuildRuntimeAgents(tier: PlanTier): boolean {
	return tier === "business" || tier === "enterprise";
}
