# Step-by-Step: Deploying Next.js 16 to Cloudflare Workers

> Complete procedural guide documenting every step to deploy a Next.js 16 application to Cloudflare Workers using OpenNext. Follow this guide for any new Next.js 16 app deployment.

**Based on:** Clara Code deployment (April 2026)  
**Time Required:** ~30-60 minutes  
**Difficulty:** Intermediate

---

## Table of Contents

1. [Phase 1: Prerequisites & Setup](#phase-1-prerequisites--setup)
2. [Phase 2: Install Dependencies](#phase-2-install-dependencies)
3. [Phase 3: Create Configuration Files](#phase-3-create-configuration-files)
4. [Phase 4: Fix Common Build Issues](#phase-4-fix-common-build-issues)
5. [Phase 5: Build & Test Locally](#phase-5-build--test-locally)
6. [Phase 6: Deploy to Cloudflare](#phase-6-deploy-to-cloudflare)
7. [Phase 7: Configure Custom Domains](#phase-7-configure-custom-domains)
8. [Phase 8: Set Secrets & Environment Variables](#phase-8-set-secrets--environment-variables)
9. [Phase 9: Verify Deployment](#phase-9-verify-deployment)
10. [Troubleshooting Checklist](#troubleshooting-checklist)

---

## Phase 1: Prerequisites & Setup

### 1.1 Verify Node.js Version

```bash
node --version
# Must be 18+ (22+ recommended)
```

### 1.2 Login to Cloudflare

```bash
npx wrangler login
# Browser opens for OAuth authentication

# Verify login
npx wrangler whoami
# Should show your account name and ID
```

### 1.3 Note Your Cloudflare Account ID

```bash
npx wrangler whoami
# Copy the Account ID - you'll need it for CI/CD
```

### 1.4 Ensure Domain is on Cloudflare

For custom domains to work, your domain must be managed by Cloudflare DNS:
1. Go to https://dash.cloudflare.com
2. Add your domain if not already added
3. Update nameservers at your registrar if needed

---

## Phase 2: Install Dependencies

### 2.1 Navigate to Your Next.js App

```bash
cd your-nextjs-app
# or for monorepo:
cd your-monorepo/frontend
```

### 2.2 Install OpenNext and Wrangler

```bash
npm install -D @opennextjs/cloudflare@latest wrangler@latest
```

### 2.3 Verify Installation

```bash
npm list @opennextjs/cloudflare wrangler
# Should show versions: @opennextjs/cloudflare@1.19.x, wrangler@4.8x.x
```

### 2.4 Add Build Scripts to package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "pages:build": "npx @opennextjs/cloudflare build",
    "pages:preview": "npx wrangler dev",
    "pages:deploy": "npx wrangler deploy"
  }
}
```

---

## Phase 3: Create Configuration Files

### 3.1 Create open-next.config.ts

Create `open-next.config.ts` in your app root (same level as package.json):

```typescript
import { defineCloudflareConfig } from '@opennextjs/cloudflare'

export default defineCloudflareConfig()
```

### 3.2 Create wrangler.toml

Create `wrangler.toml` in your app root:

```toml
# OpenNext for Cloudflare Workers
# Deploy: npx wrangler deploy --env production
# Preview: npx wrangler deploy --env preview

name = "your-app-name"
main = ".open-next/worker.js"
compatibility_date = "2025-05-05"
compatibility_flags = ["nodejs_compat"]

[assets]
directory = ".open-next/assets"
binding = "ASSETS"

# Durable Objects for ISR/caching (required for Next.js 16)
[[durable_objects.bindings]]
name = "NEXT_CACHE_DO_QUEUE"
class_name = "DOQueueHandler"

[[durable_objects.bindings]]
name = "NEXT_TAG_CACHE_DO_SHARDED"
class_name = "DOShardedTagCache"

[[durable_objects.bindings]]
name = "BUCKET_CACHE_PURGE"
class_name = "BucketCachePurge"

# Use new_sqlite_classes for Cloudflare Free plan
# Use new_classes for Cloudflare Paid plan
[[migrations]]
tag = "v1"
new_sqlite_classes = ["DOQueueHandler", "DOShardedTagCache", "BucketCachePurge"]

# Production Environment
[env.production]
name = "your-app-name"
routes = [
  { pattern = "yourdomain.com", custom_domain = true },
  { pattern = "www.yourdomain.com", custom_domain = true }
]

[[env.production.durable_objects.bindings]]
name = "NEXT_CACHE_DO_QUEUE"
class_name = "DOQueueHandler"

[[env.production.durable_objects.bindings]]
name = "NEXT_TAG_CACHE_DO_SHARDED"
class_name = "DOShardedTagCache"

[[env.production.durable_objects.bindings]]
name = "BUCKET_CACHE_PURGE"
class_name = "BucketCachePurge"

# Preview/Staging Environment
[env.preview]
name = "your-app-name-preview"
routes = [
  { pattern = "develop.yourdomain.com", custom_domain = true }
]

[[env.preview.durable_objects.bindings]]
name = "NEXT_CACHE_DO_QUEUE"
class_name = "DOQueueHandler"

[[env.preview.durable_objects.bindings]]
name = "NEXT_TAG_CACHE_DO_SHARDED"
class_name = "DOShardedTagCache"

[[env.preview.durable_objects.bindings]]
name = "BUCKET_CACHE_PURGE"
class_name = "BucketCachePurge"
```

### 3.3 Update .gitignore

Add to `.gitignore`:

```
# OpenNext build output
.open-next/
```

---

## Phase 4: Fix Common Build Issues

Before building, fix these common issues that cause build failures:

### 4.1 Add ClerkProvider (if using Clerk)

If your app uses Clerk authentication, wrap your app with ClerkProvider:

```typescript
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

### 4.2 Fix Apollo Client / GraphQL Components

Components using Apollo hooks must be loaded client-side only:

**Step 1:** Create a separate client component file:

```typescript
// app/my-page/MyPageContent.tsx
'use client'

import { ApolloProvider } from '@apollo/client'
import { getApolloClient } from '@/lib/apollo/client'
import { useQuery } from '@apollo/client'

export default function MyPageContent() {
  return (
    <ApolloProvider client={getApolloClient()}>
      <Inner />
    </ApolloProvider>
  )
}

function Inner() {
  const { data, loading } = useQuery(MY_QUERY)
  // ... render component
}
```

**Step 2:** Use dynamic import in the page:

```typescript
// app/my-page/page.tsx
'use client'

import dynamic from 'next/dynamic'

const MyPageContent = dynamic(() => import('./MyPageContent'), {
  ssr: false,
  loading: () => <div>Loading...</div>,
})

export default function MyPage() {
  return <MyPageContent />
}
```

### 4.3 Fix Google Fonts (if using next/font/google)

Google Fonts via next/font can cause edge runtime issues. Use CSS import instead:

**Before:**
```typescript
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })
```

**After:**
```css
/* globals.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body {
  font-family: 'Inter', sans-serif;
}
```

### 4.4 Ensure next.config.ts is Clean

Remove any incompatible configuration:

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Keep it minimal for Cloudflare
  typescript: {
    ignoreBuildErrors: true,  // Optional: handle in CI instead
  },
}

export default nextConfig
```

---

## Phase 5: Build & Test Locally

### 5.1 Clean Previous Builds

```bash
rm -rf .next .open-next node_modules/.cache
```

### 5.2 Run OpenNext Build

```bash
npm run pages:build
```

**Expected Output:**
```
┌─────────────────────────────┐
│ OpenNext — Cloudflare build │
└─────────────────────────────┘

Next.js version : 16.2.3
@opennextjs/cloudflare version: 1.19.1

┌─────────────────────────────────┐
│ OpenNext — Building Next.js app │
└─────────────────────────────────┘

✓ Compiled successfully
✓ Generating static pages

┌──────────────────────────────┐
│ OpenNext — Generating bundle │
└──────────────────────────────┘

Worker saved in `.open-next/worker.js` 🚀
OpenNext build complete.
```

### 5.3 If Build Fails

Check error messages for:
- **Apollo/GraphQL errors** → Fix with dynamic imports (Phase 4.2)
- **Clerk errors** → Add ClerkProvider (Phase 4.1)
- **Module not found** → Check dependencies are installed
- **Prerender errors** → Make page dynamic or fix data fetching

### 5.4 Test Locally (Optional)

```bash
npm run pages:preview
# Opens at http://localhost:8787
```

---

## Phase 6: Deploy to Cloudflare

### 6.1 Deploy Production

```bash
npx wrangler deploy --env production
```

**Expected Output:**
```
Uploaded your-app-name (25.82 sec)
Deployed your-app-name triggers (1.64 sec)
  yourdomain.com (custom domain)
  www.yourdomain.com (custom domain)
Current Version ID: xxxxx-xxxx-xxxx
```

### 6.2 Deploy Preview

```bash
npx wrangler deploy --env preview
```

**Expected Output:**
```
Uploaded your-app-name-preview (19.94 sec)
Deployed your-app-name-preview triggers (2.60 sec)
  develop.yourdomain.com (custom domain)
Current Version ID: xxxxx-xxxx-xxxx
```

---

## Phase 7: Configure Custom Domains

### 7.1 If Domain is Already on Cloudflare

Custom domains are automatically configured when you deploy with `routes` in wrangler.toml. DNS records are created automatically.

### 7.2 If Using Cloudflare Pages Previously

Before deploying Workers with custom domains, **remove the domains from the Pages project**:

1. Go to Cloudflare Dashboard → Workers & Pages
2. Select your Pages project
3. Click **Custom domains** tab
4. Click **...** menu → **Remove** for each domain
5. Then deploy your Worker

### 7.3 Verify DNS Records

After deployment, verify DNS in Cloudflare Dashboard:
1. Go to your domain's DNS settings
2. You should see CNAME records pointing to your worker

---

## Phase 8: Set Secrets & Environment Variables

### 8.1 Understand Variable Types

| Type | When Set | Where Used | Example |
|------|----------|------------|---------|
| `NEXT_PUBLIC_*` | Build time | Client & Server | `NEXT_PUBLIC_API_URL` |
| Secrets | Runtime | Server only | `CLERK_SECRET_KEY` |

### 8.2 Set Runtime Secrets

```bash
# Production secrets
npx wrangler secret put CLERK_SECRET_KEY --env production
# Paste your secret when prompted

npx wrangler secret put DATABASE_URL --env production
# Paste your database URL when prompted

# Preview secrets
npx wrangler secret put CLERK_SECRET_KEY --env preview
npx wrangler secret put DATABASE_URL --env preview
```

### 8.3 List Secrets

```bash
npx wrangler secret list --env production
```

### 8.4 Build-time Variables

For `NEXT_PUBLIC_*` variables, set them before building:

```bash
# Option 1: Export in shell
export NEXT_PUBLIC_API_URL=https://api.yourdomain.com
npm run pages:build

# Option 2: Use .env.local (for local builds)
echo "NEXT_PUBLIC_API_URL=https://api.yourdomain.com" >> .env.local
npm run pages:build

# Option 3: In CI/CD (GitHub Actions)
env:
  NEXT_PUBLIC_API_URL: https://api.yourdomain.com
```

---

## Phase 9: Verify Deployment

### 9.1 Test HTTP Response

```bash
# Test production
curl -sI https://yourdomain.com | head -15

# Expected: HTTP/2 200
# Look for: x-opennext: 1, x-powered-by: Next.js
```

### 9.2 Test Preview

```bash
curl -sI https://develop.yourdomain.com | head -15
```

### 9.3 Check Logs (if issues)

```bash
npx wrangler tail --env production
# Shows real-time logs
```

### 9.4 Full Page Test

Open in browser:
- Production: https://yourdomain.com
- Preview: https://develop.yourdomain.com

Check:
- [ ] Homepage loads
- [ ] Navigation works
- [ ] Authentication works (if applicable)
- [ ] API routes respond
- [ ] No console errors

---

## Troubleshooting Checklist

### Build Failures

| Error | Solution |
|-------|----------|
| `loadManifest prefetch-hints.json` | Upgrade @opennextjs/cloudflare to 1.17.3+ |
| `SignInButton can only be used within ClerkProvider` | Add ClerkProvider to root layout |
| `Apollo Client error during prerender` | Use dynamic imports with `ssr: false` |
| `new_sqlite_classes migration required` | Use `new_sqlite_classes` instead of `new_classes` |
| `durable_objects not on env.X` | Add DO bindings to each environment section |

### Deployment Failures

| Error | Solution |
|-------|----------|
| `Hostname already has DNS records` | Remove domain from Pages project first |
| `Wildcard not allowed in Custom Domains` | Remove `/*` from pattern |
| `Worker size exceeds limit` | Upgrade to paid plan or reduce bundle size |

### Runtime Errors

| Error | Solution |
|-------|----------|
| 404 with empty body | Check secrets are set, check ClerkProvider |
| 500 errors | Run `npx wrangler tail` to see error logs |
| Clerk auth not working | Set CLERK_SECRET_KEY secret |

---

## Quick Command Reference

```bash
# Build
npm run pages:build

# Deploy production
npx wrangler deploy --env production

# Deploy preview
npx wrangler deploy --env preview

# Set secret
npx wrangler secret put SECRET_NAME --env production

# List secrets
npx wrangler secret list --env production

# View logs
npx wrangler tail --env production

# Local dev
npm run pages:preview

# Check Cloudflare auth
npx wrangler whoami
```

---

## CI/CD Integration (GitHub Actions)

Create `.github/workflows/deploy-cloudflare.yml`:

```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches: [main, develop]
    paths:
      - 'frontend/**'
  workflow_dispatch:

env:
  CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
  CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}

jobs:
  deploy:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./frontend

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Build OpenNext
        run: npm run pages:build
        env:
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${{ secrets.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY }}

      - name: Deploy to Production
        if: github.ref == 'refs/heads/main'
        run: npx wrangler deploy --env production

      - name: Deploy to Preview
        if: github.ref == 'refs/heads/develop'
        run: npx wrangler deploy --env preview
```

**Required GitHub Secrets:**
- `CLOUDFLARE_API_TOKEN` - Create at https://dash.cloudflare.com/profile/api-tokens
- `CLOUDFLARE_ACCOUNT_ID` - From `npx wrangler whoami`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Your Clerk publishable key

---

## Summary Checklist

Before deploying a new app, verify:

- [ ] Node.js 18+ installed
- [ ] Logged into Cloudflare (`npx wrangler login`)
- [ ] Domain on Cloudflare DNS
- [ ] @opennextjs/cloudflare installed
- [ ] wrangler installed
- [ ] open-next.config.ts created
- [ ] wrangler.toml configured with:
  - [ ] Correct app name
  - [ ] Durable Objects bindings
  - [ ] `new_sqlite_classes` migration
  - [ ] Custom domains in routes
  - [ ] Both production and preview environments
- [ ] ClerkProvider added (if using Clerk)
- [ ] Apollo components use dynamic imports (if using GraphQL)
- [ ] Build succeeds (`npm run pages:build`)
- [ ] Deployed to production and preview
- [ ] Secrets set for both environments
- [ ] Domains responding with HTTP 200

---

*Document created from Clara Code deployment - April 2026*
