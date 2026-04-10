---
name: ci-cd-pipeline-standard
description: Implement GitHub Actions CI/CD with multi-environment deployments, security scanning, and automated testing. Use when setting up CI/CD, configuring GitHub Actions, or automating deployments. Triggers on requests for CI/CD setup, GitHub Actions, deployment pipelines, or build automation.
---

# CI/CD Pipeline Standard

Production-grade GitHub Actions CI/CD pipeline patterns from DreamiHairCare implementation with multi-environment deployments, security scanning, automated testing, and comprehensive deployment validation.

## Skill Metadata

- **Name:** ci-cd-pipeline-standard
- **Version:** 1.0.0
- **Category:** Infrastructure & DevOps
- **Source:** DreamiHairCare Production Implementation
- **Related Skills:** aws-deployment-standard, docker-containerization-standard

## When to Use This Skill

Use this skill when:
- Setting up GitHub Actions workflows for deployments
- Implementing multi-environment CI/CD (staging/production)
- Creating automated testing pipelines
- Implementing security scanning in CI
- Setting up deployment validation and health checks
- Creating backup workflows before deployments

## Core Patterns

### 1. Backend Deployment Workflow

```yaml
# .github/workflows/deploy-backend.yml
name: Deploy Backend API

on:
  push:
    branches: [develop, main]
    paths:
      - 'backend/**'
      - '.github/workflows/deploy-backend.yml'
  pull_request:
    branches: [develop, main]
    paths:
      - 'backend/**'

jobs:
  # ===========================================================================
  # TEST JOB - Run tests and type checking
  # ===========================================================================
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        run: |
          cd backend
          npm ci --legacy-peer-deps

      - name: Type check
        run: |
          cd backend
          npm run type-check

      - name: Run tests
        run: |
          cd backend
          npm test -- --coverage --passWithNoTests
        continue-on-error: true

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          directory: backend/coverage
          flags: backend
        continue-on-error: true

  # ===========================================================================
  # SECURITY JOB - Run security scans
  # ===========================================================================
  security:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Run npm audit
        run: |
          cd backend
          npm audit --audit-level=moderate || true

      - name: Check for hardcoded secrets
        run: |
          # Check for actual hardcoded secrets
          SECRET_PATTERNS=(
            "api_key.*=.*['\"][a-zA-Z0-9_-]{10,}['\"]"
            "secret.*=.*['\"][a-zA-Z0-9_-]{10,}['\"]"
            "token.*=.*['\"][a-zA-Z0-9_-]{10,}['\"]"
            "password.*=.*['\"][^'\"]{3,}['\"]"
          )

          FOUND_SECRETS=false
          for pattern in "${SECRET_PATTERNS[@]}"; do
            if grep -r -i -E "$pattern" backend/src/ --include="*.ts" --include="*.js" | grep -v "process.env"; then
              FOUND_SECRETS=true
              break
            fi
          done

          if $FOUND_SECRETS; then
            echo "⚠️ Potential hardcoded secrets found"
            exit 1
          fi
          echo "✅ No hardcoded secrets found"

  # ===========================================================================
  # DEPLOY JOB - Deploy to environment
  # ===========================================================================
  deploy:
    needs: [test, security]
    runs-on: ubuntu-latest
    if: github.event_name == 'push'

    strategy:
      matrix:
        environment: ${{ github.ref == 'refs/heads/main' && fromJSON('["production"]') || fromJSON('["staging"]') }}

    environment: ${{ matrix.environment }}

    permissions:
      id-token: write
      contents: read

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          cd backend
          npm ci --legacy-peer-deps

      - name: Build application
        run: |
          cd backend
          npm run build

      - name: Run pre-deployment backup
        env:
          DATABASE_URL: ${{ matrix.environment == 'production' && secrets.DATABASE_URL_PRODUCTION || secrets.DATABASE_URL_STAGING }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_REGION: us-east-1
        run: |
          cd backend
          echo "📦 Running pre-deployment backup..."
          node scripts/pre-deployment-backup.js ${{ matrix.environment }} || true

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Get deployment configuration
        id: config
        run: |
          # Get SSH key from Parameter Store
          aws ssm get-parameter \
            --name "/${{ vars.PROJECT_NAME }}/deployment/ssh-key" \
            --with-decryption \
            --query 'Parameter.Value' \
            --output text > ssh_key.pem
          chmod 600 ssh_key.pem

          # Get target host
          if [ "${{ matrix.environment }}" = "production" ]; then
            TARGET_HOST=$(aws ssm get-parameter --name "/${{ vars.PROJECT_NAME }}/deployment/production-host" --query 'Parameter.Value' --output text)
            PM2_APP_NAME="${{ vars.PROJECT_NAME }}-production"
            PORT="${{ vars.PRODUCTION_PORT || '3007' }}"
          else
            TARGET_HOST=$(aws ssm get-parameter --name "/${{ vars.PROJECT_NAME }}/deployment/staging-host" --query 'Parameter.Value' --output text)
            PM2_APP_NAME="${{ vars.PROJECT_NAME }}-staging"
            PORT="${{ vars.STAGING_PORT || '3008' }}"
          fi

          echo "target_host=$TARGET_HOST" >> $GITHUB_OUTPUT
          echo "pm2_app_name=$PM2_APP_NAME" >> $GITHUB_OUTPUT
          echo "port=$PORT" >> $GITHUB_OUTPUT

          # Add to known_hosts
          mkdir -p ~/.ssh
          ssh-keyscan -H $TARGET_HOST >> ~/.ssh/known_hosts

      - name: Create deployment package
        run: |
          cd backend
          tar --exclude='node_modules' \
              --exclude='.git' \
              --exclude='*.log' \
              --exclude='coverage' \
              --exclude='*.test.ts' \
              -czf ../deployment-package.tar.gz .

      - name: Deploy to ${{ matrix.environment }}
        run: |
          TARGET_HOST="${{ steps.config.outputs.target_host }}"
          PM2_APP_NAME="${{ steps.config.outputs.pm2_app_name }}"
          PORT="${{ steps.config.outputs.port }}"

          echo "🚀 Deploying to ${{ matrix.environment }}"

          # Upload package
          scp -i ssh_key.pem deployment-package.tar.gz ec2-user@$TARGET_HOST:/tmp/

          # Deploy
          ssh -i ssh_key.pem ec2-user@$TARGET_HOST << 'EOF'
            set -e

            # Setup directory
            mkdir -p /home/ec2-user/projects/${{ vars.PROJECT_NAME }}-backend
            cd /home/ec2-user/projects/${{ vars.PROJECT_NAME }}-backend

            # Backup current deployment
            if [ -d "dist" ]; then
              mv dist dist.backup.$(date +%Y%m%d_%H%M%S) || true
            fi

            # Extract new deployment
            tar -xzf /tmp/deployment-package.tar.gz

            # Install dependencies
            npm install --legacy-peer-deps --production

            # Build
            npm run build

            # Restart PM2
            pm2 stop "$PM2_APP_NAME" 2>/dev/null || true
            pm2 delete "$PM2_APP_NAME" 2>/dev/null || true
            pm2 start ecosystem.config.js --env ${{ matrix.environment }}
            pm2 save

            # Cleanup
            rm -f /tmp/deployment-package.tar.gz

            echo "✅ Deployment completed"
          EOF

      - name: Wait for startup
        run: sleep 30

      - name: Validate deployment
        run: |
          TARGET_HOST="${{ steps.config.outputs.target_host }}"
          PM2_APP_NAME="${{ steps.config.outputs.pm2_app_name }}"

          # Get fresh SSH key
          aws ssm get-parameter \
            --name "/${{ vars.PROJECT_NAME }}/deployment/ssh-key" \
            --with-decryption \
            --query 'Parameter.Value' \
            --output text > ssh_key.pem
          chmod 600 ssh_key.pem

          # Check PM2 status
          ssh -i ssh_key.pem ec2-user@$TARGET_HOST << EOF
            echo "=== PM2 Status ==="
            pm2 list | grep -E '(online|stopped|errored)'

            # Check health endpoint
            echo "=== Health Check ==="
            curl -s http://localhost:${{ steps.config.outputs.port }}/health || echo "Health check failed"
          EOF

      - name: Notify success
        if: success()
        run: |
          echo "✅ Deployment successful"
          if [ "${{ matrix.environment }}" = "production" ]; then
            echo "🌐 Production URL: https://api.${{ vars.PROJECT_DOMAIN }}"
          else
            echo "🌐 Staging URL: https://api-dev.${{ vars.PROJECT_DOMAIN }}"
          fi

      - name: Notify failure
        if: failure()
        run: |
          echo "❌ Deployment failed for ${{ matrix.environment }}"
          echo "Check logs: pm2 logs ${{ steps.config.outputs.pm2_app_name }}"
```

### 2. Frontend Deployment Workflow (Amplify)

```yaml
# .github/workflows/deploy-frontend.yml
name: Deploy Frontend

on:
  push:
    branches: [develop, main]
    paths:
      - 'frontend/**'
      - '.github/workflows/deploy-frontend.yml'
  pull_request:
    branches: [develop, main]
    paths:
      - 'frontend/**'

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
          cache-dependency-path: frontend/pnpm-lock.yaml

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: |
          cd frontend
          pnpm install --frozen-lockfile

      - name: Type check
        run: |
          cd frontend
          pnpm type-check

      - name: Lint
        run: |
          cd frontend
          pnpm lint

      - name: Run tests
        run: |
          cd frontend
          pnpm test -- --passWithNoTests
        continue-on-error: true

      - name: Build check
        run: |
          cd frontend
          pnpm build
        env:
          NEXT_PUBLIC_API_URL: https://api-dev.example.com
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${{ secrets.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_STAGING }}

  # Amplify handles actual deployment automatically
  # This workflow is for testing and validation only
```

### 3. PR Validation Workflow

```yaml
# .github/workflows/pr-validation.yml
name: PR Validation

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  # ===========================================================================
  # BACKEND VALIDATION
  # ===========================================================================
  backend-validation:
    runs-on: ubuntu-latest
    if: |
      contains(github.event.pull_request.changed_files, 'backend/') ||
      github.event.pull_request.base.ref == 'main'

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          cd backend
          npm ci --legacy-peer-deps

      - name: Type check
        run: |
          cd backend
          npm run type-check

      - name: Lint
        run: |
          cd backend
          npm run lint

      - name: Test
        run: |
          cd backend
          npm test -- --passWithNoTests --coverage

      - name: Build
        run: |
          cd backend
          npm run build

  # ===========================================================================
  # FRONTEND VALIDATION
  # ===========================================================================
  frontend-validation:
    runs-on: ubuntu-latest
    if: |
      contains(github.event.pull_request.changed_files, 'frontend/') ||
      github.event.pull_request.base.ref == 'main'

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: |
          cd frontend
          pnpm install --frozen-lockfile

      - name: Type check
        run: |
          cd frontend
          pnpm type-check

      - name: Lint
        run: |
          cd frontend
          pnpm lint

      - name: Test
        run: |
          cd frontend
          pnpm test -- --passWithNoTests

      - name: Build
        run: |
          cd frontend
          pnpm build
        env:
          NEXT_PUBLIC_API_URL: https://api-dev.example.com

  # ===========================================================================
  # SECURITY CHECK
  # ===========================================================================
  security-check:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Check for secrets
        run: |
          # Search for potential secrets
          if grep -rE "(api_key|secret|token|password)\s*[:=]\s*['\"][^'\"]{10,}" --include="*.ts" --include="*.js" --include="*.tsx" --exclude-dir=node_modules | grep -v "process.env" | grep -v ".example"; then
            echo "⚠️ Potential secrets found in code"
            exit 1
          fi
          echo "✅ No secrets detected"

      - name: Check .env files not committed
        run: |
          if git ls-files | grep -E "^\.env($|\.local|\.production|\.staging)"; then
            echo "❌ .env files should not be committed"
            exit 1
          fi
          echo "✅ No .env files in repository"
```

### 4. Database Migration Workflow

```yaml
# .github/workflows/database-migrations.yml
name: Database Migrations

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to run migrations'
        required: true
        type: choice
        options:
          - staging
          - production
      action:
        description: 'Migration action'
        required: true
        type: choice
        options:
          - migrate
          - migrate:undo
          - migrate:status

jobs:
  migrate:
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment }}

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          cd backend
          npm ci --legacy-peer-deps

      - name: Run migration
        env:
          DATABASE_URL: ${{ github.event.inputs.environment == 'production' && secrets.DATABASE_URL_PRODUCTION || secrets.DATABASE_URL_STAGING }}
        run: |
          cd backend
          echo "Running ${{ github.event.inputs.action }} on ${{ github.event.inputs.environment }}"
          npx sequelize-cli db:${{ github.event.inputs.action }}

      - name: Notify completion
        run: |
          echo "✅ Migration completed on ${{ github.event.inputs.environment }}"
```

### 5. Scheduled Health Checks

```yaml
# .github/workflows/health-checks.yml
name: Scheduled Health Checks

on:
  schedule:
    - cron: '*/15 * * * *'  # Every 15 minutes
  workflow_dispatch:

jobs:
  health-check:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        include:
          - name: Production API
            url: https://api.example.com/health
            environment: production
          - name: Staging API
            url: https://api-dev.example.com/health
            environment: staging
          - name: Production Frontend
            url: https://example.com
            environment: production
          - name: Staging Frontend
            url: https://dev.example.com
            environment: staging

    steps:
      - name: Check ${{ matrix.name }}
        run: |
          response=$(curl -s -o /dev/null -w "%{http_code}" "${{ matrix.url }}" --max-time 30)
          if [ "$response" -eq 200 ]; then
            echo "✅ ${{ matrix.name }} is healthy (HTTP $response)"
          else
            echo "❌ ${{ matrix.name }} is unhealthy (HTTP $response)"
            exit 1
          fi

      - name: Notify on failure
        if: failure()
        run: |
          echo "🚨 ${{ matrix.name }} health check failed!"
          # Add Slack/Discord notification here
```

### 6. Release Workflow

```yaml
# .github/workflows/release.yml
name: Create Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest

    permissions:
      contents: write

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Generate changelog
        id: changelog
        run: |
          # Get previous tag
          PREV_TAG=$(git describe --tags --abbrev=0 HEAD^ 2>/dev/null || echo "")

          # Generate changelog
          if [ -n "$PREV_TAG" ]; then
            CHANGELOG=$(git log --pretty=format:"- %s (%h)" $PREV_TAG..HEAD)
          else
            CHANGELOG=$(git log --pretty=format:"- %s (%h)" HEAD~10..HEAD)
          fi

          echo "changelog<<EOF" >> $GITHUB_OUTPUT
          echo "$CHANGELOG" >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT

      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref_name }}
          release_name: Release ${{ github.ref_name }}
          body: |
            ## Changes in this Release

            ${{ steps.changelog.outputs.changelog }}

            ## Deployment
            - Production deployment triggered automatically
            - Monitor: https://console.aws.amazon.com/...
          draft: false
          prerelease: ${{ contains(github.ref_name, 'beta') || contains(github.ref_name, 'alpha') }}
```

## GitHub Repository Settings

### Required Secrets

```bash
# AWS Credentials
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY

# Database URLs
DATABASE_URL_PRODUCTION
DATABASE_URL_STAGING

# Authentication
CLERK_SECRET_KEY_PRODUCTION
CLERK_SECRET_KEY_STAGING
CLERK_WEBHOOK_SECRET_PRODUCTION
CLERK_WEBHOOK_SECRET_STAGING

# Payments
STRIPE_SECRET_KEY_PRODUCTION
STRIPE_SECRET_KEY_STAGING
WEBHOOK_SECRET_STRIPE_PRODUCTION
WEBHOOK_SECRET_STRIPE_STAGING

# Security
JWT_SECRET_PRODUCTION
JWT_SECRET_STAGING
SESSION_SECRET_PRODUCTION
SESSION_SECRET_STAGING

# Optional
SLACK_WEBHOOK_URL
CODECOV_TOKEN
```

### Required Variables

```bash
PROJECT_NAME=myproject
PROJECT_DOMAIN=example.com
PRODUCTION_PORT=3007
STAGING_PORT=3008
AWS_REGION=us-east-1
```

### Branch Protection Rules

```yaml
# For main branch
main:
  required_status_checks:
    strict: true
    contexts:
      - test
      - security
  required_pull_request_reviews:
    required_approving_review_count: 1
    dismiss_stale_reviews: true
  enforce_admins: false
  restrictions: null

# For develop branch
develop:
  required_status_checks:
    strict: true
    contexts:
      - test
  required_pull_request_reviews:
    required_approving_review_count: 1
```

## Implementation Checklist

### GitHub Actions Workflows
- [ ] Backend deployment workflow (staging/production)
- [ ] Frontend deployment workflow (Amplify)
- [ ] PR validation workflow
- [ ] Database migration workflow
- [ ] Scheduled health checks
- [ ] Release workflow

### Security
- [ ] Secrets stored in GitHub Secrets
- [ ] No hardcoded credentials in workflows
- [ ] Security scanning in CI
- [ ] Branch protection enabled

### Monitoring
- [ ] Health check endpoints
- [ ] Deployment notifications (Slack/Discord)
- [ ] Failure alerts
- [ ] Coverage reporting

### Best Practices
- [ ] Use matrix strategy for multi-environment
- [ ] Cache dependencies for faster builds
- [ ] Use environments for deployment approval
- [ ] Validate deployments with health checks

## Related Commands

- `/implement-aws-deployment` - AWS deployment setup
- `/implement-ci-cd` - CI/CD pipeline implementation

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-15 | Initial release from DreamiHairCare patterns |
