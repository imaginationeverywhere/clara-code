import express from "express";
import request from "supertest";
import type { ApiKeyRequest } from "@/middleware/api-key-auth";
import { voiceLimitMiddleware } from "@/middleware/voice-limit";

describe("voiceLimitMiddleware (deprecated no-op)", () => {
	it("passes through without a monthly voice cap", async () => {
		const app = express();
		app.post(
			"/t",
			(req, _res, next) => {
				(req as ApiKeyRequest).claraUser = { userId: "u1", tier: "free" };
				next();
			},
			voiceLimitMiddleware,
			(_req, res) => {
				res.sendStatus(200);
			},
		);
		const res = await request(app).post("/t").send();
		expect(res.status).toBe(200);
	});
});
