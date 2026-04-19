# Prompt 20 — Fix Pricing UI: Vault Pricing, No Free Tier

**TARGET REPO:** `imaginationeverywhere/clara-code`
**BRANCH:** `fix/pricing-ui-vault-sync`
**BASE:** `develop`
**AGENT:** `cursor-anonymous`
**MACHINE:** QCS1
**MODEL:** `claude-sonnet-4-6`

---

## Mission

Three frontend pricing components show wrong prices and a free tier that does not exist.
The vault pricing has been locked since 2026-04-15 by Mary (Product Owner) and confirmed by Mo.
Fix all three components to match the locked pricing exactly. Remove every trace of a free tier.

**Founding principle (VRD-001, Mo, April 10 2026):**
> "You don't charge people for talking. You charge them for what talking leads to."

The conversation with Clara is free. Activation requires payment. $39 is the floor. No exceptions.

---

## Locked Pricing (FINAL — do not alter these numbers)

| Tier | Slots | Price | CTA | href |
|------|-------|-------|-----|------|
| Basic | 3 agents | $39/mo | Talk to Clara | `/sign-up` |
| Pro | 6 agents | $59/mo | Get Pro | `/sign-up?plan=pro` |
| Max | 9 agents | $99/mo | Get Max | `/sign-up?plan=max` |
| Small Business | 24 agents | $299/mo | Get Business | `/sign-up?plan=business` |
| Enterprise | 360 agents | $4,000/mo | Contact Sales | `mailto:team@claracode.ai` |

**Basic is the highlighted "Most Popular" tier** — it is the entry point for the onboarding funnel.

---

## Files to Modify

### 1. `frontend/src/components/sections/PricingCards.tsx`

Replace the `tiers` array entirely. Current wrong values: $0 Free / $29 Pro / $99 Business.

New `tiers` array must have all 5 tiers above. Keep the existing component structure
(card layout, highlight prop, CTA links). Only change the data.

Remove:
- The Free tier card entirely
- "Start free. Upgrade when you need more agents, API access, and memory." subtitle

Replace subtitle with:
```
Talk to Clara. Build your team. Activate for $39.
```

### 2. `frontend/src/components/marketing/PricingSection.tsx`

Full rewrite of the tier data. Current wrong values: $0 Free / $20 Pro / $99 Team.

Remove these false claims entirely:
- "No credit card required"
- "Open source forever"
- "MIT Licensed"
- "Self-hostable"
- "Download CLI" CTA
- "Start Free Trial" CTA
- "Source on GitHub" footer link
- "Cancel anytime" (keep — this is accurate for paid tiers)

The headline `"Start free. Scale when ready."` → `"Build your team. Ship with voice."`
Sub-headline → `"Talk to Clara for free. $39 activates your team."`

Keep the existing 3-column layout but use columns for Basic / Pro / Max.
Add a 4th full-width row below for Small Business + Enterprise side by side.

### 3. `frontend/src/components/LandingPage.tsx`

The inline pricing section at `id="pricing"` (around line 156) has the same wrong values.
Replace the pricing block with a call to `<PricingCards />` from
`@/components/sections/PricingCards` — do not maintain a second copy of pricing data.
Delete the inline tier objects ($0/$29/$99) and import the shared component instead.

If `PricingCards` is already imported elsewhere in `LandingPage.tsx`, just swap the
inline block for the component call. If not, add the import.

---

## Voice / Copy Rules (from VRD-001)

Clara never says these — don't put them in pricing copy either:
- "Free tier" / "free plan"
- "Start free" (implies there's a free ongoing product — there isn't)
- "Upgrade to continue" (mid-task wall language)
- "Unlimited" (banned — every tier has a HARD slot cap)

Clara-approved copy patterns:
- "Talk to Clara — it's free. Building starts at $39."
- "The conversation is always on us."
- "Three teammates you design, name, and voice yourself — $39/mo."

---

## Acceptance Criteria

- [ ] Zero `$0` or `Free` tier references in any pricing component
- [ ] All three components show Basic $39 / Pro $59 / Max $99 / Small Business $299 / Enterprise $4,000
- [ ] Slot counts correct: 3 / 6 / 9 / 24 / 360
- [ ] Basic is the highlighted card
- [ ] "Talk to Clara" CTA on Basic links to `/sign-up`
- [ ] Enterprise card says "Contact Sales" → `mailto:team@claracode.ai`
- [ ] No "MIT Licensed", "open source", "self-hostable", "no credit card required" copy
- [ ] LandingPage.tsx uses `<PricingCards />` — no inline duplicate tier data
- [ ] `npm run type-check` passes in `frontend/`
- [ ] `npm run lint` passes in `frontend/`

---

## Do NOT Touch

- `/frontend/src/app/onboarding/activate/page.tsx` — already correct ($39 Basic)
- `/frontend/src/app/checkout/` routes — covered by Prompt 21
- Backend pricing/model config — no backend changes in this prompt
- Any test files — only fix the three UI components listed above
