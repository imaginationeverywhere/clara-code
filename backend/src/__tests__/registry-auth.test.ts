import express from "express";
import request from "supertest";

jest.mock("@clerk/express", () => ({
	requireAuth: () => (_req: unknown, _res: unknown, next: () => void) => {
		next();
	},
}));

const findOne = jest.fn();

jest.mock("@/models/Subscription", () => ({
	Subscription: {
		findOne: (...args: unknown[]) => findOne(...args),
	},
}));

jest.mock("@/utils/logger", () => ({
	logger: { error: jest.fn(), warn: jest.fn() },
}));

const fetchNpmTokenFromVerdaccio = jest.fn();
jest.mock("@/utils/registry-token", () => ({
	fetchNpmTokenFromVerdaccio: (...args: unknown[]) => fetchNpmTokenFromVerdaccio(...args),
}));

import type { AuthenticatedRequest, ClerkAuthResult } from "@/middleware/clerk-auth";
import registryAuthRoutes from "@/routes/registry-auth";

describe("POST /api/registry/token", () => {
	const app = express();
	app.use(express.json());
	app.use((req, _res, next) => {
		(req as AuthenticatedRequest).auth = () => Promise.resolve({ userId: "user_test" } as unknown as ClerkAuthResult);
		next();
	});
	app.use("/api/registry", registryAuthRoutes);

	beforeEach(() => {
		jest.clearAllMocks();
		process.env.FRONTEND_URL = "https://claracode.ai";
		process.env.REGISTRY_PUBLIC_URL = "http://localhost:4873";
		fetchNpmTokenFromVerdaccio.mockResolvedValue("npm-token-test");
	});

	it("returns token for pro user + sdk", async () => {
		findOne.mockResolvedValueOnce({ tier: "pro" });
		const res = await request(app).post("/api/registry/token").send({ package: "@claracode/sdk" });
		expect(res.status).toBe(200);
		expect(res.body.token).toBe("npm-token-test");
		expect(res.body.registry).toBe("http://localhost:4873");
	});

	it("returns 403 for basic user (registry requires pro)", async () => {
		findOne.mockResolvedValueOnce({ tier: "basic" });
		const res = await request(app).post("/api/registry/token").send({ package: "@claracode/sdk" });
		expect(res.status).toBe(403);
		expect(res.body.error).toBe("package_access_denied");
	});

	it("returns 401 when auth has no userId", async () => {
		const app401 = express();
		app401.use(express.json());
		app401.use((req, _res, next) => {
			(req as AuthenticatedRequest).auth = () => Promise.resolve({ userId: null } as unknown as ClerkAuthResult);
			next();
		});
		app401.use("/api/registry", registryAuthRoutes);
		const res = await request(app401).post("/api/registry/token").send({ package: "@claracode/sdk" });
		expect(res.status).toBe(401);
	});
});
