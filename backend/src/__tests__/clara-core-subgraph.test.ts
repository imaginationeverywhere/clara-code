import express from "express";
import request from "supertest";

jest.mock("@/models/ApiKey", () => ({
	ApiKey: { findOne: jest.fn(), findAll: jest.fn(), update: jest.fn(), count: jest.fn().mockResolvedValue(0) },
}));
jest.mock("@/utils/logger", () => ({
	logger: { error: jest.fn() },
}));
jest.mock("@/services/voice-usage.service", () => ({
	voiceUsageService: {
		getUsage: jest.fn().mockResolvedValue({ used: 2, limit: 100, resetDate: "2026-05-01" }),
	},
}));

import { createClaraCoreSubgraph } from "@/graphql/clara-core/server";
import { requireApiKey } from "@/middleware/api-key-auth";
import { ApiKey } from "@/models/ApiKey";
import { voiceUsageService } from "@/services/voice-usage.service";

describe("Clara Core subgraph /graphql/clara-core", () => {
	const app = express();
	app.use(express.json());

	beforeAll(async () => {
		const mw = await createClaraCoreSubgraph();
		app.use("/graphql/clara-core", requireApiKey, mw);
	});

	beforeEach(() => {
		jest.clearAllMocks();
		(voiceUsageService.getUsage as jest.Mock).mockResolvedValue({
			used: 2,
			limit: 100,
			resetDate: "2026-05-01",
		});
	});

	it("GET without auth returns 401", async () => {
		const res = await request(app).get("/graphql/clara-core");
		expect(res.status).toBe(401);
	});

	it("POST me with valid free-tier sk-clara key returns user", async () => {
		(ApiKey.findOne as jest.Mock).mockResolvedValueOnce({
			id: "k1",
			userId: "user_free",
			tier: "free",
		});
		(ApiKey.update as jest.Mock).mockResolvedValueOnce([1]);

		const res = await request(app)
			.post("/graphql/clara-core")
			.set("Authorization", "Bearer sk-clara-testkey")
			.send({ query: "{ me { id tier voiceExchangesUsed } }" });

		expect(res.status).toBe(200);
		expect(res.body.errors).toBeUndefined();
		expect(res.body.data.me).toEqual({
			id: "user_free",
			tier: "free",
			voiceExchangesUsed: 2,
		});
	});

	it("POST models with free-tier key returns only MAYA", async () => {
		(ApiKey.findOne as jest.Mock).mockResolvedValueOnce({
			id: "k1",
			userId: "user_free",
			tier: "free",
		});
		(ApiKey.update as jest.Mock).mockResolvedValueOnce([1]);

		const res = await request(app)
			.post("/graphql/clara-core")
			.set("Authorization", "Bearer sk-clara-testkey")
			.send({ query: "{ models { name displayName thinking } }" });

		expect(res.status).toBe(200);
		expect(res.body.errors).toBeUndefined();
		const names = res.body.data.models.map((m: { name: string }) => m.name);
		expect(names).toEqual(["MAYA"]);
	});

	it("POST models with pro-tier key returns MAYA, MARY, NIKKI", async () => {
		(ApiKey.findOne as jest.Mock).mockResolvedValueOnce({
			id: "k2",
			userId: "user_pro",
			tier: "pro",
		});
		(ApiKey.update as jest.Mock).mockResolvedValueOnce([1]);

		const res = await request(app)
			.post("/graphql/clara-core")
			.set("Authorization", "Bearer sk-clara-prokey")
			.send({ query: "{ models { name } }" });

		expect(res.status).toBe(200);
		expect(res.body.errors).toBeUndefined();
		const names = res.body.data.models.map((m: { name: string }) => m.name).sort();
		expect(names).toEqual(["MARY", "MAYA", "NIKKI"]);
	});
});
