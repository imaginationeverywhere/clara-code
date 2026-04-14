# Stripe Checkout + API Key Provisioning

**Source:** `docs/auto-claude/PRODUCT_PRD.md` — read this document before writing any code.
**Branch:** `prompt/2026-04-14/01-stripe-checkout-and-api-key-provisioning`
**Scope:** `backend/src/` only — no frontend changes in this prompt

---

## Context

Clara Code is a voice-first developer tool. Developers subscribe to unlock their API key, which gates access to the SDK and voice features. This prompt wires the Stripe Checkout → subscription → API key lifecycle. See `docs/auto-claude/PRODUCT_PRD.md` for the full tier definitions.

## Subscription Tiers (from PRD)

| Tier | Price | Stripe Price ID env var |
|---|---|---|
| Pro | $29/mo | `STRIPE_PRICE_PRO` |
| Business | $99/mo | `STRIPE_PRICE_BUSINESS` |

## Required Work

### 1. Database Migration

Create migration `backend/src/migrations/XXXXXX-add-api-keys-and-subscriptions.js`:

```sql
-- subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL UNIQUE,  -- Clerk user ID
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  tier VARCHAR(50) NOT NULL DEFAULT 'free',  -- 'free' | 'pro' | 'business'
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- api_keys table
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  key_hash VARCHAR(255) NOT NULL UNIQUE,  -- store bcrypt hash, never plaintext
  key_prefix VARCHAR(20) NOT NULL,        -- e.g. "cc_live_xxxx" for display
  tier VARCHAR(50) NOT NULL DEFAULT 'free',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
```

Run migration on all three environments:
- `backend/.env.local`
- `backend/.env.develop`
- `backend/.env.production`

### 2. API Key Generation Utility

Create `backend/src/utils/api-key.ts`:

```typescript
import crypto from "crypto";
import bcrypt from "bcryptjs";

export function generateApiKey(tier: "free" | "pro" | "business"): {
  key: string;      // full key — shown ONCE to user
  hash: string;     // bcrypt hash — stored in DB
  prefix: string;   // first 16 chars — shown for identification
} {
  const random = crypto.randomBytes(32).toString("hex");
  const key = `cc_live_${random}`;
  const hash = bcrypt.hashSync(key, 12);
  const prefix = key.slice(0, 16);
  return { key, hash, prefix };
}

export async function validateApiKey(key: string, hash: string): Promise<boolean> {
  return bcrypt.compare(key, hash);
}
```

### 3. Stripe Checkout Route

Add `backend/src/routes/checkout.ts`:

- `POST /api/checkout/create-session`
  - Requires Clerk auth (`requireAuth()`)
  - Body: `{ tier: "pro" | "business" }`
  - Creates Stripe Customer if none exists for this user
  - Creates Stripe Checkout session with the correct price ID
  - Returns `{ url: string }` — the Checkout URL to redirect to
  - Set `success_url` to `${FRONTEND_URL}/settings?checkout=success`
  - Set `cancel_url` to `${FRONTEND_URL}/pricing`
  - Store `clerk_user_id` in Stripe customer metadata

### 4. Stripe Webhook Handler

Add to `backend/src/routes/webhooks.ts` (or create if it only has Clerk):

Handle these Stripe events:

**`checkout.session.completed`**
1. Retrieve subscription from Stripe
2. Upsert row in `subscriptions` table
3. Generate API key using `generateApiKey(tier)`
4. Store key hash + prefix in `api_keys` table
5. **Do NOT log or return the full key** — it is emailed or shown in dashboard only once

**`customer.subscription.updated`**
1. Update `subscriptions` table with new tier and status
2. If tier changed (upgrade/downgrade): deactivate old API key, generate new one
3. Update `api_keys` table

**`customer.subscription.deleted`**
1. Set subscription status to `canceled`
2. Set API key `is_active = false`
3. User reverts to free tier behavior (no key revocation — existing key returns 402 on voice calls)

Validate all webhook events with Stripe webhook signature using `STRIPE_WEBHOOK_SECRET`.

### 5. API Key Validation Middleware

Create `backend/src/middleware/api-key-auth.ts`:

```typescript
// Validates Bearer token as either:
// 1. Clerk JWT (existing behavior)
// 2. Clara Code API key (new behavior)
// Sets req.claraUser = { userId, tier, apiKeyId } on success
```

On every request to `/api/voice/*` and `/api/agents/*`:
1. Extract `Authorization: Bearer <token>`
2. If token starts with `cc_live_`: validate against `api_keys` table
3. If token is Clerk JWT: validate via existing Clerk middleware
4. Attach `req.claraUser.tier` for tier enforcement downstream
5. Update `api_keys.last_used_at`

### 6. Dashboard API Key Endpoint

`GET /api/user/api-key`
- Returns: `{ prefix: string, tier: string, created_at: string, last_used_at: string | null }`
- Never returns the full key hash — prefix only
- If no key exists (free user): returns `{ prefix: null, tier: "free" }`

`POST /api/user/api-key/regenerate`
- Deactivates current key
- Generates new key
- Returns the full new key ONCE in the response body — this is the only time it's visible
- Frontend must show "Copy this key now — it will not be shown again"

### 7. Environment Variables

Add to `backend/.env.example`:
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_BUSINESS=price_...
FRONTEND_URL=https://claracode.ai
```

## Tests Required

Add to `backend/src/__tests__/`:
- `checkout.test.ts` — mock Stripe, test session creation for pro and business tiers
- `webhook-stripe.test.ts` — test all three webhook events with mock Stripe payloads
- `api-key-auth.test.ts` — test key validation middleware (valid key, expired key, wrong key)

All tests must pass. Backend coverage must remain above 80%.

## Acceptance Criteria

- [ ] `POST /api/checkout/create-session` returns a Stripe Checkout URL for pro and business tiers
- [ ] `checkout.session.completed` webhook generates an API key and stores it (hash only) in DB
- [ ] `customer.subscription.deleted` deactivates the API key
- [ ] `GET /api/user/api-key` returns prefix + tier (never the full key)
- [ ] `POST /api/user/api-key/regenerate` returns the new full key exactly once
- [ ] API key validates on `/api/voice/*` requests
- [ ] `npm test` passes — zero failures
- [ ] Coverage remains ≥ 80%

## Do NOT

- Do not touch frontend code
- Do not change existing Clerk auth middleware
- Do not commit `.env` files
- Do not log full API keys anywhere — not stdout, not the database
