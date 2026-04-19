# AWS App Runner Docker Deployment Standard

**CRITICAL: This is the MANDATORY deployment pattern for all Quik Nation backend production deployments.**

---

## The Rule

**Production backend deployments to AWS App Runner MUST use pre-built Docker containers pushed to ECR.**

**DO NOT use App Runner's source-based deployment where App Runner builds the ECR image from source code.**

---

## Deployment Patterns

### CORRECT: Docker Container Deployment (MANDATORY)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Local/CI-CD    │     │    Amazon ECR   │     │  AWS App Runner │
│                 │     │                 │     │                 │
│  Build Docker   │────▶│  Push Image     │────▶│  Pull & Run     │
│  Image          │     │  (Pre-built)    │     │  Container      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**Flow:**
1. Build Docker image locally or in GitHub Actions
2. Push the pre-built image to Amazon ECR
3. App Runner pulls the image from ECR
4. App Runner runs the container

### INCORRECT: Source-Based Deployment (DO NOT USE)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  GitHub Repo    │     │  App Runner     │     │    Amazon ECR   │
│                 │     │                 │     │                 │
│  Push Source    │────▶│  Builds Image   │────▶│  Stores Image   │
│  Code           │     │  (Auto-build)   │     │  (Auto-created) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**Why this is wrong:**
- Less control over build process
- Build inconsistencies between environments
- Slower deployments (builds on every deploy)
- Harder to debug build failures
- Cannot test exact production image locally

---

## Implementation Guide

### Step 1: Build Docker Image

```bash
# Navigate to backend directory
cd backend

# Build production Docker image
docker build -f Dockerfile.apprunner -t [project-name]-backend:latest .

# Tag for ECR
docker tag [project-name]-backend:latest \
  [AWS_ACCOUNT_ID].dkr.ecr.[REGION].amazonaws.com/[project-name]-backend:latest

# Also tag with version/commit
docker tag [project-name]-backend:latest \
  [AWS_ACCOUNT_ID].dkr.ecr.[REGION].amazonaws.com/[project-name]-backend:$(git rev-parse --short HEAD)
```

### Step 2: Push to ECR

```bash
# Authenticate with ECR
aws ecr get-login-password --region [REGION] | \
  docker login --username AWS --password-stdin [AWS_ACCOUNT_ID].dkr.ecr.[REGION].amazonaws.com

# Create ECR repository (first time only)
aws ecr create-repository --repository-name [project-name]-backend --region [REGION]

# Push image
docker push [AWS_ACCOUNT_ID].dkr.ecr.[REGION].amazonaws.com/[project-name]-backend:latest
docker push [AWS_ACCOUNT_ID].dkr.ecr.[REGION].amazonaws.com/[project-name]-backend:$(git rev-parse --short HEAD)
```

### Step 3: Configure App Runner

When creating/updating App Runner service:

```json
{
  "SourceConfiguration": {
    "ImageRepository": {
      "ImageIdentifier": "[AWS_ACCOUNT_ID].dkr.ecr.[REGION].amazonaws.com/[project-name]-backend:latest",
      "ImageRepositoryType": "ECR",
      "ImageConfiguration": {
        "Port": "3005",
        "RuntimeEnvironmentVariables": {
          "NODE_ENV": "production"
        }
      }
    },
    "AutoDeploymentsEnabled": true
  }
}
```

**IMPORTANT:** Set `ImageRepositoryType` to `ECR`, NOT `ECR_PUBLIC` or source-based options.

---

## GitHub Actions CI/CD Pipeline

### Recommended Workflow

```yaml
# .github/workflows/deploy-backend-production.yml
name: Deploy Backend to Production

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: [project-name]-backend
  APP_RUNNER_SERVICE: [project-name]-backend-prod

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build Docker image
        working-directory: ./backend
        run: |
          docker build -f Dockerfile.apprunner -t $ECR_REPOSITORY:${{ github.sha }} .
          docker tag $ECR_REPOSITORY:${{ github.sha }} $ECR_REPOSITORY:latest

      - name: Push to ECR
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        run: |
          docker tag $ECR_REPOSITORY:${{ github.sha }} $ECR_REGISTRY/$ECR_REPOSITORY:${{ github.sha }}
          docker tag $ECR_REPOSITORY:latest $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:${{ github.sha }}
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest

      - name: Update App Runner service
        run: |
          aws apprunner update-service \
            --service-arn ${{ secrets.APP_RUNNER_SERVICE_ARN }} \
            --source-configuration '{
              "ImageRepository": {
                "ImageIdentifier": "${{ steps.login-ecr.outputs.registry }}/${{ env.ECR_REPOSITORY }}:${{ github.sha }}",
                "ImageRepositoryType": "ECR",
                "ImageConfiguration": {
                  "Port": "3005"
                }
              }
            }'
```

---

## App Runner Service Creation (AWS Console)

When creating an App Runner service in the AWS Console:

1. **Source**: Select **Container registry** (NOT "Source code repository")
2. **Provider**: Select **Amazon ECR**
3. **Container image URI**: Enter your ECR image URI
4. **Deployment settings**: Choose automatic or manual deployment triggers
5. **ECR access role**: Create or select an IAM role with ECR pull permissions

**Screenshot Reference Points:**
- Source and deployment: "Container registry" → "Amazon ECR"
- NOT: "Source code repository" → "GitHub"

---

## App Runner Service Creation (AWS CLI)

```bash
# Create App Runner service with ECR image source
aws apprunner create-service \
  --service-name "[project-name]-backend-prod" \
  --source-configuration '{
    "AuthenticationConfiguration": {
      "AccessRoleArn": "arn:aws:iam::[ACCOUNT_ID]:role/AppRunnerECRAccessRole"
    },
    "AutoDeploymentsEnabled": true,
    "ImageRepository": {
      "ImageIdentifier": "[ACCOUNT_ID].dkr.ecr.[REGION].amazonaws.com/[project-name]-backend:latest",
      "ImageRepositoryType": "ECR",
      "ImageConfiguration": {
        "Port": "3005",
        "RuntimeEnvironmentVariables": {
          "NODE_ENV": "production",
          "DATABASE_URL": "your-database-url"
        }
      }
    }
  }' \
  --instance-configuration '{
    "Cpu": "1 vCPU",
    "Memory": "2 GB"
  }' \
  --health-check-configuration '{
    "Protocol": "HTTP",
    "Path": "/health",
    "Interval": 10,
    "Timeout": 5,
    "HealthyThreshold": 1,
    "UnhealthyThreshold": 5
  }'
```

---

## Required IAM Role for ECR Access

App Runner needs an IAM role to pull images from ECR:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetAuthorizationToken"
      ],
      "Resource": "*"
    }
  ]
}
```

Trust relationship:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "build.apprunner.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

---

## Benefits of Docker Container Deployment

| Aspect | Docker Container (CORRECT) | Source Build (INCORRECT) |
|--------|---------------------------|--------------------------|
| Build Control | Full control over build process | Limited control |
| Consistency | Same image tested locally and deployed | May differ |
| Speed | Faster deployments (pre-built) | Slower (builds each time) |
| Debugging | Can inspect exact production image | Harder to reproduce |
| Caching | Docker layer caching | Limited caching |
| Security | Scan images before deployment | Post-deployment scanning only |

---

## Checklist Before Deployment

- [ ] Docker image builds successfully locally
- [ ] Image runs correctly with `docker run`
- [ ] Health check endpoint responds
- [ ] Image pushed to ECR with correct tags
- [ ] App Runner service configured for ECR (not source)
- [ ] IAM role has ECR pull permissions
- [ ] Environment variables configured in App Runner

---

## Troubleshooting

### "ImagePullBackOff" Error
- Verify IAM role has ECR permissions
- Check image URI is correct
- Ensure image exists in ECR

### "Container failed to start"
- Check health check endpoint path
- Verify PORT environment variable matches exposed port
- Review CloudWatch logs for startup errors

### "Service update failed"
- Ensure image tag exists in ECR
- Check App Runner service limits
- Review IAM role permissions

---

## Related Documentation

- [Dockerfile.apprunner](../../backend/Dockerfile.apprunner) - Production Docker configuration
- [backend/CLAUDE.md](../../backend/CLAUDE.md) - Backend development standards
- [PRODUCTION_DEPLOYMENT_CHECKLIST.md](../PRODUCTION_DEPLOYMENT_CHECKLIST.md) - Full deployment checklist

---

**Version:** 1.0.0
**Last Updated:** 2025-12-17
**Maintained By:** Quik Nation DevOps
