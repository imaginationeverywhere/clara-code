import { verifyClaraServiceToken } from "@claracode/marketplace-sdk";

export const resolvers = {
	Query: {
		authStatus: () => ({
			gatewayVerified: true,
			timestamp: new Date().toISOString(),
		}),

		verifyToken: (_parent: unknown, args: { token: string }) => {
			const valid = verifyClaraServiceToken(args.token);
			return {
				valid,
				message: valid ? "Token is valid" : "Token verification failed",
			};
		},
	},
};
