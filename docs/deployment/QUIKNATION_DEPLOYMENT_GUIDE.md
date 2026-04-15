# QuikNation Deployment Guide

## Overview

This comprehensive guide covers the complete QuikNation deployment workflow for imaginationeverywhere organization developers. The system provides automated deployment to EC2 instances using secure SSH key management via AWS SSM Parameter Store.

## 🏗️ Architecture Overview

### Infrastructure Components

- **EC2 Instances**: Two shared instances for application hosting
  - QuikNation-Apps (i-080ef6ece906660c0): Primary deployment target
  - QuikInfluence-Server (i-033b611761fe27b79): Secondary deployment target
- **AWS SSM Parameter Store**: Centralized, encrypted SSH key storage
- **GitHub Actions**: CI/CD automation
- **Port Management**: Automatic allocation and conflict resolution

### Security Model

- **SSH Keys**: Stored encrypted in AWS SSM Parameter Store
- **AWS Credentials**: Developer credentials with SSM access
- **GitHub Secrets**: Repository-level configuration
- **No Manual Key Management**: Automatic key retrieval and usage

## 🚀 Complete Setup Workflow

### Step 1: AWS CLI Setup

**Purpose**: Install and configure AWS CLI for SSH key access

**Command**: `setup-aws-cli` (in Claude Code)

**What it does**:
1. Detects operating system (macOS, Linux, Windows)
2. Installs AWS CLI using appropriate method:
   - macOS: Homebrew or direct download
   - Linux: Package manager or direct download
   - Windows: MSI installer
3. Guides through credential configuration
4. Tests SSM Parameter Store access
5. Verifies region is set to us-east-2

**Prerequisites**: AWS credentials with SSM Parameter Store permissions

**Output**:
```bash
✅ AWS CLI installed and configured
✅ Region set to us-east-2
✅ SSH keys accessible from SSM Parameter Store
```

### Step 2: GitHub Repository Setup

**Purpose**: Configure GitHub repository for deployment

**Command**: `setup-github-deployment` (in Claude Code)

**What it does**:
1. Validates GitHub repository belongs to imaginationeverywhere
2. Guides through repository secrets setup:
   - DATABASE_URL_STAGING
   - DATABASE_URL_PRODUCTION
   - SSH keys (if not organization-level)
3. Configures repository variables:
   - PORT_STAGING
   - PORT_PRODUCTION
   - USE_BUILT
   - EC2_INSTANCE
4. Checks GitHub Actions permissions

**Prerequisites**: Repository admin access or contact with admin

**Output**:
```bash
✅ Repository belongs to imaginationeverywhere
✅ Required secrets configured
✅ Repository variables set
✅ GitHub Actions enabled
```

### Step 3: QuikNation CLI Initialization

**Purpose**: Initialize QuikNation CLI and deployment configuration

**Command**: `setup-quiknation-deployment` (in Claude Code)

**What it does**:
1. Verifies prerequisites (AWS CLI, GitHub setup)
2. Initializes QuikNation CLI project
3. Allocates ports on selected EC2 instance
4. Creates GitHub Actions deployment workflow
5. Updates package.json with deployment scripts
6. Creates environment configuration template

**Prerequisites**: 
- Completed AWS CLI and GitHub setup
- PRD.md file exists
- Running from backend/ directory

**Output**:
```bash
✅ QuikNation CLI initialized
✅ Ports allocated (staging: 3001, production: 3101)
✅ GitHub Actions workflow created
✅ Package.json updated with deployment scripts
✅ Environment template created
```

### Step 4: Domain Management Setup (NEW - Optional)

**Purpose**: Configure custom domains and SSL certificates for professional URLs

**Command**: `setup-domain-management` (in Claude Code)

**What it does**:
1. Validates Route53 access and lists available hosted zones
2. Guides through domain pattern selection (api.domain.com, api-dev.domain.com)
3. Creates DNS records pointing to EC2 instances
4. Generates SSL certificates with Let's Encrypt
5. Configures nginx reverse proxy with SSL termination
6. Updates GitHub repository with domain environment variables
7. Enables domain health monitoring and certificate renewal

**Prerequisites**: 
- Completed steps 1-3
- AWS Route53 hosted zone configured
- Domain ownership verified

**Output**:
```bash
✅ Route53 hosted zones detected
✅ Domain patterns configured (api.yourproject.com)
✅ DNS records created and validated
✅ SSL certificates generated and installed
✅ Nginx reverse proxy configured
✅ Domain health monitoring enabled
```

### Step 5: Deployment Verification

**Purpose**: Comprehensive verification of entire setup including domains

**Command**: `verify-deployment-setup` (in Claude Code)

**What it does**:
1. Tests AWS CLI and SSH connectivity
2. Validates GitHub repository configuration
3. Checks QuikNation CLI functionality
4. Tests SSH connection to EC2 instances
5. Verifies domain configuration and SSL certificates (if configured)
6. Tests HTTPS endpoints and certificate validity
7. Generates deployment readiness report

**Prerequisites**: Completed steps 1-4

**Output**:
```bash
🎉 DEPLOYMENT READY!
✅ All checks passed
✅ Custom domains configured and accessible (if enabled)
✅ SSL certificates valid and monitored
✅ Ready for automatic deployment with professional URLs
```

## 🔄 Deployment Process

### First-Time Deployment

**Trigger**: First push to develop or main branch after setup

**Process**:
1. Developer pushes code to GitHub
2. GitHub Actions workflow triggers
3. Workflow authenticates using repository secrets
4. SSH keys retrieved from AWS SSM Parameter Store
5. Application built and packaged
6. Deployed to allocated port on EC2 instance
7. Health checks verify deployment
8. Success/failure notification via GitHub

### Subsequent Deployments

**Branch Strategy**:
- `develop` branch → Staging deployment (ports 3000-3099)
- `main` branch → Production deployment (ports 3100-3199)

**Automatic Process**:
```bash
# Developer workflow
git add .
git commit -m "Add feature"
git push origin develop  # → Automatic staging deployment

# After testing
git checkout main
git merge develop
git push origin main     # → Automatic production deployment
```

## 🛠️ Manual Deployment Options

### Using npm Scripts

```bash
# From backend/ directory
npm run deploy:staging          # Deploy to staging
npm run deploy:production       # Deploy to production
npm run deploy:status           # Check deployment status
npm run deploy:ports            # View port allocations

# Domain management scripts (if configured)
npm run domain:setup            # Set up domain configuration
npm run domain:create           # Create project domains
npm run domain:verify           # Verify domain and SSL status
npm run domain:list             # List domain configurations
npm run domain:remove           # Remove domain configuration
```

### Using QuikNation CLI Directly

```bash
# Global CLI usage
quiknation deploy --environment staging
quiknation deploy --environment production
quiknation status --instance quiknation-apps
quiknation ports --list --instance quiknation-apps

# Domain management CLI (if configured)
quiknation domain setup --instance quiknation-apps
quiknation domain create --project your-project-name
quiknation domain verify --project your-project-name
quiknation domain list
quiknation domain remove --project your-project-name
```

### Using Helper Scripts

```bash
# Direct script execution
node scripts/verify-aws-setup.js      # Verify AWS configuration
node scripts/setup-github-secrets.js  # GitHub setup guidance
```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. AWS CLI Not Found
```bash
# Symptoms
aws: command not found

# Solution
setup-aws-cli  # Run in Claude Code
# Or manually install:
brew install awscli  # macOS
```

#### 2. AWS Credentials Invalid
```bash
# Symptoms
Unable to locate credentials

# Solution
aws configure
# Enter your Access Key ID, Secret Access Key, region: us-east-2
```

#### 3. SSH Key Access Denied
```bash
# Symptoms
❌ Could not retrieve SSH key from AWS SSM

# Solutions
# Check permissions
aws ssm get-parameter --name "/quiknation-cli/ssh-keys/quiknation-modern-backend" --with-decryption

# Verify region
aws configure get region  # Should be us-east-2

# Contact AWS admin for SSM permissions
```

#### 4. GitHub Actions Failing
```bash
# Symptoms
Deployment workflow fails

# Solutions
# Check repository secrets
verify-deployment-setup  # Run in Claude Code

# Verify secrets exist:
# - DATABASE_URL_STAGING
# - DATABASE_URL_PRODUCTION

# Check GitHub Actions permissions in repository settings
```

#### 5. Port Conflicts
```bash
# Symptoms
Port already in use

# Solutions
quiknation ports --list --instance quiknation-apps
quiknation ports --release old-project --instance quiknation-apps
```

#### 6. QuikNation CLI Not Found
```bash
# Symptoms
quiknation: command not found

# Solution
npm install -g git+ssh://git@github.com/imaginationeverywhere/quiknation-cli.git
```

#### 7. Domain Configuration Issues (NEW)
```bash
# Symptoms
❌ No hosted zones found in Route53
❌ Domain configuration failed

# Solutions
# Check Route53 access
aws route53 list-hosted-zones

# Verify hosted zone exists
aws route53 list-hosted-zones --query "HostedZones[?Name=='yourproject.com.']"

# Run domain setup
setup-domain-management  # Run in Claude Code
```

#### 8. SSL Certificate Problems (NEW)
```bash
# Symptoms
❌ SSL certificate generation failed
❌ HTTPS not accessible

# Solutions
# Check certificate status
npm run domain:verify

# Check domain ownership
dig api.yourproject.com

# Verify DNS propagation
nslookup api.yourproject.com 8.8.8.8

# Regenerate certificates
npm run domain:setup
```

#### 9. DNS Resolution Issues (NEW)
```bash
# Symptoms
❌ DNS resolution failed
❌ Domain not accessible

# Solutions
# Check DNS records
dig +short api.yourproject.com A

# Check nameservers
dig NS yourproject.com

# Verify Route53 records
aws route53 list-resource-record-sets --hosted-zone-id Z1234567890ABC

# Wait for DNS propagation (up to 48 hours)
```

### Debugging Commands

```bash
# Check AWS setup
aws sts get-caller-identity
aws ssm describe-parameters --parameter-filters "Key=Name,Values=/quiknation-cli"

# Check GitHub setup
git remote -v
gh auth status  # If GitHub CLI installed

# Check QuikNation CLI
quiknation --version
quiknation config --list

# Check SSH connectivity
quiknation status --instance quiknation-apps

# Check domain configuration (if configured)
npm run domain:list
npm run domain:verify
aws route53 list-hosted-zones --max-items 5

# Test HTTPS endpoints
curl -I https://api.yourproject.com/health
openssl s_client -servername api.yourproject.com -connect api.yourproject.com:443 -showcerts
```

## 📊 Monitoring and Maintenance

### Deployment Status Monitoring

```bash
# Check running applications
npm run deploy:status

# View EC2 instance processes
quiknation status --instance quiknation-apps

# Check port usage
npm run deploy:ports
```

### Log Access

```bash
# SSH to EC2 instance
ssh -i ~/.ssh/quiknation-modern-backend-key.pem ec2-user@3.89.29.97

# View PM2 processes
pm2 list
pm2 logs your-app-name

# Check port usage
netstat -tlnp | grep :30
```

### Health Checks

**Automatic Health Checks**: Built into deployment workflow
- HTTP endpoint testing
- Process verification
- Port accessibility

**Manual Health Checks**:
```bash
# Test application endpoint
curl http://3.89.29.97:YOUR_PORT/health

# Check if port is listening
quiknation execute --instance quiknation-modern-backend --command "netstat -tlnp | grep :YOUR_PORT"
```

## 🔐 Security Best Practices

### SSH Key Management
- ✅ SSH keys stored encrypted in AWS SSM Parameter Store
- ✅ No manual key file handling required
- ✅ Automatic key rotation support
- ❌ Never commit SSH keys to repositories

### Database Security
- ✅ Use separate databases for staging/production
- ✅ Enable SSL connections (sslmode=require)
- ✅ Store connection strings in GitHub secrets only
- ❌ Never commit database URLs to code

### GitHub Repository Security
- ✅ Enable branch protection on main branch
- ✅ Require PR reviews for production deployments
- ✅ Use organization-level secrets for SSH keys
- ✅ Regular secret rotation

### AWS Security
- ✅ Use IAM users with minimal required permissions
- ✅ Enable MFA on AWS accounts
- ✅ Regular access key rotation
- ✅ Monitor SSM Parameter Store access

## 📈 Performance Optimization

### EC2 Instance Management
- **Resource Monitoring**: Regular CPU/memory checks
- **Port Allocation**: Efficient port range usage
- **Process Management**: PM2 for service lifecycle
- **Load Balancing**: Nginx reverse proxy configuration

### Deployment Optimization
- **Build Caching**: Efficient GitHub Actions workflows
- **Asset Optimization**: TypeScript compilation
- **Health Check Tuning**: Fast deployment verification
- **Rollback Capability**: Quick recovery from issues

## 🎯 Advanced Configuration

### Multiple Environment Support

For projects requiring dev/staging/production:

```yaml
# .github/workflows/deploy-backend.yml
environments:
  development:
    url: https://dev.myproject.com
  staging:
    url: https://staging.myproject.com
  production:
    url: https://myproject.com
```

### Custom Deployment Triggers

```yaml
# Deploy on tag creation
on:
  push:
    tags: ['v*']

# Deploy on specific file changes
on:
  push:
    paths: ['backend/**', '.github/workflows/**']
```

### Multi-Instance Deployment

```bash
# Deploy to QuikInfluence-Server instead
quiknation deploy --environment staging --instance quikinfluence-server

# Configure in repository variables
EC2_INSTANCE=quikinfluence-server
```

## 📚 Reference

### Port Allocation Ranges

| Instance | Environment | Port Range |
|----------|-------------|------------|
| QuikNation-Apps | Staging | 3000-3099 |
| QuikNation-Apps | Production | 3100-3199 |
| QuikInfluence-Server | Staging | 3200-3299 |
| QuikInfluence-Server | Production | 3300-3399 |

### Required AWS Permissions

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter",
        "ssm:GetParameters",
        "ssm:DescribeParameters"
      ],
      "Resource": "arn:aws:ssm:us-east-2:*:parameter/quiknation-cli/*"
    }
  ]
}
```

### GitHub Repository Secrets

| Secret Name | Description | Example |
|-------------|-------------|---------|
| DATABASE_URL_STAGING | Staging database connection | postgresql://user:pass@host:5432/db_staging |
| DATABASE_URL_PRODUCTION | Production database connection | postgresql://user:pass@host:5432/db_production |
| QUIKNATION_APPS_SSH_KEY | SSH key for QuikNation-Apps | -----BEGIN RSA PRIVATE KEY----- |
| QUIKINFLUENCE_SERVER_SSH_KEY | SSH key for QuikInfluence-Server | -----BEGIN RSA PRIVATE KEY----- |

### GitHub Repository Variables

| Variable Name | Description | Example |
|---------------|-------------|---------|
| PORT_STAGING | Staging deployment port | 3001 |
| PORT_PRODUCTION | Production deployment port | 3101 |
| USE_BUILT | Use compiled TypeScript | true |
| EC2_INSTANCE | Target EC2 instance | quiknation-apps |

## 🎉 Success Criteria

### Deployment Ready Checklist

- ✅ AWS CLI installed and configured
- ✅ AWS credentials with SSM access working
- ✅ SSH keys accessible from AWS SSM Parameter Store
- ✅ GitHub repository properly configured
- ✅ Repository secrets and variables set
- ✅ QuikNation CLI installed and functional
- ✅ Ports allocated on EC2 instance
- ✅ GitHub Actions workflow created
- ✅ SSH connectivity to EC2 verified
- ✅ Deployment verification passed

### First Deployment Success

- ✅ Code builds successfully
- ✅ GitHub Actions workflow completes
- ✅ Application deployed to correct port
- ✅ Health check endpoint responds
- ✅ PM2 process running
- ✅ No port conflicts

### Ongoing Operations

- ✅ Automatic deployments on git push
- ✅ Staging and production environments working
- ✅ Monitoring and logging accessible
- ✅ Quick rollback capability
- ✅ Team can deploy independently

This guide provides everything needed for successful QuikNation deployment setup and ongoing operations. For additional support, refer to the Claude Code commands or contact the DevOps team.