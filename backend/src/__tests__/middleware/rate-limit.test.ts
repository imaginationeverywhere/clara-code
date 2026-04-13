import express from "express";
import request from "supertest";
import { apiKeyCreateLimiter, voiceLimiter, waitlistLimiter } from "@/middleware/rate-limit";

describe("rate-limit middleware", () => {
	it("exports three configured limiter functions", () => {
		expect(typeof waitlistLimiter).toBe("function");
		expect(typeof voiceLimiter).toBe("function");
		expect(typeof apiKeyCreateLimiter).toBe("function");
	});

	it("waitlistLimiter allows 5 requests then returns 429", async () => {
		const app = express();
		app.use(waitlistLimiter);
		app.post("/", (_req, res) => res.status(200).json({ ok: true }));

		for (let i = 0; i < 5; i++) {
			const res = await request(app).post("/").set("X-Forwarded-For", "10.0.0.1");
			expect(res.status).toBe(200);
		}

		const blocked = await request(app).post("/").set("X-Forwarded-For", "10.0.0.1");
		expect(blocked.status).toBe(429);
	});

	it("voiceLimiter passes a single request", () => {
		const app = express();
		app.use(voiceLimiter);
		app.post("/", (_req, res) => res.json({ ok: true }));
		return request(app).post("/").expect(200);
	});

	it("voiceLimiter returns 429 with Retry-After after exceeding max requests", async () => {
		const app = express();
		app.set("trust proxy", true);
		app.use(voiceLimiter);
		app.post("/", (_req, res) => res.status(200).json({ ok: true }));

		for (let i = 0; i < 20; i++) {
			const res = await request(app).post("/").set("X-Forwarded-For", "10.0.0.50");
			expect(res.status).toBe(200);
		}
		const blocked = await request(app).post("/").set("X-Forwarded-For", "10.0.0.50");
		expect(blocked.status).toBe(429);
		expect(blocked.headers["retry-after"]).toBeDefined();
	});

	it("apiKeyCreateLimiter passes a single request", () => {
		const app = express();
		app.use(apiKeyCreateLimiter);
		app.post("/", (_req, res) => res.json({ ok: true }));
		return request(app).post("/").expect(200);
	});

	it("apiKeyCreateLimiter returns 429 after exceeding max creations per IP", async () => {
		const app = express();
		app.set("trust proxy", true);
		app.use(apiKeyCreateLimiter);
		app.post("/", (_req, res) => res.status(200).json({ ok: true }));

		for (let i = 0; i < 10; i++) {
			const res = await request(app).post("/").set("X-Forwarded-For", "10.0.0.99");
			expect(res.status).toBe(200);
		}
		const blocked = await request(app).post("/").set("X-Forwarded-For", "10.0.0.99");
		expect(blocked.status).toBe(429);
		expect(blocked.headers["retry-after"]).toBeDefined();
	});
});
