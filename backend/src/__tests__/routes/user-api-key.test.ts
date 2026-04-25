import express from "express";
import request from "supertest";

jest.mock("@clerk/express", () => ({
	requireAuth: () => (_req: unknown, _res: unknown, next: () => void) => next(),
}));

jest.mock("@/models/ApiKey", () => ({
	ApiKey: {
		findOne: jest.fn(),
		update: jest.fn(),
		create: jest.fn(),
	},
}));

jest.mock("@/models/Subscription", () => ({
	Subscription: {
		findOne: jest.fn(),
	},
}));

jest.mock("@/utils/logger", () => ({
	logger: { error: jest.fn() },
}));

import { ApiKey } from "@/models/ApiKey";
import { Subscription } from "@/models/Subscription";
import userApiKeyRoutes from "@/routes/user-api-key";

const app = express();
app.use((req, _res, next) => {
	(req as { auth?: () => Promise<{ userId: string }> }).auth = () => Promise.resolve({ userId: "user_test" });
	next();
});
app.use(express.json());
app.use("/user", userApiKeyRoutes);

describe("user api-key routes", () => {
	beforeEach(() => jest.clearAllMocks());

	it("GET /api-key returns prefix when hashed key exists", async () => {
		(Subscription.findOne as jest.Mock).mockResolvedValueOnce({ tier: "pro" });
		(ApiKey.findOne as jest.Mock).mockResolvedValueOnce({
			keyPrefix: "cc_live_abcdefgh",
			tier: "pro",
			createdAt: new Date("2026-01-01"),
			lastUsedAt: null,
		});
		const res = await request(app).get("/user/api-key");
		expect(res.status).toBe(200);
		expect(res.body.prefix).toBe("cc_live_abcdefgh");
	});

	it("GET /api-key returns basic when no key row", async () => {
		(Subscription.findOne as jest.Mock).mockResolvedValueOnce(null);
		(ApiKey.findOne as jest.Mock).mockResolvedValueOnce(null);
		const res = await request(app).get("/user/api-key");
		expect(res.status).toBe(200);
		expect(res.body).toEqual({ prefix: null, tier: "basic" });
	});

	it("POST /api-key/regenerate 403 when no active subscription", async () => {
		(Subscription.findOne as jest.Mock).mockResolvedValueOnce(null);
		const res = await request(app).post("/user/api-key/regenerate").send({});
		expect(res.status).toBe(403);
	});

	it("POST /api-key/regenerate 403 when subscription not active", async () => {
		(Subscription.findOne as jest.Mock).mockResolvedValueOnce({ tier: "pro", status: "incomplete" });
		const res = await request(app).post("/user/api-key/regenerate").send({});
		expect(res.status).toBe(403);
	});

	it("POST /api-key/regenerate returns new key for active pro", async () => {
		(Subscription.findOne as jest.Mock).mockResolvedValueOnce({ tier: "pro", status: "active" });
		(ApiKey.update as jest.Mock).mockResolvedValueOnce([1]);
		(ApiKey.create as jest.Mock).mockResolvedValueOnce({});
		const res = await request(app).post("/user/api-key/regenerate").send({});
		expect(res.status).toBe(200);
		expect(res.body.key).toMatch(/^cc_live_/);
	});
});
