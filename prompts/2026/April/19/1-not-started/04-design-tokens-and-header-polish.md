# Design Tokens + Header Polish — Match Magic Patterns

**Sources:**
- mockups/site/src/clara-brand-tokens.css
- mockups/site/src/components/Header.tsx

**Targets:**
- frontend/src/design-system/tokens.css (or wherever CSS variables are defined)
- frontend/src/components/marketing/Header.tsx

## Fix 1: Green Color Token

The mockup specifies `#22C55E` (Tailwind emerald-500) for the success/string syntax color. The frontend uses `#10B981` (teal-600). This affects checkmarks in pricing, success states, and code syntax highlighting throughout the site.

Find the green color CSS variable (likely `--brand-green`, `--syn-string`, or `--clara-green`) in the frontend's design token file and update it:

```css
/* Before */
--brand-green: #10B981;

/* After */
--brand-green: #22C55E;
```

Also update any hardcoded `#10B981` in marketing components to `#22C55E`.

Search for `10B981` across `frontend/src/` and replace all occurrences with `22C55E`.

## Fix 2: Clara Blue Precision

**Mockup:** `#7BC8D8`
**Frontend:** `#7BCDD8`

Update the `--clara-blue` CSS variable:
```css
/* Before */
--clara-blue: #7BCDD8;

/* After */
--clara-blue: #7BC8D8;
```

## Fix 3: Header — Always-Visible Border

The mockup header has a consistent bottom border. The frontend only shows it on scroll. Make it always visible:

In `frontend/src/components/marketing/Header.tsx`, find the conditional border class and make it unconditional:

```tsx
// Before (conditional on scroll)
className={`border-b ${scrolled ? 'border-white/10' : 'border-transparent'}`}

// After (always visible)
className="border-b border-white/10"
```

## Fix 4: Header Background Opacity

The mockup specifies `bg-[#0D1117]/85` with `backdrop-blur-md` — always applied, not conditional.

Find the header background class and ensure it's always:
```tsx
className="fixed top-0 left-0 right-0 z-50 bg-[#0D1117]/85 backdrop-blur-md border-b border-white/10"
```

## Fix 5: Remove Mute Button from Header (or make it icon-only)

The mockup Header does NOT include a voice mute toggle button. Either:
- Remove it from the marketing header (it belongs in the IDE UI, not the marketing site header)
- OR reduce it to a 20px icon with no label, right-aligned next to the nav

Preferred: Remove it from `Header.tsx` entirely.

## Acceptance Criteria

- [ ] `--brand-green` (or equivalent) is `#22C55E` in the token file
- [ ] `--clara-blue` is `#7BC8D8`
- [ ] Header border is always visible (not scroll-conditional)
- [ ] Header background always has 85% opacity + backdrop blur
- [ ] Mute button removed from marketing header
- [ ] No TypeScript errors
- [ ] No lint errors
- [ ] Run `npm run build` in frontend — zero errors
