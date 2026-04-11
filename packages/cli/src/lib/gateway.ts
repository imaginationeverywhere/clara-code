import type { PartnerType } from "@clara/clara-code-surface-scripts";

export interface GatewayOptions {
	gatewayUrl: string;
	userId: string;
	message: string;
	partnerType: PartnerType;
	sixSideProjectsAsked: boolean;
	voiceOptIn: boolean;
}

export interface GatewayResult {
	ok: boolean;
	replyText: string;
	fix?: string;
	plainError?: string;
}

/**
 * Clara gateway client — Hermes on Modal.
 */
export async function claraGateway(opts: GatewayOptions): Promise<GatewayResult> {
	const response = await fetch(opts.gatewayUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			platform: "tui",
			surface: "cli",
			user: opts.userId,
			message: opts.message,
			partnerType: opts.partnerType,
			sixSideProjectsAsked: opts.sixSideProjectsAsked,
			voiceOptIn: opts.voiceOptIn,
		}),
	});

	const bodyText = await response.text().catch(() => "");

	if (!response.ok) {
		return {
			ok: false,
			replyText: "",
			plainError: bodyText || response.statusText,
			fix: "Check gateway URL and network.",
		};
	}

	let data: {
		reply?: string;
		text?: string;
		message?: string;
		error?: boolean;
		fix?: string;
	};
	try {
		data = JSON.parse(bodyText) as typeof data;
	} catch {
		return {
			ok: false,
			replyText: "",
			plainError: "Invalid JSON from gateway",
			fix: "Retry the request.",
		};
	}

	if (data.error) {
		return {
			ok: false,
			replyText: "",
			plainError: data.reply ?? data.text ?? "Request failed",
			fix: data.fix ?? "See gateway logs.",
		};
	}

	const reply = data.reply ?? data.text ?? data.message ?? "Clara has no response.";
	return { ok: true, replyText: reply };
}
