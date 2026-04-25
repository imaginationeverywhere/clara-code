import type { Request, Response } from "express";
import { Op } from "sequelize";
import Stripe from "stripe";
import { getTalentRegistryService } from "@/features/talent-registry/talent-registry-instance";
import { isCheckoutTier } from "@/lib/stripe-prices";
import { ApiKey } from "@/models/ApiKey";
import { Subscription } from "@/models/Subscription";
import { syncClerkMetadata } from "@/services/clerk-sync.service";
import { toPlanTier } from "@/services/plan-limits";
import { gaClientIdFromUserId, sendGA4ServerEvent } from "@/utils/analytics";
import { generateApiKey } from "@/utils/api-key";
import { logger } from "@/utils/logger";

function getStripe(): Stripe {
	const key = process.env.STRIPE_SECRET_KEY;
	if (!key) {
		throw new Error("STRIPE_SECRET_KEY is not set");
	}
	return new Stripe(key, { apiVersion: "2023-10-16" });
}

function tierFromString(t: string | undefined): string | null {
	if (t && isCheckoutTier(t)) {
		return t;
	}
	return null;
}

async function resolveTier(stripe: Stripe, stripeSub: Stripe.Subscription): Promise<string | null> {
	const fromMeta = tierFromString(stripeSub.metadata?.tier);
	if (fromMeta) return fromMeta;
	const priceItem = stripeSub.items.data[0];
	const raw = priceItem?.price;
	const priceId = typeof raw === "string" ? raw : raw?.id;
	if (priceId) {
		try {
			const price = await stripe.prices.retrieve(priceId);
			const c = price.metadata?.clara_tier;
			if (c && isCheckoutTier(c)) return c;
		} catch {
			logger.warn("resolveTier: could not retrieve price");
		}
	}
	return null;
}

async function deactivateHashedKeysForUser(userId: string): Promise<void> {
	await ApiKey.update({ isActive: false }, { where: { userId, keyHash: { [Op.ne]: null } } });
}

async function issueSubscriptionApiKey(userId: string, tier: string): Promise<void> {
	if (!isCheckoutTier(tier)) return;
	await deactivateHashedKeysForUser(userId);
	const { hash, prefix } = generateApiKey("pro");
	await ApiKey.create({
		userId,
		name: "Subscription",
		key: null,
		keyHash: hash,
		keyPrefix: prefix,
		tier,
		isActive: true,
	});
}

function subscriptionStatusToStore(st: Stripe.Subscription.Status | string): string {
	if (st === "active" || st === "trialing" || st === "past_due" || st === "unpaid") {
		return st;
	}
	return st === "canceled" ? "canceled" : String(st);
}

export async function stripeWebhookHandler(req: Request, res: Response): Promise<void> {
	const secret = process.env.STRIPE_WEBHOOK_SECRET;
	if (!secret) {
		logger.error("STRIPE_WEBHOOK_SECRET not configured");
		res.status(503).send("Webhook not configured");
		return;
	}

	const sig = req.headers["stripe-signature"];
	if (!sig || typeof sig !== "string") {
		res.status(400).send("Missing stripe-signature");
		return;
	}

	let event: Stripe.Event;
	try {
		const stripe = getStripe();
		const raw = req.body as Buffer;
		event = stripe.webhooks.constructEvent(raw, sig, secret);
	} catch (err) {
		logger.error("Stripe webhook signature verification failed:", err);
		res.status(400).send("Invalid signature");
		return;
	}

	try {
		const stripe = getStripe();
		const talentRegistry = getTalentRegistryService();

		switch (event.type) {
			case "checkout.session.completed": {
				const session = event.data.object as Stripe.Checkout.Session;
				if (session.metadata?.type === "developer_program") {
					const userId = session.metadata.userId;
					const subId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
					if (!userId || !subId) {
						logger.warn("checkout.session.completed developer_program missing userId or subscription");
						break;
					}
					await talentRegistry.activateDeveloperProgram(userId, subId);
					logger.info(`Developer Program activated for user ${userId}`);
					break;
				}
				const userId = session.metadata?.clerk_user_id;
				const tierMeta = tierFromString(session.metadata?.tier);
				if (!userId || !tierMeta) {
					logger.warn("checkout.session.completed missing or invalid metadata");
					break;
				}
				const subId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
				const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
				if (!subId || !customerId) {
					logger.warn("checkout.session.completed missing subscription or customer");
					break;
				}
				const stripeSub = await stripe.subscriptions.retrieve(subId);
				const statusStore = subscriptionStatusToStore(stripeSub.status);
				const trialEnd = stripeSub.trial_end ? new Date(stripeSub.trial_end * 1000) : null;
				const [row] = await Subscription.findOrCreate({
					where: { userId },
					defaults: {
						userId,
						stripeCustomerId: customerId,
						stripeSubscriptionId: subId,
						tier: tierMeta,
						status: statusStore,
						trialEndsAt: trialEnd,
						cancelAtPeriodEnd: Boolean(stripeSub.cancel_at_period_end),
						currentPeriodStart: stripeSub.current_period_start
							? new Date(stripeSub.current_period_start * 1000)
							: null,
						currentPeriodEnd: stripeSub.current_period_end ? new Date(stripeSub.current_period_end * 1000) : null,
					},
				});
				await row.update({
					stripeCustomerId: customerId,
					stripeSubscriptionId: subId,
					tier: tierMeta,
					status: statusStore,
					trialEndsAt: trialEnd,
					cancelAtPeriodEnd: Boolean(stripeSub.cancel_at_period_end),
					currentPeriodStart: stripeSub.current_period_start
						? new Date(stripeSub.current_period_start * 1000)
						: null,
					currentPeriodEnd: stripeSub.current_period_end ? new Date(stripeSub.current_period_end * 1000) : null,
				});
				await issueSubscriptionApiKey(userId, tierMeta);
				await syncClerkMetadata(userId, toPlanTier(tierMeta));
				void sendGA4ServerEvent(gaClientIdFromUserId(userId), "purchase", {
					currency: "USD",
					value: (session.amount_total ?? 0) / 100,
					items: [{ item_name: tierMeta }],
				});
				logger.info("subscription_activated", { userId, tier: tierMeta });
				break;
			}
			case "customer.subscription.updated": {
				const stripeSub = event.data.object as Stripe.Subscription;
				if (stripeSub.metadata?.type === "developer_program") {
					if (stripeSub.status === "canceled") {
						await talentRegistry.cancelDeveloperProgram(stripeSub.id);
					}
					break;
				}
				const userId = stripeSub.metadata?.clerk_user_id;
				if (!userId) break;

				const tier = await resolveTier(stripe, stripeSub);
				if (!tier) {
					logger.warn("customer.subscription.updated: cannot resolve tier, skipping");
					break;
				}
				const subRow = await Subscription.findOne({ where: { userId } });
				const prevTier = subRow?.tier;
				const customerId =
					typeof stripeSub.customer === "string" ? stripeSub.customer : (stripeSub.customer?.id ?? null);
				const statusStore = subscriptionStatusToStore(stripeSub.status);
				const trialEnd = stripeSub.trial_end ? new Date(stripeSub.trial_end * 1000) : null;
				const payload = {
					stripeCustomerId: customerId,
					stripeSubscriptionId: stripeSub.id,
					tier,
					status: statusStore,
					trialEndsAt: trialEnd,
					cancelAtPeriodEnd: Boolean(stripeSub.cancel_at_period_end),
					currentPeriodStart: stripeSub.current_period_start
						? new Date(stripeSub.current_period_start * 1000)
						: null,
					currentPeriodEnd: stripeSub.current_period_end ? new Date(stripeSub.current_period_end * 1000) : null,
				};
				if (subRow) {
					await subRow.update(payload);
				} else {
					await Subscription.create({ userId, ...payload });
				}
				if (prevTier !== tier) {
					await issueSubscriptionApiKey(userId, tier);
				}
				await syncClerkMetadata(userId, toPlanTier(tier));
				break;
			}
			case "customer.subscription.deleted": {
				const stripeSub = event.data.object as Stripe.Subscription;
				if (stripeSub.metadata?.type === "developer_program") {
					await talentRegistry.cancelDeveloperProgram(stripeSub.id);
					break;
				}
				const userId = stripeSub.metadata?.clerk_user_id;
				if (!userId) break;
				await Subscription.update(
					{
						status: "canceled",
						tier: "free",
						stripeSubscriptionId: null,
						cancelAtPeriodEnd: false,
						trialEndsAt: null,
					},
					{ where: { userId } },
				);
				await ApiKey.update({ isActive: false }, { where: { userId, keyHash: { [Op.ne]: null } } });
				await syncClerkMetadata(userId, "free");
				break;
			}
			case "invoice.payment_failed": {
				const inv = event.data.object as Stripe.Invoice;
				logger.warn("payment_failed", {
					invoice_id: inv.id,
					customer: inv.customer,
					subscription: inv.subscription,
				});
				break;
			}
			default:
				break;
		}
		res.json({ received: true });
	} catch (error) {
		logger.error("Stripe webhook handler error:", error);
		res.status(500).json({ error: "Webhook handler failed" });
	}
}
