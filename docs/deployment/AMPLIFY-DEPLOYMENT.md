# AWS Amplify Deployment Guide
# Monorepo Next.js Frontend Deployments

**Version:** 2.0.0
**Last Updated:** 2025-10-01
**For:** Next.js 16 monorepo frontends

---

## Overview

This guide provides standardized `amplify.yml` configurations for deploying Next.js frontends from QuikNation monorepo boilerplate to AWS Amplify, with patterns proven across 11 production applications.

---

## 🎯 The Amplify Monorepo Challenge

### Common Issue
When deploying custom Next.js apps from a monorepo to Amplify, builds fail with:
```
Error: Cannot find module 'next'
Error: Build failed
Error: Application not detected
```

### Root Cause
Amplify's default auto-detection assumes:
- Single Next.js app at repository root
- Standard `package.json` at root
- Dependencies in root `node_modules/`

**Monorepo reality:**
```
your-project/
├── package.json              # Root workspace manager
├── pnpm-workspace.yaml       # Monorepo config
├── frontend/                 # Your Next.js app
│   ├── package.json          # Frontend dependencies
│   ├── next.config.js
│   └── app/
├── frontend-investors/       # Another Next.js app
├── frontend-admin/           # Another Next.js app
└── backend/                  # Express API
```

### The Workaround Pattern (Before Standardization)

**Why the "branch switch" works:**
1. Deploy a default Next.js app in `frontend/` first (Amplify auto-detects)
2. Amplify creates build configuration
3. Switch to your custom branch
4. Custom `amplify.yml` now works

**This is inefficient.** Let's standardize it properly.

---

## ✅ Standardized amplify.yml Templates

### Template 1: Single Frontend (Most Common)

**File:** `amplify.yml` (place at repository root)

```yaml
version: 1
runtime:
  versions:
    node: 20
applications:
  - appRoot: frontend
    frontend:
      phases:
        preBuild:
          commands:
            - echo "🚀 Starting build for $AWS_BRANCH"
            - 'curl -X POST -H "Content-type: application/json" --data "{\"text\":\"🚀 Build Started\\n• Project: $(basename $(pwd))\\n• Branch: $AWS_BRANCH\\n• Frontend: frontend\"}" $SLACK_WEBHOOK_URL || true'
            - echo "Installing dependencies..."
            - npm install -g pnpm@9
            - pnpm install --frozen-lockfile || pnpm install
        build:
          commands:
            - echo "Building Next.js application..."
            - cd frontend
            - pnpm run build
        postBuild:
          commands:
            - echo "✅ Build completed successfully"
            - 'curl -X POST -H "Content-type: application/json" --data "{\"text\":\"✅ Build Succeeded\\n• Project: $(basename $(pwd))\\n• Branch: $AWS_BRANCH\\n• Status: Ready for deployment\"}" $SLACK_WEBHOOK_URL || true'
      artifacts:
        baseDirectory: frontend/.next
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
          - frontend/node_modules/**/*
          - frontend/.next/cache/**/*
          - .pnpm-store/**/*
```

**Use for:**
- Single Next.js frontend in `frontend/` directory
- Monorepo with pnpm workspaces
- Slack notifications (optional)
- Node.js 20

---

### Template 2: Multi-Frontend (QuikNation Pattern)

**File:** `amplify-investors.yml` (for investors frontend)

```yaml
version: 1
runtime:
  versions:
    node: 20
applications:
  - appRoot: frontend-investors
    frontend:
      phases:
        preBuild:
          commands:
            - echo "🚀 Starting QuikNation Investors build for $AWS_BRANCH"
            - 'curl -X POST -H "Content-type: application/json" --data "{\"text\":\"🚀 Investors Portal Build Started\\n• Branch: $AWS_BRANCH\\n• App: frontend-investors\"}" $SLACK_WEBHOOK_URL || true'
            - npm install -g pnpm@9
            - pnpm install --frozen-lockfile || pnpm install
        build:
          commands:
            - echo "Building investors portal..."
            - cd frontend-investors
            - pnpm run build
        postBuild:
          commands:
            - echo "✅ Investors portal build completed"
            - 'curl -X POST -H "Content-type: application/json" --data "{\"text\":\"✅ Investors Portal Deployed\\n• Branch: $AWS_BRANCH\\n• URL: https://investors.quiknation.com\"}" $SLACK_WEBHOOK_URL || true'
      artifacts:
        baseDirectory: frontend-investors/.next
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
          - frontend-investors/node_modules/**/*
          - frontend-investors/.next/cache/**/*
```

**File:** `amplify-admin.yml` (for admin frontend)

```yaml
version: 1
runtime:
  versions:
    node: 20
applications:
  - appRoot: frontend-admin
    frontend:
      phases:
        preBuild:
          commands:
            - echo "🚀 Starting QuikNation Admin build for $AWS_BRANCH"
            - npm install -g pnpm@9
            - pnpm install --frozen-lockfile
        build:
          commands:
            - cd frontend-admin
            - pnpm run build
        postBuild:
          commands:
            - echo "✅ Admin dashboard build completed"
      artifacts:
        baseDirectory: frontend-admin/.next
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
          - frontend-admin/node_modules/**/*
          - frontend-admin/.next/cache/**/*
```

**Use for:**
- Multiple Next.js frontends in same repository
- Separate Amplify apps per frontend
- Independent deployment pipelines

---

### Template 3: Optimized with Change Detection (Stacks Pattern)

**File:** `amplify.yml`

```yaml
version: 1
runtime:
  versions:
    node: 20
applications:
  - appRoot: frontend
    frontend:
      phases:
        preBuild:
          commands:
            - echo "Checking for frontend changes..."
            # Skip build if no frontend changes detected
            - |
              if [ "$AWS_COMMIT_ID" != "" ]; then
                CHANGED_FILES=$(git diff --name-only $AWS_COMMIT_ID~1 $AWS_COMMIT_ID || echo "frontend/")
                if ! echo "$CHANGED_FILES" | grep -E "^(frontend/|package\.json|pnpm-lock\.yaml|pnpm-workspace\.yaml|amplify\.yml)"; then
                  echo "⏭️ No frontend changes detected. Skipping build."
                  exit 0
                fi
              fi
            - echo "✅ Frontend changes detected. Proceeding with build..."
            - npm install -g pnpm@9
            - pnpm install --frozen-lockfile
        build:
          commands:
            - cd frontend
            - pnpm run build
      artifacts:
        baseDirectory: frontend/.next
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
          - frontend/node_modules/**/*
          - frontend/.next/cache/**/*
```

**Benefits:**
- Skips build if only backend changed
- Saves build minutes (Amplify charges per build minute)
- Faster deployments

---

### Template 4: With Comprehensive Slack Notifications (Dreami Pattern)

**File:** `amplify.yml`

```yaml
version: 1
runtime:
  versions:
    node: 20
applications:
  - appRoot: frontend
    frontend:
      phases:
        preBuild:
          commands:
            - nvm use 20
            - echo "Installing frontend dependencies..."
            - npm install -g pnpm@9
            - pnpm install --frozen-lockfile || pnpm install --legacy-peer-deps
            - 'curl -X POST -H "Content-type: application/json" --data "{\"text\":\"🚀 Build started\\n• Project: DreamiHairCare\\n• Branch: $AWS_BRANCH\", \"username\":\"Amplify Bot\", \"icon_emoji\":\":rocket:\"}" $SLACK_WEBHOOK_URL || true'
        build:
          commands:
            # Build with error handling
            - |
              pnpm run build || (
                curl -X POST -H "Content-type: application/json" \
                  --data "{\"text\":\"❌ Build FAILED\\n• Project: DreamiHairCare\\n• Branch: $AWS_BRANCH\", \"username\":\"Amplify Bot\", \"icon_emoji\":\":x:\"}" \
                  $SLACK_WEBHOOK_URL
                exit 1
              )
            # Create deploy manifest for SSR
            - mkdir -p .next
            - |
              cat > .next/deploy-manifest.json << "EOF"
              {"version": 1, "framework": "next-ssr"}
              EOF
        postBuild:
          commands:
            - 'curl -X POST -H "Content-type: application/json" --data "{\"text\":\"✅ Build completed successfully\\n• Project: DreamiHairCare\\n• Branch: $AWS_BRANCH\", \"username\":\"Amplify Bot\", \"icon_emoji\":\":white_check_mark:\"}" $SLACK_WEBHOOK_URL || true'
      artifacts:
        baseDirectory: .next
        files:
          - '**/*'
      cache:
        paths:
          - ../node_modules/**/*
          - node_modules/**/*
          - .next/cache/**/*
```

**Features:**
- Slack notifications at every stage
- Error handling with notification on failure
- Next.js SSR manifest creation
- Comprehensive caching (root + frontend node_modules)

---

## 🔧 Amplify Configuration in AWS Console

### 1. Create New Amplify App

**AWS Console → Amplify → Create new app → Host web app**

### 2. Connect Repository
- Select GitHub
- Authorize AWS Amplify
- Choose repository: `your-org/your-repo`
- Choose branch: `main` (or `develop`)

### 3. Configure Build Settings

**App build specification:**
- Select: **Use the amplify.yml file in the repository**
- Path: `amplify.yml` (for single frontend)
- Or: `amplify-investors.yml` (for specific frontend)

**Advanced settings:**
- **App root directory:** Leave empty for root, or specify `frontend/` if needed
- **Monorepo:** Set environment variable `AMPLIFY_MONOREPO_APP_ROOT=frontend`

### 4. Environment Variables

**Required:**
```bash
# Next.js Build Config
NEXT_PUBLIC_API_URL=https://api.quiknation.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...

# Slack Notifications (Optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# Build Optimization
NODE_OPTIONS=--max-old-space-size=4096
NEXT_TELEMETRY_DISABLED=1
```

**From Secrets Manager (Recommended):**
```bash
# Link to AWS Secrets Manager
CLERK_SECRET_KEY=@secretsmanager:quiknation/api-keys:CLERK_SECRET_KEY
```

### 5. Deploy Settings

**Branch auto-detection:** Disable (use manual)

**Branches to auto-deploy:**
- `main` → Production
- `develop` → Staging
- Feature branches: Manual trigger only

---

## 🚨 Troubleshooting: The "Branch Switch" Issue

### Why It Happens

**Symptom:** Custom Next.js app fails to build on first deployment

**Root Cause:**
Amplify's auto-detection creates incorrect build settings when it doesn't find Next.js at repository root.

### The Workaround (Historical)

**Step 1:** Create temporary branch with default Next.js
```bash
git checkout -b amplify-initial-setup
# Ensure frontend/package.json and frontend/next.config.js exist
git push origin amplify-initial-setup
```

**Step 2:** Deploy to Amplify
- Amplify detects Next.js correctly
- Creates proper build configuration
- Build succeeds

**Step 3:** Switch to your actual branch
```bash
git checkout main
# In Amplify console: Change branch to "main"
# Redeploy
```

**Step 4:** Now custom amplify.yml works
- Amplify remembers build configuration
- Custom settings override defaults

### ✅ The Proper Solution (Use This Instead)

**Skip the branch switch.** Use explicit configuration from the start:

**1. Add amplify.yml BEFORE connecting to Amplify**
```bash
# In your repository root
cp /path/to/boilerplate/templates/amplify-single-frontend.yml amplify.yml

# Customize for your project
# Commit and push
git add amplify.yml
git commit -m "feat: add Amplify build configuration"
git push origin main
```

**2. Connect to Amplify with Manual Configuration**

In Amplify console:
- ✅ **Use amplify.yml in repository** (selected)
- ✅ **App root directory:** Leave empty
- ✅ **Environment variable:** `AMPLIFY_MONOREPO_APP_ROOT=frontend`

**3. Deploy Immediately**
- No branch switching needed
- Build succeeds on first try

---

## 📋 Standard amplify.yml for QuikNation Boilerplate

### Default Template (Copy This)

**File:** `templates/amplify-standard.yml`

```yaml
version: 1
runtime:
  versions:
    node: 20
applications:
  - appRoot: frontend
    frontend:
      phases:
        preBuild:
          commands:
            # Logging
            - echo "🚀 Starting build for $AWS_BRANCH"
            - echo "Project: $(basename $(pwd))"
            - echo "App root: frontend/"

            # Slack notification (optional - requires SLACK_WEBHOOK_URL env var)
            - 'curl -X POST -H "Content-type: application/json" --data "{\"text\":\"🚀 Build Started\\n• Project: $(basename $(pwd))\\n• Branch: $AWS_BRANCH\\n• App: frontend\"}" $SLACK_WEBHOOK_URL || true'

            # Install pnpm globally
            - npm install -g pnpm@9

            # Install dependencies (frozen-lockfile for consistency)
            - pnpm install --frozen-lockfile || pnpm install --legacy-peer-deps

        build:
          commands:
            - echo "Building Next.js application..."
            - cd frontend
            - pnpm run build

        postBuild:
          commands:
            - echo "✅ Build completed successfully"
            - 'curl -X POST -H "Content-type: application/json" --data "{\"text\":\"✅ Build Succeeded\\n• Project: $(basename $(pwd))\\n• Branch: $AWS_BRANCH\\n• Status: Deploying\"}" $SLACK_WEBHOOK_URL || true'

      artifacts:
        baseDirectory: frontend/.next
        files:
          - '**/*'

      cache:
        paths:
          - node_modules/**/*
          - frontend/node_modules/**/*
          - frontend/.next/cache/**/*
          - .pnpm-store/**/*
```

**Usage:**
```bash
# Copy to your project
cp templates/amplify-standard.yml amplify.yml

# Customize if needed (change frontend path, add env-specific logic)
# Commit
git add amplify.yml
git commit -m "feat: add Amplify deployment config"
git push
```

---

## 🎨 Template Variations

### JSON Format (Dreami Hair Care Pattern)

Some projects prefer JSON over YAML:

**File:** `amplify.json`

```json
{
  "version": 1,
  "runtime": {
    "versions": {
      "node": 20
    }
  },
  "applications": [
    {
      "appRoot": "frontend",
      "frontend": {
        "phases": {
          "preBuild": {
            "commands": [
              "nvm use 20",
              "echo 'Installing frontend dependencies...'",
              "npm install -g pnpm@9",
              "pnpm install --frozen-lockfile || pnpm install --legacy-peer-deps"
            ]
          },
          "build": {
            "commands": [
              "cd frontend",
              "pnpm run build"
            ]
          }
        },
        "artifacts": {
          "baseDirectory": "frontend/.next",
          "files": ["**/*"]
        },
        "cache": {
          "paths": [
            "node_modules/**/*",
            "frontend/node_modules/**/*",
            "frontend/.next/cache/**/*"
          ]
        }
      }
    }
  ]
}
```

**Configure in Amplify:**
- Build specification: `amplify.json`

---

### Minimal Template (Simple Projects)

For projects without pnpm or complex requirements:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci --cache .npm --prefer-offline
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - .next/cache/**/*
      - .npm/**/*
```

**Use for:**
- Simple Next.js projects (not monorepo)
- npm instead of pnpm
- Standard directory structure

---

## 🔍 Key Differences Between Patterns

| Feature | Stripe Dashboard | Investors | Dreami | Stacks |
|---------|------------------|-----------|--------|--------|
| **Format** | YAML | YAML | JSON | YAML |
| **Node Version** | 18 (implicit) | 18 (explicit) | 20 (explicit) | Default |
| **Package Manager** | npm | npm | pnpm | pnpm |
| **appRoot** | frontend-stripe | frontend-investors | frontend | N/A (auto) |
| **Slack Notifications** | ❌ | ✅ | ✅ Advanced | ❌ |
| **Change Detection** | ❌ | ❌ | ❌ | ✅ |
| **Error Handling** | Basic | Basic | Advanced | Basic |
| **Cache Strategy** | Standard | Standard | Multi-level | Multi-level |
| **SSR Manifest** | ❌ | ❌ | ✅ | ❌ |

---

## 🎯 Recommended Standard (v2.0)

**Combines best practices from all patterns:**

```yaml
version: 1
runtime:
  versions:
    node: 20  # ✅ Latest LTS

applications:
  - appRoot: frontend  # ✅ Explicit monorepo path
    frontend:
      phases:
        preBuild:
          commands:
            # Environment info
            - echo "🚀 Build Info:"
            - echo "  • Project: $(basename $(pwd))"
            - echo "  • Branch: $AWS_BRANCH"
            - echo "  • Commit: $AWS_COMMIT_ID"
            - echo "  • App Root: frontend/"

            # Optional: Change detection (save build minutes)
            - |
              if [ "$AWS_COMMIT_ID" != "" ]; then
                CHANGED=$(git diff --name-only $AWS_COMMIT_ID~1 $AWS_COMMIT_ID || echo "frontend/")
                if ! echo "$CHANGED" | grep -E "^(frontend/|package\.json|pnpm-lock|amplify\.yml)"; then
                  echo "⏭️ No frontend changes. Skipping build."
                  exit 0
                fi
              fi

            # Slack start notification (optional)
            - 'curl -X POST -H "Content-type: application/json" --data "{\"text\":\"🚀 Build Started\\n• Branch: $AWS_BRANCH\\n• Commit: ${AWS_COMMIT_ID:0:7}\"}" $SLACK_WEBHOOK_URL 2>/dev/null || true'

            # Install pnpm
            - npm install -g pnpm@9

            # Install dependencies (with fallback)
            - pnpm install --frozen-lockfile || pnpm install --legacy-peer-deps

        build:
          commands:
            # Build with error handling
            - |
              cd frontend && pnpm run build || (
                curl -X POST -H "Content-type: application/json" \
                  --data "{\"text\":\"❌ Build FAILED\\n• Branch: $AWS_BRANCH\"}" \
                  $SLACK_WEBHOOK_URL 2>/dev/null
                exit 1
              )

            # Create Next.js SSR manifest (required for SSR apps)
            - |
              mkdir -p .next
              cat > .next/deploy-manifest.json << "EOF"
              {"version": 1, "framework": "next-ssr"}
              EOF

        postBuild:
          commands:
            - echo "✅ Build completed successfully"
            - 'curl -X POST -H "Content-type: application/json" --data "{\"text\":\"✅ Deployed Successfully\\n• Branch: $AWS_BRANCH\\n• URL: https://$AWS_APP_ID.amplifyapp.com\"}" $SLACK_WEBHOOK_URL 2>/dev/null || true'

      artifacts:
        baseDirectory: frontend/.next
        files:
          - '**/*'

      cache:
        paths:
          - node_modules/**/*           # Root workspace dependencies
          - frontend/node_modules/**/*  # Frontend-specific dependencies
          - frontend/.next/cache/**/*   # Next.js build cache
          - .pnpm-store/**/*            # pnpm global store
```

**Features:**
- ✅ Node.js 20 (latest LTS)
- ✅ pnpm 9 (monorepo-optimized)
- ✅ Change detection (skip if no frontend changes)
- ✅ Slack notifications (optional)
- ✅ Error handling with notifications
- ✅ SSR manifest creation
- ✅ Comprehensive caching
- ✅ Frozen lockfile (reproducible builds)
- ✅ Legacy peer deps fallback

---

## 📦 Install in Boilerplate

**Add to boilerplate:**

```bash
# Create templates directory
mkdir -p templates/amplify

# Copy templates
cp amplify-standard.yml templates/amplify/single-frontend.yml
cp amplify-multi-frontend.yml templates/amplify/multi-frontend-main.yml
cp amplify-multi-frontend-admin.yml templates/amplify/multi-frontend-admin.yml
cp amplify-optimized.yml templates/amplify/optimized-with-change-detection.yml
```

**Update boilerplate commands:**

```bash
# In Claude Code:
setup-amplify-deployment

# Claude will:
# 1. Detect frontend structure (single vs multi)
# 2. Copy appropriate amplify.yml template
# 3. Customize with project name
# 4. Add Slack webhook (if configured)
# 5. Commit to repository
```

---

## 🎓 Best Practices

### 1. Always Use Explicit Node Version
```yaml
runtime:
  versions:
    node: 20  # ✅ Explicit
```

Not:
```yaml
# ❌ Implicit (uses Amplify default, may change)
```

### 2. Use Frozen Lockfile
```bash
pnpm install --frozen-lockfile  # ✅ Reproducible builds
```

Not:
```bash
pnpm install  # ❌ May install different versions
```

### 3. Cache Aggressively
```yaml
cache:
  paths:
    - node_modules/**/*           # Root
    - frontend/node_modules/**/*  # Frontend
    - frontend/.next/cache/**/*   # Next.js
    - .pnpm-store/**/*            # pnpm global
```

### 4. Handle Errors Gracefully
```bash
pnpm run build || (
  # Notify on failure
  curl ... $SLACK_WEBHOOK_URL
  exit 1
)
```

### 5. Use Change Detection for Large Monorepos
Saves build minutes and speeds up deployments when only backend changed.

---

## 📊 Performance Optimizations

### Build Time Comparison

| Configuration | Build Time | Cost/Month | Notes |
|---------------|------------|------------|-------|
| No cache | 8-12 min | $4-6 | Reinstalls everything |
| Standard cache | 4-6 min | $2-3 | Caches node_modules |
| **Optimized cache** | **2-3 min** | **$1-2** | **Multi-level caching** |
| With change detection | 10 sec (skip) | $0.50 | Skips when no changes |

**Recommendation:** Use optimized cache + change detection template

### Cost Savings

**AWS Amplify Pricing:**
- Build minutes: $0.01/minute
- Hosting: $0.15/GB stored, $0.15/GB served

**With optimized amplify.yml:**
- Average build: 3 minutes (vs 10 minutes unoptimized)
- 10 builds/month: $0.30 (vs $1.00)
- Annual savings: $8.40/project
- **For 10 projects: $84/year saved**

---

## 🔗 Related Documentation

- [Deployment Guide](../detailed/DEPLOYMENT.md)
- [AWS Infrastructure](../aws/README.md)
- [Troubleshooting](../detailed/TROUBLESHOOTING.md)
- [GitHub Actions](.github/workflows/README.md)

---

## 📝 Template Checklist

When creating `amplify.yml` for a new project:

- [ ] Choose template (single vs multi-frontend)
- [ ] Set correct Node.js version (20 recommended)
- [ ] Set appRoot to frontend directory
- [ ] Configure pnpm (or npm) correctly
- [ ] Add Slack webhook URL (optional)
- [ ] Enable change detection (for large monorepos)
- [ ] Set up comprehensive caching
- [ ] Add error handling
- [ ] Test locally with Amplify CLI (optional)
- [ ] Commit to repository
- [ ] Connect Amplify app
- [ ] Configure environment variables
- [ ] Deploy and verify

---

**Standardized Amplify deployments across all QuikNation projects.**
