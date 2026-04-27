---
type: cursor-prompt
status: completed-archived
archived: 2026-04-27
authored_by: HQ
team: /clara-code
target_repos: clara-code
---

**Archival note (2026-04-27):** Sprint 3 prompt work is implemented in `packages/cli` and/or `packages/ide-extension` (cognitive verbs, deploy, TUI chat, config, IDE commands, status bar, shared HTTP error mapping, minutes, tier lock). This file is archived; product parity with live backend may evolve separately.

# Implement direct verb commands — `clara analyze`, `clara think`, `clara critically-think`, `clara creative-thinking`, `clara truth`, `clara facts`, `clara save`, `clara remember`

## Role
You are **Cheikh Anta Diop** implementing the eight cognitive verb commands for the Clara Code CLI in `packages/cli/`. Mo is watching. Sprint 3 closes Thursday 2026-04-30.

## Briefing reference
Read `prompts/2026/April/26/1-not-started/00-strategy-briefing-LOCKED-RULES.md` in full before writing code. Pay special attention to:
- "URLs" — every verb hits `${gatewayUrl}/v1/<verb>`, never a model name
- "Tier enforcement" — server returns 403 with `{ reason, upgrade_url }`; client renders the CTA
- The forthcoming `docs/architecture/CLARA_CODE_V1_ENDPOINT_CATALOG.md` for the full request/response shape

## Task
Add eight direct verb commands to the CLI. Each is a thin wrapper around a shared `cognitive(verb, body)` helper that POSTs to `${gatewayUrl}/v1/<verb>`:

- `clara analyze <text|file>` → `/v1/analyze`
- `clara think <prompt>` → `/v1/think`
- `clara critically-think <prompt>` → `/v1/critically-think`
- `clara creative-thinking <prompt>` → `/v1/creative-thinking`
- `clara truth <claim>` → `/v1/truth`
- `clara facts <topic>` → `/v1/facts`
- `clara save <key> <value>` → `/v1/save`
- `clara remember <key>` → `/v1/remember`

Implementation details:
1. Single shared `runCognitive(verb: string, body: object)` helper in `src/lib/cognitive.ts`. Reads gateway URL from the same resolution chain as `chat`. Reads bearer token from OS keyring.
2. Each command is a small file in `src/commands/cognitive/<verb>.ts` registering itself on the program.
3. File argument support: if the input starts with `@`, treat as filepath and read its contents.
4. JSON output mode: `--json` flag prints raw response object; default mode prints the `reply` field.
5. Streaming if the server returns SSE; else plain JSON.

## Acceptance
- Each verb command works against the live gateway (today returns 500 — that's expected per the doctor probe)
- File argument support: `clara analyze @./README.md`
- 403 tier_lock surfaces the upgrade CTA
- Zero references to model names, system prompts, temperatures
- Tests for the shared helper cover: success, 401, 403, file argument, plain text argument
- `npm run check` passes

## Constraints
- No model name on the wire — `intent` field only if needed for routing context
- No system_prompt key in `clara config` — these commands cannot override system behavior

## Mo is watching
Eight verbs, one helper, zero fluff. One PR, target `develop`.
