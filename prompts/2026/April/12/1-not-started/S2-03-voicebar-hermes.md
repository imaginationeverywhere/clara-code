# S2-03 — Wire VoiceBar → Hermes Gateway

**Repo:** `imaginationeverywhere/clara-code`
**Branch:** `feat/voicebar-hermes`
**Owner:** Motley (Frontend) + Miles (Backend)
**Priority:** MEDIUM — VoiceBar UI exists; needs real voice I/O wired to Hermes

---

## Context

The `VoiceBar` component at `packages/web-ui/src/components/voice/VoiceBar.tsx` captures
voice input via the Web Speech API (microphone → transcript string). It currently calls
`onTranscript()` with the recognized text but sends nothing to any backend.

The Hermes gateway is live at:
```
POST https://info-24346--hermes-gateway.modal.run
Body: { "platform": "web", "user": "mo", "message": "Hello Clara" }
Response: { "text": "...", "audio_url": "..." }  (or audio bytes)
```

The goal: when the user stops speaking (speech ends), send the transcript to Hermes and
play back the audio response.

---

## What Already Exists (do NOT recreate)

- `packages/web-ui/src/components/voice/VoiceBar.tsx` — mic/radio UI, Web Speech API
- `packages/web-ui/src/app/api/voice/greet/route.ts` — existing Next.js voice API route (Clerk auth)
- `packages/web-ui/src/components/sections/VoiceDemo.tsx` — demo section on marketing page
- `backend/src/routes/voice.ts` — Express voice routes (`/api/voice/greet`, `/api/voice/speak`)

---

## Changes Required

### 1. Add Next.js proxy route: `packages/web-ui/src/app/api/voice/chat/route.ts`

Create a new POST route that proxies to Hermes. This route must:
- Accept `{ message: string, userId?: string }` in the request body
- Forward to `https://info-24346--hermes-gateway.modal.run` with `{ platform: "web", user: userId || "guest", message }`
- Return the Hermes response (JSON with `text` + `audio_url` fields, or audio bytes)
- Add error handling — if Hermes is unreachable, return `{ text: "Clara is unavailable right now.", audio_url: null }` with HTTP 200 (graceful degradation)
- No Clerk auth required on this route (unauthenticated users can try voice)
- Add rate limiting: max 20 req/min per IP (use the same pattern as `backend/src/middleware/rate-limit.ts` but implemented as Next.js middleware — check if a `rateLimit` utility exists in `packages/web-ui/src/lib/`)
- Store the Hermes URL in an env var: `HERMES_GATEWAY_URL` (default to the live URL if not set)

```typescript
// packages/web-ui/src/app/api/voice/chat/route.ts
// POST /api/voice/chat
// body: { message: string, userId?: string }
// → proxy to Hermes → return { text: string, audio_url: string | null }
```

### 2. Update `VoiceBar.tsx` — send transcript to `/api/voice/chat`

In `VoiceBar.tsx`, after the `recognition.onend` fires with a final transcript:
- POST the transcript to `/api/voice/chat`
- While awaiting response, show a loading indicator (pulse animation on the mic icon)
- On response: call `onTranscript(transcript)` AND call a new `onResponse(text, audioUrl)` callback prop
- If `audioUrl` is non-null, auto-play the audio using `new Audio(audioUrl).play()`
- If `audioUrl` is null but `text` is present, use browser TTS as fallback:
  `window.speechSynthesis.speak(new SpeechSynthesisUtterance(text))`

**New prop to add to `VoiceBarProps`:**
```typescript
/** Called with Clara's text response and optional audio URL */
onResponse?: (text: string, audioUrl: string | null) => void
```

### 3. Add `HERMES_GATEWAY_URL` to web-ui env config

In `packages/web-ui/.env.local` (create if missing, it's gitignored):
```
HERMES_GATEWAY_URL=https://info-24346--hermes-gateway.modal.run
```

In `packages/web-ui/next.config.ts`, expose as server-side env (NOT prefixed with NEXT_PUBLIC_
since it's backend-only, called from the route handler):
```typescript
env: {
  HERMES_GATEWAY_URL: process.env.HERMES_GATEWAY_URL || "https://info-24346--hermes-gateway.modal.run",
}
```

### 4. Add Vitest unit test for the new chat route

File: `packages/web-ui/src/__tests__/api/voice-chat.test.ts`

Test cases:
- Returns Hermes response on success
- Returns graceful degradation message when Hermes unreachable (network error → 200 with fallback text)
- Returns 400 if `message` field is missing from body

---

## Constraints

- **DO NOT** expose `HERMES_GATEWAY_URL` to the client (no `NEXT_PUBLIC_` prefix)
- **DO NOT** add the Hermes URL directly in frontend component code — always go through the `/api/voice/chat` proxy
- The Web Speech API only works in HTTPS contexts and Chrome/Edge — VoiceBar should show a
  browser-unsupported message if `window.SpeechRecognition` is undefined
- All voice calls are fire-and-forget at the UI level — no blocking spinners on the main thread

---

## Acceptance Criteria

- [ ] `POST /api/voice/chat` returns `{ text, audio_url }` from Hermes
- [ ] `POST /api/voice/chat` returns graceful fallback if Hermes is unreachable
- [ ] `VoiceBar.tsx` sends transcript to `/api/voice/chat` after speech ends
- [ ] VoiceBar plays back audio response (or falls back to browser TTS)
- [ ] `HERMES_GATEWAY_URL` is env-var driven, not hardcoded
- [ ] Vitest tests pass for chat route (success + error + missing-body)
- [ ] `npx tsc --noEmit` clean in `packages/web-ui`
- [ ] No Hermes URL or credentials in any client-side bundle

---

## Branch & PR

```bash
git checkout -b feat/voicebar-hermes develop
# ... make changes ...
git push origin feat/voicebar-hermes
gh pr create --base develop --head feat/voicebar-hermes \
  --title "feat(voice): wire VoiceBar to Hermes gateway" \
  --body "Adds /api/voice/chat Next.js proxy + VoiceBar real voice I/O"
```
