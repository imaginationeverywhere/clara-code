# Magic Patterns Prompt — Clara Code App: Code Editor Panel

**File target:** `packages/web-ui/src/app/(app)/components/CodePanel.tsx`
**Type:** Client Component ('use client')

---

## CONTEXT FOR MAGIC PATTERNS — READ FIRST
**This is a DESKTOP APPLICATION, not a web page or mobile app.**
Design like VS Code or Cursor's code editor panel — NOT a web code block.
- 13px monospace font. 1.7 line height. Line numbers flush left.
- Active line background highlight spans the full panel width.
- Tabs at top are compact (36px tall). No large headers.
- This panel fills the remaining center space between two fixed-width sidebars.
- Dark terminal aesthetic (#0D1117). No rounded corners on the main editor area.

---

## Prompt

```
Create a syntax-highlighted code editor display panel for Clara Code IDE. This is a DISPLAY component
(not an editable textarea) — it renders pre-formatted code with line numbers and highlighting.

**Container (h-full flex flex-col bg-[#0D1117] overflow-hidden):**

TAB BAR (h-9 flex items-center border-b border-white/6 bg-[#0A0E14] px-2 gap-1 overflow-x-auto flex-shrink-0):
- Tab 1 (ACTIVE): rounded-t-md bg-[#0D1117] border-t border-l border-r border-white/8 border-b-0 px-3 py-1.5 flex items-center gap-2 text-white text-[12px] font-mono
  - React file icon (small blue atom, w-3.5 h-3.5, text-[#4F8EF7])
  - "page.tsx" text-white
  - Close x button: hover:text-white text-white/30 ml-2 text-[10px]
- Tab 2 (INACTIVE): px-3 py-1.5 flex items-center gap-2 text-white/40 text-[12px] font-mono hover:text-white/60 cursor-pointer
  - React icon text-[#4F8EF7]/40
  - "layout.tsx"

CODE AREA (flex-1 overflow-auto relative):

CODE DISPLAY (flex, font-mono text-[13px] leading-[1.7]):

LINE NUMBERS column (select-none pr-4 pl-4 text-right text-white/18 flex-shrink-0, min-w-[52px]):
- Lines 1 through ~20, each on its own line-height row
- Current line (line 5): text-white/40 (slightly brighter)

CODE column (pr-8 pl-2, overflow-x-auto flex-1):

Render this EXACT code with syntax highlighting — TypeScript/React:

Line 1:  import type { Metadata } from 'next'
Line 2:  (blank)
Line 3:  export const metadata: Metadata = {
Line 4:    title: 'Clara Code — Voice-First Coding',
Line 5:    description: 'Code with your voice.',  ← ACTIVE LINE (bg-white/[0.03] highlight extending full width)
Line 6:  }
Line 7:  (blank)
Line 8:  export default function Home() {
Line 9:    return (
Line 10:     <main className="min-h-screen bg-[#0D1117]">
Line 11:       <Hero />
Line 12:       <Features />
Line 13:       <Pricing />
Line 14:     </main>
Line 15:   )
Line 16: }

SYNTAX COLORS:
- Keywords (import, export, const, default, function, return): text-[#7C3AED] font-medium
- Type annotations (Metadata, string): text-[#4F8EF7]
- String values (in quotes): text-[#10B981]
- JSX tags (<main, <Hero, <Features, <Pricing, />): text-red-400/80
- JSX attributes (className): text-yellow-400/70
- Plain identifiers (metadata, Home, title, description): text-white/85
- Braces, parens, brackets: text-white/45
- Comments: text-white/30 italic

ACTIVE LINE (line 5): full-width bg-white/[0.025] highlight, left border: border-l-2 border-[#7C3AED]/40

BLINKING CURSOR: After last char on line 5. Implement as a 1px wide, line-height tall div
with bg-white and animate-pulse (2s cycle) — positioned inline after "voice.',".

AI DIFF INDICATOR (optional, shown on lines 10-14):
- Left border: border-l-2 border-[#10B981]/40 on lines 10-14
- "+)" small badge top-right of the diff block: text-[#10B981] text-[10px] bg-[#10B981]/8 rounded px-1.5

SCROLL INDICATOR (bottom-right corner of code area):
- Small "Ln 5, Col 38" text-[11px] text-white/20 font-mono absolute bottom-2 right-4

'use client' for cursor animation. No actual editor library — pure HTML/Tailwind rendering.
The code is hardcoded/static in this prompt; real integration comes later.
```
