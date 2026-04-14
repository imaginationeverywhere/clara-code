import { requireAuth } from "@clerk/express";
import { type Response, Router } from "express";
import Stripe from "stripe";
import type { AuthenticatedRequest } from "@/middleware/clerk-auth";
import { Subscription } from "@/models/Subscription";
import { logger } from "@/utils/logger";

const router = Router();

function getStripe(): Stripe | null {
	const key = process.env.STRIPE_SECRET_KEY;
	if (!key) return null;
	return new Stripe(key, { apiVersion: "2023-10-16" });
}

function priceIdForTier(tier: "pro" | "business"): string | undefined {
	const id = tier === "pro" ? process.env.STRIPE_PRICE_PRO : process.env.STRIPE_PRICE_BUSINESS;
	return id?.trim() || undefined;
}

router.post("/create-session", requireAuth(), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
	try {
		const auth = await (req.auth?.() ?? null);
		if (!auth?.userId) {
			res.status(401).json({ error: "Unauthorized" });
			return;
		}

		const stripe = getStripe();
		if (!stripe) {
			res.status(503).json({ error: "Stripe is not configured" });
			return;
		}

		const body = req.body as { tier?: string };
		const tier = body.tier;
		if (tier !== "pro" && tier !== "business") {
			res.status(400).json({ error: "tier must be pro or business" });
			return;
		}

		const priceId = priceIdForTier(tier);
		if (!priceId) {
			res.status(503).json({ error: "Stripe price ID not configured for this tier" });
			return;
		}

		const frontendUrl = (process.env.FRONTEND_URL ?? "https://claracode.com").replace(/\/$/, "");

		const subRow = await Subscription.findOne({ where: { userId: auth.userId } });
		let customerId = subRow?.stripeCustomerId ?? undefined;
		if (!customerId) {
			const c = await stripe.customers.create({
				metadata: { clerk_user_id: auth.userId },
			});
			customerId = c.id;
			if (subRow) {
				await subRow.update({ stripeCustomerId: customerId });
			} else {
				await Subscription.create({
					userId: auth.userId,
					stripeCustomerId: customerId,
					tier: "free",
					status: "active",
				});
			}
		}

		const session = await stripe.checkout.sessions.create({
			mode: "subscription",
			customer: customerId,
			line_items: [{ price: priceId, quantity: 1 }],
			success_url: `${frontendUrl}/settings?checkout=success`,
			cancel_url: `${frontendUrl}/pricing`,
			metadata: {
				clerk_user_id: auth.userId,
				tier,
			},
			subscription_data: {
				metadata: {
					clerk_user_id: auth.userId,
					tier,
				},
			},
		});

		if (!session.url) {
			res.status(500).json({ error: "Checkout session missing URL" });
			return;
		}

		res.json({ url: session.url });
	} catch (error) {
		logger.error("checkout create-session error:", error);
		res.status(500).json({ error: "Failed to create checkout session" });
	}
});

export default router;
