# Subscription Billing + PLAN_LIMITS Enforcement

**TARGET REPO:** imaginationeverywhere/clara-code
**Priority:** P0 — Beta blocker. Without billing wired to PLAN_LIMITS, we can't charge or enforce tier.
**Packages:** `backend/`, `frontend/`
**Depends on:** prompt 11 (PLAN_LIMITS defined). Extends it with Stripe billing + Clerk user-tier sync.
**Milestone:** Sign-up → tier selection → Stripe Checkout → Clerk user gets `tier` metadata → backend enforces PLAN_LIMITS. Upgrades prorated; downgrades effective next cycle. Cancellation, trial refunds (7-day), and Enterprise contract flag all supported.

---

## Flow Overview

```
User visits /pricing → picks tier → clicks "Get started"
  ↓
Auth via Clerk (sign-up or sign-in)
  ↓
Stripe Checkout session (tier-priced)
  ↓
Webhook: stripe.checkout.session.completed
  ↓
Backend writes user.tier to DB + syncs to Clerk publicMetadata
  ↓
User redirects to /settings with their team provisioned
```

---

## Part 1 — Stripe Products + Prices (one-time setup)

Create in Stripe Dashboard (or via CLI):

| Product | Price ID (env var) | Amount | Billing |
|---------|-------------------|--------|---------|
| Clara Code Basic | `STRIPE_PRICE_BASIC` | $39/mo | recurring |
| Clara Code Pro | `STRIPE_PRICE_PRO` | $69/mo | recurring |
| Clara Code Max | `STRIPE_PRICE_MAX` | $99/mo | recurring |
| Clara Code Business | `STRIPE_PRICE_BUSINESS` | $299/mo | recurring |
| Clara Code Enterprise | (contracted — no self-serve) | varies | manual invoice |

Price IDs go into SSM Parameter Store:
```
/clara-code/shared/STRIPE_PRICE_BASIC
/clara-code/shared/STRIPE_PRICE_PRO
/clara-code/shared/STRIPE_PRICE_MAX
/clara-code/shared/STRIPE_PRICE_BUSINESS
```

---

## Part 2 — Migration

**File:** `backend/migrations/022_user_subscriptions.sql`

```sql
CREATE TABLE IF NOT EXISTS user_subscriptions (
  user_id                VARCHAR(255) PRIMARY KEY,
  tier                   VARCHAR(50)  NOT NULL DEFAULT 'basic',
  stripe_customer_id     VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  status                 VARCHAR(50)  NOT NULL DEFAULT 'inactive',
  trial_ends_at          TIMESTAMPTZ,
  current_period_start   TIMESTAMPTZ,
  current_period_end     TIMESTAMPTZ,
  cancel_at_period_end   BOOLEAN      NOT NULL DEFAULT FALSE,
  enterprise_contract    JSONB,                         -- for Enterprise: {seats, builds_cap, eject_cap, ...}
  updated_at             TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_subs_stripe_sub ON user_subscriptions (stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_subs_status ON user_subscriptions (status);
```

---

## Part 3 — Stripe Checkout Route

**File:** `backend/src/routes/billing.ts`

```typescript
import { Router } from "express";
import Stripe from "stripe";
import { requireAuth, type AuthenticatedRequest } from "@/middleware/clerk-auth";
import type { PlanTier } from "@/services/plan-limits";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-11-20.acacia" });
const router = Router();

const TIER_PRICE_IDS: Record<Exclude<PlanTier, "enterprise">, string> = {
  basic: process.env.STRIPE_PRICE_BASIC!,
  pro: process.env.STRIPE_PRICE_PRO!,
  max: process.env.STRIPE_PRICE_MAX!,
  business: process.env.STRIPE_PRICE_BUSINESS!,
};

router.post("/checkout", requireAuth(), async (req: AuthenticatedRequest, res) => {
  const auth = await req.auth!();
  const userId = auth.userId;
  const { tier, success_url, cancel_url } = req.body as {
    tier: PlanTier;
    success_url: string;
    cancel_url: string;
  };

  if (tier === "enterprise") {
    res.status(400).json({ error: "enterprise_requires_sales" });
    return;
  }

  const priceId = TIER_PRICE_IDS[tier];
  if (!priceId) {
    res.status(400).json({ error: "invalid_tier" });
    return;
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: userId,
    success_url,
    cancel_url,
    subscription_data: {
      trial_period_days: 7,
      metadata: { userId, tier },
    },
    metadata: { userId, tier },
  });

  res.json({ checkout_url: session.url });
});

router.post("/cancel", requireAuth(), async (req: AuthenticatedRequest, res) => {
  const auth = await req.auth!();
  const sub = await UserSubscription.findByPk(auth.userId);
  if (!sub?.stripeSubscriptionId) {
    res.status(404).json({ error: "no_subscription" });
    return;
  }

  await stripe.subscriptions.update(sub.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });
  await sub.update({ cancelAtPeriodEnd: true });

  res.json({ canceled: true, effective_at: sub.currentPeriodEnd });
});

router.post("/upgrade", requireAuth(), async (req: AuthenticatedRequest, res) => {
  // Prorated upgrade — swap price on existing subscription
  const auth = await req.auth!();
  const { newTier } = req.body as { newTier: PlanTier };
  const sub = await UserSubscription.findByPk(auth.userId);
  if (!sub?.stripeSubscriptionId) {
    res.status(404).json({ error: "no_subscription" });
    return;
  }

  const newPriceId = TIER_PRICE_IDS[newTier as Exclude<PlanTier, "enterprise">];
  const stripeSub = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId);
  await stripe.subscriptions.update(sub.stripeSubscriptionId, {
    items: [{ id: stripeSub.items.data[0].id, price: newPriceId }],
    proration_behavior: "always_invoice",
  });

  await sub.update({ tier: newTier });
  await syncClerkMetadata(auth.userId, newTier);

  res.json({ upgraded: true, newTier });
});

export default router;
```

---

## Part 4 — Stripe Webhook Handler

**File:** `backend/src/routes/stripe-webhook.ts`

```typescript
import { Router, raw } from "express";
import Stripe from "stripe";
import { UserSubscription } from "@/models/UserSubscription";
import { syncClerkMetadata } from "@/services/clerk-sync.service";
import { configAgentService } from "@/services/config-agent.service";
import { PLAN_LIMITS } from "@/services/plan-limits";
import logger from "@/lib/logger";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-11-20.acacia" });
const router = Router();

router.post("/webhook", raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    res.status(400).send(`webhook_error: ${(err as Error).message}`);
    return;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const tier = session.metadata?.tier as PlanTier;
        if (!userId || !tier) break;

        const sub = event.data.object.subscription as string;
        const stripeSub = await stripe.subscriptions.retrieve(sub);

        await UserSubscription.upsert({
          userId, tier,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: sub,
          status: stripeSub.status,
          trialEndsAt: stripeSub.trial_end ? new Date(stripeSub.trial_end * 1000) : null,
          currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
        });

        await syncClerkMetadata(userId, tier);
        logger.info("subscription_activated", { userId, tier });
        break;
      }

      case "customer.subscription.updated": {
        const stripeSub = event.data.object as Stripe.Subscription;
        const userId = stripeSub.metadata.userId;
        if (!userId) break;
        await UserSubscription.update(
          {
            status: stripeSub.status,
            cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
            currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
          },
          { where: { userId } },
        );
        break;
      }

      case "customer.subscription.deleted": {
        const stripeSub = event.data.object as Stripe.Subscription;
        const userId = stripeSub.metadata.userId;
        if (!userId) break;
        await UserSubscription.update(
          { status: "canceled", tier: "basic" },
          { where: { userId } },
        );
        await syncClerkMetadata(userId, "basic" as any);
        break;
      }

      case "invoice.payment_failed": {
        // Dunning: notify user, flag account
        const invoice = event.data.object as Stripe.Invoice;
        logger.warn("payment_failed", { invoice_id: invoice.id, customer: invoice.customer });
        break;
      }
    }

    res.json({ received: true });
  } catch (err) {
    logger.error("webhook_handler_error", { err, event: event.type });
    res.status(500).json({ error: "handler_failed" });
  }
});

export default router;
```

---

## Part 5 — Clerk Sync

**File:** `backend/src/services/clerk-sync.service.ts`

```typescript
import { clerkClient } from "@clerk/express";
import type { PlanTier } from "./plan-limits";

export async function syncClerkMetadata(userId: string, tier: PlanTier): Promise<void> {
  await clerkClient.users.updateUser(userId, {
    publicMetadata: { tier },
  });
}
```

`req.claraUser.tier` in every paid route reads directly from Clerk publicMetadata (already cached on session).

---

## Part 6 — PLAN_LIMITS Enforcement on Key Actions

Wire `requireAbuseCheck` (from prompt 11) + explicit tier checks on:

- `POST /api/agents/configure` (prompt 19) — enforce `harnessAgentSlots` cap
- `POST /api/agents/build` (runtime agent creation) — enforce `runtimeAgentBuildsPerMonth`
- `POST /api/ejections/export` (prompt 25) — enforce ejection cap per month
- Every `/api/voice/*` route — `requireAbuseCheck`

---

## Part 7 — 7-Day Refund Flow

Stripe Checkout sessions are created with `trial_period_days: 7`. During trial:
- User has full tier access
- Stripe doesn't charge yet
- If they cancel before day 7 — zero charge, just ends
- At day 7 — Stripe charges; webhook marks `status: active`

For post-trial refunds (refund within 7 days of first successful charge):

```typescript
router.post("/refund", requireAuth(), async (req, res) => {
  const sub = await UserSubscription.findByPk(req.claraUser!.userId);
  if (!sub?.currentPeriodStart) { res.status(404).end(); return; }

  const daysSinceStart = (Date.now() - sub.currentPeriodStart.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceStart > 7) {
    res.status(400).json({ error: "outside_refund_window" });
    return;
  }

  // Cancel + refund latest invoice
  await stripe.subscriptions.cancel(sub.stripeSubscriptionId!, { invoice_now: false, prorate: false });
  const invoices = await stripe.invoices.list({ customer: sub.stripeCustomerId!, limit: 1 });
  if (invoices.data[0]?.payment_intent) {
    await stripe.refunds.create({ payment_intent: invoices.data[0].payment_intent as string });
  }

  res.json({ refunded: true });
});
```

---

## Part 8 — Enterprise Handling

Enterprise is NOT self-serve checkout. Flow:
1. User clicks "Talk to sales" → Calendly booking
2. Sales agreement signed → manual process
3. Ops team runs `scripts/provision-enterprise.ts` with:
   ```bash
   npm run provision:enterprise -- --user=<id> --seats=500 --builds-cap=unlimited --monthly=6000
   ```
4. Creates `user_subscriptions` row with `tier: enterprise`, `enterprise_contract` JSON populated, no Stripe subscription (invoiced manually via Stripe or external system).

Enterprise `monthlyCogsHardCap: null` → flag-for-review only, no auto-freeze.

---

## Part 9 — Tests

```typescript
describe("Checkout", () => {
  it("creates a Stripe Checkout session with correct price for the tier");
  it("rejects enterprise tier (must go through sales)");
  it("includes userId + tier in session metadata for webhook routing");
});

describe("Stripe Webhook", () => {
  it("upserts user_subscription on checkout.session.completed");
  it("syncs tier to Clerk publicMetadata");
  it("handles subscription.updated (status changes)");
  it("reverts to basic on subscription.deleted");
  it("logs payment_failed for dunning flow");
});

describe("Upgrade", () => {
  it("prorates upgrade via Stripe always_invoice");
  it("updates tier in DB + Clerk on success");
});

describe("Refund", () => {
  it("accepts refund within 7-day trial window");
  it("rejects refund past 7 days");
});

describe("Enterprise", () => {
  it("rejects enterprise via self-serve checkout");
  it("provision script creates tier=enterprise row without Stripe subscription");
});
```

---

## Acceptance Criteria

- [ ] `user_subscriptions` table in all three environments
- [ ] Stripe products + price IDs created for Basic/Pro/Max/Business
- [ ] Price IDs stored in SSM (and loaded at startup)
- [ ] `/api/billing/checkout` creates Stripe Checkout session with 7-day trial
- [ ] `/api/billing/webhook` handles: checkout.completed, subscription.updated, subscription.deleted, payment_failed
- [ ] Tier synced to Clerk publicMetadata on every change
- [ ] `/api/billing/upgrade` prorates via Stripe
- [ ] `/api/billing/cancel` cancels at period end
- [ ] `/api/billing/refund` works within 7-day trial window only
- [ ] Enterprise handled via manual provision script (no self-serve)
- [ ] Downgrade effective at current_period_end (not immediate)
- [ ] `npm run type-check` passes
- [ ] All tests pass
- [ ] CI thin-client gate passes

## Branch + PR

```bash
git checkout -b prompt/2026-04-23/22-subscription-billing-enforcement
git commit -m "feat(billing): Stripe subscriptions + Clerk tier sync + PLAN_LIMITS enforcement"
gh pr create --base develop --title "feat(billing): subscription billing + PLAN_LIMITS enforcement"
```
