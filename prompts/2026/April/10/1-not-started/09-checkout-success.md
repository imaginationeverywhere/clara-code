# Magic Patterns Prompt — Checkout Success Page

**File target:** `packages/web-ui/src/app/(marketing)/checkout/success/page.tsx`
**Type:** Server Component (reads `?plan` and `?session_id` query params server-side) + Client Component wrapper for confetti animation

---

## CONTEXT FOR MAGIC PATTERNS — READ FIRST

This page renders immediately after `stripe.confirmPayment()` resolves successfully in `/checkout/[plan]`. The URL is `/checkout/success?plan=pro&session_id=cs_live_...`. The page is the final step in the three-step checkout flow — the step indicator in the header now shows all three dots completed. The aesthetic continues the dark Clara Code terminal feel from the checkout page (08-checkout.md): `bg-[#0D1117]`, no white backgrounds, purple primary accent. The page's job is threefold: confirm the purchase, reduce buyer's remorse by reinforcing the value they just unlocked, and immediately direct the user toward their first productive action. The primary CTA is "Open Clara Code". The three onboarding next steps ("Download Clara Code", "Create your first API key", "Clone your voice") each map to real destinations in the product.

---

## Prompt

```
Design a checkout success / confirmation page for Clara Code. Dark terminal aesthetic — same background and color system as the checkout page. The user has just started their Pro plan trial. Make them feel good about the decision and immediately get them moving.

URL: /checkout/success
Background: bg-[#0D1117], min-h-screen

HEADER (same simplified checkout header as checkout page — all steps complete):
- h-14 bg-[#070A0F] border-b border-white/6 px-6 flex items-center justify-between
- Left: Clara Code mark (SVG two-silhouette icon #7BCDD8, 24px) + wordmark "Clara Code" Inter 600 16px text-white
- Center: Three-step indicator — all three dots now filled/complete:
  - Dot 1: w-6 h-6 rounded-full bg-[#10B981] flex items-center justify-center — checkmark SVG 12px white
  - Line: w-12 h-px bg-[#10B981]/60
  - Dot 2: w-6 h-6 rounded-full bg-[#10B981] flex items-center justify-center — checkmark SVG 12px white
  - Line: w-12 h-px bg-[#10B981]/60
  - Dot 3: w-6 h-6 rounded-full bg-[#10B981] flex items-center justify-center — checkmark SVG 12px white
  - Labels below each dot (text-xs text-white/40, mt-1): "Plan" / "Payment" / "Confirm"
- Right: "© 2026 Quik Nation, Inc." — text-xs text-white/30

MAIN CONTENT:
- max-w-2xl mx-auto px-6 py-16 text-center

CONFETTI LAYER (Client Component wrapper — NOT Magic Patterns output):
- Render as an empty div with id="confetti-mount" fixed inset-0 pointer-events-none z-10
- Comment inside: {/* Canvas-confetti fires here on mount — purple #7C3AED and Clara Blue #7BCDD8 colors, 3-second burst */}

SUCCESS BADGE:
- inline-flex items-center gap-2 bg-[#10B981]/12 border border-[#10B981]/25 rounded-full px-5 py-2 mb-8 mx-auto
- Animated pulse ring: relative — before:absolute before:inset-0 before:rounded-full before:border before:border-[#10B981]/30 before:animate-ping
- Green checkmark SVG 16x16 color #10B981
- Text: "Pro plan activated" — 14px font-weight 600 text-[#10B981]

HEADLINE:
- "You're in." — Inter, font-size 52px, font-weight 800, text-white, tracking-tight, line-height 1.05
- 16px gap
- Subheadline: "Clara Code Pro is ready. 14 days free — then $49/month. Cancel anytime." — Inter, 18px, text-white/55, max-w-md mx-auto, line-height 1.5

PRIMARY CTA:
- 40px gap below subheadline
- Button: "Open Clara Code" — w-full max-w-xs mx-auto h-14 rounded-2xl bg-[#7C3AED] text-white font-semibold text-base
- shadow-[0_0_40px_rgba(124,58,237,0.4)]
- hover:bg-[#6D28D9] transition-colors
- flex items-center justify-center gap-3 mx-auto
- Left: arrow-up-right SVG 18px white (external/open link icon)
- Text: "Open Clara Code"
- Below button (mt-3): "Opens the desktop IDE — download required if not installed" — 12px text-white/30 text-center

DOWNLOAD FALLBACK LINK (below button hint, mt-2):
- "Don't have it yet? Download Clara Code" — 13px text-white/40, text-center
- "Download Clara Code" is a link: text-[#7BCDD8] hover:underline

DIVIDER WITH LABEL:
- mt-12 mb-10 flex items-center gap-4
- Two hr lines: flex-1 border-t border-white/8
- Center text: "Your first 3 moves" — text-sm font-semibold text-white/30 uppercase tracking-wider px-4

NEXT STEPS CARD GRID:
- grid grid-cols-1 gap-4 (single column — stack vertically for clean numbered flow)
- max-w-lg mx-auto

CARD 1 — Download Clara Code:
- bg-[#0A0E14] rounded-2xl border border-white/8 p-5 text-left
- flex items-start gap-4
- Step number bubble: w-8 h-8 rounded-full bg-[#7C3AED]/20 border border-[#7C3AED]/30 flex items-center justify-center flex-shrink-0
  - "1" — text-sm font-bold text-[#7C3AED]
- Content stack:
  - Title row: flex items-center justify-between
    - "Download Clara Code" — 15px font-weight 600 text-white
    - arrow-up-right SVG 14px text-white/30
  - 4px gap
  - Body: "Get the IDE on your machine. macOS, Windows, and Linux available." — 13px text-white/50 line-height 1.5
  - 12px gap
  - Platform badges row: flex items-center gap-2
    - Three pills: "macOS" / "Windows" / "Linux"
    - Each: bg-white/6 border border-white/10 rounded-full px-2.5 py-0.5 text-xs text-white/50
- href: links to downloads page (entire card is a link — hover:border-white/16 hover:bg-[#0A0E14]/80 transition-colors)

CARD 2 — Create your first API key:
- Same container as Card 1
- Step number bubble: "2" in same purple bubble
- Content stack:
  - Title row: "Create your first API key" — same style + arrow-up-right
  - Body: "Generate a key to connect your tools. Keys take 10 seconds to create." — same style
  - 12px gap
  - Destination hint: flex items-center gap-1.5 — KeyIcon SVG 12px text-white/30 + "Settings → API Keys" — text-xs text-white/30 JetBrains Mono
- href: "/settings/api-keys" (card links there)

CARD 3 — Clone your voice:
- Same container
- Step number bubble: "3" — but use Clara Blue instead of purple:
  - bg-[#7BCDD8]/15 border border-[#7BCDD8]/25 text-[#7BCDD8]
- Content stack:
  - Title row: "Clone your voice" — same + arrow-up-right
  - Body: "Record 10 seconds and Clara will speak as you. Included free with Pro." — same style
  - 12px gap
  - MINI WAVEFORM (decorative, same waveform teaser from sign-up Phase 2 but smaller):
    - flex items-end gap-[2px] h-6
    - 24 bars: w-1 rounded-full bg-[#7BCDD8]/35
    - Heights (px): 4, 8, 12, 16, 20, 24, 20, 16, 24, 16, 12, 20, 8, 12, 16, 24, 20, 12, 16, 20, 16, 12, 8, 4
    - Center 8 bars: bg-[#7BCDD8]/65
  - 6px gap
  - Destination hint: flex items-center gap-1.5 — MicrophoneIcon SVG 12px text-[#7BCDD8]/50 + "Settings → Voice" — text-xs text-[#7BCDD8]/50 JetBrains Mono
- href: "/settings/voice"
- Hover: border-[#7BCDD8]/20

ACCOUNT SUMMARY STRIP (below cards, mt-10):
- bg-[#0A0E14] rounded-2xl border border-white/8 p-5 max-w-lg mx-auto
- Three data points in a row: flex items-center justify-around
- Each data point: text-center
  - Value: text-lg font-semibold text-white
  - Label: text-xs text-white/35 mt-0.5 uppercase tracking-wider
  - Values / Labels:
    - "Pro" / "Current Plan"
    - "Apr 24, 2026" / "Trial Ends"
    - "$0.00" / "Charged Today"
- Between each: w-px h-8 bg-white/8 (vertical dividers)

FOOTER STRIP:
- mt-12 pt-8 border-t border-white/6 max-w-lg mx-auto
- flex items-center justify-between
- Left: "A confirmation email was sent to ar@claracode.ai" — text-xs text-white/30
- Right: two links in flex gap-4
  - "View receipt" — text-xs text-[#7BCDD8] hover:underline
  - "Manage subscription" — text-xs text-white/40 hover:text-white/60

DESIGN DETAILS:
- Font: Inter for all UI text; JetBrains Mono for destination hints ("Settings → API Keys")
- No additional box shadows beyond those specified on the primary CTA button
- All card hover transitions: transition-colors duration-150
- The success badge's animate-ping should respect prefers-reduced-motion: @media (prefers-reduced-motion: reduce) { .success-pulse { animation: none } }

RESPONSIVE:
- Below md (< 768px):
  - Headline: 36px (reduce from 52px)
  - Step indicator in header: reduce to text label only: "Step 3 of 3 — Complete" text-xs text-[#10B981]
  - Account summary strip: stack the three data points vertically (flex-col gap-4), remove vertical dividers
  - Cards: already single-column, add mx-4 padding on mobile
- Below sm (< 640px): primary CTA button full viewport width (w-full, remove max-w-xs)

ACCESSIBILITY:
- Page title: "Welcome to Pro — Clara Code"
- aria-live="polite" on the success badge for screen reader announcement
- All card links: aria-label="[Card title] — opens [destination]"
- Focus ring: focus:ring-2 focus:ring-[#7C3AED] focus:ring-offset-2 focus:ring-offset-[#0D1117]
```

---

## Client Component Notes (NOT generated by Magic Patterns)

```typescript
// packages/web-ui/src/app/(marketing)/checkout/success/SuccessClient.tsx
// 'use client'
//
// On mount:
// 1. Fire canvas-confetti burst:
//    confetti({ particleCount: 120, spread: 80, colors: ['#7C3AED', '#7BCDD8', '#10B981'], origin: { y: 0.4 } })
//
// 2. Read searchParams.get('session_id') — pass to server action to:
//    - Verify the Stripe session is paid/trialing
//    - Get the confirmed plan name for display
//    - Log the conversion event
//
// 3. If session_id is missing or session status is not 'trialing'/'active':
//    - redirect('/pricing') — prevent direct URL access to success page
//
// Primary CTA "Open Clara Code" href:
//    - macOS: 'claracode://' deep link to launch the app
//    - Fallback: '/downloads' if deep link fails (use a try/catch on window.location assignment with 500ms timeout)
```
