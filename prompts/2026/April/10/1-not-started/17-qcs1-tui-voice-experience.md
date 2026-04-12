## CURSOR AGENT — MCP NOTE
**Figma MCP**: Skip if unavailable. Do NOT wait for it or ask about it. This prompt does NOT require Figma MCP. Proceed immediately with the implementation below.
**Secrets**: All keys are in AWS SSM. Pull with: `aws ssm get-parameter --name '/quik-nation/shared/<KEY_NAME>' --with-decryption --query 'Parameter.Value' --output text`

---

# Prompt 17 — QCS1: TUI Voice Experience
**Author:** Carruthers (Tech Lead, Clara Code Team)
**Task:** Add voice waveform component + voice mode to the Clara CLI TUI
**Machine:** QCS1 (Mac M4 Pro — dispatch via Cursor agent, 3 of 3)
**Priority:** P1 — The "voice-first CLI" is a core product differentiator

---

## Context

The `packages/tui/` package is the terminal UI library used by Clara Code's CLI (`clara` command).
It already has box-drawing, markdown rendering, input, and other TUI components.

Your job is to add a **VoiceBar** to the TUI — a terminal-native waveform display that shows
when Clara is listening. This is the terminal equivalent of the IDE's VoiceBar (prompt 15).

The TUI components are plain TypeScript classes implementing the `Component` interface:

```typescript
export interface Component {
  render(width: number): string[]  // returns lines to display
  handleInput?(data: string): void
  invalidate(): void
}
```

---

## What to Build

### 1. Create `packages/tui/src/components/voice-bar.ts`

A TUI component that renders a voice waveform using box-drawing characters.

```typescript
import type { Component } from '../tui.js'

export interface VoiceBarTheme {
  barChar?: string          // Character for waveform bars (default: '█')
  barCharLow?: string       // Character for low-amplitude bars (default: '▄')
  barCharSilent?: string    // Character for silent bars (default: '░')
  activeColor?: string      // ANSI color when listening (default: purple \x1b[35m)
  mutedColor?: string       // ANSI color when idle (default: dim \x1b[2m)
  reset?: string            // ANSI reset (default: \x1b[0m)
}

export type VoiceState = 'idle' | 'listening' | 'processing'

const DEFAULT_THEME: Required<VoiceBarTheme> = {
  barChar: '█',
  barCharLow: '▄',
  barCharSilent: '░',
  activeColor: '\x1b[35m',   // purple
  mutedColor: '\x1b[2m',     // dim
  reset: '\x1b[0m',
}

// Simple random waveform amplitude simulation
function generateWaveform(bars: number, state: VoiceState): number[] {
  if (state === 'idle') return new Array(bars).fill(0)
  if (state === 'processing') {
    // Steady low pulse during processing
    return Array.from({ length: bars }, (_, i) => Math.sin(i * 0.5) * 0.3 + 0.3)
  }
  // Listening: random amplitudes
  return Array.from({ length: bars }, () => Math.random())
}

export class VoiceBar implements Component {
  private state: VoiceState = 'idle'
  private theme: Required<VoiceBarTheme>
  private _frame = 0
  private _waveform: number[] = []
  private _invalidated = true

  constructor(theme: VoiceBarTheme = {}) {
    this.theme = { ...DEFAULT_THEME, ...theme }
  }

  setState(state: VoiceState): void {
    if (this.state !== state) {
      this.state = state
      this._invalidated = true
    }
  }

  getState(): VoiceState {
    return this.state
  }

  /**
   * Call this on a timer (e.g., every 100ms) to animate the waveform.
   * Returns true if a re-render is needed.
   */
  tick(): boolean {
    if (this.state === 'idle') return false
    this._frame++
    this._waveform = generateWaveform(16, this.state)
    this._invalidated = true
    return true
  }

  render(width: number): string[] {
    const { barChar, barCharLow, barCharSilent, activeColor, mutedColor, reset } = this.theme

    if (this.state === 'idle') {
      const label = `${mutedColor}  ◉  Ctrl+Space to speak${reset}`
      return [label]
    }

    // Build waveform string
    const barCount = Math.min(16, Math.floor(width / 3))
    const waveform = this._waveform.length >= barCount
      ? this._waveform.slice(0, barCount)
      : generateWaveform(barCount, this.state)

    const waveStr = waveform
      .map((amp) => {
        if (amp > 0.6) return barChar
        if (amp > 0.2) return barCharLow
        return barCharSilent
      })
      .join(' ')

    const stateLabel =
      this.state === 'listening' ? 'Listening...' : 'Processing...'

    const line = `${activeColor}  ◉  ${waveStr}  ${stateLabel}${reset}`
    return [line]
  }

  handleInput(data: string): void {
    // Escape key → return to idle
    if (data === '\x1b' && this.state !== 'idle') {
      this.setState('idle')
    }
    // Ctrl+Space (terminal sends \x00 or similar — check keybindings.ts)
    // This will be wired by the parent TUI app
  }

  invalidate(): void {
    this._invalidated = true
    this._waveform = []
  }
}
```

---

### 2. Update `packages/tui/src/index.ts`

Add the export:

```typescript
// After the existing component exports, add:
export { VoiceBar, type VoiceBarTheme, type VoiceState } from './components/voice-bar.js'
```

---

### 3. Wire into `packages/tui/src/tui.ts` — Add Voice Mode Support

Find the main TUI class or the app entry. Add a method `setVoiceBar()` that accepts
a VoiceBar component and renders it at the bottom of the TUI:

```typescript
// In the main TUI class:

private voiceBar: VoiceBar | null = null
private voiceBarTimer: NodeJS.Timeout | null = null

/**
 * Mount a VoiceBar at the bottom of the TUI.
 * The voice bar animates independently via its own tick timer.
 */
setVoiceBar(voiceBar: VoiceBar): void {
  this.voiceBar = voiceBar
  // Start animation timer (100ms = 10fps — enough for waveform)
  if (this.voiceBarTimer) clearInterval(this.voiceBarTimer)
  this.voiceBarTimer = setInterval(() => {
    if (voiceBar.tick()) {
      this.render() // Re-render when waveform changes
    }
  }, 100)
}

/**
 * Activate voice listening mode
 */
startVoiceListening(): void {
  this.voiceBar?.setState('listening')
}

/**
 * Stop voice listening
 */
stopVoiceListening(): void {
  this.voiceBar?.setState('idle')
}
```

**Note:** If the TUI class structure doesn't have a clean hook for this, add
`setVoiceBar()` as a standalone utility and document the manual wiring needed.
Don't break the existing TUI behavior.

---

### 4. Create `packages/tui/src/components/voice-bar.test.ts` (optional but preferred)

```typescript
import { VoiceBar } from './voice-bar.js'

// Basic smoke tests — no test runner needed, just manual verification:
const bar = new VoiceBar()

// Should render idle state
console.assert(bar.render(80).length === 1, 'idle: renders 1 line')
console.assert(bar.render(80)[0].includes('Ctrl+Space'), 'idle: shows shortcut hint')

// Switch to listening
bar.setState('listening')
bar.tick()
const listenLines = bar.render(80)
console.assert(listenLines[0].includes('Listening'), 'listening: shows label')

console.log('VoiceBar smoke tests passed ✓')
```

Run with: `node --loader ts-node/esm packages/tui/src/components/voice-bar.test.ts`

---

### 5. Demo Script: `packages/tui/demo-voice.ts`

Create a quick demo that Mo can run to see the voice bar in action:

```typescript
#!/usr/bin/env node
/**
 * Demo: Clara TUI Voice Bar
 * Run: npx ts-node packages/tui/demo-voice.ts
 */
import { VoiceBar } from './src/components/voice-bar.js'

const bar = new VoiceBar()

process.stdout.write('\x1b[2J\x1b[H') // Clear screen

console.log('Clara Code — Voice TUI Demo\n')
console.log('Press Ctrl+C to exit\n')

// Show idle state
console.log('State: idle')
console.log(bar.render(60).join('\n'))
console.log()

// Simulate transition to listening
setTimeout(() => {
  console.log('State: listening (Ctrl+Space triggered)')
  bar.setState('listening')
  let frames = 0
  const timer = setInterval(() => {
    bar.tick()
    process.stdout.write('\x1b[1A\x1b[2K') // Erase last line
    console.log(bar.render(60).join('\n'))
    if (++frames > 30) {
      clearInterval(timer)
      bar.setState('processing')
      console.log('\nState: processing (sending to Clara...)')
      setTimeout(() => {
        bar.setState('idle')
        console.log('\nState: idle (response complete)')
        console.log(bar.render(60).join('\n'))
        process.exit(0)
      }, 2000)
    }
  }, 100)
}, 1000)
```

---

## Acceptance Criteria

- [ ] `packages/tui/src/components/voice-bar.ts` compiles with no type errors
- [ ] `render(80)` returns 1 line in idle state, 1 line with waveform in listening state
- [ ] Waveform uses box-drawing chars (`█`, `▄`, `░`) and ANSI purple color
- [ ] `tick()` updates waveform on each call (different output)
- [ ] `setState('idle')` stops animation (tick returns false)
- [ ] VoiceBar exported from `packages/tui/src/index.ts`
- [ ] `npm run build` passes in `packages/tui/`
- [ ] Demo script runs without crashing: `node demo-voice.ts`