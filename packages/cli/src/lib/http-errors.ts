import { formatMinutesExhausted, type MinutesExhaustedPayload } from "./minutes-exhausted.js";
import { formatTierLockMessage, type TierLockPayload } from "./tier-lock.js";

function safeJson(text: string): Record<string, unknown> | null {
	try {
		const v: unknown = JSON.parse(text);
		if (v !== null && typeof v === "object" && !Array.isArray(v)) {
			return v as Record<string, unknown>;
		}
	} catch {
		// ignore
	}
	return null;
}

/**
 * Map HTTP status + body to a single user-facing line (prompt 18). No raw status codes, no internal codenames.
 */
export function mapHttpError(status: number, bodyText: string, _surface: "cli"): { message: string; exitCode: number } {
	const j = safeJson(bodyText);
	const reason = typeof j?.reason === "string" ? j.reason : undefined;

	if (status === 401) {
		return { message: "Sign in to continue. Run `clara login`.", exitCode: 1 };
	}
	if (status === 402 && reason === "subscription_inactive") {
		const u =
			typeof j?.url === "string"
				? j.url
				: typeof (j as { reactivate_url?: string }).reactivate_url === "string"
					? (j as { reactivate_url: string }).reactivate_url
					: "";
		return {
			message: u
				? `Your Clara subscription is inactive. Reactivate: ${u}`
				: "Your Clara subscription is inactive. Run `clara doctor` for status.",
			exitCode: 1,
		};
	}
	if (status === 403) {
		if (reason === "tier_lock" && j) {
			return { message: formatTierLockMessage(j as TierLockPayload), exitCode: 1 };
		}
		return { message: "Permission denied — run `clara doctor` for status.", exitCode: 1 };
	}
	if (status === 404) {
		return { message: "Clara couldn't find that. Check the name and try again.", exitCode: 1 };
	}
	if (status === 429) {
		if (reason === "minutes_exhausted" && j) {
			return { message: formatMinutesExhausted(j as MinutesExhaustedPayload), exitCode: 1 };
		}
		return { message: "Slow down for a moment — try again in a few seconds.", exitCode: 1 };
	}
	if (status >= 500) {
		return { message: "Clara is coming online — run `clara doctor` for status.", exitCode: 1 };
	}
	if (status >= 400) {
		return { message: "Request failed — run `clara doctor` for status.", exitCode: 1 };
	}
	return { message: "Request failed — run `clara doctor` for status.", exitCode: 1 };
}

export const NETWORK_FAILURE_MESSAGE =
	"Couldn't reach Clara. Check your connection — `clara doctor` will tell you more.";

/** Plain message for `throw new Error` / STT and agents-api surfaces. */
export function claraHttpErrorMessage(status: number, bodyText: string): string {
	return mapHttpError(status, bodyText, "cli").message;
}
