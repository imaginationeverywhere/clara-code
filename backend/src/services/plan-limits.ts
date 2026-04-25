/**
 * Subscription tier ordering and plan limits. Maps loose API tier strings
 * (Clerk, API keys) to `PlanTier` and exposes canonical `PLAN_LIMITS` (prompt 11).
 */

export type PlanTier = "free" | "basic" | "pro" | "max" | "business" | "enterprise";

export type MarketplaceTier = "none" | "list" | "publish" | "publish_white_label";
export type MemoryScope = "personal_vault" | "team_vault" | "federated";

export interface PlanConfig {
	price: number;
	/** null = custom / unlimited (Enterprise) */
	configurableAgents: number | null;
	/** null = unlimited skills per agent */
	skillsPerAgent: number | null;
	canBuildAgents: boolean;
	runtimeAgentBuildsPerMonth: number | null;
	marketplaceTier: MarketplaceTier;
	memoryScope: MemoryScope;
	/** null = no auto-freeze (Enterprise) */
	monthlyCogsHardCap: number | null;
}

export const PLAN_LIMITS: Record<PlanTier, PlanConfig> = {
	free: {
		price: 0,
		configurableAgents: 1,
		skillsPerAgent: 3,
		canBuildAgents: false,
		runtimeAgentBuildsPerMonth: 0,
		marketplaceTier: "none",
		memoryScope: "personal_vault",
		monthlyCogsHardCap: 20,
	},
	basic: {
		price: 39,
		configurableAgents: 1,
		skillsPerAgent: 5,
		canBuildAgents: false,
		runtimeAgentBuildsPerMonth: 0,
		marketplaceTier: "none",
		memoryScope: "personal_vault",
		monthlyCogsHardCap: 30,
	},
	pro: {
		price: 69,
		configurableAgents: 3,
		skillsPerAgent: 7,
		canBuildAgents: false,
		runtimeAgentBuildsPerMonth: 0,
		marketplaceTier: "none",
		memoryScope: "personal_vault",
		monthlyCogsHardCap: 50,
	},
	max: {
		price: 99,
		configurableAgents: 6,
		skillsPerAgent: 10,
		canBuildAgents: false,
		runtimeAgentBuildsPerMonth: 0,
		marketplaceTier: "list",
		memoryScope: "personal_vault",
		monthlyCogsHardCap: 75,
	},
	business: {
		price: 299,
		configurableAgents: 12,
		skillsPerAgent: 15,
		canBuildAgents: true,
		runtimeAgentBuildsPerMonth: null,
		marketplaceTier: "publish",
		memoryScope: "team_vault",
		monthlyCogsHardCap: 250,
	},
	enterprise: {
		price: 4000,
		configurableAgents: null,
		skillsPerAgent: null,
		canBuildAgents: true,
		runtimeAgentBuildsPerMonth: null,
		marketplaceTier: "publish_white_label",
		memoryScope: "federated",
		monthlyCogsHardCap: null,
	},
};

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

export const UNIVERSAL_INCLUSIONS = {
	unlimitedUsage: true,
	premiumVoice: true,
	customVoiceCloning: true,
	aiThinkingQuality: "best" as const,
} as const;

/** Per-minute request ceiling (all tiers) — anti-bot, not a product cap. */
export const RATE_LIMIT_PER_MINUTE = 120;

/** Excessive “active” hours in a month → support review; does not block. */
export const REVIEW_TRIGGER_HOURS = 300;

export function toPlanTier(raw: string | undefined | null): PlanTier {
	if (raw == null || raw.length === 0) {
		return "free";
	}
	const n = raw.toLowerCase().trim();
	const fromAlias = ALIASES[n];
	if (fromAlias) {
		return fromAlias;
	}
	if (n in TIER_ORDER) {
		return n as PlanTier;
	}
	return "free";
}

export function tierGte(tier: PlanTier, min: PlanTier): boolean {
	return TIER_ORDER[tier] >= TIER_ORDER[min];
}

export function tierCanBuildRuntimeAgents(tier: PlanTier): boolean {
	return tier === "business" || tier === "enterprise";
}
