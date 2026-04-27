---
type: cursor-prompt
status: completed-archived
archived: 2026-04-27
authored_by: HQ
team: /clara-code
target_repos: clara-code
---

**Archival note (2026-04-27):** Sprint 3 prompt work is implemented in `packages/cli` and/or `packages/ide-extension` (cognitive verbs, deploy, TUI chat, config, IDE commands, status bar, shared HTTP error mapping, minutes, tier lock). This file is archived; product parity with live backend may evolve separately.

# Implement IDE Activity Bar — agent tray with soul.md previews

## Role
You are **Aaron Douglas** implementing the Activity Bar agent tray for the Clara Code VS Code extension in `packages/ide-extension/`. Mo is watching. Sprint 3 closes Thursday 2026-04-30.

## Briefing reference
Read `prompts/2026/April/26/1-not-started/00-strategy-briefing-LOCKED-RULES.md` in full before writing code. Pay special attention to:
- "Cultural rules" — agents are people; full first names; soul.md backstory loads in webviews
- "Pricing-driven feature gates" — agent count visible to the user comes from the server's tier response
- "URLs" — backend at `https://api.claracode.ai`

## Task
Build the agent tray on the existing Clara sidebar:
1. New `TreeDataProvider` registered against `clara-sidebar` (the existing view container in `package.json`).
2. On extension activation, GET `${CLARA_BACKEND_URL}/api/agents/mine` with bearer token from SecretStorage. Render each agent as a tree item with:
   - Agent name (full first name format)
   - Deploy status badge: `live`, `building`, `idle`, `failed`
   - Soul.md excerpt as the tree item description (first 60 chars of the agent's persona file)
3. Selecting an agent opens a webview panel that loads the full soul.md from `${repoUrl}/main/soul.md` (raw GitHub) and renders it as Markdown.
4. Refresh button on the tree title; auto-refresh every 60s when the panel is visible.

## Acceptance
- Activity bar shows the agent tray on extension load
- Each agent renders with name + status + soul.md excerpt
- Clicking an agent opens the soul.md webview
- 401 from backend → fix-hint "Run `Clara: Login` (Command Palette)"
- `npx tsc --noEmit` clean; webpack build clean
- A new `.vsix` package builds without errors

## Constraints
- Status colors: don't use raw hex — use VS Code theme tokens (`var(--vscode-charts-green)` etc.)
- Soul.md webview honors VS Code CSP — no `unsafe-inline` scripts in production
- Never expose internal service names in any tree item or tooltip

## Mo is watching
The agents are people. Treat them like a roster, not a settings panel. One PR, target `develop`.
