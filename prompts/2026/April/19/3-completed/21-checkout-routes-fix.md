# Prompt 21 — Fix Checkout Routes: Stale /pro + /business, Add Dynamic /[tier]

**TARGET REPO:** `imaginationeverywhere/clara-code`
**BRANCH:** `fix/checkout-routes-vault-tiers`
**BASE:** `develop`
**AGENT:** `cursor-anonymous`
**MACHINE:** QCS1
**MODEL:** `claude-sonnet-4-6`

---

## Mission

Two checkout pages exist for tiers that no longer match the locked vault pricing.
`/checkout/pro` and `/checkout/business` post wrong tier strings to the API.
Replace them with a single dynamic `/checkout/[tier]` route that handles all paid tiers
and shows the correct price + slot count for each.

The primary conversion path (landing → onboarding → team builder → `/onboarding/activate`)
is already correct and must NOT be touched. This prompt fixes the secondary path for users
who click a pricing card directly.

---

## Locked Tier Config (source of truth — do not deviate)

```ts
// Use this exact map in the new route
const TIER_CONFIG = {
  basic:    { label: 'Basic',          price: '$39', slots: 3,   period: '/mo' },
  pro:      { label: 'Pro',            price: '$59', slots: 6,   period: '/mo' },
  max:      { label: 'Max',            price: '$99', slots: 9,   period: '/mo' },
  business: { label: 'Small Business', price: '$299', slots: 24, period: '/mo' },
} as const

type Tier = keyof typeof TIER_CONFIG
```

Enterprise is NOT self-serve — no checkout page for it. Contact Sales only.

---

## Files to Delete

```
frontend/src/app/checkout/pro/page.tsx
frontend/src/app/checkout/business/page.tsx
```

Delete both files and their parent directories if they become empty.

---

## File to Create

### `frontend/src/app/checkout/[tier]/page.tsx`

Dynamic Next.js App Router page. Requirements:

1. **Validate `tier` param** — if not in `TIER_CONFIG`, redirect to `/pricing`.

2. **UI** — show tier name, price, slot count, and a single "Activate" button that:
   - POSTs `{ tier }` to `/api/checkout/create-session`
   - On success: redirect to the returned `url` (Stripe Hosted Checkout)
   - On error: show the error message inline, keep button enabled for retry

3. **Auth guard** — if user is not signed in, redirect to `/sign-up?redirect=/checkout/${tier}`.
   Use `useAuth()` from `@clerk/nextjs` for this check.

4. **Copy** — match VRD voice tone:
   - Heading: `"Activate {tierLabel}"` (e.g., "Activate Basic")
   - Subheading: `"{slots} teammates. {price}/mo. Cancel anytime."`
   - Button: `"Activate — {price}/mo"`
   - Back link: `← Back to pricing` → `/pricing`

5. **Styling** — use existing design tokens:
   - Background: `bg-bg-base`
   - Card: `bg-bg-raised border border-white/8 rounded-2xl p-8`
   - Button: `bg-brand-purple text-white rounded-xl py-3 px-6 font-semibold`
   - Match the existing activate page pattern at `frontend/src/app/onboarding/activate/page.tsx`

6. **No 'use server'** — this is a client component (`'use client'`). Auth + fetch happen client-side.

---

## API Route: Confirm `/api/checkout/create-session` accepts all 4 tiers

Open `frontend/src/app/api/checkout/create-session/route.ts`.

Verify the `tier` field accepts `"basic" | "pro" | "max" | "business"`.
If it only accepts `"pro" | "business"`, extend the type to include `"basic"` and `"max"`.
Do NOT change the backend `checkout.ts` route — only the frontend API proxy if needed.

---

## Acceptance Criteria

- [ ] `/checkout/pro` and `/checkout/business` routes deleted
- [ ] `/checkout/basic` renders correctly (shows 3 slots, $39/mo)
- [ ] `/checkout/pro` → redirects to `/pricing` (deleted, dynamic route takes over)
- [ ] `/checkout/[tier]` with unknown tier → redirects to `/pricing`
- [ ] Unauthenticated user visiting `/checkout/basic` → redirected to `/sign-up?redirect=/checkout/basic`
- [ ] "Activate" button POSTs `{ tier: "basic" }` and follows returned Stripe URL
- [ ] `npm run type-check` passes in `frontend/`
- [ ] `npm run lint` passes in `frontend/`

---

## Do NOT Touch

- `frontend/src/app/onboarding/activate/page.tsx` — correct, leave it alone
- `backend/src/routes/checkout.ts` — no backend changes in this prompt
- Any pricing UI components — covered by Prompt 20
- Any auth middleware or Clerk config
