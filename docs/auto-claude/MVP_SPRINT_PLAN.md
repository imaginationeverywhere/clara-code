# Sprint 3 Plan — Clara Code

> **Sprint Dates**: 2026-04-13 onward
> **Sprint Goal**: Unblock sign-in, dispatch IDE/CLI surfaces, start Stripe clock

---

## Sprint Backlog

### Priority 1 — Must Complete (Unblocks Everything)

| Task | Command | Notes |
|------|---------|-------|
| Wire Clerk keys to CF Workers env | DevOps (Mo) | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` in CF dashboard |
| Submit Stripe merchant account | Mo | Start 5-10 day approval window |
| Dispatch S2-IDE prompt to Cursor on QCS1 | Carruthers | `packages/ide-extension/` — sidebar webview, voice bar, surface scripts |
| Dispatch S2-CLI/TUI prompt to Cursor on QCS1 | Carruthers | `packages/tui/`, `packages/coding-agent/` — full-screen voice TUI |

### Priority 2 — Should Complete

| Task | Command | Notes |
|------|---------|-------|
| Wire dashboard to `/api/keys` backend | Motley | Replace localStorage mock with `GET /api/keys` |
| Add Svix webhook verification (HIGH-04) | Miles | `backend/src/routes/webhooks.ts` — required before Stripe live |
| Set DNS for `develop.claracode.ai` | DevOps | CF Workers custom domain; needed for Clerk OAuth redirects |
| Resume `/review-code` on voice API auth changes | Carruthers | Voice route + dashboard page coverage ≥80% |

### Priority 3 — Stretch

| Task | Command | Notes |
|------|---------|-------|
| Dispatch S2-Desktop (Tauri) prompt | Carruthers | `desktop/` Tauri app voice layer |
| Wire checkout page — Stripe Elements | Motley | Requires Stripe approval first |
| Add Stripe checkout API route (`/api/checkout`) | Miles | Blocked until merchant approved |

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

## Sprint Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Stripe approval delayed | High | High | Start immediately; use test mode |
| CF Workers build breaks during IDE/CLI dispatch | Medium | Medium | Test CF build before dispatching more prompts |
| Clerk wiring reveals more env issues | Low | Medium | Test sign-in immediately after wiring |
