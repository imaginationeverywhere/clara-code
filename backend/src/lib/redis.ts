import IORedis from "ioredis";
import { logger } from "@/utils/logger";

/** Subset of Redis / ioredis used by `AbuseProtectionService`. */
export type AppRedis = {
	incr(key: string): Promise<number>;
	expire(key: string, seconds: number): Promise<number>;
	get(key: string): Promise<string | null>;
	/** IORedis: set(key, val, "EX", sec) or set(key, val, "EX", sec, "NX") */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	set(key: string, value: string, ...rest: any[]): Promise<"OK" | null>;
	incrbyfloat(key: string, increment: string | number): Promise<string>;
	hincrbyfloat(key: string, field: string, increment: string | number): Promise<string>;
	hget(key: string, field: string): Promise<string | null>;
	exists(...keys: string[]): Promise<number>;
	rpush(key: string, value: string): Promise<number>;
	ping(): Promise<string | undefined>;
	quit?(): Promise<string | undefined>;
	disconnect?(): Promise<void>;
};

const TTL_MS = new Map<string, number>();
const STR = new Map<string, string>();
const HASH = new Map<string, Map<string, string>>();
const LISTS = new Map<string, string[]>();

function isExpired(key: string): boolean {
	const t = TTL_MS.get(key);
	if (t == null) {
		return false;
	}
	if (Date.now() > t) {
		TTL_MS.delete(key);
		STR.delete(key);
		HASH.delete(`hash:${key}`);
		return true;
	}
	return false;
}

class MemoryRedis implements AppRedis {
	private table(n: string): Map<string, string> {
		const k = `hash:${n}`;
		let m = HASH.get(k);
		if (!m) {
			m = new Map();
			HASH.set(k, m);
		}
		return m;
	}

	async disconnect(): Promise<void> {
		TTL_MS.clear();
		STR.clear();
		HASH.clear();
		LISTS.clear();
	}

	async quit(): Promise<string> {
		await this.disconnect();
		return "OK";
	}

	async ping(): Promise<string> {
		return "PONG";
	}

	async incr(key: string): Promise<number> {
		if (isExpired(key)) {
			STR.delete(key);
		}
		const n = (parseInt(STR.get(key) ?? "0", 10) || 0) + 1;
		STR.set(key, String(n));
		return n;
	}

	async expire(key: string, seconds: number): Promise<number> {
		TTL_MS.set(key, Date.now() + seconds * 1000);
		return 1;
	}

	async get(key: string): Promise<string | null> {
		if (isExpired(key)) {
			return null;
		}
		return STR.get(key) ?? null;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async set(key: string, value: string, ...rest: any[]): Promise<"OK" | null> {
		if (isExpired(key)) {
			STR.delete(key);
		}
		const ex = rest[0] === "EX" && typeof rest[1] === "number" ? (rest[1] as number) : undefined;
		const nx = rest.includes("NX");
		if (nx && STR.has(key) && !isExpired(key)) {
			return null;
		}
		STR.set(key, value);
		if (ex != null) {
			TTL_MS.set(key, Date.now() + ex * 1000);
		}
		return "OK";
	}

	async incrbyfloat(key: string, increment: string | number): Promise<string> {
		if (isExpired(key)) {
			STR.delete(key);
		}
		const inc = typeof increment === "string" ? parseFloat(increment) : increment;
		const cur = parseFloat(STR.get(key) ?? "0");
		const n = cur + (Number.isFinite(inc) ? inc : 0);
		const s = String(n);
		STR.set(key, s);
		return s;
	}

	async hincrbyfloat(key: string, field: string, increment: string | number): Promise<string> {
		if (isExpired(key)) {
			STR.delete(key);
			this.table(key).clear();
		}
		const inc = typeof increment === "string" ? parseFloat(increment) : increment;
		const h = this.table(key);
		const cur = parseFloat(h.get(field) ?? "0");
		const n = cur + (Number.isFinite(inc) ? inc : 0);
		const s = String(n);
		h.set(field, s);
		return s;
	}

	async hget(key: string, field: string): Promise<string | null> {
		if (isExpired(key)) {
			return null;
		}
		return this.table(key).get(field) ?? null;
	}

	async exists(...keys: string[]): Promise<number> {
		let c = 0;
		for (const k of keys) {
			if (isExpired(k)) {
				continue;
			}
			if (STR.has(k) || this.table(k).size > 0) {
				c += 1;
			}
		}
		return c;
	}

	async rpush(key: string, value: string): Promise<number> {
		const l = LISTS.get(key) ?? [];
		l.push(value);
		LISTS.set(key, l);
		return l.length;
	}
}

let _redis: AppRedis | IORedis | null = null;

export function getRedis(): AppRedis {
	if (_redis) {
		return _redis as AppRedis;
	}
	const url = process.env.REDIS_URL?.trim();
	if (url && url.length > 0) {
		_redis = new IORedis(url, { maxRetriesPerRequest: null, enableReadyCheck: true });
	} else {
		logger.warn(
			"REDIS_URL not set — in-memory store used for rate/usage keys (ok for local dev, not for multi-node production).",
		);
		_redis = new MemoryRedis();
	}
	return _redis as AppRedis;
}

export async function connectRedis(): Promise<void> {
	const c = getRedis();
	const pong = await c.ping();
	if (pong !== "PONG" && !pong) {
		throw new Error("redis ping failed");
	}
}

export function _resetInMemoryRedisForTests(): void {
	_redis = new MemoryRedis();
}
