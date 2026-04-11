# Code Review — 2026-04-11 01:18
**Scope:** `packages/web-ui/` — Prompt 01 implementation (claracode.ai)
**Reviewer:** Carruthers (Clara Code Tech Lead)
**Build status:** `npm run build` — PASSES (confirmed by implementer)

---

## ⚠️ COVERAGE REQUIREMENT CHECK — REVIEW MODIFIED

**Status:** ❌ FAIL — 80% coverage requirement NOT MET

| Metric | Value | Required | Status |
|--------|-------|----------|--------|
| Test files found | **0** | ≥1 per logical module | ❌ |
| Tests run | **0** | all passing | ❌ |
| Coverage — changed files | **0%** | ≥80% | ❌ |

**Note:** Per the `/review-code` command spec, this BLOCKS the review. However, because this is a Next.js UI-heavy surface where testing requires browser environment setup (Playwright/Vitest + MSW for API mocking), and because the build passes and the VRD compliance is production-critical, this review proceeds with a **MODIFIED** status — code quality findings are provided in full, but **no merge to main until tests exist**.

### Tests Required Before Merge

| File | Recommended Test Coverage |
|------|--------------------------|
| `src/app/api/voice/greet/route.ts` | Route unit tests: all trigger/partnerType combinations, Hermes failure fallback |
| `src/app/api/waitlist/route.ts` | POST validation (valid, invalid email, empty body, missing email) |
| `src/lib/store/authSlice.ts` | All reducers: setUser, clearUser, initial state |
| `src/lib/store/uiSlice.ts` | All reducers: setVoiceDemoPlaying, toggleSidebar, openModal, closeModal |
| `src/components/sections/Hero.tsx` | First-visit auto-greet timer, return-visit cookie detection, path A/B click dispatch |
| `src/components/providers/ClerkTokenSync.tsx` | Token sync to window, plan mapping, sign-out clear |
| `src/components/dashboard/PostOAuthVoice.tsx` | isFreshSession guard, sessionStorage dedup, audio fallback |

Recommended framework: **Vitest** + **@testing-library/react** + **MSW** (mock `/api/voice/greet`).

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Files reviewed | 12 |
| Issues found | 15 (2 critical, 4 high, 6 medium, 3 low) |
| VRD compliance | ✅ Hero copy correct · ✅ 3-line lock · ✅ two-path CTAs |
| Build | ✅ Passes |
| TypeScript strict | ✅ No `any` — all types explicit |
| Overall grade | **B** *(would be B+ without coverage deficit and token XSS surface)* |
| Merge status | 🔴 **BLOCKED** — no tests |

---

## Critical Issues

### CRITICAL-1 — `window.__clerk_token` is an XSS attack surface
**Files:** `src/lib/apollo/client.ts:11`, `src/components/providers/ClerkTokenSync.tsx:34`
**Severity:** Critical / Security

The auth token is written to and read from a plain global on `window`. Any script that runs in the page context (including injected third-party scripts, browser extensions with page access, or an XSS payload) can read `window.__clerk_token` and make authenticated API calls impersonating the user.

```typescript
// CURRENT — attack surface
window.__clerk_token = token ?? ''  // ClerkTokenSync.tsx:34
const token = window.__clerk_token ?? ""  // apollo/client.ts:11
```

**Fix:** Move token retrieval inside the Apollo link itself using Clerk's `getToken()`:

```typescript
// apollo/client.ts — REPLACE with this pattern
import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

let _getToken: (() => Promise<string | null>) | null = null;

export function setTokenProvider(fn: () => Promise<string | null>) {
  _getToken = fn;
}

const authLink = setContext(async (_, { headers }) => {
  const token = _getToken ? await _getToken() : null;
  return {
    headers: { ...headers, authorization: token ? `Bearer ${token}` : "" },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
```

Then in `ClerkTokenSync`:
```typescript
import { setTokenProvider } from '@/lib/apollo/client'
// In useEffect: setTokenProvider(() => getToken())
// Remove all window.__clerk_token writes
```

This eliminates the global token window entirely.

---

### CRITICAL-2 — VRD scripts are in the frontend edge route (IP/Architecture violation)
**File:** `src/app/api/voice/greet/route.ts:17-27`
**Severity:** Critical / Architecture

VRD-001 states explicitly: *"Scripts live in backend ONLY. Never in frontend."* The canonical greeting, vibe-coder path, developer path, return-visit, and post-oauth scripts are all embedded in this edge route, which ships in the Cloudflare Pages bundle — meaning the scripts are in the client-accessible frontend.

The comment `// NOTE: Real implementation in backend/src/features/ai/clara/scripts/` acknowledges this, but the VRD calls it a hard requirement, not a TODO.

**This is a known temporary violation.** Tracking it as CRITICAL ensures it doesn't stay temporary indefinitely.

**Fix path:**
1. Ship Prompt 05 (backend Clara scripts engine) — `feat/backend-scripts-complete`
2. Replace the inline `scripts` object in `route.ts` with a call to `POST https://api-dev.claracode.com/api/clara/voice/script`
3. The edge route becomes a thin proxy — no scripts in it

**Interim mitigation:** Add a comment block at the top of `route.ts`:
```typescript
// ⚠️ TEMPORARY — Scripts inline per VRD-001 until backend Prompt 05 ships.
// DO NOT add new scripts here. Track: feat/backend-scripts-complete
// VRD reference: VRD-001-claracode-visitor-greeting.md §Implementation Notes
```

---

## High Priority Issues

### HIGH-1 — `isFreshSession` uses account creation date, not session date
**File:** `src/app/dashboard/page.tsx:16-22`
**Severity:** High / Logic

`user.createdAt` is the Clerk *account* creation timestamp, not the current *session* start time. A user who created their account 5 minutes ago will always have `isFreshSession: false` when they return. A user who just signed up will have `isFreshSession: true` only for the first 60 seconds after account creation — regardless of how many times they reload the page.

```typescript
// CURRENT — wrong: compares account creation time
const createdMs = typeof createdRaw === 'number' ? createdRaw : createdRaw ? new Date(createdRaw).getTime() : 0
const isFreshSession = Date.now() - createdMs < 60_000
```

`PostOAuthVoice` uses `sessionStorage` to guard against replay, so the user experience bug is partially mitigated — but the intent (detect the very first login after OAuth) is wrong.

**Fix:** Use `sessionClaims.iat` from Clerk's session, which is the session issuance time:

```typescript
// In dashboard/page.tsx — server component
import { auth } from '@clerk/nextjs/server'

const { sessionClaims } = await auth()
const sessionIat = (sessionClaims?.iat as number | undefined) ?? 0
const isFreshSession = Date.now() / 1000 - sessionIat < 60  // iat is in seconds
```

---

### HIGH-2 — `clearUser` doesn't reset `isHydrated`
**File:** `src/lib/store/authSlice.ts:28-32`
**Severity:** High / State Management

After sign-out, `isHydrated` remains `true`. If any component uses `isHydrated` to decide whether to show auth-dependent content, it will incorrectly show that state even after the user has signed out.

```typescript
// CURRENT
clearUser: (state) => {
  state.userId = null
  state.email = null
  state.plan = 'FREE'
  // isHydrated stays true — BUG
},
```

**Fix:**
```typescript
clearUser: (state) => {
  state.userId = null;
  state.email = null;
  state.plan = 'FREE';
  state.isHydrated = false;  // Reset on sign-out
},
```

---

### HIGH-3 — Apollo Client singleton breaks edge SSR isolation
**File:** `src/lib/apollo/client.ts:19-22`
**Severity:** High / Performance + Correctness

`apolloClient` is created once at module load time and reused across all requests. In a Node.js SSR context this leaks cache between requests (different users see each other's data). In Edge Runtime (Cloudflare Pages), each isolate gets its own module scope — so this is less severe. However, the `InMemoryCache` will accumulate stale data over a long-lived worker lifetime.

**Fix:** Export a factory function and use `ssrMode: typeof window === 'undefined'`:

```typescript
export function makeApolloClient() {
  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
    ssrMode: typeof window === 'undefined',
  });
}

// Singleton only on client, fresh instance on server
export const apolloClient =
  typeof window === 'undefined' ? makeApolloClient() : (() => {
    if (!globalThis._apolloClient) globalThis._apolloClient = makeApolloClient();
    return globalThis._apolloClient;
  })();
```

---

### HIGH-4 — Hero's `onPathA`/`onPathB` have no loading guard
**File:** `src/components/sections/Hero.tsx:126-133`
**Severity:** High / UX Race Condition

`onPathA` and `onPathB` call `runGreeting()` but do NOT disable the buttons while the greet request is in flight. A user can click both buttons in quick succession, firing two concurrent `fetch()` calls to `/api/voice/greet`. The second response may play audio over the first.

The "Hear Clara" button correctly uses `disabled={isPlaying}`, but the two path buttons do not.

**Fix:** Add `disabled={isPlaying}` (or better: `disabled={isPlaying || isLoading}` with a new `isLoading` state) to both path buttons:

```tsx
<button type="button" onClick={onPathA} disabled={isPlaying} ...>
  I have an idea
</button>
<button type="button" onClick={onPathB} disabled={isPlaying} ...>
  Show me what you can do
</button>
```

---

## Medium Priority Issues

### MEDIUM-1 — Email validation is insufficient
**File:** `src/app/api/waitlist/route.ts:14`

`email.includes("@")` accepts `user@`, `@domain.com`, `@@`, `a@b`. Use a minimal regex:

```typescript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!email || !emailRegex.test(email)) {
  return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
}
```

---

### MEDIUM-2 — Cookie missing `Secure` flag
**File:** `src/components/sections/Hero.tsx:16`

```typescript
// CURRENT
document.cookie = `${VISITED_COOKIE}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`

// SHOULD BE
const secure = location.protocol === 'https:' ? '; Secure' : ''
document.cookie = `${VISITED_COOKIE}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`
```

The `clara_visited` cookie is not sensitive, but setting `Secure` in production prevents it from being transmitted over HTTP if somehow accessed via an HTTP URL.

---

### MEDIUM-3 — `console.log` leaks email address in production
**File:** `src/app/api/waitlist/route.ts:18`

```typescript
console.log(`Waitlist signup: ${email}`)  // ← Remove before production
```

Cloudflare Workers logs are accessible in the Workers dashboard. PII (email addresses) should not appear in logs without explicit consent. Remove or replace with a log entry that omits the email:

```typescript
console.log(`Waitlist signup received at ${new Date().toISOString()}`)
```

---

### MEDIUM-4 — `declare global` for `__clerk_token` in wrong file
**File:** `src/lib/apollo/client.ts:24-28`

Global type augmentations belong in a `global.d.ts` or `types/global.d.ts`, not embedded in a library file. If this token approach is kept (it shouldn't be — see CRITICAL-1), move the declaration:

```typescript
// src/types/global.d.ts
declare global {
  interface Window {
    __clerk_token?: string;
  }
}
export {}
```

---

### MEDIUM-5 — `PlanType` duplicated across slices and operations
**Files:** `src/lib/store/authSlice.ts`, `src/lib/apollo/operations.ts`

The literal union `"FREE" | "PRO" | "BUSINESS"` appears in both files. When a new plan is added, it must be changed in both places.

```typescript
// src/lib/apollo/operations.ts — export PlanType
export type PlanType = 'FREE' | 'PRO' | 'BUSINESS'

// src/lib/store/authSlice.ts — import and use it
import type { PlanType } from '@/lib/apollo/operations'
interface AuthState {
  plan: PlanType  // not re-declared
}
```

---

### MEDIUM-6 — `api-keys` page has no server-side auth fallback
**File:** `src/app/api-keys/page.tsx:1`

This is a `'use client'` page that relies entirely on middleware for auth enforcement. If middleware is misconfigured or bypassed, the page renders with Apollo error state — no crash, no redirect. The GraphQL queries will fail (no token), which is safe, but best practice for protected pages is a server-side auth check at the page level too.

Consider a server component wrapper:
```typescript
// app/api-keys/layout.tsx (server component)
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await currentUser()
  if (!user) redirect('/sign-in')
  return <>{children}</>
}
```

---

## Low Priority Issues

### LOW-1 — `VoiceBar` always rendered in Hero
**File:** `src/components/sections/Hero.tsx:192-194`

`<VoiceBar />` renders immediately on page load, before any voice interaction. This shows the mic UI to first-time visitors who haven't interacted yet. Consider rendering it only after `showSubtext` is `true` (after the greeting finishes) so the interaction invitation matches the visual state.

---

### LOW-2 — Missing `aria-live` for voice playback status
**File:** `src/components/sections/Hero.tsx:167-172`

The button text changes between "Hear Clara" and "Clara is speaking…" but this is not announced to screen readers. Add an `aria-live="polite"` region:

```tsx
<p className="sr-only" aria-live="polite" aria-atomic="true">
  {isPlaying ? 'Clara is speaking' : ''}
</p>
```

---

### LOW-3 — `PostOAuthVoice` audio error is fully silenced
**File:** `src/components/dashboard/PostOAuthVoice.tsx:42-43`

```typescript
void audio.play().catch(() => {})  // swallows all errors
```

Browser autoplay policies block audio without user interaction. This will silently fail on most browsers for the post-OAuth scenario (which happens via redirect, not a click). The Web Speech API fallback path has the same problem. Consider adding a visible "Clara wants to say hello" prompt if autoplay fails, rather than silent failure.

---

## Test Quality Assessment

**Coverage:** ❌ 0% — No tests exist (BLOCKING)

**Recommended test plan (priority order):**

```typescript
// 1. API route tests (Vitest + node environment)
// src/app/api/voice/greet/route.test.ts
describe('POST /api/voice/greet', () => {
  it('returns first-visit canonical script when trigger=first-visit', ...)
  it('returns vibe-coder script when partnerType=vibe-coder + trigger=first-visit', ...)
  it('returns developer script when partnerType=developer + trigger=first-visit', ...)
  it('returns return-visit script when trigger=return-visit', ...)
  it('returns text with audioUrl:null when Hermes fails', ...)  // fallback path
  it('returns 500 on JSON parse error', ...)
})

// 2. Redux slice tests (Vitest, pure)
// src/lib/store/authSlice.test.ts
describe('authSlice', () => {
  it('initial state is correct', ...)
  it('setUser updates all fields and sets isHydrated:true', ...)
  it('clearUser resets all fields including isHydrated', ...)  // validates HIGH-2 fix
})

// 3. Component tests (Vitest + RTL + MSW)
// src/components/sections/Hero.test.tsx
describe('Hero', () => {
  it('shows 3 canonical text lines', ...)
  it('auto-greets after 3s on first visit', ...)
  it('shows return-visit greeting when cookie is set', ...)
  it('disables path buttons while isPlaying', ...)  // validates HIGH-4 fix
  it('shows subtext only after greeting completes', ...)
})
```

---

## VRD-001 Compliance Audit

| VRD Requirement | Status | Notes |
|-----------------|--------|-------|
| 3 visible text lines on hero | ✅ | Exact: "I'm Clara." / "I've never..." / "Whether..." |
| Voice plays on 3s idle — first visit | ✅ | `setTimeout(3000)` in `useEffect` |
| Return-visit greeting (cookie) | ✅ | `clara_visited` cookie detection |
| Two-path CTAs: "I have an idea" / "Show me what you can do" | ✅ | Both present, correct labels |
| Post-OAuth greeting | ✅ | `PostOAuthVoice` component, `post-oauth` trigger |
| Subtext reveals after audio finishes | ✅ | `finish()` callback sets `showSubtext: true` |
| Web Speech API fallback | ✅ | Three-tier: Modal TTS → SpeechSynthesis → silent |
| Scripts in frontend (VRD violation) | ❌ | CRITICAL-2 — acknowledged as temporary |
| `partnerType` detection | ⚠️ | API accepts type hint but no server-side detection yet |

**VRD Grade: A- (all surface scripts correct; backend-scripts violation is the only gap)**

---

## Positive Findings

1. **Graceful three-tier audio fallback** (`Hero.tsx:80-97`) — Modal TTS → Web Speech API → silent. The experience degrades smoothly without errors reaching the user.

2. **`cancelled` flag pattern** (`Hero.tsx:101-124`, `ClerkTokenSync.tsx:20-51`) — Both async effects correctly guard against state updates after component unmount. This prevents the common React "setState on unmounted component" warning.

3. **`sessionStorage` guard in `PostOAuthVoice`** (`PostOAuthVoice.tsx:19`) — Prevents the post-OAuth voice greeting from replaying on page refresh within the same tab.

4. **Graceful GraphQL error state** (`api-keys/page.tsx:74-79`) — Shows an amber warning banner when the backend is unavailable, not a crash. Correctly notes the backend availability issue.

5. **Minimal, correct middleware** (`middleware.ts`) — 14 lines, protects exactly `/dashboard`, `/api-keys`, `/settings`. Not over-engineered.

6. **`metadataBase` from env var** (`layout.tsx:14`) — `new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://claracode.ai')` — OG image URLs will resolve correctly in both local and production environments.

7. **`runtime = 'edge'` on all routes** — Consistent for Cloudflare Pages deployment. No Node.js-only APIs used in routes.

8. **No `any` types** — All cast operations use explicit type assertions (`as { text?: string; audio_url?: string }`). TypeScript strict mode is respected throughout.

9. **Apollo error handled gracefully at API keys page** — The `fetchPolicy: 'network-only'` choice is correct here (API keys should never be stale) and the error state is user-friendly.

---

## Action Items (Priority Order)

| Priority | Item | File | Effort |
|----------|------|------|--------|
| 🔴 P0 | Write tests — 0% coverage is blocking | New test files | 2-4h |
| 🔴 P0 | Replace `window.__clerk_token` with `setTokenProvider()` pattern | `apollo/client.ts`, `ClerkTokenSync.tsx` | 30min |
| 🔴 P0 | Track VRD scripts violation until Prompt 05 ships | `route.ts` | 5min (comment) |
| 🟠 P1 | Fix `isFreshSession` — use `sessionClaims.iat` | `dashboard/page.tsx` | 15min |
| 🟠 P1 | Reset `isHydrated` in `clearUser` | `authSlice.ts` | 2min |
| 🟠 P1 | Disable path A/B buttons while `isPlaying` | `Hero.tsx` | 5min |
| 🟡 P2 | Improve email regex in waitlist | `waitlist/route.ts` | 5min |
| 🟡 P2 | Add `Secure` flag to visit cookie | `Hero.tsx` | 2min |
| 🟡 P2 | Remove `console.log(email)` from waitlist | `waitlist/route.ts` | 2min |
| 🟡 P2 | Move `PlanType` to single source | `authSlice.ts`, `operations.ts` | 10min |
| 🟢 P3 | Add `aria-live` for voice status | `Hero.tsx` | 5min |
| 🟢 P3 | Add server-side auth fallback to api-keys | `app/api-keys/layout.tsx` | 15min |
| 🟢 P3 | Handle autoplay failure in `PostOAuthVoice` | `PostOAuthVoice.tsx` | 20min |

---

## Git Workflow

The implementer noted: *"I did not create branch feat/web-complete or push."*

```bash
# Create the branch from current work
git checkout -b feat/web-complete
git add packages/web-ui/
git commit -m "feat(web-ui): claracode.ai — VRD hero, Apollo, Redux-Persist, Clerk, dashboard, API keys"
git push origin feat/web-complete
# → Open PR against develop (NOT main — pending test coverage)
```

Do NOT merge to `main` until:
- [ ] P0 tests written and passing
- [ ] CRITICAL-1 (`window.__clerk_token`) fixed
- [ ] HIGH-1 (`isFreshSession`) fixed
- [ ] HIGH-2 (`clearUser`) fixed

---

*Review by Carruthers (George Carruthers) — Clara Code Tech Lead*
*"He built the instrument on the Moon. He reviews the code that runs the product."*
