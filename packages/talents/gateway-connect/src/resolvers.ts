import type { ClaraRequestContext } from "@claracode/marketplace-sdk";

type GatewayContext = { claraContext: ClaraRequestContext };

export const resolvers = {
	Query: {
		gatewayHealth: () => ({
			status: "ok",
			version: "1.0.0",
			timestamp: new Date().toISOString(),
		}),

		sessionInfo: (_parent: unknown, _args: unknown, ctx: unknown) => {
			const { claraContext } = ctx as GatewayContext;
			return {
				sessionToken: claraContext.sessionToken,
				voiceCommand: claraContext.voiceCommand,
				requestedAt: claraContext.requestedAt,
			};
		},
	},
};
