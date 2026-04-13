# 03 — Clara Code CLI / TUI (Ink + pi-tui)

**Archived for:** `prompts/2026/April/12/S2-02-web-ui-dispatch.md`  
**Target branch (original spec):** `feat/cli-tui-complete`  
**Implementation in repo:** `packages/tui/`, `packages/coding-agent/`, `packages/cli/` (if present)

## Scope

- Terminal full-screen UI (`@mariozechner/pi-tui`), `clara` / `pi` coding-agent entrypoints, optional narrow IDE panel mode (280px) where wired to the webview.

## Verification

```bash
cd packages/tui && pnpm run check
cd ../coding-agent && pnpm run check
```

## Notes

The April 10 copy on QCS1 was not present in this clone when S2-02 ran; this file records the canonical paths and acceptance checks for that prompt id.
