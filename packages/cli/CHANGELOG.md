# Changelog

## [Unreleased]

### Added

- **CLI voice loop on dev stub (PR #2 of CLI-first MVP)** — end-to-end speech → transcript → gateway loop backed by the backend's `/api/voice/stt` dev stub.
  - `src/lib/stt-client.ts` — `requestTranscript()` POSTs base64 audio with Bearer auth; forwards `x-clara-stub-text` header and `stubText` body field when supplied; supports `AbortController`.
  - `src/lib/audio-capture.ts` — spawns `sox`/`rec` when available (16 kHz mono 16-bit WAV on stdout); noop fallback so the dev-stub loop still closes without a microphone.
  - `src/lib/session-log.ts` — append-only `<cwd>/.clara/session-YYYY-MM-DD.log` with `HH:MM:SS role: text` lines; newline-sanitized.
  - `src/lib/backend.ts` — `resolveBackendUrl()` with `--backend` → `CLARA_BACKEND_URL` → `~/.clara/config.json.backendUrl` → default priority; `voiceDevStubEnabled()` reads `CLARA_VOICE_DEV_STUB`.
  - `src/components/FirstRunPrompt.tsx` — full-screen token prompt (links `https://claracode.ai`) shown when `~/.clara/credentials.json` is missing.
  - `src/hooks/useVoice.ts` rewritten — phases (`idle` / `listening` / `transcribing` / `sending`), `startListening` / `stopAndSend` / `cancel` / `sendText` API, abortable STT and gateway calls, optional `onTranscript` callback.
  - `src/tui.tsx` — `Ctrl+Space` primary toggle (`Ctrl+M` alias for NUL-eating terminals), `Escape` cancels mid-phase, first-run prompt gating, session logging on every message, unified `phaseLabel` placeholder, fixed broken `<VoiceWave />` reference (now `<CliVoiceBar />`).
  - `src/commands/tui.tsx` — new `--backend` flag; launch no longer hard-fails on missing gateway (first-run prompt still renders so the user can paste their token); `launchTui` exported for reuse.
  - `src/index.ts` — default action (no subcommand) launches the TUI so `clara` = `clara tui`; matches the `npx claracode@latest` zero-config AC.
  - `src/lib/gateway.ts` — returns a structured `GatewayResult` with `fixHint` when `gatewayUrl` is empty instead of crashing on `fetch("")`.
  - `src/lib/config-store.ts` — `backendUrl` field added to `ClaraConfig`.
- **Test suite** — new `node --test` + `tsx` harness (`npm test -w @clara/cli`): 16 cases in `test/stt-client.test.ts` (5), `test/session-log.test.ts` (4), `test/audio-capture.test.ts` (2), `test/backend.test.ts` (5).

### Known issues

- `ink@^5.0.1` + `react-reconciler@0.29.x` crash on React 19 at TUI boot (`Cannot read properties of undefined (reading 'ReactCurrentOwner')`). Pre-existing; does not affect the PR #2 unit tests (which do not boot Ink). Upgrade to `ink@^7.0.1` is tracked as a follow-up before PR #3. Documented in `docs/cli-voice-loop.md`.

### Fixed

- Removed duplicate `tui` subcommand in `src/index.ts` that called Ink `render`/`React`/`App` without imports; `registerTuiCommand` in `commands/tui.tsx` is the single registration.
- Removed duplicate `@types/react` key in `package.json` devDependencies.

### Changed

- `greet` and `tui` no longer embed default deployment URLs; set `CLARA_VOICE_URL` / `HERMES_GATEWAY_URL` (or `gatewayUrl` in `~/.clara/config.json` for TUI) before use.
- Build no longer fails on `tsup: command not found` when the monorepo lockfile and `npm install` are in sync (see root `CHANGELOG.md`).
