# Voice Dev Stub (PR #1 — CLI-first MVP)

The CLI voice loop (`packages/coding-agent`) needs a real HTTP surface to build
against while the Hermes/Modal voice endpoint is still being provisioned by
`cp-team`. This document describes the stub we landed in the backend so that
CLI work can proceed without being hard-blocked.

## Endpoints

Both endpoints are mounted under `/api/voice` and use the standard Clara auth
middleware (`requireClaraOrClerk`): a Bearer token that is either a Clerk
session JWT or a `sk-clara-…` / `cc_live_…` API key.

### `POST /api/voice/stt`

Speech-to-text.

**Real mode** (default) proxies to `${HERMES_GATEWAY_URL}/stt` with:

```json
{ "audio_base64": "<base64>", "mime_type": "audio/wav" }
```

and returns `{ "transcript": "...", "stub": false }`.

**Dev stub** (`CLARA_VOICE_DEV_STUB=1`) does **not** call Modal. It returns a
mock transcript chosen in this order:

1. `x-clara-stub-text` request header
2. `stubText` field on the JSON body
3. Default fallback: `"add a hello world function to this file"`

Response shape: `{ "transcript": "...", "stub": true }`.

This lets the CLI exercise the full listen → send-audio → render-transcript →
apply-diff loop deterministically.

### `POST /api/voice/tts`

Text-to-speech.

Request body: `{ "text": "...", "voice_id"?: "clara" }` (400 if `text` missing).

**Real mode** proxies to `${HERMES_GATEWAY_URL}/tts` and returns the raw
`audio/wav` body from Hermes.

**Dev stub** returns a 1-second silence WAV (16-bit PCM mono, 8 kHz) with the
header `x-clara-voice-stub: 1`. Enough to feed a speaker pipeline; nothing
audible, which keeps dev loops quiet.

## URL resolution

`HERMES_GATEWAY_URL` (preferred) → `CLARA_VOICE_URL` (legacy fallback) → 503.

The stub flag short-circuits this resolution entirely.

## Local CLI workflow

```bash
# Terminal 1 — backend
cd backend
CLARA_VOICE_DEV_STUB=1 npm run dev

# Terminal 2 — CLI (once PR #2 lands)
clara
# Press ctrl+space, say anything; the CLI will POST to /api/voice/stt,
# receive the default stub transcript, and apply the diff pipeline.
```

## Removing the stub

When `cp-team` delivers the Modal endpoint and SSM parameter, PR #3 deletes
the `voiceDevStubEnabled()` branches in `backend/src/routes/voice.ts`. Nothing
outside that file depends on the stub, so the diff will be localized.

## Tests

See `backend/src/__tests__/routes/voice.test.ts`:

- `dev stub (CLARA_VOICE_DEV_STUB=1)` — 5 cases
- `real mode (no stub)` — 4 cases (including the 503 path)
