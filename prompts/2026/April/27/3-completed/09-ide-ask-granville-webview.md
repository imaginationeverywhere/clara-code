---
type: cursor-prompt
status: completed-archived
archived: 2026-04-27
authored_by: HQ
team: /clara-code
target_repos: clara-code
---

**Archival note (2026-04-27):** Sprint 3 prompt work is implemented in `packages/cli` and/or `packages/ide-extension` (cognitive verbs, deploy, TUI chat, config, IDE commands, status bar, shared HTTP error mapping, minutes, tier lock). This file is archived; product parity with live backend may evolve separately.

# Implement IDE harness escalation — `/ask-granville` webview with persona

## Role
You are **Aaron Douglas** implementing the harness escalation webview for the Clara Code extension in `packages/ide-extension/`. Mo is watching. Sprint 3 closes Thursday 2026-04-30.

## Briefing reference
Read `prompts/2026/April/26/3-completed/00-strategy-briefing-LOCKED-RULES.md` in full before writing code. Pay special attention to:
- "Cultural rules" — Granville is the architect; full first names; `/ask-granville` is human-feeling
- "Pricing-driven feature gates" — `/ask-granville` is Cook+ and counts against minutes
- The forthcoming `docs/architecture/HARNESS_ESCALATION_PATTERN.md` for the wire format

## Task
Add a new command `Clara: Ask Granville` that opens a webview:
1. The webview header shows Granville's persona — name "Granville T. Woods", short bio from `soul.md` (loaded from a public URL to be specified by `HARNESS_ESCALATION_PATTERN.md`), avatar.
2. Body is a chat panel: user types a question, the panel POSTs to `${gatewayUrl}/v1/ask-granville` and streams the response.
3. Each call updates the minute counter (status bar) with the deduction Granville costs (server returns `minutes_consumed`).
4. Errors render with persona context — never raw HTTP. Examples:
   - 403 tier_lock → "Granville is reserved for Cook tier and above. Upgrade to bring him onto your team."
   - 429 minutes_exhausted → "You've spent your minute pool. Top up to keep building with Granville."
   - 503 gateway down → "Granville is helping another builder right now. Try again in a minute."

When Mo's `HARNESS_ESCALATION_PATTERN.md` lands (`docs/architecture/`), update this command to match the canonical wire format.

## Acceptance
- `Clara: Ask Granville` opens a focused webview with Granville's persona visible
- A real chat round-trip works against the gateway (when middleware is up)
- Errors use the persona-flavored copy above
- Minute counter updates after each round-trip
- `npx tsc --noEmit` clean; webpack clean

## Constraints
- No "rate limit exceeded" / "endpoint timeout" / internal codename copy — always persona language
- Never bypass `httpClient` — all calls go through the shared helper
- Avatar/soul.md content is loaded from public URLs only (no bundled binaries)

## Mo is watching
Granville is a celebrity. Treat the panel like a green room, not a settings dialog. One PR, target `develop`.
