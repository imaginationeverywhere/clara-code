# AWS Amplify Deployment Status Command

## Overview
Monitor the status of AWS Amplify deployments for both develop and production environments.

This command will check:
- Current build status for both environments
- Recent deployment history
- Environment health and accessibility
- Provides monitoring links and quick commands

## Prerequisites

⚠️ **REQUIRED**:
- AWS CLI configured with Amplify permissions
- AWS Amplify app configured for both develop and main branches
- Project must have `docs/PRD.md` with deployment configuration

## Command Execution

### Step 1: Environment Status Check
```bash
# Check AWS credentials and permissions
aws sts get-caller-identity

# Get Amplify app information
aws amplify get-app --app-id "[AMPLIFY_APP_ID]"
```

### Step 2: Develop Environment Status
```bash
# Get latest develop build
aws amplify list-jobs --app-id [AMPLIFY_APP_ID] --branch-name develop --max-items 1

# Check develop environment health
curl -I https://develop.[PROJECT_DOMAIN]

# Get develop branch configuration
aws amplify get-branch --app-id [AMPLIFY_APP_ID] --branch-name develop
```

### Step 3: Production Environment Status
```bash  
# Get latest production build
aws amplify list-jobs --app-id [AMPLIFY_APP_ID] --branch-name main --max-items 1

# Check production environment health
curl -I https://[PROJECT_DOMAIN]

# Get main branch configuration
aws amplify get-branch --app-id [AMPLIFY_APP_ID] --branch-name main
```

### Step 4: Deployment History Analysis
```bash
# Recent develop builds
aws amplify list-jobs \
    --app-id [AMPLIFY_APP_ID] \
    --branch-name develop \
    --max-items 5 \
    --query 'jobSummaries[*].[jobId,status,startTime,commitId]' \
    --output table

# Recent production builds  
aws amplify list-jobs \
    --app-id [AMPLIFY_APP_ID] \
    --branch-name main \
    --max-items 5 \
    --query 'jobSummaries[*].[jobId,status,startTime,commitId]' \
    --output table

# Build statistics
aws amplify list-jobs \
    --app-id [AMPLIFY_APP_ID] \
    --branch-name develop \
    --max-items 20 \
    --query 'jobSummaries[?status==`SUCCEED`] | length(@)' \
    --output text
```

## Status Dashboard

### Environment URLs
- 📘 **Develop**: https://develop.[PROJECT_DOMAIN]
- 🔴 **Production**: https://[PROJECT_DOMAIN]

### AWS Console Links
- [App Overview](https://console.aws.amazon.com/amplify/home#/[AMPLIFY_APP_ID])
- [Develop Builds](https://console.aws.amazon.com/amplify/home#/[AMPLIFY_APP_ID]/develop)
- [Production Builds](https://console.aws.amazon.com/amplify/home#/[AMPLIFY_APP_ID]/main)

### Quick Commands
- Deploy to develop: `amplify-deploy-develop`
- Deploy to production: `amplify-deploy-production`
- Trigger manual build: `aws amplify start-job --app-id [AMPLIFY_APP_ID] --branch-name BRANCH --job-type RELEASE`

## Health Check Validation

### Automated Environment Testing
```bash
# Comprehensive develop environment health check
curl -s -o /dev/null -w "%{http_code}" https://develop.[PROJECT_DOMAIN]
if [ $? -eq 0 ] && [ $(curl -s -o /dev/null -w "%{http_code}" https://develop.[PROJECT_DOMAIN]) -eq 200 ]; then
  echo "✅ Develop environment: HEALTHY"
else
  echo "❌ Develop environment: UNHEALTHY"
fi

# Comprehensive production environment health check
curl -s -o /dev/null -w "%{http_code}" https://[PROJECT_DOMAIN]
if [ $? -eq 0 ] && [ $(curl -s -o /dev/null -w "%{http_code}" https://[PROJECT_DOMAIN]) -eq 200 ]; then
  echo "✅ Production environment: HEALTHY"
else
  echo "❌ Production environment: UNHEALTHY"
fi
```

## Template Variables

When configuring this command for your project, replace:
- `[AMPLIFY_APP_ID]` → Your AWS Amplify application ID
- `[PROJECT_DOMAIN]` → Your project's primary domain

## Status Interpretation

### Build Status Meanings
- **PENDING**: Build queued, waiting to start
- **PROVISIONING**: Resources being allocated
- **RUNNING**: Build in progress
- **SUCCEED**: Build completed successfully
- **FAILED**: Build failed, check logs
- **CANCELLED**: Build was cancelled

### Troubleshooting Commands
```bash
# Get detailed job information for failed builds
aws amplify get-job --app-id [AMPLIFY_APP_ID] --branch-name BRANCH --job-id JOB_ID

# Get build logs for troubleshooting
aws logs get-log-events \
    --log-group-name /aws/amplify/[AMPLIFY_APP_ID] \
    --log-stream-name BUILD_LOG_STREAM
```