import { type Response, Router } from "express";
import Stripe from "stripe";

import type { ApiKeyRequest } from "@/middleware/api-key-auth";
import { requireApiKey } from "@/middleware/api-key-auth";
import { logger } from "@/utils/logger";
import type { TalentRegistryService } from "./talent-registry.service";

function getStripe(): Stripe | null {
	const key = process.env.STRIPE_SECRET_KEY;
	if (!key) return null;
	return new Stripe(key, { apiVersion: "2023-10-16" });
}

export function createDeveloperProgramRouter(service: TalentRegistryService): Router {
	const router = Router();

	router.post("/enroll", requireApiKey, async (req: ApiKeyRequest, res: Response) => {
		try {
			const userId = req.claraUser?.userId;
			if (!userId) {
				res.status(401).json({ error: "unauthorized" });
				return;
			}

			const alreadyEnrolled = await service.hasDeveloperProgram(userId);
			if (alreadyEnrolled) {
				res.status(409).json({
					error: "already_enrolled",
					message: "You already have an active Developer Program membership.",
				});
				return;
			}

			const priceId = process.env.STRIPE_PRICE_DEVELOPER_PROGRAM?.trim();
			if (!priceId) {
				res.status(503).json({ error: "developer_program_price_not_configured" });
				return;
			}

			const stripe = getStripe();
			if (!stripe) {
				res.status(503).json({ error: "stripe_not_configured" });
				return;
			}

			const portalBase = (process.env.DEVELOPER_PORTAL_URL ?? "https://developers.claracode.ai").replace(/\/$/, "");

			const session = await stripe.checkout.sessions.create({
				mode: "subscription",
				line_items: [{ price: priceId, quantity: 1 }],
				success_url: `${portalBase}/program?enrolled=true`,
				cancel_url: `${portalBase}/program?canceled=true`,
				metadata: {
					type: "developer_program",
					userId,
				},
				subscription_data: {
					metadata: {
						type: "developer_program",
						userId,
					},
				},
			});

			if (!session.url) {
				res.status(500).json({ error: "checkout_session_missing_url" });
				return;
			}

			res.json({ checkoutUrl: session.url });
		} catch (err: unknown) {
			logger.error("Developer program checkout error:", err);
			res.status(500).json({ error: "internal_error" });
		}
	});

	router.get("/status", requireApiKey, async (req: ApiKeyRequest, res: Response) => {
		try {
			const userId = req.claraUser?.userId;
			if (!userId) {
				res.status(401).json({ error: "unauthorized" });
				return;
			}
			const status = await service.getDeveloperProgramStatus(userId);
			res.json(status);
		} catch {
			res.status(500).json({ error: "internal_error" });
		}
	});

	return router;
}
