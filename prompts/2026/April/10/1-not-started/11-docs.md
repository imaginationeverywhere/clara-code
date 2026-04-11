# Magic Patterns Prompt — Documentation Page

**File target:** `packages/web-ui/src/app/(marketing)/docs/[...slug]/page.tsx`
**Type:** Server Component (MDX rendered, static generation)

---

## CONTEXT FOR MAGIC PATTERNS — READ FIRST

This is the documentation site for claracode.ai — a voice-first AI coding assistant. The docs live at `claracode.ai/docs`. The audience is developers who just installed Clara Code and need to understand the CLI, SDK, API, voice system, and self-hosting. Aesthetic reference: Vercel docs, Clerk docs, Linear changelog — dark, dense, scannable. Three-column layout: left nav (doc tree) + center content (MDX) + right TOC (on-page anchors). Clara Code is open source — every page has an "Edit on GitHub" link.

The center content area should render a real example doc page: "Quick Start — Your First Voice Command." This makes the design feel alive and shows how code blocks, callouts, and step-by-step content actually look.

---

## Prompt

```
Design a documentation page for claracode.ai — voice-first AI coding assistant. Three-column layout. Dark terminal aesthetic — same bg-[#0D1117] base as the rest of the site. This is a developer reference, not a marketing page. Dense, scannable, precise.

OVERALL LAYOUT:
- min-h-screen bg-[#0D1117]
- Three columns: Left nav (fixed 256px) + Center content (flex-1, max-w-3xl) + Right TOC (fixed 224px)
- Header: shared site header (same sticky header from the marketing site — Clara Code mark + nav)
- Below header: three-column flex layout fills remaining viewport height

---

LEFT NAV (256px, fixed, full height):
- bg-[#0A0E14] border-r border-white/6
- overflow-y-auto, pt-4 px-3

SEARCH BAR (top of left nav):
- bg-[#070A0F] border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2 mb-6 cursor-pointer
- Search icon (Lucide Search, 14px, text-white/25)
- "Search docs..." — text-[13px] font-mono text-white/25
- Right: kbd shortcut — "⌘K" in bg-white/6 border border-white/10 rounded-md px-1.5 py-0.5 text-[11px] text-white/30 font-mono

VERSION SELECTOR (below search):
- flex items-center gap-2 mb-6 px-1
- "v1.0" in bg-white/6 border border-white/10 rounded-md px-2 py-1 text-[11px] text-white/45 font-mono
- ChevronDown 12px text-white/25

NAV SECTIONS (collapsible tree):

Section label style: text-[10px] font-semibold uppercase tracking-[0.15em] text-white/25 px-2 mt-5 mb-1.5

Sections and items:

"GETTING STARTED":
- Introduction
- Quick Start (ACTIVE)
- Installation
- First Voice Command

"CLI REFERENCE":
- Overview
- clara init
- clara run
- clara voice
- clara vault
- clara agent

"API REFERENCE":
- Authentication
- Voice Endpoints
- Vault Endpoints
- Agent Endpoints
- Rate Limits
- Error Codes

"SDK — @clara/sdk":
- ClaraClient
- useClaraVoice
- useClaraChat
- ClaraWidget
- ClaraCodeBadge

"VOICE":
- How Voice Works
- STT Pipeline
- TTS Pipeline
- Voice Cloning
- Supported Languages

"SELF-HOSTING":
- Docker Setup
- Environment Variables
- Modal Voice Server
- Database

"CONTRIBUTING":
- Code of Conduct
- Contributing Guide
- Architecture Overview

NAV ITEM style:
- flex items-center gap-2 px-2 py-1.5 rounded-lg text-[13px] font-mono cursor-pointer w-full
- Default: text-white/45
- Hover: text-white/70 bg-white/4
- ACTIVE: text-white bg-[#7C3AED]/12 (show "Quick Start" active)
- Active has a 2px left accent bar (absolute left-0, inset-y-1.5, bg-[#7C3AED], rounded-full)

Left nav footer (pinned bottom, pt-3 border-t border-white/6 mt-4):
- "Edit this page on GitHub" — flex items-center gap-1.5 text-[12px] text-white/30 hover:text-white/60 font-mono
  - Github icon 14px

---

CENTER CONTENT AREA (flex-1, max-w-3xl, mx-auto, py-12 px-8):

Render the "Quick Start" doc page content. This shows what a real docs page looks like:

BREADCRUMB (mb-8):
- "Docs / Getting Started / Quick Start" — text-[12px] text-white/30 font-mono flex items-center gap-2
- ChevronRight icons 12px text-white/20 between segments

PAGE HEADER:
- h1: "Quick Start" — Inter, 36px, font-bold, text-white, tracking-tight
- p below: "Get Clara Code running in under 5 minutes. Your first voice command will feel like magic." — 17px, text-white/55, mt-3, leading-relaxed

METADATA ROW (mt-4 mb-8 flex items-center gap-4 pb-6 border-b border-white/8):
- "Last updated Apr 10, 2026" — text-[12px] text-white/30 font-mono
- Divider dot ·
- "4 min read" — text-[12px] text-white/30 font-mono
- Divider dot ·
- "Edit on GitHub →" — text-[12px] text-[#7BCDD8] hover:underline font-mono flex items-center gap-1 (ExternalLink 12px)

---

CONTENT BODY (space-y-8):

SECTION 1: Prerequisites callout box:
- bg-[#0A0E14] border border-white/8 rounded-xl p-5
- Top row: flex items-center gap-2 — Info icon 16px text-[#4F8EF7] + "Prerequisites" — 14px font-semibold text-white font-mono
- List (mt-2 space-y-1.5 font-mono text-[13px] text-white/55):
  - "· Node.js 18 or higher"
  - "· A Clara Code account (free)"
  - "· macOS, Linux, or Windows"

SECTION 2:
- h2: "1. Install the CLI" — Inter, 22px, font-bold, text-white, mt-8 mb-4
- Paragraph: "Install the Clara Code CLI globally using npm, yarn, or pnpm:" — 15px text-white/65 leading-relaxed mb-3

CODE BLOCK (install):
- Container: bg-[#070A0F] border border-white/8 rounded-xl overflow-hidden
- Top bar: flex items-center justify-between px-4 py-2 border-b border-white/6 bg-[#09090F]
  - Left: flex gap-3 — three macOS dots (6px circles): #FF5F57, #FEBC2E, #28C840
  - Center: "Terminal" — text-[11px] font-mono text-white/30
  - Right: Copy icon 14px text-white/30 hover:text-white/60 cursor-pointer
- Code area: px-5 py-4 font-mono text-[13px] leading-7
  - Line 1: "$ " text-white/30 + "npm install" text-white/85 + " -g " text-white/85 + "@clara/cli" text-[#10B981]
  - Line 2 (below, after a moment): "✓ " text-[#10B981] + "Clara CLI v1.0.0 installed" text-white/55

SECTION 3:
- h2: "2. Authenticate" — same h2 style, mt-8 mb-4
- Paragraph: "Connect the CLI to your Clara account. This opens your browser:" — 15px text-white/65 mb-3

CODE BLOCK (auth):
- Same container style
- Line 1: "$ " text-white/30 + "clara login" text-white/85
- Line 2 (output): "Opening claracode.ai in your browser..." text-white/40
- Line 3 (success): "✓ " text-[#10B981] + "Authenticated as " text-white/55 + "amenray2k" text-[#7BCDD8] + " (Pro)" text-white/30

SECTION 4:
- h2: "3. Initialize a project" — mt-8 mb-4
- Paragraph: "In your project directory, run:" — 15px text-white/65 mb-3

CODE BLOCK:
- "$ " text-white/30 + "clara init" text-white/85
- "✓ " text-[#10B981] + "Clara initialized in " text-white/55 + "./my-project" text-[#10B981]
- "✓ " text-[#10B981] + ".clararc" text-[#A8DDE5] + " created" text-white/55

SECTION 5:
- h2: "4. Your first voice command" — mt-8 mb-4
- Paragraph: "Hold the mic button (or press Ctrl+Space) and say what you want built:" — 15px text-white/65 mb-3

VOICE COMMAND DEMO BLOCK (special callout):
- bg-[#0A0E14] border border-[#7C3AED]/20 rounded-xl p-5
- Waveform row: flex items-center gap-1 mb-3
  - 12 bars (3px wide, heights 4px–20px, bg-[#7C3AED] rounded-full)
  - "Listening..." text-[12px] font-mono text-[#7C3AED] ml-3
- Transcript: "▶ 'Create a React button component with loading state'" — text-[13px] font-mono text-[#10B981] mt-2
- Response (below after a divider): "Creating Button.tsx..." — text-[12px] font-mono text-white/40 mt-3

INLINE CODE BLOCK (one file created):
- bg-[#070A0F] border border-white/6 rounded-xl p-4 mt-3 font-mono text-[12px] leading-6
- 8 lines of JSX with syntax highlighting:
  - Line 1: "import " text-[#7C3AED] + "{ useState }" text-white/85 + " from " text-[#7C3AED] + "'react'" text-[#10B981]
  - Line 2: blank
  - Line 3: "export default " text-[#7C3AED] + "function " text-[#A8DDE5] + "Button" text-[#A8DDE5] + "({ " text-white/45 + "onClick, children, loading" text-[#FBBF24] + " }) {" text-white/45
  - Line 4 (indented 2): "return " text-[#7C3AED] + "(" text-white/45
  - Line 5 (indented 4): "<button " text-[#7BCDD8] + "onClick" text-[#FBBF24] + "={onClick} " text-white/85 + "disabled" text-[#FBBF24] + "={loading}>" text-white/85
  - Line 6 (indented 6): "{loading " text-white/85 + "? " text-[#7C3AED] + "'Loading...' " text-[#10B981] + ": " text-[#7C3AED] + "children}" text-white/85
  - Line 7 (indented 4): "</button>" text-[#7BCDD8]
  - Line 8 (indented 2): ")" text-white/45

SUCCESS CALLOUT below code:
- flex items-center gap-2 mt-4 text-[13px] font-mono text-[#10B981]
- CheckCircle icon 16px text-[#10B981]
- "Button.tsx created in ./src/components/"

---

PREV / NEXT NAV (mt-16 pt-6 border-t border-white/8 flex justify-between):
- LEFT: "← Introduction" — flex items-center gap-2 text-[14px] text-white/45 hover:text-white font-mono
  - "Previous" label above in text-[11px] text-white/25 uppercase tracking-wider mb-1
- RIGHT: "Installation →" — flex items-center gap-2 text-[14px] text-white/45 hover:text-white font-mono text-right
  - "Next" label above, text-right

---

RIGHT TOC (224px, fixed right, full height):
- bg-[#0D1117] border-l border-white/6 pl-6 pt-12
- Label: "ON THIS PAGE" — text-[10px] font-semibold uppercase tracking-[0.15em] text-white/25 font-mono mb-4

TOC items (space-y-2):
- "Prerequisites" — text-[13px] font-mono text-white/35 hover:text-white/65
- "1. Install the CLI" — text-[13px] font-mono text-white/35 hover:text-white/65
- "2. Authenticate" — text-[13px] font-mono text-[#7BCDD8] (ACTIVE — currently in viewport)
- "3. Initialize a project" — text-[13px] font-mono text-white/35
- "4. Your first voice command" — text-[13px] font-mono text-white/35

Active item has a 2px left bar in #7BCDD8 (relative, before pseudo, absolute left-0).

TOC footer (mt-8 pt-6 border-t border-white/6 space-y-3):
- "Edit this page →" — text-[12px] text-white/30 hover:text-white/55 font-mono flex items-center gap-1.5 (Pencil icon 12px)
- "Report an issue →" — text-[12px] text-white/30 hover:text-white/55 font-mono flex items-center gap-1.5 (AlertCircle icon 12px)
- "GitHub →" — text-[12px] text-white/30 hover:text-white/55 font-mono flex items-center gap-1.5 (Github icon 12px)

---

FONTS: Inter for h1, h2, body paragraph text. JetBrains Mono for ALL code, terminal output, nav labels, TOC, breadcrumbs, metadata.
SCROLLBAR: 4px, transparent track, white/10 thumb, white/20 on hover.
Page bg: bg-[#0D1117] throughout. No light surfaces.
```
