# Prompt 22 — Fix Backend: Add `max` Tier to Checkout Validation

**TARGET REPO:** `imaginationeverywhere/clara-code`
**BRANCH:** `fix/checkout-max-tier`
**BASE:** `develop`
**AGENT:** `cursor-anonymous`
**MACHINE:** QCS1
**MODEL:** `claude-sonnet-4-6`

---

## Mission

Prompt 21 added the Max plan to the frontend checkout page (`/checkout/max` → posts `tier: "max"` to the API).
The backend `checkout.ts` was NOT updated. Any user selecting Max plan gets a 400 error.

This is a 3-line fix + 1 test case. Do it now.

---

## What's Broken

**File:** `backend/src/routes/checkout.ts`

### Bug 1 — Tier validation guard (line ~45)

Current:
```typescript
if (tier !== "basic" && tier !== "pro" && tier !== "business") {
  res.status(400).json({ error: "tier must be basic, pro, or business" });
  return;
}
```

`"max"` is not in the list. Posting `{ tier: "max" }` returns 400.

### Bug 2 — `getPriceForTier` type signature (line ~17)

Current:
```typescript
async function getPriceForTier(
  stripe: Stripe,
  tier: "basic" | "pro" | "business"
): Promise<string>
```

`"max"` is missing from the union.

---

## Exact Fixes Required

### Fix 1 — `backend/src/routes/checkout.ts` validation guard

Change:
```typescript
if (tier !== "basic" && tier !== "pro" && tier !== "business") {
  res.status(400).json({ error: "tier must be basic, pro, or business" });
  return;
}
```

To:
```typescript
if (tier !== "basic" && tier !== "pro" && tier !== "max" && tier !== "business") {
  res.status(400).json({ error: "tier must be basic, pro, max, or business" });
  return;
}
```

### Fix 2 — `getPriceForTier` signature

Change:
```typescript
async function getPriceForTier(stripe: Stripe, tier: "basic" | "pro" | "business"): Promise<string>
```

To:
```typescript
async function getPriceForTier(stripe: Stripe, tier: "basic" | "pro" | "max" | "business"): Promise<string>
```

Also update the cast on the call site from:
```typescript
priceId = await getPriceForTier(stripe, tier as "basic" | "pro" | "business");
```
To:
```typescript
priceId = await getPriceForTier(stripe, tier as "basic" | "pro" | "max" | "business");
```

---

## Test to Add

**File:** `backend/src/__tests__/routes/checkout.test.ts`

Add one test case to the existing checkout test suite:

```typescript
it("POST /create-session accepts tier=max", async () => {
  // mock stripe and Subscription same as the existing pro/basic tests
  const res = await request(app)
    .post("/api/checkout/create-session")
    .send({ tier: "max" });
  // Should NOT return 400
  expect(res.status).not.toBe(400);
});
```

Follow the existing mock pattern in the file. The test just needs to confirm `max` doesn't hit the 400 guard.

---

## Acceptance Criteria

- [ ] `POST /api/checkout/create-session` with `{ tier: "max" }` does NOT return 400
- [ ] `npm run type-check` passes in `backend/`
- [ ] `npm test` passes in `backend/` (229 + new test = 230+)
- [ ] Error message updated: "tier must be basic, pro, max, or business"

---

## Do NOT Touch

- Frontend files — all correct
- `backend/src/routes/checkout.ts` Stripe price lookup logic — only the validation guard and type signature
- Any other routes
