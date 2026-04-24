# Heru → Clara Voice Server Integration

**Audience:** Engineers wiring any Heru product (clara-code, claraagents, seekingtalent, quikcarrental, kls, wcr, quiknation, etc.) to Clara's voice infrastructure.

**What you get:** Audio in → STT → DeepSeek V3.2 reply → Clara Villarosa's actual cloned voice → audio out. Single round-trip, ~2s warm, ~15s cold.

---

## TL;DR

```http
POST https://voice.<your-heru-domain>/voice/converse
Authorization: Bearer $CLARA_VOICE_API_KEY
Content-Type: application/json

{ "audio_base64": "<WAV/MP3/WebM base64>", "voice_id": "clara" }
```

→ returns `{ transcript, response_text, audio_base64 (MP3), stt_duration_ms, tts_duration_ms, ... }`

---

## Architecture

```
┌─────────────────┐        ┌──────────────────────┐        ┌────────────────────┐
│  Heru Frontend  │  HTTPS │  Heru Express        │  HTTPS │ voice.<heru>.com   │
│  (Next.js)      │ ──────▶│  Backend             │ ──────▶│ (Cloudflare Worker)│
│                 │        │  /api/voice/converse │        │                    │
│  Ctrl+Space →   │        │  + Clerk auth        │        │  Adds API key      │
│  MediaRecorder  │        │  + injects API key   │        │  Forwards to Modal │
└─────────────────┘        └──────────────────────┘        └─────────┬──────────┘
                                                                      │
                                                                      ▼
                                                  ┌─────────────────────────────────┐
                                                  │  Modal: clara-voice-server      │
                                                  │  Whisper-large-v3 (STT)         │
                                                  │  → DeepSeek V3.2 (Bedrock)      │
                                                  │  → XTTS v2 (Clara's voice)      │
                                                  │  A10 GPU, scale-to-zero         │
                                                  └─────────────────────────────────┘
```

**Three layers, three reasons:**

| Layer | Why it exists |
|-------|---------------|
| **Frontend → Heru backend** | Frontend never touches `CLARA_VOICE_API_KEY`. Clerk JWT proves the user is paid. |
| **Heru backend → voice.<heru>.com** | Backend injects `CLARA_VOICE_API_KEY` (from SSM/env). Clean separation. |
| **voice.<heru>.com → Modal** | Cloudflare Worker hides Modal URL. Lets us swap voice infra without touching any Heru code. |

---

## Step 1 — Pick your endpoint

### Option A: Branded subdomain (recommended)

If your Heru's domain is on Cloudflare, request a branded subdomain:

| Heru | Voice URL |
|------|-----------|
| Clara Code | `https://voice.claracode.ai` |
| Clara Agents | `https://voice.claraagents.com` |
| Quik Nation | `https://voice.quiknation.com` |
| Seeking Talent | `https://voice.seekingtalent.com` |
| (any other CF-hosted Heru) | `https://voice.<your-domain>` |

**Why:** clean URL, hides Modal, lets us rotate backends without your code changing.

### Option B: Canonical URL (works for any Heru)

If your domain isn't on Cloudflare, use the universal endpoint:

```
https://voice.quiknation.com  (canonical — proxies to Modal under the hood)
```

Identical API, just a different hostname. The `voice.quiknation.com` URL is the source of truth.

### Option C: Direct Modal (NOT recommended)

```
https://info-24346--clara-voice-server-voiceserver-fastapi-app.modal.run
```

Works, but: exposes that you're on Modal, locks the URL into your code, no way to swap infra later. **Don't use this in any committed code.** Test only.

---

## Step 2 — Get the API key

Stored in SSM as a SecureString:

```bash
aws ssm get-parameter \
  --name '/quik-nation/shared/CLARA_VOICE_API_KEY' \
  --with-decryption \
  --query 'Parameter.Value' \
  --output text \
  --region us-east-1
```

**Hard rules:**
- ✅ Inject server-side from env / SSM in your Express backend
- ✅ Add to ECS task definition `secrets` block (referencing the SSM ARN)
- ❌ NEVER put this key in any frontend bundle, client-side env (`NEXT_PUBLIC_*`), or `.env` checked into git
- ❌ NEVER forward the user's Clerk JWT to the voice server — the voice server uses its own key

---

## Step 3 — Wire your Express backend

Create `backend/src/routes/voice.ts` (or merge into your existing voice router):

```typescript
import express, { Request, Response } from 'express';
import { requireAuth } from '@clerk/express';

const router = express.Router();

const VOICE_SERVER_URL =
  process.env.VOICE_SERVER_URL ?? 'https://voice.quiknation.com';
const CLARA_VOICE_API_KEY = process.env.CLARA_VOICE_API_KEY;

// Require Clerk on all /api/voice routes
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
    if (!upstream.ok) return res.status(upstream.status).json(data);
    return res.json(data);
  } catch (error) {
    console.error('[voice/converse] proxy error:', error);
    return res.status(502).json({ error: 'Voice server unreachable' });
  }
});

router.get('/health', async (_req, res) => {
  try {
    const upstream = await fetch(`${VOICE_SERVER_URL}/voice/health`, {
      signal: AbortSignal.timeout(5000),
    });
    return res.json({ voice_server: await upstream.json() });
  } catch {
    return res.status(503).json({ voice_server: 'unreachable' });
  }
});

export default router;
```

Mount it in `backend/src/app.ts`:
```typescript
import voiceRouter from './routes/voice';
app.use('/api/voice', voiceRouter);
```

---

## Step 4 — Wire your frontend

Two pieces: a hook that captures audio, and a player for the reply.

### `useVoiceCapture.ts`

```typescript
import { useRef, useState, useCallback } from 'react';

interface VoiceConverseResult {
  transcript: string;
  response_text: string;
  audio_base64: string;
  format: string;
  voice_id: string;
  stt_duration_ms: number;
  tts_duration_ms: number;
  engine: string;
}

export function useVoiceCapture(apiBase = '') {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    setError(null);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    chunksRef.current = [];
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorderRef.current = recorder;
    recorder.start();
    setIsRecording(true);
  }, []);

  const stopAndConverse = useCallback(async (
    onResult: (result: VoiceConverseResult) => void
  ) => {
    const recorder = recorderRef.current;
    if (!recorder) return;
    setIsRecording(false);
    setIsProcessing(true);

    await new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
      recorder.stop();
      recorder.stream.getTracks().forEach((t) => t.stop());
    });

    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
    const buf = await blob.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));

    try {
      const res = await fetch(`${apiBase}/api/voice/converse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio_base64: base64, voice_id: 'clara' }),
        credentials: 'include', // Clerk session cookie
      });
      if (!res.ok) throw new Error((await res.json()).error ?? `HTTP ${res.status}`);
      onResult(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Voice request failed');
    } finally {
      setIsProcessing(false);
    }
  }, [apiBase]);

  return { isRecording, isProcessing, error, startRecording, stopAndConverse };
}
```

### `playMp3Base64.ts`

```typescript
export async function playMp3Base64(base64: string): Promise<void> {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  const ctx = new AudioContext();
  const buffer = await ctx.decodeAudioData(bytes.buffer);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  return new Promise((resolve) => {
    source.onended = () => resolve();
    source.start();
  });
}
```

---

## Step 5 — Onboard your Heru's domain (Cloudflare requirement)

**This step only applies if you want a branded `voice.<your-domain>` URL.** If you're using the canonical `voice.quiknation.com`, skip to Step 6.

### Why Cloudflare?

We use a single Cloudflare Worker (`clara-voice-proxy`) that:
1. Receives requests at `voice.<heru-domain>`
2. Forwards them to Modal with the right SNI/Host
3. Hides the Modal URL from DNS lookups
4. Lets us swap voice backends (Modal → own GPU → Fal → whatever) without any Heru changing code

For the Worker to bind a custom hostname, the zone must be in our Cloudflare account.

### Onboarding steps

1. **Confirm your zone is on Cloudflare:**
   ```bash
   dig NS <your-heru-domain> +short
   # Should return *.ns.cloudflare.com
   ```
2. **If not on CF yet:** open a ticket / Slack #devops, request the zone be moved into the Quik Nation Cloudflare account (account ID: `4682eae9d50da54644c8f895ddad984f`).
3. **Once zone is in CF:** request a `voice.<your-domain>` binding on the `clara-voice-proxy` Worker. DNS + SSL is automatic.

---

## Step 6 — Acceptance test

Once your backend is wired and `CLARA_VOICE_API_KEY` is in the env:

```bash
# 1. Get a Clerk JWT for your dev account (browser dev tools or Clerk dashboard)
CLERK_JWT="<your_dev_jwt>"

# 2. Encode any short WAV (the macOS `say` trick works for testing)
say -o /tmp/test.aiff "Hello Clara, who are you?"
afconvert /tmp/test.aiff /tmp/test.wav -d LEI16@22050 -f WAVE
AUDIO_B64=$(base64 -i /tmp/test.wav | tr -d '\n')

# 3. Hit your Heru backend
curl -X POST http://localhost:3031/api/voice/converse \
  -H "Authorization: Bearer $CLERK_JWT" \
  -H "Content-Type: application/json" \
  -d "{\"audio_base64\":\"$AUDIO_B64\",\"voice_id\":\"clara\"}" \
  | python3 -c "import json,sys,base64; r=json.load(sys.stdin); print('Transcript:',r['transcript']); print('Clara:',r['response_text']); open('/tmp/reply.mp3','wb').write(base64.b64decode(r['audio_base64']))"

# 4. Play Clara's reply
afplay /tmp/reply.mp3
```

If you hear Clara Villarosa's voice replying naturally, you're done.

---

## Reference

- **Endpoint contract:** `docs/voice-client.md` (request/response shape, error codes)
- **Latency / behavior:** `docs/voice-behavior.md` (cold ~15s, warm ~2s, rate limits)
- **Voice server source:** `server/voice_server.py` in this repo
- **Live URL:** `https://voice.quiknation.com` (canonical) or your branded subdomain
- **SSM API key:** `/quik-nation/shared/CLARA_VOICE_API_KEY`
- **Modal app dashboard:** https://modal.com/apps/info-24346/main/deployed/clara-voice-server (cp-team / Mo only)

## What NOT to do

- ❌ Do NOT call the Modal URL directly from any committed code
- ❌ Do NOT expose `CLARA_VOICE_API_KEY` in any frontend bundle or `NEXT_PUBLIC_*` env
- ❌ Do NOT forward the user's Clerk JWT to the voice server (it uses its own auth)
- ❌ Do NOT cache voice responses (they're per-user, per-utterance)
- ❌ Do NOT add streaming yet — non-streaming is MVP and the contract above is what's live

## Available voice IDs

`clara` (default, recommended for all Herus), plus 24 historical voices for agent personas:
`annie-easley`, `jerry-lawson`, `skip-ellis`, `roy-clay`, `vince-cullers`, `barbara-proctor`,
`eunice-johnson`, `moss-kendrix`, `don-cornelius`, `melvin-van-peebles`, `gil-scott-heron`,
`ethel-payne`, `romare-bearden`, `claude-barnett`, `dick-gregory`, `aaron-douglas`,
`alonzo-herndon`, `annie-malone`, `biddy-mason`, `david-blackwell`, `james-armistead`,
`matthew-henson`, `peache-kicks`, `solomon-fuller`.

Full live list: `GET https://voice.quiknation.com/voice/voices`
