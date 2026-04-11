# Cursor Agent Prompt — Pricing Section

**File target:** `packages/web-ui/src/app/(marketing)/components/PricingSection.tsx`
**Type:** Server Component (static data, no interactivity beyond CTA links)

---

## Context

This is the pricing section rendered on the homepage at `#pricing`. Three tiers. One clear winner (Pro). Pricing is intentionally opinionated — developers hate pricing pages that hide the numbers. Every number is shown, no asterisks, no "contact us" for the first two tiers.

Clara Code pricing (as defined in `pricing/` directory — use these exact numbers):
- **Free:** $0/mo — CLI only, 50 req/day, community support
- **Pro:** $29/mo — Everything, 2,000 req/day, voice clone, priority support
- **Team:** $79/seat/mo — Pro × team, SSO, audit logs, admin dashboard

If the pricing directory has different numbers, use those. These are fallbacks.

---

## What to Build

### Component: `PricingSection.tsx`

**Layout:** Three-column grid (md:grid-cols-3) with a center "Pro" card that is larger/highlighted.

```
[  Free  ]   [       Pro ⭐       ]   [  Team  ]
  $0/mo        $29/mo                  $79/seat
  CLI only     Everything              Pro × team
  50 req/day   2,000 req/day           SSO + admin
  Community    Priority support        Dedicated CSM

  [Get Free]   [Start Free Trial →]    [Talk to us]
```

---

**Free card:**
- Border: 1px solid #30363D
- Background: #161B22
- Rounded-xl, p-8
- Price display: `$0` (Inter Bold 3rem) + `/month` (muted, regular)
- Features list (check icons, muted text):
  - ✓ Clara CLI
  - ✓ 50 requests / day
  - ✓ Basic voice (no clone)
  - ✓ Community support
  - ✗ Voice clone (strike through, muted) — "Pro only"
  - ✗ IDE fork — "Pro only"
- CTA: "Get Free →" ghost button, full-width, links to `/sign-up`

---

**Pro card (center, featured):**
- Border: 2px solid #7C3AED (purple glow: `box-shadow: 0 0 24px rgba(124,58,237,0.25)`)
- Background: #1A1529 (slightly purple-tinted dark)
- Scale: slightly larger (`scale-105` or `transform: scale(1.03)`) on md+
- "Most Popular" badge: pill at top, purple bg, white text, centered
- Rounded-xl, p-8
- Price display: `$29` (Inter Bold 3rem, white) + `/month` (muted)
- Features list (all checkmarks, Clara Blue #7BCDD8):
  - ✓ Everything in Free
  - ✓ Clara CLI + IDE fork (VS Code)
  - ✓ 2,000 requests / day
  - ✓ Voice clone (1 free, unlimited with upgrade)
  - ✓ Multi-turn voice context
  - ✓ Priority support
  - ✓ API access
- CTA: "Start Free Trial →" filled purple button, full-width, links to `/checkout/pro`
- Below CTA: "14-day free trial · No credit card required" (muted, xs, centered)

---

**Team card:**
- Same styling as Free card
- Price display: `$79` (Inter Bold 3rem) + `/seat / month` (muted)
- Features list:
  - ✓ Everything in Pro
  - ✓ Team dashboard
  - ✓ SSO (SAML/OIDC)
  - ✓ Audit logs
  - ✓ Admin controls
  - ✓ Dedicated CSM
  - ✓ SLA guarantee
- CTA: "Talk to us →" ghost button, full-width, `href="mailto:team@claracode.ai"`

---

**FAQ accordion** (below the three cards, collapsible):
- "Is the free trial really free?" — Yes. 14 days, cancel any time. No charge until trial ends.
- "What counts as a request?" — One request = one prompt sent to Clara (voice or text).
- "Can I self-host Clara?" — Yes. Clara Code is open source. See our self-hosting docs.
- "Do voice clones stay private?" — Yes. Your voice model is stored encrypted, only accessible by your account.

Use a simple CSS/JS accordion (no external library). Chevron icon rotates on open.

---

**Section wrapper:**
```tsx
<section id="pricing" className="py-24 px-6 bg-[#0D1117]">
  <div className="max-w-5xl mx-auto">
    <h2>Simple pricing. No surprises.</h2>
    <p className="muted">...</p>
    {/* three cards */}
    {/* FAQ */}
  </div>
</section>
```

---

## Acceptance Criteria

- [ ] Three pricing cards render with correct numbers and feature lists
- [ ] Pro card is visually elevated (border glow, scale, badge)
- [ ] "Start Free Trial →" links to `/checkout/pro`
- [ ] "Talk to us →" opens `mailto:team@claracode.ai`
- [ ] FAQ accordion works (expand/collapse)
- [ ] Section has `id="pricing"` for hash scroll from nav
- [ ] Responsive: stacks to single column on mobile, Pro card centered
- [ ] No TypeScript errors
