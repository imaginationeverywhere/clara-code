import express from "express";
import request from "supertest";
import type { ApiKeyRequest } from "@/middleware/api-key-auth";

const mockClara = jest.fn((req: ApiKeyRequest, _res: unknown, next: () => void) => {
	req.claraUser = { userId: "u_ht", tier: "basic" };
	next();
});

jest.mock("@/middleware/api-key-auth", () => ({
	requireClaraOrClerk: (req: ApiKeyRequest, res: unknown, next: () => void) => mockClara(req, res, next),
}));

jest.mock("@/middleware/abuse-protection", () => ({
	requireAbuseCheck: (_req: unknown, _res: unknown, next: () => void) => {
		next();
	},
}));

const mockBrowse = jest.fn();
const mockAcquire = jest.fn();
const mockAttach = jest.fn();
const mockDetach = jest.fn();
const mockListAgent = jest.fn();
const mockListAgentForUser = jest.fn();

jest.mock("@/services/talent.service", () => {
	const actual = jest.requireActual<typeof import("@/services/talent.service")>("@/services/talent.service");
	return {
		...actual,
		talentService: {
			browseInventory: (...a: unknown[]) => mockBrowse(...a),
			acquire: (...a: unknown[]) => mockAcquire(...a),
			attach: (...a: unknown[]) => mockAttach(...a),
			detach: (...a: unknown[]) => mockDetach(...a),
			listAgentTalents: (...a: unknown[]) => mockListAgent(...a),
			listAgentTalentsForUser: (...a: unknown[]) => mockListAgentForUser(...a),
		},
	};
});

import talentsRoutes from "@/routes/talents";

const app = express();
app.use(express.json());
app.use("/api/harness-talents", talentsRoutes);

describe("routes /api/harness-talents", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockClara.mockImplementation((req: ApiKeyRequest, _res: unknown, next: () => void) => {
			req.claraUser = { userId: "u_ht", tier: "pro" };
			next();
		});
	});

	it("GET / returns inventory", async () => {
		mockBrowse.mockResolvedValue([{ id: "t1" }]);
		const res = await request(app).get("/api/harness-talents").query({ category: "free" });
		expect(res.status).toBe(200);
		expect(res.body.talents).toEqual([{ id: "t1" }]);
		expect(mockBrowse).toHaveBeenCalledWith("u_ht", { category: "free" });
	});

	it("POST /acquire", async () => {
		mockAcquire.mockResolvedValue({ acquired: true, userTalentId: "x" });
		const res = await request(app).post("/api/harness-talents/acquire").send({ talent_id: "react" });
		expect(res.status).toBe(200);
		expect(res.body).toEqual({ acquired: true, userTalentId: "x" });
	});

	it("POST /attach", async () => {
		mockAttach.mockResolvedValue(undefined);
		const res = await request(app).post("/api/harness-talents/attach").send({ agent_id: "a1", talent_id: "t1" });
		expect(res.status).toBe(200);
		expect(res.body).toEqual({ attached: true });
		expect(mockAttach).toHaveBeenCalled();
	});

	it("GET /agent/:agentId returns 404 when the agent is not owned by the caller", async () => {
		mockListAgentForUser.mockResolvedValue(null);
		const res = await request(app).get("/api/harness-talents/agent/other-user-agent");
		expect(res.status).toBe(404);
		expect(res.body).toEqual({ error: "agent_not_found" });
		expect(mockListAgentForUser).toHaveBeenCalledWith("u_ht", "other-user-agent");
	});

	it("GET /agent/:agentId lists talents when the agent is owned", async () => {
		mockListAgentForUser.mockResolvedValue([{ id: "t1" }]);
		const res = await request(app).get("/api/harness-talents/agent/a1");
		expect(res.status).toBe(200);
		expect(res.body.talents).toEqual([{ id: "t1" }]);
		expect(mockListAgentForUser).toHaveBeenCalledWith("u_ht", "a1");
	});
});
