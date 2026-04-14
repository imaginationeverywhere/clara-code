import express from "express";
import request from "supertest";

import { DEFAULT_MODEL, MODELS, ModelTierError, resolveModel } from "@/config/models";

jest.mock("@/utils/request-tier", () => ({
	resolveRequestTier: jest.fn(),
}));

import modelsRoutes from "@/routes/models";
import voiceRoutes from "@/routes/voice";
import { resolveRequestTier } from "@/utils/request-tier";

jest.mock("@clerk/express", () => ({
	requireAuth: () => (_req: unknown, _res: unknown, next: () => void) => {
		next();
	},
}));

jest.mock("@/middleware/rate-limit", () => ({
	voiceLimiter: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

jest.mock("@/middleware/voice-limit", () => ({
	voiceLimitMiddleware: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

jest.mock("@/services/voice-usage.service", () => ({
	voiceUsageService: {
		incrementAfterSuccess: jest.fn().mockResolvedValue(undefined),
	},
}));

jest.mock("@/utils/logger", () => ({
	logger: { error: jest.fn() },
}));

jest.mock("axios", () => ({
	__esModule: true,
	default: {
		post: jest.fn(),
	},
}));

jest.mock("@/middleware/api-key-auth", () => ({
	requireClaraOrClerk: (req: { claraUser?: { userId: string; tier: string } }, _res: unknown, next: () => void) => {
		req.claraUser = { userId: "user_models_test", tier: "free" };
		next();
	},
}));

import axios from "axios";

const mockResolveTier = resolveRequestTier as jest.MockedFunction<typeof resolveRequestTier>;

describe("resolveModel", () => {
	it("returns maya for free", () => {
		const m = resolveModel("maya", "free");
		expect(m.name).toBe("maya");
	});

	it("throws for mary on free", () => {
		expect(() => resolveModel("mary", "free")).toThrow(ModelTierError);
	});

	it("throws for nikki on free", () => {
		expect(() => resolveModel("nikki", "free")).toThrow(ModelTierError);
	});

	it("returns mary for pro", () => {
		const m = resolveModel("mary", "pro");
		expect(m.name).toBe("mary");
	});

	it("returns nikki for business", () => {
		const m = resolveModel("nikki", "business");
		expect(m.name).toBe("nikki");
	});

	it("defaults undefined to maya", () => {
		const m = resolveModel(undefined, "free");
		expect(m.name).toBe(DEFAULT_MODEL);
	});

	it("invalid name falls back to maya for pro", () => {
		const m = resolveModel("invalid", "pro");
		expect(m.name).toBe("maya");
	});

	it("throws when inferenceBackend is empty", () => {
		const previous = MODELS.maya;
		MODELS.maya = { ...MODELS.maya, inferenceBackend: "" };
		expect(() => resolveModel("maya", "free")).toThrow("Clara voice service is not configured");
		MODELS.maya = previous;
	});
});

describe("GET /api/models", () => {
	const app = express();
	app.use(express.json());
	app.use("/api/models", modelsRoutes);

	beforeEach(() => jest.clearAllMocks());

	it("returns only maya for free tier", async () => {
		mockResolveTier.mockResolvedValueOnce("free");
		const res = await request(app).get("/api/models");
		expect(res.status).toBe(200);
		expect(res.body.default).toBe("maya");
		expect(res.body.models.map((m: { name: string }) => m.name)).toEqual(["maya"]);
	});

	it("returns all models for pro tier", async () => {
		mockResolveTier.mockResolvedValueOnce("pro");
		const res = await request(app).get("/api/models");
		expect(res.status).toBe(200);
		expect(res.body.models).toHaveLength(3);
		expect(res.body.models.every((m: { name: string }) => ["maya", "mary", "nikki"].includes(m.name))).toBe(true);
	});
});

describe("voice model tier enforcement", () => {
	const app = express();
	app.use(express.json());
	app.use("/api/voice", voiceRoutes);

	beforeEach(() => jest.clearAllMocks());

	it("returns 403 for mary on free tier", async () => {
		(axios.post as jest.Mock).mockResolvedValueOnce({ data: new ArrayBuffer(4) });
		const res = await request(app).post("/api/voice/speak").send({ text: "hi", model: "mary" });
		expect(res.status).toBe(403);
		expect(res.body.error).toBe("model_tier_required");
		expect(res.body.model).toBe("mary");
		expect(axios.post).not.toHaveBeenCalled();
	});
});
