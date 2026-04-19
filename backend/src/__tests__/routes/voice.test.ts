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

jest.mock("@/middleware/api-key-auth", () => ({
	requireClaraOrClerk: (req: { claraUser?: { userId: string; tier: string } }, _res: unknown, next: () => void) => {
		req.claraUser = { userId: "user_voice_test", tier: "free" };
		next();
	},
}));

jest.mock("@/middleware/voice-limit", () => ({
	voiceLimitMiddleware: (_req: unknown, _res: unknown, next: () => void) => {
		next();
	},
}));

jest.mock("@/services/voice-usage.service", () => ({
	voiceUsageService: {
		incrementAfterSuccess: jest.fn().mockResolvedValue(undefined),
	},
}));

import axios from "axios";
import voiceRoutes from "@/routes/voice";

const app = express();
app.use(express.json());
app.use("/api/voice", voiceRoutes);

const TEST_CLARA_VOICE_URL = "https://voice.test.example/graphql";

describe("routes /api/voice", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		process.env.CLARA_VOICE_URL = TEST_CLARA_VOICE_URL;
	});

	it("POST /greet returns 503 when CLARA_VOICE_URL is unset", async () => {
		const prevMaya = process.env.MAYA_BACKEND_URL;
		delete process.env.CLARA_VOICE_URL;
		delete process.env.MAYA_BACKEND_URL;
		const res = await request(app).post("/api/voice/greet").send({});
		expect(res.status).toBe(503);
		expect(res.body.error).toBe("Voice service is not available");
		if (prevMaya !== undefined) process.env.MAYA_BACKEND_URL = prevMaya;
		else delete process.env.MAYA_BACKEND_URL;
	});

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

	describe("dev stub (CLARA_VOICE_DEV_STUB=1)", () => {
		let prevStub: string | undefined;
		beforeEach(() => {
			prevStub = process.env.CLARA_VOICE_DEV_STUB;
			process.env.CLARA_VOICE_DEV_STUB = "1";
		});
		afterEach(() => {
			if (prevStub === undefined) delete process.env.CLARA_VOICE_DEV_STUB;
			else process.env.CLARA_VOICE_DEV_STUB = prevStub;
		});

		it("POST /stt returns a mock transcript without calling Modal", async () => {
			const res = await request(app).post("/api/voice/stt").send({ stubText: "write a hello function" });
			expect(res.status).toBe(200);
			expect(res.body.transcript).toBe("write a hello function");
			expect(res.body.stub).toBe(true);
			expect(axios.post).not.toHaveBeenCalled();
		});

		it("POST /stt honors x-clara-stub-text header over body", async () => {
			const res = await request(app)
				.post("/api/voice/stt")
				.set("x-clara-stub-text", "header wins")
				.send({ stubText: "body loses" });
			expect(res.status).toBe(200);
			expect(res.body.transcript).toBe("header wins");
		});

		it("POST /stt falls back to a default transcript when no stub text provided", async () => {
			const res = await request(app).post("/api/voice/stt").send({});
			expect(res.status).toBe(200);
			expect(typeof res.body.transcript).toBe("string");
			expect(res.body.transcript.length).toBeGreaterThan(0);
		});

		it("POST /tts returns a silence WAV without calling Modal", async () => {
			const res = await request(app).post("/api/voice/tts").send({ text: "hi" });
			expect(res.status).toBe(200);
			expect(res.headers["content-type"]).toMatch(/audio\/wav/);
			expect(res.headers["x-clara-voice-stub"]).toBe("1");
			expect(res.body).toBeInstanceOf(Buffer);
			expect((res.body as Buffer).slice(0, 4).toString()).toBe("RIFF");
			expect(axios.post).not.toHaveBeenCalled();
		});

		it("POST /tts 400 when text missing even in stub mode", async () => {
			const res = await request(app).post("/api/voice/tts").send({});
			expect(res.status).toBe(400);
		});
	});

	describe("real mode (no stub)", () => {
		let prevStub: string | undefined;
		beforeEach(() => {
			prevStub = process.env.CLARA_VOICE_DEV_STUB;
			delete process.env.CLARA_VOICE_DEV_STUB;
		});
		afterEach(() => {
			if (prevStub !== undefined) process.env.CLARA_VOICE_DEV_STUB = prevStub;
		});

		it("POST /stt proxies to HERMES_GATEWAY_URL when configured", async () => {
			const prevHermes = process.env.HERMES_GATEWAY_URL;
			process.env.HERMES_GATEWAY_URL = "https://hermes.test.example";
			(axios.post as jest.Mock).mockResolvedValueOnce({ data: { transcript: "real" } });
			const res = await request(app).post("/api/voice/stt").send({ audioBase64: "AAAA", mimeType: "audio/wav" });
			expect(res.status).toBe(200);
			expect(res.body.transcript).toBe("real");
			expect(res.body.stub).toBe(false);
			expect(axios.post).toHaveBeenCalledWith(
				"https://hermes.test.example/stt",
				expect.objectContaining({ audio_base64: "AAAA" }),
				expect.any(Object),
			);
			if (prevHermes === undefined) delete process.env.HERMES_GATEWAY_URL;
			else process.env.HERMES_GATEWAY_URL = prevHermes;
		});

		it("POST /stt 400 when audioBase64 missing", async () => {
			const res = await request(app).post("/api/voice/stt").send({});
			expect(res.status).toBe(400);
		});

		it("POST /tts proxies audio when HERMES_GATEWAY_URL set", async () => {
			const prevHermes = process.env.HERMES_GATEWAY_URL;
			process.env.HERMES_GATEWAY_URL = "https://hermes.test.example";
			(axios.post as jest.Mock).mockResolvedValueOnce({ data: new ArrayBuffer(8) });
			const res = await request(app).post("/api/voice/tts").send({ text: "hi" });
			expect(res.status).toBe(200);
			expect(res.headers["content-type"]).toMatch(/audio/);
			if (prevHermes === undefined) delete process.env.HERMES_GATEWAY_URL;
			else process.env.HERMES_GATEWAY_URL = prevHermes;
		});

		it("POST /tts 503 when no voice URL is configured", async () => {
			const prevHermes = process.env.HERMES_GATEWAY_URL;
			const prevVoice = process.env.CLARA_VOICE_URL;
			delete process.env.HERMES_GATEWAY_URL;
			delete process.env.CLARA_VOICE_URL;
			const res = await request(app).post("/api/voice/tts").send({ text: "hi" });
			expect(res.status).toBe(503);
			if (prevHermes !== undefined) process.env.HERMES_GATEWAY_URL = prevHermes;
			if (prevVoice !== undefined) process.env.CLARA_VOICE_URL = prevVoice;
		});
	});
});
