# Next.js on Cloudflare Workers — Platform Standard

**Version:** 1.0.0
**Date:** 2026-04-13
**Status:** Active Standard
**Replaces:** Cloudflare Pages deployment pattern

> This is the Quik Nation platform standard for deploying any Next.js 15/16 app to Cloudflare Workers using OpenNext. Follow this document every time a new Heru is deployed to Cloudflare. Deviation from this standard requires explicit approval.

---

## Quick Reference

| Topic | Answer |
|---|---|
| Build command | `npx @opennextjs/cloudflare build` |
| Deploy command | `npx wrangler deploy` |
| Output entry point | `.open-next/worker.js` |
| Assets directory | `.open-next/assets` |
| wrangler.toml location | `frontend/wrangler.toml` |
| Config file | `frontend/open-next.config.ts` |
| Compatibility date | `2025-05-05` |
| Compatibility flag | `nodejs_compat` |
| Local dev port | `http://localhost:8788` |
| Secrets management | AWS SSM → `wrangler secret put` (never GitHub secrets) |
| `export const runtime = 'edge'` | REMOVE from every file — causes 500s |
| `wrangler pages deploy` | NEVER — breaks OpenNext sibling imports |
| Cloudflare Pages | NEVER for new Herus — Workers only |

---

## Confirmed Working Deployments

| Domain | Worker Name | Environment |
|---|---|---|
| claracode.ai | clara-code | production |
| www.claracode.ai | clara-code | production |
| develop.claracode.ai | clara-code-preview | preview |
| claraagents.com | claraagents | production |
| www.claraagents.com | claraagents | production |
| develop.claraagents.com | claraagents-preview | preview |

---

## Why Workers, Not Pages

The critical architectural insight that unlocks this entire pattern:

**OpenNext builds a `worker.js` that imports sibling directories from `.open-next/`** — specifically `cloudflare/`, `middleware/`, and `.build/`. When you run `wrangler pages deploy`, Cloudflare strips those sibling directories before deploying. The Worker crashes with 500s because the imports resolve to nothing.

When you run `wrangler deploy` (Workers), the full `.open-next/` tree is preserved exactly as OpenNext built it. Everything resolves. Everything works.

```
.open-next/
├── worker.js          ← entry point; imports its siblings
├── assets/            ← static files bound as ASSETS
├── cloudflare/        ← stripped by pages deploy, kept by workers deploy
├── middleware/        ← stripped by pages deploy, kept by workers deploy
└── .build/            ← stripped by pages deploy, kept by workers deploy
```

**Rule:** `wrangler deploy` only. `wrangler pages deploy` is banned for OpenNext projects.

---

## Common Causes of 500s

Understand these before you start. Each one will waste hours if you encounter it without context.

### 1. `export const runtime = 'edge'`

Any file containing this directive causes OpenNext to write an `app-edge-has-no-entrypoint` entry into the server manifest. OpenNext cannot load that route, and the Worker returns 500 for that path — and sometimes for all paths if the manifest loading itself fails.

**Fix:** Remove from every page, route handler, and layout file. There is no exception.

```bash
# Find all instances
grep -r "export const runtime" app/ --include="*.tsx" --include="*.ts" -l

# Remove all instances in one pass
grep -r "export const runtime" app/ --include="*.tsx" --include="*.ts" -l \
  | while read f; do sed -i '' '/^export const runtime/d' "$f"; done
```

### 2. Clerk middleware without a secret

If your middleware imports from `@clerk/nextjs/server` and `CLERK_SECRET_KEY` is not set as a Worker secret, the middleware throws on every request. The Worker returns 500 for all routes.

**Fix:** Set the secret before the first request reaches the Worker. See Phase 6.

### 3. Apollo Client instantiated at module level

`new ApolloClient()` at module level runs during Worker startup in the Cloudflare runtime, which does not support certain Node.js APIs that Apollo tries to access. The Worker fails to initialize.

**Fix:** Use a lazy singleton pattern. Never create the client until the first component render.

```typescript
// Wrong — module level
export const client = new ApolloClient({ ... })

// Correct — lazy singleton
let _client: ApolloClient<NormalizedCacheObject> | null = null

export function getApolloClient(): ApolloClient<NormalizedCacheObject> {
  if (!_client) {
    _client = new ApolloClient({
      uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
      cache: new InMemoryCache(),
    })
  }
  return _client
}
```

### 4. `import dynamic` and `export const dynamic` in the same file

Next.js uses both `import dynamic from 'next/dynamic'` (the function) and `export const dynamic = 'force-dynamic'` (the route config string). Having both in the same file without renaming the import causes a naming conflict that breaks the build or produces unexpected behavior.

**Fix:** Rename the import.

```typescript
// Wrong
import dynamic from 'next/dynamic'
export const dynamic = 'force-dynamic'

// Correct
import nextDynamic from 'next/dynamic'
export const dynamic = 'force-dynamic'
```

### 5. Apollo hooks in a page rendered server-side

Pages using Apollo Client hooks (`useQuery`, `useMutation`) cannot render on the server in the Cloudflare Workers runtime. They must be client components, and they must be dynamically imported with `ssr: false`.

**Fix:** Split into a page shell and a content component.

```typescript
// app/dashboard/page.tsx — the shell (no Apollo hooks)
import nextDynamic from 'next/dynamic'

const DashboardContent = nextDynamic(
  () => import('./DashboardContent'),
  { ssr: false }
)

export default function DashboardPage() {
  return <DashboardContent />
}
```

```typescript
// app/dashboard/DashboardContent.tsx — the real component
'use client'
import { useQuery } from '@apollo/client'
// ... rest of component
```

---

## Required Files

### `frontend/wrangler.toml`

Copy this template and replace `your-worker-name` and `yourdomain.com` with the actual values for the Heru.

```toml
# OpenNext for Cloudflare Workers
# Use `wrangler deploy` — NOT `wrangler pages deploy`.
# The worker.js imports sibling dirs (cloudflare/, middleware/, .build/) from .open-next/;
# pages deploy strips those siblings. Workers deploy keeps the full .open-next/ tree.

name = "your-worker-name"
main = ".open-next/worker.js"
compatibility_date = "2025-05-05"
compatibility_flags = ["nodejs_compat"]

[assets]
directory = ".open-next/assets"
binding = "ASSETS"

# Durable Objects required by OpenNext for ISR/caching
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

[env.production]
name = "your-worker-name"
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

[env.preview]
name = "your-worker-name-preview"
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

### `frontend/open-next.config.ts`

```typescript
import { defineCloudflareConfig } from '@opennextjs/cloudflare'
export default defineCloudflareConfig()
```

### `frontend/package.json` — scripts to add

```json
{
  "scripts": {
    "pages:build": "npx @opennextjs/cloudflare build",
    "pages:preview": "npx wrangler dev",
    "pages:deploy": "npx wrangler deploy",
    "pages:deploy:production": "npx wrangler deploy --env production",
    "pages:deploy:preview": "npx wrangler deploy --env preview"
  }
}
```

---

## Step-by-Step Deployment

### Phase 1 — Pre-flight

Install the required development dependencies from the `frontend/` directory.

```bash
cd frontend
npm install --save-dev @opennextjs/cloudflare@^1.19.1 wrangler@^4
```

Create `wrangler.toml` and `open-next.config.ts` using the templates above. Add the scripts to `package.json`.

Verify your `next.config.ts` does not explicitly set `output: 'standalone'` or `output: 'export'`. OpenNext handles the output format. Remove any such setting.

### Phase 2 — Code Fixes

Run the edge runtime removal pass first. Then manually audit any build errors that reference Apollo or dynamic imports.

```bash
# Remove export const runtime = 'edge' from all files
grep -r "export const runtime" app/ --include="*.tsx" --include="*.ts" -l \
  | while read f; do sed -i '' '/^export const runtime/d' "$f"; done

# Confirm nothing remains
grep -r "export const runtime" app/ --include="*.tsx" --include="*.ts"
```

For any page that uses Apollo Client hooks, split it into a shell and a `DashboardContent.tsx` (or equivalent) using the pattern shown in the Common Causes section above.

Check for the `import dynamic` / `export const dynamic` conflict in every file that uses both. Rename the import to `nextDynamic`.

### Phase 3 — Build

Run the OpenNext build from inside `frontend/`.

```bash
npm run pages:build
```

This is equivalent to `npx @opennextjs/cloudflare build`. It produces the `.open-next/` directory. A successful build ends with output similar to:

```
Build complete.
Output: frontend/.open-next/
Entry: frontend/.open-next/worker.js
```

Verify the entry point exists before proceeding.

```bash
ls -lh .open-next/worker.js
```

### Phase 4 — Local Test

```bash
npx wrangler dev
```

The local server runs at `http://localhost:8788`. Test the critical routes:

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:8788/
curl -s -o /dev/null -w "%{http_code}" http://localhost:8788/sign-in
curl -s -o /dev/null -w "%{http_code}" http://localhost:8788/dashboard
```

All should return 200 or the expected redirect codes. A 500 at this stage means a code fix is still needed — return to Phase 2.

### Phase 5 — Deploy

Deploy preview first. Verify it, then deploy production.

```bash
# Preview environment
npx wrangler deploy --env preview

# Production environment (only after preview is confirmed good)
npx wrangler deploy --env production
```

### Phase 6 — Set Secrets

Secrets are pulled from AWS SSM and piped directly to `wrangler secret put`. No secrets are stored in GitHub, environment files, or wrangler.toml. This is non-negotiable.

```bash
# Preview secrets
aws ssm get-parameter \
  --name '/quik-nation/shared/CLERK_PUBLISHABLE_KEY_DEVELOP' \
  --with-decryption --query 'Parameter.Value' --output text --region us-east-1 \
  | npx wrangler secret put NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY --env preview

aws ssm get-parameter \
  --name '/quik-nation/shared/CLERK_SECRET_KEY_DEVELOP' \
  --with-decryption --query 'Parameter.Value' --output text --region us-east-1 \
  | npx wrangler secret put CLERK_SECRET_KEY --env preview

# Production secrets (use prod SSM parameter names)
aws ssm get-parameter \
  --name '/quik-nation/shared/CLERK_PUBLISHABLE_KEY_PRODUCTION' \
  --with-decryption --query 'Parameter.Value' --output text --region us-east-1 \
  | npx wrangler secret put NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY --env production

aws ssm get-parameter \
  --name '/quik-nation/shared/CLERK_SECRET_KEY_PRODUCTION' \
  --with-decryption --query 'Parameter.Value' --output text --region us-east-1 \
  | npx wrangler secret put CLERK_SECRET_KEY --env production
```

Add any additional secrets your Heru requires using the same pattern — SSM parameter name → `wrangler secret put`.

### Phase 7 — Verify

```bash
# Preview
curl -s -o /dev/null -w "%{http_code}" https://develop.yourdomain.com/

# Production
curl -s -o /dev/null -w "%{http_code}" https://yourdomain.com/
curl -s -o /dev/null -w "%{http_code}" https://www.yourdomain.com/
```

All should return 200. If you see 500, check the Cloudflare dashboard → Workers → your worker → Logs for the specific error. The error message will point to one of the issues described in Common Causes above.

---

## Amplify Migration Path

For existing Herus running on AWS Amplify, migrate without downtime using this sequence.

1. Complete Phases 1 through 7 above with the Heru's new Worker.
2. Keep the Amplify app running and serving traffic until the Worker is confirmed live.
3. In the Cloudflare dashboard, go to your Worker → Settings → Domains & Routes → Add custom domain. Enter the production domain.
4. Cloudflare will guide you through DNS configuration. If the domain is already on Cloudflare DNS, this is instant. If not, update nameservers first.
5. Wait for DNS propagation. Test with `curl` using the `-v` flag to confirm the response is coming from Cloudflare (`cf-ray` header present).
6. Once the Worker is confirmed live and stable, delete the Amplify app to stop incurring cost.

Do not rush step 6. Let the Worker run for at least one full business day before removing Amplify.

---

## Things You Must Never Do

| Do not do this | Do this instead |
|---|---|
| `wrangler pages deploy` | `wrangler deploy` |
| `export const runtime = 'edge'` | Remove the directive entirely |
| Store secrets in GitHub Actions secrets | Pull from SSM and pipe to `wrangler secret put` |
| Use `cloudflare/pages-action@v1` in GH Actions | Deploy manually or via `wrangler deploy` in CI |
| Enable Cloudflare Workers Builds Git Integration for new projects | Deploy manually on every merge |
| Instantiate `new ApolloClient()` at module level | Use a lazy singleton |
| Use both `import dynamic` and `export const dynamic` in the same file | Rename the import to `nextDynamic` |
| Create Next.js apps on Cloudflare Pages | Always use Workers with this OpenNext pattern |

---

## CI/CD (GitHub Actions)

If you want automated deployments on merge, use `wrangler deploy` directly in your workflow. Do not use the deprecated `cloudflare/pages-action`.

```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches:
      - main       # triggers production deploy
      - develop    # triggers preview deploy

jobs:
  deploy:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build with OpenNext
        run: npm run pages:build

      - name: Deploy preview
        if: github.ref == 'refs/heads/develop'
        run: npx wrangler deploy --env preview
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}

      - name: Deploy production
        if: github.ref == 'refs/heads/main'
        run: npx wrangler deploy --env production
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

Note: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are infrastructure credentials, not application secrets. They are acceptable as GitHub Actions secrets. Application secrets (Clerk, GraphQL endpoints, etc.) must always flow through SSM → `wrangler secret put`, never through GitHub Actions secrets.

---

## Dependency Reference

| Package | Version | Purpose |
|---|---|---|
| `@opennextjs/cloudflare` | `^1.19.1` | OpenNext adapter for Cloudflare Workers |
| `wrangler` | `^4` | Cloudflare CLI for deploy and dev |

Both are `devDependencies`. They are not needed at runtime.

---

## Document History

| Date | Change |
|---|---|
| 2026-04-13 | Initial standard, derived from claracode.ai and claraagents.com deployments |
