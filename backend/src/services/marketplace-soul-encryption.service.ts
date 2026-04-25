import crypto from "crypto";
import { logger } from "@/utils/logger";

function getEncryptionKeyBase(): string {
	const b = process.env.SOUL_ENCRYPTION_KEY?.trim();
	if (!b || b.length < 8) {
		const err = new Error("SOUL_ENCRYPTION_KEY is not configured");
		logger.error(err.message);
		throw err;
	}
	return b;
}

function deriveKey(userId: string): Buffer {
	return crypto.createHash("sha256").update(`${getEncryptionKeyBase()}:${userId}`).digest();
}

/**
 * Encrypt marketplace SOUL.md for at-rest storage. Format: hex(iv):hex(ciphertext)
 */
export function encryptSoulMd(soulMd: string, publisherUserId: string): string {
	const key = deriveKey(publisherUserId);
	const iv = crypto.randomBytes(16);
	const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
	const encrypted = Buffer.concat([cipher.update(soulMd, "utf8"), cipher.final()]);
	return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Decrypt with the same publisher user id used at encryption time.
 */
export function decryptSoulMd(encrypted: string, publisherUserId: string): string {
	const [ivHex, dataHex] = encrypted.split(":");
	if (!ivHex || !dataHex) {
		throw new Error("Invalid encrypted SOUL.md payload");
	}
	const key = deriveKey(publisherUserId);
	const iv = Buffer.from(ivHex, "hex");
	const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
	return Buffer.concat([decipher.update(Buffer.from(dataHex, "hex")), decipher.final()]).toString("utf8");
}
