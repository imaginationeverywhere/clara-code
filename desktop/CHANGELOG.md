# Changelog

## [Unreleased]

### Added

- Tauri `shell/`: two-column **workspace + Clara voice** panel; bundled `src/shell-voice-converse.ts` via `build:shell-voice` and `@imaginationeverywhere/clara-voice-client/converse-browser` (greeting, push-to-talk, text to `/voice/converse`).
- `shell/index.html` metas `clara-voice-base` / `clara-voice-api-key` (same idea as `CLARA_VOICE_URL` for CLI). Generated `shell/voice-converse-bundled.js` is gitignored.

### Changed

- `tauri.conf.json` default window size and `before*Command` run `build:shell-voice` before `shell:serve` / Tauri `build`.
- `README.md`: voice config, split layout vs voice FAB, CI for `.dmg` artifact (see root `.github/workflows/desktop-macos-dmg.yml`).

### Infrastructure

- Root `.gitignore`: ignore generated `shell/voice-converse-bundled.js`.
