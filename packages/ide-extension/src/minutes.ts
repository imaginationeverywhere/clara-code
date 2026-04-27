const H = "X-Clara-Minutes-Remaining";

export function parseMinutesFromResponse(res: globalThis.Response): number | null {
	const raw = res.headers.get(H) ?? res.headers.get(H.toLowerCase());
	if (raw == null) {
		return null;
	}
	const n = Number(String(raw).trim());
	return Number.isFinite(n) ? n : null;
}
