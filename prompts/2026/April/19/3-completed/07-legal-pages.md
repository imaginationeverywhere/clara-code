# Prompt 07 — Privacy Policy + Terms of Service Pages

**Status:** Implemented: `frontend/src/app/privacy/page.tsx`, `frontend/src/app/terms/page.tsx` (server components), `Footer` links, `layout.tsx` `alternates.canonical`, middleware tests for public `/privacy` and `/terms`.

**Date**: 2026-04-15
**Branch**: `prompt/2026-04-15/07-legal-pages`
**Flags**: `--frontend --design web`
**Estimated scope**: 3–4 files

---

## Context

Clara Code is approaching launch. Two legal pages are required before any paid product can go live:
1. **Privacy Policy** — GDPR/CCPA-aware. Clara collects voice audio (processed ephemerally), usage telemetry, and API key activity.
2. **Terms of Service** — SaaS subscription terms. Clara Code subscription model: Free tier, Pro ($49/mo), Business ($99/mo). Developer Program ($99/yr). API usage tied to subscription tier.

These are **static server components** — no JavaScript, no Clerk auth required, no interactivity.

---

## Design Constraints

- Read `docs/design-system.md` before writing any component
- Background: `bg-bg-base` (`#09090F`), text: `text-text-body` (`#D9D9D9`)
- Headings: `text-text-primary` white
- Links: `text-clara` (Clara purple) with `hover:underline`
- Same `Header` and `Footer` marketing components as all other pages
- Content section: `max-w-3xl mx-auto px-6 py-24`

---

## Task 1 — Privacy Policy: `frontend/src/app/privacy/page.tsx`

Create a server component (no `'use client'`). Content must address:

**Last updated date**: include in the page
**What Clara collects**:
- Account info via Clerk (name, email, OAuth provider)
- Voice audio — processed ephemerally by Clara's voice infrastructure; NOT stored long-term; NOT used for training
- API usage logs (request count, tier, timestamp) — retained for billing and rate limiting
- Anonymous telemetry (feature usage, error rates) — no PII

**How it's used**:
- Provide the service (voice coding assistant)
- Billing via Stripe (payment info handled entirely by Stripe — Clara never stores card numbers)
- Security and fraud prevention

**Data sharing**:
- Clerk: authentication
- Stripe: payments
- Voice infrastructure: audio processing (ephemeral)
- No advertising. No data sold. No third-party analytics beyond anonymous telemetry.

**User rights**:
- Access, delete, export your data → via `/account` page → Delete Account
- For other requests: legal@claracode.ai

**Cookies**: only Clerk session cookie (essential) + optional analytics

**Contact**: legal@claracode.ai

---

## Task 2 — Terms of Service: `frontend/src/app/terms/page.tsx`

Create a server component. Content must address:

**Last updated date**: include in the page

**Service description**: Clara Code is a voice-first AI coding assistant. Available as IDE extension, CLI, and web app.

**Subscriptions**:
- Free tier: limited API calls/month
- Pro ($49/month): expanded voice and API limits
- Business ($99/month): team features, priority support
- Developer Program ($99/year): list talents in the Clara marketplace

**Acceptable use**:
- Must not use Clara to generate malicious code, malware, or attacks on infrastructure
- Must not circumvent rate limits or API authentication
- Must not reverse-engineer or redistribute the Clara API

**IP ownership**: Clara Code (Imagination Everywhere Inc.) owns the platform. User owns their code output.

**Developer Program terms**: Talent submissions reviewed by Clara team. Clara reserves right to reject or remove talents for policy violations. Revenue share: developer sets price, platform fee applies.

**Termination**: Clara may suspend/terminate accounts violating these terms.

**Disclaimer**: AI-generated code may contain errors. Review all output before use in production.

**Governing law**: State of Delaware, USA.

**Contact**: legal@claracode.ai

---

## Task 3 — Add to Footer

In `frontend/src/components/marketing/Footer.tsx`, add Privacy and Terms links if not already present:

```tsx
<Link href="/privacy" className="text-sm text-text-muted hover:text-text-secondary">Privacy</Link>
<Link href="/terms" className="text-sm text-text-muted hover:text-text-secondary">Terms</Link>
```

---

## Task 4 — Add to site metadata

In `frontend/src/app/layout.tsx`, add to the `metadata` object if not present:
```typescript
alternates: {
  canonical: 'https://claracode.ai',
},
```

---

## Acceptance Criteria

- [ ] `/privacy` renders without Clerk (accessible when signed out)
- [ ] `/terms` renders without Clerk (accessible when signed out)
- [ ] Both pages use `Header` + `Footer` marketing components
- [ ] Both pages use design system tokens — no hardcoded hex
- [ ] Footer links to both pages
- [ ] `cd frontend && npm run type-check` passes
- [ ] `cd frontend && npm run lint` passes
- [ ] Both pages are server components (no `'use client'`)

## What NOT to Change

- No changes to auth, dashboard, backend, or API routes
- Do not add Clerk protection to these pages — they must be publicly accessible
