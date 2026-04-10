# Setup GitHub Deployment Command

## Overview
This Claude Code custom command helps developers configure GitHub repository settings for QuikNation CLI deployment. It guides through setting up repository secrets, variables, and GitHub Actions permissions necessary for automatic deployment to EC2 instances.

## Command Usage

**In Claude Code, type:**
```
setup-github-deployment
```

Or ask Claude naturally:
```
"Can you run setup-github-deployment?"
"Please help me setup GitHub for QuikNation deployment"
```

## Prerequisites

✅ **You already have:**
- Access to the `imaginationeverywhere` GitHub organization
- A GitHub repository created for your project
- Repository admin permissions (or access to someone who has them)
- AWS credentials configured (run `setup-aws-cli` first if needed)

❌ **You don't have:**
- GitHub repository secrets configured for deployment
- Repository variables set up for port management

## What This Command Does

When you invoke this command, Claude will:

### 1. **Repository Validation**
   - Check if current directory is a git repository
   - Verify GitHub remote URL is set
   - Confirm repository belongs to `imaginationeverywhere` organization
   - Validate repository access and permissions

### 2. **Current Repository Information**
   ```bash
   # Check current repository
   git remote -v
   
   # Example output:
   # origin  git@github.com:imaginationeverywhere/my-project.git (fetch)
   # origin  git@github.com:imaginationeverywhere/my-project.git (push)
   ```

### 3. **Required Repository Secrets Setup**

   **Navigate to Repository Settings:**
   1. Go to your GitHub repository
   2. Click **Settings** tab
   3. Click **Secrets and variables** → **Actions**
   4. Click **New repository secret**

   **Required Secrets to Add:**

   **Database Secrets:**
   ```
   Name: DATABASE_URL_STAGING
   Value: postgresql://username:password@host:5432/database_staging
   Description: NEON PostgreSQL staging database URL
   ```

   ```
   Name: DATABASE_URL_PRODUCTION  
   Value: postgresql://username:password@host:5432/database_production
   Description: NEON PostgreSQL production database URL
   ```

   **SSH Key Secrets (Organization Level - Usually Already Set):**
   ```
   Name: QUIKNATION_APPS_SSH_KEY
   Value: [SSH private key content - managed by organization admin]
   Description: SSH private key for QuikNation-Apps EC2 instance
   ```

   ```
   Name: QUIKINFLUENCE_SERVER_SSH_KEY
   Value: [SSH private key content - managed by organization admin]
   Description: SSH private key for QuikInfluence-Server EC2 instance
   ```

   **Domain Management Secrets (NEW - Optional):**
   ```
   Name: ROUTE53_HOSTED_ZONE_ID
   Value: Z1234567890ABC
   Description: Route53 hosted zone ID for domain management (if using custom domains)
   ```

   ```
   Name: DOMAIN_EMAIL
   Value: admin@yourproject.com
   Description: Email address for SSL certificate generation and renewal notifications
   ```

### 4. **Required Repository Variables Setup**

   **Navigate to Repository Variables:**
   1. In **Secrets and variables** → **Actions**
   2. Click **Variables** tab
   3. Click **New repository variable**

   **Required Variables to Add:**

   ```
   Name: PORT_STAGING
   Value: [Will be assigned by QuikNation CLI during setup]
   Description: Port number for staging deployment
   ```

   ```
   Name: PORT_PRODUCTION
   Value: [Will be assigned by QuikNation CLI during setup]  
   Description: Port number for production deployment
   ```

   ```
   Name: USE_BUILT
   Value: true
   Description: Use built TypeScript files for deployment
   ```

   ```
   Name: EC2_INSTANCE
   Value: quiknation-apps
   Description: Target EC2 instance for deployment
   ```

   **Domain Configuration Variables (NEW - Optional):**

   ```
   Name: DOMAIN_STAGING
   Value: api-dev.yourproject.com
   Description: Custom domain for staging environment (if domain management enabled)
   ```

   ```
   Name: DOMAIN_PRODUCTION
   Value: api.yourproject.com
   Description: Custom domain for production environment (if domain management enabled)
   ```

   ```
   Name: SSL_ENABLED
   Value: true
   Description: Enable SSL certificate automation (if domain management enabled)
   ```

   ```
   Name: CUSTOM_DOMAIN_ENABLED
   Value: true
   Description: Enable custom domain management features
   ```

### 5. **GitHub Actions Permissions Verification**

   **Check Actions Permissions:**
   1. Go to **Settings** → **Actions** → **General**
   2. Verify **Actions permissions** are set to:
      - ✅ "Allow all actions and reusable workflows"
      - Or ✅ "Allow select actions and reusable workflows" with appropriate permissions

   **Workflow Permissions:**
   1. Scroll to **Workflow permissions**
   2. Select: ✅ **Read and write permissions**
   3. Check: ✅ **Allow GitHub Actions to create and approve pull requests**

### 6. **Branch Protection Rules (Recommended)**

   **Setup Branch Protection:**
   1. Go to **Settings** → **Branches**
   2. Click **Add rule** for `main` branch
   3. Configure:
      - ✅ **Require a pull request before merging**
      - ✅ **Require status checks to pass before merging**
      - ✅ **Require branches to be up to date before merging**

### 7. **Database Configuration Validation**

   **NEON PostgreSQL Setup:**
   ```sql
   -- Create staging database
   CREATE DATABASE myproject_staging;
   
   -- Create production database  
   CREATE DATABASE myproject_production;
   
   -- Get connection strings from NEON dashboard
   ```

   **Connection String Format:**
   ```
   postgresql://username:password@host.region.neon.tech:5432/database_name?sslmode=require
   ```

### 8. **Deployment Workflow Validation**

   **Check if GitHub Actions workflow exists:**
   ```bash
   # Look for workflow file
   ls -la .github/workflows/
   
   # If deploy-backend.yml doesn't exist, it will be created by setup-quiknation-deployment
   ```

### 9. **GitHub CLI Integration (Optional)**

   **Using GitHub CLI for automation:**
   ```bash
   # Install GitHub CLI (optional)
   brew install gh  # macOS
   # or
   sudo apt install gh  # Linux
   
   # Authenticate
   gh auth login
   
   # Set secrets via CLI (requires admin permissions)
   gh secret set DATABASE_URL_STAGING --body "postgresql://..."
   gh secret set DATABASE_URL_PRODUCTION --body "postgresql://..."
   
   # Set domain secrets (optional)
   gh secret set ROUTE53_HOSTED_ZONE_ID --body "Z1234567890ABC"
   gh secret set DOMAIN_EMAIL --body "admin@yourproject.com"
   
   # Set variables via CLI
   gh variable set PORT_STAGING --body "3001"
   gh variable set USE_BUILT --body "true"
   
   # Set domain variables (optional)
   gh variable set DOMAIN_STAGING --body "api-dev.yourproject.com"
   gh variable set DOMAIN_PRODUCTION --body "api.yourproject.com"
   gh variable set SSL_ENABLED --body "true"
   gh variable set CUSTOM_DOMAIN_ENABLED --body "true"
   ```

## Success Criteria

After running this command successfully, your repository should have:

✅ **Repository Secrets Configured**:
- `DATABASE_URL_STAGING` - Staging database connection
- `DATABASE_URL_PRODUCTION` - Production database connection
- SSH keys (if not organization-level)
- `ROUTE53_HOSTED_ZONE_ID` - Route53 hosted zone (if using custom domains)
- `DOMAIN_EMAIL` - Email for SSL certificates (if using custom domains)

✅ **Repository Variables Set**:
- `PORT_STAGING` - Staging port number
- `PORT_PRODUCTION` - Production port number  
- `USE_BUILT` - Set to "true"
- `EC2_INSTANCE` - Target EC2 instance
- `DOMAIN_STAGING` - Staging domain (if using custom domains)
- `DOMAIN_PRODUCTION` - Production domain (if using custom domains)
- `SSL_ENABLED` - SSL certificate automation (if using custom domains)
- `CUSTOM_DOMAIN_ENABLED` - Domain management features (if using custom domains)

✅ **GitHub Actions Enabled**:
- Actions permissions configured
- Workflow permissions set to read/write

✅ **Branch Protection** (Recommended):
- Main branch protected with PR requirements

## Verification Commands

**Test repository access:**
```bash
# Verify git remote
git remote -v

# Test GitHub CLI access (if installed)
gh repo view

# Check current branch
git branch --show-current
```

**Validate secrets setup:**
```bash
# This will be done by the deployment workflow
# Secrets are not readable via CLI for security
```

## Integration with QuikNation Deployment

Once GitHub is configured, the deployment workflow will:

1. **Trigger Automatically**: On push to `develop` (staging) or `main` (production)
2. **Use Secrets Securely**: Access database URLs and SSH keys
3. **Deploy to Correct Ports**: Use repository variables for port assignment
4. **Maintain Security**: All sensitive data encrypted in GitHub secrets

## Deployment Branch Strategy

**Recommended Git Flow:**
```bash
# Development work
git checkout -b feature/new-feature
# ... make changes ...
git commit -m "Add new feature"
git push origin feature/new-feature

# Create PR to develop branch
# After PR approval and merge to develop → Automatic staging deployment

# When ready for production
# Create PR from develop to main  
# After PR approval and merge to main → Automatic production deployment
```

## Next Steps

After successful GitHub deployment setup:

1. **Initialize QuikNation**: `setup-quiknation-deployment`
2. **Port Allocation**: Ports will be assigned during QuikNation setup
3. **Update Variables**: Port numbers will be provided for repository variables
4. **Verify Everything**: `verify-deployment-setup`
5. **First Deployment**: Push to develop branch for staging deployment

## Troubleshooting

### Common Issues

**1. "Repository not found" or access denied**
```bash
# Check repository URL
git remote get-url origin

# Verify SSH key access to GitHub
ssh -T git@github.com

# Expected: "Hi username! You've successfully authenticated..."
```

**2. "Missing repository admin permissions"**
```
Solution: Contact repository owner or organization admin to:
- Add required secrets and variables
- Grant you admin permissions
- Configure GitHub Actions permissions
```

**3. "Database connection string invalid"**
```bash
# Test database connection locally
psql "postgresql://username:password@host:5432/database"

# Verify SSL mode requirements
psql "postgresql://username:password@host:5432/database?sslmode=require"
```

**4. "GitHub Actions not triggering"**
```yaml
# Check workflow file exists
ls .github/workflows/

# Verify workflow syntax
# GitHub will show errors in Actions tab if syntax is invalid
```

**5. "Branch protection blocking deployment"**
```
Solution: Configure branch protection rules properly:
- Allow force pushes from deployment workflows
- Configure required status checks correctly
```

### Organization-Level Setup

**For Organization Admins:**

**1. Organization Secrets (Shared across all repos):**
- `QUIKNATION_APPS_SSH_KEY`
- `QUIKINFLUENCE_SERVER_SSH_KEY`

**2. Organization Variables:**
- `AWS_DEFAULT_REGION` = `us-east-2`

**3. Repository Template Setup:**
```bash
# Create repository from template
gh repo create my-new-project --template imaginationeverywhere/project-template
```

## Security Best Practices

### Secrets Management
- **Never log secrets** in GitHub Actions workflows
- **Use organization secrets** for shared SSH keys
- **Rotate database passwords** regularly
- **Use environment-specific databases** (staging ≠ production)

### Repository Security
- **Enable branch protection** on main/production branches
- **Require PR reviews** for all changes
- **Enable vulnerability alerts** and dependency updates
- **Use signed commits** when possible

### Database Security
- **Use connection pooling** for better performance
- **Enable SSL/TLS** for all database connections
- **Limit database user permissions** to minimum required
- **Regular database backups** and recovery testing

## Advanced Configuration

### Multiple Environment Setup
```yaml
# For projects needing dev/staging/production with custom domains
environments:
  development:
    url: https://dev.myproject.com
    variables:
      PORT: 3001
      DATABASE_URL: ${{ secrets.DATABASE_URL_DEV }}
      DOMAIN: dev.myproject.com
      SSL_ENABLED: false
  
  staging:
    url: https://api-dev.myproject.com  
    variables:
      PORT: 3002
      DATABASE_URL: ${{ secrets.DATABASE_URL_STAGING }}
      DOMAIN: ${{ vars.DOMAIN_STAGING }}
      SSL_ENABLED: ${{ vars.SSL_ENABLED }}
      
  production:
    url: https://api.myproject.com
    variables:
      PORT: 3003
      DATABASE_URL: ${{ secrets.DATABASE_URL_PRODUCTION }}
      DOMAIN: ${{ vars.DOMAIN_PRODUCTION }}
      SSL_ENABLED: ${{ vars.SSL_ENABLED }}
      HOSTED_ZONE_ID: ${{ secrets.ROUTE53_HOSTED_ZONE_ID }}
```

### Custom Deployment Triggers
```yaml
# Deploy on tag creation
on:
  push:
    tags:
      - 'v*'
      
# Deploy on specific paths
on:
  push:
    paths:
      - 'backend/**'
      - '.github/workflows/deploy-backend.yml'
```

## What's Next

With GitHub deployment properly configured, you're ready for:

1. ✅ **AWS CLI Setup** (prerequisite)
2. ✅ **GitHub Deployment Setup** (completed)
3. ➡️ **QuikNation Initialization**: `setup-quiknation-deployment`
4. ➡️ **Domain Management Setup**: `setup-domain-management` (optional for custom domains)
5. ➡️ **Final Verification**: `verify-deployment-setup`
6. ➡️ **Automatic Deployments**: Push code for automatic EC2 deployment with custom domains

This command ensures your GitHub repository is properly configured for secure, automated deployments to QuikNation EC2 infrastructure using the established SSH key management system.