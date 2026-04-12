# S2-01 — ECS Fargate Deploy: Clara Code Backend (Dev + Prod)

**Repo:** `imaginationeverywhere/clara-code`
**Branch:** `develop` (triggers dev deploy) → `main` (triggers prod deploy)
**Cursor agent:** Roy Clay (DevOps)
**Priority:** HIGH — backend infrastructure exists but has never had a running container

---

## Context

The Clara Code backend is an Express API (port 3001) running on ECS Fargate. All AWS
infrastructure was provisioned in a prior sprint. The service exists at desired count 0 with
no Docker image in ECR. This prompt gets it live.

**What already exists — do NOT recreate:**
- ECR repo: `clara-code-backend` (727646498347.dkr.ecr.us-east-1.amazonaws.com)
- IAM OIDC role: `GitHubActions-clara-code`
- ECS cluster: `quik-nation-dev` (dev) and `quik-nation-prod` (prod)
- ECS service: `clara-code-backend-dev` in `quik-nation-dev`
- ECS service: `clara-code-backend-prod` in `quik-nation-prod`
- Task definition: `clara-code-backend-dev:1` (minimal — DATABASE_URL + PORT + NODE_ENV only)
- SSM params at `/clara-code/develop/*` and `/clara-code/production/*`
- GitHub Actions workflow: `.github/workflows/deploy-backend.yml`
- `Dockerfile.backend` in repo root

---

## Step 1: Set GitHub Actions Repository Variables

These repo-level variables are required for the workflow to run. Use `gh` CLI from this repo:

```bash
gh variable set AWS_ACCOUNT_ID --repo imaginationeverywhere/clara-code --body "727646498347"
gh variable set ECS_CLUSTER_DEV --repo imaginationeverywhere/clara-code --body "quik-nation-dev"
gh variable set ECS_CLUSTER_PROD --repo imaginationeverywhere/clara-code --body "quik-nation-prod"
```

Verify they are set:
```bash
gh variable list --repo imaginationeverywhere/clara-code
```

---

## Step 2: Update ECS Task Definition — Add Missing Secrets

The current task def only has `DATABASE_URL`. Register a new revision that adds Clerk + Voice
secrets. Use `aws` CLI with your OIDC-authed credentials (or assume `GitHubActions-clara-code`).

**For dev (`clara-code-backend-dev`):**

```bash
# Export current task def
aws ecs describe-task-definition \
  --task-definition clara-code-backend-dev \
  --query 'taskDefinition' \
  --region us-east-1 > /tmp/cc-taskdef-dev.json

# Edit /tmp/cc-taskdef-dev.json:
# 1. Remove these read-only fields: taskDefinitionArn, revision, status,
#    requiresAttributes, placementConstraints, compatibilities, registeredAt, registeredBy
# 2. In the container definition's "secrets" array, ADD:
#    {"name": "CLERK_SECRET_KEY",               "valueFrom": "/clara-code/develop/CLERK_SECRET_KEY"},
#    {"name": "CLERK_WEBHOOK_SECRET",            "valueFrom": "/clara-code/develop/CLERK_WEBHOOK_SECRET"},
#    {"name": "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY","valueFrom": "/clara-code/develop/NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"},
#    {"name": "ANTHROPIC_API_KEY",               "valueFrom": "/quik-nation/shared/ANTHROPIC_API_KEY"}
# 3. In the container definition's "environment" array, ADD:
#    {"name": "CLARA_VOICE_URL", "value": "https://info-24346--clara-voice-server-voiceserver-fastapi-app.modal.run"},
#    {"name": "HERMES_GATEWAY_URL", "value": "https://info-24346--hermes-gateway.modal.run"}

# Save as /tmp/cc-taskdef-dev-updated.json
# Register new revision
aws ecs register-task-definition \
  --cli-input-json file:///tmp/cc-taskdef-dev-updated.json \
  --region us-east-1
```

**For prod (`clara-code-backend-prod`):** Same pattern — use `/clara-code/production/*` SSM paths.

---

## Step 3: Verify SSM Parameter Coverage

Before triggering any deploy, verify all required SSM params exist:

```bash
# Dev
aws ssm get-parameters-by-path \
  --path '/clara-code/develop' --recursive \
  --region us-east-1 --query 'Parameters[].Name' --output table

# Prod
aws ssm get-parameters-by-path \
  --path '/clara-code/production' --recursive \
  --region us-east-1 --query 'Parameters[].Name' --output table
```

**Required params (both environments):**
- `DATABASE_URL`
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SECRET`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `PORT` (value: `3001`)
- `NODE_ENV` (`development` for dev, `production` for prod)

If `ANTHROPIC_API_KEY` is not in `/clara-code/develop/`, copy it from shared:
```bash
VALUE=$(aws ssm get-parameter --name '/quik-nation/shared/ANTHROPIC_API_KEY' --with-decryption \
  --query 'Parameter.Value' --output text --region us-east-1)
aws ssm put-parameter --name '/clara-code/develop/ANTHROPIC_API_KEY' \
  --value "$VALUE" --type SecureString --overwrite --region us-east-1
```

---

## Step 4: Trigger First Deploy (Dev)

```bash
# Commit to develop to fire GitHub Actions workflow
git commit --allow-empty -m "chore: trigger first backend deploy to ECS dev"
git push origin develop
```

The workflow `.github/workflows/deploy-backend.yml` will:
1. Build `Dockerfile.backend`
2. Push to ECR as `clara-code-backend:develop`
3. Update ECS service with new task def and force deployment

If you need to trigger manually without a commit:
```bash
gh workflow run deploy-backend.yml --repo imaginationeverywhere/clara-code --ref develop
```

---

## Step 5: Verify Dev is Healthy

Watch workflow run:
```bash
gh run list --repo imaginationeverywhere/clara-code --workflow=deploy-backend.yml --limit 3
gh run watch <run-id>
```

Verify ECS service:
```bash
aws ecs describe-services \
  --cluster quik-nation-dev \
  --services clara-code-backend-dev \
  --region us-east-1 \
  --query 'services[0].{desired:desiredCount,running:runningCount,status:status,deployments:deployments[0].status}'
```

Target: `desired: 1, running: 1`

Test health endpoint (get task IP from ECS console or describe-tasks):
```bash
TASK_ARN=$(aws ecs list-tasks --cluster quik-nation-dev \
  --service-name clara-code-backend-dev --region us-east-1 --query 'taskArns[0]' --output text)
TASK_IP=$(aws ecs describe-tasks --cluster quik-nation-dev --tasks "$TASK_ARN" \
  --region us-east-1 --query 'tasks[0].attachments[0].details[?name==`privateIPv4Address`].value' --output text)
curl "http://${TASK_IP}:3001/health"
```

---

## Step 6: Deploy Prod (After Dev is Stable)

```bash
git checkout main
git merge develop
git push origin main
```

Or via GitHub PR from develop → main. The workflow triggers on `main` push and deploys
to `clara-code-backend-prod` in `quik-nation-prod` cluster.

---

## Acceptance Criteria

- [ ] GitHub Actions variables set: `AWS_ACCOUNT_ID`, `ECS_CLUSTER_DEV`, `ECS_CLUSTER_PROD`
- [ ] Task def updated with Clerk + Voice + Anthropic secrets (dev and prod)
- [ ] All required SSM params present in both `/clara-code/develop/*` and `/clara-code/production/*`
- [ ] Docker image exists in ECR: `clara-code-backend:develop`
- [ ] `clara-code-backend-dev`: desired=1, running=1
- [ ] `GET /health` on dev task returns HTTP 200
- [ ] `clara-code-backend-prod` ready for prod deploy via main branch push

---

## Notes

- `Dockerfile.backend` builds the mom/ai/agent/coding-agent workspace packages
- The backend starts with the Express API on port 3001 — not the raw pi-mono runtime
- The `ecsTaskExecutionRole` already exists and has SSM read permissions
- OIDC provider is already registered (shared with other Herus in the org)
