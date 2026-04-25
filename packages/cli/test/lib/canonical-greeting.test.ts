import { strict as assert } from "node:assert";
import { afterEach, beforeEach, describe, it } from "node:test";
import type { ConverseResult } from "@imaginationeverywhere/clara-voice-client";
import { playCanonicalGreeting } from "../../src/lib/canonical-greeting.js";

function okAudio(): ConverseResult {
	return { ok: true, reply_audio_base64: "AAAA", mime_type: "audio/mpeg" };
}

describe("playCanonicalGreeting", () => {
	let base: string | undefined;
	let key: string | undefined;

	beforeEach(() => {
		base = process.env.CLARA_VOICE_URL;
		key = process.env.CLARA_VOICE_API_KEY;
		process.env.CLARA_VOICE_URL = "https://voice.test.example";
		delete process.env.CLARA_VOICE_API_KEY;
	});
	afterEach(() => {
		if (base === undefined) {
			delete process.env.CLARA_VOICE_URL;
		} else {
			process.env.CLARA_VOICE_URL = base;
		}
		if (key === undefined) {
			delete process.env.CLARA_VOICE_API_KEY;
		} else {
			process.env.CLARA_VOICE_API_KEY = key;
		}
	});

	it("returns ok=true from cache without calling postVoiceConverse", async () => {
		let postCalls = 0;
		const r = await playCanonicalGreeting({
			deps: {
				readGreetingFromCache: async () => ({ bytes: Buffer.from([0, 1, 2]), contentType: "audio/mpeg" }),
				writeGreetingToCache: async () => {},
				postVoiceConverse: async () => {
					postCalls++;
					return { ok: false, error: "should not be called" };
				},
				playAudioFile: async (path) => {
					assert.match(path, /clara-greet-cached/);
					assert.ok(path.endsWith(".mp3"));
				},
				fetch: globalThis.fetch,
			},
		});
		assert.equal(postCalls, 0);
		assert.equal(r.ok, true);
	});

	it("on cache miss calls postVoiceConverse, writes cache, and plays reply audio", async () => {
		const writes: { bytes: Buffer; contentType: string }[] = [];
		const playCalls: string[] = [];
		const r = await playCanonicalGreeting({
			deps: {
				readGreetingFromCache: async () => null,
				writeGreetingToCache: async (g) => {
					writes.push(g);
				},
				postVoiceConverse: async () => okAudio(),
				playAudioFile: async (p) => {
					playCalls.push(p);
				},
				fetch: globalThis.fetch,
			},
		});
		assert.equal(r.ok, true);
		assert.equal(writes.length, 1);
		assert.equal(writes[0]!.contentType, "audio/mpeg");
		assert.equal(playCalls.length, 1);
	});

	it("uses TTS from backend when postVoiceConverse returns reply text only", async () => {
		const fetches: string[] = [];
		const origFetch = globalThis.fetch;
		const mockFetch: typeof globalThis.fetch = async (input) => {
			const u = typeof input === "string" ? input : (input as Request).url;
			fetches.push(u);
			if (u.includes("/api/voice/tts")) {
				return new Response(new Uint8Array([1, 2, 3]), {
					status: 200,
					headers: { "content-type": "audio/wav" },
				});
			}
			return new Response("nope", { status: 404 });
		};
		const prevBackend = process.env.CLARA_BACKEND_URL;
		process.env.CLARA_BACKEND_URL = "https://api.claracode.ai";
		globalThis.fetch = mockFetch;
		try {
			const r = await playCanonicalGreeting({
				deps: {
					readGreetingFromCache: async () => null,
					writeGreetingToCache: async () => {},
					postVoiceConverse: async () => ({ ok: true, reply_text: "hi" }),
					playAudioFile: async () => {},
					// Merged with defaultGreetingDeps: fetch is globalThis.fetch
				},
			});
			assert.equal(r.ok, true);
		} finally {
			globalThis.fetch = origFetch;
			if (prevBackend === undefined) {
				delete process.env.CLARA_BACKEND_URL;
			} else {
				process.env.CLARA_BACKEND_URL = prevBackend;
			}
		}
		assert.ok(fetches.some((u) => u.includes("api.claracode.ai") && u.includes("/api/voice/tts")));
	});

	it("returns ok=false when postVoiceConverse fails and no TTS is reached", async () => {
		const fetches: string[] = [];
		const r = await playCanonicalGreeting({
			deps: {
				readGreetingFromCache: async () => null,
				writeGreetingToCache: async () => {},
				postVoiceConverse: async () => ({ ok: false, error: "bad" }),
				playAudioFile: async () => {},
				fetch: (async (input: string | URL) => {
					fetches.push(String(input));
					return new Response("", { status: 500 });
				}) as typeof globalThis.fetch,
			},
		});
		assert.equal(r.ok, false);
		assert.match((r as { ok: false }).message, /bad/);
		assert.equal(fetches.length, 0);
	});

	it("returns ok=false when reply text is present but TTS fetch throws", async () => {
		const r = await playCanonicalGreeting({
			deps: {
				readGreetingFromCache: async () => null,
				writeGreetingToCache: async () => {},
				postVoiceConverse: async () => ({ ok: true, reply_text: "hi" }),
				playAudioFile: async () => {},
				fetch: (async () => {
					throw new Error("network");
				}) as typeof globalThis.fetch,
			},
		});
		assert.equal(r.ok, false);
		assert.match((r as { ok: false }).message, /TTS request failed/);
	});

	it("returns ok=false immediately when CLARA_VOICE_URL is not set", async () => {
		delete process.env.CLARA_VOICE_URL;
		const r = await playCanonicalGreeting({
			deps: {
				readGreetingFromCache: async () => {
					assert.fail("readGreeting should not be called");
				},
				writeGreetingToCache: async () => {},
				postVoiceConverse: async () => {
					assert.fail("post should not be called");
				},
				playAudioFile: async () => {},
				fetch: globalThis.fetch,
			},
		});
		assert.deepEqual(r, { ok: false, message: "set CLARA_VOICE_URL to your voice service base URL" });
	});

	it("returns ok=true when playing from converse reply even if cache write throws", async () => {
		const r = await playCanonicalGreeting({
			deps: {
				readGreetingFromCache: async () => null,
				writeGreetingToCache: async () => {
					throw new Error("disk");
				},
				postVoiceConverse: async () => okAudio(),
				playAudioFile: async () => {},
				fetch: globalThis.fetch,
			},
		});
		assert.equal(r.ok, true);
	});

	it("returns ok=false when playAudioFile throws in cache path", async () => {
		const r = await playCanonicalGreeting({
			deps: {
				readGreetingFromCache: async () => ({ bytes: Buffer.from([1]), contentType: "audio/mpeg" }),
				writeGreetingToCache: async () => {},
				postVoiceConverse: async () => {
					assert.fail("post should not be called");
				},
				playAudioFile: async () => {
					throw new Error("spk");
				},
				fetch: globalThis.fetch,
			},
		});
		assert.deepEqual(r, { ok: false, message: "audio playback failed" });
	});

	it("bypasses cache when refresh is true (still calls postVoiceConverse when cache would hit)", async () => {
		let postCalls = 0;
		const r = await playCanonicalGreeting({
			refresh: true,
			deps: {
				readGreetingFromCache: async () => ({ bytes: Buffer.from([9]), contentType: "audio/mpeg" }),
				writeGreetingToCache: async () => {},
				postVoiceConverse: async () => {
					postCalls++;
					return okAudio();
				},
				playAudioFile: async () => {},
				fetch: globalThis.fetch,
			},
		});
		assert.equal(postCalls, 1);
		assert.equal(r.ok, true);
	});
});
