import { defineTalent } from "../src/define";

describe("defineTalent", () => {
	const validManifest = {
		name: "github-prs",
		displayName: "GitHub Pull Requests",
		description: "Manage PRs by voice.",
		category: "developer-tools" as const,
		voiceCommands: [
			{
				pattern: "show my pull requests",
				description: "List open PRs",
				examples: ["show my PRs"],
			},
		],
		pricingType: "free" as const,
	};

	it("returns manifest unchanged for valid input", () => {
		expect(defineTalent(validManifest)).toEqual(validManifest);
	});

	it("throws for invalid name (uppercase)", () => {
		expect(() => defineTalent({ ...validManifest, name: "GitHub-PRs" })).toThrow("invalid");
	});

	it("throws for empty voiceCommands", () => {
		expect(() => defineTalent({ ...validManifest, voiceCommands: [] })).toThrow("voice command");
	});

	it("throws for paid talent without priceMonthly", () => {
		expect(() => defineTalent({ ...validManifest, pricingType: "paid" })).toThrow("priceMonthly");
	});

	it("throws for description over 160 chars", () => {
		expect(() => defineTalent({ ...validManifest, description: "x".repeat(161) })).toThrow("160 characters");
	});
});
