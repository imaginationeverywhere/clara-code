# Sprint 4 Plan — Clara Code

> **Sprint Dates**: 2026-04-14 onward
> **Sprint Goal**: Wire Clerk to CF env, ship develop→main release, dispatch IDE/CLI, start Stripe checkout

---

## Sprint 3 Retrospective (2026-04-14)

**25 PRs merged. Grade A- overall. 208 tests. 90.79% coverage.**

| Delivered | Status |
|-----------|--------|
| Desktop SecretStorage (gateway URL hidden) | ✅ PR #29 A- |
| Dashboard real API (localStorage eliminated) | ✅ PR #30 A |
| GA4 analytics install funnel | ✅ PR #31 A |
| Design system tokens (tailwind + docs) | ✅ PR #32 A- |
| `/account` page with delete account flow | ✅ (in PR #30) |

---

## Sprint 4 Backlog

### Priority 1 — Must Complete (Mo Actions)

| Task | Owner | Notes |
|------|-------|-------|
| Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` to CF Workers env | Mo | CF Dashboard → Workers & Pages → clara-code / clara-code-preview → Settings → Env Vars |
| Add `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in` + `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up` | Mo | Same CF env vars step |
| Export `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` from SSM, run `npm run pages:build` | Mo | Required before next CF deploy has Stripe |

### Priority 2 — Carruthers (Tech Lead)

| Task | Notes |
|------|-------|
| Create `develop → main` release PR | 220 commits; full Sprint 1-3 output to production |
| Dispatch S2-IDE prompt to Cursor on QCS1 | `packages/ide-extension/` — sidebar, voice panel, activation |
| Dispatch S2-CLI/TUI prompt to Cursor on QCS1 | `packages/tui/`, `packages/coding-agent/` — full-screen voice TUI |
| Re-enable Clerk middleware in `frontend/src/middleware.ts` after Clerk keys wired | Replace passthrough with `clerkMiddleware()` |

### Priority 3 — Miles (Backend)

| Task | Notes |
|------|-------|
| Build Stripe checkout flow (prompt 06 from archive) | Live keys in SSM; `STRIPE_WEBHOOK_SECRET` needed |
| Add Svix webhook verification to `backend/src/routes/webhooks.ts` | Required before Stripe events are trusted in production |
| Add `develop.claracode.ai` custom domain to Clerk allowed origins | Needed for OAuth redirects |

### Priority 4 — Motley (Frontend)

| Task | Notes |
|------|-------|
| Verify sculpt scale 400–100 against `mockups/app/src/index.css` | PR #32 only has 5 stops; spec said 900–100 |
| Wire checkout success page to Stripe session | Currently placeholder |
| Settings page functionality | Profile update, notification prefs |

---

## Open PRs (community, from upstream fork)

These upstream PRs are open against `develop` — review before merging to avoid conflicts with our sprint work:

| PR | Description | Action |
|----|-------------|--------|
| #3111 | `feat(tui): super keybinding (kitty)` | Review — may affect packages/tui |
| #3106 | `fix(tui): md trailing spaces` | Low risk — merge when convenient |
| #3105 | `fix(tui): offscreen spinner redraw` | Low risk |
| #3099 | `feat(coding-agent): inline extension factories` | Review architecture impact |
| #3072 | `fix(coding-agent): custom models + list-models` | Useful — review |

---

## Sprint 4 Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Clerk wiring reveals additional CF env gaps | Low | Medium | Test sign-in immediately after setting vars |
| Sculpt scale gap (400–100) may require design rework | Medium | Low | Verify against mockup source before adding stops |
| IDE/CLI dispatch creates merge conflicts with develop | Low | Medium | Rebase prompt branches against latest develop |
| Stripe checkout prompt needs to match dynamic pricing policy | Low | High | Prompt must use `stripe.prices.list()` + metadata — NO env var price IDs |
