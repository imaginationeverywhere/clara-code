# PRD — claracode.ai

**Product:** Clara Code Marketing Site + Web App
**Author:** Mary (Dr. Mary McLeod Bethune), Product Owner
**Date:** 2026-04-10
**Status:** Draft v1.0
**Repo:** imaginationeverywhere/clara-code
**Live URL:** https://claracode.ai

---

## Executive Summary

claracode.ai is the front door to Clara Code — a voice-first AI coding assistant that ships as a VS Code fork, a standalone CLI, and a web platform. The site must do three things simultaneously: demonstrate that Clara has a voice, convert developers to subscribers, and give existing users access to their dashboard, API keys, and settings.

This PRD covers the marketing site, authentication flows, user dashboard, and checkout. It does NOT cover the IDE or CLI (those are in the VS Code fork).

---

## Problem Statement

Developers discover Clara Code through word of mouth, Twitter, Hacker News, and GitHub. When they land on claracode.ai, they need to immediately understand: (1) what Clara Code is, (2) why it's different, and (3) how to get it.

The biggest missed opportunity on most developer tool sites: the product doesn't demonstrate itself. claracode.ai must demonstrate Clara's voice the moment a developer arrives. If the site is silent, the product's strongest differentiator is invisible.

---

## Users

### Primary: The Terminal-Native Developer
- Uses iTerm2, Warp, or Alacritty daily
- Has Cursor or VS Code open at all times
- Has tried GitHub Copilot and found it too slow or too passive
- Reads Hacker News. Follows developers on Twitter.
- Will try a product that has a great demo. Will not read a feature list.
- **Conversion path:** Voice demo on landing → installs CLI → upgrades to Pro

### Secondary: The IDE Developer
- Uses VS Code as primary editor
- Wants AI that actually understands their codebase
- Will try the VS Code fork if the install story is simple
- **Conversion path:** Download CTA → installs IDE → connects GitHub → upgrades

### Tertiary: The Team Lead
- Evaluating tools for their team
- Needs pricing clarity, SSO availability, and support story
- **Conversion path:** Pricing page → Pro or Team plan → talks to sales

---

## Pages & Flows

### 1. Marketing Site (unauthenticated)

#### Homepage (`/`)
**Purpose:** Hook. Demo. Convert.

Sections (in order):
1. **Header** — Clara Code mark + nav. GitHub star count. "Sign In" / "Get Clara" CTAs.
2. **Hero** — One sentence. Voice demo plays. Download / Install CTA.
3. **Voice Greeting** — Clara speaks to the developer when they arrive. This is the hook.
4. **Features** — Three columns: Voice (speak to code), Terminal (CLI-native), IDE (VS Code fork).
5. **CLI Demo** — Live terminal mockup showing `npx install claracode@latest` → `clara`.
6. **Pricing** — Three tiers: Free / Pro $X/mo / Team.
7. **Install CTA** — npm/pnpm/brew tabs + IDE download buttons.
8. **Footer** — Links, GitHub, open source notice.

#### Docs (`/docs`)
- Three-column layout: left nav + center MDX + right TOC
- Quick Start, CLI Reference, API Reference, SDK, Voice, Self-Hosting, Contributing

#### Blog (`/blog`) — Phase 2

---

### 2. Auth Flows (Clerk)

#### Sign In (`/sign-in`)
- GitHub OAuth — primary CTA
- Email/password — secondary
- No anonymous access
- After sign in → redirect to `/dashboard`

#### Sign Up (`/sign-up`)
- GitHub OAuth — primary
- Voice clone teaser: "Your first voice clone is free — we'll set it up after you sign in"
- After sign up → onboarding → `/dashboard`

---

### 3. Dashboard (authenticated at `/dashboard`)

**Purpose:** Developer home base. See usage, manage API keys, manage plan.

Sections:
- Welcome card with API key (masked) and quick copy
- Usage stats — requests this month, model used, voice minutes
- Quick actions — Create API key, View docs, Download IDE
- Plan card — current plan, upgrade CTA

---

### 4. Settings (`/settings`)

Sub-pages:
- `/settings` — Profile, display name, avatar
- `/settings/api-keys` — Create/revoke/list API keys with scope selection
- `/settings/billing` — Stripe Customer Portal (embedded, not redirect)
- `/settings/voice` — Voice clone: upload WAV, hear preview, set as default

---

### 5. Checkout (`/checkout`)

**Purpose:** Convert free users to Pro.

- Stripe Elements embedded (no redirect)
- Plan summary sidebar
- After success → `claracode://` deep link opens desktop IDE
- Show confetti + "You're on Pro" screen

---

## Voice Integration — THE MOST IMPORTANT FEATURE OF THIS PAGE

**When a visitor arrives at claracode.ai, Clara greets them.**

This is not optional. This is the product demonstrating itself. See VRD-001 for the full voice requirements.

Implementation:
- Voice plays after 1.5s delay on first visit (not on return visits)
- Uses Clara's voice (Modal voice server → XTTS v2)
- Has a mute button in the header for accessibility
- Does not autoplay audio — uses a soft "Clara is here" animation + click-to-hear
  (Browser autoplay policies mean we show a pulsing mic button instead)
- Visitor clicks the mic → Clara greets them in full voice

---

## Technical Architecture

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS |
| Auth | Clerk (GitHub OAuth primary) |
| Database | Neon PostgreSQL (via backend API) |
| Payments | Stripe (when live) |
| Deployment | Cloudflare Pages |
| CDN | Cloudflare |
| Voice | Modal voice server (clara-code-backend proxies) |
| Analytics | GA4 (Phase 2) |

---

## Success Metrics

| Metric | Target (Month 1) |
|--------|-----------------|
| Voice demo plays | >40% of landing page visitors |
| CLI install from site | >500 installs |
| Sign up conversion | >8% of visitors |
| Pro upgrade | >15% of signed-up users |
| Time on site | >3 min average |

---

## Out of Scope (Phase 1)

- Blog
- Team/Enterprise plan management
- SSO (SAML)
- Affiliate / referral program
- App marketplace
- Self-hosting setup wizard

---

## Dependencies

- Clerk account created and DNS verified ✅
- Neon DB provisioned ✅
- ngrok tunnel running ✅
- Cloudflare Pages connected to GitHub ✅
- Stripe account — PENDING (after site is live)
- Voice clone for Clara's greeting — see VRD-001

---

## Open Questions

1. What is Clara's pricing? (Mary to finalize in pricing/ directory)
2. Does the Free tier have API access or just IDE download?
3. Is voice on the site opt-in (click to hear) or ambient (plays on load)?
4. How do we handle the voice greeting for repeat visitors?
