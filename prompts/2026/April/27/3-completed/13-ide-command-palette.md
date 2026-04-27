---
type: cursor-prompt
status: completed-archived
archived: 2026-04-27
authored_by: HQ
team: /clara-code
target_repos: clara-code
---

**Archival note (2026-04-27):** Sprint 3 prompt work is implemented in `packages/cli` and/or `packages/ide-extension` (cognitive verbs, deploy, TUI chat, config, IDE commands, status bar, shared HTTP error mapping, minutes, tier lock). This file is archived; product parity with live backend may evolve separately.

# Wire IDE command palette — `Clara: Login`, `Clara: New Agent`, `Clara: Deploy`, `Clara: Set Gateway URL`

## Role
You are **Aaron Douglas** wiring the VS Code Command Palette entries for the Clara Code extension in `packages/ide-extension/`. Mo is watching. Sprint 3 closes Thursday 2026-04-30.

## Briefing reference
Read `prompts/2026/April/26/1-not-started/00-strategy-briefing-LOCKED-RULES.md` in full before writing code. Pay special attention to:
- "Authentication" — OS-native secret storage
- "Repo strategy" — `New Agent` calls the same backend route as `clara init`
- "Pricing-driven feature gates" — Deploy is Cook+ (server-side gate)

## Task
Add four Command Palette entries (declared in `package.json contributes.commands`):
1. `Clara: Login` — opens browser to `https://claracode.ai/cli-auth?source=ide&port=<loopback>`. Same loopback flow as the CLI; token stored in VS Code SecretStorage under `clara.token` and `clara.apiKey`.
2. `Clara: New Agent` — input box for agent name → POST `${CLARA_BACKEND_URL}/api/agents/init` → on success, prompt to clone into the user's chosen folder (`vscode.window.showOpenDialog`).
3. `Clara: Deploy` — runs against the active workspace folder; same SSE-streaming UX as `clara deploy` but rendered as a `vscode.window.withProgress` progress notification.
4. `Clara: Set Gateway URL` — already implemented in `commands/dev.ts`. Verify it still passes through SecretStorage (not settings.json).

Each command shares a single `httpClient` helper that automatically:
- Reads bearer from SecretStorage
- Maps 4xx/5xx to plain-English `showInformationMessage` / `showErrorMessage`
- Surfaces 403 tier_lock with an "Upgrade" button that opens the upgrade URL

## Acceptance
- All four commands appear in the palette under category "Clara"
- `Clara: Login` flow reuses the loopback-port pattern; token lands in SecretStorage
- `Clara: New Agent` provisions a repo and offers to clone
- `Clara: Deploy` streams progress with cancel support
- 403 tier_lock from any command renders an "Upgrade" button
- `npx tsc --noEmit` clean; webpack clean

## Constraints
- All secrets use `context.secrets`, never `vscode.workspace.getConfiguration().update(...)`
- No internal service names in the command titles or tooltips
- Cancel on Deploy aborts the SSE stream cleanly

## Mo is watching
The palette is the IDE's front door. Each entry is a brand impression. One PR, target `develop`.
