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
| `npm start` / `npm run dev` | Run `tauri dev`: builds the voice overlay + **shell** voice bundle (`build:shell-voice`), serves `shell/` on port **1420**, opens the webview |
| `npm run build:shell-voice` | Builds `packages/clara-voice-client`, then esbuilds `src/shell-voice-converse.ts` → `shell/voice-converse-bundled.js` (uses `@imaginationeverywhere/clara-voice-client/converse-browser`) |
| `npm run build` | Production `tauri build` (embeds `shell/` as `frontendDist`) |
| `npm run tauri` | Pass-through to Tauri CLI |

## Development

`npm run dev` — `beforeDevCommand` runs `build:voice-overlay`, `build:shell-voice` (TTS/voice path + shared client in the right column), and `shell:serve` (static server for `desktop/shell`). The main window loads `http://localhost:1420`.

### Voice service configuration

- Set the same **voice base URL** the CLI uses as `CLARA_VOICE_URL` in `shell/index.html` via `<meta name="clara-voice-base" content="https://your-voice-host">`. Optional: `<meta name="clara-voice-api-key" content="...">` for the bearer the service expects.
- Greeting: `POST /voice/converse` with `{ "text": "" }`. Push-to-talk: record in the webview, then the second click sends `audio_base64` + `mime_type` and `session_id` (aligns with `clara` default voice and `postVoiceConverse`).

### Installers and CI

- `npm run build` produces a `.dmg` on macOS (unsigned unless you add signing in Apple Developer). CI workflow `.github/workflows/desktop-macos-dmg.yml` runs on changes under `desktop/**` and uploads the `dmg` artifact.
- Hosting the `.dmg` on Cloudflare R2 and linking from the marketing site is a separate task (see product prompts in `prompts/`).

To work on the **Next.js** app inside the desktop window instead, point `build.devUrl` in `src-tauri/tauri.conf.json` back to `http://localhost:3000` and start the frontend separately.

## Production build

`npm run build` produces platform bundles that load the static shell from `../shell` (relative to `src-tauri/`).

## Icons

- Tray: `src-tauri/icons/tray-icon.png` (32×32). Regenerate app bundle icons from `app-icon-source.png` with `npx tauri icon src-tauri/icons/app-icon-source.png` after updating the source asset.
- Placeholder icons are generated with `scripts/generate-clara-icons.mjs`; swap in official Clara Code artwork when ready.

## UI notes

- Native window decorations are off (`decorations: false`) for a custom title bar; `shell/index.html` uses `data-tauri-drag-region` on the title bar for dragging. The floating voice FAB from `voice-overlay.js` does not mount when `data-clara-desktop-shell` is on `<html>`; the **side panel** in `shell/index.html` loads `voice-converse-bundled.js` instead.

## Scaffolds

Tray menu and global shortcut behavior are documented under `src-tauri/scaffold/` and are not fully implemented in this phase.
