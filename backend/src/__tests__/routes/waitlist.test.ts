import request from "supertest";
import express from "express";

jest.mock("@/middleware/rate-limit", () => ({
	waitlistLimiter: (_req: unknown, _res: unknown, next: () => void) => {
		next();
	},
}));

jest.mock("@/models/WaitlistEntry", () => ({
	WaitlistEntry: { findOrCreate: jest.fn() },
}));
jest.mock("@/utils/logger", () => ({
	logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

import waitlistRoutes from "@/routes/waitlist";
import { WaitlistEntry } from "@/models/WaitlistEntry";

const app = express();
app.use(express.json());
app.use("/api/waitlist", waitlistRoutes);

describe("POST /api/waitlist", () => {
	beforeEach(() => jest.clearAllMocks());

	it("201 on new valid email", async () => {
		(WaitlistEntry.findOrCreate as jest.Mock).mockResolvedValueOnce([
			{ id: "abc", email: "test@test.com", createdAt: new Date() },
			true,
		]);
		const res = await request(app).post("/api/waitlist").send({ email: "test@test.com" });
		expect(res.status).toBe(201);
		expect(res.body.success).toBe(true);
	});

	it("200 on duplicate email", async () => {
		(WaitlistEntry.findOrCreate as jest.Mock).mockResolvedValueOnce([
			{ id: "abc", email: "test@test.com" },
			false,
		]);
		const res = await request(app).post("/api/waitlist").send({ email: "test@test.com" });
		expect(res.status).toBe(200);
		expect(res.body.message).toMatch(/already/i);
	});

	it("400 on missing email", async () => {
		const res = await request(app).post("/api/waitlist").send({});
		expect(res.status).toBe(400);
	});

	it("400 on invalid email format", async () => {
		const res = await request(app).post("/api/waitlist").send({ email: "notanemail" });
		expect(res.status).toBe(400);
	});

	it("500 on db error", async () => {
		(WaitlistEntry.findOrCreate as jest.Mock).mockRejectedValueOnce(new Error("DB down"));
		const res = await request(app).post("/api/waitlist").send({ email: "test@test.com" });
		expect(res.status).toBe(500);
	});
});
