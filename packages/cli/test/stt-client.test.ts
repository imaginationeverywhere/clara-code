import { strict as assert } from "node:assert";
import { afterEach, describe, it } from "node:test";
import { requestTranscript } from "../src/lib/stt-client.js";

type FetchCall = { url: string; init: RequestInit | undefined };
const originalFetch = globalThis.fetch;

function stubFetch(response: { ok: boolean; status?: number; body: string }): FetchCall[] {
	const calls: FetchCall[] = [];
	globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
		calls.push({ url: String(input), init });
		const headers = new Headers();
		return new Response(response.body, { status: response.status ?? (response.ok ? 200 : 500), headers });
	};
	return calls;
}

describe("requestTranscript", () => {
	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	it("sends base64 audio and Authorization Bearer", async () => {
		const calls = stubFetch({ ok: true, body: JSON.stringify({ transcript: "hello", stub: false }) });
		const audio = Buffer.from([1, 2, 3, 4]);
		const res = await requestTranscript({
			backendUrl: "http://localhost:3001",
			token: "sk-clara-abc",
			audio,
		});
		assert.equal(res.transcript, "hello");
		assert.equal(res.stub, false);
		assert.equal(calls.length, 1);
		assert.equal(calls[0].url, "http://localhost:3001/api/voice/stt");
		const init = calls[0].init;
		assert.ok(init);
		const headers = init.headers as Record<string, string>;
		assert.equal(headers.Authorization, "Bearer sk-clara-abc");
		assert.equal(headers["Content-Type"], "application/json");
		const body = JSON.parse(String(init.body)) as { audioBase64: string; mimeType: string };
		assert.equal(body.audioBase64, audio.toString("base64"));
		assert.equal(body.mimeType, "audio/wav");
	});

	it("forwards stubText as header and body field", async () => {
		const calls = stubFetch({ ok: true, body: JSON.stringify({ transcript: "mock", stub: true }) });
		await requestTranscript({
			backendUrl: "http://localhost:3001",
			token: "sk-clara-abc",
			audio: Buffer.alloc(0),
			stubText: "hello world",
		});
		const init = calls[0].init;
		const headers = init?.headers as Record<string, string>;
		assert.equal(headers["x-clara-stub-text"], "hello world");
		const body = JSON.parse(String(init?.body)) as { stubText?: string; audioBase64: string };
		assert.equal(body.stubText, "hello world");
		assert.equal(body.audioBase64, "");
	});

	it("throws with status on non-2xx responses", async () => {
		stubFetch({ ok: false, status: 502, body: JSON.stringify({ error: "gateway down" }) });
		await assert.rejects(
			() =>
				requestTranscript({
					backendUrl: "http://localhost:3001",
					token: "sk-clara-abc",
					audio: Buffer.alloc(0),
				}),
			/stt 502/,
		);
	});

	it("returns { stub: true } when backend marks it so", async () => {
		stubFetch({ ok: true, body: JSON.stringify({ transcript: "stub-txt", stub: true }) });
		const res = await requestTranscript({
			backendUrl: "http://localhost:3001",
			token: "x",
			audio: Buffer.alloc(0),
		});
		assert.equal(res.stub, true);
		assert.equal(res.transcript, "stub-txt");
	});

	it("propagates AbortError from signal", async () => {
		globalThis.fetch = async (_input: RequestInfo | URL, init?: RequestInit) => {
			if (init?.signal?.aborted) {
				const err = new Error("aborted");
				err.name = "AbortError";
				throw err;
			}
			return new Response("{}");
		};
		const controller = new AbortController();
		controller.abort();
		await assert.rejects(
			() =>
				requestTranscript({
					backendUrl: "http://localhost:3001",
					token: "x",
					audio: Buffer.alloc(0),
					signal: controller.signal,
				}),
			(err: Error) => err.name === "AbortError",
		);
	});
});
