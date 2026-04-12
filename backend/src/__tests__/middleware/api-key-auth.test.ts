import express from "express";
import request from "supertest";

jest.mock("@/models/ApiKey", () => ({
	ApiKey: { findOne: jest.fn(), update: jest.fn() },
}));
jest.mock("@/utils/logger", () => ({
	logger: { error: jest.fn() },
}));

import { requireApiKey } from "@/middleware/api-key-auth";
import { ApiKey } from "@/models/ApiKey";

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
});
