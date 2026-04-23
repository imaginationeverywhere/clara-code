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

void test("postVoiceConverse returns {ok:false} on HTTP 4xx", async (t) => {
	const server: Server = createServer((_req, res) => {
		res.statusCode = 400;
		res.setHeader("Content-Type", "application/json");
		res.end(JSON.stringify({ error: "bad request" }));
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

	const result = await postVoiceConverse(`http://127.0.0.1:${port}`, { text: "x" });
	assert.equal(result.ok, false);
});

void test("postVoiceConverse maps Hermes 'reply' field", async (t) => {
	const server: Server = createServer((_req, res) => {
		res.setHeader("Content-Type", "application/json");
		res.end(JSON.stringify({ reply: "hello from hermes" }));
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
		assert.equal(result.reply_text, "hello from hermes");
	}
});

void test("postVoiceConverse maps 'replyText' camelCase alias", async (t) => {
	const server: Server = createServer((_req, res) => {
		res.setHeader("Content-Type", "application/json");
		res.end(JSON.stringify({ replyText: "camel case reply" }));
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
		assert.equal(result.reply_text, "camel case reply");
	}
});

void test("postVoiceConverse with empty base returns configuration error", async () => {
	const result = await postVoiceConverse("", { text: "x" });
	assert.equal(result.ok, false);
	if (!result.ok) {
		assert.ok(result.error.length > 0);
		assert.equal(result.offline, undefined);
	}
});

void test("postVoiceConverse respects abort signal", async (t) => {
	const server: Server = createServer(() => {
		// Deliberately never send a response; abort cancels the fetch
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

	const ac = new AbortController();
	const promise = postVoiceConverse(`http://127.0.0.1:${port}`, { text: "x" }, { signal: ac.signal });
	ac.abort();
	const result = await promise;
	assert.equal(result.ok, false);
	if (!result.ok) {
		assert.equal(result.error, "Aborted");
	}
});
