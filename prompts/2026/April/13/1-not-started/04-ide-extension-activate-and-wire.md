# 04 — IDE Extension: Activate Voice Bar + Wire to Backend

**Surface:** Clara Code VS Code extension (`packages/ide-extension/`)
**Repo:** `/Volumes/X10-Pro/Native-Projects/AI/clara-code`
**Branch:** `develop`
**Agent:** Carruthers (IDE Cursor agent on QCS1)

---

## Context

`packages/ide-extension/` has the VS Code extension scaffold:
- `extension.ts` — entry point, activates the extension
- `ClaraPanelProvider.ts` — provides the CLARA panel webview
- `webview/VoiceBar.tsx` — voice bar UI component
- `webview/TerminalPanel.tsx` — terminal panel component
- `commands/` — VS Code commands

The goal is to verify the extension activates correctly, the panel opens, the voice bar renders, and Ctrl+Space triggers recording that connects to the voice API.

---

## Task 1 — Verify Extension Activation

**File:** `packages/ide-extension/src/extension.ts`

Verify:
1. Extension activates on VS Code startup (or on first voice command)
2. `activate()` function:
   - Registers the `clara.openPanel` command
   - Registers `clara.speak` command (bound to Ctrl+Space)
   - Creates and registers `ClaraPanelProvider`
3. `package.json` has correct `activationEvents`, `contributes.commands`, and `contributes.keybindings`

Fix any issues found.

---

## Task 2 — Verify ClaraPanelProvider

**File:** `packages/ide-extension/src/ClaraPanelProvider.ts`

Verify:
1. Implements `vscode.WebviewViewProvider`
2. `resolveWebviewView()` loads the webview HTML
3. Passes the following to the webview:
   - API key (from VS Code secrets storage or settings)
   - Voice API URL (from settings or env)
4. Handles messages from the webview (`vscode.postMessage`) for:
   - Voice recording start/stop
   - Code insertion at cursor position

---

## Task 3 — Verify VoiceBar Webview

**File:** `packages/ide-extension/src/webview/VoiceBar.tsx`

Verify:
1. Renders a voice bar at the bottom of the panel
2. Shows recording indicator when active
3. Calls the voice API via `fetch` with the API key
4. On response: calls `window.postMessage({ type: 'insertCode', code: response })` back to the extension
5. Ctrl+Space (or equivalent in webview context) toggles recording

---

## Task 4 — Build and Package

```bash
cd packages/ide-extension
npm run build   # or npm run compile
```

Verify it builds to `dist/` without TypeScript errors.

Check `package.json` for:
- `"publisher"` field set to `imaginationeverywhere`
- `"name"` set to `clara-code`
- `"displayName"` set to `Clara Code`
- `"description"` set to `Voice-first AI coding assistant`
- `"version"` matches the monorepo version

---

## Task 5 — Settings Page Wire

**File:** `packages/ide-extension/src/commands/` (or wherever settings are handled)

Ensure there's a command `clara.openSettings` that opens a webview where the user can:
- Enter their Clara Code API key
- Toggle voice always-on vs. push-to-talk
- See their plan status

If this doesn't exist, create a minimal settings panel that at minimum captures the API key and stores it in VS Code's SecretStorage.

---

## Task 6 — Extension README

**File:** `packages/ide-extension/README.md`

```markdown
# Clara Code — VS Code Extension

Voice-first AI coding inside VS Code.

## Features
- Ctrl+Space — speak to your AI coding assistant
- Inline code suggestions via voice
- Full voice TUI panel (CLARA tab in sidebar)

## Setup
1. Install from the VS Code marketplace (or `code --install-extension clara-code-*.vsix`)
2. Open Command Palette → "Clara Code: Open Panel"
3. Enter your API key (get one at claracode.ai/api-keys)
4. Press Ctrl+Space to speak

## Requirements
- VS Code 1.74+
- A Clara Code API key
```

---

## Commit and Push

```bash
cd /Volumes/X10-Pro/Native-Projects/AI/clara-code
git add packages/ide-extension/
git commit -m "feat(ide): wire voice bar to backend API, verify activation and panel loading"
git push origin develop
```

---

## Do NOT

- Do not touch frontend, backend, CLI, or TUI packages
- Do not publish to VS Code marketplace (not yet)
- Do not add features beyond voice bar + settings panel
- Do not change the voice server (Modal — cp-team owns it)
