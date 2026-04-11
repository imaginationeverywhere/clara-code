# Prompt 06 — Clara Code Web UI: Code Review Resolution
**Branch:** `feat/web-complete`
**Surface:** `packages/web-ui/`
**Review source:** `docs/review/20260411-011808-web-ui-code-review.md`
**Authored:** 2026-04-11

---

## Context

You are completing a Clara Code Next.js web-ui (Cloudflare Pages, App Router, edge runtime). A prior agent built the initial implementation. A code review was run and produced a list of issues that must be resolved before this branch merges. This prompt is self-contained — you do not need to read the review document. Every issue is described below with the exact fix required.

**Your job:**
1. Create branch `feat/web-complete` from `develop`
2. Fix all issues in the order listed (CRITICALs first, then HIGHs, MEDIUMs, LOWs)
3. Write tests — zero test files currently exist; you must reach ≥80% coverage on the 7 critical files
4. Push and open a draft PR

Do not refactor anything not listed. Do not add features. Fix what is listed. Write the tests. Ship.

---

## Repository layout (relevant files only)

```
packages/web-ui/
  src/
    app/
      layout.tsx
      dashboard/
        page.tsx
      api-keys/
        page.tsx
      api/
        voice/
          greet/
            route.ts
    components/
      providers/
        ApolloProvider.tsx
        ReduxProvider.tsx
        ClerkTokenSync.tsx
      sections/
        Hero.tsx
      dashboard/
        PostOAuthVoice.tsx
        DashboardOverview.tsx
        DashboardNav.tsx
        ApiKeyCard.tsx
        CreateKeyModal.tsx
    lib/
      apollo/
        client.ts
        operations.ts
      store/
        index.ts
        authSlice.ts
        uiSlice.ts
    middleware.ts
```

---

## CRITICAL fixes

### CRITICAL-1 — Remove `window.__clerk_token` (XSS attack surface)

**Problem:** `ClerkTokenSync.tsx` writes the Clerk JWT to `window.__clerk_token`. `apollo/client.ts` reads it back. Any injected script on the page can steal the bearer token. This is a textbook XSS escalation path.

**Fix — `packages/web-ui/src/lib/apollo/client.ts`:**

Replace the module-level singleton that reads `window.__clerk_token` with a factory that accepts a `getToken` function and uses it directly in the auth link. The factory is called once from `ApolloProvider.tsx`; the result is stored in a module-level `let client` variable so the singleton still only creates one instance per browser session.

```typescript
// packages/web-ui/src/lib/apollo/client.ts
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

const GRAPHQL_URI =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ?? 'http://localhost:3031/graphql'

let _client: ApolloClient<unknown> | null = null

export function getApolloClient(
  getToken: () => Promise<string | null>,
): ApolloClient<unknown> {
  if (_client) return _client

  const httpLink = createHttpLink({ uri: GRAPHQL_URI })

  const authLink = setContext(async (_, { headers }) => {
    const token = await getToken()
    return {
      headers: {
        ...headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  })

  _client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: { fetchPolicy: 'cache-and-network' },
    },
  })

  return _client
}

// Reset between test runs
export function _resetApolloClient() {
  _client = null
}
```

**Fix — `packages/web-ui/src/components/providers/ApolloProvider.tsx`:**

Use `useAuth().getToken` from Clerk to pass a live token getter into the factory. The `getToken` call happens inside `setContext` (async, per-request) — never stored on `window`.

```typescript
'use client'

import { ApolloProvider as ApolloProviderBase } from '@apollo/client/react'
import { useAuth } from '@clerk/nextjs'
import { useMemo } from 'react'
import { getApolloClient } from '@/lib/apollo/client'

export function ApolloProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth()

  const client = useMemo(
    () => getApolloClient(() => getToken()),
    // getToken identity is stable per Clerk session
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  return <ApolloProviderBase client={client}>{children}</ApolloProviderBase>
}
```

**Fix — `packages/web-ui/src/components/providers/ClerkTokenSync.tsx`:**

Delete this file entirely. It exists only to write `window.__clerk_token`. With the factory pattern in place it has no purpose.

Remove the import from `layout.tsx`:
```diff
- import { ClerkTokenSync } from '@/components/providers/ClerkTokenSync'
```
Remove `<ClerkTokenSync />` from the JSX in `layout.tsx`.

**Fix — remove global type declaration (if it exists):**

If `src/types/global.d.ts` or any file declares `declare global { interface Window { __clerk_token?: string } }`, delete that declaration.

---

### CRITICAL-2 — VRD scripts must not live in the frontend

**Problem:** `src/app/api/voice/greet/route.ts` contains the full inline VRD-001 script map. Per the Voice Requirements Document (VRD-001), ALL Clara scripts are owned by the backend Clara scripts engine (`backend/src/features/ai/clara/scripts/clara-code-surface-scripts.ts`). The frontend is never allowed to be the source of truth for Clara's voice.

**Fix for now (bridge pattern):** Add a tracking comment and TODO to the route so every future reader knows this is temporary. Do NOT move the scripts yet — the backend scripts engine is built in a separate prompt (05). The fix here is purely documentation and a guard.

At the top of `route.ts`, directly above the `const scripts` declaration, add:

```typescript
// VRD-VIOLATION-TRACKING: scripts defined here are TEMPORARY.
// They must be removed once backend/src/features/ai/clara/scripts/
// clara-code-surface-scripts.ts ships (Prompt 05 / feat/backend-scripts-complete).
// When that backend route is live, replace the inline scripts object with:
//   const scriptText = await fetchScriptFromBackend({ trigger, partnerType, userName })
// Reference: docs/review/20260411-011808-web-ui-code-review.md CRITICAL-2
// DO NOT add new scripts here. All additions go to the backend engine.
```

---

## HIGH fixes

### HIGH-1 — `isFreshSession` uses wrong timestamp

**Problem:** `dashboard/page.tsx` computes `isFreshSession` from `user.createdAt` (account creation time). This fires the post-OAuth greeting on EVERY login from a brand-new account, not just the session where OAuth just completed.

**Fix — `packages/web-ui/src/app/dashboard/page.tsx`:**

Use `auth()` from `@clerk/nextjs/server` to get `sessionClaims.iat` (Unix seconds, session issuance time), not `currentUser().createdAt`.

```typescript
import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { DashboardOverview } from '@/components/dashboard/DashboardOverview'
import { PostOAuthVoice } from '@/components/dashboard/PostOAuthVoice'
import { DashboardNav } from '@/components/dashboard/DashboardNav'

export const runtime = 'edge'

export default async function DashboardPage() {
  const { sessionClaims } = await auth()
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  const primary = user.emailAddresses[0]?.emailAddress ?? 'there'
  const displayName = user.firstName ?? primary

  // sessionClaims.iat is Unix seconds — session issuance time, not account creation time
  const sessionIatMs = (sessionClaims?.iat ?? 0) * 1000
  const isFreshSession = Date.now() - sessionIatMs < 60_000

  const gh = user.externalAccounts?.find((a) => String(a.provider).includes('github'))
  const githubUsername = gh?.username ?? null

  return (
    <main className="min-h-screen bg-[#09090F] p-8">
      <PostOAuthVoice isFreshSession={isFreshSession} githubUsername={githubUsername} />
      <DashboardNav />
      <div className="mx-auto max-w-4xl">
        <DashboardOverview displayName={displayName} />
      </div>
    </main>
  )
}
```

---

### HIGH-2 — `clearUser` does not reset `isHydrated`

**Problem:** `authSlice.ts` has a `clearUser` reducer that resets user fields but leaves `isHydrated: true`. Components that gate on `isHydrated` will skip hydration state on logout and may show stale data.

**Fix — `packages/web-ui/src/lib/store/authSlice.ts`:**

In the `clearUser` reducer, add `state.isHydrated = false`:

```typescript
clearUser: (state) => {
  state.userId = null
  state.email = null
  state.displayName = null
  state.isHydrated = false   // ← add this line
},
```

---

### HIGH-3 — Apollo client is a module-level singleton (already fixed by CRITICAL-1)

The factory pattern introduced in CRITICAL-1 (`let _client` + `getApolloClient(getToken)`) resolves this. The singleton is now created lazily on first call from `ApolloProvider`, not at module evaluation time. No additional change needed.

---

### HIGH-4 — Path A/B buttons not disabled while voice is playing

**Problem:** In `Hero.tsx`, the `isPlaying` guard is applied to the "Hear Clara" button but NOT to the "I have an idea" / "I'm a developer" path-selection buttons. A user can click a path button mid-playback, triggering a state change and overlapping audio.

**Fix — `packages/web-ui/src/components/sections/Hero.tsx`:**

Find the two path buttons (currently rendered after the `isPlaying` check). Add `disabled={isPlaying}` to both and add matching disabled styles:

```tsx
<button
  type="button"
  disabled={isPlaying}
  onClick={() => handlePathSelect('vibe-coder')}
  className="... disabled:opacity-40 disabled:cursor-not-allowed"
>
  I have an idea
</button>

<button
  type="button"
  disabled={isPlaying}
  onClick={() => handlePathSelect('developer')}
  className="... disabled:opacity-40 disabled:cursor-not-allowed"
>
  I'm a developer
</button>
```

---

## MEDIUM fixes

### MEDIUM-1 — Email validation regex too permissive

**Problem:** The email regex used in the sign-up or API-key creation flow matches strings like `a@b` (no TLD) and passes empty strings through.

**Fix:** Replace with RFC 5321-compliant regex in all places email is validated client-side:

```typescript
// Use this constant in all components that validate email
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
```

Search for all occurrences of email validation logic (`/@/`, `includes('@')`, any existing regex) and replace with `EMAIL_REGEX.test(value)`.

---

### MEDIUM-2 — `clara_visited` cookie missing `Secure` flag

**Problem:** The `clara_visited` cookie is set via `document.cookie` without the `Secure` attribute. On production (HTTPS), this is harmless but non-compliant; on any HTTP context it exposes the cookie.

**Fix — `packages/web-ui/src/components/sections/Hero.tsx`:**

In the cookie setter, add `; Secure; SameSite=Lax`:

```typescript
document.cookie = 'clara_visited=1; max-age=31536000; path=/; Secure; SameSite=Lax'
```

---

### MEDIUM-3 — Remove `console.log` statements

**Problem:** Multiple `console.log` calls remain in production code paths (`Hero.tsx`, `PostOAuthVoice.tsx`, `apollo/client.ts`).

**Fix:** Remove all `console.log` statements. Keep `console.error` in catch blocks where there is no other error reporting mechanism. This is the full list to remove (search and delete):
- `console.log('Clara greet response:', ...)` — Hero.tsx
- `console.log('Playing audio...')` — Hero.tsx
- `console.log('PostOAuth trigger firing')` — PostOAuthVoice.tsx
- Any `console.log` in `apollo/client.ts` from debugging

---

### MEDIUM-4 — Add `global.d.ts` for environment variable types

**Problem:** `process.env.NEXT_PUBLIC_*` accesses are untyped. TypeScript infers them as `string | undefined` but components cast them directly without checks.

**Fix:** Create `packages/web-ui/src/types/env.d.ts`:

```typescript
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_GRAPHQL_URL?: string
    NEXT_PUBLIC_SITE_URL?: string
    NEXT_PUBLIC_CLARA_VOICE_ENABLED?: string
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string
    CLERK_SECRET_KEY: string
  }
}
```

No `Window.__clerk_token` declaration — that is removed by CRITICAL-1.

---

### MEDIUM-5 — `PlanType` defined in multiple places

**Problem:** The plan tier type (`'free' | 'pro' | 'enterprise'`) is duplicated across `authSlice.ts`, `DashboardOverview.tsx`, and possibly `ApiKeyCard.tsx`.

**Fix:** Create a single source of truth at `packages/web-ui/src/lib/types.ts`:

```typescript
export type PlanType = 'free' | 'pro' | 'enterprise'

export type UserPlan = {
  type: PlanType
  keysAllowed: number
  label: string
}

export const PLAN_LIMITS: Record<PlanType, UserPlan> = {
  free:       { type: 'free',       keysAllowed: 1,   label: 'Free' },
  pro:        { type: 'pro',        keysAllowed: 5,   label: 'Pro' },
  enterprise: { type: 'enterprise', keysAllowed: 100, label: 'Enterprise' },
}
```

Update all files that defined the type locally to import from `@/lib/types`. Delete the local definitions.

---

### MEDIUM-6 — `/api-keys` has no server-side auth guard

**Problem:** `src/app/api-keys/page.tsx` is a client component that relies on Apollo query failure to signal unauthenticated state. A user without a Clerk session can load the page shell; if the GraphQL backend is down, they see an empty key list rather than being redirected.

**Fix:** Create a server-side layout guard for the API keys route:

Create `packages/web-ui/src/app/api-keys/layout.tsx`:

```typescript
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export const runtime = 'edge'

export default async function ApiKeysLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  return <>{children}</>
}
```

This is the same pattern as `dashboard/page.tsx`. No changes to `api-keys/page.tsx` itself.

---

## LOW fixes

### LOW-1 — Remove unused imports

**Fix:** Run `npx tsc --noEmit` and address all "is declared but its value is never read" warnings in `web-ui/src/`. Do not suppress with `_` prefix — delete unused imports outright.

---

### LOW-2 — `PostOAuthVoice` silences all audio errors

**Problem:** The catch block in `PostOAuthVoice.tsx` is `catch {}` — completely empty. If audio fails for a real reason (network, CORS), there is no signal.

**Fix — `packages/web-ui/src/components/dashboard/PostOAuthVoice.tsx`:**

```typescript
} catch (err) {
  // Audio playback failed — non-critical, user experience continues
  if (process.env.NODE_ENV === 'development') {
    console.error('[PostOAuthVoice] audio error:', err)
  }
}
```

---

### LOW-3 — Missing `aria-label` on icon-only buttons

**Problem:** The mic toggle button and any icon-only buttons in `Hero.tsx` and `VoiceBar.tsx` have no `aria-label`. Screen readers announce them as "button".

**Fix:** Add descriptive `aria-label` to every button that contains only an icon (SVG or emoji) with no visible text:

```tsx
<button
  type="button"
  aria-label={isListening ? 'Stop listening' : 'Start voice input'}
  onClick={toggleMic}
  ...
>
  <MicIcon />
</button>
```

Audit all icon-only buttons across `Hero.tsx`, `VoiceBar.tsx`, `ApiKeyCard.tsx` (revoke button), `CreateKeyModal.tsx` (close button).

---

## Tests — Vitest + React Testing Library + MSW

**Install (run once):**

```bash
cd packages/web-ui
npm install --save-dev vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event msw @testing-library/jest-dom
```

**Create `packages/web-ui/vitest.config.ts`:**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: { lines: 80, branches: 80, functions: 80, statements: 80 },
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/test/**', 'src/**/*.d.ts', 'src/app/api/**'],
    },
  },
  resolve: {
    alias: { '@': resolve(__dirname, './src') },
  },
})
```

**Create `packages/web-ui/src/test/setup.ts`:**

```typescript
import '@testing-library/jest-dom'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})
```

**Add to `packages/web-ui/package.json` scripts:**

```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

---

### Test file 1 — `src/lib/apollo/client.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getApolloClient, _resetApolloClient } from '@/lib/apollo/client'

describe('getApolloClient', () => {
  beforeEach(() => { _resetApolloClient() })

  it('returns an ApolloClient instance', () => {
    const client = getApolloClient(async () => null)
    expect(client).toBeDefined()
    expect(typeof client.query).toBe('function')
  })

  it('returns the same instance on repeated calls (singleton)', () => {
    const a = getApolloClient(async () => null)
    const b = getApolloClient(async () => null)
    expect(a).toBe(b)
  })

  it('after reset, creates a new instance', () => {
    const a = getApolloClient(async () => null)
    _resetApolloClient()
    const b = getApolloClient(async () => null)
    expect(a).not.toBe(b)
  })

  it('does not read from window', () => {
    const windowSpy = vi.spyOn(window, 'window', 'get')
    getApolloClient(async () => 'test-token')
    // getToken callback is called lazily in setContext, not at construction
    expect(windowSpy).not.toHaveBeenCalled()
    windowSpy.mockRestore()
  })
})
```

---

### Test file 2 — `src/lib/store/authSlice.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import authReducer, { setUser, clearUser } from '@/lib/store/authSlice'

const initial = authReducer(undefined, { type: '@@INIT' })

describe('authSlice', () => {
  it('has correct initial state', () => {
    expect(initial.userId).toBeNull()
    expect(initial.isHydrated).toBe(false)
  })

  it('setUser populates state and sets isHydrated true', () => {
    const next = authReducer(initial, setUser({
      userId: 'u_123',
      email: 'clara@example.com',
      displayName: 'Clara',
      plan: 'pro',
    }))
    expect(next.userId).toBe('u_123')
    expect(next.isHydrated).toBe(true)
  })

  it('clearUser resets all fields including isHydrated', () => {
    const withUser = authReducer(initial, setUser({
      userId: 'u_123',
      email: 'clara@example.com',
      displayName: 'Clara',
      plan: 'free',
    }))
    const cleared = authReducer(withUser, clearUser())
    expect(cleared.userId).toBeNull()
    expect(cleared.email).toBeNull()
    expect(cleared.displayName).toBeNull()
    expect(cleared.isHydrated).toBe(false)   // ← regression test for HIGH-2 fix
  })
})
```

---

### Test file 3 — `src/lib/types.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { PLAN_LIMITS } from '@/lib/types'

describe('PLAN_LIMITS', () => {
  it('free plan allows 1 key', () => {
    expect(PLAN_LIMITS.free.keysAllowed).toBe(1)
  })

  it('pro plan allows 5 keys', () => {
    expect(PLAN_LIMITS.pro.keysAllowed).toBe(5)
  })

  it('enterprise plan allows 100 keys', () => {
    expect(PLAN_LIMITS.enterprise.keysAllowed).toBe(100)
  })

  it('all plans have a label', () => {
    for (const plan of Object.values(PLAN_LIMITS)) {
      expect(plan.label).toBeTruthy()
    }
  })
})
```

---

### Test file 4 — `src/components/sections/Hero.test.tsx`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Minimal mocks
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({ user: null, isLoaded: true }),
}))

// Mock fetch for greet endpoint
const mockFetch = vi.fn()
global.fetch = mockFetch

import { Hero } from '@/components/sections/Hero'

describe('Hero', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ text: "I'm Clara.", audioUrl: null }),
    })
    // Reset cookie
    Object.defineProperty(document, 'cookie', { value: '', writable: true })
  })

  it('renders the Hear Clara button', () => {
    render(<Hero />)
    expect(screen.getByRole('button', { name: /hear clara/i })).toBeInTheDocument()
  })

  it('path buttons are present', () => {
    render(<Hero />)
    expect(screen.getByRole('button', { name: /idea/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /developer/i })).toBeInTheDocument()
  })

  it('path buttons have aria-label when icon-only', () => {
    render(<Hero />)
    // All buttons must have accessible names
    const buttons = screen.getAllByRole('button')
    for (const btn of buttons) {
      expect(btn).toHaveAccessibleName()
    }
  })

  it('Hear Clara button disabled while playing', async () => {
    // Simulate playing state by clicking and checking disabled during async op
    render(<Hero />)
    const hearBtn = screen.getByRole('button', { name: /hear clara/i })
    fireEvent.click(hearBtn)
    // Button should be disabled immediately after click starts audio
    await waitFor(() => {
      expect(hearBtn).toBeDisabled()
    })
  })
})
```

---

### Test file 5 — `src/app/api/voice/greet/route.test.ts`

```typescript
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/voice/greet/route'
import { NextRequest } from 'next/server'

const mockFetch = vi.fn()
global.fetch = mockFetch

function makeReq(body: object) {
  return new NextRequest('http://localhost/api/voice/greet', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  })
}

describe('POST /api/voice/greet', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ audio_url: 'https://modal.run/audio/abc.mp3' }),
    })
  })

  it('returns text and audioUrl on success', async () => {
    const res = await POST(makeReq({ trigger: 'first-visit' }))
    const data = await res.json()
    expect(data.text).toBeTruthy()
    expect(data.audioUrl).toBe('https://modal.run/audio/abc.mp3')
  })

  it('falls back gracefully when Hermes is down', async () => {
    mockFetch.mockResolvedValue({ ok: false })
    const res = await POST(makeReq({ trigger: 'first-visit' }))
    const data = await res.json()
    expect(data.fallback).toBe(true)
    expect(data.text).toBeTruthy()
    expect(data.audioUrl).toBeNull()
  })

  it('returns 500 on fetch throw', async () => {
    mockFetch.mockRejectedValue(new Error('network'))
    const res = await POST(makeReq({ trigger: 'first-visit' }))
    expect(res.status).toBe(500)
  })

  it('vibe-coder trigger selects correct script', async () => {
    const res = await POST(makeReq({ trigger: 'first-visit', partnerType: 'vibe-coder' }))
    const data = await res.json()
    // Vibe-coder script starts with "Good."
    expect(data.text).toMatch(/^Good\./)
  })

  it('developer trigger selects correct script', async () => {
    const res = await POST(makeReq({ trigger: 'first-visit', partnerType: 'developer' }))
    const data = await res.json()
    expect(data.text).toMatch(/^Good\./)
  })

  it('post-oauth trigger includes GitHub message', async () => {
    const res = await POST(makeReq({ trigger: 'post-oauth' }))
    const data = await res.json()
    expect(data.text).toMatch(/GitHub/i)
  })
})
```

---

### Test file 6 — `src/components/dashboard/PostOAuthVoice.test.tsx`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))

const mockFetch = vi.fn()
global.fetch = mockFetch

import { PostOAuthVoice } from '@/components/dashboard/PostOAuthVoice'

describe('PostOAuthVoice', () => {
  beforeEach(() => {
    sessionStorage.clear()
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ text: "You're in.", audioUrl: null }),
    })
  })

  it('fires greet fetch when isFreshSession is true', async () => {
    render(<PostOAuthVoice isFreshSession={true} githubUsername="amenray2k" />)
    await vi.waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/voice/greet',
        expect.objectContaining({ method: 'POST' }),
      )
    })
  })

  it('does not fire fetch when isFreshSession is false', async () => {
    render(<PostOAuthVoice isFreshSession={false} githubUsername={null} />)
    await new Promise((r) => setTimeout(r, 100))
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('does not fire fetch twice (sessionStorage guard)', async () => {
    sessionStorage.setItem('clara_post_oauth_played', '1')
    render(<PostOAuthVoice isFreshSession={true} githubUsername="amenray2k" />)
    await new Promise((r) => setTimeout(r, 100))
    expect(mockFetch).not.toHaveBeenCalled()
  })
})
```

---

### Test file 7 — `src/components/dashboard/ApiKeyCard.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ApiKeyCard } from '@/components/dashboard/ApiKeyCard'

const mockKey = {
  id: 'key_001',
  name: 'My Test Key',
  prefix: 'cc_live_abc',
  createdAt: '2026-04-01T00:00:00Z',
  lastUsed: null,
  revoked: false,
}

describe('ApiKeyCard', () => {
  it('renders the key name', () => {
    render(<ApiKeyCard apiKey={mockKey} onRevoke={vi.fn()} onCopyPrefix={vi.fn()} />)
    expect(screen.getByText('My Test Key')).toBeInTheDocument()
  })

  it('renders the key prefix', () => {
    render(<ApiKeyCard apiKey={mockKey} onRevoke={vi.fn()} onCopyPrefix={vi.fn()} />)
    expect(screen.getByText(/cc_live_abc/)).toBeInTheDocument()
  })

  it('calls onCopyPrefix when copy button clicked', () => {
    const onCopy = vi.fn()
    render(<ApiKeyCard apiKey={mockKey} onRevoke={vi.fn()} onCopyPrefix={onCopy} />)
    fireEvent.click(screen.getByRole('button', { name: /copy/i }))
    expect(onCopy).toHaveBeenCalledWith('cc_live_abc')
  })

  it('calls onRevoke when revoke button clicked', () => {
    const onRevoke = vi.fn()
    render(<ApiKeyCard apiKey={mockKey} onRevoke={onRevoke} onCopyPrefix={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /revoke/i }))
    expect(onRevoke).toHaveBeenCalledWith('key_001')
  })

  it('revoke button has aria-label (accessibility)', () => {
    render(<ApiKeyCard apiKey={mockKey} onRevoke={vi.fn()} onCopyPrefix={vi.fn()} />)
    const revokeBtn = screen.getByRole('button', { name: /revoke/i })
    expect(revokeBtn).toHaveAccessibleName()
  })
})
```

---

## Git workflow

```bash
# From repo root
git checkout develop
git pull origin develop
git checkout -b feat/web-complete

# After all fixes and tests pass:
cd packages/web-ui
npm run test:coverage
# Must show ≥80% across all 7 critical files

git add packages/web-ui/
git commit -m "fix(web-ui): resolve all code review findings — CRITICAL, HIGH, MEDIUM, LOW + tests

- CRITICAL-1: remove window.__clerk_token; use setTokenProvider() factory pattern
- CRITICAL-2: add VRD tracking comment to greet route (temporary bridge)
- HIGH-1: isFreshSession now uses sessionClaims.iat not user.createdAt
- HIGH-2: clearUser resets isHydrated to false
- HIGH-3: Apollo factory replaces module-level singleton
- HIGH-4: path buttons disabled while voice is playing
- MEDIUM-1: email regex to RFC 5321-compliant pattern
- MEDIUM-2: clara_visited cookie gets Secure + SameSite=Lax
- MEDIUM-3: remove all console.log from production paths
- MEDIUM-4: add env.d.ts for typed process.env access
- MEDIUM-5: PlanType centralised to lib/types.ts
- MEDIUM-6: api-keys route gets server-side auth layout guard
- LOW-1: remove unused imports
- LOW-2: PostOAuthVoice audio error logs in dev mode
- LOW-3: aria-label on all icon-only buttons
- TESTS: Vitest + RTL + MSW — 7 test files covering all critical paths"

git push -u origin feat/web-complete
gh pr create \
  --title "fix(web-ui): resolve all code review findings + tests" \
  --body "Closes all issues from docs/review/20260411-011808-web-ui-code-review.md.

## Changes
- Removes XSS attack surface (window.__clerk_token replaced by setTokenProvider)
- Fixes fresh-session detection (sessionClaims.iat not user.createdAt)
- Fixes clearUser missing isHydrated reset
- Disables path buttons during voice playback (race condition fix)
- Centralises PlanType, adds env types, cookie security flags
- Adds server-side auth guard for /api-keys route
- Writes 7 Vitest test files (≥80% coverage)
- All console.log removed from production paths
- Accessibility: aria-label on all icon-only buttons

## Test coverage
Run: \`cd packages/web-ui && npm run test:coverage\`

🤖 Generated from Prompt 06 — Clara Code Web UI Review Resolution" \
  --draft \
  --base develop
```

---

## Verification checklist

Before marking this PR ready for review, confirm each item:

- [ ] `cd packages/web-ui && npx tsc --noEmit` — zero errors
- [ ] `npm run test:coverage` — all 7 test files green, ≥80% coverage reported
- [ ] `grep -r "window.__clerk_token" src/` — returns no matches
- [ ] `grep -r "console.log" src/` — returns no matches
- [ ] `curl -X POST http://localhost:3032/api/voice/greet -H 'Content-Type: application/json' -d '{"trigger":"first-visit"}' | jq .` — returns `{ text, audioUrl }`
- [ ] Dashboard page loads, no 500 errors in dev console
- [ ] Sign out → `/api-keys` → redirected to `/sign-in` (auth guard working)
- [ ] Hero page: click "I have an idea" while Clara is speaking → button is unresponsive (disabled)
- [ ] Hero page: "Hear Clara" button aria-label is present in DevTools
