# Voice: dev stub + Hermes wire-up (PR #1 → PR #3)

The CLI voice loop (`packages/cli`) needs a real HTTP surface to build against.
`cp-team` owns the Hermes/Modal voice server; this service owns the edge
(`backend/src/routes/voice.ts`) that fronts it.

This doc covers both layers:

- **Dev stub** — `CLARA_VOICE_DEV_STUB=1` short-circuits Modal entirely for local
  development (no GPU cost, no network, no cold-starts).
- **Real mode** — the production wire-up to Modal via `HERMES_GATEWAY_URL` +
  `HERMES_API_KEY`. Landed in PR #3.

Full auth/ownership spec lives in
[`docs/clara-platform/voice-auth-scheme.md`](./clara-platform/voice-auth-scheme.md).

## Endpoints

Both endpoints are mounted under `/api/voice` and use the standard Clara auth
middleware (`requireClaraOrClerk`): a Bearer token that is either a Clerk
session JWT or a `sk-clara-…` / `cc_live_…` API key.

### `POST /api/voice/stt`

Speech-to-text.

**Real mode** (default) proxies to `${HERMES_GATEWAY_URL}/voice/stt` with:

```http
POST ${HERMES_GATEWAY_URL}/voice/stt
Authorization: Bearer ${HERMES_API_KEY}
Content-Type: application/json

{ "audio_base64": "<base64>", "mime_type": "audio/wav" }
```

and returns `{ "transcript": "...", "stub": false }`.

**Dev stub** (`CLARA_VOICE_DEV_STUB=1`) does **not** call Modal. It returns a
mock transcript chosen in this order:

1. `x-clara-stub-text` request header
2. `stubText` field on the JSON body
3. Default fallback: `"add a hello world function to this file"`

Response shape: `{ "transcript": "...", "stub": true }`.

### `POST /api/voice/tts`

Text-to-speech.

Request body: `{ "text": "...", "voice_id"?: "clara" }` (400 if `text` missing).

**Real mode** proxies to `${HERMES_GATEWAY_URL}/voice/tts` with the same
`Authorization: Bearer ${HERMES_API_KEY}` header and returns the raw `audio/wav`
body from Hermes.

**Dev stub** returns a 1-second silence WAV (16-bit PCM mono, 8 kHz) with the
header `x-clara-voice-stub: 1`.

## Auth scheme (Option B)

The CLI/web client sends its user token (Clerk JWT or `sk-clara-`) to this
service. This service:

1. validates the user token (`requireClaraOrClerk`),
2. **swaps it out** for the internal `HERMES_API_KEY`,
3. forwards to Modal with `Authorization: Bearer ${HERMES_API_KEY}`.

Modal never sees user tokens. See
[`voice-auth-scheme.md`](./clara-platform/voice-auth-scheme.md) for the full
rationale and cp-team handoff notes.

## URL & key resolution

| Var                  | Source                                          | Required        |
|----------------------|-------------------------------------------------|-----------------|
| `HERMES_GATEWAY_URL` | SSM `/clara-code/HERMES_GATEWAY_URL`            | real mode       |
| `HERMES_API_KEY`     | SSM `/clara-code/HERMES_API_KEY` (SecureString) | real mode       |
| `CLARA_VOICE_URL`    | SSM `/clara-code/CLARA_VOICE_URL`               | legacy fallback |

Resolution order for the base URL: `HERMES_GATEWAY_URL` → `CLARA_VOICE_URL` → 503.

In real mode, **`HERMES_API_KEY` is required**. If it is missing while
`HERMES_GATEWAY_URL` is set, the routes respond `503 Voice service is not
available` (and log the misconfiguration) rather than call Modal anonymously.

The `CLARA_VOICE_DEV_STUB=1` flag short-circuits both of these — no key or URL
is needed.

## Cold-start (Modal A10G)

Modal scales the voice container to zero when idle. First request after idle
loads Whisper + XTTS, which takes **60–120 s**. Two consequences:

- **Timeout.** The axios calls to Hermes use a **150 s** timeout (`HERMES_TIMEOUT_MS`
  in `voice.ts`) so axios doesn't bail before Modal finishes warming.
- **UX.** The CLI's `useVoice` hook starts a 4 s warmup timer; if `/stt` hasn't
  responded by then, the input bar flips to `warming up Clara's voice model
  (cold start, up to ~2m)…`. See `docs/cli-voice-loop.md` for the full UX flow.

Pre-warm before a sprint demo by hitting `/voice/tts` with trivial text ~2 min
before you go live.

## Local CLI workflow

### Against the stub (no Modal, no network)

```bash
# Terminal 1 — backend
cd backend
CLARA_VOICE_DEV_STUB=1 npm run dev

# Terminal 2 — CLI
clara
# Press ctrl+space, speak (or don't); /api/voice/stt returns the default
# stub transcript and we drive the diff pipeline from there.
```

### Against real Modal (staging)

```bash
cd backend
HERMES_GATEWAY_URL=https://info-24346--clara-voice-server-voiceserver-fastapi-app.modal.run \
HERMES_API_KEY=... \
npm run dev
```

In production, both values come from SSM via the ECS task definition env vars —
no `.env` needed.

## Tests

See `backend/src/__tests__/routes/voice.test.ts`:

- **Dev stub (`CLARA_VOICE_DEV_STUB=1`)** — 5 cases (header priority, body
  fallback, default, silence WAV, missing-text 400).
- **Real mode** — 6 cases:
  - `/stt` proxies to `/voice/stt` with `Bearer HERMES_API_KEY` and cold-start timeout
  - `/stt` 503 when `HERMES_API_KEY` is missing
  - `/stt` 400 when `audioBase64` is missing
  - `/tts` proxies to `/voice/tts` with Bearer + timeout
  - `/tts` 503 when no voice URL is configured
  - `/tts` 503 when `HERMES_API_KEY` is missing
