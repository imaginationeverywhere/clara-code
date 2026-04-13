# 06 — Stripe Live: Build Checkout + Subscription Billing

**Surface:** Frontend checkout + Backend Stripe API routes
**Repo:** `/Volumes/X10-Pro/Native-Projects/AI/clara-code`
**Branch:** `develop`
**Agent:** Miles + Motley (backend + frontend, run after prompts 01 and 02)
**Unblocked:** 2026-04-13 — Stripe merchant account approved, live keys in SSM

---

## Context

Stripe merchant account is live. Keys are stored in SSM:
- `/clara-code/STRIPE_PUBLISHABLE_KEY` — publishable key (baked into frontend build)
- `/clara-code/STRIPE_SECRET_KEY` — secret key (server-side only, Wrangler secret)

Pricing is $49/mo Starter, $99/mo Pro. This prompt builds the checkout flow end-to-end.

---

## Task 1 — Stripe Products and Prices (one-time setup via CLI)

Run these once to create products and prices in the live Stripe account:

```bash
# Pull secret key from SSM
SK=$(aws ssm get-parameter --name "/clara-code/STRIPE_SECRET_KEY" --with-decryption \
  --query 'Parameter.Value' --output text --region us-east-1)

# Create Starter product
STARTER_PRODUCT=$(curl -s https://api.stripe.com/v1/products \
  -u "$SK:" \
  -d name="Clara Code Starter" \
  -d description="Voice-first AI coding — 50 voice queries/day, 1 API key" \
  | python3 -c "import json,sys; print(json.load(sys.stdin)['id'])")

# Create Starter price: $49/mo
STARTER_PRICE=$(curl -s https://api.stripe.com/v1/prices \
  -u "$SK:" \
  -d product="$STARTER_PRODUCT" \
  -d unit_amount=4900 \
  -d currency=usd \
  -d "recurring[interval]=month" \
  | python3 -c "import json,sys; print(json.load(sys.stdin)['id'])")

# Create Pro product
PRO_PRODUCT=$(curl -s https://api.stripe.com/v1/products \
  -u "$SK:" \
  -d name="Clara Code Pro" \
  -d description="Voice-first AI coding — unlimited voice, 10 API keys, priority support" \
  | python3 -c "import json,sys; print(json.load(sys.stdin)['id'])")

# Create Pro price: $99/mo
PRO_PRICE=$(curl -s https://api.stripe.com/v1/prices \
  -u "$SK:" \
  -d product="$PRO_PRODUCT" \
  -d unit_amount=9900 \
  -d currency=usd \
  -d "recurring[interval]=month" \
  | python3 -c "import json,sys; print(json.load(sys.stdin)['id'])")

echo "STARTER_PRICE_ID=$STARTER_PRICE"
echo "PRO_PRICE_ID=$PRO_PRICE"
```

Store the price IDs in SSM:
```bash
aws ssm put-parameter --name "/clara-code/STRIPE_STARTER_PRICE_ID" --value "$STARTER_PRICE" --type String --region us-east-1
aws ssm put-parameter --name "/clara-code/STRIPE_PRO_PRICE_ID" --value "$PRO_PRICE" --type String --region us-east-1
```

---

## Task 2 — Backend: Checkout Session Route

**File:** `backend/src/routes/index.ts` — add checkout route

```typescript
// POST /api/checkout/session
// Creates a Stripe Checkout Session for the selected plan
router.post('/checkout/session', requireAuth, async (req, res) => {
  const { priceId } = req.body
  const userId = req.auth.userId

  // Validate priceId is one of our known prices
  const validPrices = [
    process.env.STRIPE_STARTER_PRICE_ID,
    process.env.STRIPE_PRO_PRICE_ID,
  ]
  if (!validPrices.includes(priceId)) {
    return res.status(400).json({ error: 'Invalid price' })
  }

  // Get or create Stripe customer
  let customerId = await db.getStripeCustomerId(userId)
  if (!customerId) {
    const customer = await stripe.customers.create({
      metadata: { clerkUserId: userId },
    })
    customerId = customer.id
    await db.saveStripeCustomerId(userId, customerId)
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${process.env.SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.SITE_URL}/pricing`,
    subscription_data: {
      metadata: { clerkUserId: userId },
    },
  })

  res.json({ url: session.url })
})

// POST /api/billing/portal
// Creates a Stripe Billing Portal session for subscription management
router.post('/billing/portal', requireAuth, async (req, res) => {
  const userId = req.auth.userId
  const customerId = await db.getStripeCustomerId(userId)

  if (!customerId) {
    return res.status(404).json({ error: 'No billing account found' })
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.SITE_URL}/dashboard`,
  })

  res.json({ url: session.url })
})
```

---

## Task 3 — Backend: Stripe Webhook Handler

**File:** `backend/src/routes/webhooks.ts`

Handle these Stripe events:
- `checkout.session.completed` → activate subscription, provision API keys
- `customer.subscription.updated` → update plan in DB
- `customer.subscription.deleted` → downgrade to free tier, revoke excess API keys
- `invoice.payment_failed` → send email notification (log for now)

```typescript
case 'checkout.session.completed': {
  const session = event.data.object as Stripe.Checkout.Session
  const clerkUserId = session.subscription_data?.metadata?.clerkUserId
  if (clerkUserId) {
    await db.activateSubscription(clerkUserId, session.subscription as string)
    await db.provisionApiKey(clerkUserId, 'Default key')
  }
  break
}
```

---

## Task 4 — Frontend: Checkout Page

**File:** `frontend/src/app/checkout/page.tsx`

Replace any stub with a working checkout page:
1. Read `?plan=starter` or `?plan=pro` from URL params
2. Show plan summary (name, price, features)
3. "Subscribe" button → calls `POST /api/checkout/session` → redirects to Stripe Checkout URL
4. Show loading state while creating session
5. Handle errors gracefully

---

## Task 5 — Frontend: Checkout Success Page

**File:** `frontend/src/app/checkout/success/page.tsx` (create if not exists)

After successful payment:
1. Show "Welcome to Clara Code [Plan]!" confirmation
2. Show the generated API key (pull from `GET /api/keys`)
3. Show install instructions: `npx claracode@latest`
4. CTA: "Open Dashboard" → `/dashboard`

---

## Task 6 — Frontend: Pricing Page Connect-to-Checkout

**File:** `frontend/src/app/pricing/page.tsx` (or `(marketing)/pricing/`)

Update "Get Started" / "Subscribe" buttons to:
- If user not signed in: go to `/sign-up?redirect=/checkout?plan=starter`
- If user signed in: call checkout API directly
- Show current plan if user already has a subscription

---

## Task 7 — Build with Live Publishable Key

Before running `npm run pages:build`, pull the key from SSM:

```bash
export NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$(aws ssm get-parameter \
  --name "/clara-code/STRIPE_PUBLISHABLE_KEY" \
  --with-decryption --query 'Parameter.Value' --output text --region us-east-1)

cd frontend && npm run pages:build && npx wrangler deploy --env production
```

---

## Acceptance Criteria

- [ ] `POST /api/checkout/session` creates a Stripe Checkout URL
- [ ] User clicks "Subscribe" → lands on Stripe Checkout → payment succeeds
- [ ] `checkout.session.completed` webhook fires → subscription activated in DB
- [ ] User sees their plan on dashboard after checkout
- [ ] Billing portal accessible from dashboard settings
- [ ] `STRIPE_SECRET_KEY` never appears in any frontend bundle or git file
- [ ] All existing tests still pass

---

## Do NOT

- Do not hardcode Stripe keys anywhere — always pull from SSM or process.env
- Do not commit any `.env` files with live keys
- Do not add Stripe Elements/JS directly to the frontend — use Stripe Hosted Checkout (simplest, most secure)
- Do not add trial periods without Mo's explicit approval
