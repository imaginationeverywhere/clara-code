import { spawn } from "node:child_process";
import path from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, expect, test } from "vitest";
import { createClient } from "../src/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const stubScript = path.join(__dirname, "..", "scripts", "hermes-stub.mjs");

let port = 18765;
let stub: ReturnType<typeof spawn> | undefined;

function waitForLine(proc: ReturnType<typeof spawn>, needle: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const stderr = proc.stderr;
		if (stderr == null) {
			reject(new Error("stderr unavailable"));
			return;
		}
		const rl = createInterface({ input: stderr });
		const t = setTimeout(() => {
			rl.close();
			reject(new Error("timeout waiting for stub"));
		}, 5000);
		rl.on("line", (line) => {
			if (line.includes(needle)) {
				clearTimeout(t);
				rl.close();
				resolve();
			}
		});
		proc.on("error", reject);
		proc.on("exit", (code) => {
			if (code !== 0 && code !== null) {
				clearTimeout(t);
				reject(new Error(`stub exited ${code}`));
			}
		});
	});
}

beforeAll(async () => {
	port = 20000 + Math.floor(Math.random() * 1000);
	stub = spawn(process.execPath, [stubScript], {
		env: { ...process.env, PORT: String(port), HERMES_STUB_TOKEN: "test-token" },
		stdio: ["ignore", "ignore", "pipe"],
	});
	await waitForLine(stub, "listening");
});

afterAll(async () => {
	if (stub) {
		stub.kill("SIGTERM");
		await new Promise((r) => setTimeout(r, 100));
	}
});

test("ask() against local Hermes stub", async () => {
	const client = createClient({
		apiKey: "test-token",
		hermesUrl: `http://127.0.0.1:${port}`,
	});
	const msg = await client.ask("hello");
	expect(msg.role).toBe("assistant");
	expect(msg.content).toContain("stub reply:");
	expect(msg.content).toContain("hello");
});
