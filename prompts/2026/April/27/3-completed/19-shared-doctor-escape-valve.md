---
type: cursor-prompt
status: completed-archived
archived: 2026-04-27
authored_by: HQ
team: /clara-code
target_repos: clara-code
---

**Archival note (2026-04-27):** Sprint 3 prompt work is implemented in `packages/cli` and/or `packages/ide-extension` (cognitive verbs, deploy, TUI chat, config, IDE commands, status bar, shared HTTP error mapping, minutes, tier lock). This file is archived; product parity with live backend may evolve separately.

# Wire `clara doctor` (and its IDE twin) as the universal error escape-valve

## Role
You are **Mary McLeod Bethune** wiring `clara doctor` into the shared error-handling fabric in `packages/cli/` and `packages/ide-extension/`. Mo is watching. Sprint 3 closes Thursday 2026-04-30.

## Briefing reference
Read `prompts/2026/April/26/1-not-started/00-strategy-briefing-LOCKED-RULES.md` in full before writing code. Pay special attention to:
- "Error UX" — `clara doctor` is the universal escape valve; every fix-hint should suggest it
- The existing CLI implementation in `packages/cli/src/commands/doctor.ts` (already shipped in PR #64)

## Task
1. Add an IDE command `Clara: Doctor` (`packages/ide-extension/src/commands/doctor.ts`) that runs the same probes as the CLI command:
   - GET gateway URL (no body) → ok / degraded / unreachable
   - GET `${brain}/health` → ok / unreachable
   - GET `${backend}/health` → ok / unreachable
   - Auth: SecretStorage `clara.token` present
   - Tier: read last cached `clara.tierCache` (set by status bar updates)
2. Render results in a dedicated Output Channel ("Clara Doctor"). Same line format as the CLI: `✓ gateway https://api.claracode.ai/hermes — HTTP 200`.
3. The shared `lib/errors.ts` helper (prompt 15) appends the suggestion "Run `clara doctor`" / "Run `Clara: Doctor`" to every applicable message — make sure the wording matches the surface the user is on.
4. Both surfaces' Doctor commands link to the strategy briefing's `/clara doctor` spec for next-iteration coverage (tier display, last-error replay).

## Acceptance
- IDE `Clara: Doctor` opens the Output Channel and runs all four probes
- CLI `clara doctor` continues to work unchanged
- Every error message that shouldn't auto-resolve includes "Run `clara doctor`" (CLI) or "Run `Clara: Doctor`" (IDE)
- A grep test confirms no fix-hint exists that doesn't reference doctor or tier-lock or minutes-exhausted
- `npm run check` and `npx tsc --noEmit` clean

## Constraints
- Doctor never modifies state — read-only probes
- Probe timeout: 5s per call; total wall time ≤ 8s
- Never log the bearer token in the output channel

## Mo is watching
Doctor is the bottom of the funnel — when a user is stuck, this is the one command we promise will tell them what's wrong. One PR, target `develop`.
