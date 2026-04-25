# Website Redesign — claracode.ai Matches claraagents.com

**TARGET REPO:** imaginationeverywhere/clara-code
**Priority:** P0 — Beta polish. The claracode.ai marketing site must share the same look, feel, and logo as claraagents.com. This is brand coherence — both surfaces feel like one Clara.
**Packages:** `frontend/`
**Milestone:** Ship the frontend overhaul from `mockups/site/` (Magic Patterns export) to the live `frontend/` Next.js 16 app. Keep the shared logo, header, design tokens, and component library with claraagents.com. Customer-facing copy reflects the new marketing language ("10× more usage, unlimited voice", harness team framing, $39/$69/$99/$299/$4k+ tiers, no Enterprise "unlimited").

Source of truth:
- Design: `mockups/site/` — Magic Patterns export
- Copy: `pricing/customer-facing-page.md` — latest canonical marketing language
- Brand: claraagents.com — the reference surface; keep logo + header consistent

---

## Visual Target

Run `cd mockups/site && npm install && npm run dev` → browse `http://localhost:5173` to see the target design. Compare against the current live `frontend/` at `npm run dev` → `http://localhost:3000`.

Delta the redesign addresses:
- Shared ClaraLogo component (matches claraagents.com)
- Updated Header with consistent nav + auth CTAs
- New HeroSection with the "10× usage, unlimited voice" positioning
- Refreshed FeaturesSection aligned to new capabilities (harness team, voice, marketplace)
- Updated PricingSection reflecting $39/$69/$99/$299/$4k+ with the correct language
- Consistent design tokens (colors, spacing, typography) across both sites

---

## Part 1 — Port Components from mockups/site/

Target files under `frontend/src/app/(marketing)/` and `frontend/src/components/marketing/`:

Copy from mockups/site/src/components/:
- `ClaraLogo.tsx` — shared brand asset
- `Header.tsx` — consistent nav
- `HeroSection.tsx`
- `FeaturesSection.tsx`
- `InstallSection.tsx`
- `PricingSection.tsx`
- `ApiKeysContent.tsx` (if needed for the signed-in experience)

For each:
1. Port the mockup component to `frontend/src/components/marketing/<Name>.tsx`
2. Adapt Tailwind classes to the project's Tailwind config (may need token alignment)
3. Preserve design fidelity — color, spacing, interaction states
4. Hook up real data (pricing tiers from `pricing/customer-facing-page.md`, nav links to real routes)

---

## Part 2 — Copy Updates

All marketing copy must reflect the latest canonical language from `pricing/customer-facing-page.md`. Key phrases:

**Hero:** *Your AI team. Unlimited voice. 10× the usage.*

**Tiers:**
- Basic $39 — 3 AI hires, 1 new voice agent/mo
- Pro $69 — 6 AI hires, 3 new voice agents/mo
- Max $99 — 9 AI hires, 6 new voice agents/mo
- Business $299 — 24 AI hires, 12 new voice agents/mo, marketplace publishing
- Enterprise $4,000+ — 350 AI hires, Custom (per contract)

**Philosophy section:** unlimited voice + unlimited default-stack usage on open-source AI. Reasoning pass-through, no markup. NEVER say "unlimited" for Enterprise — always "Custom" or "Per contract."

**FAQ:** copy directly from `pricing/customer-facing-page.md` FAQ section.

---

## Part 3 — Design System Token Alignment

Shared tokens between claracode.ai and claraagents.com live in `frontend/src/styles/design-tokens.css`:

```css
:root {
  /* Clara brand */
  --clara-primary: #[from mockup];
  --clara-accent: #[from mockup];
  --clara-ink: #[from mockup];
  --clara-paper: #[from mockup];

  /* Typography */
  --font-display: "[font from mockup]";
  --font-body: "[font from mockup]";

  /* Spacing scale */
  --space-unit: 4px;
}
```

Tailwind config (`tailwind.config.ts`) references these tokens.

The EXACT values come from `mockups/site/tailwind.config.js` + `mockups/site/src/index.css`. Copy them verbatim.

---

## Part 4 — Shared Header / Footer Components

`frontend/src/components/marketing/Header.tsx` must match claraagents.com's header byte-for-byte in the visible UI. If claraagents.com has a shared NPM package or CDN for the header, use it. Otherwise, create a shared `packages/clara-brand/` monorepo package that both apps import.

For Beta: acceptable to copy the component into each repo. Post-Beta: extract to `@clara/brand-ui` shared package.

---

## Part 5 — Routes + Pages

Update existing routes:
- `/` — Hero + Features + Pricing + Install (single marketing page)
- `/pricing` — detailed pricing (or anchor within `/`)
- `/sign-in` — use port of `mockups/site/src/pages/SignIn.tsx`
- `/sign-up` — use port of `mockups/site/src/pages/SignUp.tsx`
- `/checkout` — use port of `mockups/site/src/pages/Checkout.tsx`
- `/settings` — use port of `mockups/site/src/pages/Settings.tsx` (signed-in users only)

---

## Part 6 — Tests

```typescript
describe("Marketing site", () => {
  it("hero matches the mockup visually (snapshot test)");
  it("pricing section renders 5 tiers with correct prices");
  it("Enterprise tier shows 'Custom' not 'Unlimited' for caps");
  it("tiers match canonical numbers: Basic 3/1, Pro 6/3, Max 9/6, Business 24/12, Enterprise 350/Custom");
  it("logo matches claraagents.com (shared component)");
  it("header nav links route correctly");
});

describe("Auth pages", () => {
  it("sign-in form submits to Clerk");
  it("sign-up triggers tier selection → Stripe checkout");
  it("settings page loads user's tier + agents");
});
```

Playwright visual-regression tests comparing claracode.ai against a reference screenshot from claraagents.com for the header + footer.

---

## Acceptance Criteria

- [ ] `mockups/site/src/components/*` ported to `frontend/src/components/marketing/`
- [ ] Design tokens aligned between the two sites
- [ ] All marketing copy updated to canonical (per `pricing/customer-facing-page.md`)
- [ ] Enterprise copy NEVER says "unlimited" — always "Custom" or "Per contract"
- [ ] Tier numbers match: Basic 3 hires/1 build, Pro 6/3, Max 9/6, Business 24/12, Enterprise 350/Custom
- [ ] Header logo + nav visually match claraagents.com
- [ ] Dev server runs cleanly on port 3000 with no visual regressions
- [ ] `npm run type-check` passes
- [ ] `npm run build` passes
- [ ] Playwright snapshot tests pass
- [ ] CI thin-client gate passes

## Branch + PR

```bash
git checkout -b prompt/2026-04-23/21-website-redesign-match-claraagents
git commit -m "feat(frontend): redesign claracode.ai to match claraagents.com look + feel"
gh pr create --base develop --title "feat(frontend): website redesign — claracode.ai matches claraagents.com"
```
