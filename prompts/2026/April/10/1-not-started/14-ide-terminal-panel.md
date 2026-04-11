# Magic Patterns Prompt — IDE Integrated Terminal Panel

**File target:** `src/clara/terminal/TerminalPanel.tsx` (VS Code fork — not web-ui)
**Type:** Client Component (IDE surface — integrated terminal panel, bottom of IDE)

---

## CONTEXT FOR MAGIC PATTERNS — READ FIRST

**This is NOT the standalone CLI.** The standalone CLI (`clara` in iTerm2 / Warp / any terminal) is designed in `12-cli-terminal.md` — full screen, owns the whole terminal canvas.

This is the **integrated terminal panel** inside the Clara Code IDE — the bottom panel that appears when you press `Ctrl+\`` or click "Terminal" in the panel tabs. It lives in a constrained pane (~280px tall) below the code editor. The key difference: this terminal knows it's inside Clara Code. It has a voice shortcut already wired to the IDE's mic permission. When Clara executes a voice command from the main voice bar, output can appear here. Developers who use the IDE can drop into this terminal for power operations without leaving the IDE — and Clara is still listening.

**Two tabs:** "TERMINAL" (plain shell — zsh/bash) and "CLARA" (Clara-aware terminal with voice indicator). The Clara tab is what we're designing.

The integrated terminal panel is **height-constrained** — no full-screen waveforms, no box-drawing file previews. Everything must work in a ~280px pane. Content is dense, efficient, scannable.

---

## Prompt

```
Design the integrated terminal panel for the Clara Code IDE — the bottom panel tab. This is NOT a full-screen TUI. It's a constrained pane (~280px tall) at the bottom of the VS Code fork, below the code editor. Dark terminal aesthetic. Dense, efficient. Two tabs at the top of the panel: "TERMINAL" (plain shell) and "CLARA" (Clara-aware — show this as active).

PANEL OUTER CONTAINER:
- Full width of the IDE editor column
- Height: 280px (the panel height — resizable handle implied at top)
- bg-[#09090F]
- border-t border-white/6
- flex flex-col

TOP BAR (h-9 flex items-center px-3 border-b border-white/6 bg-[#0A0E14] flex-shrink-0):

Left — TABS:
  Tab style default: px-4 h-9 flex items-center text-[12px] font-mono text-white/35 border-b-2 border-transparent cursor-pointer hover:text-white/55
  Tab style ACTIVE: px-4 h-9 flex items-center text-[12px] font-mono text-white border-b-2 border-[#7C3AED]

  Tab 1: "TERMINAL" — default state
  Tab 2: "CLARA" — ACTIVE, show purple underline + "· voice" badge inline:
    After "CLARA" text: 6px gap + small dot bg-[#7C3AED] w-1.5 h-1.5 rounded-full animate-pulse

Right — actions (ml-auto flex items-center gap-1):
  - Plus icon (new terminal) — 16px, text-white/25 hover:text-white/50 cursor-pointer p-1
  - Trash icon (clear) — 16px, text-white/25 hover:text-white/50 cursor-pointer p-1
  - ChevronDown icon (minimize panel) — 16px, text-white/25 hover:text-white/50 cursor-pointer p-1
  - X icon (close panel) — 16px, text-white/25 hover:text-white/50 cursor-pointer p-1

VOICE STATUS STRIP (h-7 flex items-center gap-3 px-4 bg-[#070A0F] border-b border-white/5 flex-shrink-0):
  LEFT:
    - 8 compact waveform bars (2px wide, heights 2px–12px, bg-[#7C3AED] rounded-sm, gap-0.5, flex items-end)
    - "Listening" — text-[11px] font-mono text-[#7C3AED] ml-2
  CENTER (flex-1 text-center):
    - "Hold " — text-[11px] font-mono text-white/20
    - "Ctrl+Space" — text-[11px] font-mono text-white/35 bg-white/6 border border-white/10 rounded px-1 py-0.5
    - " to speak" — text-[11px] font-mono text-white/20
  RIGHT:
    - "Text mode →" — text-[11px] font-mono text-white/25 hover:text-white/45 cursor-pointer flex items-center gap-1 (Keyboard icon 10px)

TERMINAL CONTENT AREA (flex-1 overflow-y-auto px-4 py-3 font-mono text-[12px] leading-6):

Show recent history — this is what the last 3 commands + Clara responses look like in the constrained panel:

ITEM 1 — user voice command (past, dimmed):
  Row: flex items-start gap-2
  - Mic icon 10px text-[#7C3AED]/40 mt-1 flex-shrink-0
  - "'Add auth middleware to /api/orders'" — text-white/30 italic

  Response below (indent 14px):
  - "✓ " text-[#10B981]/60 + "middleware/auth.ts updated" text-white/25

ITEM 2 — plain shell command (past, dimmed):
  Row:
  - "$ " text-white/20 + "npm run dev" text-white/40

  Response:
  - "▶ Local: http://localhost:3000" text-white/20

DIVIDER (border-t border-white/5 my-2)

ITEM 3 — CURRENT (active, not dimmed):
  Row: flex items-start gap-2
  - Mic icon 10px text-[#7C3AED] mt-1 flex-shrink-0
  - "'Create a loading skeleton for the dashboard'" — text-[#10B981] (transcript, active)

  Response below (indent 14px, space-y-1):
  - "● " text-[#7C3AED] animate-pulse + " Analyzing src/components/dashboard/..." text-white/50
  - "✓ " text-[#10B981] + " DashboardSkeleton.tsx" text-white/70 + " created" text-white/40
  - "  → " text-white/20 + "src/components/dashboard/DashboardSkeleton.tsx" text-[#7BCDD8] text-[11px]

  Action row (mt-1.5 ml-3 flex items-center gap-3):
  - "Open file" — text-[11px] font-mono text-[#7BCDD8] hover:underline cursor-pointer flex items-center gap-1 (ExternalLink 10px)
  - "·" text-white/20
  - "View diff" — text-[11px] font-mono text-white/35 hover:text-white/60 cursor-pointer
  - "·" text-white/20
  - "Undo" — text-[11px] font-mono text-white/35 hover:text-white/60 cursor-pointer

BLINKING CURSOR ROW (mt-1 ml-3):
  - "▌" text-[#7C3AED] animate-pulse text-[12px]

BOTTOM STATUS BAR (h-6 flex items-center px-4 gap-4 border-t border-white/5 bg-[#070A0F] flex-shrink-0):
  LEFT:
  - "CLARA" badge: bg-[#7C3AED]/10 text-[#7C3AED] text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded
  - "·" text-white/15
  - "zsh — ~/projects/my-app" text-[10px] font-mono text-white/25

  RIGHT (ml-auto flex items-center gap-3):
  - "⌃\`" text-[10px] font-mono text-white/20 (hide/show panel shortcut)
  - "·" text-white/15
  - "Split" — text-[10px] font-mono text-white/20 hover:text-white/40

---

ALSO SHOW (below the main panel mockup, labeled "TERMINAL tab — plain shell" in text-white/20 text-xs):

Show the same panel frame but with TERMINAL tab active and CLARA tab inactive.
Content shows a plain zsh session — no voice strip, no Clara elements:

Voice strip is HIDDEN (or replaced with standard terminal title: "zsh — ~/projects/my-app" in text-white/30 text-[11px])

Terminal content:
  "amenray@macbook my-app % " text-white/30 + "git status" text-white/70
  "On branch main" text-white/40
  "Changes not staged:" text-white/40
  "  modified:   src/components/dashboard/DashboardSkeleton.tsx" text-[#10B981]/70

  "amenray@macbook my-app % " text-white/30 + "█" text-white animate-pulse

---

FONT: JetBrains Mono throughout — all terminal content, labels, badges.
Heights: top bar 36px, voice strip 28px, content flex-1, bottom bar 24px. Total ~280px.
Background stack: outer #09090F, top bar #0A0E14, voice strip #070A0F, bottom bar #070A0F.
No rounded corners on the panel itself — it's flush with the IDE edges.
```
