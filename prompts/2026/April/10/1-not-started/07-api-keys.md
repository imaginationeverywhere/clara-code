## CURSOR AGENT — MCP NOTE
**Figma MCP**: Skip if unavailable. Do NOT wait for it or ask about it. This prompt does NOT require Figma MCP. Proceed immediately with the implementation below.
**Secrets**: All keys are in AWS SSM. Pull with: `aws ssm get-parameter --name '/quik-nation/shared/<KEY_NAME>' --with-decryption --query 'Parameter.Value' --output text`

---

# Magic Patterns Prompt — API Keys Settings Page

**File target:** `packages/web-ui/src/app/(dashboard)/settings/api-keys/page.tsx`
**Type:** Client Component (table interactions, modal state, copy-to-clipboard)

---

## CONTEXT FOR MAGIC PATTERNS — READ FIRST

This page lives inside the settings layout shell (06-settings-layout.md) — it renders as the `{children}` content area. Developers use this page to create API keys, view existing keys (prefix-only, never full value), see last-used timestamps, and revoke keys. The critical UX moment is the "show-once" reveal: when a key is first created, its full value is shown exactly once in a modal. After the modal is dismissed, it can never be retrieved again. This page must communicate that constraint clearly.

---

## Prompt

```
Design the API Keys settings page for Clara Code. This renders inside the settings shell — assume the layout chrome (header, left nav) is already present. Design only the content area interior.

PAGE HEADER (already in layout shell — match the shell pattern):
- h1: "API Keys" — 24px, font-weight 700, text-white
- p: "Authenticate your applications and tools with personal access tokens." — 14px, text-white/50
- Action button (top right): "Create API Key" — bg-[#7C3AED] rounded-xl px-4 py-2 text-sm font-semibold text-white hover:bg-[#6D28D9] shadow-[0_0_20px_rgba(124,58,237,0.25)]
- Divider below header: 1px bg-white/6 mb-8

MAIN CONTENT:

SECTION 1 — INFO CALLOUT:
- bg-[#0A0E14] border border-[#7BCDD8]/20 rounded-xl p-4 mb-8 flex gap-3
- Left: info circle SVG 18x18 text-[#7BCDD8], flex-shrink-0, mt-0.5
- Right:
  - Title: "Keys are shown once" — font-size 14px, font-weight 600, text-white mb-1
  - Body: "For security, the full key value is only shown immediately after creation. Store it in your environment variables — we cannot retrieve it again." — font-size 13px, text-white/55, line-height 1.5

SECTION 2 — KEYS TABLE:
- Table container: w-full, rounded-2xl, border border-white/8, overflow-hidden
- Table: w-full, bg-[#0A0E14]

TABLE HEADER ROW:
- bg-[#070A0F] border-b border-white/6
- Columns (px-5 py-3 text-left):
  - "NAME" — text-xs font-semibold text-white/30 uppercase tracking-wider
  - "KEY" — same
  - "CREATED" — same
  - "LAST USED" — same
  - "SCOPES" — same
  - "" (actions column — no label)

TABLE DATA ROWS — show 3 example rows:

ROW 1 (Production):
- Name cell: "Production" — font-size 14px font-weight 500 text-white; below name: "Active" badge — bg-[#10B981]/15 text-[#10B981] text-xs font-semibold px-2 py-0.5 rounded-full border border-[#10B981]/20
- Key cell: mono font (JetBrains Mono), font-size 13px, text-white/55 — value: "cck_live_a8f2..." — followed by a copy icon button (CopyIcon SVG 14x14, text-white/30, hover:text-white/70, ml-2)
- Created: "Mar 15, 2026" — 14px text-white/50
- Last Used: "2 minutes ago" — 14px text-[#10B981] (recent = green)
- Scopes: two badges inline: "read" and "write" — bg-white/6 text-white/50 text-xs px-2 py-0.5 rounded-md border border-white/10; gap-1.5 between them
- Actions: "Revoke" — text-sm text-white/30 hover:text-[#EF4444] transition-colors

ROW 2 (Development):
- Name cell: "Development" — same font; "Active" badge same as row 1
- Key cell: "cck_dev_3b91..." — same mono style
- Created: "Mar 8, 2026"
- Last Used: "Yesterday" — 14px text-white/50 (neutral)
- Scopes: "read", "write", "admin" — three badges
- Actions: "Revoke" — same

ROW 3 (CI/CD Pipeline — REVOKED):
- Row background: bg-[#EF4444]/5 (subtle red tint)
- Name cell: "CI/CD Pipeline" — text-white/35 (dimmed); "Revoked" badge — bg-[#EF4444]/15 text-[#EF4444] text-xs font-semibold px-2 py-0.5 rounded-full border border-[#EF4444]/20
- Key cell: "cck_live_f7c4..." — text-white/25 mono
- Created: "Feb 22, 2026" — text-white/35
- Last Used: "Mar 31, 2026" — text-white/35
- Scopes: "read" badge — dimmed: bg-white/4 text-white/25
- Actions: "Deleted" — text-sm text-white/20, cursor-not-allowed, italic

Row borders: border-b border-white/6 on each row except last
Row hover (active rows only): hover:bg-white/[0.02]
Row padding: px-5 py-4

EMPTY STATE (shown when no keys exist — design this as an alternate view below the table, hidden by default):
- bg-[#0A0E14] rounded-2xl border border-dashed border-white/12 p-12 text-center
- KeyIcon SVG 40x40 text-white/15 mx-auto mb-4
- Title: "No API keys yet" — 18px font-weight 600 text-white/50 mb-2
- Body: "Create your first API key to start building with Clara." — 14px text-white/30
- "Create API Key" button: same style as page header button, mt-6

SECTION 3 — SCOPE REFERENCE CARD:
- mt-8
- Title: "Scope Reference" — 16px font-weight 600 text-white mb-4
- Three-column grid (grid grid-cols-3 gap-3):

  Card 1 — "read":
    - bg-[#0A0E14] rounded-xl border border-white/8 p-4
    - Badge: "read" — bg-white/6 text-white/50 text-xs px-2 py-0.5 rounded-md border border-white/10 inline-block mb-3
    - Description: "Access data: list agents, fetch usage stats, read settings." — 13px text-white/50 line-height 1.5

  Card 2 — "write":
    - Same container
    - Badge: "write" — same style
    - Description: "Modify data: create agents, update settings, trigger deployments." — 13px text-white/50

  Card 3 — "admin":
    - Same container, but border border-[#7C3AED]/20
    - Badge: "admin" — bg-[#7C3AED]/15 text-[#7C3AED] text-xs px-2 py-0.5 rounded-md border border-[#7C3AED]/25 inline-block mb-3
    - Description: "Full access: manage team members, billing, and revoke all keys." — 13px text-white/50
    - Warning note below: flex items-center gap-1.5 mt-2 — warning triangle SVG 12x12 text-[#F59E0B] + "Use with caution" text-xs text-[#F59E0B]/70

---

CREATE KEY MODAL (shown on "Create API Key" click — render as a visible overlay in the design):

MODAL OVERLAY:
- Fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50

MODAL PANEL:
- bg-[#0A0E14] rounded-2xl border border-white/12 w-full max-w-md p-6 shadow-[0_25px_80px_rgba(0,0,0,0.6)]
- Header: flex items-center justify-between mb-6
  - Title: "Create API Key" — 18px font-weight 700 text-white
  - Close button: X SVG 16x16 text-white/40 hover:text-white/80, w-8 h-8 rounded-lg hover:bg-white/8 flex items-center justify-center

FORM FIELDS:
1. Key Name:
   - Label: "Key Name" — text-sm font-medium text-white/70 mb-1.5
   - Input: w-full h-10 bg-[#070A0F] border border-white/12 rounded-xl px-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 focus:border-[#7C3AED]/50
   - Placeholder: "e.g., Production API Key"
   - Helper: "Choose a descriptive name — you cannot rename keys later." — text-xs text-white/30 mt-1.5

2. Expiration (16px gap below name field):
   - Label: "Expiration" — same label style
   - A segmented control (flex, bg-[#070A0F] rounded-xl p-1 border border-white/8):
     - Four segments: "30 days" / "90 days" / "1 year" / "No expiry"
     - Each: flex-1, py-1.5, text-center, text-sm, text-white/40, rounded-lg, cursor-pointer
     - Active segment (show "90 days" active): bg-[#0D1117] text-white font-medium shadow-sm border border-white/12

3. Scopes (16px gap):
   - Label: "Scopes" — same label style
   - Three checkbox rows:
     - Each row: flex items-start gap-3 py-2
     - Checkbox: w-4 h-4 rounded-md bg-[#070A0F] border border-white/20 mt-0.5 flex-shrink-0
       - Checked state (show "read" and "write" checked): bg-[#7C3AED] border-[#7C3AED] — with white checkmark SVG inside
     - Text stack: label (14px font-medium text-white) + description (12px text-white/40)
       - "read" + "Access agents and usage data"
       - "write" + "Create agents and trigger runs"
       - "admin" + "Full platform access — use carefully"

MODAL FOOTER (mt-6 pt-6 border-t border-white/6 flex gap-3):
- Cancel button: flex-1, h-10, rounded-xl, bg-transparent, border border-white/12, text-sm, font-medium, text-white/70, hover:bg-white/6
- Create Key button: flex-1, h-10, rounded-xl, bg-[#7C3AED], text-white, text-sm, font-semibold, hover:bg-[#6D28D9], shadow-[0_0_20px_rgba(124,58,237,0.3)]

---

SHOW-ONCE REVEAL MODAL (shown immediately AFTER key creation — render as a second modal state in the design):

Same overlay as above. Same panel width.

Panel header: flex items-center gap-3 mb-2
- Success icon: w-10 h-10 rounded-full bg-[#10B981]/15 flex items-center justify-center — checkmark SVG 20x20 text-[#10B981]
- Title: "Save your API key now" — 18px font-weight 700 text-white
- Subtitle below: "This key will never be shown again. Copy it to a safe place." — 13px text-white/55 mt-1

Key display (mt-6):
- Container: bg-[#070A0F] rounded-xl border border-[#10B981]/20 p-4
- Key value: JetBrains Mono, 13px, text-[#10B981], break-all, letter-spacing 0.02em
  - Value: "cck_live_a8f2b3c9d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"
- Copy button below (mt-3): w-full h-9 rounded-lg bg-white/6 border border-white/10 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors
  - Copy SVG 14x14 text-white/60 + "Copy to clipboard" text-sm text-white/70

Warning (mt-4): flex items-start gap-2
- Warning triangle SVG 14x14 text-[#F59E0B] mt-0.5 flex-shrink-0
- "We do not store the full key. If you lose it, you will need to revoke this key and create a new one." — 12px text-[#F59E0B]/70 line-height 1.5

Modal footer (mt-6 pt-5 border-t border-white/6):
- Single full-width button: "I've saved my key" — h-10 w-full rounded-xl bg-[#0D1117] border border-white/12 text-sm font-medium text-white/70 hover:bg-white/6

TYPOGRAPHY:
- Inter for UI labels
- JetBrains Mono for key values, key prefixes in table
```