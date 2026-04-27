---
type: cursor-prompt
status: completed-archived
archived: 2026-04-27
authored_by: HQ
team: /clara-code
target_repos: clara-code
---

**Archival note (2026-04-27):** Sprint 3 prompt work is implemented in `packages/cli` and/or `packages/ide-extension` (cognitive verbs, deploy, TUI chat, config, IDE commands, status bar, shared HTTP error mapping, minutes, tier lock). This file is archived; product parity with live backend may evolve separately.

# Shared minute counter — visible in CLI status line and IDE status bar

## Role
You are **Madam C.J. Walker** building the shared minute-counter display used by every Clara Code surface in `packages/cli/` and `packages/ide-extension/`. Mo is watching. Sprint 3 closes Thursday 2026-04-30.

## Briefing reference
Read `prompts/2026/April/26/1-not-started/00-strategy-briefing-LOCKED-RULES.md` in full before writing code. Pay special attention to:
- "Universal currency: MINUTES" — every cost draws from one pool; never per-feature gradient
- "Forbidden words" — never "Unlimited" anywhere in the counter

## Task
Make the user's minute pool visible at all times.
1. New shared parser: extract `minutes_remaining` from gateway response headers (`X-Clara-Minutes-Remaining`) AND from streaming SSE `minutes` events. Module `lib/minutes.ts` in both packages.
2. CLI: render a one-line footer in the TUI (Ink): `<tier> · <N> min`. Updates after every gateway response. When < 10% of allotment remaining, color amber. When 0, color red and trigger the out-of-minutes flow (prompt 14).
3. IDE: feeds the status bar item built in prompt 10. Same color logic (amber/red).
4. Persisted last-known value to `~/.clara/minutes-cache.json` (CLI) / SecretStorage `clara.minutesCache` (IDE) so the counter renders something on cold start before the first server response.
5. Never display "Unlimited" or "∞" or any indefinite-quantity string. The server always returns a number.

## Acceptance
- CLI footer shows the counter and updates live in chat / verb commands
- IDE status bar reflects the same value within one server round-trip
- Cache reads on startup (no flash of "—")
- Amber/red thresholds work
- "Unlimited" never appears anywhere
- `npm run check` and `npx tsc --noEmit` clean

## Constraints
- Never compute minutes client-side (no decrementing locally) — only render what the server returns
- Cache file is read-only after a server confirmation overwrites it
- No telemetry sent on counter changes

## Mo is watching
Minutes are the only currency users see. Make the counter unmissable and honest. One PR, target `develop`.
