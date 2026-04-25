import type { Readable } from "node:stream";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let client: S3Client | null = null;

export function getS3Client(): S3Client {
	if (!client) {
		client = new S3Client({ region: process.env.AWS_REGION || "us-east-1" });
	}
	return client;
}

export function getEjectionBucket(): string {
	const b = process.env.EJECTION_S3_BUCKET?.trim();
	if (!b) {
		throw new Error("EJECTION_S3_BUCKET is not configured");
	}
	return b;
}

export async function presignGetObject(key: string, expiresInSeconds = 60 * 60 * 24): Promise<string> {
	const cmd = new GetObjectCommand({ Bucket: getEjectionBucket(), Key: key });
	// pnpm can duplicate @aws-sdk client type declarations; presigner is compatible at runtime.
	// @ts-expect-error S3RequestPresigner and S3Client types from nested dependency copies
	return getSignedUrl(getS3Client(), cmd, { expiresIn: expiresInSeconds });
}

export async function putZipObject(key: string, body: Readable, metadata: Record<string, string>): Promise<void> {
	await getS3Client().send(
		new PutObjectCommand({
			Bucket: getEjectionBucket(),
			Key: key,
			Body: body,
			ContentType: "application/zip",
			Metadata: metadata,
		}),
	);
}
