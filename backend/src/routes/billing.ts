import { requireAuth } from "@clerk/express";
import { type Request, type Response, Router } from "express";
import type Stripe from "stripe";
import { getRecurringPriceIdForTier, getStripe, isCheckoutTier } from "@/lib/stripe-prices";
import type { AuthenticatedRequest } from "@/middleware/clerk-auth";
import { Subscription } from "@/models/Subscription";
import { syncClerkMetadata } from "@/services/clerk-sync.service";
import { type PlanTier, TIER_ORDER, toPlanTier } from "@/services/plan-limits";
import { logger } from "@/utils/logger";

const router: ReturnType<typeof Router> = Router();

/** POST mutators: require Origin (or Referer) host to match configured frontend (mitigate CSRF for browser clients). */
function requireBillingOrigin(req: Request, res: Response, next: () => void): void {
	const fe = (process.env.FRONTEND_URL ?? "https://claracode.com").replace(/\/$/, "");
	let allowedHost: string;
	try {
		allowedHost = new URL(fe.startsWith("http") ? fe : `https://${fe}`).host;
	} catch {
		next();
		return;
	}
	const origin = req.get("Origin") ?? req.get("Referer");
	if (!origin) {
		next();
		return;
	}
	try {
		const h = new URL(origin).host;
		if (h !== allowedHost) {
			res.status(403).json({ error: "invalid_origin" });
			return;
		}
	} catch {
		res.status(403).json({ error: "invalid_origin" });
		return;
	}
	next();
}

function assertStripe(res: Response): Stripe | null {
	const stripe = getStripe();
	if (!stripe) {
		res.status(503).json({ error: "Stripe is not configured" });
		return null;
	}
	return stripe;
}

router.post(
	"/checkout",
	requireAuth(),
	requireBillingOrigin,
	async (req: AuthenticatedRequest, res: Response): Promise<void> => {
		const auth = await (req.auth?.() ?? null);
		if (!auth?.userId) {
			res.status(401).json({ error: "Unauthorized" });
			return;
		}
		const stripe = assertStripe(res);
		if (!stripe) return;

		const body = req.body as { tier?: string; success_url?: string; cancel_url?: string };
		const tier = body.tier;
		if (toPlanTier(tier) === "enterprise" || tier === "enterprise") {
			res.status(400).json({ error: "enterprise_requires_sales" });
			return;
		}
		if (!tier || !isCheckoutTier(tier)) {
			res.status(400).json({ error: "invalid_tier" });
			return;
		}
		if (typeof body.success_url === "string" || typeof body.cancel_url === "string") {
			res.status(400).json({ error: "custom_redirects_not_allowed" });
			return;
		}

		const frontendUrl = (process.env.FRONTEND_URL ?? "https://claracode.com").replace(/\/$/, "");
		const successUrl = `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
		const cancelUrl = `${frontendUrl}/pricing`;

		let priceId: string;
		try {
			priceId = await getRecurringPriceIdForTier(stripe, tier);
		} catch {
			res.status(503).json({ error: "No active plan found for this tier" });
			return;
		}

		let subRow = await Subscription.findOne({ where: { userId: auth.userId } });
		let customerId = subRow?.stripeCustomerId ?? undefined;
		if (!customerId) {
			const c = await stripe.customers.create({ metadata: { clerk_user_id: auth.userId } });
			customerId = c.id;
			if (subRow) {
				await subRow.update({ stripeCustomerId: customerId });
			} else {
				subRow = await Subscription.create({
					userId: auth.userId,
					stripeCustomerId: customerId,
					tier: "basic",
					status: "incomplete",
				});
			}
		}

		const session = await stripe.checkout.sessions.create({
			mode: "subscription",
			customer: customerId,
			payment_method_types: ["card"],
			line_items: [{ price: priceId, quantity: 1 }],
			success_url: successUrl,
			cancel_url: cancelUrl,
			metadata: { clerk_user_id: auth.userId, tier },
			subscription_data: {
				trial_period_days: 7,
				metadata: { clerk_user_id: auth.userId, tier },
			},
		});

		if (!session.url) {
			res.status(500).json({ error: "Checkout session missing URL" });
			return;
		}

		res.json({ checkout_url: session.url, url: session.url });
	},
);

router.post(
	"/cancel",
	requireAuth(),
	requireBillingOrigin,
	async (req: AuthenticatedRequest, res: Response): Promise<void> => {
		const auth = await (req.auth?.() ?? null);
		if (!auth?.userId) {
			res.status(401).json({ error: "Unauthorized" });
			return;
		}
		const stripe = assertStripe(res);
		if (!stripe) return;

		const sub = await Subscription.findOne({ where: { userId: auth.userId } });
		if (!sub?.stripeSubscriptionId) {
			res.status(404).json({ error: "no_subscription" });
			return;
		}

		const stripeSub = await stripe.subscriptions.update(sub.stripeSubscriptionId, {
			cancel_at_period_end: true,
		});
		const end = stripeSub.current_period_end ? new Date(stripeSub.current_period_end * 1000) : null;
		await sub.update({ cancelAtPeriodEnd: true, currentPeriodEnd: end });
		void syncClerkMetadata(auth.userId, toPlanTier(sub.tier));

		res.json({ canceled: true, cancel_at_period_end: true, effective_at: end?.toISOString() ?? null });
	},
);

router.post(
	"/upgrade",
	requireAuth(),
	requireBillingOrigin,
	async (req: AuthenticatedRequest, res: Response): Promise<void> => {
		const auth = await (req.auth?.() ?? null);
		if (!auth?.userId) {
			res.status(401).json({ error: "Unauthorized" });
			return;
		}
		const stripe = assertStripe(res);
		if (!stripe) return;

		const { newTier } = req.body as { newTier?: string };
		if (toPlanTier(newTier) === "enterprise" || newTier === "enterprise") {
			res.status(400).json({ error: "enterprise_requires_sales" });
			return;
		}
		if (!newTier || !isCheckoutTier(newTier)) {
			res.status(400).json({ error: "invalid_tier" });
			return;
		}

		const sub = await Subscription.findOne({ where: { userId: auth.userId } });
		if (!sub?.stripeSubscriptionId) {
			res.status(404).json({ error: "no_subscription" });
			return;
		}

		const from = toPlanTier(sub.tier);
		if (TIER_ORDER[toPlanTier(newTier)] <= TIER_ORDER[from]) {
			res.status(400).json({ error: "use_downgrade_path" });
			return;
		}

		const newPriceId = await getRecurringPriceIdForTier(stripe, newTier);
		const stripeSub = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId);
		const itemId = stripeSub.items.data[0]?.id;
		if (!itemId) {
			res.status(500).json({ error: "subscription_items_missing" });
			return;
		}

		await stripe.subscriptions.update(sub.stripeSubscriptionId, {
			items: [{ id: itemId, price: newPriceId }],
			proration_behavior: "always_invoice",
		});

		const newTierPlan = toPlanTier(newTier) as PlanTier;
		await sub.update({ tier: newTier, cancelAtPeriodEnd: false });
		await syncClerkMetadata(auth.userId, newTierPlan);

		res.json({ upgraded: true, newTier: newTierPlan });
	},
);

/**
 * Lowers the Stripe price with no proration — the new plan takes effect on the next invoice/period.
 */
router.post(
	"/downgrade",
	requireAuth(),
	requireBillingOrigin,
	async (req: AuthenticatedRequest, res: Response): Promise<void> => {
		const auth = await (req.auth?.() ?? null);
		if (!auth?.userId) {
			res.status(401).json({ error: "Unauthorized" });
			return;
		}
		const stripe = assertStripe(res);
		if (!stripe) return;

		const { newTier } = req.body as { newTier?: string };
		if (toPlanTier(newTier) === "enterprise" || newTier === "enterprise") {
			res.status(400).json({ error: "enterprise_requires_sales" });
			return;
		}
		if (!newTier || !isCheckoutTier(newTier)) {
			res.status(400).json({ error: "invalid_tier" });
			return;
		}

		const sub = await Subscription.findOne({ where: { userId: auth.userId } });
		if (!sub?.stripeSubscriptionId) {
			res.status(404).json({ error: "no_subscription" });
			return;
		}

		const from = toPlanTier(sub.tier);
		if (TIER_ORDER[toPlanTier(newTier)] >= TIER_ORDER[from]) {
			res.status(400).json({ error: "use_upgrade_path" });
			return;
		}

		const newPriceId = await getRecurringPriceIdForTier(stripe, newTier);
		const stripeSub = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId);
		const itemId = stripeSub.items.data[0]?.id;
		if (!itemId) {
			res.status(500).json({ error: "subscription_items_missing" });
			return;
		}

		await stripe.subscriptions.update(sub.stripeSubscriptionId, {
			items: [{ id: itemId, price: newPriceId }],
			proration_behavior: "none",
		});

		const newTierPlan = toPlanTier(newTier) as PlanTier;
		// Stripe applies the lower price on the next invoice; tier is synced in subscription.updated
		await sub.update({ cancelAtPeriodEnd: false });
		void syncClerkMetadata(auth.userId, from);
		res.json({ scheduled: true, newTier: newTierPlan, effective: "next_invoice" });
	},
);

/**
 * End trial without charge, or cancel + refund first paid period within 7 days of period start.
 */
router.post(
	"/refund",
	requireAuth(),
	requireBillingOrigin,
	async (req: AuthenticatedRequest, res: Response): Promise<void> => {
		const auth = await (req.auth?.() ?? null);
		if (!auth?.userId) {
			res.status(401).json({ error: "Unauthorized" });
			return;
		}
		const stripe = assertStripe(res);
		if (!stripe) return;

		const sub = await Subscription.findOne({ where: { userId: auth.userId } });
		if (!sub?.stripeSubscriptionId || !sub.stripeCustomerId) {
			res.status(404).json({ error: "no_subscription" });
			return;
		}

		const stripeSub = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId);
		if (stripeSub.status === "trialing") {
			await stripe.subscriptions.cancel(sub.stripeSubscriptionId);
			await sub.update({
				status: "canceled",
				tier: "basic",
				stripeSubscriptionId: null,
				trialEndsAt: null,
			});
			await syncClerkMetadata(auth.userId, "basic");
			res.json({ refunded: false, trial_ended: true });
			return;
		}

		if (!sub.currentPeriodStart) {
			res.status(404).json({ error: "no_billing_period" });
			return;
		}
		const days = (Date.now() - sub.currentPeriodStart.getTime()) / (1000 * 60 * 60 * 24);
		if (days > 7) {
			res.status(400).json({ error: "outside_refund_window" });
			return;
		}

		await stripe.subscriptions.cancel(sub.stripeSubscriptionId);
		const invoices = await stripe.invoices.list({ customer: sub.stripeCustomerId, limit: 3 });
		const paid = invoices.data.find((i) => i.status === "paid" && i.amount_paid > 0);
		const pi = paid?.payment_intent;
		const paymentIntentId = typeof pi === "string" ? pi : pi && "id" in pi ? (pi as { id: string }).id : null;
		if (paymentIntentId) {
			await stripe.refunds.create({ payment_intent: paymentIntentId });
		} else {
			logger.warn("refund: no payment_intent on latest invoices", { userId: auth.userId });
		}
		await sub.update({
			status: "canceled",
			tier: "basic",
			stripeSubscriptionId: null,
		});
		await syncClerkMetadata(auth.userId, "basic");
		res.json({ refunded: true });
	},
);

export default router;
