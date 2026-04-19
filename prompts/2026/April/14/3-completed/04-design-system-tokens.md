# Design System: Extract Tokens from Mockups → docs/design-system.md + tailwind.config.ts

**Flag:** `/pickup-prompt --design web`
**Project:** clara-code
**Files:** `mockups/app/src/index.css`, `mockups/app/tailwind.config.js`, `frontend/tailwind.config.ts`, `docs/design-system.md`

## Context

Clara Code has two Magic Patterns mockups at `mockups/app/` (IDE app surface) and `mockups/site/` (marketing site). Both have CSS variable design tokens defined in their `index.css` files but these tokens are **not fully extracted** into the frontend's `tailwind.config.ts`.

The current `frontend/tailwind.config.ts` has partial tokens (bg.base, bg.raised, brand.purple, etc.) but is missing the full Clara design language: the `sculpt-*` color scale, `clara-blue` variants, syntax highlighting palette, border semantic tokens, and text hierarchy tokens.

`docs/design-system.md` does not exist.

## What Needs to Change

### 1. Read and reconcile all tokens from both mockups

From `mockups/app/src/index.css` `:root` block, extract ALL CSS variables:

**Color palette (source of truth from mockups/app):**
```
--clara-blue: #7BCDD8        → clara.teal / clara.DEFAULT
--clara-blue-glow: #A8DDE5   → clara.teal-glow
--clara-blue-grow: #A8DDE5   → (same as glow)
--clara-blue-accent: #4DDDFF → clara.teal-accent
--purple: #7C3AED            → brand.purple (already in frontend)
--purple-hoover: #6D28D9     → brand.purple-hover
--blue: #4F8EF7              → brand.blue (already in frontend)
--green: #10B981             → brand.green (already in frontend)

Background scale:
--bg-base: #0D1117           → bg.base (already in frontend)
--bg-raised: #0F1318         → bg.raised (already in frontend)
--bg-overlay: #0A0E14        → bg.overlay (already in frontend)
--bg-sunken: #070A0F         → bg.sunken (already in frontend)
--bg-terminal: #09090F       → bg.terminal (NEW — missing from frontend)

Sculpt scale (warm dark tones):
--sculpt-900 through --sculpt-100  → sculpt.900 through sculpt.100 (ALL missing)

Text hierarchy:
--text-promary (sic)    → text.primary
--text-body             → text.body
--text-secondary        → text.secondary
--text-muted            → text.muted
--text-caption          → text.caption
--text-label            → text.label
--text-ghost            → text.ghost

Border tokens:
--border-default  → border.default
--border-hover    → border.hover
--border-focus    → border.focus
--border-strong   → border.strong

Syntax highlighting:
--syn-keyword   → syntax.keyword (already in frontend as '#7C3AED')
--syn-type      → syntax.type (already in frontend as '#4F8EF7')
--syn-string    → syntax.string (already in frontend as '#10B981')
--syn-funcion   → syntax.function (note: mockup has typo 'funcion')
--syn-jsx       → syntax.jsx
--syn-attribute → syntax.attribute
--syn-number    → syntax.number
--syn-comment   → syntax.comment
--syn-operator  → syntax.operator
```

Read the ACTUAL hex values from `mockups/app/src/index.css` for sculpt-* and text-* tokens — do not guess them.

### 2. Update `frontend/tailwind.config.ts`

Merge all extracted tokens into the existing config. Do NOT replace the existing tokens — extend them:

```typescript
// frontend/tailwind.config.ts
const config: Config = {
  // ...existing content/darkMode...
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        clara: {
          DEFAULT: '#7BCDD8',
          teal: '#7BCDD8',
          'teal-glow': '#A8DDE5',
          'teal-accent': '#4DDDFF',
          500: '#3B82F6',  // keep existing
        },
        brand: {
          purple: '#7C3AED',
          'purple-hover': '#6D28D9',
          blue: '#4F8EF7',
          green: '#10B981',
        },
        bg: {
          base: '#0D1117',
          raised: '#0F1318',
          overlay: '#0A0E14',
          sunken: '#070A0F',
          terminal: '#09090F',  // NEW
        },
        sculpt: {
          // fill in actual hex values from mockups/app/src/index.css
          900: '...',
          800: '...',
          // ...
        },
        text: {
          primary: '...',     // from --text-promary
          body: '...',
          secondary: '...',
          muted: '...',
          caption: '...',
          label: '...',
          ghost: '...',
        },
        border: {
          default: '...',
          hover: '...',
          focus: '...',
          strong: '...',
        },
        syntax: {
          keyword: '#7C3AED',
          type: '#4F8EF7',
          string: '#10B981',
          function: '...',    // from --syn-funcion
          jsx: '#F87171',
          attribute: '#FBBF24',
          number: '#FB923C',
          comment: '...',
          operator: '...',
        },
      },
      animation: {
        waveform: 'waveform 1.2s infinite ease-in-out',
      },
      keyframes: {
        waveform: {
          '0%, 100%': { height: '4px' },
          '20%': { height: '20px' },
          '40%': { height: '8px' },
          '60%': { height: '24px' },
          '80%': { height: '12px' },
        },
      },
    },
  },
}
```

### 3. Create `docs/design-system.md`

Create this file documenting the full Clara Code design system:

```markdown
# Clara Code Design System

**Version:** 1.0.0
**Source of truth:** `mockups/app/src/index.css` (app surface), `mockups/site/src/index.css` (marketing)
**Framework:** Tailwind CSS — tokens in `frontend/tailwind.config.ts`

## Color Palette

### Brand Colors
| Token | Tailwind Class | Hex | Usage |
|-------|----------------|-----|-------|
| Clara Teal | `text-clara-teal` / `bg-clara-teal` | #7BCDD8 | Primary brand, links, focus rings |
| Clara Teal Accent | `text-clara-teal-accent` | #4DDDFF | Hover states, active voice indicator |
| Brand Purple | `text-brand-purple` | #7C3AED | CTA buttons, highlights |
| Brand Blue | `text-brand-blue` | #4F8EF7 | Info states, links |
| Brand Green | `text-brand-green` | #10B981 | Success, online indicator |

### Background Scale
| Token | Tailwind Class | Hex | Usage |
|-------|----------------|-----|-------|
| Base | `bg-bg-base` | #0D1117 | Page background |
| Raised | `bg-bg-raised` | #0F1318 | Cards, panels |
| Overlay | `bg-bg-overlay` | #0A0E14 | Modals, dropdowns |
| Sunken | `bg-bg-sunken` | #070A0F | Input fields, recessed areas |
| Terminal | `bg-bg-terminal` | #09090F | Terminal/code blocks |

### Sculpt Scale (warm dark accents)
| Token | Tailwind Class | Hex | Usage |
|-------|----------------|-----|-------|
[Fill from actual CSS values]

### Text Hierarchy
[Fill from actual CSS values]

### Border Tokens
[Fill from actual CSS values]

### Syntax Highlighting
[Fill from actual CSS values]

## Typography

| Role | Font | Weight | Tailwind |
|------|------|--------|---------|
| Headings | Inter | 600-800 | `font-sans font-semibold` |
| Body | Inter | 400 | `font-sans` |
| Code / Terminal | JetBrains Mono | 400-600 | `font-mono` |

## Spacing & Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-lg` | 0.75rem | Cards, buttons |
| `rounded-xl` | 1rem | Panels, modals |
| `rounded-2xl` | 1.5rem | Large containers |

## Animation

| Name | Class | Duration | Usage |
|------|-------|----------|-------|
| Waveform | `animate-waveform` | 1.2s | Voice activity indicator |
| Fade In | `animate-fadeIn` | 0.2s | Panel transitions |

## Component Patterns

### Standard Card
```tsx
<div className="rounded-xl border border-border-default bg-bg-raised p-6">
```

### Code Block
```tsx
<pre className="rounded-lg bg-bg-terminal font-mono text-sm">
```

### Primary Button
```tsx
<button className="bg-brand-purple hover:bg-brand-purple-hover text-white rounded-lg px-4 py-2">
```

## Surfaces

Clara Code has two surfaces with shared tokens:
- **App** (`mockups/app/`) — IDE panel, voice bar, settings panel, terminal
- **Site** (`mockups/site/`) — Marketing pages, pricing, docs

Both surfaces share the same color tokens but may use different component densities.

## Deviations from Boilerplate

The standard Quik Nation boilerplate uses `bg-brand-bg` (#09090F). Clara Code uses `bg-bg-terminal` for terminal/code surfaces and `bg-bg-base` (#0D1117) for page backgrounds — slightly different dark scale to match VS Code's chrome.
```

### 4. Audit existing frontend pages for hardcoded hex

Run a search for any `bg-[#` or `text-[#` inline hex values in `frontend/src/`:
```bash
grep -rn 'bg-\[#\|text-\[#\|border-\[#' frontend/src/
```

For each hit, replace the hardcoded hex with the matching design token from the new config. For example:
- `bg-[#09090F]` → `bg-bg-terminal`
- `bg-[#0D1117]` → `bg-bg-base`
- `text-[#7BCDD8]` → `text-clara-teal`

## Acceptance Criteria

- [ ] `docs/design-system.md` created with all token tables populated (actual hex values, not placeholders)
- [ ] `frontend/tailwind.config.ts` has all tokens from mockups/app/src/index.css
- [ ] `sculpt-*` scale (all stops) in tailwind config
- [ ] `text.*` semantic tokens in tailwind config
- [ ] `border.*` semantic tokens in tailwind config
- [ ] `syntax.*` full palette in tailwind config (including function, comment, operator)
- [ ] `bg-bg-terminal` token added
- [ ] Zero hardcoded hex `bg-[#...]` in `frontend/src/` (audit and replace all)
- [ ] `npm run type-check` passes
- [ ] `npm run build` passes

## Do NOT

- Do not modify `mockups/` — they are read-only Magic Patterns exports
- Do not change component markup — only replace hardcoded hex with token classes
- Do not add new pages or components
- Do not touch `packages/` — design tokens are frontend-only
