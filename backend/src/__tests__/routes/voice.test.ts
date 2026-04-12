import express from "express";
import request from "supertest";

jest.mock("@clerk/express", () => ({
	requireAuth: () => (_req: unknown, _res: unknown, next: () => void) => {
		next();
	},
}));

jest.mock("@/middleware/rate-limit", () => ({
	voiceLimiter: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

jest.mock("axios", () => ({
	__esModule: true,
	default: {
		post: jest.fn(),
	},
}));

jest.mock("@/utils/logger", () => ({
	logger: { error: jest.fn() },
}));

import axios from "axios";
import voiceRoutes from "@/routes/voice";

const app = express();
app.use(express.json());
app.use("/api/voice", voiceRoutes);

describe("routes /api/voice", () => {
	beforeEach(() => jest.clearAllMocks());

	it("POST /greet returns audio buffer", async () => {
		(axios.post as jest.Mock).mockResolvedValueOnce({ data: new ArrayBuffer(8) });
		const res = await request(app).post("/api/voice/greet").send({});
		expect(res.status).toBe(200);
		expect(res.headers["content-type"]).toMatch(/audio/);
	});

	it("POST /greet 500 on axios error", async () => {
		(axios.post as jest.Mock).mockRejectedValueOnce(new Error("network"));
		const res = await request(app).post("/api/voice/greet").send({});
		expect(res.status).toBe(500);
	});

	it("POST /speak requires text", async () => {
		const res = await request(app).post("/api/voice/speak").send({});
		expect(res.status).toBe(400);
	});

	it("POST /speak returns audio", async () => {
		(axios.post as jest.Mock).mockResolvedValueOnce({ data: new ArrayBuffer(4) });
		const res = await request(app).post("/api/voice/speak").send({ text: "hi", voice_id: "clara" });
		expect(res.status).toBe(200);
	});

	it("POST /speak 500 on error", async () => {
		(axios.post as jest.Mock).mockRejectedValueOnce(new Error("x"));
		const res = await request(app).post("/api/voice/speak").send({ text: "hi" });
		expect(res.status).toBe(500);
	});
});
