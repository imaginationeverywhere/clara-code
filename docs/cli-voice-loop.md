# CLI Voice Loop (PR #2 — CLI-first MVP)

This document describes the speech-in → code-change loop implemented in
`packages/cli`. It drives against the backend dev stub from PR #1
(`docs/voice-dev-stub.md`) until `cp-team` delivers the Hermes Modal endpoint.

## The loop

```
Ctrl+Space ──┐
             ▼                                                      
          startCapture() ───► sox / rec (or noop fallback)          
             │                                                      
             ▼ (user speaks; Ctrl+Space again OR Escape)             
          stopAndSend() ───► /api/voice/stt  ◄── dev stub returns    
             │                                 a fixed transcript   
             ▼                                                      
      { transcript } ───► append "user:" bubble, log to session file 
             │                                                      
             ▼                                                      
       claraGateway() ───► Hermes (or 503 "not configured")          
             │                                                      
             ▼                                                      
   { reply, ok, fixHint } ───► assistant bubble, log to session file 
```

## Key bindings

| Key | Effect |
| --- | --- |
| `Ctrl+Space` (or `Ctrl+M` alias) | Toggle listen / send |
| `Escape` | Cancel current phase (discards audio / aborts in-flight request) |
| `Ctrl+Q` | Quit (persists session metadata) |
| `Enter` | Send the typed message (text-first path, unchanged) |

`Ctrl+Space` is the primary binding per the PRD; `Ctrl+M` is kept as an alias
because some terminals deliver Ctrl+Space as `NUL` or eat it entirely.

## First run

If `~/.clara/credentials.json` does not exist, `clara` shows a full-screen
first-run prompt. It explains:

1. Visit `https://claracode.ai` to grab a CLI token (`sk-clara-…` or `cc_live_…`).
2. Paste it.
3. `Esc` to quit.

The token is written to `~/.clara/credentials.json` and reused thereafter.
`clara auth login` still works for scripted re-auth.

## Session transcript

Every session appends to `<cwd>/.clara/session-YYYY-MM-DD.log` with lines like:

```
--- session start 2026-04-19T12:34:56.000Z ---
[12:34:57] user: add a hello world function
[12:34:59] assistant: Done. Added hello() to src/index.ts.
```

The log is project-local on purpose — you get a checkable breadcrumb trail
next to the code Clara touched.

## Env knobs

| Variable | Default | Purpose |
| --- | --- | --- |
| `CLARA_BACKEND_URL` | `https://api.claracode.ai` | Base URL for `/api/voice/stt` and `/api/voice/tts` |
| `CLARA_VOICE_DEV_STUB` | unset | When `1`, CLI forwards `stubText` to the backend and the backend bypasses Modal |
| `HERMES_GATEWAY_URL` | unset | Hermes gateway called after STT produces a transcript |

## Local end-to-end (no hardware, no Modal)

```bash
# Terminal 1 — backend with the stub on
cd backend
CLARA_VOICE_DEV_STUB=1 npm run dev

# Terminal 2 — CLI pointed at local backend
CLARA_BACKEND_URL=http://localhost:3001 \
HERMES_GATEWAY_URL=https://<your-gateway> \
npx tsx packages/cli/src/index.ts
```

On first launch you'll see the token prompt. Paste any test key you've issued
locally (or any string — the backend's stub path ignores the auth contents
when it's the dev stub that's serving). Ctrl+Space to start "listening",
Ctrl+Space again to send. The dev stub returns a default transcript (`"add a
hello world function to this file"`) which the CLI echoes as a `user:`
message and forwards to the gateway.

If `sox`/`rec` is installed (`brew install sox` / `apt install sox`), real
audio is captured and base64'd onto the request. Without sox, the CLI falls
back to an empty-audio noop — the dev stub still returns a transcript, so
the whole loop still works for wiring tests.

## Known issues (out of scope for PR #2)

- **Ink 5 vs React 19 runtime crash** — `packages/cli/package.json` pins
  `ink@^5.0.1` which uses `react-reconciler@0.29.x` and crashes on React 19
  at launch (`Cannot read properties of undefined (reading 'ReactCurrentOwner')`).
  Upgrading to `ink@^7.0.1` is a follow-up that should land before PR #3. This
  is pre-existing and not introduced here; the code paths added in PR #2 are
  validated by `npm test` (which does not boot Ink).
- **Modal endpoint** — blocked on cp-team populating
  `/clara-code/HERMES_GATEWAY_URL` in SSM. PR #3 removes the stub flag.

## Tests

`packages/cli/test/*.test.ts`:

- `stt-client.test.ts` — 5 cases covering happy path, stub header/body
  propagation, error status codes, and abort signals.
- `session-log.test.ts` — 4 cases covering file path, line format, newline
  sanitation, and directory creation.
- `audio-capture.test.ts` — contract tests for `stop()` / `cancel()`.
- `backend.test.ts` — `resolveBackendUrl` priority and `voiceDevStubEnabled`.

Run `npm test -w @clara/cli`.
