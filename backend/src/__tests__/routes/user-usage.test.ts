import express from "express";
import request from "supertest";
import type { ApiKeyRequest } from "@/middleware/api-key-auth";

const mockClara = jest.fn((req: ApiKeyRequest, _res: unknown, next: () => void) => {
	req.claraUser = { userId: "u_usage", tier: "free" };
	next();
});

jest.mock("@/middleware/api-key-auth", () => ({
	requireClaraOrClerk: (req: ApiKeyRequest, res: unknown, next: () => void) => mockClara(req, res, next),
}));

jest.mock("@/middleware/abuse-protection", () => ({
	requireAbuseCheck: (_req: unknown, _res: unknown, next: () => void) => {
		next();
	},
}));

jest.mock("@/utils/logger", () => ({
	logger: { error: jest.fn() },
}));

import userUsageRoutes from "@/routes/user-usage";

const app = express();
app.use(express.json());
app.use("/api/user", userUsageRoutes);

describe("routes GET /api/user/usage", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockClara.mockImplementation((req: ApiKeyRequest, _res: unknown, next: () => void) => {
			req.claraUser = { userId: "u_usage", tier: "free" };
			next();
		});
	});

	it("returns unlimited usage (no product-facing caps)", async () => {
		const res = await request(app).get("/api/user/usage");
		expect(res.status).toBe(200);
		expect(res.body.tier).toBe("free");
		expect(res.body.unlimited_usage).toBe(true);
		expect(res.body.usage.unlimited).toBe(true);
	});

	it("returns 401 when claraUser has no userId", async () => {
		mockClara.mockImplementationOnce((req: ApiKeyRequest, _res: unknown, next: () => void) => {
			req.claraUser = { userId: undefined as unknown as string, tier: "free" };
			next();
		});
		const res = await request(app).get("/api/user/usage");
		expect(res.status).toBe(401);
		expect(res.body.error).toBe("Unauthorized");
	});
});
