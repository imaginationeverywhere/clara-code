# Clara Code — Magic Patterns Design System Setup

Paste these values directly into each section of your "Clara Code" design system in Magic Patterns.

**Set up in this order before generating ANY screens.**

---

## 1. TYPOGRAPHY (magicpatterns.com/.../typography)

### Font Group: Display
- **Font Source:** Google Fonts
- **Font Family:** JetBrains Mono
- **Font Weight:** Bold (700)
- **Use:** Hero code callouts, terminal output, voice waveform labels, monospace hero text

### Font Group: Heading
- **Font Source:** Google Fonts
- **Font Family:** Inter
- **Font Weight:** Bold (700)
- **Use:** Section headings, feature titles, pricing tiers, card titles

### Font Group: Body
- **Font Source:** Google Fonts
- **Font Family:** Inter
- **Font Weight:** Regular (400)
- **Use:** Marketing body copy, descriptions, UI panel text, docs

### Font Group: Label (click "+ Add Font Group")
- **Font Source:** Google Fonts
- **Font Family:** JetBrains Mono
- **Font Weight:** Regular (400)
- **Use:** Code blocks, terminal output, file paths, IDE line numbers, overline labels, syntax text

Hit **Save** after adding all 4 groups.

---

## 2. COLORS (magicpatterns.com/.../colors)

Click **"+ Add"** for each token. Enter the TOKEN name and HEX VALUE exactly as shown.

### Brand — Primary Palette
| TOKEN | VALUE |
|-------|-------|
| Clara Blue | #7BCDD8 |
| Clara Blue Glow | #A8DDE5 |
| Clara Blue Accent | #4DDDFF |
| Purple | #7C3AED |
| Purple Hover | #6D28D9 |
| Blue | #4F8EF7 |
| Green | #10B981 |

### Backgrounds — Dark Terminal Stack
| TOKEN | VALUE |
|-------|-------|
| BG Base | #0D1117 |
| BG Raised | #0F1318 |
| BG Overlay | #0A0E14 |
| BG Sunken | #070A0F |
| BG Terminal | #09090F |

### Sculptural Darks — Logo Face Palette
| TOKEN | VALUE |
|-------|-------|
| Sculpt 900 | #150E08 |
| Sculpt 800 | #1E1410 |
| Sculpt 700 | #2B1810 |
| Sculpt 600 | #3D2518 |
| Sculpt 500 | #52341F |

### Text (Opacity Scale — use closest solid match)
| TOKEN | VALUE |
|-------|-------|
| Text Primary | #FFFFFF |
| Text Body | #D9D9D9 |
| Text Secondary | #B3B3B3 |
| Text Muted | #8C8C8C |
| Text Caption | #737373 |
| Text Label | #4D4D4D |
| Text Ghost | #333333 |

### Borders (Opacity Scale)
| TOKEN | VALUE |
|-------|-------|
| Border Default | #141414 |
| Border Hover | #1F1F1F |
| Border Focus | #333333 |
| Border Strong | #4D4D4D |

### Syntax Highlighting — IDE Panels
| TOKEN | VALUE |
|-------|-------|
| Syn Keyword | #7C3AED |
| Syn Type | #4F8EF7 |
| Syn String | #10B981 |
| Syn Function | #A8DDE5 |
| Syn Tag | #7BCDD8 |
| Syn Attribute | #FBBF24 |
| Syn Comment | #4D4D4D |

**Total: 37 color tokens.** Hit **Save** after adding all.

---

## 3. ICONS (magicpatterns.com/.../icons)

Set to **Lucide (lucide-react)** — this is the correct library.

Pin these specific icons:
- Mic, MicOff, Volume2, AudioWaveform, Radio, Headphones
- Terminal, Code, Code2, Braces, FileCode, FileText
- FolderOpen, Folder, FolderTree, ChevronRight, ChevronDown
- Sparkles, Zap, Bot, Cpu, Layers, Workflow
- Play, Square, RotateCcw, RefreshCw, Loader2
- GitBranch, GitCommit, GitMerge, Github, ExternalLink
- Settings, Settings2, SlidersHorizontal, Sliders
- Search, Filter, Command, Keyboard
- User, Users, LogOut, Shield, Key
- ArrowLeft, ArrowRight, ArrowUp, X, Plus, Minus, MoreHorizontal
- Check, CheckCircle, AlertTriangle, Info, XCircle
- Download, Upload, Package, Box, Star, Heart

---

## 4. RULES (magicpatterns.com/.../rules)

Replace the placeholder text in **Brand Guidelines** with this:

```
Clara Code Brand Guidelines — Magic Patterns Rules

IDENTITY: Clara Code is a DESKTOP/TERMINAL APPLICATION — a voice-first AI coding assistant. Think VS Code or Cursor, but you speak instead of type. There are TWO distinct surfaces: (1) claracode.ai — the marketing website, dark and developer-grade; (2) Clara Code App — the actual IDE interface with terminal aesthetic. Design references: Vercel, Cursor, Warp, Linear. NOT consumer apps. NOT mobile-first. NOT rounded bubbly SaaS.

ORIGIN STORY: The Clara Code logo — two human profile silhouettes facing each other — is directly inspired by the physical bookmark from the Hue-Man Experience Bookstore, Clara Villarosa's legendary Black-owned bookstore in Denver (now Harlem). The two faces represent two minds in dialogue. The glowing S-curve between them is the voice — the code — flowing between them. Left face interior: >_ terminal prompt, $ /command, > run clara. Right face interior: {} function() code syntax. This is not a logo designed from scratch. It is a monument to a real place, a real woman, and a real moment. Every design decision must honor this lineage.

LOGO SYSTEM:
- logo.png — 2D flat illustration (nav, favicon, app icon, small contexts) — two navy face silhouettes on deep dark background #09090F, glowing cyan S-curve dividing center, terminal text left, code syntax right
- logo-hero.png — 3D depth version (hero sections, OG image, large display) — same concept with sculptural depth, luminous glow, photorealistic rendering

VOICE PLATFORM AGENT: Clara — AI voice assistant. A glowing purple mic button is the largest, most prominent element. When active: waveform bars (16 vertical bars, #7C3AED, animated). "Hold mic. Speak. Clara implements." Voice is the default — text is the escape hatch.

DESIGN PHILOSOPHY: Terminal aesthetic. Developer-grade. Dense but precise. Dark backgrounds always. No light mode on the IDE surface. No rounded bubbly shapes — sharp edges on panels, rounded only on buttons and pills. Typography is small and exact (13px for IDE, 14-17px for marketing). This is a tool, not a toy. Inspired by the people who built real things with their hands and minds — the Clara lineage demands excellence.

COLORS — THE PALETTE:
- BG Base #0D1117 — ALL page/panel backgrounds (ALWAYS DARK — NO LIGHT SURFACES)
- BG Terminal #09090F — deepest dark (logo background, code blocks)
- BG Sunken #070A0F — inputs, code areas, inner panels
- Purple #7C3AED — PRIMARY: mic button, voice UI, AI identity elements, primary CTAs
- Clara Blue #7BCDD8 — THE brand color (from logo background): AI identity glows, JSX tags, IDE cursor
- Clara Blue Accent #4DDDFF — electric cyan (the glowing S-curve in logo): active states, transcripts
- Blue #4F8EF7 — code accent, "Code" wordmark color, type annotations
- Green #10B981 — success, apply actions, transcript text, string syntax

HERO SECTIONS: bg-[#0D1117] full-bleed. Clara blue glow emanating from logo area. Purple glow from mic button. Text is always white or white/opacity variants.
MARKETING CARDS: bg-[#0D1117], border border-white/8, rounded-2xl
PRO CARD: ring-1 ring-[#7C3AED]/40, border border-[#7C3AED]/30, bg-gradient-to-b from-[#7C3AED]/8 to-[#0A0E14]
IDE PANELS: sharp edges, bg-[#090D12] (right), bg-[#0A0E14] (left), border-white/6 dividers
BUTTONS PRIMARY: bg-[#7C3AED] rounded-full px-7 py-3.5 text-white shadow-[0_0_30px_rgba(124,58,237,0.35)]
BUTTONS GHOST: border border-white/15 rounded-full px-7 py-3.5 text-white/70

TYPOGRAPHY:
- Inter Bold 700 — hero H1 (64px), section headings (40px), feature titles (32px), pricing (24px)
- Inter SemiBold 600 — card titles, nav links, button labels
- Inter Regular 400 — body copy (14-18px marketing), descriptions
- JetBrains Mono Bold — display code, terminal hero text
- JetBrains Mono Regular — IDE body (13px), code blocks (11px), overlines
- H1: 64px Inter Bold tracking-tight — hero only
- H2: 40px Inter Bold — section headings
- H3: 32px Inter Bold — feature titles
- Body Marketing: 17-18px Inter Regular, text-white/85
- IDE Body: 13px JetBrains Mono, text-white/85
- IDE Panel: 11px JetBrains Mono, text-white/55
- Overlines: 11px JetBrains Mono uppercase tracking-[0.2em] text-white/30
- Labels: 10px JetBrains Mono uppercase — badges, micro text

BORDER RADIUS:
- Primary/Ghost buttons: 9999px (full rounded)
- IDE action buttons: 8px (rounded-lg)
- Marketing cards: 16px (rounded-2xl)
- Badges/pills: 9999px
- IDE panels: 0px — sharp edges only
- Inputs: 12px (rounded-xl)

GLOWS — PURPLE (developer elements):
- Small: 0 0 15px rgba(124,58,237,0.25)
- Medium: 0 0 30px rgba(124,58,237,0.35) — primary buttons
- Large: 0 0 60px rgba(124,58,237,0.20) — featured cards
- XL: 0 0 80px rgba(124,58,237,0.30) — mic button active

GLOWS — CLARA BLUE (AI identity elements):
- Standard: 0 0 20px rgba(123,205,216,0.25)
- Small: 0 0 10px rgba(123,205,216,0.20)
- Large: 0 0 40px rgba(123,205,216,0.30)

VOICE BAR (IDE — always visible at bottom):
- 80px tall, bg-[#0A0E14], border-t border-white/6
- Mic button: 48px circle, bg-[#7C3AED], mic icon white 20px, glow-xl ring-4 ring-[#7C3AED]/20
- Transcript area: text-[#10B981] font-mono text-xs "▶ 'your last command'"
- Text toggle: keyboard icon top-right, text-white/30

LAYOUT — MARKETING SITE:
- Section padding: py-28 between sections
- Content width: max-w-5xl (features), max-w-4xl (pricing), max-w-3xl (hero)
- Header: sticky, bg-[rgba(13,17,23,0.85)] backdrop-blur-md, border-b border-white/5
- Footer fine print: text-[12px] text-white/25

LAYOUT — IDE SURFACE:
- NO max-width on panels — fill columns
- NO rounded on editor areas — sharp only
- Left sidebar (file tree): 13rem wide, bg-[#0A0E14], border-r border-white/6
- Right panel (AI): 18rem wide, bg-[#090D12], border-l border-white/6
- Top bar: 2.75rem, bg-[#0A0E14], border-b border-white/6
- Tab strip: 2.25rem (h-9), sharp-edged tabs
- Bottom voice bar: 5rem, bg-[#0A0E14], border-t border-white/6
- Line numbers: min-w-[52px] text-white/18 font-mono text-[13px]

DO NOT:
- Do NOT use light/white backgrounds anywhere — ALWAYS dark
- Do NOT use rounded corners on IDE panels — sharp edges only
- Do NOT make the mic button smaller than 48px on IDE, 80px on home
- Do NOT use a generic dark tech aesthetic — honor the Hue-Man Bookstore bookmark DNA
- Do NOT remove syntax highlighting colors from code panels
- Do NOT design for mobile — this is a desktop tool
- Do NOT add drop shadows to IDE panel borders — use border-white/6 only
- Do NOT use fonts other than Inter (UI) and JetBrains Mono (code/terminal)
- Do NOT center-align code inside IDE panels — left-align with line numbers
```

Hit **Save** after pasting.

---

## 5. COMPONENTS (magicpatterns.com/.../components)

Click **"+ Add Component"** for each. Generate each component using the prompts below. Save each to the design system.

### Component 1: Header / Nav
```
Create a marketing site header/nav for claracode.ai — voice-first AI coding assistant.

Header: sticky, full-width, height 56px, bg-[rgba(13,17,23,0.85)] backdrop-blur-md border-b border-white/5.

Left: Clara Code logo mark (two-face silhouette icon, 28px square) + "Clara" in white font-semibold + "Code" in #4F8EF7 font-semibold, text-lg, side by side.

Center nav links (flex gap-8):
- "Features" text-white/55 hover:text-white text-[14px]
- "Pricing" text-white/55 hover:text-white text-[14px]
- "Docs" text-white/55 hover:text-white text-[14px]
- "GitHub" text-white/55 hover:text-white text-[14px]

Right CTAs:
- "Star on GitHub" — rounded-full border border-white/15 px-4 py-1.5 text-white/60 text-[13px] flex items-center gap-1.5 — star icon + "2.4k"
- "Download" — rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] px-5 py-1.5 text-white text-[13px] font-semibold shadow-[0_0_20px_rgba(124,58,237,0.35)]

Desktop width 1280px max, page bg-[#0D1117].
```

### Component 2: Hero Section
```
Create the hero section for claracode.ai — voice-first AI coding assistant.

Section: py-28 bg-[#0D1117], text-center, max-w-3xl mx-auto.

Eyebrow badge (mb-6): rounded-full border border-[#7C3AED]/30 bg-[#7C3AED]/8 text-[#7C3AED] text-[11px] tracking-[0.15em] uppercase px-4 py-1.5 — "OPEN SOURCE · MIT LICENSED"

H1 (text-[64px] font-bold tracking-tight leading-none):
Line 1: "Code with your" — text-white
Line 2: "voice." — text-white

Subheadline (text-[18px] text-white/55 mt-6 max-w-xl mx-auto leading-relaxed):
"Hold the mic. Say what you want built. Clara Code transcribes, interprets, and implements — while you think of the next thing."

CTAs (mt-10 flex gap-4 justify-center):
- "Download CLI" — rounded-full bg-[#7C3AED] px-8 py-4 text-white text-[15px] font-semibold shadow-[0_4px_30px_rgba(124,58,237,0.4)]
- "Star on GitHub ⭐" — rounded-full border border-white/15 px-8 py-4 text-white/70 text-[15px]

Bottom micro text (mt-4): "Free forever · Open source · MIT licensed" — text-[12px] text-white/25

Below CTAs: voice UI mock (mt-16, rounded-2xl bg-[#0A0E14] border border-white/8 p-6 max-w-md mx-auto):
- 16 waveform bars (4px wide, heights 4px–28px, bg-[#7C3AED] rounded-full, gap-1, animate pulse)
- Below: text-[#10B981] font-mono text-xs mt-3 "▶ 'Add a loading skeleton to the dashboard'"
- Mic circle: 56px, bg-[#7C3AED], mic icon white, ring-4 ring-[#7C3AED]/20, centered below

Soft purple radial glow behind the mock: absolute pointer-events-none.

Page bg-[#0D1117].
```

### Component 3: Feature Card — Bento Grid
```
Create a features section bento grid for claracode.ai.

Section: py-28 bg-[#080C12] max-w-5xl mx-auto.

Section intro (text-center mb-20):
- Overline: "WHY CLARA CODE" text-[11px] text-white/30 tracking-[0.2em] uppercase font-mono
- H2 line 1: "Built for how developers actually think." text-[40px] font-bold text-white mt-3
- H2 line 2: "Not how they type." text-[40px] font-bold bg-gradient-to-r from-[#7C3AED] to-[#4F8EF7] bg-clip-text text-transparent inline

Grid: grid grid-cols-12 gap-4.

Card 1 (col-span-7, row-span-2) — Voice-First:
- bg-[#0D1117] rounded-2xl border border-white/8 p-8 overflow-hidden relative
- Icon: w-10 h-10 rounded-xl bg-[#7C3AED]/15 flex items-center justify-center — mic icon text-[#7C3AED]
- H3: "Speak. Don't type." text-white text-xl font-semibold mt-4
- P: "Hold the mic button, say what you want built..." text-white/55 text-sm mt-2 leading-relaxed
- Waveform mock: mt-6 rounded-xl bg-[#070A0F] border border-white/5 p-4
  - 16 bars varying heights bg-[#7C3AED] rounded-full
  - Transcript: text-[#10B981] text-xs font-mono mt-3
- Purple radial glow bottom-right

Card 2 (col-span-5) — Context-Aware:
- bg-[#0D1117] rounded-2xl border border-white/8 p-6
- Icon: sparkles bg-[#10B981]/10 text-[#10B981]
- H3: "Knows your codebase." text-white text-lg font-semibold mt-3
- File tree: mt-4 font-mono text-xs text-white/40 space-y-1 — "📁 src/" "  📄 components/UserCard.tsx" [text-[#10B981]] "  📄 lib/auth.ts" "  📄 app/page.tsx"

Card 3 (col-span-5) — Open Source:
- bg-[#0D1117] rounded-2xl border border-white/8 p-6
- Icon: code brackets bg-[#4F8EF7]/10 text-[#4F8EF7]
- H3: "MIT licensed." text-white text-lg font-semibold mt-3
- GitHub stars badge: rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-white/50 flex items-center gap-1.5 — "⭐ 2.4k stars on GitHub"

Card 4 (col-span-12) — Voice/Text Toggle:
- bg-gradient-to-r from-[#0D1117] to-[#0A0E14] rounded-2xl border border-white/8 p-8 flex items-center justify-between gap-8
- Left (max-w-sm): audio waveform icon bg-[#7C3AED]/10 text-[#7C3AED], H3: "Voice is the default. Text is the escape hatch.", P text-white/55
- Right toggle mock: flex rounded-xl bg-[#070A0F] border border-white/8 p-1 gap-1
  - Button 1 ACTIVE: rounded-lg bg-[#7C3AED] px-4 py-2 text-white text-sm font-medium mic icon + "Voice"
  - Button 2: rounded-lg px-4 py-2 text-white/40 text-sm keyboard icon + "Text"

Page bg-[#080C12].
```

### Component 4: Pricing Cards
```
Create a pricing section for claracode.ai with 3 tiers.

Section: py-28 bg-[#0D1117]. Intro text-center mb-16:
- Overline: "PRICING" text-[11px] text-white/30 tracking-[0.2em] uppercase font-mono
- H2: "Start free. Scale when ready." text-[40px] font-bold text-white mt-3
- Sub: "No credit card required. Open source forever." text-[17px] text-white/45 mt-3

Cards: max-w-4xl mx-auto grid grid-cols-3 gap-5 items-start.

Card 1 — FREE:
- bg-[#0A0E14] rounded-2xl border border-white/8 p-7
- Tier: "Free" text-white/50 text-sm uppercase tracking-wide mb-4
- Price: "$0" text-[44px] font-bold text-white + "forever" text-white/35 text-sm ml-1
- Divider: border-t border-white/8 my-6
- Features (space-y-3): ✓ Full CLI access | ✓ Voice input local | ✓ MIT Licensed | ✓ Self-hostable | ✗ Cloud sync (line-through text-white/25) | ✗ Agent personas | ✗ Team vault
- CTA: "Download CLI" full-width border border-white/15 hover:border-white/30 text-white/60 hover:text-white rounded-xl py-3 text-sm text-center

Card 2 — PRO (FEATURED):
- position relative ring-1 ring-[#7C3AED]/40 border border-[#7C3AED]/30 bg-gradient-to-b from-[#7C3AED]/8 to-[#0A0E14] rounded-2xl p-7 shadow-[0_0_60px_rgba(124,58,237,0.15)]
- "Most Popular" badge: absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#7C3AED] text-white text-[11px] font-semibold uppercase tracking-wider rounded-full px-4 py-1
- Tier: "Pro" text-[#7C3AED] text-sm uppercase tracking-wide mb-4
- Price: "$20" text-[44px] font-bold text-white + "/month" text-white/45 text-base ml-1
- Divider: border-t border-[#7C3AED]/15 my-6
- Features: ✓ Everything in Free | ✓ Voice + cloud sync | ✓ Clara vault (encrypted) | ✓ 1 custom agent persona | ✓ Voice clone (1 included) | ✓ Priority support | ✗ Team vault
- CTA: "Start Free Trial" full-width bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl py-3 text-sm font-semibold shadow-[0_4px_20px_rgba(124,58,237,0.4)]

Card 3 — TEAM:
- bg-[#0A0E14] rounded-2xl border border-white/8 p-7
- Tier: "Team" text-white/50 text-sm uppercase tracking-wide mb-4
- Price: "$99" text-[44px] font-bold text-white + "/month" text-white/35 text-sm ml-1
- Note: "per team · up to 8 members" text-white/30 text-xs mt-1
- Divider: border-t border-white/8 my-6
- Features: ✓ Everything in Pro | ✓ Shared team vault | ✓ Up to 6 agent personas | ✓ Admin dashboard | ✓ SSO (Clerk teams) | ✓ SLA + dedicated support
- CTA: "Contact Sales" full-width border border-white/15 hover:border-white/30 text-white/60 hover:text-white rounded-xl py-3 text-sm text-center

Fine print (text-center mt-12): "All plans include CLI access · Prices in USD · Cancel anytime" — text-[12px] text-white/25

Page bg-[#0D1117].
```

### Component 5: Voice Input Bar (IDE Bottom)
```
Create the voice input bar for the Clara Code IDE — the bottom panel always visible in the IDE.

Bar: full-width 80px tall, bg-[#0A0E14], border-t border-white/6.

Layout: flex items-center justify-between px-4 gap-4.

Left — Mic button:
- 48px circle, bg-[#7C3AED], mic icon (Lucide Mic, 20px, white)
- ring-4 ring-[#7C3AED]/20 animate-ping (outer pulse ring, 2s)
- shadow-[0_0_40px_rgba(124,58,237,0.5)]

Center — Voice state (default = listening):
- 16 vertical bars (4px wide, heights varying 4px–28px), bg-[#7C3AED] rounded-full, flex gap-1 items-end
- Below bars: text-[#10B981] font-mono text-[11px] "▶ 'Add authentication to the checkout flow'"

Right:
- Keyboard icon (Lucide Keyboard, 18px, text-white/30) — text toggle
- Text mode input (hidden by default, visible when toggled): bg-[#070A0F] border border-white/10 rounded-xl px-4 py-3 text-white/70 font-mono text-sm placeholder:text-white/20 flex-1

Show: voice active state AND text mode state side by side. Bar height 80px. Dark terminal aesthetic.
```

### Component 6: IDE File Tree Panel
```
Create the file tree left panel for the Clara Code IDE.

Panel: 208px wide (13rem), full height, bg-[#0A0E14], border-r border-white/6. No rounded corners.

Panel header (h-9 flex items-center px-3 border-b border-white/6):
- "EXPLORER" text-[10px] text-white/30 tracking-[0.2em] uppercase font-mono

File tree (pt-2 px-2):
- Project name: "clara-code" text-[12px] text-white/45 font-mono py-1 px-2 flex items-center gap-1 (ChevronDown icon 12px)
- Folder items (indent 8px per level, h-6 flex items-center gap-1.5 text-[13px] font-mono):
  - 📁 src/ text-white/55
    - 📁 features/ text-white/55 (ChevronRight)
    - 📁 app/ text-white/55 (ChevronDown)
      - 📄 layout.tsx text-white/45
      - 📄 page.tsx text-white/45
    - 📄 voice-client.ts text-[#7BCDD8] (ACTIVE — bg-[#7C3AED]/10 border-l-2 border-[#7C3AED]/40)
  - 📁 backend/ text-white/55
  - 📁 packages/ text-white/55
  - 📄 package.json text-white/45
  - 📄 CLAUDE.md text-white/45

Active file highlight: bg-white/[0.025] border-l-2 border-[#7C3AED]/40, text full opacity.

Bottom panel (absolute bottom border-t border-white/6 w-full bg-[#0A0E14] px-3 py-2 flex items-center gap-2):
- User avatar 20px + "amenray2k" text-[11px] text-white/40 + Mic icon text-[#7C3AED] ml-auto

Panel bg-[#0A0E14]. All text JetBrains Mono.
```

### Component 7: IDE Code Editor Panel
```
Create the main code editor panel for the Clara Code IDE.

Panel: full remaining width (flex-1), full height, bg-[#0D1117]. No rounded corners.

Tab strip (h-9 border-b border-white/6 flex items-end px-2 gap-0.5 bg-[#0A0E14]):
- Tab ACTIVE: h-9 bg-[#0D1117] border-t border-l border-r border-white/8 border-b-transparent px-4 text-[12px] text-white/85 font-mono flex items-center gap-1.5 — file icon + "voice-client.ts"
- Tab INACTIVE: h-7 px-4 text-[12px] text-white/30 font-mono — "layout.tsx" | "page.tsx"

Code area (flex-1 overflow-auto p-4 font-mono text-[13px] leading-6):

Show ~20 lines of realistic TypeScript code with syntax highlighting:

import { ClaraVoiceClient } from '@clara/sdk'     // keyword=purple, string=green
import type { VoiceConfig } from './types'          // type=blue

const client = new ClaraVoiceClient({              // purple keyword, white fn-name
  endpoint: process.env.CLARA_VOICE_URL,            // yellow attr, green string
  apiKey: process.env.CLARA_API_KEY,
  agent: 'granville',                               // green string
})

export async function initVoice(                    // purple keyword
  config: VoiceConfig                               // blue type
): Promise<void> {                                  // blue type, brackets
  await client.connect()                            // clara-blue fn-name
  client.on('transcript', (text: string) => {       // syntax mixing
    console.log('▶', text)                          // comment = white/30
  })
}

Line numbers: min-w-[52px] text-white/18 select-none font-mono text-[13px] text-right pr-4 border-r border-white/5.
Active line 14: bg-white/[0.025] border-l-2 border-[#7C3AED]/40.

Status bar (h-6 bg-[#0A0E14] border-t border-white/6 px-4 flex items-center gap-4 text-[11px] text-white/30 font-mono):
- "main" (git branch) | "TypeScript 5.4" | "UTF-8" | "Ln 14, Col 22" — space-between

Panel bg-[#0D1117].
```

### Component 8: AI Chat Panel (Right)
```
Create the AI assistant right panel for the Clara Code IDE.

Panel: 288px wide (18rem), full height, bg-[#090D12], border-l border-white/6. No rounded corners.

Panel header (h-9 flex items-center justify-between px-3 border-b border-white/6 bg-[#0A0E14]):
- Left: sparkles icon 14px text-[#7BCDD8] + "Clara" text-[12px] text-white/55 font-mono
- Right: settings icon 14px text-white/25

Chat messages (flex-1 overflow-auto p-3 space-y-3):

Message 1 — User voice (flex gap-2):
- Mic icon 12px text-[#7C3AED]
- Bubble: bg-[#7C3AED]/10 border border-[#7C3AED]/20 rounded-xl px-3 py-2
- Text: "Add authentication to the checkout flow" text-[11px] text-white/70 font-mono

Message 2 — Clara response (flex gap-2):
- Clara dot 8px bg-[#7BCDD8] rounded-full
- Bubble: bg-[#0A0E14] border border-white/6 rounded-xl px-3 py-2
- Text: "I'll add Clerk auth to checkout. Creating middleware and wrapping the route..." text-[11px] text-white/55 font-mono leading-relaxed
- Code block (mt-2 rounded-lg bg-[#070A0F] border border-white/5 p-2 font-mono text-[11px]):
  "import { requireAuth } from '@clerk/nextjs'" [#10B981]
  "export default requireAuth(CheckoutPage)" [white/85]
- Action buttons (mt-2 flex gap-1.5):
  - "Apply" bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] text-[11px] rounded-lg px-2.5 py-1
  - "Discard" bg-white/5 border border-white/8 text-white/40 text-[11px] rounded-lg px-2.5 py-1

Voice input (border-t border-white/6 p-3):
- Waveform: 8 bars bg-[#7C3AED] rounded-full heights varying
- "Listening..." text-[#10B981] text-[11px] font-mono mt-1.5

Panel bg-[#090D12]. All text JetBrains Mono.
```

---

## SETUP ORDER

1. Typography → Save
2. Colors → Save
3. Icons → Set library to Lucide → Pin all listed icons
4. Rules → Paste brand guidelines → Save
5. Components → Generate each → Save to design system
6. Then generate screens from prompt files in order (01-hero → 02-features → 03-pricing → 04-ide-shell → then individual IDE component screens)

---

*"I came to give you something. And that's what I did."* — Clara Villarosa, Hue-Man Experience Bookstore
