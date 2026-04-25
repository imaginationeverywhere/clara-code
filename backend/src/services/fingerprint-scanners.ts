/**
 * Stubs for public marketplace fingerprint matching (Anthropic / OpenAI).
 * Real implementations would scrape or call partner APIs; returns [] until wired.
 */
export type FingerprintMatch = { fingerprint: string; platform: string; url: string };

export async function scanAnthropicMarketplace(): Promise<FingerprintMatch[]> {
	return [];
}

export async function scanOpenAiGptStore(): Promise<FingerprintMatch[]> {
	return [];
}
