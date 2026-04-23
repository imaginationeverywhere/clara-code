import { randomBytes } from "node:crypto";
import { unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readGreetingFromCache, writeGreetingToCache } from "@imaginationeverywhere/clara-voice-client";
import type { Command } from "commander";
import { playAudioFile } from "../lib/play-audio-file.js";

function voiceRespondUrl(): string | null {
	const base = process.env.CLARA_VOICE_URL?.trim();
	if (!base) return null;
	return `${base.replace(/\/$/, "")}/voice/respond`;
}

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

export function registerGreetCommand(program: Command): void {
	program
		.command("greet")
		.description("Request Clara's voice greeting from the API and play the audio")
		.action(async () => {
			const url = voiceRespondUrl();
			if (!url) {
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

			let res: Response;
			try {
				res = await fetch(url, {
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
				// cache is best-effort; still play
			}
			try {
				await playAudioFile(outPath);
			} finally {
				await unlink(outPath).catch(() => {});
			}
		});
}
