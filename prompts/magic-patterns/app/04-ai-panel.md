# Magic Patterns Prompt — Clara Code App: AI Assistant Panel

**File target:** `packages/web-ui/src/app/(app)/components/AIPanel.tsx`
**Type:** Client Component ('use client')

---

## CONTEXT FOR MAGIC PATTERNS — READ FIRST
**This is a DESKTOP APPLICATION, not a web page or mobile app.**
Design like a Cursor AI chat panel or GitHub Copilot chat — NOT a full-page chat app.
- Fixed 18rem width sidebar. No full-screen modals.
- Dense message bubbles. 12px body text in the panel.
- Code blocks inside chat are compact (11px monospace). No large padding.
- The panel is always visible alongside the code editor — not a modal or overlay.
- Dark terminal aesthetic (#090D12). Compact quick-action pills at bottom.

---

## Prompt

```
Create an AI assistant response panel for Clara Code — the right sidebar of the voice-first IDE.
This shows AI responses, voice transcripts, and generated code from the conversation.

**Container (h-full flex flex-col bg-[#090D12] border-l border-white/6):**

PANEL HEADER (h-10 flex items-center justify-between px-4 border-b border-white/6 flex-shrink-0):
- Left: flex items-center gap-2
  - Clara avatar circle: w-6 h-6 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#4F8EF7] flex items-center justify-center text-white text-[10px] font-bold — "C"
  - "Clara" text-white text-sm font-medium
  - Status dot: w-1.5 h-1.5 rounded-full bg-[#10B981] — online indicator
- Right: icon button (w-6 h-6 text-white/25 hover:text-white/60) — expand/minimize icon

MESSAGES AREA (flex-1 overflow-y-auto p-3 space-y-3):

MESSAGE 1 — Voice transcript (what the user said):
- flex items-start gap-2 justify-end (right-aligned, user message)
- Bubble: bg-[#7C3AED]/12 border border-[#7C3AED]/15 rounded-2xl rounded-tr-sm px-3 py-2 max-w-[85%]
- Top label: text-[10px] text-[#7C3AED]/60 mb-1 flex items-center gap-1 — mic icon (10px) + "Voice input"
- Text: text-[12px] text-white/80 font-mono italic — "Add a hero section with a large microphone button and the tagline 'Code with your voice'"

MESSAGE 2 — AI response:
- flex items-start gap-2 (left-aligned, AI message)
- Avatar: w-5 h-5 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#4F8EF7] text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5 — "C"
- Bubble: bg-white/[0.04] border border-white/6 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[90%]
- Text: text-[12px] text-white/75 leading-relaxed — "Creating a hero section with voice-first design. Here's what I'm adding:"
- Code block below text: bg-[#0D1117] rounded-xl border border-white/6 px-3 py-2.5 mt-2 overflow-x-auto
  - text-[11px] font-mono
  - Line 1: text-[#7C3AED] "export default function" + text-white/80 " Hero() {"
  - Line 2: text-white/50 "  return ("
  - Line 3: text-red-400/70 "    <section" + text-yellow-400/60 " className" + text-white/50 "=" + text-[#10B981] '"min-h-screen flex..."' + text-red-400/70 ">"
  - Line 4: text-white/50 "    ..."
  - Line 5: text-red-400/70 "    </section>"
  - Line 6: text-white/50 "  )"
  - Line 7: text-white/50 "}"
- Below code block: two action buttons (flex gap-2 mt-2):
  - "Apply changes" — bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] text-[11px] rounded-lg px-2.5 py-1 hover:bg-[#10B981]/15 flex items-center gap-1.5 — checkmark icon
  - "View diff" — bg-white/4 border border-white/8 text-white/50 text-[11px] rounded-lg px-2.5 py-1 hover:bg-white/6 flex items-center gap-1.5 — diff icon

MESSAGE 3 — AI "Thinking" state:
- Same left-aligned layout
- Bubble: bg-white/[0.03] border border-white/5 rounded-2xl px-3 py-2
- Shimmer animation: three dots (w-1.5 h-1.5 rounded-full bg-white/30) with staggered animate-bounce
- Label below: text-[10px] text-white/20 — "Clara is thinking..."

BOTTOM ACTIONS (flex-shrink-0 border-t border-white/6 p-3):
- Two rows:

Row 1: flex gap-2 (quick action pills):
- Each: text-[11px] text-white/45 bg-white/4 border border-white/8 rounded-full px-2.5 py-1 hover:bg-white/6 hover:text-white/70 cursor-pointer transition-colors
- "Explain this code" | "Add tests" | "Fix errors"

Row 2: tiny context info (flex items-center justify-between mt-2):
- Left: "3 exchanges · this file" text-[10px] text-white/20
- Right: "Clear" text-[10px] text-white/20 hover:text-white/50 cursor-pointer underline

'use client' for the thinking animation. Tailwind only. animate-bounce for thinking dots.
```
