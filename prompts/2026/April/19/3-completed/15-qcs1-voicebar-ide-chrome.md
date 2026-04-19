# Prompt 15 — QCS1: VoiceBar IDE Chrome Component
**TARGET REPO:** `/Volumes/X10-Pro/Native-Projects/AI/clara-code`  
_(Auto-classified 2026-04-15. If wrong, edit this line before dispatch.)_
**Author:** Carruthers (Tech Lead, Clara Code Team)
**Task:** Wire VoiceBar into Clara Code IDE chrome (VS Code fork)
**Machine:** QCS1 (Mac M4 Pro — dispatch via Cursor agent, 1 of 3)
**Priority:** P1 — Core voice interaction for the IDE

---

## Context

The VoiceBar is the voice interaction bar at the bottom of the Clara Code IDE. A pixel-perfect
mockup exists at `mockups/app/src/components/VoiceBar.tsx`. Your job is to move this from
the mockup (Vite/React) into the actual IDE chrome as a production component.

The Clara Code IDE is a VS Code fork. The VoiceBar will live in a VS Code webview panel
that renders inside the IDE's bottom area (similar to the terminal panel).

The relevant extension code that needs the VoiceBar wired is in `packages/coding-agent/`.
The VS Code extension glue lives in `extensions/` or `packages/coding-agent/src/extension/`.

---

## Step 1: Locate the Extension Entry Point

Before coding, run these checks:
```bash
find /path/to/clara-code -name "extension.ts" | grep -v node_modules | grep -v mockup
find /path/to/clara-code -name "*.ts" | xargs grep -l "registerWebviewPanel\|createWebviewPanel" | grep -v node_modules | head -10
```

If the extension has a webview panel: wire VoiceBar into it.
If not: create `packages/coding-agent/src/voice-panel/VoiceBar.tsx` as a standalone React component
that can be bundled and injected into the VS Code webview.

---

## Step 2: Create `packages/coding-agent/src/voice-panel/VoiceBar.tsx`

Copy the mockup and adapt it for production. The key change is adding the `onSubmit` callback
so the IDE can receive voice/text commands:

```typescript
'use client'
// Note: this runs in VS Code webview context — no 'use client' needed if not Next.js
// Just include it in case this component is shared with web

import { useEffect, useState, useRef } from 'react'
import { Mic, Keyboard, ArrowRight } from 'lucide-react'

export interface VoiceBarProps {
  /** Called when user submits a voice transcript or typed message */
  onSubmit: (text: string, source: 'voice' | 'text') => void
  /** Optional keyboard shortcut display (default: Ctrl+Space) */
  shortcutLabel?: string
}

export function VoiceBar({ onSubmit, shortcutLabel = 'Ctrl+Space' }: VoiceBarProps) {
  const [isVoiceMode, setIsVoiceMode] = useState(true)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [inputText, setInputText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Space = toggle listening
      if (e.ctrlKey && e.code === 'Space') {
        e.preventDefault()
        if (isVoiceMode) {
          toggleListening()
        } else {
          setIsVoiceMode(true)
        }
      }
      // Escape = return to voice mode
      if (!isVoiceMode && e.key === 'Escape') {
        setIsVoiceMode(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isVoiceMode, isListening])

  // Focus input when switching to text mode
  useEffect(() => {
    if (!isVoiceMode && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isVoiceMode])

  const toggleListening = () => {
    const nowListening = !isListening
    setIsListening(nowListening)
    if (nowListening) {
      setTranscript('')
      // TODO Sprint 2: wire Web Speech API or Modal Voxtral STT here
      // For now: mock transcript after 3 seconds
      setTimeout(() => {
        const mockText = 'Create a function to handle user authentication'
        setTranscript(mockText)
        setIsListening(false)
        onSubmit(mockText, 'voice')
      }, 3000)
    }
  }

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const text = inputText.trim()
    if (!text) return
    onSubmit(text, 'text')
    setInputText('')
  }

  // Waveform bar heights (static, animated via CSS)
  const waveformBars = [8, 12, 24, 16, 8, 28, 20, 12, 16, 24, 12, 8]

  return (
    <div className="h-20 border-t border-white/[0.06] bg-[#0F1318] flex items-center px-6 gap-4 flex-shrink-0">
      {isVoiceMode ? (
        <>
          {/* Left: Status & Transcript */}
          <div className="flex-1 flex items-center gap-3 min-w-0">
            {isListening ? (
              <div className="flex items-end gap-[2px] h-6 px-2 shrink-0">
                {waveformBars.map((_, i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full bg-[#7C3AED] animate-pulse"
                    style={{
                      height: `${4 + Math.random() * 20}px`,
                      animationDelay: `${i * 0.08}s`,
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-xs text-white/25">
                {shortcutLabel} to speak
              </div>
            )}
            {isListening && transcript && (
              <div className="text-sm text-white/70 font-mono truncate">
                {transcript}
              </div>
            )}
          </div>

          {/* Center: Mic Button */}
          <div className="relative flex flex-col items-center justify-center shrink-0">
            <button
              onClick={toggleListening}
              title={`${shortcutLabel} — ${isListening ? 'Release to send' : 'Hold to speak'}`}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                isListening
                  ? 'bg-[#7C3AED] shadow-[0_0_24px_rgba(124,58,237,0.6)] scale-110'
                  : 'bg-[#7C3AED]/15 border border-[#7C3AED]/30 hover:bg-[#7C3AED]/25'
              }`}
            >
              <Mic
                size={22}
                className={`${isListening ? 'text-white animate-pulse' : 'text-[#7C3AED]'}`}
              />
            </button>
            <div className="absolute -bottom-4 text-[10px] text-white/20 tracking-wide whitespace-nowrap">
              {isListening ? 'RELEASE TO SEND' : 'HOLD TO SPEAK'}
            </div>
          </div>

          {/* Right: Text toggle */}
          <div className="flex-1 flex items-center justify-end gap-3">
            {isListening && (
              <div className="text-xs text-white/30 font-mono">0:03</div>
            )}
            <button
              onClick={() => setIsVoiceMode(false)}
              className="w-7 h-7 rounded-md border border-white/10 hover:border-white/20 flex items-center justify-center text-white/30 hover:text-white/60 transition-all"
              title="Switch to text"
            >
              <Keyboard size={14} />
            </button>
          </div>
        </>
      ) : (
        <>
          {/* TEXT MODE */}
          <button
            onClick={() => setIsVoiceMode(true)}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-[#7C3AED] hover:border-[#7C3AED]/30 flex items-center justify-center transition-all shrink-0"
            title="Switch to voice"
          >
            <Mic size={16} />
          </button>

          <form onSubmit={handleTextSubmit} className="flex-1 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message... (Esc for voice)"
              className="flex-1 bg-[#070A0F] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/25 focus:border-[#7C3AED]/40 focus:outline-none focus:ring-1 focus:ring-[#7C3AED]/20 font-mono transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="bg-[#7C3AED] disabled:bg-[#7C3AED]/30 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all"
            >
              <ArrowRight size={14} className="text-white" />
            </button>
          </form>
        </>
      )}
    </div>
  )
}
```

---

## Step 3: Create `packages/coding-agent/src/voice-panel/index.ts`

```typescript
export { VoiceBar } from './VoiceBar.js'
export type { VoiceBarProps } from './VoiceBar.js'
```

---

## Step 4: Wire to Extension (if webview exists)

Find where the VS Code extension creates its webview panel. Add a message handler:

```typescript
// In extension webview JS (or postMessage bridge):
// When VoiceBar calls onSubmit(text, source), post to extension host:
window.vscode?.postMessage({ type: 'clara:command', text, source })

// In extension.ts (host side), handle the message:
panel.webview.onDidReceiveMessage((msg) => {
  if (msg.type === 'clara:command') {
    // Dispatch to mom / agent runner
    runAgentCommand(msg.text)
  }
})
```

If no webview exists yet — document what's needed in a `VOICE_BAR_TODO.md` file in
`packages/coding-agent/src/voice-panel/` and leave the component ready for wiring.

---

## Dependencies

Check `packages/coding-agent/package.json` for `lucide-react`. If not present, add it.

---

## Acceptance Criteria

- [ ] `packages/coding-agent/src/voice-panel/VoiceBar.tsx` exists and compiles
- [ ] Component renders mic button + waveform bars + text toggle
- [ ] `Ctrl+Space` handler registered (console.log confirms it fires)
- [ ] `onSubmit` callback fires with text when typing + Enter
- [ ] `onSubmit` fires with mock transcript after 3 seconds in voice mode
- [ ] `npm run build` (or `tsc --noEmit`) passes in `packages/coding-agent/`
- [ ] No `any` types
