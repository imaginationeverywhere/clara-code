export type GatewayResult = {
	ok: boolean;
	reply: string;
	fixHint?: string;
};

/**
 * The permanent public URL for Clara's LLM gateway. Bakes into every CLI install so
 * a fresh `clara` doesn't require user configuration. The middleware that backs this
 * path ships from the Clara platform; transient 4xx/5xx before it lands is expected.
 */
export const DEFAULT_GATEWAY_URL = "https://api.claracode.ai/hermes";

/**
 * Stable user-facing fix-hint. Used whenever the gateway is unreachable or returns
 * an error — never mentions internal service names.
 */
const COMING_ONLINE_HINT =
	"Clara gateway is coming online. Run `clara doctor` for status, or set CLARA_GATEWAY_URL to override.";

/**
 * POST JSON to the Clara gateway; returns structured text for TUI formatting.
 */
export async function claraGateway(gatewayUrl: string, userId: string, message: string): Promise<GatewayResult> {
	if (!gatewayUrl || gatewayUrl.trim().length === 0) {
		return {
			ok: false,
			reply: "Gateway URL is not configured.",
			fixHint: "Set CLARA_GATEWAY_URL, run `clara config set gatewayUrl <url>`, or pass --gateway.",
		};
	}
	const response = await fetch(gatewayUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			platform: "tui",
			surface: "cli",
			user: userId,
			message,
		}),
	});

	const bodyText = await response.text().catch(() => "");

	if (!response.ok) {
		return {
			ok: false,
			reply: bodyText || response.statusText || `HTTP ${response.status}`,
			fixHint: COMING_ONLINE_HINT,
		};
	}

	let data: Record<string, unknown>;
	try {
		data = JSON.parse(bodyText) as Record<string, unknown>;
	} catch {
		return { ok: true, reply: bodyText || "Clara has no response." };
	}

	const reply =
		(typeof data.reply === "string" && data.reply) ||
		(typeof data.text === "string" && data.text) ||
		(typeof data.message === "string" && data.message) ||
		bodyText ||
		"Clara has no response.";

	const ok = data.error !== true && data.ok !== false;
	const fixHint = typeof data.fix === "string" ? data.fix : undefined;

	return { ok, reply, fixHint };
}
