import { randomBytes } from "node:crypto";
import { unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	type ConverseResult,
	postVoiceConverse,
	readGreetingFromCache,
	writeGreetingToCache,
} from "@imaginationeverywhere/clara-voice-client";
import { resolveBackendUrl } from "./backend.js";
import { readClaraConfig } from "./config-store.js";
import { playAudioFile } from "./play-audio-file.js";

function extensionForContentType(contentType: string | null): string {
	if (!contentType) {
		return ".bin";
	}
	const lower = contentType.toLowerCase();
	if (lower.includes("mpeg") || lower.includes("mp3")) {
		return ".mp3";
	}
	if (lower.includes("wav")) {
		return ".wav";
	}
	if (lower.includes("ogg")) {
		return ".ogg";
	}
	if (lower.includes("webm")) {
		return ".webm";
	}
	return ".bin";
}

function voiceApiKey(): string | undefined {
	const k = process.env.CLARA_VOICE_API_KEY?.trim();
	return k && k.length > 0 ? k : undefined;
}

export type GreetingResult = { ok: true } | { ok: false; message: string };

/** Injected for tests; default uses the real @imaginationeverywhere/clara-voice-client + `globalThis.fetch`. */
export type GreetingDeps = {
	postVoiceConverse: typeof postVoiceConverse;
	readGreetingFromCache: typeof readGreetingFromCache;
	writeGreetingToCache: typeof writeGreetingToCache;
	playAudioFile: typeof playAudioFile;
	fetch: typeof globalThis.fetch;
};

const defaultGreetingDeps = (): GreetingDeps => ({
	postVoiceConverse,
	readGreetingFromCache,
	writeGreetingToCache,
	playAudioFile,
	fetch: globalThis.fetch,
});

export type PlayGreetingOptions = { refresh?: boolean; deps?: Partial<GreetingDeps> };

/**
 * Fetches and plays the canonical greeting (cache → /voice/converse with optional TTS, no /voice/respond).
 * Shared by `clara greet` and the default voice-converse entry.
 */
const CLARA_VOICE_API_BASE = "https://api.claracode.ai/api";

export async function playCanonicalGreeting(options?: PlayGreetingOptions): Promise<GreetingResult> {
	const d: GreetingDeps = { ...defaultGreetingDeps(), ...options?.deps };
	const base = process.env.CLARA_VOICE_URL?.trim() || CLARA_VOICE_API_BASE;

	const fromCache = options?.refresh ? null : await d.readGreetingFromCache();
	if (fromCache) {
		const ext = extensionForContentType(fromCache.contentType);
		const outPath = join(tmpdir(), `clara-greet-cached-${randomBytes(8).toString("hex")}${ext}`);
		await writeFile(outPath, fromCache.bytes);
		try {
			await d.playAudioFile(outPath);
		} catch {
			return { ok: false, message: "audio playback failed" };
		} finally {
			await unlink(outPath).catch(() => {});
		}
		return { ok: true };
	}

	const apiKey = voiceApiKey();
	const sessionId = readClaraConfig().userId ?? "dev";
	const converse: ConverseResult = await d.postVoiceConverse(base, { text: "", session_id: sessionId }, { apiKey });

	if (converse.ok && typeof converse.reply_audio_base64 === "string" && converse.reply_audio_base64.length > 0) {
		const buf = Buffer.from(converse.reply_audio_base64, "base64");
		const mimeHeader = (converse.mime_type ?? "audio/mpeg").split(";")[0]!.trim();
		const outPath = join(
			tmpdir(),
			`clara-greet-converse-${randomBytes(8).toString("hex")}${extensionForContentType(mimeHeader)}`,
		);
		await writeFile(outPath, buf);
		try {
			await d.writeGreetingToCache({
				bytes: buf,
				contentType: mimeHeader.length > 0 ? mimeHeader : "audio/mpeg",
			});
		} catch {
			// best-effort cache
		}
		try {
			await d.playAudioFile(outPath);
		} catch {
			return { ok: false, message: "audio playback failed" };
		} finally {
			await unlink(outPath).catch(() => {});
		}
		return { ok: true };
	}

	if (converse.ok && typeof converse.reply_text === "string" && converse.reply_text.length > 0) {
		const backend = resolveBackendUrl();
		let ttsRes: Response;
		try {
			ttsRes = await d.fetch(`${backend.url}/api/voice/tts`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text: converse.reply_text }),
				signal: AbortSignal.timeout(15_000),
			});
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			return { ok: false, message: `TTS request failed: ${msg}` };
		}

		if (!ttsRes.ok) {
			return { ok: false, message: `TTS request failed: HTTP ${ttsRes.status}` };
		}

		const contentType = ttsRes.headers.get("content-type");
		const buf = Buffer.from(await ttsRes.arrayBuffer());
		const ext = extensionForContentType(contentType);
		const outPath = join(tmpdir(), `clara-greet-tts-${randomBytes(8).toString("hex")}${ext}`);
		const mimeForCache = contentType && contentType.length > 0 ? contentType.split(";")[0]!.trim() : "audio/mpeg";
		try {
			await writeFile(outPath, buf);
		} catch {
			return { ok: false, message: "greeting I/O failed" };
		}
		try {
			try {
				await d.writeGreetingToCache({ bytes: buf, contentType: mimeForCache });
			} catch {
				// best-effort
			}
			try {
				await d.playAudioFile(outPath);
			} catch {
				return { ok: false, message: "audio playback failed" };
			}
		} finally {
			await unlink(outPath).catch(() => {});
		}
		return { ok: true };
	}

	if (!converse.ok) {
		return {
			ok: false,
			message: `voice service: ${converse.error}${converse.offline ? " (offline)" : ""}`,
		};
	}

	return { ok: false, message: "greeting: no text or audio from voice service" };
}
