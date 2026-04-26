export type GatewayResult = {
	ok: boolean;
	reply: string;
	fixHint?: string;
};

/**
 * POST JSON to the Hermes / Clara gateway; returns structured text for TUI formatting (VRD §C3–C4).
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
			fixHint: "Check gateway URL and network, then retry.",
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
