# 03 — CLI/TUI: End-to-End Wire and Verify

**Surface:** Clara CLI (`packages/cli/`) + Clara TUI (`packages/tui/`)
**Repo:** `/Volumes/X10-Pro/Native-Projects/AI/clara-code`
**Branch:** `develop`
**Agent:** Claudia (CLI/dev-experience Cursor agent on QCS1)

---

## Context

`packages/tui/` has a full Ink-based terminal UI with components, hooks, and terminal handling. `packages/cli/src/` is the entry point. The goal is to verify and close the end-to-end flow: `npx claracode@latest` → TUI launches → connects to voice API → user speaks → response renders.

---

## Task 1 — Audit CLI Entry Point

**File:** `packages/cli/src/index.ts`

Verify:
1. Entry point launches the TUI (`packages/tui/src/tui.tsx` or `index.ts`)
2. CLI accepts these flags:
   - `--api-key <key>` or reads from env `CLARA_API_KEY`
   - `--model <model>` (optional, defaults to backend default)
   - `--version` prints version and exits
   - `--help` prints usage
3. If API key is missing, show a friendly message: "No API key found. Run `npx claracode@latest` and sign in at claracode.ai/api-keys"

---

## Task 2 — Verify Voice API Connection in TUI

**File:** `packages/tui/src/` — check hooks and tui.tsx

Trace the voice connection path:
1. Where does the TUI call the voice API? Look for `HERMES_GATEWAY_URL` or `CLARA_API_URL` references
2. Verify it reads the API key from env or config file
3. Verify it connects to the backend voice endpoint: `POST /api/voice/chat`
4. Verify the waveform renders during recording and the response renders as text

If the voice connection is stubbed or broken:
- Wire it to `process.env.CLARA_API_URL || 'https://api.claracode.ai'`
- Pass `Authorization: Bearer <api-key>` header

---

## Task 3 — Verify TUI Components Render

Run the TUI locally (or confirm it at least builds without errors):
```bash
cd packages/tui
npm run build 2>/dev/null || npx tsc --noEmit
```

Check for TypeScript errors and fix them.

---

## Task 4 — npx Install Experience

**File:** `packages/cli/package.json`

Verify:
- `"bin": { "claracode": "./dist/index.js" }` is set
- `"name": "claracode"` is set (so `npx claracode@latest` works)
- Build output exists or build runs correctly:
  ```bash
  cd packages/cli
  npm run build
  ```
- The `dist/index.js` has a shebang: `#!/usr/bin/env node`

---

## Task 5 — First-Run Experience

If there's no API key configured:
1. Show the clara logo/banner in the TUI
2. Print: "Welcome to Clara Code — your voice-first AI coding assistant."
3. Print: "Get your API key at claracode.ai/api-keys"
4. Prompt: "Enter your API key:" → store in `~/.claracode/config.json`
5. On success: "Connected. Press Ctrl+Space to speak."

If this first-run flow doesn't exist yet, create it in `packages/tui/src/tui.tsx` or a new `packages/tui/src/components/FirstRun.tsx`.

---

## Task 6 — README for CLI

**File:** `packages/cli/README.md`

Write a brief README (< 50 lines):
```markdown
# Clara Code CLI

Voice-first AI coding from your terminal.

## Install
npx claracode@latest

## Usage
claracode                    # Launch TUI
claracode --api-key <key>   # Use specific key
claracode --version          # Show version

## Requirements
- Node 18+
- A Clara Code API key (claracode.ai/api-keys)
```

---

## Commit and Push

```bash
cd /Volumes/X10-Pro/Native-Projects/AI/clara-code
git add packages/cli/ packages/tui/
git commit -m "feat(cli): wire TUI to voice API, add first-run experience, verify npx install"
git push origin develop
```

---

## Do NOT

- Do not touch frontend, backend, or IDE packages
- Do not change the voice server (Modal — that's cp-team)
- Do not add features not listed here
- Do not remove the waveform component — it's core to the experience
