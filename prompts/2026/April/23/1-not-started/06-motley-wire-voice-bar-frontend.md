---
title: "Wire IDE voice bar (Ctrl+Space) to /api/voice/converse"
team: Clara Code Team
agent: Motley (Frontend)
priority: P0
repo: imaginationeverywhere/clara-code
estimated_loe: 60 min
depends_on: 05-miles-wire-voice-converse-backend
blocks: none
source: quikvoice develop ed19194 — cp-team handoff 2026-04-23
---

# Wire the IDE Voice Bar to /voice/converse

## Context

Miles has added `POST /api/voice/converse` to the Express backend (prompt 05). Your job
is to wire the IDE voice bar so that when the user presses Ctrl+Space, their voice is
captured, sent to the backend, and Clara's MP3 reply plays back.

The voice bar already exists as a UI surface. This prompt wires it to real audio.

## What the flow looks like

```
User presses Ctrl+Space
  → MediaRecorder captures mic audio (WAV or WebM)
  → Stop on second press (or silence detection, optional for MVP)
  → base64-encode the audio blob
  → POST /api/voice/converse {audio_base64, voice_id: "clara"}
  → Show loading state (waveform animation)
  → Receive {transcript, response_text, audio_base64}
  → Decode MP3, play via Web Audio API
  → Show transcript + response_text in voice bar UI
  → Ready for next utterance
```

## Step 1 — Audio capture hook

Create `packages/web-ui/src/hooks/useVoiceCapture.ts` (or in the IDE package):

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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    setError(null);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorderRef.current = recorder;
    recorder.start();
    setIsRecording(true);
  }, []);

  const stopAndConverse = useCallback(async (
    onResult: (result: VoiceConverseResult) => void
  ) => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    setIsRecording(false);
    setIsProcessing(true);

    await new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
      recorder.stop();
      recorder.stream.getTracks().forEach((t) => t.stop());
    });

    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
    const arrayBuffer = await blob.arrayBuffer();
    const base64 = btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    );

    try {
      const res = await fetch(`${apiBase}/api/voice/converse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio_base64: base64, voice_id: 'clara' }),
        credentials: 'include', // Clerk JWT via cookie
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }

      const result: VoiceConverseResult = await res.json();
      onResult(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Voice request failed');
    } finally {
      setIsProcessing(false);
    }
  }, [apiBase]);

  return { isRecording, isProcessing, error, startRecording, stopAndConverse };
}
```

## Step 2 — Audio playback utility

```typescript
// packages/web-ui/src/utils/playAudio.ts
export async function playMp3Base64(base64: string): Promise<void> {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  const context = new AudioContext();
  const buffer = await context.decodeAudioData(bytes.buffer);
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);

  return new Promise((resolve) => {
    source.onended = () => resolve();
    source.start();
  });
}
```

## Step 3 — Wire Ctrl+Space to the voice bar

In the voice bar component (wherever Ctrl+Space is currently registered):

```typescript
import { useVoiceCapture } from '../hooks/useVoiceCapture';
import { playMp3Base64 } from '../utils/playAudio';

function VoiceBar() {
  const { isRecording, isProcessing, error, startRecording, stopAndConverse } = useVoiceCapture();
  const [transcript, setTranscript] = useState('');
  const [reply, setReply] = useState('');

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.code === 'Space') {
        e.preventDefault();
        if (isRecording) {
          stopAndConverse(async (result) => {
            setTranscript(result.transcript);
            setReply(result.response_text);
            await playMp3Base64(result.audio_base64);
          });
        } else {
          startRecording();
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRecording, startRecording, stopAndConverse]);

  return (
    <div className="voice-bar">
      {isRecording && <span className="recording-indicator">● Recording…</span>}
      {isProcessing && <span className="processing-indicator">Clara is thinking…</span>}
      {error && <span className="error">{error}</span>}
      {transcript && <p className="transcript">You: {transcript}</p>}
      {reply && <p className="reply">Clara: {reply}</p>}
    </div>
  );
}
```

## Step 4 — Show loading state (waveform animation)

While `isProcessing=true`, show a waveform animation so the user knows Clara is working.
Use the existing waveform component from the design system (Motley owns this — implement
with the existing bar animation, color `#7BCDD8` teal).

Cold start: ~15s. Warm: ~2s. The loading state must be patient.

## Step 5 — Graceful offline fallback

If the fetch fails (network error, voice server cold start timeout), show:
```
"Clara's voice is warming up — try again in a moment"
```
Do NOT crash the IDE. Do NOT show a raw error stack. Degrade gracefully.

## Step 6 — Commit

```bash
git add packages/web-ui/src/hooks/useVoiceCapture.ts \
        packages/web-ui/src/utils/playAudio.ts \
        packages/web-ui/src/components/VoiceBar.tsx
git commit -m "feat(voice-bar): wire Ctrl+Space to /api/voice/converse — mic capture → Clara reply

- useVoiceCapture hook: MediaRecorder → base64 → POST /api/voice/converse
- playMp3Base64: Web Audio API MP3 playback from base64 response
- VoiceBar: Ctrl+Space toggles record, shows transcript + reply, plays audio
- Loading state: waveform animation while Clara processes (cold ~15s, warm ~2s)
- Error state: graceful offline fallback, no crash on network failure"
```

## Acceptance Criteria

- [ ] Ctrl+Space starts recording (first press) and stops + sends (second press)
- [ ] Audio is captured as WebM via MediaRecorder
- [ ] Request goes to `/api/voice/converse` (NOT directly to Modal URL)
- [ ] Transcript and response_text are shown in the voice bar after response
- [ ] MP3 plays automatically when response arrives
- [ ] Loading state shows while processing (waveform animation)
- [ ] Graceful error message on failure (no crash, no raw error)
- [ ] Works on localhost:3032 with backend on localhost:3031

## What NOT To Do

- Do NOT call the Modal URL directly from the frontend
- Do NOT expose `CLARA_VOICE_API_KEY` in any frontend code
- Do NOT add streaming yet — non-streaming is MVP
- Do NOT implement silence detection yet — manual Ctrl+Space stop is MVP
- Do NOT use a 3rd-party audio library — Web Audio API is sufficient

## Reference

- Backend proxy: `backend/src/routes/voice.ts` (from prompt 05)
- Voice server response shape: `quikvoice/docs/voice-client.md`
- Latency: cold ~15s, warm ~2s (docs: `quikvoice/docs/voice-behavior.md`)
- Color palette: `#7BCDD8` teal for active states, `#7C3AED` purple for recording
