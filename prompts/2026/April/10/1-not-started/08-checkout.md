## CURSOR AGENT — MCP NOTE
**Figma MCP**: Skip if unavailable. Do NOT wait for it or ask about it. This prompt does NOT require Figma MCP. Proceed immediately with the implementation below.
**Secrets**: All keys are in AWS SSM. Pull with: `aws ssm get-parameter --name '/quik-nation/shared/<KEY_NAME>' --with-decryption --query 'Parameter.Value' --output text`

---

# Magic Patterns Prompt — Checkout Page

**File target:** `packages/web-ui/src/app/(marketing)/checkout/[plan]/page.tsx`
**Type:** Client Component (Stripe Elements requires browser APIs)

---

## CONTEXT FOR MAGIC PATTERNS — READ FIRST

This is what happens when a user clicks "Start Free Trial" on the Pro pricing card. It is NOT a redirect to Stripe's hosted checkout — it is an on-site, embedded checkout using Stripe Elements (`@stripe/react-stripe-js`). The URL pattern is `/checkout/pro` (or `/checkout/team`). The page must remain in the dark Clara Code aesthetic — this should feel like purchasing inside the IDE, not being ejected to a generic payment page.

### Checkout Flow Logic (include in Context section — NOT in the Magic Patterns prompt itself)

```
User clicks "Start Free Trial" on /pricing → Pro card
  ↓
Is user signed in? (check Clerk session)
  → NO: redirect to /sign-in?redirect=/checkout/pro (Clerk handles, then bounces back)
  → YES: proceed to /checkout/pro
  ↓
Page loads: fetch plan details from server action (name, price, features)
Page loads: createPaymentIntent server action → returns clientSecret
  ↓
Render: two-column checkout layout
  - Left: plan summary sidebar
  - Right: Stripe PaymentElement + billing form
  ↓
User submits → stripe.confirmPayment({ redirect: 'if_required' })
  ↓
On success: router.push('/checkout/success?plan=pro&session_id=...')
On failure: show inline error (no page redirect)
```

The Stripe integration uses:
- `loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)`
- `<Elements stripe={stripePromise} options={{ clientSecret, appearance: stripeAppearance }}>` wrapper
- `<PaymentElement />` inside — NOT `<CardElement />` (PaymentElement handles all payment methods)
- Trial: `subscription_data: { trial_period_days: 14 }` on the PaymentIntent/Subscription creation

---

## Prompt

```
Design a two-column checkout page for Clara Code. Dark IDE terminal aesthetic — NOT a white Stripe checkout page. The user is purchasing the Pro plan ($49/month) with a 14-day free trial. No credit card is charged until the trial ends.

URL: /checkout/pro
Background: bg-[#0D1117], min-h-screen

HEADER (simplified — not the full dashboard header):
- h-14 bg-[#070A0F] border-b border-white/6 px-6 flex items-center justify-between
- Left: Clara Code mark (SVG two-silhouette icon #7BCDD8, 24px) + wordmark "Clara Code" Inter 600 16px text-white
- Center: Step indicator — three dots connected by lines:
  - Dot 1: filled circle w-6 h-6 bg-[#7C3AED] flex items-center justify-center — checkmark SVG 12px white (Plan selected — done)
  - Line: w-12 h-px bg-[#7C3AED]/40
  - Dot 2: filled circle w-6 h-6 bg-[#7C3AED] border-2 border-[#7C3AED] — number "2" text-xs font-bold text-white (Payment — current step)
  - Line: w-12 h-px bg-white/12
  - Dot 3: hollow circle w-6 h-6 border-2 border-white/20 — number "3" text-xs text-white/30 (Confirm — upcoming)
  - Labels below each dot (text-xs text-white/40, mt-1): "Plan" / "Payment" / "Confirm"
- Right: "Secure checkout" — flex items-center gap-1.5 text-xs text-white/40 — lock SVG 12px + text

MAIN LAYOUT:
- flex, max-w-5xl, mx-auto, px-6, py-12, gap-8
- Left column: w-80 flex-shrink-0 (plan summary — sticky top-12 on desktop)
- Right column: flex-1 (payment form)

LEFT COLUMN — PLAN SUMMARY SIDEBAR:

PLAN CARD:
- bg-[#0A0E14] rounded-2xl border border-white/8 p-6

Plan header:
- Flex justify-between items-start mb-6
- Left:
  - "Clara Code Pro" — 18px font-weight 700 text-white
  - "14-day free trial included" — 13px text-[#10B981] mt-1
- Right:
  - "$49" — 28px font-weight 700 text-white
  - "/month" — 14px text-white/40

Divider: 1px bg-white/6 mb-5

Feature list (what's included):
- Header: "Everything in Pro:" — 12px font-semibold text-white/30 uppercase tracking-wider mb-3
- Seven feature rows, each: flex items-center gap-2.5 mb-3
  - Checkmark SVG 14x14 text-[#10B981]
  - Text: 14px text-white/70
  - Features:
    - "Unlimited API calls"
    - "5 AI agents with memory"
    - "3 voice clones"
    - "Priority model access"
    - "Advanced analytics"
    - "Team collaboration (up to 5)"
    - "Email + chat support"

Divider: 1px bg-white/6 mt-5 mb-5

TRIAL CALLOUT (inside left card):
- bg-[#10B981]/8 rounded-xl border border-[#10B981]/20 p-4
- flex items-start gap-3
- Calendar SVG 16x16 text-[#10B981] mt-0.5 flex-shrink-0
- Stack:
  - "Free until May 10, 2026" — 14px font-weight 600 text-[#10B981]
  - "Your card won't be charged until the trial ends. Cancel anytime." — 12px text-white/50 mt-1

ORDER SUMMARY (below plan card, mt-4):
- bg-[#0A0E14] rounded-2xl border border-white/8 p-5
- "Order Summary" — 13px font-semibold text-white/30 uppercase tracking-wider mb-4
- Line rows (flex justify-between mb-2):
  - "Clara Code Pro" + "$49.00/mo" — 14px text-white/70
  - "Trial discount (14 days)" + "−$49.00" — 14px text-[#10B981]
- Divider 1px bg-white/6 my-3
- Total row: flex justify-between
  - "Due today" — 16px font-weight 600 text-white
  - "$0.00" — 20px font-weight 700 text-white
- Fine print: "After 14 days: $49.00/month. Cancel anytime." — 12px text-white/30 mt-3 text-center

SECURITY BADGES (below order summary, mt-4):
- flex flex-col gap-2
- Each row: flex items-center gap-2 text-xs text-white/30
  - Lock SVG 12px + "256-bit SSL encryption"
  - Shield SVG 12px + "PCI DSS compliant"
  - Stripe SVG logo (grayscale, 32px wide) + "Powered by Stripe"

RIGHT COLUMN — PAYMENT FORM:

FORM HEADER:
- "Payment Details" — 22px font-weight 700 text-white mb-1
- "You won't be charged until your trial ends." — 14px text-white/50 mb-8

BILLING INFO SECTION:
- Section label: "Billing Information" — 12px font-semibold text-white/30 uppercase tracking-wider mb-4

Two-column grid (grid grid-cols-2 gap-4 mb-4):
  - First Name input
  - Last Name input

Single column (mb-4):
  - Email input (pre-filled from Clerk session: "ar@claracode.ai" shown as a disabled/locked field)
    - Locked field style: bg-[#070A0F] border border-white/8 rounded-xl px-3 h-10 text-sm text-white/50
    - Lock icon inside right edge of field: LockClosedIcon 12px text-white/25

INPUT COMPONENT ANATOMY (for all active inputs):
- Label: text-sm font-medium text-white/70 mb-1.5, display-block
- Input: w-full h-10 bg-[#070A0F] border border-white/12 rounded-xl px-3 text-sm text-white placeholder:text-white/25
- Focus state: focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 focus:border-[#7C3AED]/50
- No box shadow on inputs

Country/State row (grid grid-cols-2 gap-4 mb-6):
  - Country select dropdown: same base input style — show dropdown chevron right-aligned inside field
  - State/Province input

STRIPE PAYMENT ELEMENT SLOT:
- Section label: "Card Details" — 12px font-semibold text-white/30 uppercase tracking-wider mb-4
- Container: bg-[#0A0E14] rounded-2xl border border-white/10 p-5 mb-6
  - {/* Stripe <PaymentElement /> mounts here */}
  - id="stripe-payment-element"
  - Placeholder (shown before Stripe loads — animate-pulse):
    - Card number row: flex items-center gap-3 mb-4
      - Credit card SVG 20x20 text-white/20
      - A shimmer bar: flex-1 h-5 rounded-full bg-white/8 animate-pulse
      - Three small shimmer squares: w-8 h-5 rounded-md bg-white/8 animate-pulse (visa/mc/amex placeholders)
    - Expiry + CVC row: grid grid-cols-2 gap-4
      - Each: h-10 rounded-xl bg-white/8 animate-pulse
  - Loading indicator below: "Loading secure payment form..." — 12px text-white/30 text-center mt-3 (hide when loaded)

STRIPE APPEARANCE CONFIG (include as a code comment below the slot — NOT Magic Patterns output):
```typescript
// Stripe Elements appearance — dark theme to match Clara Code
const stripeAppearance = {
  theme: 'night' as const,
  variables: {
    colorPrimary: '#7C3AED',
    colorBackground: '#070A0F',
    colorText: '#ffffff',
    colorTextSecondary: 'rgba(255,255,255,0.55)',
    colorDanger: '#EF4444',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '12px',
    spacingUnit: '4px',
  },
  rules: {
    '.Input': {
      border: '1px solid rgba(255,255,255,0.12)',
      backgroundColor: '#070A0F',
    },
    '.Input:focus': {
      border: '1px solid rgba(124,58,237,0.5)',
      boxShadow: '0 0 0 2px rgba(124,58,237,0.25)',
    },
    '.Label': {
      color: 'rgba(255,255,255,0.7)',
      fontSize: '14px',
      fontWeight: '500',
    },
  },
}
```

PROMO CODE ROW (below payment element, mb-6):
- flex items-center gap-3
- "Have a promo code?" — 13px text-white/40 flex-shrink-0
- Input: flex-1 h-9 bg-[#070A0F] border border-white/10 rounded-xl px-3 text-sm text-white placeholder:text-white/25 placeholder:"Enter code"
- Apply button: h-9 px-4 rounded-xl bg-white/6 border border-white/10 text-sm font-medium text-white/70 hover:bg-white/10

SUBMIT BUTTON:
- w-full h-12 rounded-2xl bg-[#7C3AED] text-white font-semibold text-base
- shadow-[0_0_40px_rgba(124,58,237,0.4)]
- hover:bg-[#6D28D9] transition-colors
- flex items-center justify-center gap-2
- Left: lock SVG 16px white
- Text: "Start Free Trial — No charge today"
- Below button (mt-3): flex items-center justify-center gap-4 text-xs text-white/30
  - "Cancel anytime" with x-circle SVG 12px
  - vertical pipe |
  - "14-day free trial"
  - vertical pipe |
  - "Instant access"

ERROR STATE (shown below submit button when payment fails):
- mt-4 bg-[#EF4444]/10 border border-[#EF4444]/25 rounded-xl p-4 flex items-start gap-3
- Alert triangle SVG 16px text-[#EF4444] mt-0.5 flex-shrink-0
- Error message: "Your card was declined. Please check your details or try a different payment method." — 13px text-[#EF4444]/80

LOADING STATE (during submission — button transforms):
- Button: bg-[#6D28D9]/70 cursor-not-allowed
- Content: animated spinner (w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin) + "Processing..."

FONT: Inter for all UI, JetBrains Mono for any code/key values
RESPONSIVE:
- Below lg: stack columns (left plan summary goes ABOVE the payment form, full width)
- Below md: simplify step indicator to just "Step 2 of 3"
```