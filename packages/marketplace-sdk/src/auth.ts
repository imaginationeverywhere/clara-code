import { timingSafeEqual } from "node:crypto";

import type { ClaraRequestContext } from "./types";

function headerString(headers: Record<string, string | string[] | undefined>, key: string): string {
	const v = headers[key];
	if (v === undefined) {
		return "";
	}
	return Array.isArray(v) ? (v[0] ?? "") : v;
}

/**
 * Verify that an incoming request is legitimately from Clara's gateway.
 *
 * Clara sends a service token in the `x-clara-service-token` header on every
 * subgraph request. Verify this token before processing any request.
 *
 * @param token - The value of the `x-clara-service-token` header
 * @returns true if the token is valid, false otherwise
 *
 * @example
 * // In your Apollo Server context function:
 * context: async ({ req }) => {
 *   const token = req.headers['x-clara-service-token'] as string;
 *   if (!verifyClaraServiceToken(token)) {
 *     throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
 *   }
 *   return { claraContext: parseClaraContext(req.headers) };
 * }
 */
export function verifyClaraServiceToken(token: string): boolean {
	const expectedToken = process.env.CLARA_SERVICE_TOKEN;
	if (!expectedToken) {
		throw new Error(
			"CLARA_SERVICE_TOKEN environment variable is not set. " +
				"Set it to the value provided in your Clara Developer Dashboard.",
		);
	}
	if (!token || typeof token !== "string") {
		return false;
	}

	// Constant-time comparison to prevent timing attacks
	try {
		const expected = Buffer.from(expectedToken, "utf8");
		const provided = Buffer.from(token, "utf8");
		if (expected.length !== provided.length) {
			return false;
		}
		return timingSafeEqual(expected, provided);
	} catch {
		return false;
	}
}

/**
 * Parse the Clara request context from incoming headers.
 * Call this after `verifyClaraServiceToken` returns true.
 */
export function parseClaraContext(headers: Record<string, string | string[] | undefined>): ClaraRequestContext {
	return {
		sessionToken: headerString(headers, "x-clara-session-token"),
		voiceCommand: headerString(headers, "x-clara-voice-command"),
		requestedAt: headerString(headers, "x-clara-requested-at") || new Date().toISOString(),
	};
}
