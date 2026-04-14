import type { NextFunction, Request, Response } from "express";
import express from "express";
import request from "supertest";

jest.mock("@/middleware/api-key-auth", () => ({
	requireApiKey: (req: Request, res: Response, next: NextFunction) => {
		const auth = req.headers.authorization;
		if (!auth?.startsWith("Bearer ")) {
			res.status(401).json({ error: "API key required" });
			return;
		}
		const token = auth.slice(7);
		if (token === "sk-clara-admin") {
			(req as { claraUser?: Record<string, string> }).claraUser = {
				userId: "user_admin",
				tier: "pro",
				apiKeyId: "k-admin",
				role: "admin",
			};
		} else {
			(req as { claraUser?: Record<string, string> }).claraUser = {
				userId: "user_1",
				tier: "free",
				apiKeyId: "k1",
				role: "user",
			};
		}
		next();
	},
}));

jest.mock("@/utils/logger", () => ({
	logger: { error: jest.fn() },
}));

import { createTalentAdminRouter, createTalentRegistryRouter } from "@/features/talent-registry/talent-registry.routes";
import { TalentRegistryService } from "@/features/talent-registry/talent-registry.service";

function createTestApp(service: TalentRegistryService) {
	const app = express();
	app.use(express.json());
	app.use("/api/talents", createTalentRegistryRouter(service));
	app.use("/api/admin/talents", createTalentAdminRouter(service));
	return app;
}

describe("Talent Registry REST API", () => {
	let mockQuery: jest.Mock;
	let service: TalentRegistryService;
	let app: ReturnType<typeof createTestApp>;

	beforeEach(() => {
		mockQuery = jest.fn();
		const pool = { query: mockQuery } as unknown as ConstructorParameters<typeof TalentRegistryService>[0];
		service = new TalentRegistryService(pool);
		app = createTestApp(service);
	});

	it("GET /api/talents returns 200 with empty talents", async () => {
		mockQuery.mockResolvedValueOnce({ rows: [] });
		const res = await request(app).get("/api/talents");
		expect(res.status).toBe(200);
		expect(res.body).toEqual({ talents: [] });
	});

	it("POST /api/talents without auth returns 401", async () => {
		const res = await request(app).post("/api/talents").send({
			name: "x",
			displayName: "X",
			subgraphUrl: "https://example.com/graphql",
			pricingType: "free",
		});
		expect(res.status).toBe(401);
	});

	it("POST /api/talents with API key but no Developer Program returns 403", async () => {
		mockQuery.mockResolvedValueOnce({ rowCount: 0, rows: [] });
		const res = await request(app).post("/api/talents").set("Authorization", "Bearer sk-clara-test").send({
			name: "my-talent",
			displayName: "My Talent",
			subgraphUrl: "https://example.com/gql",
			pricingType: "free",
		});
		expect(res.status).toBe(403);
		expect(res.body.error).toBe("developer_program_required");
	});

	it("POST /api/talents with Developer Program returns 201 pending", async () => {
		mockQuery.mockResolvedValueOnce({ rowCount: 1, rows: [{ "?column?": 1 }] }).mockResolvedValueOnce({
			rows: [
				{
					id: "t1",
					developer_user_id: "user_1",
					name: "my-talent",
					display_name: "My",
					description: null,
					category: null,
					pricing_type: "free",
					price_cents: null,
					voice_commands: [],
					status: "pending",
					install_count: 0,
					created_at: new Date(),
					reviewed_at: null,
				},
			],
		});
		const res = await request(app).post("/api/talents").set("Authorization", "Bearer sk-clara-test").send({
			name: "my-talent",
			displayName: "My",
			subgraphUrl: "https://example.com/gql",
			pricingType: "free",
		});
		expect(res.status).toBe(201);
		expect(res.body.talent.status).toBe("pending");
	});

	it("POST /api/talents/:id/install free talent returns 200 and increments", async () => {
		mockQuery
			.mockResolvedValueOnce({
				rows: [
					{
						id: "tid",
						name: "t",
						display_name: "T",
						description: null,
						category: null,
						pricing_type: "free",
						price_cents: null,
						voice_commands: null,
						install_count: 3,
					},
				],
			})
			.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: "i1" }] })
			.mockResolvedValueOnce({ rowCount: 1, rows: [] });
		const res = await request(app).post("/api/talents/tid/install").set("Authorization", "Bearer sk-clara-test");
		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
	});

	it("POST /api/talents/:id/install paid talent returns 402", async () => {
		mockQuery.mockResolvedValueOnce({
			rows: [
				{
					id: "tid",
					name: "t",
					display_name: "T",
					description: null,
					category: null,
					pricing_type: "paid",
					price_cents: 500,
					voice_commands: null,
					install_count: 0,
				},
			],
		});
		const res = await request(app).post("/api/talents/tid/install").set("Authorization", "Bearer sk-clara-test");
		expect(res.status).toBe(402);
		expect(res.body.error).toBe("payment_required");
	});

	it("DELETE /api/talents/:id/install returns 200", async () => {
		mockQuery.mockResolvedValueOnce({ rowCount: 1 }).mockResolvedValueOnce({ rowCount: 1, rows: [] });
		const res = await request(app).delete("/api/talents/tid/install").set("Authorization", "Bearer sk-clara-test");
		expect(res.status).toBe(200);
	});

	it("PATCH /api/admin/talents/:id/status without admin returns 403", async () => {
		const res = await request(app)
			.patch("/api/admin/talents/tid/status")
			.set("Authorization", "Bearer sk-clara-test")
			.send({ status: "approved" });
		expect(res.status).toBe(403);
		expect(res.body.error).toBe("admin_required");
	});

	it("PATCH /api/admin/talents/:id/status with admin returns 200", async () => {
		mockQuery.mockResolvedValueOnce({ rowCount: 1, rows: [] });
		const res = await request(app)
			.patch("/api/admin/talents/tid/status")
			.set("Authorization", "Bearer sk-clara-admin")
			.send({ status: "approved" });
		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
	});

	it("GET /api/talents/:id returns no subgraphUrl", async () => {
		mockQuery.mockResolvedValueOnce({
			rows: [
				{
					id: "x",
					name: "slug",
					display_name: "Slug",
					description: "d",
					category: "data",
					pricing_type: "free",
					price_cents: null,
					voice_commands: null,
					install_count: 1,
				},
			],
		});
		const res = await request(app).get("/api/talents/x");
		expect(res.status).toBe(200);
		expect(res.body.talent).toBeDefined();
		expect(res.body.talent.subgraphUrl).toBeUndefined();
		expect(res.body.talent.developerUserId).toBeUndefined();
	});
});
