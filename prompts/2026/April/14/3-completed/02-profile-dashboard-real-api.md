# Profile Standard: Fix Dashboard + Add Account Profile Page

**Flag:** `/pickup-prompt --profile --clerk`
**Project:** clara-code
**Files:** `frontend/src/app/dashboard/`, `frontend/src/app/settings/`, `backend/src/routes/`

## Context

The `/dashboard` page at `frontend/src/app/dashboard/page.tsx` stores API keys in **localStorage** (`STORAGE_KEY = 'clara-dashboard-api-keys'`). This is a prototype pattern that must be replaced with real API calls. The `/api-keys` page already uses Apollo GraphQL correctly (`MY_API_KEYS`, `CREATE_API_KEY`, `REVOKE_API_KEY` mutations).

The `/settings` page has a `SettingsProfile` component but no subscription tier, usage stats, or wallet equivalent for developer credits.

## What Needs to Change

### 1. Fix `/dashboard` — replace localStorage with real Apollo queries

`frontend/src/app/dashboard/page.tsx` uses:
```typescript
const STORAGE_KEY = 'clara-dashboard-api-keys'
// ... useState to store keys in localStorage
```

Replace the entire key management section with the same Apollo pattern from `/api-keys/ApiKeysContent.tsx`:
- Import `MY_API_KEYS`, `CREATE_API_KEY`, `REVOKE_API_KEY` from `@/lib/apollo/operations`
- Use `useQuery(MY_API_KEYS)` instead of `useState` + localStorage
- Keep the existing nav tabs (overview, keys, voice, billing)
- The "keys" tab should render the same content as `ApiKeysContent` — consider importing it directly

The dashboard page must NOT use localStorage for any API key data.

### 2. Add usage stats to the dashboard overview tab

The backend has `backend/src/routes/user-usage.ts`. Wire the overview tab to show:
- Total API calls this month
- Active API keys count
- Subscription tier badge (Free / Pro / Business / Developer Program)
- Quick copy for the user's primary API key (masked: `sk_••••••••••••[last4]`)

Use GraphQL if the query exists, or add a REST fetch from `/api/user/usage` if the route exists in `backend/src/routes/user-usage.ts`.

### 3. Add a proper `/account` page (profile standard)

Create `frontend/src/app/account/page.tsx` as a server component:

```typescript
// frontend/src/app/account/page.tsx
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function AccountPage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  return (
    <main className="min-h-screen bg-bg-base p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <AccountHeader user={user} />
        <PersonalInfoSection user={user} />
        <SubscriptionSection />
        <DangerZone />
      </div>
    </main>
  )
}
```

Required sections per the profile standard:
1. **AccountHeader** — Avatar (from Clerk), name, email, subscription tier badge
2. **PersonalInfoSection** — Display name (editable via Clerk `updateUser`), email (read-only)
3. **SubscriptionSection** — Current plan name, next billing date, link to Stripe portal (`/api/checkout/portal` if it exists, else a "Manage billing" placeholder)
4. **DangerZone** — "Delete account" button (calls Clerk `deleteUser` — requires confirmation modal)

### 4. Add "Account" link to the navigation

In whatever navbar/layout exists for authenticated pages (`frontend/src/app/layout.tsx` or a dashboard layout), add a link to `/account`.

Check `frontend/src/app/layout.tsx` and `frontend/src/components/` for the existing nav. Add `/account` next to `/dashboard` and `/api-keys`.

### 5. Fix dashboard page to be a server component for the outer shell

The dashboard page has `'use client'` at the top. The outer shell (auth check, layout) should be a server component. Only the interactive tabs need `'use client'`. Refactor:

```
dashboard/
  page.tsx          ← server component: auth check, layout shell
  DashboardTabs.tsx ← 'use client': tab switching, API calls
```

## Acceptance Criteria

- [ ] `/dashboard` no longer reads or writes `localStorage` for API keys
- [ ] `/dashboard` keys tab shows real keys from GraphQL API
- [ ] `/dashboard` overview tab shows subscription tier badge + key count
- [ ] `/account` page exists with avatar, name, email, subscription section, danger zone
- [ ] Nav has link to `/account`
- [ ] `npm run type-check` passes (zero errors)
- [ ] `npm run lint` passes

## Do NOT

- Do not add a wallet or payment credits system — that's not Clara Code's model
- Do not build Stripe billing UI — placeholder link is fine for now
- Do not add avatar upload — Clerk-provided avatar only
- Do not modify the `/api-keys` page — it already works correctly
