import express from "express";
import request from "supertest";
import type { ApiKeyRequest } from "@/middleware/api-key-auth";

const checkAndIncrement = jest.fn();
const getUsedCountForCurrentMonth = jest.fn();

jest.mock("@/services/voice-usage.service", () => ({
	FREE_MONTHLY_LIMIT: 100,
	getNextResetDateKey: () => "2026-05-01",
	voiceUsageService: {
		checkAndIncrement: (...args: unknown[]) => checkAndIncrement(...args),
		getUsedCountForCurrentMonth: (...args: unknown[]) => getUsedCountForCurrentMonth(...args),
	},
}));

import { voiceLimitMiddleware } from "@/middleware/voice-limit";

describe("voiceLimitMiddleware", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("returns 401 when claraUser missing", async () => {
		const app = express();
		app.post("/t", voiceLimitMiddleware, (_req, res) => {
			res.sendStatus(200);
		});
		const res = await request(app).post("/t").send();
		expect(res.status).toBe(401);
	});

	it("calls next when under limit", async () => {
		checkAndIncrement.mockResolvedValueOnce(true);
		const app = express();
		app.post("/t", (req, _res, next) => {
			(req as ApiKeyRequest).claraUser = { userId: "u1", tier: "free" };
			next();
		}, voiceLimitMiddleware, (_req, res) => {
			res.sendStatus(200);
		});
		const res = await request(app).post("/t").send();
		expect(res.status).toBe(200);
	});

	it("returns 402 when limit exceeded", async () => {
		checkAndIncrement.mockResolvedValueOnce(false);
		getUsedCountForCurrentMonth.mockResolvedValueOnce(100);
		const app = express();
		app.post("/t", (req, _res, next) => {
			(req as ApiKeyRequest).claraUser = { userId: "u1", tier: "free" };
			next();
		}, voiceLimitMiddleware, (_req, res) => {
			res.sendStatus(200);
		});
		const res = await request(app).post("/t").send();
		expect(res.status).toBe(402);
		expect(res.body.error).toBe("voice_limit_reached");
		expect(res.body.limit).toBe(100);
	});
});
