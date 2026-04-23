# Template: Frontend — Next.js (Step 2)

## Role

**Primary:** Frontend · **Secondary:** API client wiring

## Goal

Scaffold or align **Next.js 16 App Router** with **TypeScript**, **Tailwind**, **Apollo Client**, **Clerk**, **Redux Toolkit + Redux-Persist** per `docs/standards/CORE-TECH-STACK.md` and `.claude/standards/frontend.md` (when present).

## Default stack

- Next.js 16 · React 19 · Server Components by default · `use client` only where needed.

## Constraints

- No hardcoded brand hex — design tokens / `tailwind.config`.
- Provider order: Clerk → AuthSetup → Apollo → Redux → PersistGate.

## Acceptance

- [ ] `frontend/` (or app root) builds and type-checks
- [ ] Env vars documented; no secrets in client bundle
