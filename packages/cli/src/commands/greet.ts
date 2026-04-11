import { randomBytes } from "node:crypto";
import { unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Command } from "commander";
import { readClaraCredentials } from "../lib/credentials-store.js";
import { playAudioFile } from "../lib/play-audio-file.js";

const GREET_URL = "https://clara-code-backend-dev.ngrok.quiknation.com/api/voice/greet";

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
			const creds = readClaraCredentials();
			if (!creds) {
				console.error("No credentials found. Run `clara auth login` first.");
				process.exitCode = 1;
				return;
			}

			let res: Response;
			try {
				res = await fetch(GREET_URL, {
					method: "POST",
					headers: {
						Authorization: `Bearer ${creds.token}`,
						Accept: "audio/*,*/*;q=0.9",
						"Content-Type": "application/json",
					},
					body: JSON.stringify({}),
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
			try {
				await playAudioFile(outPath);
			} finally {
				await unlink(outPath).catch(() => {});
			}
		});
}
