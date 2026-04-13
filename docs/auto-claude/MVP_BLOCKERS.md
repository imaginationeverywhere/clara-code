# MVP Blockers — Clara Code

> **Updated**: 2026-04-13

---

## BLK-01 — Stripe Merchant Account (Critical)

**Status**: ✅ RESOLVED — 2026-04-13
**Impact**: ~~Blocks checkout, subscriptions, agent provisioning on purchase~~
**Resolution**: Merchant account approved. Live keys stored in SSM:
- `/clara-code/STRIPE_PUBLISHABLE_KEY` (SecureString)
- `/clara-code/STRIPE_SECRET_KEY` (SecureString)
- `/clara-code/prod/STRIPE_PUBLISHABLE_KEY` (SecureString)
- `/clara-code/prod/STRIPE_SECRET_KEY` (SecureString)
**Wrangler secrets set**: `STRIPE_SECRET_KEY` on `clara-code` (production) and `clara-code-preview`
**Next**: Build Stripe checkout — prompt queued at `prompts/2026/April/13/1-not-started/06-stripe-checkout-and-subscriptions.md`
**Note**: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` must be exported from SSM before running `npm run pages:build` — it's baked into the client bundle at build time

---

## BLK-02 — Clerk Keys Not Wired to CF Workers (Critical)

**Status**: 🚫 Active
**Impact**: Sign-in and sign-up are broken in the CF Pages staging environment. Middleware is a passthrough (`NextResponse.next()`) intentionally until keys are set.
**Resolution**:
1. Go to Cloudflare Workers & Pages → clara-code → Settings → Environment Variables
2. Add (encrypted):
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
3. Re-enable middleware in `frontend/src/middleware.ts` (replace passthrough with Clerk's `clerkMiddleware()`)
4. Add `develop.claracode.ai` to Clerk's allowed origins
**Owner**: Mo (Amen Ra)

---

## BLK-03 — Stripe Webhook Missing Svix Verification (High)

**Status**: ⚠️ Security Gap
**Impact**: Webhook handler accepts any POST — allows spoofed events in production
**File**: `backend/src/routes/webhooks.ts`
**Resolution**: Add Svix signature verification before going live:
```ts
import { Webhook } from "svix";
const wh = new Webhook(process.env.STRIPE_WEBHOOK_SECRET!);
wh.verify(rawBody, headers);
```
**Owner**: Miles
**Note**: Not blocking until Stripe is live, but must be done before merchant account activates

---

## BLK-04 — IDE / CLI / Desktop Voice Surfaces Not Dispatched (High)

**Status**: ⏳ Waiting for dispatch
**Impact**: Clara Code's core product differentiator (voice-in-your-IDE) is not yet built
**Packages ready**:
- `packages/ide-extension/` — VS Code fork sidebar + voice panel
- `packages/tui/` v0.66.1 — Ink-based terminal UI
- `packages/coding-agent/` v0.66.1 — coding agent harness
- `desktop/` — Tauri app scaffold
**Resolution**: Queue and dispatch S2-IDE, S2-CLI, S2-Desktop Cursor prompts on QCS1
**Owner**: Carruthers

---

## BLK-05 — Dashboard UI Not Connected to Backend (Medium)

**Status**: ⚠️ Mock data only
**Impact**: Dashboard shows localStorage fake data; demo would reveal this to users
**Files**:
- `frontend/src/app/dashboard/page.tsx` — uses `localStorage` for API keys
- Backend route `GET /api/keys` is fully implemented and ready
**Resolution**: Replace `localStorage` mock in dashboard with `fetch('/api/keys')` calls
**Owner**: Motley

---

## Resolved Blockers

| Blocker | Resolved | By |
|---------|----------|----|
| CF Pages 500 (Turbopack/hoisting) | 2026-04-12 | Carruthers |
| CRIT-01 — billing portal URL exposure | 2026-04-12 | S2-05 |
| HIGH-01 — mobile hardcoded ngrok URL | 2026-04-12 | S2-05 |
| HIGH-02 — backend branch coverage < 80% | 2026-04-13 | Backend test suite |
| HIGH-03 — cli/dist tracked in git | 2026-04-12 | S2-05 |
| @opennextjs/cloudflare migration | 2026-04-12 | Carruthers |
