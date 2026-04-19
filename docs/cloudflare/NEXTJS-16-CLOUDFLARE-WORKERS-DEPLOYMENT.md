# Deploying Next.js 16 to Cloudflare Workers with OpenNext

> Complete guide for deploying Next.js 16.x applications to Cloudflare Workers using OpenNext. Includes setup, configuration, custom domains, and troubleshooting.

**Last Updated:** April 2026  
**Next.js Version:** 16.2.3  
**OpenNext Version:** 1.19.1+  
**Tested With:** Cloudflare Workers Free & Paid Plans

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Initial Setup](#initial-setup)
4. [Configuration Files](#configuration-files)
5. [Environment Variables & Secrets](#environment-variables--secrets)
6. [Building & Deploying](#building--deploying)
7. [Custom Domains](#custom-domains)
8. [Multi-Environment Setup](#multi-environment-setup)
9. [Common Issues & Solutions](#common-issues--solutions)
10. [Migration from AWS Amplify](#migration-from-aws-amplify)
11. [Upgrading from Next.js 15.x](#upgrading-from-nextjs-15x)

---

## Overview

### Why Cloudflare Workers + OpenNext?

| Feature | Cloudflare Pages | Cloudflare Workers + OpenNext |
|---------|-----------------|------------------------------|
| Static Sites | ✅ Excellent | ✅ Good |
| SSR | ⚠️ Limited | ✅ Full Support |
| ISR (Incremental Static Regeneration) | ❌ No | ✅ Yes (via Durable Objects) |
| Middleware | ⚠️ Basic | ✅ Full Support |
| API Routes | ⚠️ Functions | ✅ Native |
| Edge Runtime | ✅ Yes | ✅ Yes |
| Next.js 16 Support | ⚠️ Partial | ✅ Full |

**Recommendation:** Use Workers + OpenNext for any Next.js app that requires:
- Server-side rendering (SSR)
- Incremental Static Regeneration (ISR)
- Complex middleware
- API routes with database connections

---

## Prerequisites

### Required Tools

```bash
# Node.js 18+ (22+ recommended)
node --version  # v22.x or higher

# npm 9+
npm --version

# Wrangler CLI (installed locally via npm)
npx wrangler --version  # 4.80+
```

### Cloudflare Account Setup

1. Create a Cloudflare account at https://dash.cloudflare.com
2. Login via wrangler:
   ```bash
   npx wrangler login
   ```
3. Verify authentication:
   ```bash
   npx wrangler whoami
   ```

### Required Permissions

Your Cloudflare API token needs these scopes:
- `workers:write` - Deploy workers
- `workers_kv:write` - KV storage (optional)
- `d1:write` - D1 database (optional)
- `zone:read` - Custom domains

---

## Initial Setup

### 1. Install Dependencies

```bash
cd your-nextjs-app

# Install OpenNext for Cloudflare
npm install -D @opennextjs/cloudflare wrangler

# Verify installation
npx wrangler --version
```

### 2. Add Build Scripts

Update `package.json`:

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

### 3. Create OpenNext Config

Create `open-next.config.ts` in your app root:

```typescript
import { defineCloudflareConfig } from '@opennextjs/cloudflare'

export default defineCloudflareConfig()
```

---

## Configuration Files

### wrangler.toml (Complete Example)

Create `wrangler.toml` in your Next.js app directory:

```toml
# OpenNext for Cloudflare Workers
# Deploy with: npx wrangler deploy --env production
# Preview with: npx wrangler dev

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

# Migration for Durable Objects (use new_sqlite_classes for free plan)
[[migrations]]
tag = "v1"
new_sqlite_classes = ["DOQueueHandler", "DOShardedTagCache", "BucketCachePurge"]

# Production environment
[env.production]
name = "your-app-name"

[[env.production.durable_objects.bindings]]
name = "NEXT_CACHE_DO_QUEUE"
class_name = "DOQueueHandler"

[[env.production.durable_objects.bindings]]
name = "NEXT_TAG_CACHE_DO_SHARDED"
class_name = "DOShardedTagCache"

[[env.production.durable_objects.bindings]]
name = "BUCKET_CACHE_PURGE"
class_name = "BucketCachePurge"

# Preview/Development environment
[env.preview]
name = "your-app-name-preview"

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

### Key Configuration Notes

1. **`compatibility_date`**: Use `2025-05-05` or later for `FinalizationRegistry` support
2. **`new_sqlite_classes`**: Required for Cloudflare Free plan (not `new_classes`)
3. **Durable Objects**: Must be defined in BOTH top-level AND each environment
4. **`nodejs_compat`**: Required for Node.js API compatibility

---

## Environment Variables & Secrets

### Build-time Variables

Variables prefixed with `NEXT_PUBLIC_` are embedded at build time:

```bash
# Set in your CI/CD or local .env.local
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
```

### Runtime Secrets

Secrets are set via wrangler and available at runtime:

```bash
# Set secrets for production
npx wrangler secret put CLERK_SECRET_KEY --env production
npx wrangler secret put DATABASE_URL --env production

# Set secrets for preview
npx wrangler secret put CLERK_SECRET_KEY --env preview
npx wrangler secret put DATABASE_URL --env preview

# List secrets
npx wrangler secret list --env production
```

### Accessing Secrets in Code

Secrets are available via `process.env` in server-side code:

```typescript
// app/api/example/route.ts
export async function GET() {
  const secret = process.env.CLERK_SECRET_KEY
  // Use secret...
}
```

---

## Building & Deploying

### Build Process

```bash
# 1. Build the OpenNext bundle
npm run pages:build

# This creates:
# .open-next/
# ├── worker.js          # Main worker entry
# ├── assets/            # Static assets
# ├── .build/            # Build artifacts
# ├── cloudflare/        # Cloudflare-specific code
# ├── middleware/        # Middleware handler
# └── server-functions/  # SSR functions
```

### Deploy to Production

```bash
# Deploy to production environment
npx wrangler deploy --env production

# Output:
# Deployed your-app-name
# https://your-app-name.your-subdomain.workers.dev
```

### Deploy to Preview

```bash
# Deploy to preview environment
npx wrangler deploy --env preview

# Output:
# Deployed your-app-name-preview
# https://your-app-name-preview.your-subdomain.workers.dev
```

### Local Development

```bash
# Run locally with wrangler (uses production-like environment)
npm run pages:preview

# Or use Next.js dev server (faster, but not identical to production)
npm run dev
```

---

## Custom Domains

### Adding Custom Domains via CLI

After your Worker is deployed, add custom domains:

```bash
# Add production domain
npx wrangler deployments triggers --env production \
  --x-custom-domains example.com www.example.com

# Add preview domain
npx wrangler deployments triggers --env preview \
  --x-custom-domains develop.example.com
```

### Adding Custom Domains via Dashboard

1. Go to **Workers & Pages** → Your Worker
2. Click **Triggers** tab
3. Under **Custom Domains**, click **Add Custom Domain**
4. Enter your domain (e.g., `example.com`)
5. Cloudflare auto-configures DNS if your domain is on Cloudflare

### DNS Configuration

If your domain is on Cloudflare:
- Custom domains auto-configure DNS
- SSL certificates are automatic

If your domain is external:
- Add a CNAME record pointing to `your-worker.your-subdomain.workers.dev`
- Or use Cloudflare as your DNS provider (recommended)

### Routes vs Custom Domains

| Method | Use Case | SSL | DNS |
|--------|----------|-----|-----|
| Custom Domains | Production sites | Auto | Auto |
| Routes | Advanced routing | Manual | Manual |
| workers.dev | Testing | Auto | N/A |

---

## Multi-Environment Setup

### Recommended Branch Strategy

```
main branch      → production   → example.com
develop branch   → preview      → develop.example.com
feature branches → PR previews  → pr-123.example.com (optional)
```

### CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
  CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build OpenNext
        run: npm run pages:build
        working-directory: ./frontend  # if monorepo
      
      - name: Deploy to Production
        if: github.ref == 'refs/heads/main'
        run: npx wrangler deploy --env production
        working-directory: ./frontend
      
      - name: Deploy to Preview
        if: github.ref == 'refs/heads/develop'
        run: npx wrangler deploy --env preview
        working-directory: ./frontend
```

---

## Common Issues & Solutions

### Issue: "new_sqlite_classes migration required" (Error 10097)

**Cause:** Cloudflare Free plan requires SQLite-backed Durable Objects.

**Solution:** Change `new_classes` to `new_sqlite_classes` in wrangler.toml:

```toml
[[migrations]]
tag = "v1"
new_sqlite_classes = ["DOQueueHandler", "DOShardedTagCache", "BucketCachePurge"]
```

### Issue: "Unexpected loadManifest prefetch-hints.json" (Error 1101)

**Cause:** Next.js 16.2.0+ incompatibility with older OpenNext versions.

**Solution:** Upgrade to @opennextjs/cloudflare 1.17.3+:

```bash
npm install -D @opennextjs/cloudflare@latest
```

### Issue: Apollo Client / GraphQL errors during build

**Cause:** Apollo Client tries to make requests during static generation.

**Solution:** Use dynamic imports with `ssr: false`:

```typescript
// page.tsx
'use client'

import dynamic from 'next/dynamic'

const Content = dynamic(() => import('./Content'), { ssr: false })

export default function Page() {
  return <Content />
}
```

### Issue: Clerk "SignInButton can only be used within ClerkProvider"

**Cause:** ClerkProvider not wrapping the app during static generation.

**Solution:** Add ClerkProvider to root layout:

```typescript
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html><body>{children}</body></html>
    </ClerkProvider>
  )
}
```

### Issue: "durable_objects exists at top level but not on env"

**Cause:** Durable Objects must be defined in each environment.

**Solution:** Add DO bindings to each `[env.X]` section (see wrangler.toml example above).

### Issue: Worker size exceeds 3MB / 10MB limit

**Cause:** Bundle too large for Cloudflare limits.

**Solutions:**
1. Upgrade to Workers Paid plan (10MB limit)
2. Analyze bundle: `npx esbuild-bundle-analyzer .open-next/server-functions/default/handler.mjs.meta.json`
3. Remove unused dependencies
4. Use dynamic imports for large libraries

### Issue: 404 responses with empty body

**Cause:** Missing environment variables or Clerk configuration.

**Solution:** 
1. Set all required secrets: `npx wrangler secret list --env production`
2. Ensure `NEXT_PUBLIC_*` vars are set at build time
3. Check Worker logs: `npx wrangler tail --env production`

---

## Migration from AWS Amplify

### Step-by-Step Migration

1. **Export Environment Variables**
   ```bash
   # List Amplify env vars
   aws amplify get-app --app-id YOUR_APP_ID --query 'app.environmentVariables'
   ```

2. **Update next.config.ts**
   ```typescript
   // Remove Amplify-specific config
   const nextConfig: NextConfig = {
     // Remove: output: 'standalone'
     // Remove: experimental.serverActions (now default in Next 16)
   }
   ```

3. **Remove Amplify Dependencies**
   ```bash
   npm uninstall @aws-amplify/cli aws-amplify
   ```

4. **Add OpenNext Dependencies**
   ```bash
   npm install -D @opennextjs/cloudflare wrangler
   ```

5. **Create Cloudflare Config Files**
   - `wrangler.toml` (see above)
   - `open-next.config.ts` (see above)

6. **Update CI/CD**
   - Replace Amplify build settings with GitHub Actions (see above)
   - Or use Cloudflare's GitHub integration

7. **DNS Migration**
   - Point domain to Cloudflare (if not already)
   - Or update CNAME to point to workers.dev

---

## Upgrading from Next.js 15.x

See [NEXTJS-15-TO-16-UPGRADE-GUIDE.md](./NEXTJS-15-TO-16-UPGRADE-GUIDE.md) for the complete upgrade guide.

### Quick Checklist

- [ ] Update Next.js: `npm install next@16.2.3 react@19 react-dom@19`
- [ ] Update @opennextjs/cloudflare to 1.17.3+
- [ ] Update compatibility_date to `2025-05-05`
- [ ] Fix any `'use client'` / dynamic import issues
- [ ] Test build: `npm run pages:build`
- [ ] Test locally: `npm run pages:preview`
- [ ] Deploy to preview first

---

## Quick Reference

### Commands Cheat Sheet

```bash
# Login to Cloudflare
npx wrangler login

# Build OpenNext bundle
npm run pages:build

# Deploy to production
npx wrangler deploy --env production

# Deploy to preview
npx wrangler deploy --env preview

# Set secret
npx wrangler secret put SECRET_NAME --env production

# List secrets
npx wrangler secret list --env production

# View logs
npx wrangler tail --env production

# Local development
npx wrangler dev
```

### File Structure

```
your-app/
├── app/                    # Next.js App Router
├── public/                 # Static files
├── .open-next/            # Generated (gitignored)
├── open-next.config.ts    # OpenNext config
├── wrangler.toml          # Cloudflare config
├── next.config.ts         # Next.js config
└── package.json
```

### Required wrangler.toml for Next.js 16

```toml
name = "your-app"
main = ".open-next/worker.js"
compatibility_date = "2025-05-05"
compatibility_flags = ["nodejs_compat"]

[assets]
directory = ".open-next/assets"
binding = "ASSETS"

[[durable_objects.bindings]]
name = "NEXT_CACHE_DO_QUEUE"
class_name = "DOQueueHandler"

[[durable_objects.bindings]]
name = "NEXT_TAG_CACHE_DO_SHARDED"
class_name = "DOShardedTagCache"

[[durable_objects.bindings]]
name = "BUCKET_CACHE_PURGE"
class_name = "BucketCachePurge"

[[migrations]]
tag = "v1"
new_sqlite_classes = ["DOQueueHandler", "DOShardedTagCache", "BucketCachePurge"]
```

---

## Support & Resources

- [OpenNext Documentation](https://opennext.js.org/cloudflare)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Next.js 16 Documentation](https://nextjs.org/docs)
- [OpenNext GitHub Issues](https://github.com/opennextjs/opennextjs-cloudflare/issues)

---

*Document maintained by the Clara Code team. For updates, check the repository.*
