import { type ChildProcess, spawn, spawnSync } from "node:child_process";
import type { Readable } from "node:stream";

export type AudioCapture = {
	/** True when a real microphone capture is running; false when the noop fallback is active. */
	readonly isReal: boolean;
	/** Cancel any in-flight capture and return an empty buffer. Safe to call multiple times. */
	cancel(): void;
	/** Stop capture and resolve with captured audio (empty Buffer for the noop fallback). */
	stop(): Promise<Buffer>;
};

/**
 * Start an audio capture session.
 *
 * Prefers `sox`/`rec` (the `sox` CLI) since it is widely packaged on macOS (`brew install sox`) and
 * Linux (`apt install sox`) and requires no native npm dependency. When sox is unavailable we
 * return a noop capture so the CLI still drives end-to-end against the backend dev stub, which
 * manufactures a transcript without real audio.
 */
export function startCapture(): AudioCapture {
	const tool = findSoxTool();
	if (!tool) return noopCapture();
	return realCapture(tool);
}

function findSoxTool(): "rec" | "sox" | null {
	if (which("rec")) return "rec";
	if (which("sox")) return "sox";
	return null;
}

function which(cmd: string): boolean {
	try {
		const result = spawnSync(process.platform === "win32" ? "where" : "which", [cmd], {
			stdio: "ignore",
		});
		return result.status === 0;
	} catch {
		return false;
	}
}

function noopCapture(): AudioCapture {
	let cancelled = false;
	return {
		isReal: false,
		cancel() {
			cancelled = true;
		},
		async stop() {
			if (cancelled) return Buffer.alloc(0);
			return Buffer.alloc(0);
		},
	};
}

function realCapture(tool: "rec" | "sox"): AudioCapture {
	// 16 kHz mono 16-bit PCM WAV on stdout — matches what Hermes expects.
	const args =
		tool === "rec"
			? ["-q", "-r", "16000", "-c", "1", "-b", "16", "-t", "wav", "-"]
			: ["-q", "-d", "-r", "16000", "-c", "1", "-b", "16", "-t", "wav", "-"];

	let child: ChildProcess | null = null;
	try {
		child = spawn(tool, args, { stdio: ["ignore", "pipe", "ignore"] });
	} catch {
		return noopCapture();
	}
	const proc = child;
	const stdout = proc.stdout as Readable | null;
	if (!stdout) {
		return noopCapture();
	}
	const chunks: Buffer[] = [];
	let closed = false;
	let cancelled = false;
	stdout.on("data", (chunk: Buffer) => {
		chunks.push(chunk);
	});
	proc.on("close", () => {
		closed = true;
	});
	proc.on("error", () => {
		closed = true;
	});

	return {
		isReal: true,
		cancel() {
			cancelled = true;
			if (!closed) {
				try {
					proc.kill("SIGTERM");
				} catch {
					// best-effort
				}
			}
		},
		async stop() {
			if (!closed) {
				try {
					proc.kill("SIGTERM");
				} catch {
					// best-effort
				}
				await new Promise<void>((resolve) => {
					if (closed) {
						resolve();
						return;
					}
					const done = (): void => resolve();
					proc.once("close", done);
					proc.once("error", done);
				});
			}
			if (cancelled) return Buffer.alloc(0);
			return Buffer.concat(chunks);
		},
	};
}

/**
 * Record for a fixed duration, then return raw audio as base64 (clone flow for `/api/agents/configure`).
 */
export async function captureVoiceSample(options: { durationSeconds: number }): Promise<string> {
	const cap = startCapture();
	await new Promise<void>((resolve) => {
		setTimeout(resolve, options.durationSeconds * 1000);
	});
	const buf = await cap.stop();
	return buf.toString("base64");
}
