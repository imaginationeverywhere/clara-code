# /cloudflare-workers-setup — Deploy a Next.js Heru to Cloudflare Workers

Sets up Cloudflare Workers deployment for any Next.js 15/16 Heru using OpenNext.
This is the **platform standard** — established from deploying claracode.ai and claraagents.com on April 13, 2026.

**NOT Cloudflare Pages.** Workers only. See `docs/cloudflare/NEXTJS-CLOUDFLARE-WORKERS-DEPLOYMENT.md`.

## Usage
```
/cloudflare-workers-setup <worker-name> <production-domain> [preview-domain]
```

**Examples:**
```
/cloudflare-workers-setup claraagents claraagents.com develop.claraagents.com
/cloudflare-workers-setup clara-code claracode.ai develop.claracode.ai
/cloudflare-workers-setup quiknation quiknation.com develop.quiknation.com
```

**Arguments:**
- `<worker-name>` — Cloudflare Worker name (no spaces, use hyphens). Production worker = this name. Preview worker = `<name>-preview`.
- `<production-domain>` — Primary domain (e.g. `claraagents.com`). Automatically adds `www.<domain>` too.
- `[preview-domain]` — Optional preview domain (default: `develop.<production-domain>`).

---

## Execution Steps

When this command is invoked, execute ALL steps in order.

### Step 0: Confirm Arguments

Parse the arguments. Set variables:
```
WORKER_NAME = <worker-name>           # e.g. claraagents
PROD_DOMAIN = <production-domain>     # e.g. claraagents.com
PREVIEW_DOMAIN = <preview-domain>     # e.g. develop.claraagents.com
FRONTEND_DIR = frontend/              # default, check if it exists — else use ./
```

If `PREVIEW_DOMAIN` not provided, default to `develop.<PROD_DOMAIN>`.

Check the frontend directory exists:
```bash
ls <FRONTEND_DIR>/package.json 2>/dev/null || ls package.json
```

Report back: "Setting up Cloudflare Workers for `<WORKER_NAME>` → `<PROD_DOMAIN>` / `<PREVIEW_DOMAIN>`"

### Step 1: Install Dependencies

```bash
cd <FRONTEND_DIR>
npm install --save-dev @opennextjs/cloudflare@^1.19.1 wrangler@^4
```

Verify:
```bash
cat package.json | grep -E '"@opennextjs|"wrangler"'
```

### Step 2: Create `wrangler.toml`

Create `<FRONTEND_DIR>/wrangler.toml`:

```toml
# OpenNext for Cloudflare Workers — use `wrangler deploy`, NOT `wrangler pages deploy`.
# The worker.js imports sibling dirs (cloudflare/, middleware/, .build/) from .open-next/;
# pages deploy strips those siblings. Workers deploy keeps the full .open-next/ tree.
# https://opennext.js.org/cloudflare/get-started
name = "<WORKER_NAME>"
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
name = "<WORKER_NAME>"
routes = [
  { pattern = "<PROD_DOMAIN>", custom_domain = true },
  { pattern = "www.<PROD_DOMAIN>", custom_domain = true }
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
name = "<WORKER_NAME>-preview"
routes = [
  { pattern = "<PREVIEW_DOMAIN>", custom_domain = true }
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

Replace `<WORKER_NAME>`, `<PROD_DOMAIN>`, `<PREVIEW_DOMAIN>` with actual values.

### Step 3: Create `open-next.config.ts`

Create `<FRONTEND_DIR>/open-next.config.ts`:

```ts
import { defineCloudflareConfig } from '@opennextjs/cloudflare'

export default defineCloudflareConfig()
```

### Step 4: Add Scripts to `package.json`

Add to the `scripts` section of `<FRONTEND_DIR>/package.json`:

```json
"pages:build": "npx @opennextjs/cloudflare build",
"pages:preview": "npx wrangler dev",
"pages:deploy": "npx wrangler deploy",
"pages:deploy:production": "npx wrangler deploy --env production",
"pages:deploy:preview": "npx wrangler deploy --env preview"
```

### Step 5: Remove `export const runtime = 'edge'`

**CRITICAL** — This line causes `app-edge-has-no-entrypoint` in the manifest and a 500 on every request. OpenNext handles edge routing automatically; do not declare it in source files.

```bash
cd <FRONTEND_DIR>
grep -r "export const runtime" app/ src/ --include="*.tsx" --include="*.ts" -l 2>/dev/null | while read f; do
  sed -i '' '/^export const runtime/d' "$f"
  echo "  cleaned: $f"
done
```

Report how many files were cleaned.

### Step 6: Check for Apollo Client Issues

If the project uses Apollo Client, check for module-level instantiation:

```bash
grep -r "new ApolloClient\|new InMemoryCache" <FRONTEND_DIR>/app <FRONTEND_DIR>/src --include="*.ts" --include="*.tsx" -l 2>/dev/null
```

If found, warn: "Apollo Client is instantiated at module level in these files — this will crash during Next.js prerendering. Use lazy singleton pattern (see `lib/apollo/client.ts` in claracode repo) and wrap Apollo hooks in components loaded with `next/dynamic({ ssr: false })`."

### Step 7: Build

```bash
cd <FRONTEND_DIR>
npm run pages:build
```

Watch for:
- `Worker saved in .open-next/worker.js 🚀` = success
- Any TypeScript/build errors = fix before proceeding
- `app-edge-has-no-entrypoint` in the build output = Step 5 was incomplete, re-run it

### Step 8: Local Test

```bash
cd <FRONTEND_DIR>
npx wrangler dev --port 8788 &
WPID=$!
sleep 7
curl -s -o /dev/null -w "/ → %{http_code}\n" http://localhost:8788/
kill $WPID 2>/dev/null
```

If 200 → proceed. If 500 → read the wrangler dev output carefully for the stack trace.

### Step 9: Deploy Preview

```bash
cd <FRONTEND_DIR>
npx wrangler deploy --env preview
```

Expected output:
```
Deployed <WORKER_NAME>-preview triggers
  <PREVIEW_DOMAIN> (custom domain)
Current Version ID: xxxx
```

### Step 10: Deploy Production

```bash
cd <FRONTEND_DIR>
npx wrangler deploy --env production
```

Expected output:
```
Deployed <WORKER_NAME> triggers
  <PROD_DOMAIN> (custom domain)
  www.<PROD_DOMAIN> (custom domain)
Current Version ID: xxxx
```

### Step 11: Set Clerk Secrets (if project uses Clerk)

Pull from SSM — **never use GitHub secrets or hardcode keys**.

```bash
cd <FRONTEND_DIR>

# Pull from SSM
PUBLISHABLE=$(aws ssm get-parameter \
  --name '/quik-nation/shared/CLERK_PUBLISHABLE_KEY_DEVELOP' \
  --with-decryption --query 'Parameter.Value' --output text --region us-east-1)

SECRET=$(aws ssm get-parameter \
  --name '/quik-nation/shared/CLERK_SECRET_KEY_DEVELOP' \
  --with-decryption --query 'Parameter.Value' --output text --region us-east-1)

# Set for preview
echo "$PUBLISHABLE" | npx wrangler secret put NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY --env preview
echo "$SECRET" | npx wrangler secret put CLERK_SECRET_KEY --env preview

# Set for production (use prod keys when available, dev keys as fallback)
echo "$PUBLISHABLE" | npx wrangler secret put NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY --env production
echo "$SECRET" | npx wrangler secret put CLERK_SECRET_KEY --env production
```

For production Clerk keys when available:
```bash
# Production Clerk keys (separate Clerk app)
PROD_PK=$(aws ssm get-parameter --name '/quik-nation/<heru>/CLERK_PUBLISHABLE_KEY_PRODUCTION' ...)
PROD_SK=$(aws ssm get-parameter --name '/quik-nation/<heru>/CLERK_SECRET_KEY_PRODUCTION' ...)
echo "$PROD_PK" | npx wrangler secret put NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY --env production
echo "$PROD_SK" | npx wrangler secret put CLERK_SECRET_KEY --env production
```

### Step 12: Verify Live

```bash
curl -s -o /dev/null -w "<PROD_DOMAIN>: %{http_code}\n" https://<PROD_DOMAIN>/
curl -s -o /dev/null -w "<PREVIEW_DOMAIN>: %{http_code}\n" https://<PREVIEW_DOMAIN>/
```

Both should return 200. If 500, check:
1. Are Clerk secrets set? (`npx wrangler secret list --env production`)
2. Is there still `export const runtime = 'edge'` somewhere? (re-run Step 5)
3. Run `npx wrangler tail --env production` and curl the URL to see live Worker logs

### Step 13: Commit

```bash
git add <FRONTEND_DIR>/wrangler.toml \
        <FRONTEND_DIR>/open-next.config.ts \
        <FRONTEND_DIR>/package.json \
        <FRONTEND_DIR>/package-lock.json \
        <FRONTEND_DIR>/app/    # cleaned runtime= files

git commit -m "feat(infra): add Cloudflare Workers deployment — <WORKER_NAME>

- wrangler.toml: Workers deploy, nodejs_compat, DO bindings, multi-env
- open-next.config.ts: defineCloudflareConfig()
- Remove export const runtime = 'edge' from all pages/routes
- Add pages:build / pages:deploy scripts
- Live: <PROD_DOMAIN> (production), <PREVIEW_DOMAIN> (preview)
- Secrets set via wrangler secret put (SSM-sourced)"

git push origin develop
```

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `app-edge-has-no-entrypoint` | `export const runtime = 'edge'` in source | Re-run Step 5 grep+sed |
| 500 after deploy | Clerk middleware crash (no keys) | Run Step 11 |
| Worker startup 500, no Clerk | Apollo new ApolloClient() at module level | Lazy singleton + next/dynamic ssr:false |
| `wrangler pages deploy` fails | Wrong command — this is Workers, not Pages | Use `wrangler deploy` (no `pages`) |
| Custom domain not attaching | Domain already attached elsewhere | Remove old attachment in CF dashboard first |
| Build fails: cannot find module | Missing dep | `npm install` in frontend/ |

---

## NEVER DO

- `wrangler pages deploy` — breaks OpenNext sibling imports → 500
- `export const runtime = 'edge'` in any page/route/layout
- GitHub secrets for Clerk/API keys — SSM only, piped to `wrangler secret put`
- `cloudflare/pages-action@v1` in GH Actions — deprecated for this pattern
- Module-level `new ApolloClient()` — crashes during Next.js prerender

---

## Reference

- Platform standard doc: `docs/cloudflare/NEXTJS-CLOUDFLARE-WORKERS-DEPLOYMENT.md`
- Deployed examples: claracode.ai (clara-code worker), claraagents.com (claraagents worker)
- OpenNext docs: https://opennext.js.org/cloudflare/get-started
