import { requireAuth } from "@clerk/express";
import { type Response, Router } from "express";
import { getRecurringPriceIdForTier, getStripe, isCheckoutTier } from "@/lib/stripe-prices";
import type { AuthenticatedRequest } from "@/middleware/clerk-auth";
import { Subscription } from "@/models/Subscription";
import { logger } from "@/utils/logger";

const router: ReturnType<typeof Router> = Router();

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

		const body = req.body as { tier?: string; success_url?: string; cancel_url?: string };
		const tier = body.tier;
		if (!tier || !isCheckoutTier(tier)) {
			res.status(400).json({ error: "tier must be basic, pro, max, or business" });
			return;
		}

		let priceId: string;
		try {
			priceId = await getRecurringPriceIdForTier(stripe, tier);
		} catch {
			res.status(503).json({ error: "No active plan found for this tier — contact support" });
			return;
		}

		const frontendUrl = (process.env.FRONTEND_URL ?? "https://claracode.com").replace(/\/$/, "");
		const successUrl =
			typeof body.success_url === "string"
				? body.success_url
				: tier === "basic"
					? `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&onboarding=1`
					: `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
		const cancelUrl = typeof body.cancel_url === "string" ? body.cancel_url : `${frontendUrl}/pricing`;

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
			success_url: successUrl,
			cancel_url: cancelUrl,
			metadata: {
				clerk_user_id: auth.userId,
				tier,
			},
			subscription_data: {
				trial_period_days: 7,
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

		res.json({ url: session.url, checkout_url: session.url });
	} catch (error) {
		logger.error("checkout create-session error:", error);
		res.status(500).json({ error: "Failed to create checkout session" });
	}
});

export default router;
