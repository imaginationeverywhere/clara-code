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

const getUsage = jest.fn();
jest.mock("@/services/voice-usage.service", () => ({
	voiceUsageService: {
		getUsage: (...args: unknown[]) => getUsage(...args),
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
	beforeEach(() => jest.clearAllMocks());

	it("returns usage payload for free tier", async () => {
		getUsage.mockResolvedValueOnce({ used: 3, limit: 100, resetDate: "2026-05-01" });
		const res = await request(app).get("/api/user/usage");
		expect(res.status).toBe(200);
		expect(res.body.tier).toBe("free");
		expect(res.body.voice_exchanges.used).toBe(3);
		expect(res.body.voice_exchanges.unlimited).toBe(false);
		expect(res.body.voice_exchanges.limit).toBe(100);
	});

	it("returns unlimited for pro", async () => {
		mockClara.mockImplementationOnce((req: ApiKeyRequest, _res: unknown, next: () => void) => {
			req.claraUser = { userId: "u_usage", tier: "pro" };
			next();
		});
		getUsage.mockResolvedValueOnce({ used: 10, limit: null, resetDate: "2026-05-01" });
		const res = await request(app).get("/api/user/usage");
		expect(res.status).toBe(200);
		expect(res.body.tier).toBe("pro");
		expect(res.body.voice_exchanges.unlimited).toBe(true);
		expect(res.body.voice_exchanges.limit).toBeNull();
	});
});
