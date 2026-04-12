## CURSOR AGENT — MCP NOTE
**Figma MCP**: Skip if unavailable. Do NOT wait for it or ask about it. This prompt does NOT require Figma MCP. Proceed immediately with the implementation below.
**Secrets**: All keys are in AWS SSM. Pull with: `aws ssm get-parameter --name '/quik-nation/shared/<KEY_NAME>' --with-decryption --query 'Parameter.Value' --output text`

---

# Cursor Agent Prompt — claracode.ai Homepage

**File target:** `packages/web-ui/src/app/(marketing)/page.tsx`
**Also creates:**
- `packages/web-ui/src/app/(marketing)/components/VoiceGreeting.tsx` (see 02-voice-greeting.md for full spec)
- `packages/web-ui/src/app/(marketing)/components/CliDemo.tsx` (already exists — reuse)
- `packages/web-ui/src/app/(marketing)/components/PricingSection.tsx` (see 03-pricing.md for full spec)
- `packages/web-ui/src/app/(marketing)/layout.tsx` (marketing shell with nav + footer)

---

## Context

You are working in `imaginationeverywhere/clara-code`, a fork of `badlogic/pi-mono`. The web UI lives at `packages/web-ui/` and is a Next.js 15 App Router project.

**Brand palette** (defined in `packages/web-ui/src/app/app.css` or `globals.css`):
```
Clara Blue:   #7BCDD8
Purple:       #7C3AED
Purple Hover: #6D28D9
Dark BG:      #0D1117
Surface:      #161B22
Border:       #30363D
Text:         #E6EDF3
Muted:        #8B949E
```
**Font:** JetBrains Mono (Display/labels) + Inter (headings/body). Both via Google Fonts.

---

## What to Build

### 1. Marketing Layout: `packages/web-ui/src/app/(marketing)/layout.tsx`

A sticky header + footer shell that wraps all marketing pages.

**Header (sticky, backdrop-blur):**
- Left: Clara Code mark — SVG two-silhouette icon (#7BCDD8, 28px) + "Clara Code" wordmark (Inter 600, white)
- Center nav: "Features" | "Pricing" | "Docs" | "CLI" (anchor links to sections or routes)
- Right:
  - GitHub star badge — `https://img.shields.io/github/stars/imaginationeverywhere/clara-code?style=social` (img tag)
  - Mute button (speaker icon, controls VoiceGreeting state — pass via context or prop)
  - "Sign In" ghost button → `/sign-in`
  - "Get Clara →" filled button (#7C3AED) → `#pricing`
- Border-bottom: 1px solid #30363D

**Footer:**
- Single line: "© 2026 Clara Code · Open source · GitHub · Docs"
- Muted text, centered, py-8

---

### 2. Homepage: `packages/web-ui/src/app/(marketing)/page.tsx`

Build all 8 sections from the PRD spec:

---

**Section 1: Hero**
- Full-viewport-height section, dark bg #0D1117
- Centered column layout
- Headline (JetBrains Mono, 3.5rem md:5rem, white):
  `"Voice. Terminal. IDE. One AI."`
- Subhead (Inter, 1.125rem, muted #8B949E, max-w-lg):
  `"Clara Code is a voice-first AI coding assistant. Speak to it. Ask it questions. Have it write code. Works in the terminal, in VS Code, and in your browser."`
- CTA row:
  1. "Install Clara →" (filled purple, `href="#install"`)
  2. "Get Pro" (ghost, `href="#pricing"`)
- Below CTAs: `<VoiceGreeting />` component — the pulsing mic button (see `02-voice-greeting.md`)
- Subtle gradient orb: purple at ~20% opacity, absolute behind the headline, blur-3xl, pointer-events-none

---

**Section 2: Voice Greeting** (id="voice")
- Already rendered inside hero above via `<VoiceGreeting />`
- No separate section needed

---

**Section 3: Features** (id="features")
- Section heading: "Built for developers who move fast"
- Three-column grid (md:grid-cols-3, gap-6):
  - **Voice** — icon: microphone emoji or SVG, title: "Speak to code", desc: "Ask Clara anything out loud. She understands code context and writes back — in your voice, for your codebase."
  - **Terminal** — icon: terminal, title: "CLI-native", desc: "Run `clara` in any terminal. Full TUI with voice. No Electron. No GUI. Zero overhead."
  - **IDE** — icon: code brackets, title: "VS Code fork", desc: "Clara Code is a VS Code fork with voice built in. Install once, speak forever."
- Cards: bg #161B22, border #30363D, rounded-xl, p-6

---

**Section 4: CLI Demo** (id="cli")
- Section heading: "Install in 10 seconds"
- Tab bar: `npm` | `pnpm` | `brew` (client component for tab switching — `"use client"`)
- Content per tab:
  ```
  npm:   npx install claracode@latest
  pnpm:  pnpm dlx claracode@latest
  brew:  brew install claracode
  ```
  Dark terminal window (bg #0D0D0D, border #30363D, rounded-lg)
- Below: "Then run `clara` — the TUI launches with voice enabled."
- Import and render `<CliDemo />` here (already exists in codebase)

---

**Section 5: How Voice Works** (id="how-it-works")
- Three numbered steps (horizontal on md, stacked on mobile):
  1. "Say what you want" — `"Fix the auth bug in routes/users.ts"`
  2. "Clara understands context" — reads your open files and git state
  3. "Code appears" — in your editor, in the terminal, or in the browser
- Gold connecting line between steps on md
- Step numbers: JetBrains Mono, 3rem, purple

---

**Section 6: Pricing** (id="pricing")
- Import and render `<PricingSection />` (see `03-pricing.md` for that component's spec)

---

**Section 7: Install CTA** (id="install")
- Full-width dark section
- Heading: "Get started in 30 seconds"
- Tab bar (same as Section 4): npm / pnpm / brew
- Large copy button with the install command
- Below: "Or download the IDE fork →" (links to GitHub releases)
- Mobile app badges if available (placeholder links for now)

---

**Section 8: Footer** (rendered by layout)

---

## Technical Requirements

- `page.tsx` is a Server Component by default
- `VoiceGreeting`, `PricingSection`, tab switchers are `"use client"` components (imported dynamically if needed for SSR)
- Use Next.js `dynamic` import with `ssr: false` for `VoiceGreeting` (audio APIs are browser-only)
- No `any` in TypeScript
- `npm run build` must pass clean

---

## Acceptance Criteria

- [ ] All 8 sections render at `/` with correct content and styling
- [ ] Header is sticky with nav + CTAs
- [ ] Voice greeting mic button renders in the hero
- [ ] CLI demo shows npm/pnpm/brew tabs and install command
- [ ] Pricing section is imported and renders
- [ ] "Get Clara →" in header scrolls to `#pricing`
- [ ] All sections are mobile-responsive
- [ ] `npm run build` passes with 0 errors