import { formatMinutesExhausted, type MinutesExhaustedPayload } from "./minutes-exhausted";
import { formatTierLockMessage, type TierLockPayload } from "./tier-lock";

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

/** User-facing string for notifications (prompt 18). */
export function mapHttpErrorToString(status: number, bodyText: string): string {
	const j = safeJson(bodyText);
	const reason = typeof j?.reason === "string" ? j.reason : undefined;

	if (status === 401) {
		return "Sign in to continue. Run `clara login`.";
	}
	if (status === 402 && reason === "subscription_inactive") {
		const u =
			typeof j?.url === "string"
				? j.url
				: typeof (j as { reactivate_url?: string }).reactivate_url === "string"
					? (j as { reactivate_url: string }).reactivate_url
					: "";
		return u
			? `Your Clara subscription is inactive. Reactivate: ${u}`
			: "Your Clara subscription is inactive. Run `Clara: Doctor` for status.";
	}
	if (status === 403) {
		if (reason === "tier_lock" && j) {
			return formatTierLockMessage(j as TierLockPayload);
		}
		return "Permission denied — run `Clara: Doctor` for status.";
	}
	if (status === 404) {
		return "Clara couldn't find that. Check the name and try again.";
	}
	if (status === 429) {
		if (reason === "minutes_exhausted" && j) {
			return formatMinutesExhausted(j as MinutesExhaustedPayload);
		}
		return "Slow down for a moment — try again in a few seconds.";
	}
	if (status >= 500) {
		return "Clara is coming online — run `Clara: Doctor` for status.";
	}
	if (status >= 400) {
		return "Request failed — run `Clara: Doctor` for status.";
	}
	return "Request failed — run `Clara: Doctor` for status.";
}

export const NETWORK_FAILURE_MESSAGE =
	"Couldn't reach Clara. Check your connection — `Clara: Doctor` will tell you more.";
