---
type: cursor-prompt
status: completed-archived
archived: 2026-04-27
authored_by: HQ
team: /clara-code
target_repos: clara-code
---

**Archival note (2026-04-27):** Sprint 3 prompt work is implemented in `packages/cli` and/or `packages/ide-extension` (cognitive verbs, deploy, TUI chat, config, IDE commands, status bar, shared HTTP error mapping, minutes, tier lock). This file is archived; product parity with live backend may evolve separately.

# Extend `clara config get|set` — gateway/brain/backend overrides only

## Role
You are **Benjamin Banneker** extending the `clara config` command for the Clara Code CLI in `packages/cli/`. Mo is watching. Sprint 3 closes Thursday 2026-04-30.

## Briefing reference
Read `prompts/2026/April/26/3-completed/00-strategy-briefing-LOCKED-RULES.md` in full before writing code. Pay special attention to:
- "URLs" — `CLARA_GATEWAY_URL`, `CLARA_BRAIN_URL`, `CLARA_BACKEND_URL` are the only override surfaces
- The "no model key" rule — `clara config set model X` must error
- The "no system_prompt key" rule — server controls those, never the client

## Task
Extend `packages/cli/src/commands/config.ts`:
1. `clara config set` accepts these keys only:
   - `gatewayUrl` (alias of `CLARA_GATEWAY_URL`)
   - `brainUrl`
   - `backendUrl`
   - `userId` (display only)
   - `apiKey` (alias for the OS-keyring entry; setting via config writes to keyring, NOT to disk)
2. `clara config get <key>` reads from the same surface (env > config file > default).
3. `clara config list` prints all known keys + current resolved values (showing source: env / config / default / keyring).
4. Unknown keys return `clara config: unsupported key "<key>"` and exit non-zero. Reject `model`, `system_prompt`, `temperature`, `top_p` explicitly with a one-liner: "Server controls inference parameters."
5. `clara config unset <key>` removes the override.

## Acceptance
- `clara config list` shows the active gateway/brain/backend with sources
- `clara config set model gpt-X` errors with the "Server controls inference parameters" message
- `clara config set apiKey <token>` writes to OS keyring, never to `~/.clara/config.json`
- `clara config get gatewayUrl` returns `https://api.claracode.ai/hermes` by default (no override set)
- Tests cover the rejected keys
- `npm run check` passes

## Constraints
- No `model` key, no `system_prompt` key, no `temperature` key
- API key reads/writes route through OS keyring, never plaintext
- Override values never get logged

## Mo is watching
Config is a knob set, not a back door. Each rejected key is a brand boundary. One PR, target `develop`.
