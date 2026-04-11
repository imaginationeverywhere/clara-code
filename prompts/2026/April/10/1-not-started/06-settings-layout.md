# Magic Patterns Prompt — Settings Layout Shell

**File target:** `packages/web-ui/src/app/(dashboard)/settings/layout.tsx`
**Type:** Server Component (layout shell) — nav items are static; active state driven by pathname

---

## CONTEXT FOR MAGIC PATTERNS — READ FIRST

This is the persistent layout that wraps every settings page inside Clara Code. Think VS Code's settings panel — a fixed left nav listing all configuration sections, a header with the Clara mark and user avatar, and a content area that changes as users navigate. The shell is dark-on-dark, using subtle border differentiation rather than color contrast to separate regions. This layout hosts 8 nav sections: Profile, Account, API Keys, Voice, Billing, Team, Notifications, Integrations.

---

## Prompt

```
Design a full-screen settings dashboard layout shell for Clara Code. Dark IDE aesthetic. This is the wrapper — the nav and header are always visible; the main content area is where individual settings pages render as children.

OVERALL STRUCTURE:
- min-h-screen bg-[#0D1117]
- Three zones: Header (top, full width), Left Nav (fixed left column), Content Area (scrollable right)
- No white backgrounds anywhere

HEADER (top bar, full width, fixed):
- Height: h-14 (56px)
- Background: bg-[#070A0F]
- Bottom border: border-b border-white/6
- Horizontal padding: px-6
- Layout: flex items-center justify-between
- LEFT SIDE of header:
  - Clara Code mark: SVG two-silhouette icon in Clara Blue #7BCDD8, 28x28px
  - 10px gap
  - Wordmark: "Clara Code" — Inter, font-weight 600, font-size 16px, text-white
  - 8px gap
  - A thin vertical divider: w-px h-5 bg-white/12
  - 8px gap
  - "Settings" label — Inter, font-size 14px, text-white/40
- RIGHT SIDE of header:
  - User avatar: w-8 h-8 rounded-full bg-[#7C3AED]/30 border border-[#7C3AED]/40
    - Inside: user initials "AR" — text-xs font-semibold text-[#7C3AED]
    - This is a button with a dropdown chevron (chevron-down SVG 12x12 text-white/40) inline after the avatar
  - 16px gap to the right of avatar group
  - A "Back to Dashboard" link: flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors
    - Left arrow SVG 14x14
    - "Dashboard" text

LEFT NAV:
- Width: w-56 (224px), fixed height (calc(100vh - 56px)), sticky top-14
- Background: bg-[#070A0F]
- Right border: border-r border-white/6
- Overflow: overflow-y-auto
- Top padding: pt-6 px-3

NAV STRUCTURE:
- Two section groups with a section label above each

SECTION 1 — no label (user personal settings):
- Profile
- Account

12px gap, then a 1px divider (bg-white/6, mx-3), then 12px gap

SECTION 2 — Label: "DEVELOPER" (text-xs font-semibold text-white/25 uppercase tracking-wider px-3 mb-2):
- API Keys
- Voice
- Billing

12px gap, then another 1px divider (bg-white/6, mx-3), then 12px gap

SECTION 3 — Label: "WORKSPACE" (same label style):
- Team
- Notifications
- Integrations

NAV ITEM ANATOMY (for each of the 8 items):
- Container: flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer group, w-full
- Default state:
  - Background: transparent
  - Text: text-sm text-white/55
  - Icon: 16x16 SVG, text-white/35
- Hover state:
  - Background: bg-white/5
  - Text: text-white/80
  - Icon: text-white/60
- ACTIVE state (current page — show "API Keys" as active in the design):
  - Background: bg-[#7C3AED]/15
  - Text: text-white font-medium
  - Icon: text-[#7C3AED]
  - Left accent: a 2px left border on the container using relative + before pseudo: before:absolute before:left-0 before:inset-y-2 before:w-0.5 before:rounded-full before:bg-[#7C3AED]
  - The container needs: relative overflow-visible

ICONS PER NAV ITEM (use heroicons outline style, 16x16):
- Profile: UserCircleIcon
- Account: CogIcon
- API Keys: KeyIcon (show this as ACTIVE)
- Voice: MicrophoneIcon
- Billing: CreditCardIcon
- Team: UsersIcon
- Notifications: BellIcon
- Integrations: PuzzlePieceIcon

Each nav item also has a count badge on the right for applicable items:
- API Keys: show "3" — bg-white/8 text-white/50 text-xs px-1.5 py-0.5 rounded-md
- Team: show "1" — same style
- Notifications: show "2" — bg-[#EF4444]/20 text-[#EF4444] text-xs px-1.5 py-0.5 rounded-md (red badge for unread)

NAV FOOTER (at bottom of left nav, pinned):
- A card section at bottom: mt-auto p-3 border-t border-white/6
- "Pro Plan" upgrade nudge:
  - bg-[#0A0E14] rounded-xl border border-[#7C3AED]/20 p-3
  - Top row: flex items-center justify-between
    - "Free Plan" — text-xs font-semibold text-white/50
    - "Upgrade" button — bg-[#7C3AED] text-white text-xs font-semibold px-2.5 py-1 rounded-lg hover:bg-[#6D28D9]
  - Usage bar: mt-2
    - Label row: "API Calls" text-xs text-white/30 + "47 / 100" text-xs text-white/50, flex justify-between mb-1
    - Bar: h-1.5 w-full rounded-full bg-white/8 — fill: w-[47%] bg-[#7C3AED] rounded-full

CONTENT AREA:
- Position: ml-56 mt-14 (offset for fixed header and nav)
- Min-height: calc(100vh - 56px)
- Background: bg-[#0D1117]
- Padding: p-8
- Max-width: max-w-3xl (for readable settings forms)
- This is where {children} renders

CONTENT AREA HEADER (shown above children — the page title bar):
- flex items-center justify-between mb-8
- Left:
  - h1: page title (e.g., "API Keys") — Inter, font-size 24px, font-weight 700, text-white
  - p below: page description — font-size 14px, text-white/50, mt-1
- Right: page-specific action button (e.g., "Create Key" — bg-[#7C3AED] rounded-xl px-4 py-2 text-sm font-semibold text-white hover:bg-[#6D28D9] shadow-[0_0_20px_rgba(124,58,237,0.25)])
- Below title bar: 1px divider bg-white/6 mb-8

SCROLLBAR STYLING (for left nav and content area):
- Webkit scrollbar: width 4px
- Track: bg-transparent
- Thumb: bg-white/12 rounded-full
- Hover thumb: bg-white/20

RESPONSIVE:
- Below lg (< 1024px): left nav collapses to icon-only (w-14), show only icons — no text labels, no badges
- Below md (< 768px): left nav hidden entirely, replaced with a horizontal scrollable tab bar below the header
- Content area: remove ml-56 on mobile, full width

FONT: Inter throughout
```
