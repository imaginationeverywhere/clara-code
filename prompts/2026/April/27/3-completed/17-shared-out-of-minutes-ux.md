---
type: cursor-prompt
status: completed-archived
archived: 2026-04-27
authored_by: HQ
team: /clara-code
target_repos: clara-code
---

**Archival note (2026-04-27):** Sprint 3 prompt work is implemented in `packages/cli` and/or `packages/ide-extension` (cognitive verbs, deploy, TUI chat, config, IDE commands, status bar, shared HTTP error mapping, minutes, tier lock). This file is archived; product parity with live backend may evolve separately.

# Shared out-of-minutes UX — clear "buy more" path, distinct from sub-expired

## Role
You are **Madam C.J. Walker** building the out-of-minutes UX for every Clara Code surface in `packages/cli/` and `packages/ide-extension/`. Mo is watching. Sprint 3 closes Thursday 2026-04-30.

## Briefing reference
Read `prompts/2026/April/26/1-not-started/00-strategy-briefing-LOCKED-RULES.md` in full before writing code. Pay special attention to:
- "Out-of-minutes UX" — clear "you've used your minute allotment" message + 1-click "Buy more minutes" link
- The distinction from "subscription expired" — different error, different flow

## Task
Standardize the response when the gateway returns 429 with `{ reason: "minutes_exhausted", topup_url }`:
1. Shared module `lib/minutes-exhausted.ts` in both packages.
2. CLI: a clear Ink panel: "You've used your minute allotment for this billing period." + "Top up: <topup_url>" + a one-keystroke shortcut to open the URL in the browser. Exit non-zero on the underlying command.
3. IDE: `vscode.window.showWarningMessage("You've used your minute allotment for this billing period.", "Top up", "Dismiss")`. "Top up" opens `topup_url`.
4. Distinct from `{ reason: "subscription_inactive" }`:
   - subscription_inactive → "Your Clara subscription is inactive. Reactivate: <reactivate_url>"
   - never conflate the two messages
5. Both paths must avoid the words "expired" (legal nuance) and "Unlimited" (ban).

## Acceptance
- 429 with `minutes_exhausted` lands the right message + topup CTA
- 402/403 with `subscription_inactive` lands the reactivate CTA
- Plain unrelated 429 (rate limit, e.g. abuse protection) renders as a generic "slow down for a moment — run `clara doctor`" message
- `npm run check` and `npx tsc --noEmit` clean

## Constraints
- No "expired" copy
- No "free tier" upsell
- No bundled "Save you money — add Clara Safe" cross-sell on the topup screen (briefing rule)

## Mo is watching
Running out of minutes is the most common upsell moment. Don't squander it with confusing copy. One PR, target `develop`.
