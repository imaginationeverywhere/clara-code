import { randomBytes } from "node:crypto";
import { unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	postVoiceConverse,
	readGreetingFromCache,
	writeGreetingToCache,
} from "@imaginationeverywhere/clara-voice-client";
import type { Command } from "commander";
import { playAudioFile } from "../lib/play-audio-file.js";

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

/**
 * Optional Bearer token for `POST /voice/converse` (quikvoice / cp-team).
 */
function voiceApiKey(): string | undefined {
	const k = process.env.CLARA_VOICE_API_KEY?.trim();
	return k && k.length > 0 ? k : undefined;
}

export function registerGreetCommand(program: Command): void {
	program
		.command("greet")
		.description("Request Clara's voice greeting from the API and play the audio")
		.action(async () => {
			const base = process.env.CLARA_VOICE_URL?.trim();
			if (!base) {
				console.error("clara greet: set CLARA_VOICE_URL to your voice service base URL");
				process.exitCode = 1;
				return;
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
				return;
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
				return;
			}

			// Legacy: `POST …/voice/respond` (audio body) when /voice/converse has no audio or returns an error.
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
				console.error("clara greet: network error");
				if (err instanceof Error) {
					console.error(err.message);
				}
				if (!converse.ok) {
					console.error(`clara greet: (converse) ${converse.error}`);
				}
				process.exitCode = 1;
				return;
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
				console.error(`clara greet: request failed (${res.status}): ${message}`);
				if (!converse.ok) {
					console.error(`clara greet: (converse) ${converse.error}`);
				}
				process.exitCode = 1;
				return;
			}

			if (contentType?.includes("application/json")) {
				console.error("clara greet: expected audio but received JSON");
				process.exitCode = 1;
				return;
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
		});
}
