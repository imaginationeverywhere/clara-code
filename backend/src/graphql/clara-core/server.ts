import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { buildSubgraphSchema } from "@apollo/subgraph";

import type { ClaraCoreContext } from "@/graphql/clara-core/context";
import type { ApiKeyRequest } from "@/middleware/api-key-auth";
import { resolvers } from "./resolvers";
import { typeDefs } from "./schema";

export async function createClaraCoreSubgraph() {
	const server = new ApolloServer({
		schema: buildSubgraphSchema({ typeDefs, resolvers: resolvers as never }),
		introspection: true,
	});
	await server.start();

	return expressMiddleware(server, {
		context: async ({ req }): Promise<ClaraCoreContext> => {
			const u = (req as ApiKeyRequest).claraUser;
			if (!u) {
				throw new Error("Clara Core GraphQL requires API key authentication");
			}
			return {
				user: u,
				authorization: typeof req.headers.authorization === "string" ? req.headers.authorization : undefined,
			};
		},
	});
}
