# Phase 3 — Clara Code Desktop (Tauri)
# Agent: miles-desktop | Workspace: ~/projects/clara-code-desktop-wt

Initialize a Tauri desktop wrapper for claracode.ai.

## What to build
Create a `desktop/` directory with a Tauri v2 project that wraps the claracode.ai web app.

## Tauri config (src-tauri/tauri.conf.json)
- App name: "Clara Code"
- Window title: "Clara Code"
- Default size: 1440x900, min 1024x768
- URL in development: `http://localhost:3000`
- URL in production: `https://claracode.ai`
- Decorations: false (custom titlebar)
- Theme: Dark

## System tray
- Icon: use clara-code logo (PNG 32x32)
- Menu: "Open Clara Code", "Talk to Clara" (opens voice), "Quit"
- Show on tray click

## Global shortcut
- `CommandOrControl+Shift+C` → focus/show window

## Additional config
- `desktop/package.json` — scripts: dev, build, tauri
- `desktop/src-tauri/Cargo.toml` — standard Tauri v2 deps
- `desktop/README.md` — build instructions

## Do NOT implement
- Full system tray logic (scaffold config only)
- Actual key handler code (scaffold structure)

Create PR to `phase3-desktop-qcs1` branch when done.
