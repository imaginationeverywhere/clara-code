import { mapHttpError, NETWORK_FAILURE_MESSAGE } from "./http-errors.js";
import { parseMinutesFromResponse } from "./minutes.js";

export type GatewayResult = {
	ok: boolean;
	reply: string;
	fixHint?: string;
	/** From `X-Clara-Minutes-Remaining` when present. */
	minutesRemaining?: number | null;
};

/**
 * The permanent public URL for Clara's LLM gateway. Bakes into every CLI install so
 * a fresh `clara` doesn't require user configuration. The middleware that backs this
 * path ships from the Clara platform; transient 4xx/5xx before it lands is expected.
 */
export const DEFAULT_GATEWAY_URL = "https://api.claracode.ai/hermes";

export type ClaraGatewayOptions = {
	/** When set, adds `Authorization: Bearer …` to the request. */
	bearerToken?: string;
};

/**
 * POST JSON to the Clara gateway; returns structured text for TUI formatting.
 */
export async function claraGateway(
	gatewayUrl: string,
	userId: string,
	message: string,
	options: ClaraGatewayOptions = {},
): Promise<GatewayResult> {
	if (!gatewayUrl || gatewayUrl.trim().length === 0) {
		return {
			ok: false,
			reply: "Gateway URL is not configured.",
			fixHint: "Set CLARA_GATEWAY_URL, run `clara config set gatewayUrl <url>`, or pass --gateway.",
		};
	}
	const bearer = options.bearerToken?.trim();
	const headers: Record<string, string> = { "Content-Type": "application/json" };
	if (bearer) {
		headers.Authorization = `Bearer ${bearer}`;
	}
	let response: globalThis.Response;
	try {
		response = await fetch(gatewayUrl, {
			method: "POST",
			headers,
			body: JSON.stringify({
				platform: "tui",
				surface: "cli",
				user: userId,
				message,
			}),
		});
	} catch {
		return { ok: false, reply: NETWORK_FAILURE_MESSAGE, fixHint: NETWORK_FAILURE_MESSAGE };
	}

	const bodyText = await response.text().catch(() => "");
	const minutesRemaining = parseMinutesFromResponse(response);

	if (!response.ok) {
		const mapped = mapHttpError(response.status, bodyText, "cli");
		return { ok: false, reply: mapped.message, fixHint: mapped.message, minutesRemaining };
	}

	let data: Record<string, unknown>;
	try {
		data = JSON.parse(bodyText) as Record<string, unknown>;
	} catch {
		return { ok: true, reply: bodyText || "Clara has no response.", minutesRemaining };
	}

	const reply =
		(typeof data.reply === "string" && data.reply) ||
		(typeof data.text === "string" && data.text) ||
		(typeof data.message === "string" && data.message) ||
		bodyText ||
		"Clara has no response.";

	const ok = data.error !== true && data.ok !== false;
	const fixHint = typeof data.fix === "string" ? data.fix : undefined;

	return { ok, reply, fixHint, minutesRemaining };
}
