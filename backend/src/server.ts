import "./load-env";
import "reflect-metadata";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { clerkMiddleware, getAuth } from "@clerk/express";
import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { testConnection } from "@/config/database";
import {
	createDeveloperProgramRouter,
	createTalentAdminRouter,
	createTalentRegistryRouter,
	getTalentRegistryService,
} from "@/features/talent-registry";
import { createClaraCoreSubgraph } from "@/graphql/clara-core/server";
import type { GraphQLContext } from "@/graphql/resolvers/index";
import { resolvers } from "@/graphql/resolvers/index";
import { typeDefs } from "@/graphql/schema/index";
import { requireApiKey } from "@/middleware/api-key-auth";
import { withAuth } from "@/middleware/clerk-auth";
import apiRoutes from "@/routes/index";
import { clerkWebhookHandler } from "@/routes/webhooks-clerk";
import { stripeWebhookHandler } from "@/routes/webhooks-stripe";
import { logger } from "@/utils/logger";

export const app = express();
const PORT = process.env.PORT || 3001;

const talentRegistryService = getTalentRegistryService();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());

const rawOrigins = process.env.FRONTEND_URL || "";
const allowedOrigins = rawOrigins
	.split(",")
	.map((o) => o.trim())
	.filter(Boolean);

if (allowedOrigins.length === 0) {
	logger.warn("FRONTEND_URL not set — defaulting CORS to claracode.com origins");
	allowedOrigins.push("https://claracode.com", "https://www.claracode.com", "https://develop.claracode.com");
}

app.use(cors({ origin: allowedOrigins, credentials: true }));

app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), (req, res): void => {
	void stripeWebhookHandler(req, res);
});

app.post("/api/webhooks/clerk", express.raw({ type: "application/json" }), (req, res): void => {
	void clerkWebhookHandler(req, res);
});

app.use(express.json({ limit: "10mb" }));

app.use("/api/talents", createTalentRegistryRouter(talentRegistryService));
app.use("/api/admin/talents", createTalentAdminRouter(talentRegistryService));
app.use("/api/developer-program", createDeveloperProgramRouter(talentRegistryService));

// Health check MUST be before Clerk middleware — ECS health probes cannot carry auth tokens
app.get("/health", async (_req, res) => {
	try {
		const dbOk = await testConnection({ silent: true });
		res.json({ status: "ok", db: dbOk ? "connected" : "error", service: "clara-code-backend" });
	} catch {
		res.status(503).json({ status: "error", db: "unreachable", service: "clara-code-backend" });
	}
});

if (process.env.CLERK_SECRET_KEY) {
	app.use(
		clerkMiddleware({
			secretKey: process.env.CLERK_SECRET_KEY,
			...(process.env.CLERK_PUBLISHABLE_KEY ? { publishableKey: process.env.CLERK_PUBLISHABLE_KEY } : {}),
		}),
	);
} else {
	logger.warn("CLERK_SECRET_KEY not set — Clerk auth middleware disabled");
}

app.use(withAuth);

app.use("/api", apiRoutes);

const server = new ApolloServer({ typeDefs, resolvers });

export async function bootstrap(): Promise<void> {
	const claraCoreMiddleware = await createClaraCoreSubgraph();
	app.use("/graphql/clara-core", requireApiKey, claraCoreMiddleware);

	await server.start();

	app.use(
		"/graphql",
		expressMiddleware(server, {
			context: async ({ req }): Promise<GraphQLContext> => {
				const auth = getAuth(req);
				return {
					req,
					auth: { userId: auth.userId ?? null },
				};
			},
		}),
	);

	await testConnection();

	app.listen(PORT, () => {
		logger.info(`Clara Code backend running on port ${String(PORT)}`);
		logger.info(`GraphQL: http://localhost:${String(PORT)}/graphql`);
		logger.info(`Health:  http://localhost:${String(PORT)}/health`);
	});
}

if (process.env.NODE_ENV !== "test") {
	void bootstrap().catch((err: unknown) => {
		logger.error("Failed to start server:", err);
		process.exit(1);
	});
}
