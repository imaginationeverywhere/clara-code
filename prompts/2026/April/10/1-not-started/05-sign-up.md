## CURSOR AGENT — MCP NOTE
**Figma MCP**: Skip if unavailable. Do NOT wait for it or ask about it. This prompt does NOT require Figma MCP. Proceed immediately with the implementation below.
**Secrets**: All keys are in AWS SSM. Pull with: `aws ssm get-parameter --name '/quik-nation/shared/<KEY_NAME>' --with-decryption --query 'Parameter.Value' --output text`

---

# Magic Patterns Prompt — Sign-Up Page

**File target:** `packages/web-ui/src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`
**Type:** Server Component (page shell) + Client Component (Clerk embed + voice clone teaser)

---

## CONTEXT FOR MAGIC PATTERNS — READ FIRST

Same two-column layout as sign-in (04-sign-in.md) but this page has one differentiating addition: after the Clerk sign-up form, there is a "voice clone hook" — a teaser that shows users what's waiting for them once they complete sign-up. This is a conversion hook based on Clara's free voice clone offer (1 free clone at signup). The right column has two distinct phases: Phase 1 = Clerk sign-up form, Phase 2 = voice clone teaser (shown after form completion via state). Magic Patterns renders both phases as visible sections; the state toggle is implemented in code.

---

## Prompt

```
Design a full-page, two-column sign-up page for Clara Code. Identical structural layout to the sign-in page but with a voice clone acquisition hook on the right column.

LAYOUT (same as sign-in):
- Full viewport height (min-h-screen)
- Two columns: left 45%, right 55%
- Background: bg-[#0D1117]

LEFT COLUMN (identical to sign-in with different copy):
- Background: bg-[#070A0F]
- Centered vertically and horizontally
- Content stack (max-w-sm, centered):
  1. Clara Code mark — SVG two-silhouette icon in Clara Blue #7BCDD8, 48x48px — same wordmark "Clara Code" inline, Inter 600, 22px, text-white
  2. 32px gap
  3. Headline: "Build with your own voice." — Inter, 32px, font-weight 700, text-white
  4. 12px gap
  5. Subtext: "Join 2,400+ developers who deploy AI agents in minutes, not months." — 16px, text-white/55, max-w-xs
  6. 48px gap
  7. Free tier callout — a card:
     - bg-[#0A0E14] rounded-2xl border border-white/8 p-5
     - Header row: "What you get free" label — font-size 11px, font-weight 600, text-white/30, letter-spacing wider, uppercase
     - 12px gap
     - Four feature rows, each: flex items-center gap-3, mb-3
       - Icon: checkmark circle in #10B981, 16x16px SVG
       - Text: 14px, text-white/70
       - Row 1: "1 AI agent with memory"
       - Row 2: "1 free voice clone"
       - Row 3: "100 API calls / month"
       - Row 4: "Clara Code IDE access"
     - Bottom: "No credit card required" — font-size 12px, text-white/30, mt-4, text-center
  8. 24px gap
  9. Footer: "© 2026 Quik Nation, Inc." — font-size 12px, text-white/30

RIGHT COLUMN — TWO PHASES:

PHASE 1 — SIGN-UP FORM (shown by default, data-phase="1"):
- Same structure as sign-in right column
- Headline: "Create your account" — Inter, 28px, font-weight 700, text-white
- Subtext: "Already have an account? Sign in" — 14px, text-white/55; "Sign in" is text-[#7BCDD8] link
- 32px gap
- CLERK SIGN-UP SLOT:
  div id="clerk-sign-up-mount", className="w-full"
  {/* Clerk <SignUp /> mounts here with dark appearance override */}
  Placeholder shimmer container: min-h-[420px] w-full rounded-2xl border border-white/8 bg-[#0A0E14] p-6
  Inside placeholder:
    - GitHub OAuth button: bg-white/8 border border-white/12 rounded-full h-10 w-full flex items-center justify-center gap-3 — GitHub SVG 16x16 white + "Continue with GitHub" 14px font-weight 500 text-white
    - Divider: same OR pattern as sign-in
    - Email input shimmer: h-10 w-full rounded-xl bg-white/8 animate-pulse mb-3
    - Password input shimmer: h-10 w-full rounded-xl bg-white/8 animate-pulse mb-6
    - Submit button shimmer: h-10 w-full rounded-full bg-[#7C3AED]/60 animate-pulse

PHASE 2 — VOICE CLONE HOOK (shown after Clerk form completion, data-phase="2"):
- This entire section is in a div with data-phase="2" class="hidden" — shown via JS after Clerk completes
- Full container: w-full max-w-sm mx-auto
- A success badge at top: inline-flex items-center gap-2 bg-[#10B981]/15 border border-[#10B981]/25 rounded-full px-4 py-1.5 mb-6
  - Green checkmark SVG 14x14 color #10B981
  - Text: "Account created" — 13px, text-[#10B981], font-weight 500
- Headline: "Your free voice clone is waiting." — Inter, 28px, font-weight 700, text-white
- 8px gap
- Subtext: "Clara can speak in your voice. Record 10 seconds and make it yours." — 15px, text-white/55
- 32px gap
- THE WAVEFORM TEASER CARD:
  - Container: bg-[#0A0E14] rounded-2xl border border-[#7BCDD8]/20 p-6
  - Subtle glow: shadow-[0_0_40px_rgba(123,205,216,0.08)]
  - Top row: flex items-center justify-between mb-4
    - Left: "Voice Clone" label — 12px, font-weight 600, text-white/30, uppercase, letter-spacing wider
    - Right: badge "FREE" — bg-[#10B981]/15 text-[#10B981] text-xs font-semibold px-2.5 py-0.5 rounded-full border border-[#10B981]/25
  - WAVEFORM VISUALIZATION (decorative, animated):
    - A row of 32 vertical bars: flex items-end justify-center gap-[3px] h-16 mb-6
    - Each bar: w-1.5 rounded-full bg-[#7BCDD8]/40
    - Bar heights vary to simulate a waveform — pattern (in px): 8, 16, 24, 32, 40, 48, 56, 48, 64, 48, 40, 56, 32, 48, 24, 16, 8, 16, 32, 48, 56, 64, 48, 40, 32, 24, 16, 24, 32, 16, 12, 8
    - The center 8 bars use bg-[#7BCDD8]/80 to appear more active
    - CSS animation: animate-pulse on the center bars with staggered delay (delay-75, delay-150, etc.)
  - MIC BUTTON:
    - A large centered circle: w-16 h-16 mx-auto rounded-full
    - Background: bg-[#7C3AED] shadow-[0_0_30px_rgba(124,58,237,0.35)]
    - Mic SVG icon: white, 24x24, centered
    - Hover: scale-105 transition-transform
    - Below button (mt-3): "Tap to record 10 seconds" — 13px, text-white/30, text-center
  - 20px gap after button
  - Fine print: "Your voice never leaves our servers. Powered by Voxtral." — 11px, text-white/20, text-center
- 24px gap after card
- Skip link: "Skip for now — I'll do this later" — 14px, text-white/30, text-center, hover:text-white/55, underline cursor-pointer
- 16px gap
- CTA button: "Go to Dashboard" — h-11 w-full rounded-full bg-[#7C3AED] text-white font-semibold text-sm shadow-[0_0_30px_rgba(124,58,237,0.35)] hover:bg-[#6D28D9] transition-colors

DESIGN DETAILS (same as sign-in):
- Font: Inter
- Left column right edge: 1px line, absolute, right-0 top-16 bottom-16, bg-white/6
- No box shadows except described above

RESPONSIVE:
- Below lg: hide left column, right column full width, add logo above Phase 1 headline
- The waveform bar animation should respect prefers-reduced-motion: @media (prefers-reduced-motion: reduce) { .waveform-bar { animation: none } }

ACCESSIBILITY:
- Page title: "Create Account — Clara Code"
- The mic button: aria-label="Record voice sample"
- Focus ring: focus:ring-2 focus:ring-[#7C3AED] focus:ring-offset-2 focus:ring-offset-[#0D1117]
```

---

## Clerk Appearance Config (same dark theme as sign-in — NOT generated by Magic Patterns)

```typescript
// Identical to sign-in appearance config
// See 04-sign-in.md for full clerkAppearance object
// The only addition: redirect after sign-up should go to /onboarding/voice-clone
// Set afterSignUpUrl="/onboarding/voice-clone" on the <SignUp /> component
```