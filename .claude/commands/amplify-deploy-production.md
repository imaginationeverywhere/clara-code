# AWS Amplify Production Deployment Command

## Overview
Deploy the frontend application to the production environment ([PROJECT_DOMAIN]).

⚠️ **WARNING: This deploys to live production environment!**

This command will:
1. Perform pre-deployment safety checks
2. Merge develop into main branch (optional)
3. Push changes to main branch
4. Trigger AWS Amplify production build
5. Monitor deployment progress

**IMPORTANT**: Only use this after thoroughly testing on develop environment.

## Prerequisites

⚠️ **REQUIRED**:
- AWS CLI configured with Amplify permissions
- Git repository with main and develop branches
- AWS Amplify app configured for production branch
- Successful develop environment deployment verified
- Project must have `docs/PRD.md` with deployment configuration

## Command Execution

### Step 1: Safety Checks and Verification
```bash
# Check current git status
git status

# Check current branch
echo "Current branch: $(git branch --show-current)"

# Verify AWS credentials
aws sts get-caller-identity

# Check recent develop deployments to ensure they're working
aws amplify list-jobs --app-id [AMPLIFY_APP_ID] --branch-name develop --max-items 1

# Verify develop environment health
curl -I https://develop.[PROJECT_DOMAIN]
```

### Step 2: Production Deployment Checklist
**Production deployment safety checklist - please confirm:**
- ✅ Code tested on develop.[PROJECT_DOMAIN]?
- ✅ All features working correctly?
- ✅ No console errors?
- ✅ Performance acceptable?
- ✅ Ready for live users?

### Step 3: Production Deployment
```bash
# Switch to main branch
git checkout main

# Merge develop into main (if confirmed)
git merge develop

# Commit production deployment with descriptive message (only if there are changes)
if ! git diff-index --quiet HEAD^ --; then
  git commit -m "$(cat <<'EOF'
feat: production deployment from develop branch

🚀 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
fi

# Push to main branch
git push origin main

# Get the latest commit message for deployment description
LATEST_COMMIT_MSG=$(git log -1 --pretty=format:"%s" | head -c 20)
echo "Deploying with commit message: $LATEST_COMMIT_MSG"

# Trigger production build with commit message
aws amplify start-job \
    --app-id "[AMPLIFY_APP_ID]" \
    --branch-name "main" \
    --job-type RELEASE \
    --commit-message "$LATEST_COMMIT_MSG" \
    --output json
```

### Step 4: Monitor and Verify
```bash
# Check deployment status
aws amplify list-jobs --app-id [AMPLIFY_APP_ID] --branch-name main --max-items 1

# Verify production environment health
curl -I https://[PROJECT_DOMAIN]
```

## Emergency Procedures

### Rollback Process
If deployment fails or issues are discovered:
```bash
# Get previous successful deployment
aws amplify list-jobs \
    --app-id [AMPLIFY_APP_ID] \
    --branch-name main \
    --max-items 5 \
    --query 'jobSummaries[?status==`SUCCEED`][0]'

# Trigger rollback to previous commit
git log --oneline -5  # Find previous stable commit
git checkout main
git reset --hard [PREVIOUS_COMMIT_HASH]
git push origin main --force-with-lease

# Trigger new build from rollback
aws amplify start-job \
    --app-id "[AMPLIFY_APP_ID]" \
    --branch-name "main" \
    --job-type RELEASE \
    --commit-message "Emergency rollback" \
    --output json
```

## Template Variables

When configuring this command for your project, replace:
- `[AMPLIFY_APP_ID]` → Your AWS Amplify application ID
- `[PROJECT_DOMAIN]` → Your project's primary domain

## Success Criteria

✅ **Production Deployment Complete When**:
- All safety checks passed
- Git merge and push successful
- Amplify build job started successfully
- Deployment status shows "SUCCEED"
- Production environment accessible at https://[PROJECT_DOMAIN]
- No critical errors in monitoring

The deployment will be live at: **https://[PROJECT_DOMAIN]**