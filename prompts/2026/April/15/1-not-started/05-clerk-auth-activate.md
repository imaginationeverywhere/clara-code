# Prompt 05 — Activate Clerk Auth Middleware (BLK-02)

**Date**: 2026-04-14
**Branch**: `prompt/2026-04-14/05-clerk-auth-activate`
**Flags**: `--clerk --security --testing`
**Estimated scope**: 4–6 files

---

## Context

Clara Code's Clerk middleware is intentionally disabled in `frontend/src/middleware.ts` because `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are not yet set in the CF Pages environment. Without keys, `clerkMiddleware()` throws at startup and causes 500 on every route.

**Mo will add the Clerk env vars to CF Pages.** When he does, the next CF Pages build must automatically enable Clerk protection — no second code deploy required.

Your job: implement a **build-time conditional** so that:
- When `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is present at build time → Clerk middleware activates, `/dashboard` and `/account` are protected
- When it's absent → graceful passthrough (current behavior, no crash)

The sign-in / sign-up pages and Clerk appearance config are already correct from a prior sprint. You are only fixing the middleware gate and adding route protection.

---

## What Exists

```
frontend/src/middleware.ts          ← current passthrough; replace this
frontend/src/app/sign-in/           ← already correct, do NOT change
frontend/src/app/sign-up/           ← already correct, do NOT change
frontend/src/app/dashboard/         ← must be protected (redirect to /sign-in if not authed)
frontend/src/app/account/           ← must be protected
frontend/src/app/api/account/delete/route.ts  ← already has auth() guard, do NOT change
```

---

## Task 1 — Update `frontend/src/middleware.ts`

Replace the entire file with:

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
	"/dashboard(.*)",
	"/account(.*)",
]);

// NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is baked into the CF Pages build at build time.
// When Mo adds the key to CF Pages env vars and CF re-builds, CLERK_ENABLED becomes true.
// This guard prevents a startup crash when keys are absent (e.g., local dev without .env.local).
const CLERK_ENABLED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default CLERK_ENABLED
	? clerkMiddleware(async (auth, req) => {
			if (isProtectedRoute(req)) {
				await auth.protect();
			}
	  })
	: function passthrough(_req: NextRequest) {
			return NextResponse.next();
	  };

export const config = {
	matcher: [
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		"/(api|trpc)(.*)",
	],
};
```

**Why build-time conditional works:** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is a `NEXT_PUBLIC_*` env var — Next.js inlines it into the bundle at build time. When CF Pages rebuilds after Mo sets the var, `CLERK_ENABLED` is `true` in the deployed bundle. No second code push needed.

---

## Task 2 — Add CF Setup Instructions to `docs/auto-claude/MVP_BLOCKERS.md`

Find the BLK-02 section and add the following detail at the end of the resolution steps:

```
5. Trigger a CF Pages re-deploy (any push to develop branch will do it — the Clerk keys bake into the build)
6. After deploy: test sign-in at https://develop.claracode.ai/sign-in
```

---

## Task 3 — Add env var documentation to `frontend/.env.example`

If `frontend/.env.example` does not exist, create it. If it exists, add the Clerk block if not already present:

```bash
# Clerk Authentication
# Add these to CF Pages → Settings → Environment Variables (encrypted)
# Without them, middleware is a passthrough and /dashboard is unprotected.
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

---

## Task 4 — Add Tests

Add `frontend/src/__tests__/middleware.test.ts`:

Test cases:
1. When `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set → exported middleware is a function (not undefined, not passthrough)
2. When `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is absent → exported middleware passes through (returns `NextResponse.next()`)
3. Protected route paths match `/dashboard`, `/dashboard/anything`, `/account`, `/account/billing`
4. Public route paths do NOT match `/`, `/pricing`, `/sign-in`, `/sign-up`

Use Jest + `next/server` mock. Keep the tests minimal — they verify routing logic, not Clerk itself.

---

## Acceptance Criteria

- [ ] `frontend/src/middleware.ts` uses `clerkMiddleware` when key is present, passthrough when absent
- [ ] No `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` reference in any other file (no duplication)
- [ ] `/dashboard` and `/account` are in the protected route matcher
- [ ] `/`, `/pricing`, `/sign-in`, `/sign-up`, `/docs` are NOT in the protected route matcher
- [ ] `frontend/.env.example` documents all 6 required Clerk env vars
- [ ] Tests pass: `cd frontend && npm test middleware`
- [ ] `cd frontend && npm run type-check` passes
- [ ] Biome/lint passes

## What NOT to Change

- `frontend/src/app/sign-in/` — already correct
- `frontend/src/app/sign-up/` — already correct
- `frontend/src/app/api/account/delete/route.ts` — already has `auth()` guard
- `frontend/src/app/dashboard/page.tsx` — already has `currentUser()` + `redirect('/sign-in')`
- Any backend files
