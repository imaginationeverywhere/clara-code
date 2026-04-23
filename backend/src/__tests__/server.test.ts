import type { Application } from "express";
import request from "supertest";

jest.mock("@clerk/express", () => ({
	clerkMiddleware: () => (_req: unknown, _res: unknown, next: () => void) => next(),
	getAuth: () => ({ userId: null }),
	requireAuth: () => (_req: unknown, _res: unknown, next: () => void) => next(),
}));

describe("server app", () => {
	let app: Application;

	beforeAll(async () => {
		const { sequelize } = await import("@/config/database");
		jest.spyOn(sequelize, "authenticate").mockResolvedValue(undefined);
		({ app } = await import("@/server"));
	});

	it("GET /health returns status payload", async () => {
		const res = await request(app).get("/health");
		expect(res.status).toBe(200);
		expect(res.body.status).toBe("ok");
		expect(res.body.service).toBe("clara-code-backend");
	});
});
