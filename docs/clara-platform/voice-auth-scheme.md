# Voice auth scheme (edge-side summary)

The full spec lives in the `claraagents` repo at
`docs/clara-platform/voice-auth-scheme.md`. This file summarizes the edge
(backend) obligations for the clara-code side and is kept intentionally short
so the two don't drift.

## Decision: Option B (internal API key swap)

**Per cp-team handoff, 2026-04-19.** Ratified. Zero Modal changes.

```
┌──────────┐  Clerk JWT       ┌──────────────────┐  Bearer HERMES_API_KEY   ┌─────────────────┐
│ CLI / IDE├─────────────────▶│ clara-code edge  │─────────────────────────▶│ Modal / Hermes  │
│          │  sk-clara-…      │ (this repo)      │                          │ (cp-team repo)  │
└──────────┘                  └──────────────────┘                          └─────────────────┘
                                     │
                                     ├─ validates user token (requireClaraOrClerk)
                                     ├─ swaps in HERMES_API_KEY
                                     └─ forwards to HERMES_GATEWAY_URL/voice/{stt,tts}
```

## Edge obligations (this repo)

Implemented in [`backend/src/routes/voice.ts`](../../backend/src/routes/voice.ts).

1. Validate the caller's Clerk JWT or `sk-clara-…` / `cc_live_…` key via the
   existing `requireClaraOrClerk` middleware. Reject before any proxy call.
2. On real-mode `/api/voice/stt` and `/api/voice/tts`, POST to
   `${HERMES_GATEWAY_URL}/voice/stt` and `${HERMES_GATEWAY_URL}/voice/tts`
   respectively, with `Authorization: Bearer ${HERMES_API_KEY}`.
3. Refuse to call Modal if `HERMES_API_KEY` is not set (return 503). Do **not**
   fall back to an anonymous call.
4. Use a request timeout ≥ 120 s so cold-starts don't abort prematurely; the
   current value is 150 s (`HERMES_TIMEOUT_MS`).
5. Strip / ignore any `Authorization` header on the incoming request when
   building the outbound request. Never echo the user's token to Modal.

## Configuration source

Both values are populated by cp-team in AWS SSM (us-east-1) and injected into
the ECS task as env vars:

| SSM parameter                       | Type         | Env var              |
|-------------------------------------|--------------|----------------------|
| `/clara-code/HERMES_GATEWAY_URL`    | String       | `HERMES_GATEWAY_URL` |
| `/clara-code/HERMES_API_KEY`        | SecureString | `HERMES_API_KEY`     |

`/clara-code/HERMES_API_KEY` mirrors `/quik-nation/shared/CLARA_VOICE_API_KEY`,
which is also injected into Modal via `clara-voice-secrets` on the cp-team side.

## Cold-start behaviour

Modal A10G scales to zero. First request after idle loads Whisper + XTTS (60–
120 s). The CLI surfaces a "warming up…" message after 4 s (see
[`cli-voice-loop.md`](../cli-voice-loop.md)). Pre-warm before demos.

## Dev mode

`CLARA_VOICE_DEV_STUB=1` short-circuits the proxy entirely — neither
`HERMES_GATEWAY_URL` nor `HERMES_API_KEY` is required. The stub is documented
in [`voice-dev-stub.md`](../voice-dev-stub.md). Never set the stub flag in
production.

## Tests covering this contract

`backend/src/__tests__/routes/voice.test.ts`:

- `/stt` proxies to `/voice/stt` with `Authorization: Bearer test-hermes-key`
  and a ≥ 120 s timeout.
- `/stt` → 503 when `HERMES_API_KEY` is missing; axios is not called.
- `/tts` proxies to `/voice/tts` with the same bearer and timeout.
- `/tts` → 503 when `HERMES_API_KEY` is missing; axios is not called.
- `/tts` → 503 when no voice URL is configured.
