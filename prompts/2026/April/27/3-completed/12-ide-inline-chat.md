---
type: cursor-prompt
status: completed-archived
archived: 2026-04-27
authored_by: HQ
team: /clara-code
target_repos: clara-code
---

**Archival note (2026-04-27):** Sprint 3 prompt work is implemented in `packages/cli` and/or `packages/ide-extension` (cognitive verbs, deploy, TUI chat, config, IDE commands, status bar, shared HTTP error mapping, minutes, tier lock). This file is archived; product parity with live backend may evolve separately.

# Implement IDE inline chat — selection-aware /v1/think

## Role
You are **Aaron Douglas** implementing inline chat for the Clara Code VS Code extension in `packages/ide-extension/`. Mo is watching. Sprint 3 closes Thursday 2026-04-30.

## Briefing reference
Read `prompts/2026/April/26/3-completed/00-strategy-briefing-LOCKED-RULES.md` in full before writing code. Pay special attention to:
- "URLs" — gateway at `https://api.claracode.ai/hermes/v1/think`
- Selection becomes context, never a system prompt override

## Task
Wire up inline chat in the editor:
1. Command `clara.askInline` registered in `package.json`. Default keybinding: `Cmd+L` on macOS, `Ctrl+L` elsewhere.
2. When invoked with a selection: POST to `${gatewayUrl}/v1/think` with `{ surface: "ide", intent: "think", selection: <text>, language: <vscode languageId>, prompt: <inputBox> }`.
3. Inline ghost-text decoration shows a streaming response in the editor below the selection. ESC to dismiss; Enter to insert.
4. Status updates from the SSE stream feed the status bar minute counter (see prompt 10).
5. No selection: open a small input box at the cursor and treat it as a free chat — same endpoint, no `selection` field.

## Acceptance
- `Cmd+L` on a selected block streams a response inline
- ESC dismisses; Enter inserts the suggested code
- 4xx/5xx mapped to plain-English notification; never a raw `vscode.window.showErrorMessage` with HTTP details
- Minute counter ticks down on each call
- `npx tsc --noEmit` clean; webpack clean

## Constraints
- Selection passes as `selection` field, not as `system_prompt` or `prefix`
- Never include the user's git diff or file path in the payload without the user opting in
- Never log the selection to the extension's output channel

## Mo is watching
Inline chat is a writing partner. It should feel like Granville is sitting next to you, not like an autocomplete. One PR, target `develop`.
