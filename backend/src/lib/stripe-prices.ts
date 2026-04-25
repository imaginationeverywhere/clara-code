import Stripe from "stripe";

const STRIPE_API_VERSION = "2023-10-16" as const;

export function getStripe(): Stripe | null {
	const key = process.env.STRIPE_SECRET_KEY;
	if (!key) return null;
	return new Stripe(key, { apiVersion: STRIPE_API_VERSION });
}

export type CheckoutTier = "basic" | "pro" | "max" | "business";

const CHECKOUT_TIERS: ReadonlySet<string> = new Set(["basic", "pro", "max", "business"]);

export function isCheckoutTier(t: string): t is CheckoutTier {
	return CHECKOUT_TIERS.has(t);
}

/**
 * Resolves a recurring price id from Stripe product metadata (clara_tier), not hardcoded price env vars.
 */
export async function getRecurringPriceIdForTier(stripe: Stripe, tier: CheckoutTier): Promise<string> {
	const prices = await stripe.prices.list({ active: true, limit: 100 });
	const match = prices.data.find((p) => p.metadata?.clara_tier === tier && p.type === "recurring");
	if (!match) {
		throw new Error(`No active recurring Stripe price found with metadata clara_tier=${tier}`);
	}
	return match.id;
}
