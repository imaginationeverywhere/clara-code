/**
 * When a user upgrades, default agent *roles* for their first slots.
 * Provisioning of SOUL.md is lazy (first use) — this is a manifest only.
 */
export const DEFAULT_AGENT_BUNDLES: Record<string, string[]> = {
	basic: ["frontend-engineer", "backend-engineer", "devops-engineer"],
	pro: ["frontend-engineer", "backend-engineer", "devops-engineer", "mobile-engineer", "qa-engineer", "researcher"],
	max: [
		"frontend-engineer",
		"backend-engineer",
		"devops-engineer",
		"mobile-engineer",
		"qa-engineer",
		"researcher",
		"ai-integrations-engineer",
		"security-engineer",
		"analytics-engineer",
	],
	// business and enterprise: user configures
};
