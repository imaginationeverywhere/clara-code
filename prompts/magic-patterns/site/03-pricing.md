# Magic Patterns Prompt — claracode.ai Pricing Section

**File target:** `packages/web-ui/src/app/(marketing)/components/Pricing.tsx`
**Type:** Server Component

---

## CONTEXT FOR MAGIC PATTERNS — READ FIRST
**Clara Code is a DESKTOP/TERMINAL APPLICATION** — a voice-first AI coding assistant.
This is the pricing section of its developer tool marketing site. Aesthetic: Vercel/Linear/Cursor
pricing pages. Clean. Dark. No gradients on text. Cards are precise, not playful.
Developers are the audience — no fluff, just what's included and what it costs.

---

## Prompt

```
Create a pricing section for claracode.ai — voice-first AI coding assistant.

**Section wrapper:** py-28 bg-[#0D1117]

**Section intro (text-center mb-16):**
- Overline: "PRICING" — text-[11px] text-white/30 tracking-[0.2em] uppercase
- H2: "Start free. Scale when ready." — text-[40px] font-bold text-white mt-3
- Sub: "No credit card required. Open source forever." — text-[17px] text-white/45 mt-3

**Pricing cards (max-w-4xl mx-auto grid grid-cols-3 gap-5 items-start):**

Card 1 — Free:
- bg-[#0A0E14] rounded-2xl border border-white/8 p-7
- Tier label: "Free" text-white/50 text-sm font-medium tracking-wide uppercase mb-4
- Price block: "$0" text-[44px] font-bold text-white leading-none + "forever" text-white/35 text-sm ml-1 align-bottom
- Divider: border-t border-white/8 my-6
- Feature list (space-y-3):
  - ✓ Full CLI access (text-white/70)
  - ✓ Voice input — local processing (text-white/70)
  - ✓ MIT Licensed (text-white/70)
  - ✓ Self-hostable (text-white/70)
  - ✗ Cloud sync (text-white/25 line-through)
  - ✗ Agent personas (text-white/25 line-through)
  - ✗ Team vault (text-white/25 line-through)
- Check icons: small circle checkmark in text-[#10B981] for ✓, small x in text-white/20 for ✗
- CTA (mt-8): "Download CLI" — full width, border border-white/15 hover:border-white/30 text-white/60 hover:text-white rounded-xl py-3 text-sm font-medium text-center transition-colors

Card 2 — Pro (FEATURED — this is the hero card):
- IMPORTANT: This card is slightly taller than the others — position relative, have it visually "lift" above the other two with ring-1 ring-[#7C3AED]/40 border border-[#7C3AED]/30 bg-gradient-to-b from-[#7C3AED]/8 to-[#0A0E14] rounded-2xl p-7 shadow-[0_0_60px_rgba(124,58,237,0.15)]
- "Most Popular" badge: absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#7C3AED] text-white text-[11px] font-semibold tracking-wider uppercase rounded-full px-4 py-1
- Tier label: "Pro" text-[#7C3AED] text-sm font-medium tracking-wide uppercase mb-4
- Price block: "$20" text-[44px] font-bold text-white leading-none + "/month" text-white/45 text-base ml-1 align-bottom
- Divider: border-t border-[#7C3AED]/15 my-6
- Feature list (same format, all ✓):
  - ✓ Everything in Free
  - ✓ Voice + cloud sync
  - ✓ Clara vault (encrypted)
  - ✓ 1 custom agent persona
  - ✓ Voice clone (1 included)
  - ✓ Priority support
  - ✗ Team vault (text-white/25 line-through)
- CTA (mt-8): "Start Free Trial" — full width, bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl py-3 text-sm font-semibold shadow-[0_4px_20px_rgba(124,58,237,0.4)] transition-all

Card 3 — Team:
- Same base style as Card 1: bg-[#0A0E14] rounded-2xl border border-white/8 p-7
- Tier label: "Team" text-white/50 text-sm uppercase tracking-wide mb-4
- Price block: "$99" text-[44px] font-bold text-white leading-none + "/month" text-white/35 text-sm ml-1 align-bottom
- Small note below price: "per team · up to 8 members" text-white/30 text-xs mt-1
- Divider: border-t border-white/8 my-6
- Feature list:
  - ✓ Everything in Pro
  - ✓ Shared team vault
  - ✓ Up to 6 agent personas
  - ✓ Admin dashboard
  - ✓ SSO (Clerk teams)
  - ✓ SLA + dedicated support
- CTA (mt-8): "Contact Sales" — full width, border border-white/15 hover:border-white/30 text-white/60 hover:text-white rounded-xl py-3 text-sm font-medium text-center transition-colors

**Fine print (text-center mt-12):**
- "All plans include CLI access · Prices in USD · Cancel anytime"
- text-[12px] text-white/25

Server Component. Tailwind only. relative positioning needed on Card 2 for the badge.
```
