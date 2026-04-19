import type { TalentManifest } from "./types";

/**
 * Define and validate a Talent manifest at build time.
 *
 * This is a no-op at runtime — it exists purely for TypeScript validation
 * and to make manifest declarations readable and self-documenting.
 *
 * @example
 * export const manifest = defineTalent({
 *   name: "github-prs",
 *   displayName: "GitHub Pull Requests",
 *   description: "Manage your GitHub pull requests by voice.",
 *   category: "developer-tools",
 *   voiceCommands: [
 *     {
 *       pattern: "show my pull requests",
 *       description: "List open pull requests",
 *       examples: ["show my pull requests", "show my open PRs"],
 *     },
 *   ],
 *   pricingType: "free",
 * });
 */
export function defineTalent(manifest: TalentManifest): TalentManifest {
	// Build-time validation
	if (!manifest.name || !/^[a-z0-9-]+$/.test(manifest.name)) {
		throw new Error(`Talent name "${manifest.name}" is invalid. Use lowercase letters, numbers, and hyphens only.`);
	}
	if (!manifest.voiceCommands || manifest.voiceCommands.length === 0) {
		throw new Error("A Talent must declare at least one voice command.");
	}
	if (manifest.pricingType === "paid" && !manifest.priceMonthly) {
		throw new Error("Paid Talents must specify priceMonthly.");
	}
	if (manifest.description && manifest.description.length > 160) {
		throw new Error("Talent description must be 160 characters or fewer.");
	}
	return manifest;
}
