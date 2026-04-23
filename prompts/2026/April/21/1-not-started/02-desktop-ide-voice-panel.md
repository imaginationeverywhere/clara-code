# Desktop IDE — Wire Clara Voice Conversation Panel

**TARGET REPO:** imaginationeverywhere/clara-code
**Package:** `desktop/`
**Milestone:** Open app → Clara greets → voice conversation, end-to-end

---

## Context

The Tauri desktop app lives in `desktop/`. It has:
- `desktop/src/` — React frontend
- `desktop/src-tauri/` — Rust backend
- `desktop/src/App.tsx` — main app component

The CLI already has a working voice loop in `packages/cli/src/hooks/useVoice.ts` and supporting libs.
The Hermes gateway is live: `https://info-24346--hermes-gateway.modal.run`
The Clara backend handles TTS at `https://api.claracode.ai/api/voice/tts`.

## Goal

When the user opens the desktop app:
1. Clara greets them with voice audio
2. A conversation panel shows — spacebar or mic button → listen → Clara responds with voice

## Required Changes

### 1. Copy voice libs into desktop

The desktop app needs the same voice primitives the CLI uses. Copy these files from `packages/cli/src/lib/` into `desktop/src/lib/`:
- `audio-capture.ts` — mic capture via MediaRecorder (browser API, not sox — Tauri webview can use Web APIs)
- `play-audio-file.ts` — in desktop, use `new Audio(url)` from blob URL instead of afplay
- `gateway.ts` — `claraGateway(url, userId, message)`
- `backend.ts` — `resolveGatewayUrl()` and `resolveBackendUrl()` with same defaults

**Note:** In the Tauri webview, use `MediaRecorder` for mic capture (browser API, works in Tauri). Replace the sox-based `audio-capture.ts` with a WebAPI version:

```typescript
// desktop/src/lib/audio-capture.ts
export type AudioCapture = {
  isReal: boolean;
  cancel(): void;
  stop(): Promise<Blob>;
};

export function startCapture(): AudioCapture {
  let mediaRecorder: MediaRecorder | null = null;
  let chunks: BlobEvent['data'][] = [];
  let stopped = false;

  const streamPromise = navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.start();
    return stream;
  });

  return {
    isReal: true,
    cancel() {
      stopped = true;
      mediaRecorder?.stop();
    },
    async stop(): Promise<Blob> {
      const stream = await streamPromise;
      return new Promise((resolve) => {
        if (!mediaRecorder || stopped) {
          resolve(new Blob([], { type: 'audio/webm' }));
          return;
        }
        mediaRecorder.onstop = () => {
          stream.getTracks().forEach(t => t.stop());
          resolve(new Blob(chunks, { type: 'audio/webm' }));
        };
        mediaRecorder.stop();
      });
    },
  };
}
```

For `play-audio-file.ts` in desktop:
```typescript
export async function playAudioBlob(blob: Blob): Promise<void> {
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  return new Promise((resolve, reject) => {
    audio.onended = () => { URL.revokeObjectURL(url); resolve(); };
    audio.onerror = () => { URL.revokeObjectURL(url); reject(); };
    audio.play().catch(reject);
  });
}
```

### 2. `desktop/src/hooks/useVoice.ts`

Create a desktop-specific `useVoice` hook (React, not Ink) that reuses the gateway client:

```typescript
import { useState, useRef, useCallback } from 'react';
import { startCapture, type AudioCapture } from '../lib/audio-capture';
import { claraGateway } from '../lib/gateway';
import { playAudioBlob } from '../lib/play-audio-file';

const GATEWAY_URL = 'https://info-24346--hermes-gateway.modal.run';
const BACKEND_URL = 'https://api.claracode.ai';

export type VoicePhase = 'idle' | 'listening' | 'transcribing' | 'thinking' | 'speaking';

export function useVoice(userId: string) {
  const [phase, setPhase] = useState<VoicePhase>('idle');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const captureRef = useRef<AudioCapture | null>(null);

  const greet = useCallback(async () => {
    setPhase('thinking');
    try {
      const result = await claraGateway(GATEWAY_URL, userId, '');
      if (!result.ok) { setPhase('idle'); return; }
      setPhase('speaking');
      await speakText(result.reply);
      setMessages([{ role: 'assistant', text: result.reply }]);
    } finally {
      setPhase('idle');
    }
  }, [userId]);

  const startListening = useCallback(() => {
    if (phase !== 'idle') return;
    captureRef.current = startCapture();
    setPhase('listening');
  }, [phase]);

  const stopAndSend = useCallback(async () => {
    if (phase !== 'listening' || !captureRef.current) return;
    const blob = await captureRef.current.stop();
    captureRef.current = null;
    setPhase('transcribing');

    // STT via backend
    const formData = new FormData();
    formData.append('audio', blob, 'recording.webm');
    let transcript = '';
    try {
      const sttRes = await fetch(`${BACKEND_URL}/api/voice/stt`, {
        method: 'POST',
        body: formData,
      });
      const data = await sttRes.json() as { transcript?: string };
      transcript = data.transcript ?? '';
    } catch {
      setPhase('idle');
      return;
    }

    if (!transcript) { setPhase('idle'); return; }
    setMessages(prev => [...prev, { role: 'user', text: transcript }]);

    setPhase('thinking');
    const result = await claraGateway(GATEWAY_URL, userId, transcript);
    setMessages(prev => [...prev, { role: 'assistant', text: result.reply }]);

    setPhase('speaking');
    await speakText(result.reply);
    setPhase('idle');
  }, [phase, userId]);

  return { phase, messages, greet, startListening, stopAndSend };
}

async function speakText(text: string): Promise<void> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/voice/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) return;
    const blob = await res.blob();
    await playAudioBlob(blob);
  } catch {
    // Silent fallback
  }
}
```

### 3. `desktop/src/components/ClaraPanel.tsx`

Create the conversation side panel:

```typescript
import React, { useEffect } from 'react';
import { useVoice } from '../hooks/useVoice';

export function ClaraPanel({ userId }: { userId: string }) {
  const { phase, messages, greet, startListening, stopAndSend } = useVoice(userId);

  // Greet on mount
  useEffect(() => { greet(); }, []);

  // Spacebar push-to-talk
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        startListening();
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        stopAndSend();
      }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [startListening, stopAndSend]);

  const phaseLabel: Record<typeof phase, string> = {
    idle: 'Hold Space to speak',
    listening: 'Listening...',
    transcribing: 'Transcribing...',
    thinking: 'Thinking...',
    speaking: 'Clara is speaking...',
  };

  return (
    <div style={{ width: 320, height: '100vh', background: '#0D1117', borderLeft: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', fontFamily: 'monospace' }}>
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <span style={{ color: '#7BC8D8', fontWeight: 600 }}>Clara</span>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginLeft: 8 }}>{phaseLabel[phase]}</span>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
            <div style={{
              background: m.role === 'user' ? '#7C3AED' : 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.9)',
              borderRadius: 12,
              padding: '8px 12px',
              fontSize: 13,
              lineHeight: 1.5,
            }}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Voice button */}
      <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'center' }}>
        <button
          onMouseDown={startListening}
          onMouseUp={stopAndSend}
          style={{
            width: 56, height: 56, borderRadius: '50%',
            background: phase === 'listening' ? '#7C3AED' : 'rgba(255,255,255,0.08)',
            border: '2px solid',
            borderColor: phase === 'listening' ? '#7C3AED' : 'rgba(255,255,255,0.15)',
            cursor: 'pointer',
            transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={phase === 'listening' ? 'white' : 'rgba(255,255,255,0.6)'}>
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke={phase === 'listening' ? 'white' : 'rgba(255,255,255,0.6)'} strokeWidth="2" fill="none" strokeLinecap="round"/>
            <line x1="12" y1="19" x2="12" y2="23" stroke={phase === 'listening' ? 'white' : 'rgba(255,255,255,0.6)'} strokeWidth="2" strokeLinecap="round"/>
            <line x1="8" y1="23" x2="16" y2="23" stroke={phase === 'listening' ? 'white' : 'rgba(255,255,255,0.6)'} strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
```

### 4. `desktop/src/App.tsx` — add ClaraPanel

Add the panel to the main layout:

```tsx
import { ClaraPanel } from './components/ClaraPanel';

// In the App return, wrap existing content:
<div style={{ display: 'flex', height: '100vh' }}>
  <div style={{ flex: 1 }}>
    {/* existing editor/content */}
  </div>
  <ClaraPanel userId="dev" />
</div>
```

### 5. Build `.dmg`

```bash
cd desktop
npm install
npm run tauri build
# Output: src-tauri/target/release/bundle/dmg/*.dmg
```

## Acceptance Criteria

- [ ] App opens → Clara greeting plays within 5 seconds
- [ ] Hold spacebar → mic activates → release → Clara responds in Villarosa's voice
- [ ] Mic button works same as spacebar
- [ ] Conversation messages appear in the panel
- [ ] `.dmg` file builds successfully in `src-tauri/target/release/bundle/dmg/`
- [ ] No TypeScript errors (`npm run typecheck` or `tsc --noEmit`)
