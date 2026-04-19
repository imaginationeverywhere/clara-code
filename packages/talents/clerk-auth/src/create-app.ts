import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { parseClaraContext, verifyClaraServiceToken } from "@claracode/marketplace-sdk";
import express, { type Application } from "express";
import { GraphQLError } from "graphql";
import { json } from "body-parser";
import { resolvers } from "./resolvers";
import { typeDefs } from "./schema";

export async function createClerkAuthApp(): Promise<{
	app: Application;
	server: ApolloServer;
}> {
	const server = new ApolloServer({
		schema: buildSubgraphSchema({ typeDefs, resolvers }),
		introspection: true,
	});
	await server.start();

	const app = express();
	app.use(
		"/graphql",
		json(),
		expressMiddleware(server, {
			context: async ({ req }) => {
				const raw = req.headers["x-clara-service-token"];
				const token = Array.isArray(raw) ? raw[0] : raw;
				if (!verifyClaraServiceToken(token ?? "")) {
					throw new GraphQLError("Unauthorized: invalid Clara service token", {
						extensions: { code: "UNAUTHENTICATED" },
					});
				}
				return {
					claraContext: parseClaraContext(req.headers as Record<string, string | string[] | undefined>),
				};
			},
		}),
	);

	return { app, server };
}
