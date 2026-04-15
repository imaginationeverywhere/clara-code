import { createHash } from "node:crypto";

import { logger } from "@/utils/logger";

const GA4_ENDPOINT = "https://www.google-analytics.com/mp/collect";

/** Deterministic pseudo client_id for Measurement Protocol (no PII). */
export function gaClientIdFromUserId(userId: string): string {
	return createHash("sha256").update(userId).digest("hex").slice(0, 32);
}

/**
 * Server-side GA4 Measurement Protocol. Fails silently if env is missing.
 */
export async function sendGA4ServerEvent(
	clientId: string,
	eventName: string,
	params: Record<string, unknown> = {},
): Promise<void> {
	const measurementId = process.env.GA4_MEASUREMENT_ID;
	const apiSecret = process.env.GA4_API_SECRET;
	if (!measurementId || !apiSecret) return;

	try {
		const res = await fetch(`${GA4_ENDPOINT}?measurement_id=${measurementId}&api_secret=${apiSecret}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				client_id: clientId,
				events: [{ name: eventName, params }],
			}),
		});
		if (!res.ok) {
			logger.warn(`GA4 MP ${eventName} HTTP ${res.status}`);
		}
	} catch {
		// never throw — analytics must not break the app
	}
}
