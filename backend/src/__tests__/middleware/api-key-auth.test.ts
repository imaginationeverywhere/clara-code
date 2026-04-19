import express from "express";
import request from "supertest";

jest.mock("@/models/ApiKey", () => ({
	ApiKey: { findOne: jest.fn(), findAll: jest.fn(), update: jest.fn(), count: jest.fn().mockResolvedValue(0) },
}));
jest.mock("@/utils/logger", () => ({
	logger: { error: jest.fn() },
}));

import { requireApiKey } from "@/middleware/api-key-auth";
import { ApiKey } from "@/models/ApiKey";
import { generateApiKey } from "@/utils/api-key";

const app = express();
app.use(express.json());
app.get("/protected", requireApiKey, (_req, res) => res.json({ ok: true }));

describe("requireApiKey", () => {
	beforeEach(() => jest.clearAllMocks());

	it("passes with valid sk-clara-* key", async () => {
		(ApiKey.findOne as jest.Mock).mockResolvedValueOnce({ id: "1", userId: "user_abc" });
		(ApiKey.update as jest.Mock).mockResolvedValueOnce([1]);
		const res = await request(app).get("/protected").set("Authorization", "Bearer sk-clara-abc123");
		expect(res.status).toBe(200);
	});

	it("401 with no header", async () => {
		const res = await request(app).get("/protected");
		expect(res.status).toBe(401);
	});

	it("401 with wrong prefix", async () => {
		const res = await request(app).get("/protected").set("Authorization", "Bearer sk-openai-xyz");
		expect(res.status).toBe(401);
	});

	it("401 with revoked/unknown key", async () => {
		(ApiKey.findOne as jest.Mock).mockResolvedValueOnce(null);
		const res = await request(app).get("/protected").set("Authorization", "Bearer sk-clara-revoked");
		expect(res.status).toBe(401);
	});

	it("500 when findOne throws", async () => {
		(ApiKey.findOne as jest.Mock).mockRejectedValueOnce(new Error("db"));
		const res = await request(app).get("/protected").set("Authorization", "Bearer sk-clara-abc123");
		expect(res.status).toBe(500);
	});

	it("passes with valid cc_live key (hashed)", async () => {
		const { key, hash, prefix } = generateApiKey("pro");
		(ApiKey.findAll as jest.Mock).mockResolvedValueOnce([
			{ id: "1", userId: "user_x", keyHash: hash, keyPrefix: prefix, tier: "pro" },
		]);
		(ApiKey.update as jest.Mock).mockResolvedValueOnce([1]);
		const res = await request(app).get("/protected").set("Authorization", `Bearer ${key}`);
		expect(res.status).toBe(200);
	});

	it("401 when cc_live hash does not match", async () => {
		const { hash, prefix } = generateApiKey("pro");
		(ApiKey.findAll as jest.Mock).mockResolvedValueOnce([
			{ id: "1", userId: "user_x", keyHash: hash, keyPrefix: prefix, tier: "pro" },
		]);
		const res = await request(app)
			.get("/protected")
			.set("Authorization", "Bearer cc_live_deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef");
		expect(res.status).toBe(401);
	});
});
