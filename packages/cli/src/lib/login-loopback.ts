import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";

const CALLBACK_PATHS = new Set(["/", ""]);

export type CliAuthPayload = {
	email: string;
	/** Clerk session JWT for Bearer auth. */
	sessionToken: string;
	/** Clara API key (cc_live_* or sk-clara-*). */
	apiKey: string;
};

const SUCCESS_BODY = "Signed in. You can close this tab and return to the terminal.\n";

/**
 * Listens on 127.0.0.1:randomPort until a POST with JSON
 * `{ email, sessionToken, apiKey }` (aliases: session_token, api_key).
 * The web app at `https://claracode.ai/cli-auth?cli_port=<port>` should POST
 * the payload after the user completes sign-in.
 */
export async function startCliAuthLoopback(opts: {
	timeoutMs: number;
}): Promise<{ port: number; waitForCallback: () => Promise<CliAuthPayload>; close: () => void }> {
	let resolvePayload!: (v: CliAuthPayload) => void;
	let rejectPayload!: (e: Error) => void;
	const callbackPromise = new Promise<CliAuthPayload>((res, rej) => {
		resolvePayload = res;
		rejectPayload = rej;
	});

	let timeoutId: ReturnType<typeof setTimeout> | undefined;
	let settled = false;
	const finishTimer = () => {
		if (timeoutId !== undefined) {
			clearTimeout(timeoutId);
			timeoutId = undefined;
		}
	};

	const server: Server = createServer((req: IncomingMessage, res: ServerResponse) => {
		if (req.method !== "POST" || !CALLBACK_PATHS.has(req.url?.split("?")[0] ?? "")) {
			res.statusCode = 404;
			res.end();
			return;
		}
		const parts: Buffer[] = [];
		req.on("data", (c: Buffer) => {
			parts.push(c);
		});
		req.on("end", () => {
			if (settled) {
				return;
			}
			void (async () => {
				try {
					const text = Buffer.concat(parts).toString("utf8");
					const j = JSON.parse(text) as Record<string, unknown>;
					const email = getStr(j, "email");
					const sessionToken = getStr(j, "sessionToken", "session_token");
					const apiKey = getStr(j, "apiKey", "api_key");
					if (email.length === 0 || sessionToken.length === 0 || apiKey.length === 0) {
						if (!res.writableEnded) {
							res.statusCode = 400;
							res.setHeader("Content-Type", "text/plain; charset=utf-8");
							res.end("Missing email, sessionToken, or apiKey");
						}
						return;
					}
					if (settled) {
						return;
					}
					settled = true;
					finishTimer();
					res.statusCode = 200;
					res.setHeader("Content-Type", "text/plain; charset=utf-8");
					res.end(SUCCESS_BODY);
					try {
						server.close();
					} catch {
						// ignore
					}
					resolvePayload({ email, sessionToken, apiKey });
				} catch {
					if (!res.writableEnded) {
						res.statusCode = 400;
						res.setHeader("Content-Type", "text/plain; charset=utf-8");
						res.end("Invalid JSON");
					}
				}
			})().catch(() => {
				if (!res.writableEnded) {
					res.statusCode = 500;
					res.end();
				}
			});
		});
	});

	const close = () => {
		finishTimer();
		if (!settled) {
			settled = true;
			try {
				server.close();
			} catch {
				// ignore
			}
			rejectPayload(new Error("Sign-in cancelled. Start again, or run `clara doctor` to verify your setup."));
		}
	};

	timeoutId = setTimeout(() => {
		if (settled) {
			return;
		}
		settled = true;
		finishTimer();
		try {
			server.close();
		} catch {
			// ignore
		}
		rejectPayload(new Error("Sign-in timed out. Start again, or run `clara doctor` to verify your setup."));
	}, opts.timeoutMs);

	try {
		await new Promise<void>((onOk, onErr) => {
			server.listen(0, "127.0.0.1", () => {
				onOk();
			});
			server.on("error", (e) => {
				onErr(e);
			});
		});
	} catch (e) {
		finishTimer();
		if (!settled) {
			settled = true;
			rejectPayload(
				e instanceof Error ? e : new Error("Could not start local callback server. Run `clara doctor`."),
			);
		}
		throw e;
	}

	const address = server.address();
	if (address === null || typeof address === "string") {
		finishTimer();
		try {
			server.close();
		} catch {
			// ignore
		}
		if (!settled) {
			settled = true;
			rejectPayload(new Error("Could not read local callback address. Run `clara doctor`."));
		}
		throw new Error("Could not start local callback server. Run `clara doctor`.");
	}

	const waitForCallback = () =>
		callbackPromise.finally(() => {
			finishTimer();
		});

	return { port: address.port, waitForCallback, close };
}

function getStr(j: Record<string, unknown>, ...keys: string[]): string {
	for (const k of keys) {
		const v = j[k];
		if (typeof v === "string" && v.length > 0) {
			return v.trim();
		}
	}
	return "";
}
