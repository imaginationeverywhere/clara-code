# Website — Clara Voice Greeting on Page Load

**TARGET REPO:** imaginationeverywhere/clara-code
**Package:** `frontend/`
**Milestone:** Visit claracode.ai → Clara greets → download button works

---

## Context

`frontend/src/components/marketing/` has:
- `HeroSection.tsx` — the above-the-fold section with CTAs
- `Header.tsx` — site nav

The Hermes gateway is live: `https://info-24346--hermes-gateway.modal.run`
The Clara backend TTS is at: `https://api.claracode.ai/api/voice/tts`

Browsers block audio autoplay until the user has interacted with the page. The pattern is:
- On first load: show a "Hear Clara" button (or prompt) that triggers the greeting on click
- Once clicked: play greeting, then the conversation button changes to "Talk to Clara"

## Required Changes

### 1. `frontend/src/lib/clara-voice.ts`

Create a shared voice utility (reused by any component):

```typescript
const GATEWAY_URL = 'https://info-24346--hermes-gateway.modal.run';
const BACKEND_URL = 'https://api.claracode.ai';

export async function fetchGreeting(userId = 'visitor'): Promise<string> {
  const res = await fetch(GATEWAY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform: 'web', user: userId, message: '' }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return "Hello, I'm Clara. Your voice coding team starts here.";
  const data = await res.json() as Record<string, unknown>;
  return (typeof data.reply === 'string' ? data.reply : null)
    ?? "Hello, I'm Clara. Your voice coding team starts here.";
}

export async function speakText(text: string): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/api/voice/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error('TTS failed');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  await new Promise<void>((resolve, reject) => {
    audio.onended = () => { URL.revokeObjectURL(url); resolve(); };
    audio.onerror = () => { URL.revokeObjectURL(url); reject(new Error('playback error')); };
    audio.play().catch(reject);
  });
}
```

### 2. `frontend/src/components/marketing/ClaraVoiceGreeting.tsx`

New component — a floating "Hear Clara" button that triggers the greeting:

```tsx
'use client';
import { useState } from 'react';
import { fetchGreeting, speakText } from '@/lib/clara-voice';

type Phase = 'idle' | 'loading' | 'speaking' | 'done' | 'error';

export function ClaraVoiceGreeting() {
  const [phase, setPhase] = useState<Phase>('idle');

  const handleClick = async () => {
    if (phase !== 'idle' && phase !== 'error') return;
    setPhase('loading');
    try {
      const text = await fetchGreeting();
      setPhase('speaking');
      await speakText(text);
      setPhase('done');
    } catch {
      setPhase('error');
    }
  };

  const label: Record<Phase, string> = {
    idle: 'Hear Clara',
    loading: 'Connecting...',
    speaking: 'Speaking...',
    done: 'Talk to Clara',
    error: 'Try again',
  };

  const isActive = phase === 'speaking';

  return (
    <button
      onClick={handleClick}
      disabled={phase === 'loading'}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
        ${isActive
          ? 'bg-[#7C3AED] text-white animate-pulse'
          : 'bg-white/8 text-white/70 hover:text-white hover:bg-white/12 border border-white/10'}
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      aria-label={label[phase]}
    >
      {/* Mic icon */}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      {label[phase]}
    </button>
  );
}
```

### 3. `frontend/src/components/marketing/HeroSection.tsx` — add greeting button

Add `<ClaraVoiceGreeting />` to the hero CTA area. Place it **below** the primary CTA buttons, above the social proof row:

```tsx
import { ClaraVoiceGreeting } from './ClaraVoiceGreeting';

// Inside the CTA group, after the primary buttons:
<div className="flex items-center gap-4 mt-4">
  <ClaraVoiceGreeting />
  <span className="text-white/20 text-xs">No account needed to hear Clara</span>
</div>
```

### 4. Verify TypeScript + lint

```bash
cd frontend
npm run type-check
npm run lint
npm run build
```

## Acceptance Criteria

- [ ] "Hear Clara" button visible below hero CTAs on page load
- [ ] Clicking the button fetches greeting text from gateway and plays TTS audio
- [ ] Button shows "Connecting..." while loading, "Speaking..." while audio plays, "Talk to Clara" when done
- [ ] Browser autoplay restriction is handled — audio only plays after user click
- [ ] Falls back gracefully (no crash) if gateway or TTS is unreachable
- [ ] `npm run type-check` passes
- [ ] `npm run build` succeeds
