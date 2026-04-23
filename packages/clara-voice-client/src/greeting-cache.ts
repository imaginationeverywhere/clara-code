import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

const DIRNAME = "clara-code";
const DATA_FILE = "greeting-canonical";
const MIME_FILE = "greeting-canonical.mime";

/**
 * XDG or ~/.cache (Node only).
 */
export function defaultCacheDirectory(): string {
	const xdg = process.env.XDG_CACHE_HOME;
	if (xdg && xdg.length > 0) {
		return join(xdg, DIRNAME);
	}
	return join(homedir(), ".cache", DIRNAME);
}

function dataPath(): string {
	return join(defaultCacheDirectory(), DATA_FILE);
}

function mimePath(): string {
	return join(defaultCacheDirectory(), MIME_FILE);
}

export type CachedGreeting = {
	bytes: Buffer;
	contentType: string;
};

/**
 * Read cached canonical greeting, if present (Node, filesystem).
 */
export async function readGreetingFromCache(): Promise<CachedGreeting | null> {
	const bytesPath = dataPath();
	const mimeP = mimePath();
	try {
		const bytes = await readFile(bytesPath);
		if (bytes.length === 0) {
			return null;
		}
		let contentType = "application/octet-stream";
		try {
			const m = (await readFile(mimeP, "utf8")).trim();
			if (m.length > 0) {
				contentType = m;
			}
		} catch {
			// optional mime file
		}
		return { bytes, contentType };
	} catch {
		return null;
	}
}

/**
 * Persist canonical greeting for offline replay (Node, filesystem).
 */
export async function writeGreetingToCache(greeting: CachedGreeting): Promise<void> {
	const dir = defaultCacheDirectory();
	await mkdir(dir, { recursive: true });
	await writeFile(dataPath(), greeting.bytes);
	await writeFile(mimePath(), `${greeting.contentType}\n`, "utf8");
}
