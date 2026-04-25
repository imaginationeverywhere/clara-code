import { decryptSoulMd, encryptSoulMd } from "@/services/marketplace-soul-encryption.service";

/**
 * At-rest storage for per-connection MCP credentials using the same AES envelope as SOUL encryption.
 * Values are never stored as plaintext in `agent_mcp_connections`.
 */
export function mcpCredsToCiphertext(userId: string, creds: Record<string, string>): string {
	return encryptSoulMd(JSON.stringify(creds), userId);
}

export function mcpCredsFromCiphertext(ciphertext: string, userId: string): Record<string, string> {
	const raw = decryptSoulMd(ciphertext, userId);
	return JSON.parse(raw) as Record<string, string>;
}
