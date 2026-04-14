import { defineTalent } from "@claracode/marketplace-sdk";

export const manifest = defineTalent({
	name: "clerk-auth",
	displayName: "Clerk Auth",
	description: "Add Clerk authentication to your Talent subgraph in minutes.",
	category: "developer-tools",
	voiceCommands: [
		{
			pattern: "check my auth status",
			description: "Verify your authentication is working correctly",
			examples: ["check my auth status", "am I authenticated"],
		},
	],
	pricingType: "free",
});
