# Clara Desktop — Magic Patterns UI Prompts
**Created:** 2026-04-10
**Project:** Clara Desktop (Tauri + Next.js, claraagents.com)
**Brand:** Dark premium, clara-blue `#7BC8D8`, base `#0D1117`
**Competitor:** Claude Desktop
**Differentiators:** Voice-first, multi-agent team, persistent vault memory, background agents, swarm visibility

---

## Prompt 1 — Main Interface (Primary Desktop Window)

**Design a premium AI desktop application main window in dark mode.**

Layout: Three-column split panel at 1440x900px. Background is near-black `#0D1117`. Subtle grid texture at 4% opacity overlaid on the background.

**Top navigation bar** (48px tall, `#12181F` fill, 1px bottom border `#1E2830`):
- Far left: Clara logo — two minimalist human profile silhouettes facing each other with a small circular mic icon between them, rendered in `#7BC8D8` (sky blue), 28px height
- Center: Current agent name in medium weight Inter font, `#E8F4F8`, 15px — display "Granville" with a small amber dot indicator to the right (agent status: online)
- Far right cluster: circular mic button (36px, `#7BC8D8` border 1.5px, mic icon inside), then a bell icon with a "3" badge, then a gear icon — all in `#8B9BA8`, 20px icons, spaced 20px apart

**Left sidebar** (240px wide, `#0F1620` fill, no visible border — blends):
- Section header "YOUR TEAM" in 10px uppercase spaced tracking-widest, `#4A5A68` color, 16px from top
- Agent roster list — 5 agents stacked with 4px gap between each:
  - Each agent card: 224px wide, 56px tall, `#141D27` background, 8px border radius, 12px padding
  - Left: 36px circular avatar with a stylized initial letter, gradient fills (Granville = amber/gold gradient, Maya = purple gradient, Nikki = rose gradient, Aaron = blue gradient, Blackwell = green gradient)
  - Avatar has a 2px border that pulses: `#7BC8D8` for active agent, `#2A3A4A` for idle, `#22C55E` for completed task
  - Agent name in 13px Inter medium, `#D4E8F0`
  - Agent role in 11px, `#4A5A68` — "Lead Strategist", "Frontend", "Research", etc.
  - Far right of card: a tiny status dot (8px) — cyan for active, grey for idle
  - Active agent (Granville) card has left border accent 3px `#7BC8D8` and slightly lighter background `#1A2535`
- At bottom of sidebar: "+ Activate Agent" button, dashed border `#1E2D3D`, `#4A5A68` text, 12px, full width, 40px tall

**Center conversation area** (flexible width, main focus):
- Top: current conversation with Granville — "Research Mode" chip in top right, `#1A2D3A` background, `#7BC8D8` text, 11px, pill shape
- Message bubbles:
  - User messages: right-aligned, `#1A3550` background, `#E8F4F8` text, 14px Inter regular, 16px padding, 12px border radius, max-width 65%
  - Agent messages: left-aligned, `#141D27` background, `#C8DDE8` text, same sizing, left border 2px `#7BC8D8`
  - Agent avatar (24px) appears left of agent messages
  - Timestamps in `#3A4A5A`, 11px, below each message
- Active voice waveform zone (visible when agent is speaking): 280px wide horizontal waveform visualization centered below the last message, bars in `#7BC8D8` at varying heights, animated shimmer effect, `rgba(123, 200, 216, 0.08)` glow behind it, "Granville is speaking..." label in 12px `#7BC8D8` above the waveform

**Right context panel** (280px wide, `#0C1218` fill, 1px left border `#1A2530`):
- Section: "WORKING ON" — 11px uppercase label, then a task card: `#141D27` bg, showing "Analyzing competitor pricing models" with a progress indicator (thin line, 60% filled in `#7BC8D8`)
- Section: "VAULT MEMORY" — 3 memory snippets shown as small tags: pill-shaped `#1A2530` bg, `#7BC8D8` text, 11px — "Client: Rashad Campbell", "Project: KLS v2", "Priority: MVP by Apr 30"
- Section: "ACTIVE TOOLS" — icon list of tools currently in use: search icon, file icon, code icon — each with a small green pulse dot

**Bottom voice input bar** (72px tall, `#12181F` fill, 1px top border `#1E2830`):
- Centered microphone button: 48px circle, gradient fill `#7BC8D8` to `#4AACBF`, white mic icon inside, subtle glow `rgba(123, 200, 216, 0.3)` when idle
- Left of mic: waveform input area (400px wide), dashed outline `#1E2D3D`, placeholder "or type to talk..." in `#3A4A5A`, 13px
- Right of mic: "⌘↵ Send" label in 11px `#3A4A5A`

**Mood/energy:** Focused, premium, calm authority. Like a Bloomberg terminal redesigned by Jony Ive. The user feels like a CEO with a team of experts ready. Dark enough to disappear but rich enough to feel luxurious.

**Typography:** Inter throughout. Headers 11-12px uppercase tracked. Body 13-14px. No system fonts.

**Interaction states shown:** Active agent speaking (waveform visible), one agent idle (grey dot), one agent completed task (green border flash on card).

---

## Prompt 2 — Swarm View (Mission Control)

**Design a real-time multi-agent control room dashboard for a premium AI desktop application.**

Full-width panel replacing the main conversation view. Background: `#0D1117`. The energy is NASA Mission Control meets Bloomberg trading floor — professional, live, high-information density without feeling cluttered.

**Top bar** (same as main interface nav, 48px):
- "SWARM VIEW" label added next to logo in `#7BC8D8`, 12px uppercase — indicating mode switch
- Agent count badge: "7 AGENTS ACTIVE" in a cyan pill, `#0F2A30` bg, `#7BC8D8` text, 11px
- "Return to Chat" button far right, ghost style, `#3A4A5A` border, `#8B9BA8` text

**Main layout:** Two columns — left takes 65%, right takes 35%.

**Left: Agent Cards Grid** (2-column grid with 12px gaps):
- **HQ Card** (spans full width, 80px tall, first row): `#141D27` bg, gold left border 3px, "HQ — Mary (Orchestrator)" in 14px Inter medium `#E8C87A`, status "Coordinating sprint objectives", animated thinking dots `#E8C87A`, progress bar 100% full in gold showing "Sprint 2 Day 8", right side shows "7 agents reporting"
- Individual agent cards (6 cards in 2-column grid, each ~160px tall):
  - `#141D27` background, 10px border radius, 16px padding
  - Top row: agent avatar (32px circle with gradient initial), name in 13px `#D4E8F0`, role in 11px `#4A5A68`
  - Status badge (pill, 10px text): ACTIVE (background `#0A2A20`, text `#34D399`, border `#22C55E` — cyan green), WAITING (background `#1A1A2A`, text `#6B7280`, border `#374151` — grey), REVIEWING (`#2A1A0A`, text `#FBBF24`, border `#F59E0B` — amber), COMPLETE (`#0A1A2A`, text `#60A5FA`, border `#3B82F6` — blue)
  - Current task: 12px `#8B9BA8`, max 2 lines, truncated with ellipsis
  - Progress bar: 4px tall, `#1E2D3D` track, `#7BC8D8` fill, percentage label right-aligned 11px `#4A5A68`
  - Last activity timestamp: "2 min ago" in 10px `#3A4A5A` bottom right
  - ACTIVE cards get a subtle `rgba(123, 200, 216, 0.04)` background tint and a cyan left border 2px

**Right: Live Activity Stream** (35% width, `#0C1218` bg, 1px left border `#1A2530`):
- Header: "LIVE FEED" in 10px uppercase `#4A5A68`, with a red recording dot (8px, animated pulse)
- Scrollable feed of real-time events (newest at top):
  - Each event: 44px tall row, 12px horizontal padding, 8px top/bottom padding, alternating `#0C1218` / `#0F1620`
  - Left: 24px agent avatar circle (tiny)
  - Event text: 12px `#8B9BA8` — "Granville completed market analysis", "Aaron pushed 3 components", "Blackwell found N+1 query — flagging for review"
  - Timestamp: 10px `#3A4A5A` right-aligned, "14:32:07"
  - Special events: error/flag events get left border 2px `#F59E0B` and `#2A1A0A` background
  - Completion events: left border 2px `#22C55E`
- Bottom of feed: "All activity since 09:00 AM" label in 11px `#3A4A5A`, centered

**Bottom bar** (64px, `#12181F`, 1px top border):
- "PAUSE ALL" button: `#1A2530` bg, `#8B9BA8` text, 13px, 120px wide, 8px radius
- Sprint label: "Sprint 2 — Day 8 of 15" centered, 12px `#4A5A68`
- "DISPATCH TASK" button: `#7BC8D8` text, `#0F2A30` bg, 1px border `#7BC8D8`, 13px, 140px wide, 8px radius

**Mood/energy:** Control room. Live. The user feels powerful and informed. Real-time data is the hero. Everything pulses subtly to show it's alive. Dark enough to let status colors speak loudly. Green means go, amber means attention, red means stop.

**Typography:** Inter. All caps for section labels. Mixed weights — medium for names, regular for descriptions, mono for timestamps.

---

## Prompt 3 — Voice Active State

**Design the voice interaction mode for a premium dark AI desktop application.**

Show three distinct states as one screen with state-switcher tabs at top: "Listening", "Thinking", "Speaking". Display the "Speaking" state as the primary/active view.

**Full screen overlay treatment:** The base UI (main interface) dims to 20% opacity behind a soft overlay `rgba(13, 17, 23, 0.85)`. The center of the screen becomes the voice stage.

**Center stage** (560px wide, 480px tall, centered in the window):
- Background: `#0F1820` with 12px border radius, subtle border `rgba(123, 200, 216, 0.15)`, box shadow `0 32px 80px rgba(0, 0, 0, 0.6)`
- Agent avatar: 88px circle, Granville's amber/gold gradient initial "G", centered at top of stage, 40px from top
- Avatar glow ring: multiple concentric rings around the avatar, `#7BC8D8` at varying opacities — innermost `rgba(123, 200, 216, 0.3)`, middle `rgba(123, 200, 216, 0.15)`, outer `rgba(123, 200, 216, 0.05)`, animated slow pulse outward on "Speaking" state
- Agent name below avatar: "Granville" in 18px Inter medium, `#E8F4F8`
- State label: "Speaking" in 13px `#7BC8D8` uppercase tracked, with animated typing dots (`...`) below the name

**Waveform visualization** (centered, 400px wide, 80px tall):
- Circular waveform variant: 20 vertical bars arranged symmetrically, tallest in center, shortest at edges, all in `#7BC8D8` at varying heights (30px to 8px from center to edge), animated to bounce rhythmically
- Bars have `rgba(123, 200, 216, 0.2)` base with full `#7BC8D8` fill animated on beat
- Glow blur behind bars: `rgba(123, 200, 216, 0.12)` soft field

**Live transcript area** (below waveform, 400px wide, 120px tall):
- Auto-scrolling text as words appear in real-time, word by word
- Current sentence: "I've analyzed the competitive pricing models for KLS v2 and I have three key findings..." — text in 15px Inter regular `#D4E8F0`, line height 1.6
- Just-spoken words: `#E8F4F8`
- Words appearing now: `#7BC8D8` with cursor-blink effect after last word

**Bottom action row** (within the stage card):
- Large mute/interrupt button: 52px circle, `#1A2530` bg, `#E8F4F8` mute icon, centered — prominent, easy to hit
- "Interrupt" text label below button in 11px `#4A5A68`
- Left of mute: small "Transcript" icon button — to toggle full transcript view
- Right of mute: small "Skip" forward icon — to have Clara skip to next point

**State variations shown** (small state tabs at top of stage card, 11px uppercase):
- LISTENING: Avatar has blue pulsing ring, waveform shows user input in white bars, transcript shows "Listening..." in italics `#4A5A68`
- THINKING: Avatar has amber/gold slow pulse, waveform replaced by 3 dots morphing animation in `#7BC8D8`, transcript shows "Thinking..." with rotating loader, 1.5 second hold
- SPEAKING: As described above — the primary hero state

**Mood/energy:** Immersive, intimate, focused. Like AirPods Pro noise cancellation mode — the world falls away and it's just you and your agent. Calm, premium. Not alarming — peaceful. The glow rings feel like a presence, not a notification.

**Typography:** Inter. State labels small and informational. Transcript text generous and readable. Agent name confident.

---

## Prompt 4 — System Tray / Mini Mode (Compact Always-On Widget)

**Design a compact floating desktop widget for a premium AI assistant application.**

Dimensions: exactly 360px wide by 480px tall. This is a floating window with no OS chrome — borderless, floating above other applications. Design for macOS — the widget should feel native to macOS but distinctly Clara-branded.

**Container styling:**
- Background: `rgba(13, 17, 23, 0.92)` with backdrop-filter blur(24px) — true glass morphism
- Border: 1px `rgba(123, 200, 216, 0.18)`
- Border radius: 16px
- Shadow: `0 24px 64px rgba(0, 0, 0, 0.7)`, `0 0 0 0.5px rgba(255,255,255,0.04)` inset
- The background shows a blur of whatever is behind the widget (macOS desktop or other apps), giving it a glass panel feel

**Top section** (80px tall, inside the widget):
- Clara logo mark (two profiles + mic) in `#7BC8D8`, 22px, top-left 16px from edges
- "Clara" wordmark in 13px Inter medium `#E8F4F8` next to logo
- Top-right cluster: minimize dot (10px circle `#3A4A5A`), close dot (10px `#3A4A5A`) — macOS-style but subtle
- Below logo row: current agent chip — "Granville" with amber avatar 20px circle, agent name 12px `#D4E8F0`, status dot cyan 6px

**Voice mic zone** (center section, 100px tall):
- Large circular mic button: 64px diameter, positioned center, gradient fill `#7BC8D8` to `#4AACBF`, white mic icon 28px inside
- Subtle pulsing ring around button at rest: `rgba(123, 200, 216, 0.15)` 80px total diameter
- "Hold to speak" label below, 10px `#4A5A68`
- "⌘⇧C to summon" shortcut reminder in 9px `#2A3A4A`, centered below

**Last message preview** (96px tall, `#0F1620` bg inset, 12px margin, 10px border radius):
- "Granville" in 10px uppercase `#4A5A68`
- Last message text in 12px `#8B9BA8`, 3 lines max, truncated: "I've completed the pricing analysis. Three key findings are ready for your review..."
- "2 min ago" timestamp in 9px `#3A4A5A`, bottom right
- Unread indicator: if unread, left border 2px `#7BC8D8` on this section

**Quick action row** (56px tall, 4 icon buttons centered with 24px spacing):
- New task icon (plus in circle, 32px, `#1A2530` bg, `#8B9BA8` icon)
- Swarm view icon (grid icon, same sizing)
- Vault icon (lock/key icon, same sizing)
- Settings icon (gear, same sizing)
- Each icon has 4px border radius, subtle hover state `#1E2D3D` bg

**Agent notification badges** (bottom of widget, 48px tall):
- Row of 4 tiny agent avatars (24px circles, overlapping 4px), showing team at a glance
- "3 agents active" in 11px `#4A5A68`
- If any agent needs attention: amber badge "Review needed" pill appears right-aligned, `#2A1A0A` bg, `#FBBF24` text, 10px

**Notification stack** (conditionally appears above widget, slides in from top):
- 3 stacked notification cards, each 340px wide, 56px tall, `rgba(15, 22, 32, 0.94)` bg, blur backdrop, border `rgba(123, 200, 216, 0.1)`
- "Aaron completed: 3 new components built" in 12px `#C8DDE8`
- "Dismiss all" link in 10px `#4A5A68` bottom right
- Cards fan/stack with 4px vertical offset per card, showing depth

**Mood/energy:** Always-on whisper. Quiet but present. It lives in the corner of your screen like a trusted colleague one desk over. Not demanding attention — but there when you need it. The glass effect makes it feel like it floats without weight. Premium macOS aesthetic with Clara identity.

---

## Prompt 5 — Agent Profile / Onboarding (First Meeting)

**Design a full-screen premium onboarding experience for an AI desktop application.**

This is a full-screen moment — 1440x900px. The user is meeting their agent for the first time. This should feel like a cinematic reveal. Dark, centered, intimate.

**Background treatment:**
- Base: `#0D1117` solid
- Radial gradient from center: `rgba(123, 200, 216, 0.06)` at center, fading to transparent at edges — a subtle halo of blue light emanating from where the agent "lives"
- Very faint particle field (tiny dots, 1-2px, `rgba(123, 200, 216, 0.15)`, scattered across screen at low density — like stars, not confetti)
- No grid, no texture — pure depth from the gradient and particles

**Center panel** (540px wide, auto height, centered both axes):

**Step 1 of 3 view — Agent Reveal:**
- Progress dots at very top center: 3 dots, first filled `#7BC8D8`, others `#1E2D3D`, 6px each, 8px gap
- Large agent avatar: 120px circle, centered, amber/gold gradient `#D4A052` to `#B07A2A` with subtle inner shadow, "G" initial in 48px Inter bold white
- Glowing ring around avatar: 144px total diameter, `rgba(123, 200, 216, 0.2)` — elegant, slow pulse animation
- Agent name: "Granville" in 32px Inter bold `#E8F4F8`, centered, 24px below avatar
- Historical namesake attribution: "Named after Granville T. Woods, inventor of the multiplex telegraph" in 14px `#4A5A68` centered italic, 8px below name
- Personality keywords (3-4 words): displayed as horizontal chips below attribution — "Strategic", "Analytical", "Direct", "Relentless" — each chip `#141D27` bg, `#7BC8D8` border 1px, `#7BC8D8` text, 12px, 8px padding horizontal, pill shape, 8px gap between, 24px below attribution
- Voice preview button: 200px wide, 48px tall, `#0F2A30` bg, `#7BC8D8` border 1px, `#7BC8D8` text "Hear Granville speak", play icon left, 13px Inter medium — centered, 32px below chips. Hover state: `#7BC8D8` bg, `#0D1117` text

**Step 2 of 3 view — Your Full Team:**
- Heading: "Your full team is ready" in 28px Inter bold `#E8F4F8`, centered
- Subheading: "Six specialists. One vault. Your goals." in 15px `#4A5A68`, centered, 8px below heading
- Agent constellation: 6 agent avatar circles (64px each) arranged in a loose arc/semicircle — not a perfect grid — slight variation in vertical position to feel organic, connected by thin lines `rgba(123, 200, 216, 0.1)` between avatars
- Each avatar: gradient fill with initial letter, name in 11px `#8B9BA8` below each avatar
- Center of constellation: Clara logo mark (24px) as the connecting node all lines point to
- The whole constellation has a soft cyan glow field behind it `rgba(123, 200, 216, 0.04)` in a circle shape

**Step 3 of 3 view — Ready:**
- "You're all set" in 36px Inter bold `#E8F4F8`, centered
- Large Clara logo (40px) above the heading
- "Your agents are ready. Your vault is live. Let's build." in 16px `#8B9BA8`, centered, line height 1.7
- "Start talking to Granville" CTA button: 280px wide, 56px tall, gradient `#7BC8D8` to `#4AACBF`, `#0D1117` text bold 14px, 12px border radius, shadow `0 8px 32px rgba(123, 200, 216, 0.3)`

**Navigation between steps** (bottom of each step view):
- "Continue" button, ghost style: `#1E2D3D` bg, `#7BC8D8` text, 13px, 160px wide, 44px tall, 8px radius — aligned right
- "Back" link text left-aligned, 13px `#3A4A5A`, only on steps 2 and 3

**Mood/energy:** Cinematic. Like meeting your team before a mission. The dark backdrop and radial light create a sense of emergence — the agent is coming forward into light. Premium typography, measured pacing, respectful of the moment. Not playful — this is a professional tool introduction. The particle stars add depth without distraction. The user should feel like they just unlocked something powerful.

**Typography:** Inter throughout. Hero name in bold 32px. Attribution in italic. Body copy never smaller than 13px. CTA buttons always Inter medium.

---

## Usage Notes for Magic Patterns

- Paste each prompt individually into Magic Patterns
- Use "Advanced" mode if available for better component fidelity
- Specify "Dark theme, desktop application, glass morphism, Inter font" as global style modifiers before each prompt
- After generation, specify edits: adjust `#7BC8D8` if the tool approximates it, enforce Inter font over system defaults
- Export as React components (Tailwind or CSS modules) for integration with the Tauri + Next.js shell
- These prompts are ordered by implementation priority: Main Interface first (core UX), then Swarm View (key differentiator), then Voice State (primary value prop), then Mini Mode (daily driver), then Onboarding (first impression)
