---
name: Thin-client non-negotiable — CLI / IDE / website carry NO replicable intelligence
description: Enforce that every artifact the clara-code team ships (CLI, Tauri IDE, website) contains zero LLM routing, personas, prompt templates, culture packs, voice IDs, or brand/persona config. All intelligence is served from the API. The API is the moat.
status: not-started
priority: P0
---

**TARGET REPO:** imaginationeverywhere/clara-code
**BRANCH:** develop (always target develop; Mo authorizes main promotion)

## MANDATORY: Brain Query Before Acting

1. `brain_query({ topic: "IP protection facade proxy brain", k: 5 })`
2. `brain_query({ topic: "runtime proprietary closed-source", k: 3 })`
3. `brain_query({ topic: "clara-code thin client CLI IDE", k: 3 })`
4. If memory contradicts, STOP and flag via the live feed.

## Context

The clara-code team self-corrected on 2026-04-23 (commit `6dd3af06`):
the CLI is a thin HTTP client, the moat lives server-side at
`api.claracode.ai` / `api.claraagents.com`, and publishing the CLI
source to npm is fine — same pattern as Claude Code, Stripe CLI,
Vercel CLI. The team arrived at the right answer but spent ~20
minutes re-deriving it. This prompt locks the architectural rule
into the repo so it never gets re-litigated.

Mapping to ecosystem map: §4 (Facade + Brain Proxy), §7 L1 (clara-code
is customer-facing surface, all intelligence lives at L2
`clara-platform-runtime` / L3 `agents` / L4 `models`).

## The rule

**Every artifact this repo ships — CLI, Tauri desktop IDE, claracode.ai
website — MUST contain zero replicable intelligence.** Specifically
NONE of the following may be hardcoded, embedded, bundled, or shipped
in CLI / desktop / frontend code:

- LLM prompt templates or system prompts
- Persona text (Clara's personality, Villarosa heritage, etc.)
- Culture packs (AAVE / Spanish / corporate / gaming / any styling)
- LLM routing logic (model selection, fallback order)
- Model-provider configs or API paths beyond the public facades
- Voice IDs / voice catalog entries
- Brain Proxy rules or filter patterns
- VSL slang rules or culture-conditioning logic
- Agent SOUL.md content or agent configs
- Subscription-tier logic or feature-gate decisions

All of the above is served by `api.claracode.ai` and `api.claraagents.com`
(implemented in `clara-platform-runtime` L2) and fetched per-request.

## What the CLI / IDE / website IS allowed to contain

- HTTP client code (auth headers, retry logic, response streaming)
- UI rendering (terminal TUI, Tauri window chrome, web landing pages)
- Mic capture, audio playback, clipboard, file I/O
- Local caching of already-fetched artifacts (e.g. the greeting MP3)
  — cache content, never hardcode the content itself
- Auth/subscription UI (sign-in, paywall prompts, billing link-outs) —
  validation happens server-side
- Install / update mechanics (npm, Tauri updater, CF R2 downloads)
- Telemetry/error reporting (tenant-scoped)
- Error messages that are generic ("subscription required") — never
  proprietary-revealing

## Verification / acceptance

1. **Grep gate** on every PR to `develop`: search the diff for hardcoded
   prompt strings, persona markers, voice IDs, model IDs, Clara Villarosa
   heritage language, etc. Any match = reject PR until moved server-side.
2. **Contract test**: CLI launched with an invalid API key must do
   nothing useful — no partial intelligence leaks, no degraded mode
   that reveals prompt structure. If it degrades gracefully to silence,
   pass. If it exposes ANY model or persona behavior locally, fail.
3. **Package inspection**: `npm pack` then `tar -tzf` the tarball — no
   `.md` with persona text, no `prompts/*.json`, no `models/*`.
4. **Source audit**: add a CI job that greps the repo on every commit
   for forbidden markers (list above). Block merge on findings.
5. **Document the rule** at `CONTRIBUTING.md` and in the README so
   external contributors (Vibe Pros reading the public repo) know
   the contract.

## Deliverables

1. `CONTRIBUTING.md` section: "Thin-client discipline" — the rule,
   verification, example violations.
2. `.github/workflows/thin-client-gate.yml` — grep-based CI job that
   blocks merges on forbidden markers (configurable word list in
   `.github/thin-client-forbidden.txt`).
3. README blurb — one paragraph explaining why the CLI on npm is
   safe (API is the moat), with the Claude Code / Stripe / Vercel
   analogy.
4. Self-audit report — one-time scan of current codebase, remediate
   anything that violates the rule (move to API), commit separately.

## Constraints

- Target `develop`. PRs via `/pickup-prompt` flow.
- No force-push. No direct-to-main ever.
- Keep the grep list maintained — new forbidden terms get added as
  they come up (e.g. when a new voice ID or persona marker is minted).

## References

- Ecosystem map §4 (Facade + Brain Proxy), §7 L1/L2
- Memory: `decision-ip-protection-facade-proxy-brain`
- Memory: `decision-runtime-proprietary-closed-source-no-eject`
- Memory: `decision-hermes-agent-stays-clean-of-proprietary`
- Commit `6dd3af06 fix(ci): restore npm publish — subscription gate is auth not install location` (team's self-correction that surfaced this need)

## When done

Open PR to develop via `/pickup-prompt` flow. Post to HQ live feed:
"CLARA-CODE thin-client gate INSTALLED | PR #N"

---

**Non-negotiable reinforcement:** "The API is the moat. The API is the
IP." Every future feature on clara-code is evaluated against this rule
before it ships.
