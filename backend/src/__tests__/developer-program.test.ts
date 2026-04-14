import type { NextFunction, Request, Response } from "express";
import express from "express";
import request from "supertest";

const mockCheckoutCreate = jest.fn();

jest.mock("stripe", () =>
	jest.fn().mockImplementation(() => ({
		checkout: {
			sessions: {
				create: (...args: unknown[]) => mockCheckoutCreate(...args),
			},
		},
	})),
);

jest.mock("@/middleware/api-key-auth", () => ({
	requireApiKey: (req: Request, res: Response, next: NextFunction) => {
		const auth = req.headers.authorization;
		if (!auth?.startsWith("Bearer ")) {
			res.status(401).json({ error: "API key required" });
			return;
		}
		(req as { claraUser?: { userId: string; tier: string; role: string } }).claraUser = {
			userId: "user_1",
			tier: "free",
			role: "user",
		};
		next();
	},
}));

jest.mock("@/utils/logger", () => ({
	logger: { error: jest.fn() },
}));

import { createDeveloperProgramRouter } from "@/features/talent-registry/developer-program.routes";
import { TalentRegistryService } from "@/features/talent-registry/talent-registry.service";

describe("Developer Program API", () => {
	let mockQuery: jest.Mock;
	let service: TalentRegistryService;
	let app: express.Application;

	beforeEach(() => {
		jest.clearAllMocks();
		process.env.STRIPE_SECRET_KEY = "sk_test";
		process.env.STRIPE_PRICE_DEVELOPER_PROGRAM = "price_dev_99";
		process.env.DEVELOPER_PORTAL_URL = "https://developers.claracode.ai";
		mockCheckoutCreate.mockResolvedValue({ url: "https://checkout.stripe.com/test_session" });
		mockQuery = jest.fn();
		const pool = { query: mockQuery } as unknown as ConstructorParameters<typeof TalentRegistryService>[0];
		service = new TalentRegistryService(pool);
		const ex = express();
		ex.use(express.json());
		ex.use("/api/developer-program", createDeveloperProgramRouter(service));
		app = ex;
	});

	it("GET /api/developer-program/status without auth returns 401", async () => {
		const res = await request(app).get("/api/developer-program/status");
		expect(res.status).toBe(401);
	});

	it("GET /api/developer-program/status with key, no program returns enrolled false", async () => {
		mockQuery.mockResolvedValueOnce({ rows: [] });
		const res = await request(app).get("/api/developer-program/status").set("Authorization", "Bearer sk-clara-x");
		expect(res.status).toBe(200);
		expect(res.body).toEqual({ enrolled: false, status: null, expiresAt: null });
	});

	it("POST /api/developer-program/enroll returns checkoutUrl", async () => {
		mockQuery.mockResolvedValueOnce({ rowCount: 0, rows: [] });
		const res = await request(app).post("/api/developer-program/enroll").set("Authorization", "Bearer sk-clara-x");
		expect(res.status).toBe(200);
		expect(res.body.checkoutUrl).toBe("https://checkout.stripe.com/test_session");
		expect(mockCheckoutCreate).toHaveBeenCalled();
	});

	it("POST /api/developer-program/enroll when already enrolled returns 409", async () => {
		mockQuery.mockResolvedValueOnce({ rowCount: 1, rows: [{ "?column?": 1 }] });
		const res = await request(app).post("/api/developer-program/enroll").set("Authorization", "Bearer sk-clara-x");
		expect(res.status).toBe(409);
		expect(res.body.error).toBe("already_enrolled");
	});

	it("GET status enrolled true after active row", async () => {
		const future = new Date();
		future.setFullYear(future.getFullYear() + 1);
		mockQuery.mockResolvedValueOnce({
			rows: [{ status: "active", expires_at: future }],
		});
		const res = await request(app).get("/api/developer-program/status").set("Authorization", "Bearer sk-clara-x");
		expect(res.status).toBe(200);
		expect(res.body.enrolled).toBe(true);
		expect(res.body.status).toBe("active");
	});
});
