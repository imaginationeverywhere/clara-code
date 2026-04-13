import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { POST } from "@/app/api/voice/chat/route";
import { resetIpRateLimitForTests } from "@/lib/ip-rate-limit";

describe("POST /api/voice/chat", () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		resetIpRateLimitForTests();
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	test("returns Hermes response on success", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ text: "Hello", audio_url: "https://example.com/a.mp3" }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			}),
		);

		const req = new Request("http://local.test/api/voice/chat", {
			method: "POST",
			headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.1" },
			body: JSON.stringify({ message: "Hi Clara" }),
		});

		const res = await POST(req);
		expect(res.status).toBe(200);
		const json = (await res.json()) as { text: string; audio_url: string | null };
		expect(json.text).toBe("Hello");
		expect(json.audio_url).toBe("https://example.com/a.mp3");
		expect(globalThis.fetch).toHaveBeenCalledWith(
			expect.stringMatching(/hermes-gateway/),
			expect.objectContaining({
				method: "POST",
				body: JSON.stringify({ platform: "web", user: "guest", message: "Hi Clara" }),
			}),
		);
	});

	test("returns graceful degradation when Hermes is unreachable", async () => {
		globalThis.fetch = vi.fn().mockRejectedValue(new Error("network down"));

		const req = new Request("http://local.test/api/voice/chat", {
			method: "POST",
			headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.2" },
			body: JSON.stringify({ message: "Hello" }),
		});

		const res = await POST(req);
		expect(res.status).toBe(200);
		const json = (await res.json()) as { text: string; audio_url: string | null };
		expect(json.text).toBe("Clara is unavailable right now.");
		expect(json.audio_url).toBeNull();
	});

	test("returns 400 if message field is missing", async () => {
		globalThis.fetch = vi.fn();

		const req = new Request("http://local.test/api/voice/chat", {
			method: "POST",
			headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.3" },
			body: JSON.stringify({}),
		});

		const res = await POST(req);
		expect(res.status).toBe(400);
		expect(globalThis.fetch).not.toHaveBeenCalled();
	});
});
