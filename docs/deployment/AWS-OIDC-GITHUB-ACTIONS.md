# AWS OIDC Authentication for GitHub Actions

**MANDATORY for all Quik Nation projects** - This document describes how to set up secure, keyless authentication between GitHub Actions and AWS using OpenID Connect (OIDC).

## Why OIDC? (Security Benefits)

| Aspect | Access Keys (OLD) | OIDC (NEW - REQUIRED) |
|--------|-------------------|----------------------|
| **Credential Lifetime** | Months/years until rotated | ~1 hour per job |
| **Storage** | Stored in GitHub Secrets | No secrets stored |
| **If Leaked** | Long-term access to AWS | Token already expired |
| **Rotation** | Manual process | Automatic |
| **Audit Trail** | Limited visibility | Full CloudTrail logging |
| **Compliance** | Fails security audits | Meets enterprise requirements |

## How It Works

```
GitHub Actions Job Starts
        │
        ▼
GitHub generates OIDC token with claims:
  - repository: "owner/repo"
  - ref: "refs/heads/main"
  - workflow: "deploy.yml"
        │
        ▼
GitHub Actions calls AWS STS AssumeRoleWithWebIdentity
        │
        ▼
AWS validates token with GitHub's OIDC provider
        │
        ▼
AWS returns temporary credentials (valid ~1 hour)
        │
        ▼
Job runs with temporary credentials
        │
        ▼
Job ends, credentials automatically expire
```

## Quick Setup (5 Minutes)

### Option 1: Automated Script (Recommended)

```bash
# From your project root
./scripts/setup-github-oidc.sh

# Or specify options
./scripts/setup-github-oidc.sh \
  --repo owner/repo-name \
  --role-name GitHubActions-MyProject \
  --region us-east-1
```

### Option 2: Manual Setup

#### Step 1: Create OIDC Identity Provider (One-Time per AWS Account)

```bash
# Check if provider already exists
aws iam list-open-id-connect-providers \
  --query 'OpenIDConnectProviderList[*].Arn' \
  --output text | grep github

# If not found, create it
aws iam create-open-id-connect-provider \
  --url "https://token.actions.githubusercontent.com" \
  --client-id-list "sts.amazonaws.com" \
  --thumbprint-list "6938fd4d98bab03faadb97b34396831e3780aea1" "1c58a3a8518e8759bf075b76b750d4f2df264fcd" \
  --tags Key=Purpose,Value=GitHubActions
```

#### Step 2: Create IAM Role

```bash
# Get your AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query 'Account' --output text)

# Set your GitHub repo
GITHUB_REPO="owner/repo-name"

# Create trust policy
cat > /tmp/trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::${AWS_ACCOUNT_ID}:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:${GITHUB_REPO}:*"
        }
      }
    }
  ]
}
EOF

# Create the role
aws iam create-role \
  --role-name GitHubActions-YourProjectName \
  --assume-role-policy-document file:///tmp/trust-policy.json \
  --description "GitHub Actions OIDC role for ${GITHUB_REPO}"
```

#### Step 3: Attach Permissions

```bash
# Create permissions policy (customize based on your needs)
cat > /tmp/permissions.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "SSMParameterStoreRead",
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter",
        "ssm:GetParameters",
        "ssm:GetParametersByPath"
      ],
      "Resource": [
        "arn:aws:ssm:us-east-1:ACCOUNT_ID:parameter/your-project/*",
        "arn:aws:ssm:us-east-1:ACCOUNT_ID:parameter/shared-ec2/*",
        "arn:aws:ssm:us-east-1:ACCOUNT_ID:parameter/ec2/*"
      ]
    },
    {
      "Sid": "EC2DescribeInstances",
      "Effect": "Allow",
      "Action": ["ec2:DescribeInstances"],
      "Resource": "*"
    },
    {
      "Sid": "ECRAccess",
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload",
        "ecr:DescribeRepositories",
        "ecr:CreateRepository",
        "ecr:TagResource"
      ],
      "Resource": "*"
    },
    {
      "Sid": "AppRunnerAccess",
      "Effect": "Allow",
      "Action": [
        "apprunner:CreateService",
        "apprunner:UpdateService",
        "apprunner:DescribeService",
        "apprunner:ListServices",
        "apprunner:StartDeployment",
        "apprunner:TagResource"
      ],
      "Resource": "*"
    },
    {
      "Sid": "IAMPassRole",
      "Effect": "Allow",
      "Action": "iam:PassRole",
      "Resource": "arn:aws:iam::ACCOUNT_ID:role/*",
      "Condition": {
        "StringLike": {
          "iam:PassedToService": [
            "apprunner.amazonaws.com",
            "build.apprunner.amazonaws.com"
          ]
        }
      }
    },
    {
      "Sid": "IAMRoleManagement",
      "Effect": "Allow",
      "Action": [
        "iam:GetRole",
        "iam:CreateRole",
        "iam:AttachRolePolicy",
        "iam:CreateServiceLinkedRole"
      ],
      "Resource": [
        "arn:aws:iam::ACCOUNT_ID:role/AppRunner*",
        "arn:aws:iam::ACCOUNT_ID:role/aws-service-role/apprunner.amazonaws.com/*"
      ]
    }
  ]
}
EOF

# Replace ACCOUNT_ID placeholder
sed -i '' "s/ACCOUNT_ID/${AWS_ACCOUNT_ID}/g" /tmp/permissions.json

# Attach the policy
aws iam put-role-policy \
  --role-name GitHubActions-YourProjectName \
  --policy-name DeploymentPolicy \
  --policy-document file:///tmp/permissions.json
```

#### Step 4: Update Workflows

Update your GitHub Actions workflows:

```yaml
name: Deploy

on:
  push:
    branches: [main]

# REQUIRED: Add permissions block at workflow level
permissions:
  id-token: write   # Required for OIDC token
  contents: read    # Required for checkout

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # OIDC Authentication (replaces access keys)
      - name: Configure AWS credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::ACCOUNT_ID:role/GitHubActions-YourProject
          aws-region: us-east-1

      # Your deployment steps...
```

## Trust Policy Conditions (Security)

### Allow All Branches (Default)

```json
"StringLike": {
  "token.actions.githubusercontent.com:sub": "repo:owner/repo:*"
}
```

### Allow Only Specific Branches

```json
"StringLike": {
  "token.actions.githubusercontent.com:sub": [
    "repo:owner/repo:ref:refs/heads/main",
    "repo:owner/repo:ref:refs/heads/develop"
  ]
}
```

### Allow Only Pull Requests

```json
"StringLike": {
  "token.actions.githubusercontent.com:sub": "repo:owner/repo:pull_request"
}
```

### Allow Specific Environments

```json
"StringLike": {
  "token.actions.githubusercontent.com:sub": "repo:owner/repo:environment:production"
}
```

## Existing Projects Registry

| Project | Repo | IAM Role ARN | Status |
|---------|------|--------------|--------|
| world-cup-ready | imaginationeverywhere/world-cup-ready | arn:aws:iam::727646498347:role/GitHubActions-WorldCupReady | ✅ Active |
| *Add your project* | | | |

## Troubleshooting

### Error: "Not authorized to perform sts:AssumeRoleWithWebIdentity"

**Cause:** Trust policy doesn't match the GitHub repo/branch.

**Fix:** Verify trust policy conditions match your repo:
```bash
aws iam get-role --role-name GitHubActions-YourProject \
  --query 'Role.AssumeRolePolicyDocument' --output json
```

### Error: "OpenIDConnect provider not found"

**Cause:** OIDC provider not created in AWS account.

**Fix:** Create the provider:
```bash
aws iam create-open-id-connect-provider \
  --url "https://token.actions.githubusercontent.com" \
  --client-id-list "sts.amazonaws.com" \
  --thumbprint-list "6938fd4d98bab03faadb97b34396831e3780aea1" "1c58a3a8518e8759bf075b76b750d4f2df264fcd"
```

### Error: "Permissions missing for action"

**Cause:** Role policy doesn't include required permissions.

**Fix:** Add missing permissions:
```bash
aws iam put-role-policy \
  --role-name GitHubActions-YourProject \
  --policy-name AdditionalPermissions \
  --policy-document file:///tmp/additional-permissions.json
```

### Error: "id-token permission denied"

**Cause:** Missing `permissions` block in workflow.

**Fix:** Add at workflow level:
```yaml
permissions:
  id-token: write
  contents: read
```

## Migration Checklist

When migrating an existing project from access keys to OIDC:

- [ ] Create OIDC provider (if not exists in AWS account)
- [ ] Create IAM role with trust policy for your repo
- [ ] Attach necessary permissions to role
- [ ] Add `permissions` block to all workflows
- [ ] Replace `aws-access-key-id`/`aws-secret-access-key` with `role-to-assume`
- [ ] Test deployment on non-production branch first
- [ ] Remove old access keys from GitHub Secrets
- [ ] Deactivate/delete old IAM access keys

## Security Best Practices

1. **Use specific branch conditions** - Don't allow all branches in production
2. **Use environments** - Require approval for production deployments
3. **Minimal permissions** - Only grant what's needed
4. **Regular audits** - Review CloudTrail for role assumptions
5. **Tag resources** - Tag roles for cost/security tracking

## References

- [GitHub Docs: Configuring OIDC in AWS](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)
- [AWS Docs: Creating OIDC Identity Providers](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html)
- [aws-actions/configure-aws-credentials](https://github.com/aws-actions/configure-aws-credentials)

---

**Last Updated:** January 2026
**Maintained By:** Quik Nation DevOps Team
**Compliance:** Required for all production deployments
