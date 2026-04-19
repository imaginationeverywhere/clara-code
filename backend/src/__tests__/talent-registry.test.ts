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
		} else if (token === "sk-clara-nouser") {
			(req as { claraUser?: Record<string, string> }).claraUser = {
				userId: "",
				tier: "free",
				apiKeyId: "k0",
				role: "user",
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

	it("GET /api/talents/:id returns 404 when talent does not exist", async () => {
		mockQuery.mockResolvedValueOnce({ rows: [] });
		const res = await request(app).get("/api/talents/00000000-0000-0000-0000-000000000000");
		expect(res.status).toBe(404);
		expect(res.body.error).toBe("talent_not_found");
	});

	it("POST /api/talents returns 400 when required fields are missing", async () => {
		mockQuery.mockResolvedValueOnce({ rowCount: 1, rows: [{ "?column?": 1 }] });
		const res = await request(app).post("/api/talents").set("Authorization", "Bearer sk-clara-test").send({
			name: "x",
			displayName: "X",
			subgraphUrl: "https://example.com/gql",
		});
		expect(res.status).toBe(400);
		expect(res.body.error).toBe("missing_required_fields");
	});

	it("PUT /api/talents/:id returns 404 when talent is not owned by the user", async () => {
		mockQuery.mockResolvedValueOnce({ rows: [] });
		const res = await request(app)
			.put("/api/talents/tid")
			.set("Authorization", "Bearer sk-clara-test")
			.send({ displayName: "Nope" });
		expect(res.status).toBe(404);
		expect(res.body.error).toBe("talent_not_found");
	});

	it("GET /api/talents/me/installed returns installed talents", async () => {
		mockQuery.mockResolvedValueOnce({ rows: [] });
		const res = await request(app).get("/api/talents/me/installed").set("Authorization", "Bearer sk-clara-test");
		expect(res.status).toBe(200);
		expect(res.body.talents).toEqual([]);
	});

	it("GET /api/talents with category query passes category to service", async () => {
		mockQuery.mockResolvedValueOnce({ rows: [] });
		const res = await request(app).get("/api/talents?category=developer-tools");
		expect(res.status).toBe(200);
		expect(mockQuery.mock.calls[0][0]).toContain("category = $1");
	});

	it("GET /api/talents/:id/analytics returns 404 when analytics missing", async () => {
		mockQuery.mockResolvedValueOnce({ rows: [] });
		const res = await request(app).get("/api/talents/tid/analytics").set("Authorization", "Bearer sk-clara-test");
		expect(res.status).toBe(404);
		expect(res.body.error).toBe("talent_not_found");
	});

	it("GET /api/talents/:id/analytics returns payload", async () => {
		mockQuery.mockResolvedValueOnce({
			rows: [
				{
					id: "tid",
					name: "t",
					display_name: "T",
					install_count: 2,
					status: "approved",
				},
			],
		});
		const res = await request(app).get("/api/talents/tid/analytics").set("Authorization", "Bearer sk-clara-test");
		expect(res.status).toBe(200);
		expect(res.body.analytics.installCount).toBe(2);
	});

	it("POST /api/talents returns 409 when talent name is taken", async () => {
		mockQuery
			.mockResolvedValueOnce({ rowCount: 1, rows: [{ "?column?": 1 }] })
			.mockRejectedValueOnce(Object.assign(new Error("dup"), { code: "23505" }));
		const res = await request(app).post("/api/talents").set("Authorization", "Bearer sk-clara-test").send({
			name: "dup-talent",
			displayName: "Dup",
			subgraphUrl: "https://example.com/gql",
			pricingType: "free",
		});
		expect(res.status).toBe(409);
		expect(res.body.error).toBe("talent_name_taken");
	});

	it("POST /api/talents returns 500 on unexpected submit error", async () => {
		mockQuery
			.mockResolvedValueOnce({ rowCount: 1, rows: [{ "?column?": 1 }] })
			.mockRejectedValueOnce(new Error("db"));
		const res = await request(app).post("/api/talents").set("Authorization", "Bearer sk-clara-test").send({
			name: "x-talent",
			displayName: "X",
			subgraphUrl: "https://example.com/gql",
			pricingType: "free",
		});
		expect(res.status).toBe(500);
		expect(res.body.error).toBe("internal_error");
	});

	it("GET /api/talents/me/installed returns 401 when user id is missing", async () => {
		const res = await request(app).get("/api/talents/me/installed").set("Authorization", "Bearer sk-clara-nouser");
		expect(res.status).toBe(401);
		expect(res.body.error).toBe("unauthorized");
	});

	it("POST /api/talents returns 401 when user id is missing", async () => {
		const res = await request(app).post("/api/talents").set("Authorization", "Bearer sk-clara-nouser").send({
			name: "x",
			displayName: "X",
			subgraphUrl: "https://example.com/gql",
			pricingType: "free",
		});
		expect(res.status).toBe(401);
	});

	it("GET /api/talents/:id/analytics returns 401 when user id is missing", async () => {
		const res = await request(app).get("/api/talents/tid/analytics").set("Authorization", "Bearer sk-clara-nouser");
		expect(res.status).toBe(401);
	});

	it("GET /api/talents/:id/analytics returns 500 when service throws", async () => {
		mockQuery.mockRejectedValueOnce(new Error("db"));
		const res = await request(app).get("/api/talents/tid/analytics").set("Authorization", "Bearer sk-clara-test");
		expect(res.status).toBe(500);
	});

	it("GET /api/talents returns 500 when listing fails", async () => {
		mockQuery.mockRejectedValueOnce(new Error("db"));
		const res = await request(app).get("/api/talents");
		expect(res.status).toBe(500);
	});

	it("GET /api/talents/:id returns 500 when lookup fails", async () => {
		mockQuery.mockRejectedValueOnce(new Error("db"));
		const res = await request(app).get("/api/talents/tid");
		expect(res.status).toBe(500);
	});

	it("POST /api/talents/:id/install returns 401 when user id is missing", async () => {
		const res = await request(app).post("/api/talents/tid/install").set("Authorization", "Bearer sk-clara-nouser");
		expect(res.status).toBe(401);
	});

	it("POST /api/talents/:id/install returns 500 when install fails", async () => {
		mockQuery.mockRejectedValueOnce(new Error("db"));
		const res = await request(app).post("/api/talents/tid/install").set("Authorization", "Bearer sk-clara-test");
		expect(res.status).toBe(500);
	});

	it("DELETE /api/talents/:id/install returns 401 when user id is missing", async () => {
		const res = await request(app).delete("/api/talents/tid/install").set("Authorization", "Bearer sk-clara-nouser");
		expect(res.status).toBe(401);
	});

	it("DELETE /api/talents/:id/install returns 500 when uninstall fails", async () => {
		mockQuery.mockRejectedValueOnce(new Error("db"));
		const res = await request(app).delete("/api/talents/tid/install").set("Authorization", "Bearer sk-clara-test");
		expect(res.status).toBe(500);
	});

	it("PUT /api/talents/:id returns 401 when user id is missing", async () => {
		const res = await request(app)
			.put("/api/talents/tid")
			.set("Authorization", "Bearer sk-clara-nouser")
			.send({ displayName: "X" });
		expect(res.status).toBe(401);
	});

	it("PUT /api/talents/:id returns 500 when update throws", async () => {
		mockQuery.mockRejectedValueOnce(new Error("db"));
		const res = await request(app)
			.put("/api/talents/tid")
			.set("Authorization", "Bearer sk-clara-test")
			.send({ displayName: "X" });
		expect(res.status).toBe(500);
	});

	it("PATCH /api/admin/talents/:id/status returns 500 when status update fails", async () => {
		mockQuery.mockRejectedValueOnce(new Error("db"));
		const res = await request(app)
			.patch("/api/admin/talents/tid/status")
			.set("Authorization", "Bearer sk-clara-admin")
			.send({ status: "approved" });
		expect(res.status).toBe(500);
	});
});
