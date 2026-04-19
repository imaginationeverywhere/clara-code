# Prompt 06 — Stripe Checkout: Dynamic Pricing + Wire Frontend

**Date**: 2026-04-14
**Branch**: `prompt/2026-04-14/06-stripe-checkout-dynamic-pricing`
**Flags**: `--stripe --testing --security`
**Estimated scope**: 6–8 files

---

## Context

Stripe live keys are in AWS SSM and Wrangler secrets. The backend checkout route exists at `backend/src/routes/checkout.ts` but it **still uses hardcoded `STRIPE_PRICE_PRO` and `STRIPE_PRICE_BUSINESS` environment variables**. These must be removed — Clara Code uses dynamic pricing exclusively. No hardcoded price IDs, no env var price IDs.

The frontend checkout pages (`frontend/src/app/checkout/pro/page.tsx`) are placeholder text. They must become real Hosted Checkout redirects.

**Dynamic pricing rule (NON-NEGOTIABLE):** All price lookups must use `stripe.prices.list()` with Stripe metadata filters. Clara tier is stored in the Stripe price's metadata as `clara_tier: "pro"` or `clara_tier: "business"`. Never use price ID env vars.

---

## What Exists

```
backend/src/routes/checkout.ts           ← fix priceIdForTier() — remove env vars
backend/src/routes/webhooks-stripe.ts    ← fix customer.subscription.updated — remove env vars
frontend/src/app/checkout/pro/page.tsx   ← placeholder; wire to checkout flow
frontend/src/app/checkout/success/page.tsx  ← placeholder; show confirmation
frontend/src/app/pricing/page.tsx        ← wire CTAs to trigger checkout
backend/src/routes/index.ts             ← verify /checkout is registered
```

---

## Task 1 — Fix `backend/src/routes/checkout.ts`

**Remove** the `priceIdForTier()` function entirely:
```typescript
// DELETE THIS:
function priceIdForTier(tier: "pro" | "business"): string | undefined {
  const id = tier === "pro" ? process.env.STRIPE_PRICE_PRO : process.env.STRIPE_PRICE_BUSINESS;
  return id?.trim() || undefined;
}
```

**Replace with** dynamic lookup:
```typescript
async function getPriceForTier(stripe: Stripe, tier: "pro" | "business"): Promise<string> {
  const prices = await stripe.prices.list({ active: true, limit: 100 });
  const match = prices.data.find(
    (p) => p.metadata?.clara_tier === tier && p.type === "recurring"
  );
  if (!match) {
    throw new Error(`No active recurring Stripe price found with metadata clara_tier=${tier}`);
  }
  return match.id;
}
```

Update the checkout session creation in the route handler:
```typescript
// Replace:
const priceId = priceIdForTier(tier);
if (!priceId) {
  res.status(503).json({ error: "Stripe price ID not configured for this tier" });
  return;
}

// With:
let priceId: string;
try {
  priceId = await getPriceForTier(stripe, tier);
} catch {
  res.status(503).json({ error: "No active plan found for this tier — contact support" });
  return;
}
```

Also update the checkout session to include metadata confirming dynamic pricing:
```typescript
const session = await stripe.checkout.sessions.create({
  mode: "subscription",
  customer: customerId,
  line_items: [{ price: priceId, quantity: 1 }],
  success_url: `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${frontendUrl}/pricing`,
  metadata: {
    clerk_user_id: auth.userId,
    tier,
  },
  subscription_data: {
    metadata: { clerk_user_id: auth.userId, tier },
  },
});
```

Note: success URL includes `?session_id={CHECKOUT_SESSION_ID}` (Stripe template variable) for the success page.

---

## Task 2 — Fix `backend/src/routes/webhooks-stripe.ts`

In the `customer.subscription.updated` case, the current code resolves tier from price ID via env vars:
```typescript
// DELETE THESE:
const pro = process.env.STRIPE_PRICE_PRO;
const bus = process.env.STRIPE_PRICE_BUSINESS;
let tier: "pro" | "business" | null = null;
if (priceId && priceId === pro) tier = "pro";
else if (priceId && priceId === bus) tier = "business";
```

**Replace with** metadata-first lookup (metadata already on the subscription from checkout):
```typescript
// Tier comes from subscription metadata (set during checkout.session.completed)
// Fallback: look it up from the price metadata
let tier: "pro" | "business" | null = null;

if (stripeSub.metadata?.tier === "pro" || stripeSub.metadata?.tier === "business") {
  tier = stripeSub.metadata.tier as "pro" | "business";
} else {
  // Fallback: look up price metadata dynamically
  const priceItem = stripeSub.items.data[0];
  if (priceItem?.price?.id) {
    try {
      const price = await stripe.prices.retrieve(priceItem.price.id);
      const claraTier = price.metadata?.clara_tier;
      if (claraTier === "pro" || claraTier === "business") {
        tier = claraTier;
      }
    } catch {
      logger.warn("subscription.updated could not retrieve price for tier resolution");
    }
  }
}

if (!tier) {
  logger.warn("customer.subscription.updated: cannot resolve tier, skipping");
  break;
}
```

---

## Task 3 — Wire `frontend/src/app/checkout/pro/page.tsx`

Replace the placeholder with a real checkout initiation page. This is a client component that:
1. On mount (or on button click) calls the backend `POST /api/checkout/create-session` with `tier: "pro"`
2. Redirects to the Stripe Hosted Checkout URL
3. Shows a loading state while the session is being created
4. Shows an error state if the API call fails

```typescript
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "@/components/marketing/Header";

export const dynamic = "force-dynamic";

export default function CheckoutProPage() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function startCheckout() {
      try {
        const res = await fetch("/api/checkout/create-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tier: "pro" }),
        });
        const data = await res.json() as { url?: string; error?: string };
        if (!res.ok || !data.url) {
          setError(data.error ?? "Failed to start checkout. Please try again.");
          return;
        }
        window.location.href = data.url;
      } catch {
        setError("Network error. Please try again.");
      }
    }
    void startCheckout();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-bg-base text-white">
        <Header />
        <div className="mx-auto max-w-lg px-6 pb-24 pt-28 text-center">
          <p className="text-text-secondary">{error}</p>
          <button
            type="button"
            onClick={() => router.push("/pricing")}
            className="mt-6 text-sm text-clara hover:underline"
          >
            ← Back to Pricing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base text-white">
      <Header />
      <div className="mx-auto max-w-lg px-6 pb-24 pt-28 text-center">
        <p className="text-text-muted text-sm">Redirecting to secure checkout…</p>
      </div>
    </div>
  );
}
```

---

## Task 4 — Wire `frontend/src/app/checkout/success/page.tsx`

Replace placeholder with a proper success confirmation:

```typescript
import Link from "next/link";
import { Header } from "@/components/marketing/Header";

export const dynamic = "force-dynamic";

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-bg-base text-white">
      <Header />
      <div className="mx-auto max-w-lg px-6 pb-24 pt-28 text-center">
        <h1 className="text-3xl font-bold">You're in.</h1>
        <p className="mt-4 text-text-secondary">
          Your Clara Code subscription is active. Your API key is ready in the dashboard.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="rounded-lg bg-clara px-6 py-3 text-sm font-semibold text-white hover:bg-clara/90"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/docs"
            className="rounded-lg border border-border px-6 py-3 text-sm font-semibold text-text-secondary hover:border-border-hover"
          >
            Read the Docs
          </Link>
        </div>
      </div>
    </div>
  );
}
```

---

## Task 5 — Create `frontend/src/app/api/checkout/create-session/route.ts`

The checkout page calls `/api/checkout/create-session` but this is the FRONTEND Next.js API — it should proxy to the backend. Create this route:

```typescript
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://api-dev.claracode.ai";

export async function POST(req: Request) {
  const { userId, getToken } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as { tier?: string };
  const token = await getToken();

  const res = await fetch(`${BACKEND_URL}/api/checkout/create-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ tier: body.tier }),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
```

---

## Task 6 — Add `STRIPE_WEBHOOK_SECRET` to backend `.env.example`

Find `backend/.env.example` (or create it if absent). Ensure it includes:

```bash
# Stripe — dynamic pricing, no price ID env vars
# Stripe merchant keys are in AWS SSM: /clara-code/STRIPE_SECRET_KEY
# Wrangler secret: STRIPE_SECRET_KEY (set via: wrangler secret put STRIPE_SECRET_KEY)
STRIPE_SECRET_KEY=sk_test_...

# Webhook signing secret — from Stripe Dashboard → Webhooks → your endpoint → Signing secret
# For local testing: stripe listen --forward-to localhost:3001/api/webhooks/stripe
STRIPE_WEBHOOK_SECRET=whsec_...

# ❌ DO NOT ADD: STRIPE_PRICE_PRO or STRIPE_PRICE_BUSINESS
# Clara Code uses dynamic pricing. Prices are resolved via stripe.prices.list()
# with metadata clara_tier=pro or clara_tier=business.
# Set clara_tier metadata on your Stripe prices in the dashboard.
```

---

## Task 7 — Add Tests

Add `backend/src/__tests__/checkout.test.ts`:
1. `POST /api/checkout/create-session` with valid `tier: "pro"` → calls `stripe.prices.list()` and `stripe.checkout.sessions.create()`, returns `{ url: "https://checkout.stripe.com/..." }`
2. `POST /api/checkout/create-session` with invalid tier → 400
3. When no active price found for tier → 503 with helpful message
4. Unauthenticated request → 401

Add `backend/src/__tests__/webhooks-stripe-tier-resolution.test.ts`:
1. `customer.subscription.updated` with `metadata.tier = "pro"` → resolves tier from metadata (does NOT call `stripe.prices.retrieve`)
2. `customer.subscription.updated` with no tier in metadata → falls back to `stripe.prices.retrieve()` + `price.metadata.clara_tier`
3. Neither metadata nor price has tier → logs warning, skips (no crash)

Use `jest.fn()` to mock Stripe SDK. Do NOT use real Stripe API calls in tests.

---

## Acceptance Criteria

- [ ] `backend/src/routes/checkout.ts` has NO reference to `STRIPE_PRICE_PRO` or `STRIPE_PRICE_BUSINESS`
- [ ] `backend/src/routes/webhooks-stripe.ts` has NO reference to `STRIPE_PRICE_PRO` or `STRIPE_PRICE_BUSINESS`
- [ ] `grep -r "STRIPE_PRICE_" backend/src/` returns zero results
- [ ] Tier resolution uses Stripe metadata (`clara_tier`) exclusively
- [ ] `frontend/src/app/checkout/pro/page.tsx` redirects to Stripe Hosted Checkout
- [ ] `frontend/src/app/checkout/success/page.tsx` shows confirmation with dashboard link
- [ ] `frontend/src/app/api/checkout/create-session/route.ts` exists and proxies to backend
- [ ] All new tests pass
- [ ] `cd backend && npm run type-check` passes
- [ ] `cd frontend && npm run type-check` passes
- [ ] Biome/lint passes on changed files

## What NOT to Change

- `backend/src/routes/webhooks-stripe.ts` `checkout.session.completed` block — already correct (uses `session.metadata.tier`, not price IDs)
- GA4 `purchase` event in webhook — already correct
- `backend/src/models/Subscription.ts` — do NOT change schema
- Sign-in, sign-up, dashboard pages
