import { defineTalent } from "@claracode/marketplace-sdk";

export const manifest = defineTalent({
	name: "gateway-connect",
	displayName: "Gateway Connect",
	description: "Baseline federation health and session info for Clara agents.",
	category: "developer-tools",
	voiceCommands: [
		{
			pattern: "check clara status",
			description: "Check your Clara connection and session status",
			examples: ["check clara status", "is clara connected"],
		},
	],
	pricingType: "free",
});
