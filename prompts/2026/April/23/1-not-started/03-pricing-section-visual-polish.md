# Pricing Section — Visual Polish to Match Magic Patterns

**Source:** mockups/site/src/components/PricingSection.tsx
**Target:** frontend/src/components/sections/PricingCards.tsx + frontend/src/components/marketing/PricingSection.tsx

## Context

The pricing tiers and prices are correct as-is (Basic $39 / Pro $59 / Max $99 / Business $299 / Enterprise $4k). Do NOT change prices or tier names. The fix is purely visual — apply the mockup's card styling, typography, and layout to the existing tier data.

## Required Fixes

### 1. Section Header Copy

**Current:**
```
"Build your team. Ship with voice."
"Talk to Clara for free. $39 activates your team."
```

**Correct (from mockup):**
```
Eyebrow: "PRICING" (uppercase, text-white/30, tracking-wider, text-xs)
H2 line 1: "Simple pricing." (white)
H2 line 2: "Scale as you grow." (gradient #7C3AED → #4F8EF7)
Subtext: "Cancel anytime. No hidden fees."
```

### 2. Card Visual Treatment

Each card in `PricingCards.tsx` needs these exact styles from the mockup:

**Base card:**
```tsx
className="relative flex flex-col bg-[#111827] border border-white/10 rounded-2xl p-6 gap-4"
```

**Highlighted card (Basic — "Most Popular"):**
```tsx
className="relative flex flex-col bg-[#111827] border border-[#7C3AED]/40 rounded-2xl p-6 gap-4 ring-1 ring-[#7C3AED]/40"
// Add gradient overlay
<div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#7C3AED]/[0.07] to-transparent pointer-events-none" />
```

**"Most Popular" badge (on highlighted card only):**
```tsx
<span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#7C3AED] text-white text-xs font-medium px-3 py-1 rounded-full">
  Most Popular
</span>
```

### 3. Price Display Typography

```tsx
{/* Price */}
<div className="flex items-end gap-1">
  <span className="text-4xl font-bold text-white">${price}</span>
  <span className="text-white/40 text-sm mb-1">/mo</span>
</div>
```

For Enterprise — show "Contact us" instead of a number.

### 4. Feature List Items

Each feature line uses a checkmark icon in brand color:

```tsx
<li className="flex items-start gap-2 text-sm text-white/70">
  <svg className="w-4 h-4 mt-0.5 shrink-0 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
  {feature}
</li>
```

### 5. CTA Button Styles

- **Highlighted tier button:** `bg-[#7C3AED] hover:bg-[#6D28D9] text-white`
- **All other tiers:** `border border-white/20 hover:border-white/40 text-white/80 hover:text-white bg-transparent`
- All buttons: `w-full py-2.5 rounded-lg text-sm font-medium transition-colors`

### 6. Footer Fine Print

Add below the card grid:
```tsx
<p className="text-center text-xs text-white/30 mt-8">
  All plans include CLI access · Prices in USD · Cancel anytime
</p>
```

## Acceptance Criteria

- [ ] Section eyebrow reads "PRICING"
- [ ] H2 has two-line gradient treatment
- [ ] Basic tier card has purple ring + gradient overlay + "Most Popular" badge
- [ ] All cards use `bg-[#111827]` dark surface with `rounded-2xl`
- [ ] Checkmarks are green (`#22C55E`)
- [ ] CTA buttons styled correctly (purple for highlighted, outlined for rest)
- [ ] Fine print line visible below cards
- [ ] No TypeScript errors
- [ ] No lint errors
