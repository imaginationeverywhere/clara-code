/**
 * Minute pool from gateway headers (prompt 16). Client only displays; never decrements locally.
 */

const HEADER = "X-Clara-Minutes-Remaining";

export function parseMinutesFromResponse(res: globalThis.Response): number | null {
	const raw = res.headers.get(HEADER) ?? res.headers.get(HEADER.toLowerCase());
	if (raw === null || raw === undefined) {
		return null;
	}
	const n = Number(String(raw).trim());
	if (!Number.isFinite(n)) {
		return null;
	}
	return n;
}
