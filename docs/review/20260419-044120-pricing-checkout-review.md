# Code Review — Prompts 20 + 21: Pricing UI + Checkout Routes

**Date:** 2026-04-19
**Commits:** `40cc277d` (prompt 20), `d9c72c5a` (prompt 21), `0fa992e0` (engines follow-up)
**Branch:** develop
**Reviewer:** Carruthers (Tech Lead)

---

## Coverage Requirement Check

**Status:** ✅ PASS

| Metric | Result |
|--------|--------|
| Backend tests | 229/229 ✅ |
| CLI tests | 16/16 ✅ |
| Tests failed | 0 |
| Backend TypeScript | clean (0 errors) |
| Frontend TypeScript (changed files) | clean (0 errors in scope) |

*Frontend has pre-existing TypeScript errors in unrelated files (missing docx-preview, xlsx, pdfjs-dist, @lmstudio/sdk, ollama/browser packages). All errors pre-date these commits and are outside scope.*

---

## Executive Summary

- **Files Changed:** 8 (3 UI components, 1 dynamic route, 2 deleted pages, 1 manifest, 1 doc)
- **Overall Grade:** B+
- **Review Status:** ⚠️ CONDITIONAL — 1 HIGH issue must be fixed before Max tier is purchasable

---

## What Changed

| File | Change |
|------|--------|
| `frontend/src/components/sections/PricingCards.tsx` | 5-tier data: Basic $39 / Pro $59 / Max $99 / Business $299 / Enterprise $4k |
| `frontend/src/components/marketing/PricingSection.tsx` | Full rewrite — correct tiers, no free tier, no false claims |
| `frontend/src/components/LandingPage.tsx` | Inline pricing block → `<PricingCards />` call |
| `frontend/src/app/checkout/[tier]/page.tsx` | New dynamic route with tier validation + auth guard |
| `frontend/src/app/checkout/pro/page.tsx` | Deleted |
| `frontend/src/app/checkout/business/page.tsx` | Deleted |
| `packages/cli/package.json` | `engines: { "node": ">=20.0.0" }` declared |

---

## Issues

### HIGH — Backend checkout rejects `tier="max"` — 400 for Max plan checkout

**File:** `backend/src/routes/checkout.ts:45`

The backend tier validation guard:
```typescript
if (tier !== "basic" && tier !== "pro" && tier !== "business") {
  res.status(400).json({ error: "tier must be basic, pro, or business" });
  return;
}
```

Prompt 21 added `max` to the frontend `TIER_CONFIG` and the `/checkout/[tier]` page posts `{ tier: "max" }` for Max plan users. The backend rejects it with 400. Prompt 21 explicitly instructs: *"Verify the `tier` field accepts `"basic" | "pro" | "max" | "business"`"* — this was not done.

The `getPriceForTier` type signature is also missing `"max"`:
```typescript
async function getPriceForTier(
  stripe: Stripe,
  tier: "basic" | "pro" | "business"  // ← "max" missing
)
```

**Fix:**
1. Add `"max"` to the validation guard in `backend/src/routes/checkout.ts`
2. Add `"max"` to the `getPriceForTier` type signature
3. Add a test case to `backend/src/__tests__/routes/checkout.test.ts` for `tier=max`

**Impact:** Max plan checkout is broken for any user who navigates to `/checkout/max` — they get a 400 error and can't purchase.

---

### LOW — PricingCards CTA hrefs bypass the checkout route for signed-in users

**File:** `frontend/src/components/sections/PricingCards.tsx:17-39`

Pro/Max/Business CTAs link to `/sign-up?plan=pro`, `/sign-up?plan=max`, `/sign-up?plan=business`. For a user who is already signed in and clicks "Get Max" from the pricing page, Clerk's `/sign-up` will redirect them somewhere (likely home or dashboard) — they can't reach `/checkout/max` from the pricing card.

The `/checkout/[tier]` route is only accessible via direct URL entry.

This may be intentional per VRD (primary path = onboarding → activate, not direct checkout). But if pricing cards are meant to drive direct purchase for signed-in users, the CTAs should link to `/checkout/[tier]` instead of `/sign-up?plan=...`.

**Priority:** Low — the primary onboarding funnel (`/onboarding/activate`) works. This affects edge case of signed-in user clicking pricing cards.

---

## Positive Findings

**✅ False claims fully removed.** `PricingSection.tsx` previously contained "MIT Licensed", "open source forever", "self-hostable", "No credit card required", "Start Free Trial". All gone. No remnants found.

**✅ Free tier eliminated cleanly.** Zero `$0` or "Free" tier references in any pricing component. The 5-tier structure (Basic → Enterprise) is consistent across both components.

**✅ Tier data is consistent.** Slot counts (3/6/9/24/360), prices ($39/$59/$99/$299/$4k), and Enterprise mailto CTA are identical across `PricingCards.tsx`, `PricingSection.tsx`, and `/checkout/[tier]/page.tsx`.

**✅ Auth guard on checkout is correct.** Unsigned users hitting `/checkout/[tier]` get redirected to `/sign-up?redirect=/checkout/${tier}` — the return URL is encoded correctly so they land back after auth.

**✅ Tier validation in checkout page is solid.** `Object.hasOwn(TIER_CONFIG, value)` with a proper type guard. Unknown tiers redirect to `/pricing` cleanly.

**✅ Dynamic route pattern is correct.** `useParams()` + array/string handling for Next.js App Router. Clean `null` render during auth check prevents flash.

**✅ LandingPage.tsx deduplication complete.** Inline tier data replaced with `<PricingCards />`. Single source of truth for pricing data.

**✅ VRD voice tone.** "Activate — $39/mo" on the button. "Cancel anytime" retained (accurate). "$39 activates your team" in the subtitle. Correct.

---

## Required Action

**Queue corrective prompt for QCS1:**

Fix `backend/src/routes/checkout.ts` — add `"max"` to tier validation + `getPriceForTier` type + one test case. This is a 15-line fix. Everything else is approved as-is.
