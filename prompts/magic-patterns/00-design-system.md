# Clara Code — Design System

**File target:** Reference doc — paste this into Magic Patterns before generating any component.
**Last updated:** 2026-04-10

---

## CONTEXT — READ FIRST

**Clara Code is a DESKTOP/TERMINAL APPLICATION** — a voice-first AI coding assistant, like VS Code or Cursor but you speak instead of type. There are TWO distinct surfaces with ONE shared token system:

1. **claracode.ai** — the marketing website (dark, dense, developer-grade)
2. **Clara Code App** — the actual IDE interface (terminal aesthetic, 13px mono, no mobile padding)

Design references: Vercel, Cursor, Warp, Linear. NOT consumer apps. NOT mobile-first. NOT rounded bubbly SaaS.

---

## Logo

**The Mark:** Two human face silhouettes sharing one unified form. Left interior: `>_` terminal prompt. Right interior: `{}` `function()` code syntax. Center: glowing S-curve in electric cyan dividing the two minds. Dark background. Flat 2D version for icons; 3D version for hero.

**Logo files:**
- `logo.png` — 2D flat (nav, favicon, small contexts)
- `logo-hero.png` — 3D depth version (hero sections, OG image)

**Origin:** Inspired by the physical bookmark from the Hue-Man Experience Bookstore (Clara Villarosa, Denver/Harlem). The two faces = two minds in dialogue. The S-curve = the voice/code flowing between them.

---

## Color Palette

### Brand Colors
```
--clara-blue:        #7BCDD8   ← THE brand color, pulled from logo background
--clara-blue-glow:   #A8DDE5   ← lighter glow variant (logo face highlights)
--clara-blue-accent: #4DDDFF   ← electric cyan (the glowing code/S-curve in logo)
--purple:            #7C3AED   ← primary action, voice UI, AI identity
--purple-hover:      #6D28D9
--blue:              #4F8EF7   ← code accent, "Code" wordmark, type annotations
--green:             #10B981   ← success, apply, transcripts, strings
```

### Background Stack (dark terminal)
```
--bg-base:     #0D1117   ← page background
--bg-raised:   #0F1318   ← cards, panels
--bg-overlay:  #0A0E14   ← sidebars, header
--bg-sunken:   #070A0F   ← code blocks, inputs
--bg-terminal: #09090F   ← deepest dark (logo background)
```

### Sculptural Darks (logo face palette)
```
--sculpt-900: #150E08
--sculpt-800: #1E1410
--sculpt-700: #2B1810   ← the carved wood face color from the logo
--sculpt-600: #3D2518
--sculpt-500: #52341F
```

### Text Opacity Scale
```
white            → primary text
white/85         → body text
white/70         → secondary text
white/55         → descriptions, subheads
white/45         → captions
white/30         → labels, overlines
white/20         → placeholder, subtle
white/10         → ghost borders
```

### Border Opacity Scale
```
white/8          → default card borders
white/12         → hover state borders
white/20         → active/focus borders
white/30         → strong emphasis
```

---

## Typography

### Fonts
```
body:  Inter (400, 500, 600, 700) — all UI text
code:  JetBrains Mono (400, 700) — all code, terminal, monospace
```

### Size Scale
```
text-[10px]   → micro labels, badges
text-[11px]   → IDE panel text, code blocks in AI panel
text-[12px]   → secondary UI, tab labels
text-[13px]   → IDE body text (VS Code default), primary terminal font
text-[14px]   → marketing body text
text-[15px]   → marketing CTA buttons
text-[17px]   → marketing subheadlines
text-[18px]   → marketing paragraph lead
text-[24px]   → section labels
text-[32px]   → feature titles
text-[40px]   → section headings
text-[64px]   → hero H1
```

### Tracking
```
tracking-tight      → headings
tracking-[0.2em]    → overline labels (UPPERCASE SMALL CAPS)
tracking-wide       → tier labels, category labels
```

---

## Component Patterns

### Buttons

**Primary (purple):**
```
bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-full px-7 py-3.5
text-[15px] font-semibold shadow-[0_0_30px_rgba(124,58,237,0.35)]
```

**Secondary (ghost):**
```
border border-white/15 hover:border-white/30 text-white/70 hover:text-white
rounded-full px-7 py-3.5 text-[15px] transition-colors
```

**IDE action (small):**
```
bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981]
text-[11px] rounded-lg px-2.5 py-1 hover:bg-[#10B981]/15
```

### Cards

**Marketing card:**
```
bg-[#0D1117] rounded-2xl border border-white/8 p-8
```

**Pro/featured card:**
```
ring-1 ring-[#7C3AED]/40 border border-[#7C3AED]/30
bg-gradient-to-b from-[#7C3AED]/8 to-[#0A0E14]
rounded-2xl p-7 shadow-[0_0_60px_rgba(124,58,237,0.15)]
```

**IDE panel:**
```
bg-[#090D12] border-l border-white/6 (right panels)
bg-[#0A0E14] border-r border-white/6 (left panels)
```

### Badges / Pills

**Eyebrow badge:**
```
border border-[#7C3AED]/30 bg-[#7C3AED]/8 text-[#7C3AED]
text-[11px] tracking-[0.15em] uppercase px-4 py-1.5 rounded-full
```

**Most Popular badge:**
```
bg-[#7C3AED] text-white text-[11px] font-semibold tracking-wider
uppercase rounded-full px-4 py-1
```

**GitHub stars pill:**
```
rounded-full bg-white/5 border border-white/10 px-3 py-1.5
text-xs text-white/50 flex items-center gap-1.5
```

### Section Intro Pattern
```
Overline: text-[11px] text-white/30 tracking-[0.2em] uppercase
H2:       text-[40px] font-bold text-white mt-3
Sub:      text-[17px] text-white/45 mt-3
```

### Overline Labels (all caps, tracked)
```
text-[11px] text-white/30 tracking-[0.2em] uppercase
```

---

## Syntax Highlighting Colors (IDE panels)
```
--syn-keyword:   #7C3AED   (import, export, const, function, return)
--syn-type:      #4F8EF7   (Metadata, string, type annotations)
--syn-string:    #10B981   (quoted values)
--syn-function:  #A8DDE5   (function names — Clara blue glow)
--syn-tag:       #7BCDD8   (HTML/JSX tags — full Clara blue)
--syn-attribute: #FBBF24   (JSX attributes, className)
--syn-comment:   white/30  (comments, italic)
--syn-text:      white/85  (plain identifiers)
--syn-bracket:   white/45  (braces, parens)
```

---

## Panel Dimensions (IDE surface)
```
--sidebar-w:   13rem    (file tree left panel)
--ai-panel-w:  18rem    (AI assistant right panel)
--topbar-h:    2.75rem  (menu bar / title bar)
--voicebar-h:  5rem     (bottom voice input bar)
--tabbar-h:    2.25rem  (editor tab strip)
```

---

## Glow / Shadow Tokens

### Purple glows (developer elements)
```
--glow-sm:   0 0 15px rgba(124,58,237,0.25)
--glow-md:   0 0 30px rgba(124,58,237,0.35)
--glow-lg:   0 0 60px rgba(124,58,237,0.20)
--glow-xl:   0 0 80px rgba(124,58,237,0.30)
```

### Clara blue glows (AI identity elements)
```
--glow-clara:    0 0 20px rgba(123,205,216,0.25)
--glow-clara-sm: 0 0 10px rgba(123,205,216,0.20)
--glow-clara-lg: 0 0 40px rgba(123,205,216,0.30)
```

### Mic button glow
```
--glow-mic: 0 0 40px rgba(124,58,237,0.5)
```

### Depth shadows
```
shadow-[0_40px_80px_rgba(0,0,0,0.6)]   (demo preview frames)
shadow-[0_4px_20px_rgba(124,58,237,0.4)] (primary CTA button)
```

---

## Voice-First Interaction Pattern

**Home state = voice.** The mic button is ALWAYS the largest, most prominent element.

```
Mic button (active): 80px circle, bg-[#7C3AED], --glow-mic
Pulse ring:          ring-4 ring-[#7C3AED]/20 animate-ping (2s)
Text toggle:         Small keyboard icon — text-white/30, top-right corner
```

**Voice active state:**
```
Waveform bars: 16 vertical bars (4px–28px), bg-[#7C3AED] rounded-full, gap-1
Transcript: text-[#10B981] font-mono text-xs "▶ 'your voice here'"
```

**Text mode (secondary toggle):**
```
Input: bg-[#070A0F] border border-white/10 rounded-xl px-4 py-3
       text-white/70 font-mono text-sm placeholder:text-white/20
Send button: bg-[#7C3AED]/20 hover:bg-[#7C3AED]/30 text-[#7C3AED] rounded-lg
```

---

## Marketing Site — Layout Rules

- Section wrapper: `py-28` between sections
- Max content width: `max-w-5xl mx-auto` (features), `max-w-4xl mx-auto` (pricing), `max-w-3xl mx-auto` (hero)
- Header: `sticky top-0 z-50 bg-[rgba(13,17,23,0.85)] backdrop-blur-md border-b border-white/5`
- Fine print: `text-[12px] text-white/25`

---

## IDE Surface — Layout Rules

- No `max-width` constraints on panels — they fill their column
- No `rounded` on main editor areas — sharp edges only
- Tab height: `h-9` (36px)
- Line numbers: `min-w-[52px] text-white/18 select-none font-mono text-[13px]`
- Active line: `bg-white/[0.025] border-l-2 border-[#7C3AED]/40`
- Scrollbar: `scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10`

---

## Theme Override — Marketing Site

Marketing site components use slightly lighter surfaces.
Add class `theme-marketing` to flip IDE darks to near-white:
```css
.theme-marketing {
  --bg-base:    #F8FAFC;
  --bg-raised:  #FFFFFF;
  --bg-overlay: #F1F5F9;
}
```
Code blocks and terminal demos inside marketing stay dark — do NOT apply `theme-marketing` to them.

---

## Usage in Magic Patterns

**Before generating any component, paste this doc as context.** Then paste the specific component prompt (hero.md, pricing.md, etc.).

Magic Patterns should be told: *"This is a DESKTOP/TERMINAL APPLICATION. Not a web app, not mobile. Design like VS Code, Cursor, or Warp."*
