# Magic Patterns Prompt — IDE Settings Panel (Cmd+,)

**File target:** `src/clara/settings/SettingsPanel.tsx` (VS Code fork — not web-ui)
**Type:** Client Component (IDE surface, not Next.js)

---

## CONTEXT FOR MAGIC PATTERNS — READ FIRST

This is the settings panel that opens inside the Clara Code IDE when the user presses **Cmd+,**. It renders in the editor area — not a modal, not a slide-in. This is a VS Code fork, so Cmd+, muscle memory is sacred. The panel opens as an editor tab labelled "Clara Settings."

**The most critical section is "Clara Account"** — this is where users connect the IDE to their cloud account via browser OAuth OR paste an API key manually. Without a connected account, voice sync, vault, and agent personas are disabled.

Two connection methods must be shown side-by-side:
1. **Sign in with browser** (recommended) — opens claracode.ai/sign-in in system browser, Clerk auth, `claracode://` callback delivers token to IDE
2. **API key** (manual) — paste a key from claracode.ai/settings/api-keys

The IDE settings DO NOT replicate web settings — billing, team management, and API key creation all stay web-only. The IDE only consumes. It links out to web for anything it can't handle locally.

---

## Prompt

```
Design the IDE settings panel for Clara Code — a VS Code fork with Clara AI voice layer. This panel opens via Cmd+, and renders as an editor tab (not a modal). Full dark terminal aesthetic. Two-column layout: fixed left nav + scrollable content area. NO rounded corners on panel edges — sharp IDE aesthetic.

OUTER CONTAINER:
- Full editor area dimensions (flex-1 of the remaining space after sidebar panels)
- bg-[#0D1117]
- No border-radius
- flex flex-row

LEFT NAV:
- Width: 200px, fixed, full height
- bg-[#0A0E14]
- Border-right: 1px solid rgba(255,255,255,0.06)
- pt-4 px-2

NAV SECTIONS:

Section label style: text-[10px] font-semibold uppercase tracking-[0.15em] text-white/25 px-3 mb-1 mt-4 (first section has no top margin)

Section 1 — "CLARA ACCOUNT":
- Clara Account (show ACTIVE)

Section 2 — "EDITOR":
- Editor
- Keybindings
- Extensions

Section 3 — "CLARA VOICE":
- Voice
- Agent

Section 4 — "PRIVACY":
- Privacy
- Diagnostics

NAV ITEM style:
- flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] font-mono cursor-pointer w-full
- Default: text-white/45, icon text-white/25
- Hover: bg-white/5 text-white/70
- ACTIVE: bg-[#7C3AED]/15 text-white, icon text-[#7C3AED], left 2px accent bar (absolute, left-0, inset-y-2, w-0.5, bg-[#7C3AED], rounded-full)

Nav item icons (all 14x14 Lucide):
- Clara Account: UserCircle
- Editor: Code2
- Keybindings: Keyboard
- Extensions: Package
- Voice: Mic
- Agent: Sparkles
- Privacy: Shield
- Diagnostics: Activity

CONTENT AREA:
- flex-1, overflow-y-auto, p-8 bg-[#0D1117]

---

SHOW THE CLARA ACCOUNT PAGE AS THE ACTIVE CONTENT.

PAGE TITLE:
- "Clara Account" — Inter, 20px, font-weight 700, text-white
- Below: "Connect your Clara account to enable voice sync, vault, and agent personas." — 13px, text-white/45, mt-1, font-mono

Divider: mt-6 mb-6, 1px, bg-white/6

---

CONNECTION STATUS BLOCK (top of content):

Show STATE: NOT CONNECTED (the first-run state)

Status card:
- bg-[#070A0F] border border-white/8 rounded-xl p-5 flex items-center gap-4

Left icon:
- 40px circle, bg-white/5 border border-white/10
- Inside: UserCircle icon, 20px, text-white/25

Center text (flex-1):
- "Not connected" — 14px font-semibold text-white/50 font-mono
- "Sign in to enable cloud features." — 12px text-white/30 font-mono mt-0.5

Right:
- "Connect" button — bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[13px] font-semibold px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(124,58,237,0.25)]

---

ALSO SHOW: CONNECTED STATE as a second card below (label it "Connected state" in text-white/20 text-xs mb-2):

Connected status card:
- bg-[#070A0F] border border-[#10B981]/20 rounded-xl p-5 flex items-center gap-4
- Left accent: 3px left border in #10B981

Left icon:
- 40px circle, bg-[#10B981]/10 border border-[#10B981]/20
- Inside: CheckCircle icon, 20px, text-[#10B981]

Center text:
- "amenray2k" — 14px font-semibold text-white font-mono
- "Pro Plan · Connected to claracode.ai" — 12px text-white/40 font-mono mt-0.5

Right:
- "Sign out" — border border-white/12 text-white/40 hover:text-white text-[13px] px-3 py-1.5 rounded-lg

---

DIVIDER with label:
mt-8 mb-6: flex items-center gap-3
- Left line: flex-1 h-px bg-white/6
- Label: "CONNECTION METHOD" — text-[10px] text-white/25 tracking-[0.15em] uppercase font-mono whitespace-nowrap
- Right line: flex-1 h-px bg-white/6

---

METHOD 1 — Sign in with Browser (RECOMMENDED):

Card: bg-[#0A0E14] border border-white/8 rounded-xl p-5 mb-4

Top row: flex items-start justify-between
- Left:
  - Row: Globe icon (16px, text-[#7BCDD8]) + "Sign in with browser" — 14px font-semibold text-white font-mono
  - Below: "Opens claracode.ai in your browser. Clerk authenticates you and sends a token back to the IDE automatically." — 12px text-white/40 font-mono mt-1 leading-relaxed
  - Below: "RECOMMENDED" badge — bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#7C3AED] text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md mt-3 inline-flex w-fit

Right:
- "Open Browser" button — bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[13px] font-semibold px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(124,58,237,0.25)] flex items-center gap-2
  - ExternalLink icon 14px
  - "Open Browser"

---

METHOD 2 — API Key (Manual):

Card: bg-[#0A0E14] border border-white/8 rounded-xl p-5

Top row:
- Row: Key icon (16px, text-white/40) + "API Key" — 14px font-semibold text-white font-mono
- Below: "Paste an API key from claracode.ai/settings/api-keys. Stored securely in your OS keychain." — 12px text-white/40 font-mono mt-1 leading-relaxed

Input row (mt-4 flex gap-2):
- Input: flex-1, bg-[#070A0F] border border-white/10 rounded-lg px-3 py-2.5 text-[13px] font-mono text-white/70 placeholder:text-white/20 focus:border-[#7C3AED]/40 focus:outline-none
  - placeholder: "clr_live_sk_••••••••••••••••"
- "Connect" button: bg-white/8 hover:bg-white/12 border border-white/12 text-white/70 hover:text-white text-[13px] px-4 py-2.5 rounded-lg

Below input:
- "Don't have an API key?" flex items-center gap-1 mt-2
  - text-[12px] text-white/30 font-mono + "Get one at claracode.ai →" text-[12px] text-[#7BCDD8] hover:underline cursor-pointer

---

DIVIDER mt-8 mb-6 (same style as above, label "ACTIVE PLAN"):

---

PLAN CARD (shown when connected — show as preview even in disconnected state, dimmed):

Card: bg-[#0A0E14] border border-white/6 rounded-xl p-5 opacity-50 (dimmed when not connected)

Top row:
- "Free Plan" — 14px font-semibold text-white font-mono
- "Upgrade" button — bg-[#7C3AED] text-white text-[12px] font-semibold px-3 py-1 rounded-lg

Features row (mt-4 grid grid-cols-2 gap-y-2):
- ✓ CLI access — text-[12px] font-mono text-white/55
- ✗ Cloud sync — text-[12px] font-mono text-white/25 line-through
- ✓ Local voice — text-[12px] font-mono text-white/55
- ✗ Agent personas — text-[12px] font-mono text-white/25 line-through
- ✓ MIT Licensed — text-[12px] font-mono text-white/55
- ✗ Clara vault — text-[12px] font-mono text-white/25 line-through

Link below: "Manage billing at claracode.ai →" — text-[12px] text-[#7BCDD8] mt-4 block hover:underline font-mono

---

FONT: JetBrains Mono for all labels, input values, descriptions. Inter for page title only.
All content is dark terminal. No light surfaces. No rounded panel edges (outer container is sharp).
Page bg: bg-[#0D1117]. Panel elements use bg-[#0A0E14] and bg-[#070A0F].
```
