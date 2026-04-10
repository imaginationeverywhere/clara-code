# Magic Patterns Prompt — Clara Code App: Voice-First Interface Shell

**File target:** `packages/web-ui/src/app/(app)/layout.tsx` or `components/app/AppShell.tsx`
**Type:** Client Component ('use client') — manages voice/text mode state

---

## CONTEXT FOR MAGIC PATTERNS — READ FIRST
**This is a DESKTOP APPLICATION, not a web page or mobile app.**
Design like VS Code, Cursor, Warp Terminal, or Linear — NOT like a website.
- Dense information layout. No generous mobile padding.
- Full-screen, no scroll. Every pixel is intentional.
- Dark terminal aesthetic (#0D1117 base). No light mode.
- Monospace fonts for all code and transcripts.
- Keyboard shortcuts expected. Desktop-first interactions.
- Panels are fixed-width. Layouts are rigid grids, not fluid stacks.

---

## CRITICAL DESIGN PRINCIPLE
**Voice is the PRIMARY interface. Text input is a TOGGLE.** The default state shows NO text input
field. A small toggle button (keyboard icon) switches to text mode. When text mode is active, a
text input appears and the mic button shrinks to secondary. Voice mode is the "home state."

---

## Prompt

```
Create a full-screen dark IDE shell for "Clara Code" — a voice-first AI coding assistant.
This is a CLIENT COMPONENT that manages voice/text mode state via useState.

**Overall layout (h-screen w-screen bg-[#0D1117] flex flex-col overflow-hidden):**

TOP BAR (h-11 flex items-center border-b border-white/6 bg-[#0A0E14] px-4 justify-between):
- Left: "Clara Code" wordmark small — "Clara" Inter font-semibold text-sm text-white, "Code" JetBrains Mono text-sm text-[#4F8EF7]
- Center: file breadcrumb — text-xs text-white/30 font-mono gap-1 flex items-center "src / app / page.tsx" with "/" separators text-white/15
- Right: three icon buttons (w-7 h-7 rounded-md hover:bg-white/6 flex items-center justify-center):
  - Git branch icon + "main" text-xs text-white/35
  - Settings icon (text-white/35)
  - User avatar circle (w-7 h-7 rounded-full bg-[#7C3AED]/20 text-[#7C3AED] text-xs font-medium) — "AR"

MAIN CONTENT AREA (flex-1 flex overflow-hidden):

LEFT PANEL — File Tree (w-52 border-r border-white/6 bg-[#090D12] flex-shrink-0 overflow-y-auto):
[See separate file tree prompt for detail]
- For the shell: just a placeholder div with text-xs text-white/20 p-4 "Files"

CENTER PANEL — Code Editor (flex-1 bg-[#0D1117] overflow-hidden flex flex-col):
[See separate code panel prompt for detail]
- For the shell: flex-1 bg-[#0D1117] placeholder

RIGHT PANEL — AI Assistant (w-72 border-l border-white/6 bg-[#090D12] flex-shrink-0 flex flex-col):
[See separate AI panel prompt for detail]
- For the shell: flex-1 bg-[#090D12] placeholder

BOTTOM VOICE BAR — THIS IS THE CRITICAL PART (h-20 border-t border-white/6 bg-[#0A0E14] flex items-center px-6 gap-4):

STATE: const [isVoiceMode, setIsVoiceMode] = useState(true)
STATE: const [isListening, setIsListening] = useState(false)

--- VOICE MODE (isVoiceMode === true) — DEFAULT STATE ---

Left side (flex-1 flex items-center gap-3):
- Status area: when NOT listening — text-xs text-white/25 "Ready to listen"
- When listening: waveform bars (12 bars, w-1 rounded-full bg-[#7C3AED], heights animated via CSS, heights cycle 4px→20px→8px→24px→12px pattern using different animation-delay values on each bar)
- Transcript display: text-sm text-white/70 font-mono max-w-sm truncate — shows last voice input

Center: LARGE MIC BUTTON — THIS IS THE HERO ELEMENT:
- w-12 h-12 rounded-full flex items-center justify-center
- Default state (not listening): bg-[#7C3AED]/15 border border-[#7C3AED]/30 text-[#7C3AED] hover:bg-[#7C3AED]/25 transition-all
- Listening state: bg-[#7C3AED] text-white shadow-[0_0_24px_rgba(124,58,237,0.6)] scale-110
- Mic SVG icon (22px) centered
- onClick: toggle isListening
- Instruction text BELOW the button (absolute or relative, text-[10px] text-white/20 tracking-wide): when not listening: "HOLD TO SPEAK" | when listening: "RELEASE TO SEND"

Right side (flex items-center gap-2):
- Small text showing listening time when active: "0:04" text-xs text-white/30 font-mono
- TOGGLE BUTTON — keyboard/text mode switch:
  - w-7 h-7 rounded-md border border-white/10 hover:border-white/20 flex items-center justify-center text-white/30 hover:text-white/60 transition-all
  - Keyboard SVG icon (14px) or "Aa" text-xs
  - onClick: setIsVoiceMode(false)
  - Tooltip on hover: "Switch to text" — absolute tooltip above

--- TEXT MODE (isVoiceMode === false) ---

When text mode is active, the bottom bar CHANGES to:
- Left: small mic button (w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-[#7C3AED] hover:border-[#7C3AED]/30 flex items-center justify-center) with mic icon (16px) — onClick: setIsVoiceMode(true)
- Center: flex-1 text input — bg-[#0D1117] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/25 focus:border-[#7C3AED]/40 focus:outline-none focus:ring-1 focus:ring-[#7C3AED]/20 font-mono — placeholder: "Type a message... (or press Esc for voice)"
- Right: Send button — bg-[#7C3AED] disabled:bg-[#7C3AED]/30 w-8 h-8 rounded-lg flex items-center justify-center — arrow-right SVG icon (14px) white
- TOGGLE BACK: small waveform/mic icon button at far right with tooltip "Switch to voice" — onClick: setIsVoiceMode(true)

Also: keyboard shortcut — Escape key when text input focused returns to voice mode.

TRANSITIONS: all mode switches use transition-all duration-200 ease-in-out.

'use client'. Tailwind only. useState and useEffect only (no external libraries).
```
