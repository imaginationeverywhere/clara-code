# Implement AWS Deployment

Implement production-grade AWS deployment infrastructure with Amplify for frontends, EC2/App Runner for backends, PM2 process management, and comprehensive automation following DreamiHairCare's battle-tested patterns.

## Command Usage

```
/implement-aws-deployment [options]
```

### Options
- `--full` - Complete AWS deployment stack (frontend + backend) (default)
- `--frontend-only` - AWS Amplify deployment only
- `--backend-only` - EC2/App Runner deployment only
- `--app-runner` - Use AWS App Runner for backend (recommended for production)
- `--ec2` - Use EC2 with PM2 for backend (cost-effective for dev/staging)
- `--audit` - Audit existing deployment configuration

### Feature Options
- `--with-ci-cd` - Include GitHub Actions workflows
- `--with-ssl` - Include SSL certificate setup
- `--with-monitoring` - Include CloudWatch monitoring
- `--with-backups` - Include pre-deployment backup scripts

## Pre-Implementation Checklist

### AWS Account Setup
- [ ] AWS account created
- [ ] IAM user with appropriate permissions
- [ ] AWS CLI installed and configured locally
- [ ] AWS access keys available

### For Frontend (Amplify)
- [ ] GitHub repository connected to AWS
- [ ] Amplify app created in AWS Console
- [ ] Custom domain configured (optional)

### For Backend (EC2)
- [ ] EC2 instance running (Amazon Linux 2 recommended)
- [ ] SSH key pair created
- [ ] Security group configured (ports 22, 80, 443, 3000-3100)
- [ ] Elastic IP associated (optional but recommended)

### For Backend (App Runner)
- [ ] ECR repository created (if using private images)
- [ ] App Runner service role configured
- [ ] VPC connector configured (if connecting to RDS)

### Environment Variables
```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=123456789012

# EC2 Configuration (if using EC2)
EC2_HOST_IP=3.xxx.xxx.xxx
EC2_SSH_KEY_NAME=my-key-pair

# Domain Configuration
PROJECT_DOMAIN=example.com
PROJECT_NAME=myproject
```

## Implementation Phases

### Phase 1: AWS Parameter Store Setup

#### 1.1 Store Deployment Secrets
```bash
# Store SSH key for EC2 access
aws ssm put-parameter \
  --name "/project/deployment/ssh-key" \
  --value "$(cat ~/.ssh/ec2-key.pem)" \
  --type "SecureString"

# Store target hosts
aws ssm put-parameter \
  --name "/project/deployment/production-host" \
  --value "3.xxx.xxx.xxx" \
  --type "SecureString"

aws ssm put-parameter \
  --name "/project/deployment/staging-host" \
  --value "3.xxx.xxx.xxx" \
  --type "SecureString"
```

#### 1.2 Store Application Secrets
```bash
# Database
aws ssm put-parameter --name "/project/production/DATABASE_URL" --type "SecureString" --value "postgresql://..."

# Clerk
aws ssm put-parameter --name "/project/production/CLERK_SECRET_KEY" --type "SecureString" --value "sk_live_..."

# Stripe
aws ssm put-parameter --name "/project/production/STRIPE_SECRET_KEY" --type "SecureString" --value "sk_live_..."
```

### Phase 2: Frontend Deployment (Amplify)

#### 2.1 Create amplify.yml
See **aws-deployment-standard** skill for complete template.

#### 2.2 Configure Amplify App
1. Connect GitHub repository
2. Select branch (main for production)
3. Set app root to `frontend`
4. Configure environment variables
5. Set up custom domain

### Phase 3: Backend Deployment (EC2)

#### 3.1 EC2 Infrastructure Setup
Run the setup script on your EC2 instance:
```bash
# Install Node.js, PM2, nginx
./scripts/setup-ec2-infrastructure.sh
```

#### 3.2 Create PM2 Configuration
See **aws-deployment-standard** skill for ecosystem.config.js template.

#### 3.3 Configure nginx
See **aws-deployment-standard** skill for nginx configuration.

#### 3.4 Set Up SSL
```bash
sudo certbot --nginx -d api.example.com
```

### Phase 4: Backend Deployment (App Runner - Alternative)

#### 4.1 Create Dockerfile.apprunner
See **docker-containerization-standard** skill.

#### 4.2 Create apprunner.yaml
```yaml
version: 1.0
runtime: nodejs18
build:
  commands:
    build:
      - npm ci --legacy-peer-deps
      - npm run build
run:
  command: node dist/index.js
  network:
    port: 8080
    env: PORT
  env:
    - name: NODE_ENV
      value: production
```

### Phase 5: GitHub Actions CI/CD

See **ci-cd-pipeline-standard** skill for complete workflows.

### Phase 6: Domain Configuration

#### 6.1 Route53 DNS Records
```bash
# API subdomain (for EC2)
api.example.com → A → EC2 Elastic IP

# API subdomain (for App Runner)
api.example.com → CNAME → xxx.us-east-1.awsapprunner.com

# Frontend (Amplify manages automatically)
```

## File Structure

```
project/
├── amplify.yml                    # Amplify build configuration
├── backend/
│   ├── Dockerfile                 # Multi-stage Docker build
│   ├── Dockerfile.apprunner       # App Runner optimized
│   ├── ecosystem.config.js        # PM2 configuration
│   └── scripts/
│       ├── setup-ec2-infrastructure.sh
│       ├── setup-parameter-store.sh
│       └── pre-deployment-backup.js
├── .github/workflows/
│   ├── deploy-backend.yml
│   ├── deploy-frontend.yml
│   └── health-checks.yml
└── infrastructure/
    └── nginx/
        └── project.conf
```

## Verification Checklist

### Frontend (Amplify)
- [ ] Build succeeds in Amplify Console
- [ ] Custom domain resolves
- [ ] SSL certificate active
- [ ] Environment variables configured
- [ ] Auto-deploy on push enabled

### Backend (EC2)
- [ ] PM2 process running
- [ ] nginx reverse proxy working
- [ ] SSL certificate valid
- [ ] Health endpoint responding
- [ ] GraphQL endpoint accessible
- [ ] Webhooks reachable

### Backend (App Runner)
- [ ] Service deployed and running
- [ ] Health check passing
- [ ] Custom domain configured
- [ ] Auto-scaling working
- [ ] Logs visible in CloudWatch

### Security
- [ ] All secrets in Parameter Store
- [ ] No .env files on servers
- [ ] HTTPS enforced everywhere
- [ ] Security headers configured
- [ ] Rate limiting enabled

### CI/CD
- [ ] GitHub Actions workflows created
- [ ] Secrets configured in repository
- [ ] Branch protection enabled
- [ ] Deployment validation passing

## Related Skills

- **aws-deployment-standard** - Complete AWS patterns
- **docker-containerization-standard** - Docker builds
- **ci-cd-pipeline-standard** - GitHub Actions workflows

## Related Commands

- `/implement-ci-cd` - CI/CD pipeline setup
- `/implement-notifications` - Deployment notifications
