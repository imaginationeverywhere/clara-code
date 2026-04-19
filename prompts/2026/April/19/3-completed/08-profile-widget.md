# Prompt 08 — ProfileWidget for Authenticated Dashboard Header

**Status:** Implemented: `frontend/src/components/app/AppHeader.tsx`, `ProfileWidget.tsx`; authenticated routes grouped under `frontend/src/app/(app)/` with shared layout (`pt-14` + fixed header). Tier badge reads `publicMetadata.tier` or maps `publicMetadata.plan` (PRO/BUSINESS/FREE). `next.config.ts` allows Clerk avatar hostnames for `next/image`.

**Date**: 2026-04-15
**Branch**: `prompt/2026-04-15/08-profile-widget`
**Flags**: `--clerk --profile --design web`
**Estimated scope**: 3–5 files

---

## Context

Every authenticated layout (dashboard, account, API keys page) is missing a ProfileWidget in the header. This is a Clerk standard requirement: authenticated users must see their avatar, name, tier badge, and sign-out option.

Currently the dashboard uses the marketing `Header.tsx` (designed for unauthenticated visitors). Authenticated pages need a different header — with user identity visible.

---

## Design Constraints

- Read `docs/design-system.md` before writing any component
- Background: `bg-sculpt-900` or `bg-bg-base`
- Border bottom: `border-b border-border`
- Height: `h-14` fixed
- Design tokens only — no hardcoded hex

---

## Task 1 — Create `frontend/src/components/app/AppHeader.tsx`

A `'use client'` component for authenticated pages. Contains:
- Left: Clara logo (link to `/`) — same logo as marketing Header
- Right: `<ProfileWidget />`

```tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ProfileWidget } from './ProfileWidget'

export function AppHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-border bg-bg-base flex items-center px-6">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/logo.png" alt="Clara Code" width={24} height={24} />
        <span className="text-sm font-semibold text-text-primary">Clara Code</span>
      </Link>
      <div className="ml-auto">
        <ProfileWidget />
      </div>
    </header>
  )
}
```

---

## Task 2 — Create `frontend/src/components/app/ProfileWidget.tsx`

A `'use client'` component. Uses `useUser` and `useClerk` from `@clerk/nextjs`.

Shows:
1. User avatar (Clerk `imageUrl`) — 32×32px rounded circle
2. User name (firstName + lastName or username)
3. Tier badge — resolves from `user.publicMetadata.tier` (values: `"free"`, `"pro"`, `"business"`)
4. Dropdown on click: Account settings (→ `/account`), Sign out

```tsx
'use client'

import { useClerk, useUser } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

const TIER_BADGE: Record<string, string> = {
  pro: 'bg-clara text-white',
  business: 'bg-brand-teal text-white',
  free: 'bg-sculpt-700 text-text-muted',
}

export function ProfileWidget() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const [open, setOpen] = useState(false)

  if (!user) return null

  const tier = (user.publicMetadata?.tier as string) ?? 'free'
  const displayName = user.firstName
    ? `${user.firstName} ${user.lastName ?? ''}`.trim()
    : user.username ?? user.primaryEmailAddress?.emailAddress?.split('@')[0] ?? 'User'

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-sculpt-800 transition-colors"
        aria-label="Profile menu"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Image
          src={user.imageUrl}
          alt={displayName}
          width={32}
          height={32}
          className="rounded-full"
        />
        <span className="hidden sm:block text-sm text-text-body">{displayName}</span>
        <span className={`hidden sm:block text-xs px-1.5 py-0.5 rounded font-medium capitalize ${TIER_BADGE[tier] ?? TIER_BADGE.free}`}>
          {tier}
        </span>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-1 w-48 rounded-lg border border-border bg-sculpt-900 shadow-lg py-1"
          role="menu"
        >
          <Link
            href="/account"
            className="block px-4 py-2 text-sm text-text-body hover:bg-sculpt-800"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Account settings
          </Link>
          <Link
            href="/dashboard"
            className="block px-4 py-2 text-sm text-text-body hover:bg-sculpt-800"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Dashboard
          </Link>
          <hr className="my-1 border-border" />
          <button
            type="button"
            className="w-full text-left px-4 py-2 text-sm text-text-muted hover:bg-sculpt-800"
            role="menuitem"
            onClick={() => { void signOut(); setOpen(false) }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
```

---

## Task 3 — Wire `AppHeader` into authenticated layout

Check if there is a `frontend/src/app/(app)/layout.tsx` or similar authenticated route group layout. If not, create `frontend/src/app/(app)/layout.tsx`:

```tsx
import { AppHeader } from '@/components/app/AppHeader'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />
      <main className="pt-14">{children}</main>
    </>
  )
}
```

Then move these routes under `(app)/` if they're not already:
- `dashboard/` → `(app)/dashboard/`
- `account/` → `(app)/account/`
- `api-keys/` → `(app)/api-keys/`
- `settings/` → `(app)/settings/`

**IMPORTANT**: Before moving routes, check if any of these have route group files already (`(app)/` directory). If moves would break anything, add `AppHeader` to each page's layout instead — do NOT break existing routes.

If moving is risky or complex, simpler approach: import `AppHeader` directly in `frontend/src/app/dashboard/DashboardTabs.tsx` and render it at the top (inside the client component, before the tab content).

---

## Task 4 — Click-outside close behavior

Add a `useEffect` to close the dropdown when clicking outside:

```tsx
useEffect(() => {
  if (!open) return
  function handleOutside(e: MouseEvent) {
    if (!(e.target as Element).closest('[aria-haspopup]')) {
      setOpen(false)
    }
  }
  document.addEventListener('mousedown', handleOutside)
  return () => document.removeEventListener('mousedown', handleOutside)
}, [open])
```

---

## Acceptance Criteria

- [ ] `ProfileWidget` renders avatar, name, and tier badge for authenticated users
- [ ] Tier badge shows `pro` / `business` / `free` with distinct colors
- [ ] Dropdown: Account settings, Dashboard, Sign out
- [ ] Sign out calls `useClerk().signOut()`
- [ ] Dropdown closes on outside click
- [ ] `AppHeader` is visible on Dashboard, Account, API Keys pages
- [ ] Marketing pages (`/`, `/pricing`, `/docs`) still use `Header.tsx` (not `AppHeader`)
- [ ] `cd frontend && npm run type-check` passes
- [ ] Biome/lint passes

## What NOT to Change

- `frontend/src/components/marketing/Header.tsx` — marketing header stays as-is
- Backend routes, API, middleware
- `dashboard/page.tsx` server component — auth logic stays there
