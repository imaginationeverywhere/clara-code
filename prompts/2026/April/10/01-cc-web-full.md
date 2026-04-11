# Prompt 01 — claracode.ai Full Web Build
**Author:** Motley + Miles (Clara Code Team)
**Task:** Build the complete claracode.ai web app — marketing site + dashboard
**Machine:** LOCAL (runs on dev machine)
**Branch:** `feat/web-complete`
**Priority:** P0 — This is the front door

---

## Mission

Build the full claracode.ai web experience in `packages/web-ui/`. This includes the
marketing site, authentication flows, user dashboard, API key management, pricing page,
and a voice proxy API. Everything in one PR.

**Live URL target:** https://claracode.ai
**Deploy target:** Cloudflare Pages (next build → `npm run pages:build`)

---

## Stack (Non-Negotiable)

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 App Router |
| Styling | Tailwind CSS v3 — dark mode, Clara blue `#3B82F6` |
| Auth | Clerk (`@clerk/nextjs`) |
| State | Redux-Persist (`@reduxjs/toolkit` + `redux-persist`) |
| Data | Apollo Client (`@apollo/client`) + GraphQL schema |
| TypeScript | Strict mode (`strict: true`) throughout |
| Runtime | Cloudflare Pages (`export const runtime = 'edge'` on all routes) |

---

## Pre-flight: Install Dependencies

```bash
cd packages/web-ui
npm install @clerk/nextjs@latest
npm install @apollo/client graphql
npm install @reduxjs/toolkit react-redux redux-persist
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react
```

---

## File Structure to Create

```
packages/web-ui/src/
├── app/
│   ├── layout.tsx                     ← UPDATE: add ClerkProvider + ReduxProvider
│   ├── page.tsx                       ← REPLACE: full landing page
│   ├── sign-in/[[...sign-in]]/page.tsx
│   ├── sign-up/[[...sign-up]]/page.tsx
│   ├── dashboard/
│   │   └── page.tsx                   ← Protected: overview
│   ├── api-keys/
│   │   └── page.tsx                   ← Protected: key management
│   ├── settings/
│   │   └── page.tsx                   ← Protected: plan + profile
│   ├── pricing/
│   │   └── page.tsx                   ← Public: pricing tiers
│   └── api/
│       ├── waitlist/route.ts          ← POST /api/waitlist
│       └── voice/greet/route.ts       ← POST /api/voice/greet → Modal TTS proxy
├── lib/
│   ├── apollo/
│   │   ├── client.ts                  ← Apollo Client factory
│   │   └── schema.graphql             ← Type definitions
│   ├── store/
│   │   ├── store.ts                   ← Redux-Persist store
│   │   ├── authSlice.ts               ← Auth state slice
│   │   └── uiSlice.ts                 ← UI state slice
│   └── utils.ts                       ← cn() helper
├── components/
│   ├── providers/
│   │   ├── ApolloProvider.tsx         ← Wraps children with Apollo
│   │   └── ReduxProvider.tsx          ← Wraps children with Redux store
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── sections/
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── PricingCards.tsx
│   │   ├── InstallCTA.tsx
│   │   └── VoiceDemo.tsx
│   ├── dashboard/
│   │   ├── ApiKeyCard.tsx
│   │   ├── CreateKeyModal.tsx
│   │   └── UsageBar.tsx
│   └── voice/
│       └── VoiceBar.tsx               ← Already exists — keep as-is
└── middleware.ts                       ← Clerk middleware
```

---

## Step 1: Middleware (Clerk Auth Gate)

**File: `packages/web-ui/src/middleware.ts`**

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtected = createRouteMatcher([
  '/dashboard(.*)',
  '/api-keys(.*)',
  '/settings(.*)',
])

export default clerkMiddleware((auth, req) => {
  if (isProtected(req)) auth().protect()
})

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
}
```

---

## Step 2: Apollo Client

**File: `packages/web-ui/src/lib/apollo/client.ts`**

```typescript
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL ?? 'http://localhost:3031/graphql',
})

const authLink = setContext((_, { headers }) => {
  if (typeof window === 'undefined') return { headers }
  const token = window.__clerk_token ?? ''
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }
})

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
})

declare global {
  interface Window { __clerk_token?: string }
}
```

**File: `packages/web-ui/src/lib/apollo/schema.graphql`**

```graphql
type User {
  id: ID!
  clerkId: String!
  email: String!
  plan: Plan!
  createdAt: String!
  agents: [Agent!]!
  apiKeys: [ApiKey!]!
}

type Agent {
  id: ID!
  name: String!
  soul: String
  userId: String!
  createdAt: String!
  lastActive: String
}

type ApiKey {
  id: ID!
  name: String!
  keyPrefix: String!
  createdAt: String!
  lastUsed: String
  isActive: Boolean!
}

enum Plan {
  FREE
  PRO
  BUSINESS
}

type Query {
  me: User
  myAgents: [Agent!]!
  myApiKeys: [ApiKey!]!
}

type Mutation {
  createApiKey(name: String!): ApiKey!
  revokeApiKey(id: ID!): Boolean!
  createAgent(name: String!, soul: String): Agent!
  joinWaitlist(email: String!): Boolean!
}
```

**File: `packages/web-ui/src/components/providers/ApolloProvider.tsx`**

```typescript
'use client'

import { ApolloProvider as ApolloProviderBase } from '@apollo/client'
import { apolloClient } from '@/lib/apollo/client'

export function ApolloProvider({ children }: { children: React.ReactNode }) {
  return <ApolloProviderBase client={apolloClient}>{children}</ApolloProviderBase>
}
```

---

## Step 3: Redux-Persist Store

**File: `packages/web-ui/src/lib/store/authSlice.ts`**

```typescript
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  userId: string | null
  email: string | null
  plan: 'FREE' | 'PRO' | 'BUSINESS'
  isHydrated: boolean
}

const initialState: AuthState = {
  userId: null,
  email: null,
  plan: 'FREE',
  isHydrated: false,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ userId: string; email: string; plan: AuthState['plan'] }>) => {
      state.userId = action.payload.userId
      state.email = action.payload.email
      state.plan = action.payload.plan
      state.isHydrated = true
    },
    clearUser: (state) => {
      state.userId = null
      state.email = null
      state.plan = 'FREE'
    },
  },
})

export const { setUser, clearUser } = authSlice.actions
export default authSlice.reducer
```

**File: `packages/web-ui/src/lib/store/uiSlice.ts`**

```typescript
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  voiceDemoPlaying: boolean
  sidebarOpen: boolean
  activeModal: string | null
}

const initialState: UIState = {
  voiceDemoPlaying: false,
  sidebarOpen: false,
  activeModal: null,
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setVoiceDemoPlaying: (state, action: PayloadAction<boolean>) => {
      state.voiceDemoPlaying = action.payload
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.activeModal = action.payload
    },
    closeModal: (state) => {
      state.activeModal = null
    },
  },
})

export const { setVoiceDemoPlaying, toggleSidebar, openModal, closeModal } = uiSlice.actions
export default uiSlice.reducer
```

**File: `packages/web-ui/src/lib/store/store.ts`**

```typescript
import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import authReducer from './authSlice'
import uiReducer from './uiSlice'

const persistConfig = {
  key: 'clara-code',
  version: 1,
  storage,
  whitelist: ['auth'],
}

const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

**File: `packages/web-ui/src/components/providers/ReduxProvider.tsx`**

```typescript
'use client'

import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from '@/lib/store/store'

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  )
}
```

---

## Step 4: Root Layout

**File: `packages/web-ui/src/app/layout.tsx`** — REPLACE ENTIRELY

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { ApolloProvider } from '@/components/providers/ApolloProvider'
import { ReduxProvider } from '@/components/providers/ReduxProvider'
import './globals.css'

export const runtime = 'edge'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Clara Code — Code with your voice',
  description: 'Voice-first AI coding assistant. VS Code fork, standalone CLI, and web platform.',
  icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
  openGraph: {
    title: 'Clara Code — Code with your voice',
    description: 'Voice-first AI coding assistant. Open source.',
    images: [{ url: '/logo-hero.png', width: 1024, height: 1024 }],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={`${inter.className} bg-[#09090F] text-white antialiased`}>
          <ReduxProvider>
            <ApolloProvider>
              {children}
            </ApolloProvider>
          </ReduxProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
```

---

## Step 5: Landing Page (Hero + Features + Pricing + CTA)

**File: `packages/web-ui/src/app/page.tsx`** — REPLACE ENTIRELY

Build a dark, developer-focused landing page with these sections (top to bottom):

```typescript
import { Header } from '@/components/layout/Header'
import { Hero } from '@/components/sections/Hero'
import { Features } from '@/components/sections/Features'
import { PricingCards } from '@/components/sections/PricingCards'
import { InstallCTA } from '@/components/sections/InstallCTA'
import { Footer } from '@/components/layout/Footer'

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <Features />
      <PricingCards />
      <InstallCTA />
      <Footer />
    </main>
  )
}
```

### Header component (`src/components/layout/Header.tsx`):
- Logo mark left: `<ClaraLogo />` or text "Clara Code"
- Nav center: Docs | Pricing | GitHub (opens github.com/imaginationeverywhere/clara-code)
- Right: `<SignInButton>` + `<SignUpButton mode="modal">` (Clerk components)
- Sticky, backdrop-blur, border-bottom `border-white/5`

### Hero section (`src/components/sections/Hero.tsx`):
- Headline: `"Code with your voice."`
- Sub: `"Clara Code is a voice-first AI coding assistant. Speak naturally. Ship faster."`
- Primary CTA button: `"Get Clara"` → `/sign-up`
- Secondary CTA: `"View on GitHub"` → external link
- Below CTAs: Voice demo button (plays Clara greeting from `/api/voice/greet`)
- Show VoiceBar component (`@/components/voice/VoiceBar`) below the CTAs

### Features section (`src/components/sections/Features.tsx`):
Three-column grid, each with icon + title + description:
- **Voice** — "Speak to code. Clara listens, understands, and acts."
- **Terminal** — "CLI-native. `npx install claracode@latest && clara`"
- **IDE** — "VS Code fork with Clara baked in — voice, memory, and context."

### PricingCards section (`src/components/sections/PricingCards.tsx`):
Three cards side by side:

| Plan | Price | Features |
|------|-------|---------|
| Free | $0/mo | 100 voice exchanges/mo, 1 agent, CLI access, community support |
| Pro | $29/mo | Unlimited exchanges, 5 agents, API access, vault memory, priority support |
| Business | $99/mo | Unlimited everything, 25 agents, SSO, audit logs, SLA, custom voice |

- Highlight Pro card with `border-blue-500` and "Most Popular" badge
- CTA: Free → "Start Free", Pro → "Get Pro", Business → "Contact Sales"
- All pricing links to `/sign-up` or Stripe checkout (Stripe = Phase 2)

### InstallCTA section (`src/components/sections/InstallCTA.tsx`):
- Tab group: npm | pnpm | brew | VS Code Extension
- npm tab: `npx install claracode@latest` → `clara`
- pnpm tab: `pnpm dlx install claracode@latest` → `clara`
- brew tab: `brew install claracode && clara`
- VS Code Extension tab: Download button (links to VS Code marketplace — placeholder)
- Dark terminal-style code block

### Footer (`src/components/layout/Footer.tsx`):
- Left: Clara Code © 2026 Imagination Everywhere
- Center: Docs · Privacy · Terms · Status
- Right: GitHub icon + star count placeholder

---

## Step 6: Voice Greet Proxy API

**File: `packages/web-ui/src/app/api/voice/greet/route.ts`**

```typescript
import { NextResponse } from 'next/server'

export const runtime = 'edge'

const HERMES_GATEWAY = 'https://info-24346--hermes-gateway.modal.run'

export async function POST() {
  try {
    const response = await fetch(HERMES_GATEWAY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform: 'web',
        user: 'visitor',
        message: 'Hello Clara! Greet a developer who just discovered Clara Code.',
      }),
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Voice service unavailable' }, { status: 503 })
    }

    const data = await response.json() as { text?: string; audio_url?: string }
    return NextResponse.json({ text: data.text ?? '', audioUrl: data.audio_url ?? null })
  } catch {
    return NextResponse.json({ error: 'Failed to reach voice gateway' }, { status: 500 })
  }
}
```

---

## Step 7: Waitlist API

**File: `packages/web-ui/src/app/api/waitlist/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

interface WaitlistBody {
  email: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as WaitlistBody
    const { email } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    // TODO: persist to Neon via backend API
    // For now: log and return success
    console.log(`Waitlist signup: ${email}`)
    return NextResponse.json({ success: true, message: 'You are on the list.' })
  } catch {
    return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 })
  }
}
```

---

## Step 8: Auth Pages

**File: `packages/web-ui/src/app/sign-in/[[...sign-in]]/page.tsx`**

```typescript
import { SignIn } from '@clerk/nextjs'

export const runtime = 'edge'

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#09090F]">
      <SignIn
        appearance={{
          variables: { colorPrimary: '#3B82F6', colorBackground: '#111' },
        }}
      />
    </main>
  )
}
```

**File: `packages/web-ui/src/app/sign-up/[[...sign-up]]/page.tsx`** — same pattern with `<SignUp />`.

---

## Step 9: Dashboard

**File: `packages/web-ui/src/app/dashboard/page.tsx`**

```typescript
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export const runtime = 'edge'

export default async function DashboardPage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  return (
    <main className="min-h-screen bg-[#09090F] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-white/50 mb-8">Welcome back, {user.firstName ?? user.emailAddresses[0].emailAddress}</p>
        {/* Plan badge, usage bar, quick actions */}
        {/* Wire to Apollo queries: useQuery(GET_ME) */}
      </div>
    </main>
  )
}
```

---

## Step 10: API Keys Page

**File: `packages/web-ui/src/app/api-keys/page.tsx`**

Client component. Uses Apollo `useQuery(MY_API_KEYS)` and `useMutation(CREATE_API_KEY)` and `useMutation(REVOKE_API_KEY)`.

Features:
- List of existing API keys (name, prefix `sk_cc_...`, created date, last used, active badge)
- "Create New Key" button → modal with name input
- "Revoke" button per key (with confirmation)
- Copy-to-clipboard on key prefix
- TypeScript: all GraphQL operations typed

---

## Environment Variables

Add to `packages/web-ui/.env.local` (and `.env.develop`):

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3031/graphql
```

---

## Tailwind Color Tokens

In `tailwind.config.ts`, extend:
```typescript
colors: {
  'clara-blue': '#3B82F6',
  'clara-bg': '#09090F',
  'clara-surface': '#111827',
  'clara-border': 'rgba(255,255,255,0.08)',
}
```

---

## TypeScript Requirements

- `strict: true` in `tsconfig.json`
- No `any` — use `unknown` and narrow
- All Apollo queries typed with generated types or explicit interfaces
- All Redux state typed with `RootState` and `AppDispatch`
- All API routes typed with `NextRequest`/`NextResponse`

---

## Acceptance Criteria

- [ ] `npm run build` passes with zero TS errors
- [ ] `npm run lint` passes clean
- [ ] Landing page renders in browser at localhost:3000
- [ ] Clerk sign-in/sign-up flows work
- [ ] `/dashboard` redirects to sign-in if unauthenticated
- [ ] Voice greet button calls `/api/voice/greet` and gets a response
- [ ] Waitlist form POSTs to `/api/waitlist`
- [ ] All 3 pricing tiers visible on `/pricing`
- [ ] API keys page shows list + create/revoke UI
- [ ] Redux store persists `auth` slice to localStorage

## Push to Branch

```bash
git checkout -b feat/web-complete
git add packages/web-ui/
git commit -m "feat(web-ui): full claracode.ai — landing + auth + dashboard + API keys + voice proxy"
git push origin feat/web-complete
```

---

## VRD-001 Voice Character Layer (MANDATORY — Read Before Writing Any UI Copy)

> **Source:** VRD-001-claracode-visitor-greeting.md + CLARA-CODE-VOICE-PLAYBOOK.md (both in this directory)
> **Status:** APPROVED AND LOCKED — Mo, April 10 2026. Do not change without approval.

This section overrides and replaces any generic placeholder copy in the sections above.

### Landing Page Copy (Surface A — VRD §A1)

**Replace the Hero section copy with exactly this:**

The hero is a **voice-first moment**, not a feature list. Only 3 lines of text appear on screen while Clara's voice plays:

```tsx
// src/components/sections/Hero.tsx — EXACT TEXT

// Visible text (large, centered, one line at a time — or stacked):
"I'm Clara."
"I've never written a line of code."
"Whether you've done it before or not."

// Subtext (visible after voice finishes, smaller):
"We speak things into existence around here."

// The rest of the canonical greeting is VOICE ONLY — not shown as text.
```

**Voice trigger:** Clara's full canonical greeting plays automatically after 3 seconds of idle on first visit. The greeting ends with: *"Two kinds of people find me — the ones with an idea and no place to start, and the ones with a vision and no time to finish it. Which one are you? Let's get busy."*

**Visual:** The hero is NOT a traditional SaaS hero. No feature grid in the hero. Just the 3 text lines, the voice demo button, and the two-path CTA below:
- Button A: `"I have an idea"` → triggers Vibe Coder flow
- Button B: `"Show me what you can do"` → triggers Developer flow

**No "Code with your voice." headline.** That copy is retired. The 3 locked lines ARE the hero.

---

### Voice Greet API — Two-Audience Path (Surface A — VRD §A2/A3)

**Replace the `/api/voice/greet/route.ts` entirely:**

```typescript
// packages/web-ui/src/app/api/voice/greet/route.ts
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const HERMES_GATEWAY = 'https://info-24346--hermes-gateway.modal.run'

// Surface-specific scripts — canonical per VRD-001
// NOTE: Real implementation in backend/src/features/ai/clara/scripts/
// This edge route is a thin proxy that passes surface + partnerType context

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      partnerType?: 'vibe-coder' | 'developer' | 'unknown'
      trigger?: 'first-visit' | 'return-visit' | 'post-oauth' | 'demo-offer' | 'no-response'
      userName?: string
    }

    const { partnerType = 'unknown', trigger = 'first-visit', userName } = body

    // Surface A scripts — inline until backend Clara scripts engine is live (Prompt 05)
    const scripts: Record<string, string> = {
      'first-visit': "I'm Clara. I built one of the most successful businesses in my industry. I've never written a line of code. And guess what — with this tool, you won't either. Whether you've done it before or not. We speak things into existence around here. Two kinds of people find me — the ones with an idea and no place to start, and the ones with a vision and no time to finish it. Which one are you? Let's get busy.",
      'vibe-coder': "Good. Tell me the idea. Not the technical version — just what it should do for the person using it.",
      'developer': "Good. What are you trying to ship?",
      'no-response': "Take your time. I'm not going anywhere.",
      'return-visit': "You came back. What are we building?",
      'post-oauth': `You're in. I can see your GitHub. I'm not going to do anything with it until you ask me to. But I know it's there when we need it. So — what are we starting with?`,
      'demo-offer': "I can actually start on this right now — you don't need an account yet. Want to see?",
    }

    let scriptKey = trigger
    if (trigger === 'first-visit' && partnerType === 'vibe-coder') scriptKey = 'vibe-coder'
    if (trigger === 'first-visit' && partnerType === 'developer') scriptKey = 'developer'

    const scriptText = scripts[scriptKey] ?? scripts['first-visit']

    // Send to voice gateway for TTS synthesis
    const response = await fetch(HERMES_GATEWAY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform: 'web',
        user: userName ?? 'visitor',
        message: scriptText,
        surface: 'web',
        action: 'speak',
      }),
    })

    if (!response.ok) {
      // Fallback: return text without audio
      return NextResponse.json({
        text: scriptText,
        audioUrl: null,
        fallback: true,
      })
    }

    const data = await response.json() as { text?: string; audio_url?: string; reply?: string }
    return NextResponse.json({
      text: scriptText,
      audioUrl: data.audio_url ?? null,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to reach voice gateway', text: null, audioUrl: null }, { status: 500 })
  }
}
```

---

### Return Visit Detection (Surface A — VRD §A6)

In `src/app/page.tsx`, detect return visitors:

```typescript
// Client component check — read 'clara_visited' cookie
// First visit: set cookie, show full greeting
// Return visit: call /api/voice/greet with trigger: 'return-visit'
// The return greeting is: "You came back. [pause] What are we building?"
// — Three words. She acknowledges the return without making a production of it.
```

---

### Post-GitHub OAuth Greeting (Surface A — VRD §A7)

In `src/app/dashboard/page.tsx`, detect first authenticated session:

```typescript
// If user.createdAt is within last 60 seconds → first session → trigger: 'post-oauth'
// "You're in. I can see your GitHub. I'm not going to do anything with it until you ask me to."
// This is the privacy/trust signal. It matters.
```

---

### What Clara Never Says — Enforce in ALL Landing Page Copy

| ❌ Prohibited | ✅ Clara's Version |
|--------------|-------------------|
| "Great question!" | Never say this. Just answer. |
| "I apologize for..." | "That was wrong. Here's the fix." |
| "Would you like me to..." | Do it. Then say "Done. Check it." |
| "As an AI, I can help with..." | Remove. Just help. |
| "Here's a comprehensive overview..." | Answer the question. Ask if they want more. |
| "This is just a starting point" | Ship it. Let them say what to change. |
| Feature lists when asked "what can you do?" | "Easier to show you. What have you been trying to build?" |

---

### Acceptance Criteria (Voice Layer)

- [ ] Landing page shows exactly 3 visible text lines on hero (not a generic SaaS headline)
- [ ] Voice greeting plays automatically on first visit after 3-second idle
- [ ] Two CTAs below voice: "I have an idea" (vibe coder) and "Show me what you can do" (developer)
- [ ] Return visit shows abbreviated greeting: "You came back. What are we building?"
- [ ] Post-OAuth first session triggers `post-oauth` script
- [ ] `/api/voice/greet` accepts `{ partnerType, trigger, userName }` and returns `{ text, audioUrl }`
- [ ] No prohibited phrases in any page copy
- [ ] "Whether you've done it before or not." appears on the landing page
