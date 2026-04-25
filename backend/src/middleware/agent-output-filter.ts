import { detectForbidden, sanitize } from "@/lib/ip-firewall";
import { logger } from "@/utils/logger";

const TEXT_KEYS = ["transcript", "response_text", "text", "reply", "message"] as const;

/**
 * Filter a single string of agent output. Strips forbidden substrings; logs when anything matched.
 */
export function filterAgentOutput(text: string, userId: string, agentId: string): { text: string; filtered: boolean } {
	const violations = detectForbidden(text);

	if (violations.length === 0) {
		return { text, filtered: false };
	}

	logger.warn(
		`[ip-firewall] output filter triggered — userId=${userId} agentId=${agentId} matched=${violations.join(", ")}`,
	);

	return { text: sanitize(text), filtered: true };
}

/**
 * Apply the output filter to known string fields on a voice / converse JSON payload.
 */
export function filterConverseResponsePayload(
	data: unknown,
	userId: string,
	agentId: string,
): { payload: unknown; filtered: boolean } {
	if (data === null || typeof data !== "object" || Array.isArray(data)) {
		return { payload: data, filtered: false };
	}
	const o = { ...(data as Record<string, unknown>) };
	let anyFiltered = false;
	for (const key of TEXT_KEYS) {
		const v = o[key];
		if (typeof v === "string") {
			const { text, filtered } = filterAgentOutput(v, userId, agentId);
			o[key] = text;
			if (filtered) {
				anyFiltered = true;
			}
		}
	}
	return { payload: o, filtered: anyFiltered };
}
