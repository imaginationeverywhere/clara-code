/**
 * Simple fixed-window rate limiter for Route Handlers (in-memory, per server instance).
 * Mirrors backend voice limiter intent: max N requests per IP per window.
 */

const buckets = new Map<string, number[]>();

export function checkIpRateLimit(key: string, max: number, windowMs: number): boolean {
	const now = Date.now();
	const windowStart = now - windowMs;
	const prev = buckets.get(key) ?? [];
	const pruned = prev.filter((t) => t > windowStart);
	if (pruned.length >= max) {
		buckets.set(key, pruned);
		return false;
	}
	pruned.push(now);
	buckets.set(key, pruned);
	return true;
}

/** @internal Vitest */
export function resetIpRateLimitForTests(): void {
	buckets.clear();
}
