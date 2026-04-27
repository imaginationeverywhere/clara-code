/**
 * Shared 429 `minutes_exhausted` handling (prompt 17).
 */

export type MinutesExhaustedPayload = { reason?: string; topup_url?: string };

export function formatMinutesExhausted(p: MinutesExhaustedPayload): string {
	const u = typeof p.topup_url === "string" ? p.topup_url.trim() : "";
	const base = "You've used your minute allotment for this billing period.";
	return u ? `${base}\nTop up: ${u}` : base;
}
