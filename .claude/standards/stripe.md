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
