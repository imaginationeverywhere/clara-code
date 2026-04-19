# Clara Code (desktop)

Tauri v2 shell with a static **voice-first** UI in `shell/` (development and production bundles load that folder via `build.devUrl` / `build.frontendDist` in `src-tauri/tauri.conf.json`).

## Prerequisites

- [Rust](https://www.rust-lang.org/tools/install) and platform [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)
- Node.js (for npm scripts and `@tauri-apps/cli`)

## Scripts

From this directory:

| Command       | Description |
|---------------|-------------|
| `npm install` | Install CLI and lockfile |
| `npm start` / `npm run dev` | Run `tauri dev`: builds the voice overlay bundle, serves `shell/` on port **1420**, opens the webview |
| `npm run build` | Production `tauri build` (embeds `shell/` as `frontendDist`) |
| `npm run tauri` | Pass-through to Tauri CLI |

## Development

`npm run dev` — `beforeDevCommand` runs `build:voice-overlay` and `shell:serve` (static server for `desktop/shell`). The main window loads `http://localhost:1420`.

To work on the **Next.js** app inside the desktop window instead, point `build.devUrl` in `src-tauri/tauri.conf.json` back to `http://localhost:3000` and start the frontend separately.

## Production build

`npm run build` produces platform bundles that load the static shell from `../shell` (relative to `src-tauri/`).

## Icons

- Tray: `src-tauri/icons/tray-icon.png` (32×32). Regenerate app bundle icons from `app-icon-source.png` with `npx tauri icon src-tauri/icons/app-icon-source.png` after updating the source asset.
- Placeholder icons are generated with `scripts/generate-clara-icons.mjs`; swap in official Clara Code artwork when ready.

## UI notes

- Native window decorations are off (`decorations: false`) for a custom title bar; `shell/index.html` uses `data-tauri-drag-region` on the title bar for dragging. The bundled voice FAB (`voice-overlay.js`) does not mount on pages with `data-clara-desktop-shell` on `<html>`.

## Scaffolds

Tray menu and global shortcut behavior are documented under `src-tauri/scaffold/` and are not fully implemented in this phase.
