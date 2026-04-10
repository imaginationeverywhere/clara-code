# Magic Patterns Prompt — claracode.ai Hero Section

**File target:** `packages/web-ui/src/app/(marketing)/page.tsx` (or `components/marketing/Hero.tsx`)
**Type:** Server Component (static — no interactivity needed in hero shell)

---

## CONTEXT FOR MAGIC PATTERNS — READ FIRST
**Clara Code is a DESKTOP/TERMINAL APPLICATION** — a voice-first AI coding assistant
similar to VS Code or Cursor, but you speak instead of type. This is the MARKETING SITE
for that product. The design should feel like a premium developer tool landing page —
think Vercel, Linear, Cursor, or Warp's marketing site. NOT a SaaS app or consumer product.
- Dense. Dark. Developer-grade. No gradients on body text.
- The demo preview in the hero should look like a real desktop app window.
- Typography is tight. Spacing is intentional. Nothing is fluffy.

---

## Prompt

```
Create a full-screen dark hero section for "Clara Code" — a voice-first AI coding assistant at claracode.ai.

**Header (sticky, top-0, z-50):**
- Left: "Clara Code" wordmark — "Clara" in Inter Bold white, "Code" in JetBrains Mono Bold electric blue #4F8EF7
- Right: nav links "Docs" "Pricing" "GitHub" in text-white/50 hover:text-white, then "Get Early Access" solid button (bg-[#7C3AED] rounded-full px-5 py-2 text-sm font-medium)
- Header bg: rgba(13,17,23,0.85) backdrop-blur-md border-b border-white/5

**Hero body (min-h-screen flex flex-col items-center justify-center, bg-[#0D1117]):**

Background texture:
- Subtle dot grid: radial-gradient dots at 28px spacing, rgba(124,58,237,0.08)
- Two soft radial glows: one purple (#7C3AED/15) top-left, one blue (#4F8EF7/10) bottom-right
- No animated backgrounds — static only

Content stack (max-w-3xl mx-auto text-center, gap-6):

1. Eyebrow badge: pill shape, border border-[#7C3AED]/30 bg-[#7C3AED]/8 text-[#7C3AED] text-xs tracking-[0.15em] uppercase px-4 py-1.5 rounded-full — text: "NOW IN BETA"

2. H1 (text-[64px] font-bold leading-[1.08] tracking-tight):
   - Line 1: "Your voice." — text-white
   - Line 2: "Your code." — gradient text from #7C3AED to #4F8EF7 (bg-gradient-to-r bg-clip-text text-transparent)

3. Subheadline: "Speak naturally. Clara Code hears your intent and writes the implementation." — text-[18px] text-white/55 max-w-[520px] mx-auto leading-relaxed

4. CTA row (flex gap-3 justify-center mt-2):
   - Primary: "Get Early Access" — bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-full px-7 py-3.5 text-[15px] font-semibold shadow-[0_0_30px_rgba(124,58,237,0.35)]
   - Secondary: "View on GitHub" — border border-white/15 hover:border-white/30 text-white/70 hover:text-white rounded-full px-7 py-3.5 text-[15px] flex items-center gap-2 with GitHub SVG icon (16px)

5. Social proof (mt-3): "Trusted by 2,400+ developers" — text-xs text-white/30, with 5 small avatar circles overlapping

**Demo preview block (mt-16, max-w-2xl mx-auto):**
- Outer frame: rounded-2xl border border-white/8 bg-[#0A0E14] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.6)]
- Mock browser bar (h-10 bg-[#070B10] border-b border-white/5 flex items-center px-4 gap-2):
  - Three traffic light dots (12px circles): red #FF5F57, yellow #FFBD2E, green #28CA41
  - URL bar center: text-xs text-white/25 bg-[#0D1117] rounded px-3 py-1 — "claracode.ai/app"
- App content area (h-64 bg-[#0D1117] flex items-end justify-center pb-8):
  - Center: large mic button (80px circle, bg-[#7C3AED] shadow-[0_0_40px_rgba(124,58,237,0.5)])
    - White microphone SVG icon (28px) centered
    - Outer pulse ring: ring-4 ring-[#7C3AED]/20 animate-ping (1 ring, slow 2s duration)
  - Above mic: code snippet floating card (bg-[#0F1318] border border-white/8 rounded-xl px-4 py-3 text-left mb-4):
    - Text line 1: text-[#10B981] text-xs font-mono "▶ 'Add authentication to the login page'"
    - Divider line
    - Text line 2: text-white/40 text-xs font-mono "const handleLogin = async (email: string) => {"
    - Text line 3: text-[#4F8EF7] text-xs font-mono "&nbsp;&nbsp;const { data } = await signIn({ email })"
    - Text line 4: text-white/40 text-xs font-mono "}"
  - Below mic: text-xs text-white/25 tracking-wide "HOLD TO SPEAK"

Font setup (in layout): Inter (400,500,600,700) + JetBrains Mono (400,700) from Google Fonts.
Background: bg-[#0D1117]. No Tailwind animations except the pulse on the mic ring.
Server Component — no 'use client'.
```
