# /cloudflare-workers-setup — Deploy a Next.js Heru to Cloudflare Workers

Sets up Cloudflare Workers deployment for any Next.js 15/16 Heru using OpenNext.
This is the **platform standard** — established from deploying claracode.ai and claraagents.com on April 13, 2026.

**NOT Cloudflare Pages.** Workers only. See `docs/cloudflare/NEXTJS-CLOUDFLARE-WORKERS-DEPLOYMENT.md`.

---

## Usage

```
/cloudflare-workers-setup <worker-name> <production-domain> [preview-domain] [--from-amplify | --from-pages | --from-vercel | --new]
```

### Migration Mode Flags (pick one — default is `--new`)

| Flag | When to use |
|------|-------------|
| `--new` | Brand new Heru, no prior deployment (default) |
| `--from-amplify` | Existing Heru currently live on AWS Amplify |
| `--from-pages` | Existing Heru on Cloudflare Pages (claracode/claraagents pattern) |
| `--from-vercel` | Existing Heru deployed on Vercel |

### Examples

```bash
# New project, never deployed
/cloudflare-workers-setup quiknation quiknation.com develop.quiknation.com --new

# Migrating from Amplify (most common for existing Herus)
/cloudflare-workers-setup site962 site962.com develop.site962.com --from-amplify

# Migrating from Cloudflare Pages (what we did for claracode + claraagents)
/cloudflare-workers-setup claraagents claraagents.com develop.claraagents.com --from-pages

# Migrating from Vercel
/cloudflare-workers-setup dreamihaircare dreamihaircare.com develop.dreamihaircare.com --from-vercel
```

### Arguments

- `<worker-name>` — Cloudflare Worker name (hyphens, no spaces). Preview worker = `<name>-preview`.
- `<production-domain>` — Primary domain. `www.<domain>` is added automatically.
- `[preview-domain]` — Defaults to `develop.<production-domain>` if omitted.
- `[--flag]` — Migration mode. Defaults to `--new`.

---

## Phase 0: Pre-Flight (ALL MODES)

Parse arguments and set variables:
```
WORKER_NAME   = <worker-name>
PROD_DOMAIN   = <production-domain>
PREVIEW_DOMAIN = <preview-domain> (or develop.<PROD_DOMAIN>)
MODE          = --new | --from-amplify | --from-pages | --from-vercel
FRONTEND_DIR  = frontend/ (check if exists, else ./)
```

Detect `FRONTEND_DIR`:
```bash
[ -f "frontend/package.json" ] && FRONTEND_DIR="frontend" || FRONTEND_DIR="."
```

Report:
```
Mode:     <MODE>
Worker:   <WORKER_NAME> (production) / <WORKER_NAME>-preview (preview)
Domains:  <PROD_DOMAIN>, www.<PROD_DOMAIN> (production)
          <PREVIEW_DOMAIN> (preview)
Frontend: <FRONTEND_DIR>/
```

---

## Phase 1: Platform-Specific Pre-Work

**Run ONLY the section matching the mode flag. Skip all others.**

---

### MODE: `--new` (No prior deployment)

No pre-work needed. Proceed directly to Phase 2.

---

### MODE: `--from-amplify`

**Goal: Keep Amplify live during migration. Cut over AFTER Worker is verified.**

#### Step A: Inventory the Amplify app

```bash
# Find the Amplify app ID
aws amplify list-apps --region us-east-1 --query 'apps[*].{name:name,appId:appId}' --output table

# Get environment variables currently set in Amplify
aws amplify get-app --app-id <APP_ID> --region us-east-1 \
  --query 'app.environmentVariables' --output table
```

Note every env var — you will need to migrate them to Worker secrets in Phase 3.

#### Step B: Archive amplify.yml

```bash
# Keep amplify.yml as a record but rename it
cp amplify.yml amplify.yml.bak
```

Do NOT delete it yet — it's your rollback reference.

#### Step C: Check GH Actions Amplify workflows

```bash
ls .github/workflows/ | grep -i amplify
```

If any Amplify-triggered workflows exist, note them. You will disable them AFTER the Worker is verified live (Phase 4, Step F). Do NOT disable now — Amplify is still the live backend.

#### Step D: Migrate env vars to SSM (if not already there)

For any Amplify env var that is NOT already in SSM:
```bash
aws ssm put-parameter \
  --name "/quik-nation/<heru-name>/<VAR_NAME>" \
  --value "<value>" \
  --type SecureString \
  --region us-east-1
```

#### → Proceed to Phase 2.

---

### MODE: `--from-pages`

**Goal: Remove custom domains from CF Pages BEFORE deploying the Worker.**
(CF cannot attach a custom domain to a Worker if it's already attached to a Pages project.)

This is exactly what was done for `claracode.ai` and `claraagents.com` on April 13, 2026.

#### Step A: Remove custom domains from CF Pages

In the Cloudflare dashboard:
1. Go to Workers & Pages → select the Pages project (e.g. `claraagents`)
2. Settings → Custom Domains
3. Remove `<PROD_DOMAIN>`, `www.<PROD_DOMAIN>`, and `<PREVIEW_DOMAIN>`

Verify they are gone:
```bash
# After removal, this should return no custom domain entries
npx wrangler pages project list 2>/dev/null | grep "<PROD_DOMAIN>"
```

#### Step B: Note the Pages project name

```bash
# Save the old Pages project name for cleanup later
OLD_PAGES_PROJECT="<pages-project-name>"  # e.g. claraagents
```

#### Step C: Check if GH Actions uses Pages deploy

```bash
grep -r "wrangler pages\|cloudflare/pages-action\|CLOUDFLARE_PAGES" .github/workflows/ 2>/dev/null
```

If found, you will disable/replace these workflows in Phase 4, Step F.

#### → Proceed to Phase 2.

---

### MODE: `--from-vercel`

**Goal: Keep Vercel live during migration. Cut over AFTER Worker is verified.**

#### Step A: Check Vercel env vars

```bash
# List what's set in Vercel (if vercel CLI is available)
vercel env ls 2>/dev/null || echo "Check Vercel dashboard for env vars"
```

Note every env var — migrate any not in SSM to SSM (same as Amplify Step D above).

#### Step B: Keep vercel.json as reference

```bash
cp vercel.json vercel.json.bak 2>/dev/null || true
```

#### Step C: Note any Vercel-specific config in next.config

```bash
grep -n "output\|serverless\|edge\|vercel" frontend/next.config.* 2>/dev/null || \
grep -n "output\|serverless\|edge\|vercel" next.config.* 2>/dev/null
```

Remove any `output: 'standalone'` or `output: 'export'` — these conflict with OpenNext.

#### → Proceed to Phase 2.

---

## Phase 2: Install & Configure

These steps apply to ALL modes.

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

### Step 3: Create `open-next.config.ts`

```ts
import { defineCloudflareConfig } from '@opennextjs/cloudflare'

export default defineCloudflareConfig()
```

### Step 4: Add Scripts to `package.json`

```json
"pages:build": "npx @opennextjs/cloudflare build",
"pages:preview": "npx wrangler dev",
"pages:deploy": "npx wrangler deploy",
"pages:deploy:production": "npx wrangler deploy --env production",
"pages:deploy:preview": "npx wrangler deploy --env preview"
```

### Step 5: Remove `export const runtime = 'edge'`

**CRITICAL** — causes `app-edge-has-no-entrypoint` and a 500 on every request.

```bash
cd <FRONTEND_DIR>
grep -r "export const runtime" app/ src/ --include="*.tsx" --include="*.ts" -l 2>/dev/null | while read f; do
  sed -i '' '/^export const runtime/d' "$f"
  echo "  cleaned: $f"
done
```

### Step 6: Check for Apollo Client Issues

```bash
grep -r "new ApolloClient\|new InMemoryCache" <FRONTEND_DIR>/app <FRONTEND_DIR>/src \
  --include="*.ts" --include="*.tsx" -l 2>/dev/null
```

If found: wrap Apollo hooks in components loaded with `next/dynamic({ ssr: false })` and use lazy singleton pattern for the client.

---

## Phase 3: Build, Test & Deploy

### Step 7: Build

```bash
cd <FRONTEND_DIR>
npm run pages:build
```

`Worker saved in .open-next/worker.js 🚀` = success. Any other terminal state = fix before proceeding.

### Step 8: Local Test

```bash
cd <FRONTEND_DIR>
npx wrangler dev --port 8788 &
WPID=$!
sleep 7
curl -s -o /dev/null -w "/ → %{http_code}\n" http://localhost:8788/
kill $WPID 2>/dev/null
```

200 = proceed. 500 = read wrangler dev stack trace before continuing.

### Step 9: Deploy Preview

```bash
cd <FRONTEND_DIR>
npx wrangler deploy --env preview
```

### Step 10: Deploy Production

```bash
cd <FRONTEND_DIR>
npx wrangler deploy --env production
```

### Step 11: Set Secrets (Clerk + any migrated env vars)

```bash
cd <FRONTEND_DIR>

# Clerk dev keys from SSM
PUBLISHABLE=$(aws ssm get-parameter \
  --name '/quik-nation/shared/CLERK_PUBLISHABLE_KEY_DEVELOP' \
  --with-decryption --query 'Parameter.Value' --output text --region us-east-1)
SECRET=$(aws ssm get-parameter \
  --name '/quik-nation/shared/CLERK_SECRET_KEY_DEVELOP' \
  --with-decryption --query 'Parameter.Value' --output text --region us-east-1)

echo "$PUBLISHABLE" | npx wrangler secret put NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY --env preview
echo "$SECRET"      | npx wrangler secret put CLERK_SECRET_KEY --env preview
echo "$PUBLISHABLE" | npx wrangler secret put NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY --env production
echo "$SECRET"      | npx wrangler secret put CLERK_SECRET_KEY --env production

# For any other env vars migrated from Amplify/Vercel:
# aws ssm get-parameter --name '/quik-nation/<heru>/<VAR>' --with-decryption --query 'Parameter.Value' \
#   --output text --region us-east-1 | npx wrangler secret put <VAR_NAME> --env production
```

### Step 12: Verify Live

```bash
curl -s -o /dev/null -w "<PROD_DOMAIN>: %{http_code}\n" https://<PROD_DOMAIN>/
curl -s -o /dev/null -w "<PREVIEW_DOMAIN>: %{http_code}\n" https://<PREVIEW_DOMAIN>/
```

Both 200 = verified. If 500, see Troubleshooting below.

---

## Phase 4: Cutover & Cleanup

**Run ONLY the section matching the mode flag. Skip all others.**

---

### MODE: `--new` Cleanup

Nothing to cut over. Commit and ship:

```bash
git add <FRONTEND_DIR>/wrangler.toml \
        <FRONTEND_DIR>/open-next.config.ts \
        <FRONTEND_DIR>/package.json \
        <FRONTEND_DIR>/package-lock.json \
        <FRONTEND_DIR>/app/

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

### MODE: `--from-amplify` Cleanup

Worker is live and verified. Now cut over from Amplify.

#### Step E: Update DNS (if using external DNS)

If the domain's DNS is NOT on Cloudflare:
- Point `<PROD_DOMAIN>` CNAME/ALIAS to the Worker's custom domain target
- CF Workers Builds Git Integration is NOT used — deploy is manual via `wrangler deploy`

If the domain IS on Cloudflare DNS (common):
- Custom domain attachment in Step 10 already handled DNS. Nothing more needed.

#### Step F: Disable Amplify (do NOT delete yet — wait 48h for DNS TTL)

```bash
# Disable Amplify auto-build (stops new deploys but keeps the app running as fallback)
aws amplify update-branch \
  --app-id <APP_ID> \
  --branch-name main \
  --enable-auto-build false \
  --region us-east-1

aws amplify update-branch \
  --app-id <APP_ID> \
  --branch-name develop \
  --enable-auto-build false \
  --region us-east-1
```

Disable any GH Actions Amplify workflows:
```bash
# In .github/workflows/ — add `if: false` to any Amplify deploy jobs
# OR rename amplify-deploy.yml → amplify-deploy.yml.disabled
```

#### Step G: After 48h — Delete Amplify app

After DNS TTL expires and Workers is confirmed stable:
```bash
aws amplify delete-app --app-id <APP_ID> --region us-east-1
```

#### Step H: Commit

```bash
git add <FRONTEND_DIR>/wrangler.toml \
        <FRONTEND_DIR>/open-next.config.ts \
        <FRONTEND_DIR>/package.json \
        <FRONTEND_DIR>/package-lock.json \
        amplify.yml.bak \
        <FRONTEND_DIR>/app/ \
        .github/workflows/

git commit -m "feat(infra): migrate from Amplify to Cloudflare Workers — <WORKER_NAME>

- wrangler.toml: Workers deploy, nodejs_compat, DO bindings, multi-env
- open-next.config.ts: defineCloudflareConfig()
- Remove export const runtime = 'edge' from all pages/routes
- Add pages:build / pages:deploy scripts
- Amplify auto-build disabled (app preserved for 48h rollback window)
- Env vars migrated from Amplify to SSM → wrangler secrets
- Live: <PROD_DOMAIN> (production), <PREVIEW_DOMAIN> (preview)"

git push origin develop
```

---

### MODE: `--from-pages` Cleanup

Worker is live and verified. The Pages project still exists but has no custom domains.

#### Step E: Disable old Pages GH Actions workflow

```bash
# Rename or disable any cloudflare/pages-action workflows
ls .github/workflows/ | grep -i pages
```

Replace with a no-op comment (or delete the file):
```yaml
# Deployment handled by Cloudflare Workers (wrangler deploy).
# This Pages workflow is retired as of <DATE>.
# Run: cd frontend && npx wrangler deploy --env production
```

#### Step F: Optionally delete old CF Pages project

In the Cloudflare dashboard:
- Workers & Pages → select old Pages project → Settings → Delete project
- OR keep it as a reference — it costs nothing without custom domains or active deploys

#### Step G: Commit

```bash
git add <FRONTEND_DIR>/wrangler.toml \
        <FRONTEND_DIR>/open-next.config.ts \
        <FRONTEND_DIR>/package.json \
        <FRONTEND_DIR>/package-lock.json \
        <FRONTEND_DIR>/app/ \
        .github/workflows/

git commit -m "feat(infra): migrate from CF Pages to CF Workers — <WORKER_NAME>

- wrangler.toml: Workers deploy (NOT pages deploy), nodejs_compat, DO bindings
- open-next.config.ts: defineCloudflareConfig()
- Remove export const runtime = 'edge' from all pages/routes
- Retire cloudflare/pages-action GH Actions workflow
- Secrets set via wrangler secret put (SSM-sourced, no GH secrets)
- Live: <PROD_DOMAIN> (production), <PREVIEW_DOMAIN> (preview)"

git push origin develop
```

---

### MODE: `--from-vercel` Cleanup

Worker is live and verified. Now cut over from Vercel.

#### Step E: Remove domain from Vercel project

In the Vercel dashboard:
- Project → Settings → Domains → Remove `<PROD_DOMAIN>` and `<PREVIEW_DOMAIN>`
- This allows CF to claim the domains fully

#### Step F: Disable Vercel deploys (GH Integration)

In Vercel dashboard:
- Project → Settings → Git → Disconnect repository OR set Ignored Build Step to `exit 0`

#### Step G: Commit

```bash
git add <FRONTEND_DIR>/wrangler.toml \
        <FRONTEND_DIR>/open-next.config.ts \
        <FRONTEND_DIR>/package.json \
        <FRONTEND_DIR>/package-lock.json \
        vercel.json.bak \
        <FRONTEND_DIR>/app/

git commit -m "feat(infra): migrate from Vercel to Cloudflare Workers — <WORKER_NAME>

- wrangler.toml: Workers deploy, nodejs_compat, DO bindings, multi-env
- open-next.config.ts: defineCloudflareConfig()
- Remove export const runtime = 'edge' from all pages/routes
- Vercel disconnected, domains transferred to CF Workers
- Secrets migrated from Vercel env to SSM → wrangler secrets
- Live: <PROD_DOMAIN> (production), <PREVIEW_DOMAIN> (preview)"

git push origin develop
```

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `app-edge-has-no-entrypoint` | `export const runtime = 'edge'` still in source | Re-run Step 5 grep+sed |
| 500 immediately after deploy | Clerk middleware crash — no keys set | Run Step 11 |
| 500, no Clerk | Apollo `new ApolloClient()` at module level | Lazy singleton + `next/dynamic ssr:false` |
| `wrangler pages deploy` fails | Wrong command — Workers not Pages | Use `wrangler deploy` (no `pages`) |
| Custom domain not attaching | Domain still attached to Pages or Amplify | Remove from old platform first (Phase 1) |
| Build fails: cannot find module | Missing dep | `npm install` in `<FRONTEND_DIR>/` |
| DNS not resolving after cutover | TTL not expired | Wait up to 48h; check with `dig <PROD_DOMAIN>` |
| Amplify still serving after disable | Old DNS record still cached | Flush local DNS + wait TTL |

---

## NEVER DO

- `wrangler pages deploy` — breaks OpenNext sibling imports → 500
- `export const runtime = 'edge'` in any page, route, or layout
- GitHub secrets for Clerk/API keys — SSM only, piped to `wrangler secret put`
- `cloudflare/pages-action@v1` in GH Actions — retired
- Module-level `new ApolloClient()` — crashes during Next.js prerender
- Delete the old platform immediately — wait 48h after verified live for rollback window
- `--force` push to remote after any migration commit

---

## Reference

- Platform standard doc: `docs/cloudflare/NEXTJS-CLOUDFLARE-WORKERS-DEPLOYMENT.md`
- Deployed examples:
  - `claracode.ai` → `clara-code` Worker (migrated from CF Pages, April 13 2026)
  - `claraagents.com` → `claraagents` Worker (migrated from CF Pages, April 13 2026)
- OpenNext docs: https://opennext.js.org/cloudflare/get-started
