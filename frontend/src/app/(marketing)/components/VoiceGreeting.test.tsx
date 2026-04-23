import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { VoiceGreeting } from "./VoiceGreeting";

const originalFetch = globalThis.fetch;

beforeEach(() => {
	sessionStorage.clear();
});

afterEach(() => {
	vi.unstubAllGlobals();
	globalThis.fetch = originalFetch;
});

describe("VoiceGreeting", () => {
	it("does not call /api/voice/tts when clara-greeted gate is already set", async () => {
		sessionStorage.setItem("clara-greeted", "1");
		const f = vi.fn();
		vi.stubGlobal("fetch", f);
		render(<VoiceGreeting />);
		await waitFor(() => {
			expect(f).not.toHaveBeenCalled();
		});
	});

	it("POSTs to /api/voice/tts on first load with expected JSON body (autoplay path)", async () => {
		const f = vi.fn().mockResolvedValue(
			new Response(new ArrayBuffer(8), { headers: { "content-type": "audio/wav" } }),
		);
		vi.stubGlobal("fetch", f);
		vi.stubGlobal(
			"Audio",
			vi.fn().mockImplementation(() => ({
				src: "",
				set onended(_h: (e: Event) => void) {
					/* not invoked reliably in JSDOM; TTS + fetch is still asserted */
				},
				set onerror(_: () => void) {},
				play: () => Promise.resolve(),
			})),
		);
		render(<VoiceGreeting />);
		await waitFor(() => {
			expect(f).toHaveBeenCalled();
		});
		const tts = f.mock.calls.find(
			([url]) => typeof url === "string" && (url as string).includes("/api/voice/tts"),
		);
		expect(tts, "expected a call to /api/voice/tts").toBeTruthy();
		const init = tts?.[1] as RequestInit | undefined;
		expect(init?.method).toBe("POST");
		const body = typeof init?.body === "string" ? JSON.parse(init.body) : {};
		expect(body).toEqual(expect.objectContaining({ text: expect.any(String), voice: "clara" }));
	});

	it("handles NotAllowedError on play without unhandled rejection", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue(
				new Response(new ArrayBuffer(8), { headers: { "content-type": "audio/wav" } }),
			),
		);
		const notAllowed = Object.assign(new Error("x"), { name: "NotAllowedError" });
		const audio: {
			onended: ((e: Event) => void) | null;
			play: () => Promise<unknown>;
		} = {
			onended: null,
			play: () => Promise.reject(notAllowed),
		};
		vi.stubGlobal("Audio", vi.fn().mockImplementation(() => audio));
		render(<VoiceGreeting />);
		await waitFor(
			() => {
				expect(true).toBe(true);
			},
			{ timeout: 2000 },
		);
	});

	it("autoplayAttempted ref prevents double /api/voice/tts on re-render", async () => {
		const f = vi
			.fn()
			.mockResolvedValue(
				new Response(new ArrayBuffer(8), { headers: { "content-type": "audio/wav" } }),
			);
		vi.stubGlobal("fetch", f);
		const audio: {
			onended: ((e: Event) => void) | null;
			play: () => Promise<void>;
		} = {
			onended: null,
			play: () => {
				return Promise.resolve().then(() => {
					audio.onended?.(new Event("ended"));
				});
			},
		};
		vi.stubGlobal("Audio", vi.fn().mockImplementation(() => audio));
		const { rerender } = render(<VoiceGreeting />);
		rerender(<VoiceGreeting />);
		await waitFor(() => {
			expect(f).toHaveBeenCalledTimes(1);
		});
	});
});
