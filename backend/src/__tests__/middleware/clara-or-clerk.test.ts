import express from "express";
import request from "supertest";

jest.mock("@/models/Subscription", () => ({
	Subscription: {
		findOne: jest.fn().mockResolvedValue({ tier: "pro" }),
	},
}));

jest.mock("@/models/ApiKey", () => ({
	ApiKey: { findOne: jest.fn(), findAll: jest.fn(), update: jest.fn() },
}));

jest.mock("@/utils/logger", () => ({
	logger: { error: jest.fn() },
}));

import { type ApiKeyRequest, requireClaraOrClerk } from "@/middleware/api-key-auth";

const app = express();
app.use((req, _res, next) => {
	(req as { auth?: () => Promise<{ userId: string }> }).auth = () => Promise.resolve({ userId: "user_1" });
	next();
});
app.get("/v", requireClaraOrClerk, (req, res) => {
	const r = req as ApiKeyRequest;
	res.json({ tier: r.claraUser?.tier });
});

describe("requireClaraOrClerk", () => {
	it("uses Clerk session and loads subscription tier", async () => {
		const res = await request(app).get("/v");
		expect(res.status).toBe(200);
		expect(res.body.tier).toBe("pro");
	});
});
