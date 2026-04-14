# Stripe Implementation Standard

**Version:** 1.0.0
**Enforced by:** `/pickup-prompt --stripe`

This standard applies to ALL Heru projects. Any prompt executed with `--stripe` MUST follow every rule below. These rules override conflicting instructions in the prompt itself.

---

## CRITICAL RULES (non-negotiable)

### 1. NO hardcoded price IDs — EVER

**FORBIDDEN:**
```bash
# NEVER store price IDs in env vars
STRIPE_PRICE_PRO=price_xxx
STRIPE_PRICE_BUSINESS=price_yyy
STRIPE_PRICE_DEVELOPER_PROGRAM=price_zzz
```

**REQUIRED:** Tag your Stripe Price objects with metadata. Clara/the platform resolves prices dynamically at runtime.

```typescript
// Find the active price for a product by metadata — no env var needed
const prices = await stripe.prices.list({ active: true, limit: 100 });
const targetPrice = prices.data.find(p => p.metadata?.clara_type === "developer_program");
// OR for subscription tier resolution:
const price = await stripe.prices.retrieve(priceId);
const tier = price.metadata?.clara_tier; // "pro" | "business"
```

**Stripe metadata tags to set in the Dashboard:**

| Price | metadata key | metadata value |
|-------|-------------|----------------|
| Pro monthly/annual | `clara_tier` | `pro` |
| Business monthly/annual | `clara_tier` | `business` |
| Developer Program | `clara_type` | `developer_program` |
| Any custom Heru plan | `heru_plan` | `<plan-name>` |

The 503 guard stays — fail gracefully when no matching price is tagged:
```typescript
if (!targetPrice) {
  res.status(503).json({ error: "price_not_configured" });
  return;
}
```

---

### 2. Local webhook endpoint is ALWAYS required

Every Heru backend MUST have a Stripe webhook endpoint mounted. No exceptions.

**Endpoint:** `POST /api/webhooks/stripe`

**Local dev URL pattern:**
```
https://[project-slug]-backend-dev.ngrok.quiknation.com/api/webhooks/stripe
```

**Dev environment:** `https://api-dev.[domain]/api/webhooks/stripe`

**Prod environment:** `https://api.[domain]/api/webhooks/stripe`

**CRITICAL: Raw body parsing**

Stripe signature verification requires the raw Buffer body — Express JSON middleware breaks it.

```typescript
// In your Express app setup:
app.use("/api/webhooks/stripe", express.raw({ type: "application/json" }));
app.use(express.json()); // JSON for all other routes AFTER

// In the webhook handler:
const raw = req.body as Buffer; // Already a Buffer thanks to express.raw()
event = stripe.webhooks.constructEvent(raw, sig, secret);
```

**Local development — Stripe CLI forward:**
```bash
stripe listen --forward-to localhost:3031/api/webhooks/stripe
# Outputs: STRIPE_WEBHOOK_SECRET=whsec_test_... → set this in .env.local
```

---

### 3. Secrets in SSM only — never in code or .env files

| Secret | SSM path (dev) | SSM path (prod) |
|--------|---------------|-----------------|
| Stripe secret key | `/[project]/STRIPE_SECRET_KEY` | `/[project]/prod/STRIPE_SECRET_KEY` |
| Webhook signing secret | `/[project]/STRIPE_WEBHOOK_SECRET` | `/[project]/prod/STRIPE_WEBHOOK_SECRET` |
| Publishable key (build-time) | `/[project]/STRIPE_PUBLISHABLE_KEY` | `/[project]/prod/STRIPE_PUBLISHABLE_KEY` |

**FORBIDDEN in code:**
```bash
STRIPE_PRICE_PRO=price_xxx        # ❌ price IDs in env
sk_live_xxx hardcoded anywhere    # ❌ secret key hardcoded
STRIPE_WEBHOOK_SECRET=whsec_xxx   # ❌ webhook secret in .env committed to git
```

---

### 4. Use Hosted Checkout — not Stripe Elements for subscriptions

```typescript
// ✅ CORRECT — Hosted Checkout
const session = await stripe.checkout.sessions.create({
  mode: "subscription",
  line_items: [{ price: targetPrice.id, quantity: 1 }],
  success_url: `${portalBase}/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${portalBase}/cancel`,
  metadata: { type: "developer_program", userId },
  subscription_data: {
    metadata: { type: "developer_program", userId },
  },
});
res.json({ checkoutUrl: session.url });

// ❌ INCORRECT — Stripe Elements for subscriptions
// Do not use stripe.paymentIntents.create() for recurring billing
```

---

## Standard Webhook Handler Pattern

Every Heru that handles subscriptions MUST handle these 3 events:

```typescript
switch (event.type) {
  case "checkout.session.completed": {
    // Provision access: create/update Subscription row, issue API key
    break;
  }
  case "customer.subscription.updated": {
    // Resolve tier via price metadata — NOT env vars
    const price = await stripe.prices.retrieve(priceId);
    const tier = price.metadata?.clara_tier as "pro" | "business" | undefined;
    // Update Subscription row, re-issue API key if tier changed
    break;
  }
  case "customer.subscription.deleted": {
    // Revoke access: set status=canceled, deactivate API keys
    break;
  }
}
```

**Always respond 200 promptly** — Stripe retries on non-2xx. Do heavy work async if needed.

```typescript
// Fail-fast on missing webhook secret
const secret = process.env.STRIPE_WEBHOOK_SECRET;
if (!secret) {
  logger.error("STRIPE_WEBHOOK_SECRET not configured");
  res.status(503).send("Webhook not configured");
  return;
}
```

---

## Standard Stripe Singleton

```typescript
// src/lib/stripe.ts — one place, reused everywhere
import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  if (!_stripe) {
    _stripe = new Stripe(key, { apiVersion: "2023-10-16" });
  }
  return _stripe;
}
```

---

## Environment Variables — Allowed List

**Allowed in `.env` / SSM:**
```bash
STRIPE_SECRET_KEY=sk_test_...          # ✅ API access
STRIPE_WEBHOOK_SECRET=whsec_...        # ✅ Webhook verification (never commit)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # ✅ Frontend (build-time only)
```

**Forbidden:**
```bash
STRIPE_PRICE_PRO=price_xxx             # ❌ price IDs
STRIPE_PRICE_BUSINESS=price_yyy        # ❌ price IDs
STRIPE_PRICE_DEVELOPER_PROGRAM=price_  # ❌ price IDs
STRIPE_PLAN_ID=plan_xxx               # ❌ plan IDs
```

---

## Local Development Checklist

When a prompt implements or touches Stripe code, the agent MUST verify:

- [ ] `POST /api/webhooks/stripe` endpoint exists
- [ ] Webhook mounted BEFORE `express.json()`, using `express.raw()`
- [ ] `STRIPE_WEBHOOK_SECRET` loaded from SSM (not hardcoded)
- [ ] No `STRIPE_PRICE_*` env vars — dynamic price lookup via metadata
- [ ] Hosted Checkout used for subscription flows
- [ ] All 3 standard events handled (or explicitly documented why not)
- [ ] Local dev: `stripe listen --forward-to localhost:[PORT]/api/webhooks/stripe` documented in README/`.env.example`

---

---

## Platform Fees — minimum 7%, passed to the customer

Platform fees are collected on top of the merchant's price. The customer pays the fee — the merchant receives their full price. **Minimum 7%.**

```typescript
// ✅ Calculate platform fee (minimum 7%) and add to checkout
const BASE_PRICE_CENTS = lineItems.reduce((sum, item) => sum + item.amount * item.quantity, 0);
const PLATFORM_FEE_PERCENT = Math.max(7, customFeePercent ?? 7) / 100;
const platformFeeCents = Math.round(BASE_PRICE_CENTS * PLATFORM_FEE_PERCENT);

// Option A: Stripe Connect — application_fee_amount (fee stays on platform account)
const session = await stripe.checkout.sessions.create({
  mode: "payment",
  line_items: [
    { price_data: { currency: "usd", unit_amount: BASE_PRICE_CENTS, product_data: { name: "Order" } }, quantity: 1 },
    {
      price_data: {
        currency: "usd",
        unit_amount: platformFeeCents,
        product_data: { name: "Service fee" },
      },
      quantity: 1,
    },
  ],
  payment_intent_data: {
    application_fee_amount: platformFeeCents,  // Stripe Connect: platform keeps this
    transfer_data: { destination: merchantStripeAccountId },
  },
  metadata: {
    platform_fee_cents: platformFeeCents,
    platform_fee_percent: String(Math.max(7, customFeePercent ?? 7)),
    merchant_id: merchantId,
  },
});

// Option B: Non-Connect — add fee as a separate line item displayed to customer
// (customer sees itemized fee; platform keeps full checkout amount and pays merchant separately)
```

**Rules:**
- Fee is NEVER absorbed by the platform or merchant — always passed to the customer
- Minimum 7% hard floor — no exceptions, no discounts below 7%
- Fee percentage stored in Stripe metadata on every charge/session for audit trail
- Fee displayed as a separate line item ("Service fee") so customers see it clearly

```typescript
// ✅ Stripe metadata on every charge — required for audit
metadata: {
  platform_fee_cents: String(platformFeeCents),
  platform_fee_percent: String(feePercent),
  merchant_id: merchantId,
  heru: process.env.HERU_SLUG,  // e.g. "quik-car-rental", "dreami"
  order_id: orderId,
}
```

---

## Stripe Metadata — First-Class Requirement

Metadata is the backbone of dynamic routing. It MUST be set on every object.

```typescript
// ✅ Required metadata on Price objects (set in Stripe Dashboard)
// Every price MUST have at least these:
{
  clara_tier: "pro" | "business" | "starter",   // for SaaS subscription tiers
  clara_type: "developer_program" | "addon",    // for one-off purchases
  heru_plan: "<plan-name>",                      // for Heru-specific plans
  billing_cycle: "monthly" | "annual",           // for subscription cadence
}

// ✅ Required metadata on Checkout Sessions
{
  user_id: userId,
  heru: process.env.HERU_SLUG,
  order_type: "subscription" | "one_time" | "marketplace",
  platform_fee_percent: String(feePercent),     // always include when fee applies
}

// ✅ Required metadata on Payment Intents / Charges (for marketplace)
{
  merchant_id: merchantId,
  platform_fee_cents: String(feeCents),
  platform_fee_percent: String(feePercent),
  order_id: orderId,
  heru: process.env.HERU_SLUG,
}

// ❌ Creating any Stripe object without metadata
await stripe.checkout.sessions.create({ mode: "payment", line_items: [...] });
// ← missing metadata — unauditable, can't route webhook events correctly
```

---

## Disputes — handle `charge.dispute.created`

Disputes must be handled automatically. Never ignore them.

```typescript
// ✅ Add to webhook switch statement
case "charge.dispute.created": {
  const dispute = event.data.object as Stripe.Dispute;
  const chargeId = typeof dispute.charge === "string" ? dispute.charge : dispute.charge.id;

  // 1. Log the dispute
  logger.warn("Stripe dispute created", {
    disputeId: dispute.id,
    chargeId,
    amount: dispute.amount,
    reason: dispute.reason,
    status: dispute.status,
  });

  // 2. Find the order/subscription linked to this charge
  const order = await Order.findOne({ where: { stripeChargeId: chargeId } });

  // 3. Flag the order as disputed
  if (order) {
    await order.update({ status: "disputed", disputeId: dispute.id });
  }

  // 4. Notify ops team via Slack (or email)
  await notifyOpsTeam({
    message: `⚠️ Dispute opened: ${dispute.reason} — $${(dispute.amount / 100).toFixed(2)}`,
    disputeId: dispute.id,
    chargeId,
  });

  res.status(200).json({ received: true });
  break;
}

case "charge.dispute.closed": {
  const dispute = event.data.object as Stripe.Dispute;
  // Update order status based on outcome: "won" | "lost" | "needs_response"
  const order = await Order.findOne({ where: { disputeId: dispute.id } });
  if (order) {
    await order.update({
      status: dispute.status === "won" ? "completed" : "refunded",
    });
  }
  res.status(200).json({ received: true });
  break;
}
```

**Dispute events to register in Stripe Dashboard:**
- `charge.dispute.created`
- `charge.dispute.updated`
- `charge.dispute.closed`

---

## Refunds — handle `charge.refunded` and expose refund endpoint

```typescript
// ✅ Backend refund endpoint — admin or webhook triggered
router.post("/api/stripe/refund", requireAuth, async (req: ApiKeyRequest, res) => {
  const { chargeId, amount, reason } = req.body; // amount in cents, optional for full refund

  if (req.claraUser?.role !== "admin") {
    res.status(403).json({ error: "admin_required" });
    return;
  }

  const refund = await getStripe().refunds.create({
    charge: chargeId,
    amount: amount ?? undefined, // undefined = full refund
    reason: (reason as Stripe.RefundCreateParams.Reason) ?? "requested_by_customer",
    metadata: {
      admin_user_id: req.claraUser.userId,
      heru: process.env.HERU_SLUG!,
    },
  });

  // Update order status
  await Order.update(
    { status: amount ? "partially_refunded" : "refunded", refundId: refund.id },
    { where: { stripeChargeId: chargeId } }
  );

  logger.info("Refund issued", { refundId: refund.id, chargeId, amount: refund.amount });
  res.json({ refundId: refund.id, status: refund.status });
});

// ✅ Webhook: handle refund confirmation
case "charge.refunded": {
  const charge = event.data.object as Stripe.Charge;
  const isFullRefund = charge.amount_refunded === charge.amount;

  await Order.update(
    { status: isFullRefund ? "refunded" : "partially_refunded" },
    { where: { stripeChargeId: charge.id } }
  );

  res.status(200).json({ received: true });
  break;
}
```

**Refund events to register:**
- `charge.refunded`

---

## Updated Webhook Handler — Full Event List

```typescript
// ✅ Complete event set every Heru must handle
switch (event.type) {
  case "checkout.session.completed":      // provision access
  case "customer.subscription.updated":  // tier change
  case "customer.subscription.deleted":  // revoke access
  case "charge.dispute.created":         // flag + notify ops
  case "charge.dispute.closed":          // update order status
  case "charge.refunded":                // update order status
    break;
}
```

**Register ALL 6 events in Stripe Dashboard → Developers → Webhooks.**

---

## ngrok Webhook URL Pattern

The local ngrok tunnel for each Heru follows this convention:

```
https://[project-slug]-backend-dev.ngrok.quiknation.com
```

Examples:
- `clara-code` → `https://clara-code-backend-dev.ngrok.quiknation.com/api/webhooks/stripe`
- `clara-agents` → `https://clara-agents-backend-dev.ngrok.quiknation.com/api/webhooks/stripe`
- `quik-car-rental` → `https://quik-car-rental-backend-dev.ngrok.quiknation.com/api/webhooks/stripe`

Register this URL in Stripe Dashboard → Developers → Webhooks → Add endpoint for the `test` environment. Select events:
1. `checkout.session.completed`
2. `customer.subscription.updated`
3. `customer.subscription.deleted`
