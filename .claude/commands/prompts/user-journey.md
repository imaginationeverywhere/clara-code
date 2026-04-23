# Template: User Journey

## Role

**Primary:** Product + Frontend flows · **Backend** where state machine needed

## Goal

Document and implement **onboarding** and **authenticated** journeys: steps, guards, empty states, role-specific paths (SITE_OWNER vs PLATFORM_ADMIN). Output includes **journey map markdown** in `docs/` + routes.

## Artifacts

1. Journey diagram (Mermaid) — signup → verify → pay → first success
2. Route checklist with auth gates
3. Analytics events (names only; GA4 standard if `--analytics`)

## Multi-tenant

Separate journeys where SITE_OWNER admin sets up site vs end-customer uses site.

## Acceptance

- [ ] Clerk/session gates match server checks
- [ ] No dead-end screens without recovery CTA
