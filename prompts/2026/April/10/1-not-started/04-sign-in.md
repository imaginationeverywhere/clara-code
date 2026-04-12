## CURSOR AGENT — MCP NOTE
**Figma MCP**: Skip if unavailable. Do NOT wait for it or ask about it. This prompt does NOT require Figma MCP. Proceed immediately with the implementation below.
**Secrets**: All keys are in AWS SSM. Pull with: `aws ssm get-parameter --name '/quik-nation/shared/<KEY_NAME>' --with-decryption --query 'Parameter.Value' --output text`

---

# Magic Patterns Prompt — Sign-In Page

**File target:** `packages/web-ui/src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`
**Type:** Server Component (page shell) + Client Component (Clerk embed)

---

## CONTEXT FOR MAGIC PATTERNS — READ FIRST

This is the authentication entry point for claracode.ai. Developers land here when they click "Sign In" from the marketing nav. The aesthetic is a dark IDE — this is a developer tool, not a SaaS dashboard. The left column establishes brand identity; the right column is where Clerk's `<SignIn />` component mounts. Magic Patterns generates the layout and wrapper — the actual Clerk component drops in as a styled slot marked with a comment.

---

## Prompt

```
Design a full-page, two-column sign-in page for Clara Code, a developer IDE tool. Dark terminal aesthetic. No white backgrounds anywhere.

LAYOUT:
- Full viewport height (min-h-screen)
- Two columns: left 45% width, right 55% width
- Background: bg-[#0D1117]
- No border between columns — they bleed into the dark background

LEFT COLUMN:
- Background: bg-[#070A0F] — slightly darker than page bg, creating a sunken panel
- Centered vertically and horizontally using flex
- Content stack (centered, max-w-sm):
  1. Clara Code mark — an SVG icon: two overlapping silhouettes (human figures) in Clara Blue #7BCDD8, 48x48px, followed on the same line by wordmark "Clara Code" in Inter font, font-weight 600, font-size 22px, text-white
  2. 32px vertical gap
  3. Headline: "Your AI is waiting." — Inter, font-size 32px, font-weight 700, text-white, line-height 1.2
  4. 12px gap
  5. Subtext: "Sign in to access your agents, API keys, and voice settings." — Inter, font-size 16px, text-white/55, line-height 1.6, max-w-xs
  6. 48px gap
  7. Three trust badges in a vertical list, each on its own row:
     - Row 1: green dot (bg-[#10B981], 8px circle) + "Agents running 24/7" — font-size 14px, text-white/70
     - Row 2: green dot + "Voice cloning included" — same style
     - Row 3: green dot + "API access on all plans" — same style
     - 16px gap between rows
     - Each row uses flex with items-center and gap-3
  8. 48px gap
  9. Footer text at bottom-left of column: "© 2026 Quik Nation, Inc." — font-size 12px, text-white/30

RIGHT COLUMN:
- Background: bg-[#0D1117]
- Centered vertically and horizontally using flex
- Content container: max-w-sm, w-full, mx-auto
- Content stack:
  1. Headline: "Welcome back" — Inter, font-size 28px, font-weight 700, text-white, mb-2
  2. Subtext: "Don't have an account? Sign up" — font-size 14px, text-white/55
     The word "Sign up" is a link: text-[#7BCDD8], no underline, hover:underline
  3. 32px gap
  4. CLERK SIGN-IN SLOT:
     Render a div with id="clerk-sign-in-mount" and className="w-full"
     Inside, place a comment: {/* Clerk <SignIn /> mounts here with dark appearance override */}
     The div should have: min-h-[380px] w-full rounded-2xl border border-white/8 bg-[#0A0E14] p-6
     Show a placeholder inside: a centered loading shimmer — three horizontal bars (rounded-full, bg-white/8, animate-pulse):
       - Bar 1: h-10 w-full mb-4 (simulates the GitHub OAuth button)
       - A divider: flex items-center gap-3 mb-4 — two hr lines (border-white/8, flex-1) with "or" text (text-white/30, text-xs, px-2) between them
       - Bar 2: h-10 w-full mb-3 (email input)
       - Bar 3: h-10 w-full mb-6 (password input)
       - Bar 4: h-10 w-full rounded-full (submit button — note rounded-full for auth CTAs)
  5. 24px gap below the Clerk slot
  6. Fine print: "By signing in, you agree to our Terms of Service and Privacy Policy." — font-size 12px, text-white/30, text-center

DESIGN DETAILS:
- Font: Inter for all UI text
- The GitHub OAuth button placeholder (Bar 1 above) should actually be rendered as a real button in the placeholder state:
  - bg-white/8 border border-white/12 rounded-full h-10 w-full
  - flex items-center justify-center gap-3
  - GitHub SVG icon (16x16, white) + "Continue with GitHub" text (font-size 14px, font-weight 500, text-white)
  - hover:bg-white/12 transition-colors
- No box shadows on the page except: the Clerk slot container gets a very subtle inset shadow: shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
- The left column has a subtle right edge: after the column, add a 1px vertical line using absolute positioning: right-0, top-16, bottom-16, w-px, bg-white/6

RESPONSIVE:
- Below lg breakpoint (< 1024px): hide left column, right column takes full width
- Right column content stays max-w-sm centered
- Mobile: add Clara Code mark + wordmark above the "Welcome back" headline (visible only on mobile, hidden on desktop)

ACCESSIBILITY:
- The page title (not visible) should be "Sign In — Clara Code"
- All interactive elements have focus:ring-2 focus:ring-[#7C3AED] focus:ring-offset-2 focus:ring-offset-[#0D1117]
```

---

## Clerk Appearance Config (attach to Clerk `<SignIn />` — NOT generated by Magic Patterns)

```typescript
// This goes in the Client Component wrapper, not in Magic Patterns output
const clerkAppearance = {
  baseTheme: undefined,
  variables: {
    colorBackground: '#0A0E14',
    colorInputBackground: '#070A0F',
    colorInputText: '#ffffff',
    colorText: '#ffffff',
    colorTextSecondary: 'rgba(255,255,255,0.55)',
    colorPrimary: '#7C3AED',
    colorDanger: '#EF4444',
    colorSuccess: '#10B981',
    borderRadius: '0.75rem',
    fontFamily: 'Inter, sans-serif',
  },
  elements: {
    card: 'bg-transparent shadow-none border-none p-0',
    headerTitle: 'hidden',
    headerSubtitle: 'hidden',
    socialButtonsBlockButton: 'bg-white/8 border border-white/12 hover:bg-white/12 rounded-full text-white',
    formButtonPrimary: 'bg-[#7C3AED] hover:bg-[#6D28D9] rounded-full shadow-[0_0_30px_rgba(124,58,237,0.35)]',
    formFieldInput: 'bg-[#070A0F] border-white/12 text-white rounded-xl',
    footerActionLink: 'text-[#7BCDD8]',
  },
}
```