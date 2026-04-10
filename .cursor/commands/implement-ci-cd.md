# Implement CI/CD Pipeline

Implement production-grade GitHub Actions CI/CD pipelines with automated testing, deployments, database migrations, and comprehensive validation following DreamiHairCare's battle-tested patterns.

## Command Usage

```
/implement-ci-cd [options]
```

### Options
- `--full` - Complete CI/CD stack (all workflows) (default)
- `--backend-only` - Backend deployment workflow only
- `--frontend-only` - Frontend deployment workflow only
- `--pr-validation` - Pull request validation workflow only
- `--migrations` - Database migration workflow only
- `--audit` - Audit existing CI/CD configuration

### Feature Options
- `--with-security-scanning` - Include security scanning jobs
- `--with-slack-notifications` - Include Slack deployment notifications
- `--with-health-checks` - Include scheduled health monitoring
- `--with-release-management` - Include release workflow

## Pre-Implementation Checklist

### GitHub Repository Setup
- [ ] Repository created on GitHub
- [ ] Admin access to repository settings
- [ ] Branch protection rules planned

### AWS Configuration
- [ ] AWS access configured (for deployments)
- [ ] IAM user with deployment permissions
- [ ] Parameter Store secrets configured

### Environment Targets
- [ ] Staging environment defined
- [ ] Production environment defined
- [ ] Environment-specific variables documented

### Secrets Required
```yaml
# Repository Secrets (Settings → Secrets → Actions)
AWS_ACCESS_KEY_ID: "AKIA..."
AWS_SECRET_ACCESS_KEY: "..."
AWS_REGION: "us-east-1"
EC2_SSH_KEY: "-----BEGIN RSA PRIVATE KEY-----..."
EC2_HOST_STAGING: "3.xxx.xxx.xxx"
EC2_HOST_PRODUCTION: "3.xxx.xxx.xxx"
EC2_USER: "ec2-user"
SLACK_WEBHOOK_URL: "https://hooks.slack.com/..."  # Optional
DATABASE_URL_STAGING: "postgresql://..."
DATABASE_URL_PRODUCTION: "postgresql://..."
```

## Implementation Phases

### Phase 1: Backend Deployment Workflow

#### 1.1 Create `.github/workflows/deploy-backend.yml`
See **ci-cd-pipeline-standard** skill for complete template including:
- Multi-environment matrix (staging/production)
- Pre-deployment backup
- AWS Parameter Store SSH key retrieval
- PM2 deployment with health validation
- Post-deployment verification
- Optional Slack notifications

#### 1.2 Key Features
```yaml
# Environment matrix strategy
strategy:
  matrix:
    environment: ${{ github.ref == 'refs/heads/main' && fromJSON('["production"]') || fromJSON('["staging"]') }}

# Pre-deployment backup
- name: Create pre-deployment backup
  run: |
    timestamp=$(date +%Y%m%d_%H%M%S)
    ssh $EC2_USER@$EC2_HOST "cd /var/www/${{ env.PROJECT_NAME }}/backend && \
      tar -czf backups/pre-deploy-${timestamp}.tar.gz dist/ package.json"

# Post-deployment health check
- name: Verify deployment
  run: |
    sleep 15
    response=$(curl -s -o /dev/null -w "%{http_code}" http://$EC2_HOST:$PORT/health)
    if [ "$response" != "200" ]; then
      echo "Health check failed!"
      exit 1
    fi
```

### Phase 2: Frontend Deployment Workflow

#### 2.1 Create `.github/workflows/deploy-frontend.yml`
See **ci-cd-pipeline-standard** skill for complete template including:
- Amplify deployment triggering
- Environment variable injection
- Build validation
- Change detection for monorepos

#### 2.2 Amplify Integration
```yaml
# Amplify deployment via AWS CLI
- name: Deploy to Amplify
  run: |
    aws amplify start-job \
      --app-id ${{ secrets.AMPLIFY_APP_ID }} \
      --branch-name ${{ github.ref_name }} \
      --job-type RELEASE

# Wait for deployment
- name: Wait for Amplify deployment
  run: |
    while true; do
      status=$(aws amplify get-job --app-id $AMPLIFY_APP_ID --branch-name main --job-id $JOB_ID --query 'job.summary.status' --output text)
      if [ "$status" = "SUCCEED" ]; then break; fi
      if [ "$status" = "FAILED" ]; then exit 1; fi
      sleep 30
    done
```

### Phase 3: Pull Request Validation Workflow

#### 3.1 Create `.github/workflows/pr-validation.yml`
See **ci-cd-pipeline-standard** skill for complete template including:
- Parallel frontend/backend testing
- Type checking
- Linting
- Unit tests
- Build verification
- Security scanning

#### 3.2 Parallel Job Strategy
```yaml
jobs:
  frontend-checks:
    runs-on: ubuntu-latest
    steps:
      - name: Type check
        run: pnpm --filter frontend type-check
      - name: Lint
        run: pnpm --filter frontend lint
      - name: Test
        run: pnpm --filter frontend test

  backend-checks:
    runs-on: ubuntu-latest
    steps:
      - name: Type check
        run: pnpm --filter backend type-check
      - name: Lint
        run: pnpm --filter backend lint
      - name: Test
        run: pnpm --filter backend test
```

### Phase 4: Database Migration Workflow

#### 4.1 Create `.github/workflows/run-migrations.yml`
See **ci-cd-pipeline-standard** skill for complete template including:
- Manual trigger with environment selection
- Pre-migration backup
- Sequelize migration execution
- Rollback on failure
- Notification on completion

#### 4.2 Migration Safety
```yaml
# Pre-migration backup
- name: Backup database
  run: |
    pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Run with rollback capability
- name: Run migrations
  id: migrate
  run: |
    npx sequelize-cli db:migrate
  continue-on-error: true

- name: Rollback on failure
  if: steps.migrate.outcome == 'failure'
  run: |
    npx sequelize-cli db:migrate:undo
    exit 1
```

### Phase 5: Health Check Workflow

#### 5.1 Create `.github/workflows/health-checks.yml`
See **ci-cd-pipeline-standard** skill for complete template including:
- Scheduled monitoring (every 5 minutes)
- Multi-endpoint checking
- Slack alerts on failure
- Response time tracking

#### 5.2 Monitoring Configuration
```yaml
on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes
  workflow_dispatch:

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - name: Check API health
        run: |
          response=$(curl -s -w "\n%{http_code}" ${{ secrets.API_URL }}/health)
          status=$(echo "$response" | tail -n1)
          if [ "$status" != "200" ]; then
            echo "API health check failed with status $status"
            exit 1
          fi

      - name: Notify on failure
        if: failure()
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK_URL }} \
            -H 'Content-type: application/json' \
            -d '{"text":"🚨 Health check failed for ${{ github.repository }}"}'
```

### Phase 6: Release Workflow

#### 6.1 Create `.github/workflows/release.yml`
See **ci-cd-pipeline-standard** skill for complete template including:
- Semantic versioning
- Automatic changelog generation
- GitHub release creation
- Tag management
- Deployment triggering

#### 6.2 Release Process
```yaml
on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Generate changelog
        id: changelog
        uses: metcalfc/changelog-generator@v4
        with:
          myToken: ${{ secrets.GITHUB_TOKEN }}

      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          body: ${{ steps.changelog.outputs.changelog }}
          draft: false
          prerelease: false
```

## File Structure

```
project/
├── .github/
│   ├── workflows/
│   │   ├── deploy-backend.yml      # Backend deployment
│   │   ├── deploy-frontend.yml     # Frontend deployment
│   │   ├── pr-validation.yml       # PR checks
│   │   ├── run-migrations.yml      # Database migrations
│   │   ├── health-checks.yml       # Scheduled monitoring
│   │   └── release.yml             # Release management
│   ├── CODEOWNERS                  # Code ownership
│   └── pull_request_template.md    # PR template
└── package.json                    # Scripts for local CI
```

## GitHub Repository Configuration

### Required Secrets
Navigate to: Repository → Settings → Secrets and variables → Actions

```yaml
# AWS Deployment
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION

# EC2 Deployment
EC2_SSH_KEY          # Full private key content
EC2_HOST_STAGING
EC2_HOST_PRODUCTION
EC2_USER

# Database
DATABASE_URL_STAGING
DATABASE_URL_PRODUCTION

# Amplify (if using)
AMPLIFY_APP_ID

# Notifications (optional)
SLACK_WEBHOOK_URL
```

### Required Variables
Navigate to: Repository → Settings → Secrets and variables → Actions → Variables

```yaml
PROJECT_NAME: "myproject"
BACKEND_PORT_STAGING: "3001"
BACKEND_PORT_PRODUCTION: "3001"
```

### Branch Protection Rules
Navigate to: Repository → Settings → Branches

```yaml
main:
  require_pull_request:
    required_approving_review_count: 1
    dismiss_stale_reviews: true
    require_code_owner_reviews: true
  require_status_checks:
    strict: true
    contexts:
      - "frontend-checks"
      - "backend-checks"
  require_conversation_resolution: true
  restrict_pushes:
    restrict_to_actors: true

develop:
  require_pull_request:
    required_approving_review_count: 1
  require_status_checks:
    strict: true
```

## Verification Checklist

### Workflows
- [ ] deploy-backend.yml triggers on main push
- [ ] deploy-frontend.yml triggers on main push
- [ ] pr-validation.yml runs on all PRs
- [ ] run-migrations.yml works with manual trigger
- [ ] health-checks.yml runs on schedule
- [ ] release.yml triggers on version tags

### Deployments
- [ ] Staging deployment succeeds
- [ ] Production deployment succeeds
- [ ] Rollback procedure tested
- [ ] Health checks pass post-deployment

### Security
- [ ] All secrets configured (not in code)
- [ ] SSH keys in Parameter Store
- [ ] Branch protection enabled
- [ ] Required reviews configured

### Monitoring
- [ ] Health checks running
- [ ] Slack notifications working
- [ ] Failed deployments notify team
- [ ] Successful deployments logged

## Troubleshooting

### Common Issues

**SSH Connection Failed**
```bash
# Check SSH key format
# Ensure key starts with "-----BEGIN RSA PRIVATE KEY-----"
# Check EC2 security group allows SSH from GitHub IPs
```

**Amplify Deployment Not Triggering**
```bash
# Verify AMPLIFY_APP_ID is correct
# Check branch configuration in Amplify console
# Ensure AWS credentials have amplify:StartJob permission
```

**Health Check Failing**
```bash
# Verify API URL is accessible from GitHub runners
# Check security group allows inbound from 0.0.0.0/0
# Ensure health endpoint returns 200
```

**Migration Failed**
```bash
# Check DATABASE_URL is correct
# Verify database is accessible from GitHub runners
# Review migration files for errors
```

## Related Skills

- **ci-cd-pipeline-standard** - Complete CI/CD patterns
- **aws-deployment-standard** - AWS deployment patterns
- **docker-containerization-standard** - Docker builds for CI

## Related Commands

- `/implement-aws-deployment` - AWS infrastructure setup
- `/implement-notifications` - Deployment notifications
