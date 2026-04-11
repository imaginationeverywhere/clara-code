# Magic Patterns Prompt — CLI Terminal Experience

**File target:** `packages/web-ui/src/app/(marketing)/components/CliDemo.tsx`
**Type:** Server Component — static terminal mockup shown in marketing hero / features section

---

## CONTEXT FOR MAGIC PATTERNS — READ FIRST

Clara Code is a voice-first AI coding assistant. Beyond the IDE, it ships a **CLI** — `@clara/cli`. Hardcore developers who live in the terminal run `npx install claracode@latest`, then type `clara`, and a full terminal UI (TUI) appears. No GUI. No Electron. Pure terminal — with voice. This is Clara Code's secret weapon with developers who think IDEs are too heavy.

This component renders a **macOS terminal window mockup** showing TWO sequential states:
1. The install sequence (`npx install claracode@latest`) — what you see during install
2. The running TUI (`clara`) — what appears when you first launch Clara in the terminal

The TUI should look like nothing a developer has ever seen in a terminal before. Waveform bars using unicode blocks. Box-drawing characters for file output. A persistent status bar. Voice transcript inline. This is the screenshot that gets posted on Hacker News and goes viral.

This mockup is used as a **marketing component** — it renders on the marketing site as a demo screenshot. The actual TUI is built with Ink (React for CLIs). This design guides both.

---

## Prompt

```
Create a terminal window mockup component for claracode.ai showing the Clara Code CLI experience. This is a marketing demo — a realistic macOS terminal screenshot rendered as a web component. Two panels side by side showing the install flow and the running TUI.

OUTER WRAPPER:
- max-w-5xl mx-auto
- Two terminal windows side by side (flex gap-4 items-start)
- Both windows share the same macOS terminal frame style

TERMINAL WINDOW FRAME (applied to both):
- bg-[#09090F] rounded-2xl overflow-hidden border border-white/8
- shadow-[0_40px_80px_rgba(0,0,0,0.6)]

TERMINAL TITLE BAR (for each window):
- Height: h-10
- bg-[#13141A] border-b border-white/6
- flex items-center px-4 gap-2
- Three dots: 10px circles — #FF5F57 (close), #FEBC2E (minimize), #28C840 (expand), gap 6px
- After dots: centered title — font-mono text-[12px] text-white/35
  - Window 1: "Terminal — zsh"
  - Window 2: "Terminal — clara"
- Right of title bar: small pill — "zsh" or "clara" in bg-white/6 rounded-full px-2 py-0.5 text-[10px] font-mono text-white/30

---

WINDOW 1 — THE INSTALL SEQUENCE (slightly narrower, ~420px):

Terminal body: p-5 font-mono text-[13px] leading-7 bg-[#09090F]

Line 1 — user prompt:
  "amenray@macbook ~ % " text-white/35 + "npx install claracode@latest" text-white/85

Line 2 (blank gap)

Line 3 — download:
  "⠹ " text-[#7C3AED] (spinner char) + "Downloading @clara/cli@1.0.0..." text-white/45

Lines 4-7 — install progress (each line):
  "  + @clara/core@1.0.0" text-white/30
  "  + @clara/voice@1.0.0" text-white/30
  "  + @clara/sdk@1.0.0" text-white/30
  "  + @clara/vault@1.0.0" text-white/30

Line 8 (blank)

Line 9 — success:
  "✓ " text-[#10B981] + "claracode@1.0.0 installed" text-white/70

Line 10 (blank)

Line 11 — next step hint box (draw with box chars):
  "┌─────────────────────────────────┐" text-white/20
  "│  Run " text-white/20 + "clara" text-[#7BCDD8] + " to get started      │" text-white/20
  "│  Docs: claracode.ai/docs        │" text-white/20
  "└─────────────────────────────────┘" text-white/20

Line 12 (blank)

Line 13 — new prompt:
  "amenray@macbook ~ % " text-white/35 + "clara" text-white/85

Line 14 — blinking cursor:
  "█" text-[#7C3AED] animate-pulse

---

WINDOW 2 — THE RUNNING TUI (wider, ~580px):

This is what appears after you type `clara`. The entire terminal becomes the Clara TUI. No shell prompt visible — Clara owns the screen.

Terminal body: p-0 bg-[#09090F] overflow-hidden

TOP BAR (h-9 bg-[#0A0E14] border-b border-white/8 flex items-center justify-between px-4):
  LEFT: Clara mark — two tiny silhouette shapes in Clara Blue #7BCDD8, 14px + "Clara" text-[#7BCDD8] font-mono text-[13px] font-semibold + " Code" text-white/35 font-mono text-[13px]
  CENTER: "v1.0.0" — text-[11px] font-mono text-white/20
  RIGHT: flex items-center gap-4
    - "amenray2k" — text-[12px] font-mono text-white/35
    - "·" text-white/20
    - "Pro" — text-[11px] font-mono text-[#7C3AED] bg-[#7C3AED]/10 border border-[#7C3AED]/20 rounded-md px-1.5 py-0.5
    - "·" text-white/20
    - "claude-sonnet-4-6" — text-[11px] font-mono text-white/25

MAIN CONTENT AREA (p-5 font-mono text-[13px] leading-7 bg-[#09090F]):

SECTION 1 — Voice active indicator:
  Waveform row (flex items-end gap-[3px] h-8 mb-1):
    16 unicode bars using div heights — all bg-[#7C3AED] rounded-sm width 4px each:
    Heights (px): 4, 8, 16, 24, 28, 20, 12, 28, 24, 16, 28, 20, 8, 24, 12, 4
    (The bars form a waveform shape — taller in the middle)
  "  Listening..." — text-[#7C3AED] text-[12px] ml-1 inline (same line as end of bars)

Blank line

SECTION 2 — Voice transcript (what was just said):
  "▶ " text-[#7C3AED] + "'Create a loading skeleton for the dashboard'" text-[#10B981]

Blank line

SECTION 3 — Clara thinking/working:
  "  " + "●" text-[#7C3AED] animate-pulse + " Analyzing project structure..." text-white/40

  "  src/" text-white/30
  "    components/" text-white/30
  "    ✓ " text-[#10B981] + "dashboard/" text-white/50 + "  ← writing here" text-white/20

Blank line

SECTION 4 — Generated file output (box drawing):
  "┌─ DashboardSkeleton.tsx " text-white/20 + "─────────────────────┐" text-white/20

  Code lines inside the box (each line has "│ " prefix and " │" suffix in text-white/20):
  "│ " + "import " text-[#7C3AED] + "{ " text-white/45 + "Skeleton" text-[#4F8EF7] + " } " text-white/45 + "from " text-[#7C3AED] + "'./ui/skeleton'" text-[#10B981] + "  │"
  "│                                           │" text-white/20
  "│ " + "export default " text-[#7C3AED] + "function " text-white/85 + "DashboardSkeleton" text-[#A8DDE5] + "() {" text-white/45 + "  │"
  "│   " + "return " text-[#7C3AED] + "(" text-white/45 + "                           │"
  "│     " + "<div " text-[#7BCDD8] + "className" text-[#FBBF24] + "=" text-white/85 + "'space-y-4'" text-[#10B981] + ">         │"
  "│       " + "<Skeleton " text-[#7BCDD8] + "className" text-[#FBBF24] + "=" text-white/85 + "'h-8 w-48'" text-[#10B981] + " />   │"
  "│       " + "<Skeleton " text-[#7BCDD8] + "className" text-[#FBBF24] + "=" text-white/85 + "'h-32 w-full'" text-[#10B981] + " /> │"
  "│     " + "</div>" text-[#7BCDD8] + "                            │"
  "│   " + ")" text-white/45 + "                                 │"
  "│ " + "}" text-white/45 + "                                   │"

  "└────────────────────────────────────────────┘" text-white/20

Blank line

SECTION 5 — Success + apply prompt:
  "✓ " text-[#10B981] + "DashboardSkeleton.tsx" text-white/70 + " created in " text-white/40 + "./src/components/" text-[#10B981]

  Blank line

  "  Apply to project? " text-white/50 + "[Y]es" text-[#10B981] + " / " text-white/20 + "[n]o" text-white/30 + " / " text-white/20 + "[e]dit" text-white/30

BOTTOM STATUS BAR (mt-auto h-8 bg-[#050509] border-t border-white/6 flex items-center px-4 gap-6 absolute bottom-0 w-full):
  - "VOICE" — bg-[#7C3AED]/15 text-[#7C3AED] text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md
  - "·" text-white/20
  - "[Space] Voice" — text-[11px] font-mono text-white/30
  - "[/] Command" — text-[11px] font-mono text-white/30
  - "[?] Help" — text-[11px] font-mono text-white/30
  - "[q] Quit" — text-[11px] font-mono text-white/30
  - Right edge: "claracode.ai/docs" — text-[11px] font-mono text-white/20 ml-auto

---

LABEL BELOW THE TWO WINDOWS (text-center mt-6):
  "$ npx install claracode@latest" — font-mono text-[13px] text-white/30
  " → " text-white/20
  "$ clara" — font-mono text-[13px] text-[#7BCDD8]

Below that (mt-2):
  "Voice-first. Terminal-native. No GUI required." — text-[14px] text-white/40 font-mono

---

SUBTLE GLOW behind the windows:
  - Purple radial glow behind window 2: absolute pointer-events-none, width 600px, height 400px, bg-[#7C3AED]/8 blur-[80px], centered behind the TUI window

FONT: JetBrains Mono for ALL content inside terminal windows. Inter only for the label below.
Both windows: no border-radius on inner content, only on the outer frame (rounded-2xl).
Background of terminal content: always bg-[#09090F] — deepest dark.
```
