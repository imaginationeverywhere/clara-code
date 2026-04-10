# AWS Amplify Develop Deployment Command

## Overview
Deploy the frontend application to the develop environment (develop.[PROJECT_DOMAIN]).

This command will:
1. Check current git status and ensure you're on develop branch
2. Commit any uncommitted changes if needed
3. Push changes to the develop branch
4. Trigger an AWS Amplify build
5. Monitor the deployment progress

## Prerequisites

⚠️ **REQUIRED**:
- AWS CLI configured with Amplify permissions
- Git repository with develop branch
- AWS Amplify app configured for develop branch
- Project must have `docs/PRD.md` with deployment configuration

## Command Execution

### Step 1: Pre-deployment Checks
```bash
# Check git status
git status

# Check current branch
echo "Current branch: $(git branch --show-current)"

# Check AWS credentials
aws sts get-caller-identity

# Verify Amplify app configuration
aws amplify get-app --app-id "[AMPLIFY_APP_ID]"
```

### Step 2: Handle Changes and Deploy
```bash
# Add and commit any changes with descriptive message (only if there are uncommitted changes)
if ! git diff-index --quiet HEAD --; then
  git add .
  git commit -m "$(cat <<'EOF'
feat: deploy latest changes to develop environment

🚀 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
fi

# Push to develop branch
git push origin develop

# Get the latest commit message for deployment description
LATEST_COMMIT_MSG=$(git log -1 --pretty=format:"%s" | head -c 20)
echo "Deploying with commit message: $LATEST_COMMIT_MSG"

# Trigger Amplify build with commit message
aws amplify start-job \
    --app-id "[AMPLIFY_APP_ID]" \
    --branch-name "develop" \
    --job-type RELEASE \
    --commit-message "$LATEST_COMMIT_MSG" \
    --output json
```

### Step 3: Monitor Deployment
```bash
# Get latest job status
aws amplify list-jobs --app-id [AMPLIFY_APP_ID] --branch-name develop --max-items 1

# Check deployment health
curl -I https://develop.[PROJECT_DOMAIN]
```

## Template Variables

When configuring this command for your project, replace:
- `[AMPLIFY_APP_ID]` → Your AWS Amplify application ID
- `[PROJECT_DOMAIN]` → Your project's primary domain

## Success Criteria

✅ **Deployment Complete When**:
- Git changes committed and pushed successfully
- Amplify build job started successfully
- Deployment status shows "SUCCEED"
- Develop environment accessible at https://develop.[PROJECT_DOMAIN]

The deployment will be available at: **https://develop.[PROJECT_DOMAIN]**