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
	logger: { error: jest.fn(), warn: jest.fn() },
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

jest.mock("@/services/memory.service", () => {
	const buildHistory = (context: {
		summary: string | null;
		recentTurns: { role: "user" | "assistant"; content: string }[];
	}): { role: "user" | "assistant"; content: string }[] => {
		const h: { role: "user" | "assistant"; content: string }[] = [];
		if (context.summary) {
			h.push({ role: "user", content: `[Memory] ${context.summary}` });
			h.push({ role: "assistant", content: "Understood." });
		}
		h.push(...context.recentTurns);
		return h;
	};
	return {
		memoryService: {
			getMemoryContext: jest.fn().mockResolvedValue({
				agentId: "clara",
				summary: null,
				keyFacts: [],
				recentTurns: [],
				lastSessionAt: null,
				lastSessionSurface: null,
				totalSessions: 0,
				isReturningUser: false,
			}),
			touchSession: jest.fn().mockResolvedValue(undefined),
			saveTurn: jest.fn().mockResolvedValue(undefined),
			buildHistory,
		},
	};
});

import axios from "axios";
import voiceRoutes from "@/routes/voice";
import { memoryService } from "@/services/memory.service";
import { voiceUsageService } from "@/services/voice-usage.service";

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
		let prevHermesKey: string | undefined;
		beforeEach(() => {
			prevStub = process.env.CLARA_VOICE_DEV_STUB;
			delete process.env.CLARA_VOICE_DEV_STUB;
			prevHermesKey = process.env.HERMES_API_KEY;
			process.env.HERMES_API_KEY = "test-hermes-key";
		});
		afterEach(() => {
			if (prevStub !== undefined) process.env.CLARA_VOICE_DEV_STUB = prevStub;
			if (prevHermesKey === undefined) delete process.env.HERMES_API_KEY;
			else process.env.HERMES_API_KEY = prevHermesKey;
		});

		it("POST /stt proxies to HERMES_GATEWAY_URL/voice/stt with Bearer HERMES_API_KEY", async () => {
			const prevHermes = process.env.HERMES_GATEWAY_URL;
			process.env.HERMES_GATEWAY_URL = "https://hermes.test.example";
			(axios.post as jest.Mock).mockResolvedValueOnce({ data: { transcript: "real" } });
			const res = await request(app).post("/api/voice/stt").send({ audioBase64: "AAAA", mimeType: "audio/wav" });
			expect(res.status).toBe(200);
			expect(res.body.transcript).toBe("real");
			expect(res.body.stub).toBe(false);
			expect(axios.post).toHaveBeenCalledWith(
				"https://hermes.test.example/voice/stt",
				expect.objectContaining({ audio_base64: "AAAA" }),
				expect.objectContaining({
					headers: expect.objectContaining({ Authorization: "Bearer test-hermes-key" }),
				}),
			);
			const call = (axios.post as jest.Mock).mock.calls[0];
			expect(call[2].timeout).toBeGreaterThanOrEqual(120_000);
			if (prevHermes === undefined) delete process.env.HERMES_GATEWAY_URL;
			else process.env.HERMES_GATEWAY_URL = prevHermes;
		});

		it("POST /stt 503 when HERMES_API_KEY is missing in real mode", async () => {
			const prevHermes = process.env.HERMES_GATEWAY_URL;
			process.env.HERMES_GATEWAY_URL = "https://hermes.test.example";
			delete process.env.HERMES_API_KEY;
			const res = await request(app).post("/api/voice/stt").send({ audioBase64: "AAAA" });
			expect(res.status).toBe(503);
			expect(axios.post).not.toHaveBeenCalled();
			if (prevHermes === undefined) delete process.env.HERMES_GATEWAY_URL;
			else process.env.HERMES_GATEWAY_URL = prevHermes;
		});

		it("POST /stt 400 when audioBase64 missing", async () => {
			const res = await request(app).post("/api/voice/stt").send({});
			expect(res.status).toBe(400);
		});

		it("POST /tts proxies to /voice/tts with Bearer and cold-start timeout", async () => {
			const prevHermes = process.env.HERMES_GATEWAY_URL;
			process.env.HERMES_GATEWAY_URL = "https://hermes.test.example";
			(axios.post as jest.Mock).mockResolvedValueOnce({ data: new ArrayBuffer(8) });
			const res = await request(app).post("/api/voice/tts").send({ text: "hi" });
			expect(res.status).toBe(200);
			expect(res.headers["content-type"]).toMatch(/audio/);
			const call = (axios.post as jest.Mock).mock.calls[0];
			expect(call[0]).toBe("https://hermes.test.example/voice/tts");
			expect(call[2].headers.Authorization).toBe("Bearer test-hermes-key");
			expect(call[2].timeout).toBeGreaterThanOrEqual(120_000);
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

		it("POST /tts 503 when HERMES_API_KEY is missing in real mode", async () => {
			const prevHermes = process.env.HERMES_GATEWAY_URL;
			process.env.HERMES_GATEWAY_URL = "https://hermes.test.example";
			delete process.env.HERMES_API_KEY;
			const res = await request(app).post("/api/voice/tts").send({ text: "hi" });
			expect(res.status).toBe(503);
			expect(axios.post).not.toHaveBeenCalled();
			if (prevHermes === undefined) delete process.env.HERMES_GATEWAY_URL;
			else process.env.HERMES_GATEWAY_URL = prevHermes;
		});
	});

	describe("GET /api/voice/memory", () => {
		it("200 and returns memory context for default clara", async () => {
			const res = await request(app).get("/api/voice/memory");
			expect(res.status).toBe(200);
			expect(res.body).toMatchObject({ agentId: "clara" });
			const getMemory = memoryService.getMemoryContext as jest.MockedFunction<typeof memoryService.getMemoryContext>;
			expect(getMemory).toHaveBeenCalledWith("user_voice_test", "clara");
		});

		it("uses agent_id from query", async () => {
			const res = await request(app).get("/api/voice/memory").query({ agent_id: "harness-uuid" });
			expect(res.status).toBe(200);
			const getMemory = memoryService.getMemoryContext as jest.MockedFunction<typeof memoryService.getMemoryContext>;
			expect(getMemory).toHaveBeenCalledWith("user_voice_test", "harness-uuid");
		});
	});

	describe("POST /api/voice/converse", () => {
		let prevHermes: string | undefined;
		let prevHermesKey: string | undefined;
		let prevVoiceServer: string | undefined;
		let prevConverseKey: string | undefined;

		beforeEach(() => {
			prevHermes = process.env.HERMES_GATEWAY_URL;
			prevHermesKey = process.env.HERMES_API_KEY;
			prevVoiceServer = process.env.VOICE_SERVER_URL;
			prevConverseKey = process.env.CLARA_VOICE_API_KEY;
			process.env.HERMES_GATEWAY_URL = "https://hermes.test.example";
			process.env.HERMES_API_KEY = "test-hermes-key";
			delete process.env.VOICE_SERVER_URL;
			delete process.env.CLARA_VOICE_API_KEY;
		});

		afterEach(() => {
			if (prevHermes === undefined) delete process.env.HERMES_GATEWAY_URL;
			else process.env.HERMES_GATEWAY_URL = prevHermes;
			if (prevHermesKey === undefined) delete process.env.HERMES_API_KEY;
			else process.env.HERMES_API_KEY = prevHermesKey;
			if (prevVoiceServer === undefined) delete process.env.VOICE_SERVER_URL;
			else process.env.VOICE_SERVER_URL = prevVoiceServer;
			if (prevConverseKey === undefined) delete process.env.CLARA_VOICE_API_KEY;
			else process.env.CLARA_VOICE_API_KEY = prevConverseKey;
		});

		it("400 when neither audio_base64 nor text is present", async () => {
			const res = await request(app).post("/api/voice/converse").send({});
			expect(res.status).toBe(400);
			expect(String(res.body.error)).toMatch(/required/);
		});

		it("503 when no voice server URL is configured", async () => {
			delete process.env.HERMES_GATEWAY_URL;
			delete process.env.CLARA_VOICE_URL;
			const res = await request(app).post("/api/voice/converse").send({ audio_base64: "AAAA" });
			expect(res.status).toBe(503);
		});

		it("503 when no API key is configured", async () => {
			delete process.env.HERMES_API_KEY;
			const res = await request(app).post("/api/voice/converse").send({ audio_base64: "AAAA" });
			expect(res.status).toBe(503);
			expect(axios.post).not.toHaveBeenCalled();
		});

		it("200 and proxies response on success", async () => {
			const mockData = { transcript: "write a test", response_text: "Sure!", audio_base64: "MP3DATA==" };
			(axios.post as jest.Mock).mockResolvedValueOnce({ data: mockData });
			const res = await request(app).post("/api/voice/converse").send({ audio_base64: "AAAA", voice_id: "clara" });
			expect(res.status).toBe(200);
			expect(res.body.transcript).toBe("write a test");
			expect(res.body.response_text).toBe("Sure!");
			expect(res.body.audio_base64).toBe("MP3DATA==");
			expect(axios.post).toHaveBeenCalledWith(
				"https://hermes.test.example/voice/converse",
				expect.objectContaining({
					audio_base64: "AAAA",
					voice_id: "clara",
					agent_id: "clara",
					surface: "cli",
					session_id: expect.stringContaining("user_voice_test"),
					history: expect.any(Array),
				}),
				expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer test-hermes-key" }) }),
			);
		});

		it("200 accepts text-only greeting (empty string)", async () => {
			(axios.post as jest.Mock).mockResolvedValueOnce({
				data: { reply_text: "hello", response_text: "hello" },
			});
			const res = await request(app)
				.post("/api/voice/converse")
				.send({ text: "", session_id: "s-greet", surface: "cli" });
			expect(res.status).toBe(200);
		});

		it("200 and strips forbidden substrings from proxied text fields (IP firewall)", async () => {
			const mockData = { transcript: "ok", response_text: "I am claude-3-opus for you", audio_base64: "Z==" };
			(axios.post as jest.Mock).mockResolvedValueOnce({ data: mockData });
			const res = await request(app).post("/api/voice/converse").send({ audio_base64: "AAAA", voice_id: "clara" });
			expect(res.status).toBe(200);
			expect(String(res.body.response_text)).not.toMatch(/claude/i);
		});

		it("prefers VOICE_SERVER_URL and CLARA_VOICE_API_KEY when both are set", async () => {
			process.env.VOICE_SERVER_URL = "https://voice.specific.example";
			process.env.CLARA_VOICE_API_KEY = "specific-key";
			(axios.post as jest.Mock).mockResolvedValueOnce({
				data: { transcript: "x", response_text: "y", audio_base64: "z" },
			});
			const res = await request(app).post("/api/voice/converse").send({ audio_base64: "BBBB" });
			expect(res.status).toBe(200);
			expect(axios.post).toHaveBeenCalledWith(
				"https://voice.specific.example/voice/converse",
				expect.anything(),
				expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer specific-key" }) }),
			);
		});

		it("502 when upstream throws", async () => {
			(axios.post as jest.Mock).mockRejectedValueOnce(new Error("network"));
			const res = await request(app).post("/api/voice/converse").send({ audio_base64: "CCCC" });
			expect(res.status).toBe(502);
		});

		it("increments voice usage after successful converse", async () => {
			(axios.post as jest.Mock).mockResolvedValueOnce({
				data: { transcript: "hi", response_text: "hello", audio_base64: "z" },
			});
			await request(app).post("/api/voice/converse").send({ audio_base64: "AAAA" });
			expect(voiceUsageService.incrementAfterSuccess).toHaveBeenCalledWith("user_voice_test", "free");
		});
	});

	describe("GET /api/voice/health", () => {
		it("200 and forwards voice server status when reachable", async () => {
			process.env.HERMES_GATEWAY_URL = "https://hermes.test.example";
			const mockHealth = { status: "ok", model: "xtts-v2" };
			(axios.get as jest.Mock) = jest.fn().mockResolvedValueOnce({ data: mockHealth });
			const res = await request(app).get("/api/voice/health");
			expect(res.status).toBe(200);
			expect(res.body.voice_server).toEqual(mockHealth);
		});

		it("503 when voice server is unreachable", async () => {
			process.env.HERMES_GATEWAY_URL = "https://hermes.test.example";
			(axios.get as jest.Mock) = jest.fn().mockRejectedValueOnce(new Error("ECONNREFUSED"));
			const res = await request(app).get("/api/voice/health");
			expect(res.status).toBe(503);
		});

		it("503 when no voice server URL is configured", async () => {
			delete process.env.HERMES_GATEWAY_URL;
			delete process.env.VOICE_SERVER_URL;
			delete process.env.CLARA_VOICE_URL;
			const res = await request(app).get("/api/voice/health");
			expect(res.status).toBe(503);
		});
	});
});
