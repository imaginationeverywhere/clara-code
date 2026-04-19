# Cursor Agent Prompt — Voice Greeting Component

**Implemented in this repo:** `frontend/src/app/(marketing)/components/VoiceGreeting.tsx` (marketing site uses `frontend/`, not `packages/web-ui`).  
**Hook:** `frontend/src/app/(marketing)/hooks/useVoiceMute.ts`

**TARGET REPO:** [imaginationeverywhere/clara-code](https://github.com/imaginationeverywhere/clara-code)

**File target (original spec):** `packages/web-ui/src/app/(marketing)/components/VoiceGreeting.tsx`
**Type:** `"use client"` component

---

## Context

This is the most important component on claracode.ai. When a developer lands on the homepage, they see a pulsing mic button. They click it. Clara greets them in her own voice. This is the product demonstrating itself.

**Voice server endpoint** (already live):
```
POST https://info-24346--clara-voice-server-voiceserver-fastapi-app.modal.run/voice/tts
```

The frontend should NOT call this URL directly. It should call the backend proxy:
```
POST /api/voice/tts
Body: { text: string, voice: "clara" }
Response: audio/mpeg binary stream
```

If the backend proxy is not yet wired, fall back to calling the Modal URL directly using the env var:
```
process.env.NEXT_PUBLIC_CLARA_VOICE_URL || "https://info-24346--clara-voice-server-voiceserver-fastapi-app.modal.run"
```

**Clara's greeting script (exact text, do not change):**
```
"Hey. I'm Clara. You're on claracode.ai — welcome. I'm a voice-first AI coding assistant. I work in your terminal, in VS Code, and in your browser. And I can do something most coding tools can't: I can talk to you. Click install below — I'll be in your editor in under a minute."
```

---

## What to Build

### Component: `VoiceGreeting.tsx`

```tsx
"use client"
```

**State:**
- `status: 'idle' | 'loading' | 'playing' | 'done' | 'error'`
- `hasGreeted: boolean` — read/write from `sessionStorage` key `'clara-greeted'`
- `isMuted: boolean` — read from `sessionStorage` key `'clara-muted'`

**Visual states:**

**Idle (first visit — mic pulses):**
```
    [  🎤  ]     ← 64px circle button, purple bg, white mic icon
                  ← CSS ring animation: two expanding rings, purple at 30% opacity
  "Clara is here — tap to hear her"
    ↑ caption text, muted, Inter 14px, below button
```

**Idle (return visit — mic static, no pulse):**
```
    [  🎤  ]     ← same button but NO pulse animation
  "Hear Clara's greeting"
```

**Loading (after click — waiting for audio):**
```
    [  ⋯  ]     ← spinning dots or waveform bars, purple
  "One moment..."
```

**Playing (audio is playing):**
```
    [ ▮▯▮▯▮ ]   ← animated waveform bars (5 bars, CSS keyframes, height animates up/down)
                  ← bars are Clara Blue (#7BCDD8)
  "Clara is speaking..."
```

**Done:**
```
    [  ✓  ]     ← checkmark, green, no animation
  "↓ Install Clara below"
```

**Error:**
```
    [  !  ]     ← warning icon, amber
  "Voice unavailable — check the docs"
```

---

**Click handler:**
1. If `isMuted` → do nothing (button still shows but tap is a no-op; show muted tooltip)
2. Set `status = 'loading'`
3. Call `/api/voice/tts` (or Modal URL fallback):
   ```ts
   const response = await fetch('/api/voice/tts', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       text: CLARA_GREETING,
       voice: 'clara',
     }),
   });
   const blob = await response.blob();
   const url = URL.createObjectURL(blob);
   const audio = new Audio(url);
   ```
4. Set `status = 'playing'`
5. Play audio: `audio.play()`
6. On `audio.onended`: set `status = 'done'`, set `sessionStorage['clara-greeted'] = '1'`
7. On error: set `status = 'error'`

---

**Mute button in header:**
This component does NOT render the mute button — that's in the header. But it reads `sessionStorage['clara-muted']` on mount. Write a simple hook:
```ts
// packages/web-ui/src/app/(marketing)/hooks/useVoiceMute.ts
export function useVoiceMute() {
  const [isMuted, setIsMuted] = useState(
    () => sessionStorage.getItem('clara-muted') === '1'
  );
  const toggle = () => {
    const next = !isMuted;
    setIsMuted(next);
    sessionStorage.setItem('clara-muted', next ? '1' : '0');
  };
  return { isMuted, toggle };
}
```

Export this hook so the header layout can import it and render the mute button.

---

**CSS animations (add to globals.css or as inline keyframes):**
```css
@keyframes clara-pulse-ring {
  0% { transform: scale(0.9); opacity: 0.6; }
  100% { transform: scale(1.6); opacity: 0; }
}

@keyframes clara-waveform {
  0%, 100% { height: 8px; }
  50% { height: 24px; }
}
```

The two pulse rings are absolutely positioned circles behind the button, using `animation: clara-pulse-ring 1.5s ease-out infinite` with 0.5s stagger between them.

Waveform bars: 5 `<span>` elements, each with `animation: clara-waveform 0.8s ease-in-out infinite`, staggered delays (0s, 0.1s, 0.2s, 0.3s, 0.4s).

---

## Acceptance Criteria

- [ ] Component renders as a 64px mic button with pulse rings on first visit
- [ ] Static button (no pulse) on return visits (reads sessionStorage)
- [ ] Click triggers TTS API call → plays audio
- [ ] Visual states cycle: idle → loading → playing → done
- [ ] Error state shown if API call fails (no console.error unhandled)
- [ ] `useVoiceMute` hook exported — reads/writes sessionStorage
- [ ] `isMuted = true` makes click a no-op
- [ ] No TypeScript errors, no `any`
- [ ] Works in Firefox, Chrome, Safari (Web Audio API compatible)
