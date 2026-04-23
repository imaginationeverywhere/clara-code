---
title: "Wire /voice/converse into the Express backend — proxy route + auth injection"
team: Clara Code Team
agent: Miles (Backend)
priority: P0
repo: imaginationeverywhere/clara-code
estimated_loe: 45 min
depends_on: none
blocks: 06-motley-wire-voice-bar-to-converse
source: quikvoice develop ed19194 — cp-team handoff 2026-04-23
---

# Wire /voice/converse into the Clara Code Backend

## Context

The cp-team (quikvoice repo) has shipped `POST /voice/converse` — the single-round-trip
voice endpoint the Clara Code IDE voice bar (Ctrl+Space) will use. The code is on
`imaginationeverywhere/quikvoice` develop branch (`ed19194`), awaiting Mo's `modal deploy`
approval.

The endpoint takes base64 audio in, runs Whisper STT → DeepSeek V3.2 on Bedrock → XTTS v2,
and returns base64 MP3 of Clara's voice replying. Full round-trip in ~2s warm, ~20s cold.

**The IDE must NEVER hold `CLARA_VOICE_API_KEY` directly.** The key lives in SSM and must
be injected server-side. Your job is to add a proxy route in the Express backend.

## The Voice Server

```
Base URL: https://info-24346--clara-voice-server-voiceserver-fastapi-app.modal.run
Auth:     X-Clara-Voice-Key: $CLARA_VOICE_API_KEY
          (from SSM: /quik-nation/platform/CLARA_VOICE_API_KEY)
```

## Step 1 — Add CLARA_VOICE_API_KEY to backend environment

The key is in SSM. In production (ECS Fargate), inject it as an environment variable.
For local dev, add to `.env.local` (never commit).

```bash
# Fetch from SSM for local dev
aws ssm get-parameter \
  --name '/quik-nation/platform/CLARA_VOICE_API_KEY' \
  --with-decryption \
  --query 'Parameter.Value' \
  --output text \
  --region us-east-1
# Add result to backend/.env.local as CLARA_VOICE_API_KEY=<value>
```

In ECS task definition, add the SecureString reference to the task's `secrets` block
(if not already there). SSM parameter path: `/quik-nation/platform/CLARA_VOICE_API_KEY`.

## Step 2 — Add `/api/voice/converse` proxy route

Create `backend/src/routes/voice.ts` (or add to existing voice router if one exists):

```typescript
import express, { Request, Response } from 'express';
import { requireAuth } from '@clerk/express';

const router = express.Router();

const VOICE_SERVER_URL = process.env.VOICE_SERVER_URL
  ?? 'https://info-24346--clara-voice-server-voiceserver-fastapi-app.modal.run';
const CLARA_VOICE_API_KEY = process.env.CLARA_VOICE_API_KEY;

// Require Clerk auth on all /api/voice routes
router.use(requireAuth());

router.post('/converse', async (req: Request, res: Response) => {
  if (!CLARA_VOICE_API_KEY) {
    return res.status(503).json({ error: 'Voice service not configured' });
  }

  const { audio_base64, voice_id = 'clara', history = [], max_tokens = 300 } = req.body;

  if (!audio_base64) {
    return res.status(400).json({ error: 'audio_base64 is required' });
  }

  try {
    const upstream = await fetch(`${VOICE_SERVER_URL}/voice/converse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CLARA_VOICE_API_KEY}`,
      },
      body: JSON.stringify({ audio_base64, voice_id, history, max_tokens }),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return res.status(upstream.status).json(data);
    }

    return res.json(data);
  } catch (error) {
    console.error('[voice/converse] proxy error:', error);
    return res.status(502).json({ error: 'Voice server unreachable' });
  }
});

export default router;
```

Mount it in `backend/src/app.ts` (or wherever voice routes are registered):

```typescript
import voiceRouter from './routes/voice';
app.use('/api/voice', voiceRouter);
```

## Step 3 — Add VOICE_SERVER_URL to environment config

Add `VOICE_SERVER_URL` to:
- `.env.example` (with the Modal base URL as default)
- ECS task definition environment (optional — defaults to Modal URL)

This allows swapping the voice backend without code changes.

## Step 4 — Wire the health check

The voice server has `GET /voice/health` (no auth required). Add it to the backend's
health endpoint or as a dependency check:

```typescript
router.get('/health', async (_req: Request, res: Response) => {
  try {
    const upstream = await fetch(`${VOICE_SERVER_URL}/voice/health`, {
      signal: AbortSignal.timeout(5000),
    });
    const data = await upstream.json();
    return res.json({ voice_server: data });
  } catch {
    return res.status(503).json({ voice_server: 'unreachable' });
  }
});
```

## Step 5 — Commit

```bash
git add backend/src/routes/voice.ts backend/src/app.ts
git commit -m "feat(backend): add /api/voice/converse proxy route — injects CLARA_VOICE_API_KEY server-side

- POST /api/voice/converse: proxies to Modal voice server
- Clerk auth required (requireAuth middleware)
- CLARA_VOICE_API_KEY injected server-side from env (never exposed to client)
- GET /api/voice/health: upstreams to Modal /voice/health
- VOICE_SERVER_URL configurable via env (defaults to Modal base URL)"
```

## Acceptance Criteria

- [ ] `POST /api/voice/converse` exists in Express router
- [ ] Route requires Clerk JWT auth (`requireAuth()`)
- [ ] `CLARA_VOICE_API_KEY` is injected server-side from `process.env` — NOT from client request
- [ ] `CLARA_VOICE_API_KEY` is NOT in any committed `.env` file
- [ ] Route proxies body fields: `audio_base64`, `voice_id`, `history`, `max_tokens`
- [ ] 400 returned if `audio_base64` missing
- [ ] 502 returned (with log) if upstream is unreachable
- [ ] `GET /api/voice/health` proxies to `/voice/health`
- [ ] `VOICE_SERVER_URL` added to `.env.example`
- [ ] Commit on feature branch, PR targeting develop

## What NOT To Do

- Do NOT put `CLARA_VOICE_API_KEY` in any `.env` committed to git
- Do NOT forward the client's Clerk JWT to the voice server (the voice server uses its own key)
- Do NOT modify the voice server code (that's in quikvoice, not here)
- Do NOT add streaming yet — non-streaming fallback is correct for MVP
- Do NOT deploy to ECS — that's a separate gate

## Curl Test (local, requires ngrok running)

```bash
# 1. Get API key from SSM
CLARA_VOICE_API_KEY=$(aws ssm get-parameter \
  --name '/quik-nation/platform/CLARA_VOICE_API_KEY' \
  --with-decryption --query 'Parameter.Value' --output text --region us-east-1)

# 2. Get a Clerk JWT for your dev account (from browser dev tools / Clerk dashboard)
CLERK_JWT="<your_dev_jwt>"

# 3. Encode a WAV file
AUDIO_B64=$(base64 -i /path/to/test.wav | tr -d '\n')

# 4. Test the proxy
curl -X POST http://localhost:3031/api/voice/converse \
  -H "Authorization: Bearer $CLERK_JWT" \
  -H "Content-Type: application/json" \
  -d "{\"audio_base64\": \"$AUDIO_B64\", \"voice_id\": \"clara\"}" \
  | python3 -c "import json,sys,base64; r=json.load(sys.stdin); print('Transcript:', r['transcript']); print('Reply:', r['response_text']); open('/tmp/reply.mp3','wb').write(base64.b64decode(r['audio_base64']))"

# 5. Play Clara's reply
afplay /tmp/reply.mp3
```

## Reference

- Voice server source: `imaginationeverywhere/quikvoice` — `server/voice_server.py`
- Client TypeScript snippet: `quikvoice/docs/voice-client.md`
- Latency docs: `quikvoice/docs/voice-behavior.md` (cold ~15s, warm ~2s)
- Live server URL (after modal deploy): https://info-24346--clara-voice-server-voiceserver-fastapi-app.modal.run
