import { randomBytes } from "node:crypto";
import { unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	postVoiceConverse,
	readGreetingFromCache,
	writeGreetingToCache,
} from "@imaginationeverywhere/clara-voice-client";
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

/**
 * Fetches and plays the canonical greeting (cache → /voice/converse → /voice/respond).
 * Shared by `clara greet` and the default voice-converse entry.
 */
export async function playCanonicalGreeting(): Promise<GreetingResult> {
	const base = process.env.CLARA_VOICE_URL?.trim();
	if (!base) {
		return { ok: false, message: "set CLARA_VOICE_URL to your voice service base URL" };
	}

	const fromCache = await readGreetingFromCache();
	if (fromCache) {
		const ext = extensionForContentType(fromCache.contentType);
		const outPath = join(tmpdir(), `clara-greet-cached-${randomBytes(8).toString("hex")}${ext}`);
		await writeFile(outPath, fromCache.bytes);
		try {
			await playAudioFile(outPath);
		} finally {
			await unlink(outPath).catch(() => {});
		}
		return { ok: true };
	}

	const apiKey = voiceApiKey();
	const converse = await postVoiceConverse(base, { text: "" }, { apiKey });

	if (converse.ok && typeof converse.reply_audio_base64 === "string" && converse.reply_audio_base64.length > 0) {
		const buf = Buffer.from(converse.reply_audio_base64, "base64");
		const mimeHeader = (converse.mime_type ?? "audio/mpeg").split(";")[0]!.trim();
		const outPath = join(
			tmpdir(),
			`clara-greet-converse-${randomBytes(8).toString("hex")}${extensionForContentType(mimeHeader)}`,
		);
		await writeFile(outPath, buf);
		try {
			await writeGreetingToCache({
				bytes: buf,
				contentType: mimeHeader.length > 0 ? mimeHeader : "audio/mpeg",
			});
		} catch {
			// best-effort cache
		}
		try {
			await playAudioFile(outPath);
		} finally {
			await unlink(outPath).catch(() => {});
		}
		return { ok: true };
	}

	const respondUrl = `${base.replace(/\/$/, "")}/voice/respond`;
	let res: Response;
	try {
		res = await fetch(respondUrl, {
			method: "POST",
			headers: {
				Accept: "audio/*,*/*;q=0.9",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				agent: "clara",
				surface: "C1",
				message: "",
			}),
		});
	} catch (err) {
		const extra = !converse.ok ? `; converse: ${converse.error}` : "";
		return {
			ok: false,
			message: `network error${err instanceof Error ? ` (${err.message})` : ""}${extra}`,
		};
	}

	const contentType = res.headers.get("content-type");
	const buf = Buffer.from(await res.arrayBuffer());

	if (!res.ok) {
		let message = buf.toString("utf8");
		if (contentType?.includes("application/json")) {
			try {
				const parsed: unknown = JSON.parse(message);
				if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
					const obj = parsed as Record<string, unknown>;
					const errMsg = obj.error ?? obj.message;
					if (typeof errMsg === "string") {
						message = errMsg;
					}
				}
			} catch {
				// keep raw message
			}
		}
		const extra = !converse.ok ? `; converse: ${converse.error}` : "";
		return { ok: false, message: `request failed (${res.status}): ${message}${extra}` };
	}

	if (contentType?.includes("application/json")) {
		return { ok: false, message: "expected audio from /voice/respond but received JSON" };
	}

	const ext = extensionForContentType(contentType);
	const outPath = join(tmpdir(), `clara-greet-${randomBytes(8).toString("hex")}${ext}`);
	await writeFile(outPath, buf);
	const mimeForCache =
		contentType && contentType.length > 0 ? contentType.split(";")[0]!.trim() : "application/octet-stream";
	try {
		await writeGreetingToCache({ bytes: buf, contentType: mimeForCache });
	} catch {
		// best-effort cache
	}
	try {
		await playAudioFile(outPath);
	} finally {
		await unlink(outPath).catch(() => {});
	}
	return { ok: true };
}
