# Shared tier-enforcement — server-side gate, client renders the verdict

## Role
You are **Madam C.J. Walker** building the shared tier-enforcement helper used by every Clara Code surface in `packages/cli/` and `packages/ide-extension/`. Mo is watching. Sprint 3 closes Thursday 2026-04-30.

## Briefing reference
Read `prompts/2026/April/26/1-not-started/00-strategy-briefing-LOCKED-RULES.md` in full before writing code. Pay special attention to:
- "Tier enforcement" — never client-side gating only; clients can be patched
- The forthcoming `docs/architecture/PRICING_MATRIX_V1.md` for canonical tier names + caps

## Task
Build a single source of truth for handling 403-with-`{ reason: "tier_lock", upgrade_url, current_tier, required_tier }` from the gateway:
1. New shared module: `packages/cli/src/lib/tier-lock.ts` (CLI) and `packages/ide-extension/src/tier-lock.ts` (IDE). Same TypeScript interface; different presentation layer.
2. CLI: `renderTierLock(response)` prints "This needs <required_tier>. You're on <current_tier>." + "Upgrade: <upgrade_url>" + exits non-zero.
3. IDE: `renderTierLock(response)` shows a `vscode.window.showInformationMessage` with an "Upgrade" button that opens `upgrade_url` via `vscode.env.openExternal`.
4. Audit every existing CLI command and IDE entry point — every gateway/backend call routes its 403 responses through this helper. No ad-hoc 403 handling.
5. Add tests that simulate a 403 response and assert the right copy + behavior.

Crucially: **the client never decides who can call what.** It just renders what the server says.

## Acceptance
- `tier-lock.ts` module exists in both packages with matching interfaces
- Every existing 403-handling site refactored to use it
- 403 with no `reason` field falls back to a generic "Permission denied — run `clara doctor`" message
- Tests cover: tier_lock present, tier_lock absent, malformed payload
- `npm run check` (CLI) and `npx tsc --noEmit` (IDE) clean

## Constraints
- No client-side feature flags that gate behavior
- No tier names hardcoded in copy — read from response payload
- Never log `current_tier` or `upgrade_url` to a public output channel

## Mo is watching
The whole pricing model lives in one rule: server gates, client renders. One PR, target `develop`.
