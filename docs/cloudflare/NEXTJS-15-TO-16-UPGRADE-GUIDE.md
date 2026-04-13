# Upgrading Next.js 15.x to 16.x for Cloudflare Workers

> Step-by-step guide for upgrading Next.js applications from 15.5.x to 16.2.x, specifically for deployment to Cloudflare Workers with OpenNext.

**Last Updated:** April 2026  
**From Version:** Next.js 15.5.9  
**To Version:** Next.js 16.2.3

---

## Table of Contents

1. [Pre-Upgrade Checklist](#pre-upgrade-checklist)
2. [Dependency Updates](#dependency-updates)
3. [Breaking Changes](#breaking-changes)
4. [Code Migrations](#code-migrations)
5. [Cloudflare-Specific Changes](#cloudflare-specific-changes)
6. [Testing the Upgrade](#testing-the-upgrade)
7. [Rollback Plan](#rollback-plan)

---

## Pre-Upgrade Checklist

Before upgrading, ensure:

- [ ] Your app builds successfully on Next.js 15.x
- [ ] All tests pass
- [ ] You have a git branch for the upgrade (don't upgrade on main)
- [ ] You've reviewed the [Next.js 16 release notes](https://nextjs.org/blog/next-16)
- [ ] Your CI/CD pipeline is working

### Create Upgrade Branch

```bash
git checkout develop
git pull origin develop
git checkout -b upgrade/nextjs-16
```

---

## Dependency Updates

### 1. Update Core Dependencies

```bash
# Update Next.js and React
npm install next@16.2.3 react@19.2.5 react-dom@19.2.5

# Update types
npm install -D @types/react@19 @types/react-dom@19

# Update ESLint config
npm install -D eslint-config-next@16.2.3
```

### 2. Update OpenNext (Critical for Cloudflare)

```bash
# Must be 1.17.3+ for Next.js 16.2 support
npm install -D @opennextjs/cloudflare@latest

# Verify version
npm list @opennextjs/cloudflare
# Should show 1.19.0 or higher
```

### 3. Update Other Dependencies

Check for compatibility updates:

```bash
# Clerk (if using)
npm install @clerk/nextjs@latest

# Apollo Client (if using)
npm install @apollo/client@latest

# Tailwind CSS (if using)
npm install -D tailwindcss@latest autoprefixer@latest postcss@latest
```

### 4. Full package.json Example

```json
{
  "dependencies": {
    "next": "16.2.3",
    "react": "19.2.5",
    "react-dom": "19.2.5",
    "@clerk/nextjs": "^7.0.12"
  },
  "devDependencies": {
    "@opennextjs/cloudflare": "^1.19.1",
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint-config-next": "16.2.3",
    "typescript": "^5",
    "wrangler": "^4"
  }
}
```

---

## Breaking Changes

### React 19 Changes

#### 1. Ref Handling

**Before (React 18):**
```typescript
const MyComponent = React.forwardRef((props, ref) => {
  return <div ref={ref}>{props.children}</div>
})
```

**After (React 19):**
```typescript
// forwardRef is still supported but refs can now be passed as props
function MyComponent({ ref, children }) {
  return <div ref={ref}>{children}</div>
}
```

#### 2. Context Changes

**Before:**
```typescript
const value = useContext(MyContext)
if (!value) throw new Error('Must be within provider')
```

**After (React 19 - use() hook):**
```typescript
// Can now use() to read context in more places
const value = use(MyContext)
```

### Next.js 16 Changes

#### 1. Middleware Deprecation

**Before:**
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // ...
}
```

**After (Next.js 16):**
```typescript
// proxy.ts (new convention)
export function proxy(request: NextRequest) {
  // ...
}

// Note: middleware.ts still works but shows deprecation warning
// Migration can be gradual
```

#### 2. Server Actions (Now Default)

**Before (Next.js 15):**
```typescript
// next.config.js
experimental: {
  serverActions: true
}
```

**After (Next.js 16):**
```typescript
// No longer needed - server actions are default
// Remove experimental.serverActions from config
```

#### 3. Turbopack Default

Next.js 16 uses Turbopack by default for builds. If you need Webpack:

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  // Force Webpack if needed (not recommended)
  // webpack: (config) => config,
}
```

---

## Code Migrations

### 1. Fix Dynamic Imports with SSR: false

Components using `dynamic()` with `ssr: false` must be in Client Components:

**Before (might work in 15):**
```typescript
// page.tsx (Server Component)
import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('./Chart'), { ssr: false })
```

**After (required in 16):**
```typescript
// page.tsx
'use client'  // Required!

import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('./Chart'), { ssr: false })
```

### 2. Apollo Client / GraphQL Components

Move Apollo hooks to separate client components:

**Before:**
```typescript
// page.tsx
'use client'
import { useQuery } from '@apollo/client'

export default function Page() {
  const { data } = useQuery(MY_QUERY)
  return <div>{data?.items}</div>
}
```

**After (separate file for safety):**
```typescript
// page.tsx
import dynamic from 'next/dynamic'

const Content = dynamic(() => import('./Content'), { ssr: false })

export default function Page() {
  return <Content />
}

// Content.tsx
'use client'
import { ApolloProvider } from '@apollo/client'
import { getApolloClient } from '@/lib/apollo'
import { useQuery } from '@apollo/client'

export default function Content() {
  return (
    <ApolloProvider client={getApolloClient()}>
      <Inner />
    </ApolloProvider>
  )
}

function Inner() {
  const { data } = useQuery(MY_QUERY)
  return <div>{data?.items}</div>
}
```

### 3. Clerk Provider

Add ClerkProvider to root layout if using Clerk:

```typescript
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

### 4. Font Loading Changes

Google Fonts via next/font may cause issues on edge:

**Before:**
```typescript
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })
```

**After (for Cloudflare Workers):**
```css
/* globals.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body {
  font-family: 'Inter', sans-serif;
}
```

Or use local fonts:
```typescript
import localFont from 'next/font/local'

const inter = localFont({
  src: './fonts/Inter.woff2',
  variable: '--font-inter',
})
```

---

## Cloudflare-Specific Changes

### 1. Update wrangler.toml

```toml
# Update compatibility date
compatibility_date = "2025-05-05"  # Required for Next.js 16

# Ensure nodejs_compat is present
compatibility_flags = ["nodejs_compat"]
```

### 2. Update Durable Objects (if on Free Plan)

```toml
# Use new_sqlite_classes instead of new_classes
[[migrations]]
tag = "v1"
new_sqlite_classes = ["DOQueueHandler", "DOShardedTagCache", "BucketCachePurge"]
```

### 3. OpenNext Config

Ensure `open-next.config.ts` exists:

```typescript
import { defineCloudflareConfig } from '@opennextjs/cloudflare'

export default defineCloudflareConfig()
```

---

## Testing the Upgrade

### 1. Local Build Test

```bash
# Clean previous builds
rm -rf .next .open-next node_modules/.cache

# Install fresh dependencies
npm install

# Test Next.js build
npm run build

# Test OpenNext build
npm run pages:build
```

### 2. Local Preview

```bash
# Run with wrangler (production-like)
npm run pages:preview

# Test key pages:
# - Homepage
# - Dynamic routes
# - API routes
# - Auth flows
```

### 3. Type Check

```bash
npx tsc --noEmit
```

### 4. Lint Check

```bash
npm run lint
```

### 5. Deploy to Preview Environment

```bash
# Deploy to preview (not production!)
npx wrangler deploy --env preview

# Test on preview URL
curl -I https://your-app-preview.workers.dev
```

---

## Common Upgrade Issues

### Issue: "Module not found" errors

**Cause:** Some packages need React 19 compatible versions.

**Solution:**
```bash
# Check for outdated packages
npm outdated

# Update all to latest
npm update
```

### Issue: "Hydration mismatch" errors

**Cause:** Server/client rendering differences in React 19.

**Solution:**
- Wrap problematic components in `<Suspense>`
- Use `dynamic()` with `ssr: false` for client-only components
- Check for `typeof window` checks that affect render

### Issue: "Cannot read property of undefined" in build

**Cause:** Static generation trying to access runtime-only values.

**Solution:**
- Move API calls to client components
- Use `dynamic()` with `ssr: false`
- Add `export const dynamic = 'force-dynamic'` to pages that can't be static

### Issue: Build succeeds but Worker crashes

**Cause:** Usually missing Durable Objects bindings or wrong OpenNext version.

**Solution:**
```bash
# Check OpenNext version
npm list @opennextjs/cloudflare
# Must be 1.17.3+ for Next.js 16.2

# Check wrangler.toml has all DO bindings
# Check migrations use new_sqlite_classes (free plan)
```

---

## Rollback Plan

If the upgrade fails:

### 1. Quick Rollback

```bash
# Revert to previous branch
git checkout develop
npx wrangler deploy --env production
```

### 2. Version Pinning

If you need to stay on 15.x temporarily:

```json
{
  "dependencies": {
    "next": "15.5.9",
    "react": "18.3.1",
    "react-dom": "18.3.1"
  }
}
```

### 3. Create Issue

Document what failed for future reference:
- Error messages
- Which page/component failed
- Stack traces

---

## Post-Upgrade Checklist

After successful upgrade:

- [ ] All pages load correctly
- [ ] Authentication works
- [ ] API routes function
- [ ] Forms submit correctly
- [ ] Images load (check `/_next/image`)
- [ ] Static assets serve
- [ ] No console errors
- [ ] Performance is acceptable
- [ ] Monitoring shows no errors

### Merge to Main

```bash
# After testing on preview
git checkout develop
git merge upgrade/nextjs-16
git push origin develop

# Deploy to production
npx wrangler deploy --env production
```

---

## Quick Reference: Version Compatibility

| Next.js | React | OpenNext | Wrangler | Status |
|---------|-------|----------|----------|--------|
| 15.5.9 | 18.3.1 | 1.16.x | 4.x | ✅ Stable |
| 16.0.x | 19.0.x | 1.17.0 | 4.x | ⚠️ Early issues |
| 16.1.x | 19.1.x | 1.17.1 | 4.x | ✅ Stable |
| 16.2.0 | 19.2.x | 1.17.3+ | 4.x | ✅ Stable (fixed) |
| 16.2.3 | 19.2.5 | 1.19.1 | 4.81+ | ✅ Recommended |

---

*Document maintained by the Clara Code team.*
