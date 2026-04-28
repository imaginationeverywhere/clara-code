import express from "express";
import request from "supertest";
import type { ApiKeyRequest } from "@/middleware/api-key-auth";

const mockClara = jest.fn((req: ApiKeyRequest, _res: unknown, next: () => void) => {
	req.claraUser = { userId: "u_v1", tier: "pro" };
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

jest.mock("@/models/Subscription", () => ({
	Subscription: {
		findOne: jest.fn(),
	},
}));

import { Subscription } from "@/models/Subscription";
import v1Routes from "@/routes/v1";

const app = express();
app.use(express.json());
app.use("/api/v1", v1Routes);

describe("routes GET /api/v1/tier-status", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockClara.mockImplementation((req: ApiKeyRequest, _res: unknown, next: () => void) => {
			req.claraUser = { userId: "u_v1", tier: "pro" };
			next();
		});
		jest.mocked(Subscription.findOne).mockResolvedValue({
			currentPeriodEnd: new Date("2026-05-01T00:00:00.000Z"),
		} as never);
	});

	it("returns tier, null minutes_remaining, and billing_cycle_end when subscription exists", async () => {
		const res = await request(app).get("/api/v1/tier-status");
		expect(res.status).toBe(200);
		expect(res.body.tier).toBe("pro");
		expect(res.body.minutes_remaining).toBeNull();
		expect(res.body.billing_cycle_end).toBe("2026-05-01T00:00:00.000Z");
	});

	it("returns null billing_cycle_end when no subscription row", async () => {
		jest.mocked(Subscription.findOne).mockResolvedValueOnce(null);
		const res = await request(app).get("/api/v1/tier-status");
		expect(res.status).toBe(200);
		expect(res.body.billing_cycle_end).toBeNull();
	});

	it("returns 401 when claraUser has no userId", async () => {
		mockClara.mockImplementationOnce((req: ApiKeyRequest, _res: unknown, next: () => void) => {
			req.claraUser = { userId: undefined as unknown as string, tier: "basic" };
			next();
		});
		const res = await request(app).get("/api/v1/tier-status");
		expect(res.status).toBe(401);
		expect(res.body.error).toBe("Unauthorized");
	});
});

describe("routes POST /api/v1/run", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockClara.mockImplementation((req: ApiKeyRequest, _res: unknown, next: () => void) => {
			req.claraUser = { userId: "u_v1", tier: "pro" };
			next();
		});
	});

	it("returns 501 intent_gateway_pending until Hermes dispatch is enabled", async () => {
		const res = await request(app).post("/api/v1/run").send({ intent: "help" });
		expect(res.status).toBe(501);
		expect(res.body.ok).toBe(false);
		expect(res.body.error).toBe("intent_gateway_pending");
		expect(typeof res.body.message).toBe("string");
	});
});
