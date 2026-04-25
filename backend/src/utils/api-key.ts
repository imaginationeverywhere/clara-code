import bcrypt from "bcryptjs";
import crypto from "crypto";

export type ApiKeyTier = "basic" | "pro" | "max" | "business" | "enterprise";

export function generateApiKey(tier: ApiKeyTier): {
	key: string;
	hash: string;
	prefix: string;
} {
	void tier;
	const random = crypto.randomBytes(32).toString("hex");
	const key = `cc_live_${random}`;
	const hash = bcrypt.hashSync(key, 12);
	const prefix = key.slice(0, 16);
	return { key, hash, prefix };
}

export async function validateApiKeyAgainstHash(key: string, hash: string): Promise<boolean> {
	return bcrypt.compare(key, hash);
}
