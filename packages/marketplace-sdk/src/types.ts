/**
 * Clara Marketplace SDK — Type Definitions
 *
 * These types define the shape of a Talent manifest submitted to
 * the Clara Talent Agency. All voice commands are reviewed before
 * a Talent is approved and listed.
 */

export type TalentCategory = "productivity" | "data" | "communication" | "developer-tools" | "other";

/**
 * A voice command pattern that this Talent handles.
 *
 * @example
 * {
 *   pattern: "show my {resource}",
 *   description: "Display a list of the user's resources",
 *   examples: ["show my pull requests", "show my open issues"]
 * }
 */
export interface VoiceCommandPattern {
	/** Pattern string. Use {variable} for user-supplied values. */
	pattern: string;
	/** Short description of what this command does. */
	description: string;
	/** 2-4 concrete example phrases. */
	examples: string[];
}

/**
 * The manifest that defines a Talent on the Clara Talent Agency.
 *
 * Pass this to `defineTalent()` to get build-time validation.
 */
export interface TalentManifest {
	/** Unique slug. Lowercase, hyphens only. e.g. "github-prs" */
	name: string;
	/** Human-readable display name. e.g. "GitHub Pull Requests" */
	displayName: string;
	/** Short description shown in the Talent marketplace. 160 chars max. */
	description: string;
	/** Category for marketplace browsing. */
	category: TalentCategory;
	/** Voice commands this Talent handles. At least one required. */
	voiceCommands: VoiceCommandPattern[];
	/** Whether this Talent is free or paid. */
	pricingType: "free" | "paid";
	/** Monthly price in USD. Required when pricingType is "paid". */
	priceMonthly?: number;
}

/**
 * Context passed by Clara's gateway to your subgraph on each request.
 * Delivered via HTTP headers — parse with `parseClaraContext()`.
 */
export interface ClaraRequestContext {
	/** Scoped, non-reversible identifier for this subscriber session. NOT the user's real ID. */
	sessionToken: string;
	/** The voice command phrase that triggered this Talent. */
	voiceCommand: string;
	/** ISO 8601 timestamp of the request. */
	requestedAt: string;
}
