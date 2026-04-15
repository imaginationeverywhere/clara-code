# MVP Blockers — Clara Code

> **Updated**: 2026-04-14

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
5. Trigger a CF Pages re-deploy (any push to develop branch will do it — the Clerk keys bake into the build)
6. After deploy: test sign-in at https://develop.claracode.ai/sign-in
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

**Status**: ✅ RESOLVED — 2026-04-14 (PR #30)
**Impact**: ~~Dashboard shows localStorage fake data~~
**Resolution**: localStorage completely removed. `DashboardTabs.tsx` now uses Apollo `useQuery(MY_API_KEYS)`. Server component shell with `currentUser()` from Clerk. `/account` page added with `PersonalInfoSection`, `SubscriptionSection`, `DangerZone` (delete account). `DangerZone` calls `DELETE /api/account/delete` which calls `clerkClient().users.deleteUser(userId)`.
**Files changed**: `frontend/src/app/dashboard/page.tsx`, `DashboardTabs.tsx`, new `/account/page.tsx`, new `/api/account/delete/route.ts`

---

## BLK-06 — Develop 220 Commits Ahead of Main (High)

**Status**: 🚫 Active
**Impact**: All Sprint 1–3 work is on `develop` only. Production (`main`) is 220 commits behind. Nothing from the past 3 sprints is in production.
**Resolution**: Create release PR `develop → main`, review, merge. Then trigger CF Workers production deployment.
**Owner**: Carruthers
**Note**: This is the path to `claracode.ai` showing the full product vs the stale main branch

---

## BLK-07 — SDK npm Publish Needs Auth Token (Medium)

**Status**: ⚠️ Pending
**Impact**: `@claracode/sdk` cannot be published to npm without an npm auth token configured in CI/CD
**Note**: Per product strategy, `@claracode/sdk` is NOT a public npm package — it's gated behind API key + subscription. The CLI (`claracode` or `npx claracode@latest`) is the public npm artifact. SDK distribution is via authenticated download. This blocker only applies if/when we decide to publish the CLI package.
**Owner**: Miles

---

## Resolved Blockers

| Blocker | Resolved | By |
|---------|----------|----|
| BLK-01 Stripe merchant account | 2026-04-13 | Mo (SSM + Wrangler secrets) |
| BLK-05 Dashboard localStorage | 2026-04-14 | PR #30 (Apollo + server component) |
| CF Pages 500 (Turbopack/hoisting) | 2026-04-12 | Carruthers |
| CRIT-01 — billing portal URL exposure | 2026-04-12 | S2-05 |
| HIGH-01 — mobile hardcoded ngrok URL | 2026-04-12 | S2-05 |
| HIGH-02 — backend branch coverage < 80% | 2026-04-13 | Backend test suite |
| HIGH-03 — cli/dist tracked in git | 2026-04-12 | S2-05 |
| @opennextjs/cloudflare migration | 2026-04-12 | Carruthers |
| Hermes/Modal gateway URL in `package.json` | 2026-04-14 | PR #29 (context.secrets) |
| Standards gaps (desktop/profile/analytics/design) | 2026-04-14 | PRs #29–32 |
