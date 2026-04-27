---
type: cursor-prompt
status: completed-archived
archived: 2026-04-27
authored_by: HQ
team: /clara-code
target_repos: clara-code
---

**Archival note (2026-04-27):** Sprint 3 prompt work is implemented in `packages/cli` and/or `packages/ide-extension` (cognitive verbs, deploy, TUI chat, config, IDE commands, status bar, shared HTTP error mapping, minutes, tier lock). This file is archived; product parity with live backend may evolve separately.

# Shared error-mapping — never raw HTTP, never internal codenames

## Role
You are **Mary McLeod Bethune** building the shared error-mapping helper for the Clara Code CLI and IDE. Mo is watching. Sprint 3 closes Thursday 2026-04-30.

## Briefing reference
Read `prompts/2026/April/26/3-completed/00-strategy-briefing-LOCKED-RULES.md` in full before writing code. Pay special attention to:
- "Error UX" — never raw HTTP errors, never mention internal codenames, doctor as escape valve
- "Forbidden words" — no codename leaks ever, in any artifact

## Task
Build `lib/errors.ts` in both packages: a single function that maps any HTTP failure to a plain-English fix-hint.

Mapping table:
| Status | Server `reason` | User message |
|---|---|---|
| 401 | * | "Sign in to continue. Run `clara login`." |
| 402 | subscription_inactive | "Your Clara subscription is inactive. Reactivate: <url>" |
| 403 | tier_lock | (delegate to tier-lock helper, prompt 12) |
| 403 | * | "Permission denied — run `clara doctor` for status." |
| 404 | * | "Clara couldn't find that. Check the name and try again." |
| 429 | minutes_exhausted | (delegate to minutes-exhausted helper, prompt 14) |
| 429 | * | "Slow down for a moment — try again in a few seconds." |
| 5xx | * | "Clara is coming online — run `clara doctor` for status." |
| network err | * | "Couldn't reach Clara. Check your connection — `clara doctor` will tell you more." |

Audit pass: replace every existing `console.error(\`HTTP \${status}\`)` and every `vscode.window.showErrorMessage(err.message)` with calls to this helper.

Forbidden in any output:
- `Hermes`, `Modal`, `pi`, `cognee`, internal Modal app names, internal SSM key names
- raw stack traces (route to debug log only — `~/.clara/debug.log` for CLI, output channel for IDE)

## Acceptance
- Every HTTP error in the codebase routes through `mapError()`
- Zero raw `HTTP 5xx` strings reach the user
- Zero internal-codename leaks (grep test in CI catches them)
- Stack traces present only in debug log / output channel, never in user-facing surfaces
- `npm run check` and `npx tsc --noEmit` clean

## Constraints
- Add a CI grep that fails the build if `Hermes|Modal|pi-coding|cognee` appears in user-facing code paths (excluding internal source comments)
- The grep audit lives in `.github/workflows/lint.yml` (gate before merge)
- Never silently swallow an error — debug log gets it; user gets the plain message

## Mo is watching
Every error message is a chance to keep the brand intact. Don't waste one. One PR, target `develop`.
