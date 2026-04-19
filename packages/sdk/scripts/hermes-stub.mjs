#!/usr/bin/env node
/**
 * Minimal Hermes-compatible HTTP stub for local SDK development.
 * Listens on PORT (default 18765). Requires Authorization: Bearer <token>.
 */
import http from "node:http";
import { URL } from "node:url";

const port = Number.parseInt(process.env.PORT ?? "18765", 10);
const expectedToken = process.env.HERMES_STUB_TOKEN ?? "stub-api-key";

function unauthorized(res) {
	res.writeHead(401, { "Content-Type": "application/json" });
	res.end(JSON.stringify({ error: "unauthorized" }));
}

function readBody(req) {
	return new Promise((resolve, reject) => {
		const chunks = [];
		req.on("data", (c) => chunks.push(c));
		req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
		req.on("error", reject);
	});
}

function checkAuth(req) {
	const auth = req.headers.authorization;
	if (!auth || !auth.startsWith("Bearer ")) return false;
	const token = auth.slice("Bearer ".length);
	return token === expectedToken;
}

const server = http.createServer(async (req, res) => {
	if (!checkAuth(req)) {
		unauthorized(res);
		return;
	}

	try {
		const url = new URL(req.url ?? "/", `http://127.0.0.1:${port}`);
		const path = url.pathname.replace(/\/$/, "") || "/";

		if (req.method === "POST" && path === "/v1/ask") {
			const raw = await readBody(req);
			const body = JSON.parse(raw || "{}");
			const prompt = typeof body.prompt === "string" ? body.prompt : "";
			res.writeHead(200, { "Content-Type": "application/json" });
			res.end(
				JSON.stringify({
					message: {
						role: "assistant",
						content: `stub reply: ${prompt}`,
						voiceUrl: undefined,
					},
				}),
			);
			return;
		}

		if (req.method === "POST" && path === "/v1/stream") {
			const raw = await readBody(req);
			const body = JSON.parse(raw || "{}");
			const prompt = typeof body.prompt === "string" ? body.prompt : "";
			const chunks = ["stream:", " ", String(prompt).slice(0, 64)];
			res.writeHead(200, {
				"Content-Type": "text/event-stream; charset=utf-8",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
			});
			for (const c of chunks) {
				res.write(`data: ${c}\n\n`);
			}
			res.end();
			return;
		}

		if (req.method === "POST" && path === "/v1/voice/sessions") {
			res.writeHead(200, { "Content-Type": "application/json" });
			res.end(JSON.stringify({ id: `vs_${Date.now().toString(36)}` }));
			return;
		}

		const voiceMsg = /^\/v1\/voice\/sessions\/([^/]+)\/messages$/.exec(path);
		if (req.method === "POST" && voiceMsg) {
			await readBody(req);
			res.writeHead(200, { "Content-Type": "application/json" });
			res.end(
				JSON.stringify({
					message: {
						role: "assistant",
						content: "stub voice response",
						voiceUrl: "https://example.com/audio/stub.opus",
					},
				}),
			);
			return;
		}

		const voiceDel = /^\/v1\/voice\/sessions\/([^/]+)$/.exec(path);
		if (req.method === "DELETE" && voiceDel) {
			res.writeHead(204);
			res.end();
			return;
		}

		if (req.method === "POST" && path === "/v1/agents") {
			const raw = await readBody(req);
			const body = JSON.parse(raw || "{}");
			const name = typeof body.name === "string" ? body.name : "agent";
			const soul = typeof body.soul === "string" ? body.soul : "";
			const id = `ag_${Date.now().toString(36)}`;
			res.writeHead(200, { "Content-Type": "application/json" });
			res.end(JSON.stringify({ id, name, soul }));
			return;
		}

		const agentAsk = /^\/v1\/agents\/([^/]+)\/ask$/.exec(path);
		if (req.method === "POST" && agentAsk) {
			const raw = await readBody(req);
			const body = JSON.parse(raw || "{}");
			const prompt = typeof body.prompt === "string" ? body.prompt : "";
			res.writeHead(200, { "Content-Type": "application/json" });
			res.end(
				JSON.stringify({
					message: {
						role: "assistant",
						content: `agent ${agentAsk[1]} says: ${prompt}`,
					},
				}),
			);
			return;
		}

		const agentStream = /^\/v1\/agents\/([^/]+)\/stream$/.exec(path);
		if (req.method === "POST" && agentStream) {
			await readBody(req);
			res.writeHead(200, {
				"Content-Type": "text/event-stream; charset=utf-8",
				"Cache-Control": "no-cache",
			});
			res.write("data: agent\n\n");
			res.write("data: stream\n\n");
			res.end();
			return;
		}

		res.writeHead(404, { "Content-Type": "application/json" });
		res.end(JSON.stringify({ error: "not found", path }));
	} catch (e) {
		res.writeHead(500, { "Content-Type": "application/json" });
		res.end(JSON.stringify({ error: String(e) }));
	}
});

server.listen(port, "127.0.0.1", () => {
	process.stderr.write(`hermes-stub listening on http://127.0.0.1:${port}\n`);
});
