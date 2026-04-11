# Prompt 03 — Voice Proxy API Route
**Author:** Miles (Backend Engineer, Clara Code Team)
**Task:** POST /api/voice/greet — proxy to Modal TTS
**Machine:** Local (Cursor swarm)
**Priority:** P1 — Needed for voice CTA on landing page and dashboard

---

## Context

The Clara voice server is LIVE on Modal. We need a Next.js API route that proxies text → speech
so the landing page mic button can play Clara's greeting voice.

**Modal TTS endpoint:**
`https://info-24346--clara-voice-server-voiceserver-fastapi-app.modal.run/voice/tts`

**VRD-001 greeting text:** "Hey, welcome. I'm Clara — what are you building?"

The route lives at `packages/web-ui/app/api/voice/` and runs on the Edge runtime (Cloudflare Pages).

---

## Files to Create

### `packages/web-ui/src/app/api/voice/greet/route.ts`

```typescript
export const runtime = 'edge'

const VOICE_TTS_URL =
  'https://info-24346--clara-voice-server-voiceserver-fastapi-app.modal.run/voice/tts'

const GREETING = "Hey, welcome. I'm Clara — what are you building?"

export async function GET() {
  try {
    const response = await fetch(VOICE_TTS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: GREETING, voice_id: 'clara' }),
    })

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: 'Voice server unavailable' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Stream the audio back to the client
    const audioBlob = await response.arrayBuffer()
    return new Response(audioBlob, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Cache-Control': 'public, max-age=3600', // Cache greeting for 1 hour
      },
    })
  } catch {
    return new Response(
      JSON.stringify({ error: 'Voice server unavailable' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const text: string = body.text ?? GREETING

    // Limit text length
    if (text.length > 500) {
      return new Response(
        JSON.stringify({ error: 'Text too long (max 500 chars)' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const response = await fetch(VOICE_TTS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice_id: 'clara' }),
    })

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: 'Voice server unavailable' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const audioBlob = await response.arrayBuffer()
    return new Response(audioBlob, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
      },
    })
  } catch {
    return new Response(
      JSON.stringify({ error: 'Voice server unavailable' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
```

---

## Usage (from client components)

```typescript
// Play Clara's greeting on page load or mic click
async function playGreeting() {
  const res = await fetch('/api/voice/greet')
  if (!res.ok) return // fail silently — voice is enhancement, not critical
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const audio = new Audio(url)
  audio.play()
  audio.onended = () => URL.revokeObjectURL(url)
}

// POST with custom text
async function speak(text: string) {
  const res = await fetch('/api/voice/greet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
  if (!res.ok) return
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const audio = new Audio(url)
  audio.play()
  audio.onended = () => URL.revokeObjectURL(url)
}
```

---

## Wire Into Hero (Optional — do if time allows)

In `packages/web-ui/src/components/marketing/HeroSection.tsx`, add a click handler to
the mic button that calls `playGreeting()`:

```typescript
'use client'
// Add to the mic button's onClick:
// onClick={playGreeting}
// Where playGreeting is the function above
```

If the voice server is down, fail silently. The mic button still renders — it just doesn't play audio.

---

## Notes

- `export const runtime = 'edge'` is required — this runs on Cloudflare Pages
- The Modal TTS server may be cold-started (first request can take ~3-5s) — this is expected
- No auth required on this route (landing page is public)
- Cache-Control on GET route: 1 hour (greeting text never changes)
- Do NOT expose the Modal URL in client-side code — always proxy through this API route

---

## Acceptance Criteria

- [ ] `GET /api/voice/greet` returns audio/wav with Clara's greeting
- [ ] `POST /api/voice/greet` with `{ text: "Hello" }` returns audio/wav
- [ ] `POST /api/voice/greet` with text > 500 chars returns 400
- [ ] Voice server failure returns 503 (not 500)
- [ ] No Modal URL exposed in any client-side code
- [ ] `npm run build` passes with no type errors
