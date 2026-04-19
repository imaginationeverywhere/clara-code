# Cloudflare Pages Standard

**Version:** 1.0.0
**Enforced by:** `/pickup-prompt --cf`

> This standard covers **Cloudflare Pages** frontend deployment. It is NOT the AI gateway standard (that's `/setup-ai-gateway`). Do not conflate the two.

Covers: Cloudflare Pages setup, `wrangler.toml` config, environment variable management, preview deployments, and build configuration for Next.js (OpenNext).

---

## CRITICAL RULES

### 1. `frontend/wrangler.toml` is the deployment config — root wrangler.toml is deprecated

```toml
# ✅ frontend/wrangler.toml — the ONLY wrangler config for frontend deployment
name = "[project]-frontend"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = ".vercel/output/static"

[[kv_namespaces]]
binding = "CACHE"
id = "[KV_NAMESPACE_ID]"           # from CF dashboard

# ❌ Root wrangler.toml for frontend — deprecated, causes confusion with Workers
```

---

### 2. Build command — use OpenNext for Next.js

```bash
# ✅ For Next.js apps — use OpenNext + @opennextjs/cloudflare
# package.json in frontend/
{
  "scripts": {
    "pages:build": "opennextjs-cloudflare build",
    "pages:preview": "opennextjs-cloudflare preview",
    "pages:deploy": "opennextjs-cloudflare deploy"
  }
}

# Build before deploying — pull secrets from SSM first
export NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$(aws ssm get-parameter \
  --name /[project]/prod/STRIPE_PUBLISHABLE_KEY \
  --with-decryption --query Parameter.Value --output text)

npm run pages:build
npm run pages:deploy

# ❌ Using `next export` — not compatible with Cloudflare Pages dynamic routes
# ❌ Using `next build` alone — needs opennextjs-cloudflare wrapper for CF Pages
```

---

### 3. Environment variables in CF dashboard — NOT in wrangler.toml

```bash
# ✅ Set env vars in Cloudflare dashboard or via wrangler CLI
# Production (main branch)
wrangler pages secret put STRIPE_SECRET_KEY --project-name [project]-frontend

# Preview (develop branch)
wrangler pages secret put STRIPE_SECRET_KEY --project-name [project]-frontend --env preview

# ✅ Non-secret vars via CF dashboard:
# Workers & Pages → [project]-frontend → Settings → Environment Variables
# Add NEXT_PUBLIC_* vars here for production and preview environments

# ❌ Putting secrets in wrangler.toml
[vars]
STRIPE_SECRET_KEY = "sk_live_..."  # NEVER do this — committed to git

# ❌ Using .env files for CF Pages deployment
# .env is for local dev only
```

---

### 4. NEXT_PUBLIC_* vars — set BEFORE build, not at runtime

```bash
# ✅ Build-time vars must be available BEFORE npm run pages:build
# Pull from SSM, export, then build:
export NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$(aws ssm get-parameter \
  --name /[project]/prod/CLERK_PUBLISHABLE_KEY \
  --query Parameter.Value --output text)

export NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$(aws ssm get-parameter \
  --name /[project]/prod/STRIPE_PUBLISHABLE_KEY \
  --query Parameter.Value --output text)

npm run pages:build

# ✅ In CF dashboard, also set these as plain text env vars (non-secret)
# so CF Pages can inject them during its own build if using CF's Git integration

# ❌ NEXT_PUBLIC_* vars set AFTER the build — they're baked into the JS bundle
# Missing at build time = undefined in client
```

---

### 5. Preview deployments on develop branch — production on main

```toml
# ✅ CF Pages auto-deploys:
# main branch     → production  (claracode.ai, app.claracode.ai)
# develop branch  → preview     (develop.claracode.ai, develop.app.claracode.ai)
# All other branches → no deploy (unless configured)

# Configure in CF dashboard:
# Workers & Pages → [project]-frontend → Deployments → Configure
# Production branch: main
# Preview branch: develop
```

```bash
# ✅ Deploy command in CI/CD (GitHub Actions)
# .github/workflows/deploy-frontend.yml
- name: Deploy to CF Pages
  run: |
    cd frontend
    npm ci
    npm run pages:build
    npx wrangler pages deploy --project-name=[project]-frontend
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CF_API_TOKEN }}
    CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CF_ACCOUNT_ID }}
```

---

### 6. Custom domains — configure in CF dashboard, not wrangler.toml

```bash
# ✅ Add custom domains via CF dashboard:
# Workers & Pages → [project]-frontend → Custom Domains → Set up a custom domain
# Production: app.claracode.ai, claracode.ai
# Preview: develop.claracode.ai (CF generates automatically)

# ✅ Or via CLI:
wrangler pages domain add claracode.ai --project-name [project]-frontend
wrangler pages domain add app.claracode.ai --project-name [project]-frontend

# ❌ DNS configured without going through CF — will break CF's edge caching
```

---

### 7. Clerk auth in CF Workers context — env vars required in CF

```bash
# ✅ Clerk vars must be in CF Pages environment (not just local .env)
# CF dashboard → Workers & Pages → [project]-frontend → Settings → Variables

# For preview:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_test_...   (plain text)
CLERK_SECRET_KEY = sk_test_...                    (secret)

# For production:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_live_...   (plain text)
CLERK_SECRET_KEY = sk_live_...                    (secret)

# ❌ Only having these in local .env — CF Pages build will fail without them
```

---

### 8. CF API token scoping — least privilege

```bash
# ✅ Create a scoped CF API token for CI/CD (not the Global API key)
# CF Dashboard → My Profile → API Tokens → Create Token
# Permissions:
#   Zone: DNS:Edit (if managing DNS)
#   Account: Cloudflare Pages:Edit
#   Account: Workers KV Storage:Edit (if using KV)
#
# Store in GitHub secrets:
# CF_API_TOKEN → used in GitHub Actions
# CF_ACCOUNT_ID → your Cloudflare account ID

# ❌ Using the Global API Key in CI/CD — gives full account access
```

---

### Heru-specific tech doc required

Each Heru using Cloudflare Pages MUST have `docs/standards/cf.md` documenting:
- CF Pages project name
- Production and preview domain(s)
- Build command and output directory
- Which env vars are set in CF dashboard (non-secret list only)
- Deployment trigger (GitHub Actions / Git integration / manual wrangler)
- KV namespaces used (if any) and their purpose

If `docs/standards/cf.md` does not exist, create it.
