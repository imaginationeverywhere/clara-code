import { strict as assert } from "node:assert/strict";
import { createServer, type Server } from "node:http";
import { test } from "node:test";
import { postVoiceConverse, resolveConverseUrl } from "../src/converse.js";

test("resolveConverseUrl appends /voice/converse", () => {
	const u = resolveConverseUrl("https://voice.example.com/");
	assert.equal(u, "https://voice.example.com/voice/converse");
});

void test("postVoiceConverse returns JSON result when server returns JSON", async (t) => {
	const server: Server = createServer((req, res) => {
		if (req.url === "/voice/converse" && req.method === "POST") {
			res.setHeader("Content-Type", "application/json");
			res.end(JSON.stringify({ reply_text: "hi", ok: true }));
		} else {
			res.statusCode = 404;
			res.end();
		}
	});
	const port: number = await new Promise((resolve) => {
		server.listen(0, "127.0.0.1", () => {
			const a = server.address();
			assert.ok(a && typeof a === "object" && "port" in a);
			resolve((a as { port: number }).port);
		});
	});
	t.after(
		() =>
			new Promise<void>((r) => {
				server.close(() => r());
			}),
	);
	const result = await postVoiceConverse(`http://127.0.0.1:${port}`, { text: "ping" });
	assert.equal(result.ok, true);
	if (result.ok) {
		assert.equal(result.reply_text, "hi");
	}
});

void test("postVoiceConverse is offline-safe on bad host", async () => {
	const r = await postVoiceConverse("http://127.0.0.1:1", { text: "x" });
	assert.equal(r.ok, false);
	if (!r.ok) {
		assert.equal(r.offline, true);
	}
});
