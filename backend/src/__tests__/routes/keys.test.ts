import express from "express";
import request from "supertest";

jest.mock("@clerk/express", () => ({
	requireAuth: () => (_req: unknown, _res: unknown, next: () => void) => {
		next();
	},
}));

jest.mock("@/middleware/rate-limit", () => ({
	apiKeyCreateLimiter: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

jest.mock("@/models/ApiKey", () => ({
	ApiKey: {
		findAll: jest.fn(),
		create: jest.fn(),
		findOne: jest.fn(),
	},
}));
jest.mock("@/utils/logger", () => ({
	logger: { error: jest.fn() },
}));

import { ApiKey } from "@/models/ApiKey";
import keysRoutes from "@/routes/keys";

const app = express();
app.use(express.json());
app.use((req, _res, next) => {
	(req as { auth?: () => Promise<{ userId: string | null }> }).auth = async () => ({ userId: "user_test" });
	next();
});
app.use("/api/keys", keysRoutes);

describe("routes /api/keys", () => {
	beforeEach(() => jest.clearAllMocks());

	it("GET / lists masked keys", async () => {
		(ApiKey.findAll as jest.Mock).mockResolvedValueOnce([
			{
				id: "k1",
				name: "n",
				key: `sk-clara-${"b".repeat(48)}`,
				lastUsedAt: null,
				createdAt: new Date(),
			},
		]);
		const res = await request(app).get("/api/keys");
		expect(res.status).toBe(200);
		expect(res.body.keys[0].key).toMatch(/^sk-clara-\.\.\./);
	});

	it("GET / 401 without userId", async () => {
		const local = express();
		local.use(express.json());
		local.use((_req, _res, next) => {
			(_req as { auth?: () => Promise<{ userId: string | null }> }).auth = async () => ({ userId: null });
			next();
		});
		local.use("/api/keys", keysRoutes);
		const res = await request(local).get("/api/keys");
		expect(res.status).toBe(401);
	});

	it("POST / creates key", async () => {
		(ApiKey.create as jest.Mock).mockResolvedValueOnce({
			id: "id1",
			name: "My Key",
			key: "sk-clara-newkey",
		});
		const res = await request(app).post("/api/keys").send({ name: "My Key" });
		expect(res.status).toBe(201);
		expect(res.body.key).toContain("sk-clara-");
	});

	it("POST / 400 without name", async () => {
		const res = await request(app).post("/api/keys").send({});
		expect(res.status).toBe(400);
	});

	it("POST / 400 when name exceeds 255 chars", async () => {
		const res = await request(app)
			.post("/api/keys")
			.send({ name: "x".repeat(256) });
		expect(res.status).toBe(400);
		expect(res.body.error).toMatch(/255/);
	});

	it("POST / 500 on error", async () => {
		(ApiKey.create as jest.Mock).mockRejectedValueOnce(new Error("fail"));
		const res = await request(app).post("/api/keys").send({ name: "x" });
		expect(res.status).toBe(500);
	});

	it("DELETE /:id revokes", async () => {
		const update = jest.fn().mockResolvedValue(undefined);
		(ApiKey.findOne as jest.Mock).mockResolvedValueOnce({ id: "kid", update });
		const res = await request(app).delete("/api/keys/kid");
		expect(res.status).toBe(200);
		expect(update).toHaveBeenCalledWith({ isActive: false });
	});

	it("DELETE /:id 404", async () => {
		(ApiKey.findOne as jest.Mock).mockResolvedValueOnce(null);
		const res = await request(app).delete("/api/keys/missing");
		expect(res.status).toBe(404);
	});

	it("DELETE /:id 500 on db error", async () => {
		(ApiKey.findOne as jest.Mock).mockRejectedValueOnce(new Error("db crash"));
		const res = await request(app).delete("/api/keys/anid");
		expect(res.status).toBe(500);
	});
});
