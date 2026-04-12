## CURSOR AGENT — MCP NOTE
**Figma MCP**: Skip if unavailable. Do NOT wait for it or ask about it. This prompt does NOT require Figma MCP. Proceed immediately with the implementation below.
**Secrets**: All keys are in AWS SSM. Pull with: `aws ssm get-parameter --name '/quik-nation/shared/<KEY_NAME>' --with-decryption --query 'Parameter.Value' --output text`

---

# Magic Patterns Prompt — Install / Download CTA Section

**File target:** `packages/web-ui/src/app/(marketing)/components/InstallCta.tsx`
**Type:** Client Component (copy-to-clipboard, package manager tab switching)

---

## CONTEXT FOR MAGIC PATTERNS — READ FIRST

This section lives on the claracode.ai homepage, between the Features section and the Pricing section. It's the "get it now" moment — the point where a developer stops reading and starts installing. Every serious developer tool has this: Bun, Remix, Vercel, Deno. The install command must be prominent, one-click copyable, and support the three package managers developers actually use (npm, pnpm, brew). Below the CLI install, there are IDE download buttons for the full desktop app. This is a Client Component because the tab switching and clipboard copy require interactivity.

---

## Prompt

```
Create an "Install Clara Code" section for the claracode.ai marketing site. This is the section developers see when they've decided they want it and just need the command. Dark terminal aesthetic. The install command block is the hero of this section — everything else supports it.

SECTION WRAPPER:
- py-24 bg-[#080C12]
- max-w-3xl mx-auto text-center

SECTION INTRO (mb-12):
- Overline: "GET STARTED" — text-[11px] text-white/30 tracking-[0.2em] uppercase font-mono
- H2: "Two ways in." — text-[40px] font-bold text-white mt-3 tracking-tight
- Sub: "CLI for terminal purists. IDE for everyone else." — text-[17px] text-white/45 mt-3 font-mono

---

SPLIT: two columns (grid grid-cols-2 gap-6 mt-12 text-left)

---

LEFT COLUMN — CLI INSTALL:

Column header:
- flex items-center gap-2 mb-4
- Terminal icon (Lucide Terminal, 16px, text-[#7BCDD8])
- "Command Line" — text-[13px] font-semibold text-white font-mono
- "· for terminal purists" — text-[13px] text-white/30 font-mono

PACKAGE MANAGER TABS (flex gap-0 mb-0 — tabs sit directly on top of the install block):
Three pill tabs — inline, attached to the top of the code block:
- Tabs container: flex gap-1 mb-0 pb-0

Tab style (default): bg-[#0A0E14] border border-white/8 border-b-0 rounded-t-lg px-4 py-2 text-[12px] font-mono text-white/35 cursor-pointer hover:text-white/60
Tab style (ACTIVE — show "npm" as active): bg-[#070A0F] border border-white/8 border-b-[#070A0F] text-white/85 rounded-t-lg px-4 py-2 text-[12px] font-mono

Three tabs: "npm" (ACTIVE) | "pnpm" | "brew"

INSTALL COMMAND BLOCK (no top border-radius on left/right — tabs sit on top):
- bg-[#070A0F] border border-white/8 rounded-b-xl rounded-tr-xl overflow-hidden

Command bar: flex items-center justify-between px-5 py-4
- Left: font-mono text-[14px]
  - "$ " — text-white/25
  - "npm install " — text-white/70
  - "-g " — text-white/70
  - "@clara/cli" — text-[#10B981]
- Right: COPY BUTTON
  - Default state: Copy icon (Lucide Copy, 16px) + "Copy" text-[12px] font-mono — text-white/35 hover:text-white/60 flex items-center gap-1.5 cursor-pointer transition-colors
  - Copied state (after click): CheckCircle icon text-[#10B981] + "Copied!" text-[#10B981] text-[12px] font-mono

Below the command bar — divider + alternate commands (px-5 py-3 border-t border-white/6):
  "pnpm add -g @clara/cli" — hidden by default (shows when pnpm tab active)
  "brew install clara-code" — hidden by default (shows when brew tab active)

  (For the design, show the alternate commands as dimmed text below the main command even in npm mode:)
  - "# or: pnpm add -g @clara/cli" — text-[11px] font-mono text-white/18
  - "# or: brew install clara-code" — text-[11px] font-mono text-white/18

After install hint (mt-4 px-5 pb-4):
  "Then run: " — text-[12px] font-mono text-white/30
  "clara" — text-[12px] font-mono text-[#7BCDD8] bg-[#7BCDD8]/8 border border-[#7BCDD8]/15 rounded-md px-1.5 py-0.5
  " to launch the voice TUI" — text-[12px] font-mono text-white/30

Fine print below the block (mt-3):
- "Node.js 18+ required · " text-[11px] font-mono text-white/25 + "docs →" text-[11px] font-mono text-[#7BCDD8] hover:underline

---

RIGHT COLUMN — IDE DOWNLOAD:

Column header:
- flex items-center gap-2 mb-4
- Monitor icon (Lucide Monitor, 16px, text-[#7C3AED])
- "Desktop IDE" — text-[13px] font-semibold text-white font-mono
- "· VS Code, voice-first" — text-[13px] text-white/30 font-mono

DOWNLOAD CARD:
- bg-[#0A0E14] border border-white/8 rounded-xl overflow-hidden

TOP SECTION (p-5):
  - "Clara Code IDE" — text-[15px] font-semibold text-white
  - "v1.0.0 · Stable" — text-[12px] font-mono text-white/30 mt-0.5

  PRIMARY DOWNLOAD BUTTON (mt-4 w-full):
  - Auto-detects OS (show macOS version in the design)
  - bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl py-3 flex items-center justify-center gap-2 font-semibold text-[14px] shadow-[0_0_20px_rgba(124,58,237,0.3)]
  - Apple icon (or custom macOS icon) 16px + "Download for macOS"
  - Below button: "Universal Binary · Apple Silicon + Intel" — text-[11px] font-mono text-white/30 text-center mt-2

DIVIDER (border-t border-white/6 my-1)

OTHER PLATFORMS (px-5 py-3 space-y-2.5):
  - Label: "Other platforms" — text-[11px] font-mono text-white/25 uppercase tracking-wider mb-3

  Platform row style: flex items-center justify-between cursor-pointer hover:bg-white/4 px-0 py-1.5 rounded-lg

  Row 1:
  - Left: Linux icon (circle with penguin-like shape, or just Terminal icon) text-white/40 + "Linux" text-[13px] font-mono text-white/55
  - Right: ".AppImage" text-[11px] font-mono text-white/25 + Download icon 12px text-white/25

  Row 2:
  - Left: Windows icon text-white/40 + "Windows" text-[13px] font-mono text-white/55
  - Right: ".exe" text-[11px] font-mono text-white/25 + Download icon 12px text-white/25

  Row 3 (GitHub source):
  - Left: Github icon text-white/40 + "Source code" text-[13px] font-mono text-white/55
  - Right: ExternalLink icon 12px text-white/25

CARD FOOTER (border-t border-white/6 px-5 py-3):
  - "MIT Licensed · Open Source" — text-[11px] font-mono text-white/25 + "View on GitHub →" text-[11px] font-mono text-[#7BCDD8] hover:underline ml-auto

---

BOTTOM ROW (mt-10 text-center):
- "Already installed?" — text-[13px] font-mono text-white/30
- " Run " — text-[13px] font-mono text-white/30
- "clara update" — text-[13px] font-mono text-[#7BCDD8] bg-[#7BCDD8]/8 border border-[#7BCDD8]/15 rounded-md px-2 py-0.5
- " to get the latest." — text-[13px] font-mono text-white/30

Fine print (mt-3):
- "Verified downloads · SHA-256 checksums available · " — text-[11px] font-mono text-white/20
- "Security policy →" — text-[11px] font-mono text-[#7BCDD8]/60 hover:text-[#7BCDD8]

---

FONT: JetBrains Mono for all command text, labels, platform names. Inter for H2 only.
Backgrounds: bg-[#080C12] section, bg-[#070A0F] code block, bg-[#0A0E14] download card.
No light surfaces anywhere.
```