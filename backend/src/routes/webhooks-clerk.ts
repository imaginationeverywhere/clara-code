import type { Request, Response } from "express";
import { Webhook } from "svix";
import { welcomeEmail } from "@/emails/welcome";
import { sendEmail } from "@/services/email.service";
import { logger } from "@/utils/logger";

export async function clerkWebhookHandler(req: Request, res: Response): Promise<void> {
	const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET ?? process.env.CLERK_WEBHOOK_SECRET;
	if (!secret) {
		logger.warn("Clerk webhook: signing secret not configured");
		res.status(503).json({ error: "Webhook not configured" });
		return;
	}

	const payload = req.body;
	if (!Buffer.isBuffer(payload) && typeof payload !== "string") {
		res.status(400).json({ error: "Invalid body" });
		return;
	}

	const bodyStr = Buffer.isBuffer(payload) ? payload.toString("utf8") : payload;

	const svixId = req.headers["svix-id"];
	const svixTimestamp = req.headers["svix-timestamp"];
	const svixSignature = req.headers["svix-signature"];
	if (typeof svixId !== "string" || typeof svixTimestamp !== "string" || typeof svixSignature !== "string") {
		res.status(400).json({ error: "Missing svix headers" });
		return;
	}

	let evt: { type: string; data: Record<string, unknown> };
	try {
		const wh = new Webhook(secret);
		evt = wh.verify(bodyStr, {
			"svix-id": svixId,
			"svix-timestamp": svixTimestamp,
			"svix-signature": svixSignature,
		}) as { type: string; data: Record<string, unknown> };
	} catch (err) {
		logger.error("Clerk webhook verification failed:", err);
		res.status(400).json({ error: "Invalid signature" });
		return;
	}

	if (evt.type === "user.created") {
		const data = evt.data as {
			first_name?: string | null;
			email_addresses?: Array<{ email_address?: string }>;
		};
		const displayName = (data.first_name && String(data.first_name).trim()) || "there";
		const email = data.email_addresses?.[0]?.email_address;
		if (email) {
			const { subject, html, text } = welcomeEmail(displayName);
			void sendEmail({ to: email, subject, html, text });
		}
	}

	res.status(200).json({ received: true });
}
