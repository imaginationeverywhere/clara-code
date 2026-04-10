# Magic Patterns Prompt — Clara Code App: File Tree Panel

**File target:** `packages/web-ui/src/app/(app)/components/FileTree.tsx`
**Type:** Client Component ('use client') — handles expand/collapse and active file selection

---

## CONTEXT FOR MAGIC PATTERNS — READ FIRST
**This is a DESKTOP APPLICATION, not a web page or mobile app.**
Design like VS Code or Cursor's file explorer — NOT a web sidebar.
- Dense row height (28px per item). No card padding. No rounded-xl cards.
- Tiny fonts (12px monospace). Tight spacing.
- Full-height panel, no scrolling page — the tree itself scrolls internally.
- Dark terminal aesthetic (#090D12 sidebar). No light mode.

---

## Prompt

```
Create a collapsible file tree sidebar component for the Clara Code IDE interface.

**Container (h-full flex flex-col bg-[#090D12] border-r border-white/6):**

PANEL HEADER (h-10 flex items-center justify-between px-3 border-b border-white/5 flex-shrink-0):
- Left: "EXPLORER" text-[10px] text-white/25 tracking-[0.15em] uppercase font-medium
- Right: two small icon buttons (w-5 h-5 hover:text-white/60 text-white/25 transition-colors):
  - New file icon (plus in document)
  - New folder icon (plus in folder)

SEARCH (px-2 pt-2 pb-1):
- Input: w-full bg-[#0D1117] border border-white/6 rounded-md px-2.5 py-1.5 text-[11px] text-white/70 placeholder:text-white/20 font-mono focus:outline-none focus:border-[#7C3AED]/30 — placeholder "Search files..."

FILE TREE (flex-1 overflow-y-auto px-1 py-1):

Font: JetBrains Mono, text-[12px]
Indent: pl-4 per level

Root level items (flex items-center h-7 px-2 rounded-md hover:bg-white/4 cursor-pointer gap-1.5):

FOLDER: clara-code (expanded by default)
├── ChevronDown icon (w-3 h-3 text-white/30) — toggles expansion
├── Folder icon (w-3.5 h-3.5 text-[#4F8EF7]/60)
└── "clara-code" text-white/70

  FOLDER: src (expanded)
  ├── ChevronDown icon (text-white/20)
  ├── Folder icon text-[#4F8EF7]/50
  └── "src" text-white/60

    FOLDER: app (expanded)
    └── "app" text-white/55

      FILE: page.tsx (ACTIVE — currently selected)
      - bg-[#7C3AED]/10 border border-[#7C3AED]/15 rounded-md
      - React/TSX icon (w-3.5 h-3.5 text-[#4F8EF7])
      - "page.tsx" text-white (full opacity when active)

      FILE: layout.tsx
      - React icon text-[#4F8EF7]
      - "layout.tsx" text-white/60

      FILE: globals.css
      - CSS icon (w-3.5 h-3.5 text-[#7C3AED]/70)
      - "globals.css" text-white/50

    FOLDER: components (collapsed — ChevronRight)
    └── "components" text-white/55

    FOLDER: lib (collapsed)
    └── "lib" text-white/55

  FILE: package.json
  - JSON icon (text-[#10B981]/60 w-3.5 h-3.5 — use a small {} text or icon)
  - "package.json" text-white/50

  FILE: tsconfig.json
  - JSON icon
  - "tsconfig.json" text-white/50

ICON LEGEND (use text/emoji or small SVG for file type icons — keep all under 14px):
- .tsx/.jsx: small blue atom icon or "⚛" text-[#4F8EF7]
- .ts/.js: small yellow/gold icon or "TS" text-yellow-500/60 text-[9px] font-bold
- .css: purple dot or "≈" text-[#7C3AED]/70
- .json: green braces text-[#10B981]/60 text-[10px]
- .md: gray "M↓" text-white/30 text-[9px]

HOVER STATES: On non-active files: hover:bg-white/4 hover:text-white/80 transition-colors duration-100
ACTIVE: bg-[#7C3AED]/10 border border-[#7C3AED]/15 text-white

BOTTOM SECTION (flex-shrink-0 border-t border-white/5 p-2):
- Two small status items in a row:
  - "main" git branch — small branch icon text-[#10B981]/60 text-[10px] font-mono
  - "● 3 changes" — text-yellow-500/50 text-[10px]

'use client' for expand/collapse. useState for tracking open folders and active file. Tailwind only.
```
