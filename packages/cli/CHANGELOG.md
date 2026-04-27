# Changelog

## [Unreleased]

### Added

- **`clara login` + `clara doctor`** — Loopback HTTP server on `127.0.0.1` (random port) + `https://claracode.ai/cli-auth?cli_port=…`; callback POST body `{ email, sessionToken, apiKey }` (aliases: `session_token`, `api_key`). Credentials stored with **keytar** (`clara-code` / `default`), not `~/.clara/credentials.json` (legacy file migrated once). Hidden `clara auth login` delegates to the same flow. `lib/agents-api` uses `pickBearerToken()` (API key vs session). Tests: `test/login-loopback.test.ts`.

- **Customer brain (constitutional IP)** — `clara the-brain` subcommand (blocks `quiknation` target; default `brain-api.claracode.ai`); `.claude/commands/the-brain-customer.md` for Cursor; `mcp-brain-customer.example.json` (customer JWT + `CLARA_BRAIN_URL`); `package.json` `files` includes `.claude` and the example. Release gate: `scripts/verify-customer-brain-ship.mjs` (forbidden `brain-api.quiknation.com` and founder command marker in shipped CLI; `--vsix-only` for VSIX in `clara-code-ide.yml`). Spec: `docs/architecture/BRAIN_API_ACCESS_CONTROL.md`. Tests: `test/the-brain.test.ts`.

- **`clara config-agent` / `clara configure-agent`** — interactive template → name → voice (library or 5s `captureVoiceSample`) → skills; calls `GET /api/agents/templates` and `POST /api/agents/configure` via `lib/agents-api.ts`. `prompts` dependency. Voice doc string in `src/voice/config-agent-flow.ts` for future `/api/voice/converse` handoff.

- **Per-day voice session** — `buildSessionId(userId, agentId)` in `lib/canonical-greeting.ts` (`{userId}-{agentId}-YYYY-MM-DD`); `voice-converse` app reads `userId` from `~/.clara` config, passes `agent_id`, `session_id`, and `surface` in `postVoiceConverse` and `playCanonicalGreeting` options (aligned with backend memory).

### Changed

- **Package version** — `0.1.2` → **`0.1.3`** (`clara login` / `clara doctor` / OS keyring; see **Added** in **Unreleased** above).
- **Package version** — `0.1.1` → **`0.1.2`** (`clara the-brain` customer wrapper, MCP example, release gate; see **Added** in **Unreleased** above).
- **Package version** — `0.1.0` → **`0.1.1`** (`clara config-agent` and `agents-api`; see **Added** above).

- **Default voice service URL** — `CLARA_VOICE_URL` is optional: empty/unset → `https://api.claracode.ai/api` in `voice-converse-app.tsx` and `lib/canonical-greeting.ts` so greet/converse work on fresh install without env.
- **TUI** — `HERMES_GATEWAY_URL` → `CLARA_GATEWAY_URL`; default gateway `https://api.claracode.ai/api` when not in env or `~/.clara/config.json`. `clara tui` is voice-on by default; `--no-voice` for text-only. `lib/gateway.ts` fix text references `CLARA_GATEWAY_URL`.
- **Canonical greeting** — `lib/canonical-greeting.ts` continues to use `postVoiceConverse` + TTS; tests updated in `test/lib/canonical-greeting.test.ts` (`greet` delegates to `playCanonicalGreeting`).

### Added

- **Tests (PR #03 follow-up)** — `test/lib/canonical-greeting.test.ts` covers `playCanonicalGreeting` (cache, `/voice/converse`, `/voice/respond`, `refresh` opt-in) via injectable `deps` on the greeting API.
- **Default: `/voice/converse` voice mode** — `clara` with no subcommand runs `playCanonicalGreeting` then an Ink screen for push-to-turn (Space to start `sox` capture, Space to stop and `postVoiceConverse` with the same `session_id`). TUI: `clara tui` (unchanged). `src/launch-voice-converse.ts`, `src/voice-converse-app.tsx`, `lib/canonical-greeting.ts` shared with `greet`.
- **npm: public package name `clara`** — unscoped `name: "clara"`, `publishConfig.access: "public"`, `repository` in `package.json` for `npm i -g clara@latest`.

- **`@imaginationeverywhere/clara-voice-client` + `greet` cache** — `clara greet` uses shared `readGreetingFromCache` / `writeGreetingToCache` and `CLARA_VOICE_URL` → `…/voice/respond` (see `packages/clara-voice-client/README.md`). Dependency: `workspace:*` on the new package.

- **Cold-start "warming up…" UX (PR #3 of CLI-first MVP)** — `src/hooks/useVoice.ts` now exposes `warming: boolean`. A 4 s timer arms when `/api/voice/stt` is first called; if no response by then, the input bar in `src/tui.tsx` flips to `warming up Clara's voice model (cold start, up to ~2m)…` so first-hit-after-idle doesn't look frozen. The threshold is driven by cp-team's handoff note that Modal's A10G scales to zero and Whisper+XTTS cold-load takes 60–120 s. `Escape` still aborts mid-warmup. `phaseLabel()` signature gains a `warming` param. No new env vars; no CLI-side changes to auth (the `HERMES_API_KEY` swap happens at the backend edge per Option B).
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
- **Test suite** — new `node --test` + `tsx` harness (`npm test` from `packages/cli`, or `npm test -w clara` from repo root): 16 cases in `test/stt-client.test.ts` (5), `test/session-log.test.ts` (4), `test/audio-capture.test.ts` (2), `test/backend.test.ts` (5).

### Fixed

- **PR #03 review (TypeScript)** — Removed `// @ts-nocheck` from `src/voice-converse-app.tsx`; `useInput` uses the single-character space check (`input === " "`) for Ink 6+ (no `key.space` flag on `Key`). `ConverseResult` is used in the converse round-trip.
- **Ink upgrade (PR #4 of CLI-first MVP)** — `ink@^5.0.1` → `ink@^6.8.0`. Fixes the React 19 boot crash (`Cannot read properties of undefined (reading 'ReactCurrentOwner')`) that prevented the TUI from mounting. Verified end-to-end via `tmux new-session -d -s clara-boot -x 100 -y 30 && npx tsx src/index.ts tui` — the `FirstRunPrompt` now renders without any stack trace. React bumped `^19.0.0` → `^19.2.0` to match Ink 6's peer requirement (`react >= 19.0.0`, already resolved to 19.2.5 by the monorepo lockfile). We deliberately did **not** jump to `ink@7` because it requires Node 22 at runtime, which would break `npx claracode@latest` on any Node 20 installation — Ink 6 matches our Node 20 floor. The Node 22 / Ink 7 bump is a future task once we raise `engines.node` accordingly.
- **`engines.node` in manifest** — `package.json` now declares `engines.node` `>=20.0.0` so npm/npx warns on incompatible Node versions before obscure runtime failures (follow-up to PR #4 code review).
- Removed duplicate `tui` subcommand in `src/index.ts` that called Ink `render`/`React`/`App` without imports; `registerTuiCommand` in `commands/tui.tsx` is the single registration.
- Removed duplicate `@types/react` key in `package.json` devDependencies.

### Changed

- **`greet` implementation** — `src/commands/greet.ts` delegates to `playCanonicalGreeting` in `lib/canonical-greeting.ts`.
- **`clara greet` prefers `POST /voice/converse`** — `greet` calls `postVoiceConverse` from `@imaginationeverywhere/clara-voice-client` first; when the response includes `reply_audio_base64`, audio is played and the canonical greeting cache is updated. Optional `CLARA_VOICE_API_KEY` sets the Bearer token for the converse endpoint. If the converse path returns no audio or errors, the command **falls back** to legacy `POST …/voice/respond` (unchanged body) so existing deployments keep working until quikvoice is fully wired.
- `greet` and `tui` no longer embed default deployment URLs; set `CLARA_VOICE_URL` / `HERMES_GATEWAY_URL` (or `gatewayUrl` in `~/.clara/config.json` for TUI) before use.
- Build no longer fails on `tsup: command not found` when the monorepo lockfile and `npm install` are in sync (see root `CHANGELOG.md`).
