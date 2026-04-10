# Verify Deployment Setup Command

## Overview
This Claude Code custom command performs comprehensive verification of your complete QuikNation deployment setup. It checks AWS CLI configuration, GitHub repository settings, QuikNation CLI functionality, and SSH connectivity to ensure everything is ready for automatic deployment to EC2 instances.

## Command Usage

**In Claude Code, type:**
```
verify-deployment-setup
```

Or ask Claude naturally:
```
"Can you run verify-deployment-setup?"
"Please verify my QuikNation deployment is ready"
"Check if everything is configured correctly for deployment"
```

## Prerequisites

✅ **You should have completed:**
- `setup-aws-cli` - AWS CLI installed and configured with Route53 access
- `setup-github-deployment` - GitHub repository secrets and variables configured
- `setup-quiknation-deployment` - QuikNation CLI initialized and ports allocated
- `setup-domain-management` - Custom domains and SSL certificates configured (optional)

## What This Command Does

When you invoke this command, Claude will run a comprehensive verification checklist:

### 1. **Environment Validation**
   ```bash
   # Check current directory structure
   pwd
   ls -la
   
   # Verify we're in a proper project structure
   [ -f "package.json" ] && echo "✅ Package.json found"
   [ -f "docs/PRD.md" ] && echo "✅ PRD.md found"
   [ -d ".git" ] && echo "✅ Git repository initialized"
   ```

### 2. **AWS CLI Verification**
   ```bash
   # Check AWS CLI installation
   aws --version
   # Expected: aws-cli/2.x.x Python/3.x.x
   
   # Verify AWS credentials
   aws sts get-caller-identity
   # Expected: Returns UserId, Account, and Arn
   
   # Check AWS region configuration
   aws configure get region
   # Expected: us-east-2
   
   # Test environment variable
   echo $AWS_DEFAULT_REGION
   # Expected: us-east-2
   
   # Test Route53 access (for domain management)
   aws route53 list-hosted-zones --max-items 1
   # Expected: Returns hosted zones or empty list (no error)
   ```

### 3. **SSM Parameter Store Access Testing**
   ```bash
   # Test QuikNation-Apps SSH key access
   aws ssm get-parameter --name "/quiknation-cli/ssh-keys/quiknation-apps" --with-decryption --query "Parameter.Value" --output text | head -1
   # Expected: -----BEGIN RSA PRIVATE KEY-----
   
   # Test QuikInfluence-Server SSH key access
   aws ssm get-parameter --name "/quiknation-cli/ssh-keys/quikinfluence-server" --with-decryption --query "Parameter.Value" --output text | head -1
   # Expected: -----BEGIN RSA PRIVATE KEY-----
   
   # List all QuikNation CLI parameters
   aws ssm describe-parameters --parameter-filters "Key=Name,Values=/quiknation-cli"
   # Expected: Shows both SSH key parameters
   ```

### 4. **QuikNation CLI Verification**
   ```bash
   # Check QuikNation CLI installation
   quiknation --version
   # Expected: QuikNation CLI version information
   
   # Verify CLI can access configuration
   quiknation config --list
   # Expected: Shows EC2 instance configurations
   
   # Test workspace detection (if in monorepo)
   quiknation workspace --info
   # Expected: Shows monorepo structure information
   
   # Check port allocations
   quiknation ports --list --instance quiknation-apps
   # Expected: Shows allocated ports for the instance
   
   # Check domain management capabilities (if configured)
   quiknation domain list 2>/dev/null || echo "ℹ️  Domain management not configured (optional)"
   # Expected: Shows domain configurations or indicates none configured
   ```

### 5. **SSH Connectivity Testing**
   ```bash
   # Test SSH connection to QuikNation-Apps
   quiknation status --instance quiknation-apps
   # Expected: Shows EC2 instance status and running processes
   
   # Test SSH connection to QuikInfluence-Server (if applicable)
   quiknation status --instance quikinfluence-server
   # Expected: Shows EC2 instance status and running processes
   ```

### 6. **GitHub Repository Verification**
   ```bash
   # Check git repository status
   git remote -v
   # Expected: Shows GitHub repository URL
   
   # Verify repository belongs to imaginationeverywhere
   git remote get-url origin | grep "imaginationeverywhere"
   # Expected: Returns repository URL with organization
   
   # Check current branch
   git branch --show-current
   # Expected: Shows current branch (main, develop, feature/*)
   
   # Verify GitHub CLI access (if installed)
   gh auth status 2>/dev/null || echo "GitHub CLI not configured (optional)"
   ```

### 7. **GitHub Actions and Secrets Validation**
   ```bash
   # Check if GitHub Actions workflow exists
   ls -la .github/workflows/
   # Expected: Shows deploy-backend.yml or similar deployment workflow
   
   # Validate workflow file syntax (basic check)
   [ -f ".github/workflows/deploy-backend.yml" ] && echo "✅ Deployment workflow found"
   
   # Check for required environment files
   [ -f ".env.example" ] && echo "✅ Environment template found"
   ```

### 8. **Database Connection Validation**
   ```bash
   # Check if database configuration exists
   [ -f "src/config/database.ts" ] || [ -f "src/database/config/config.js" ] && echo "✅ Database config found"
   
   # Verify environment template includes database URLs
   grep -q "DATABASE_URL" .env.example && echo "✅ Database URLs in environment template"
   ```

### 9. **Package.json Scripts Verification**
   ```bash
   # Check for deployment scripts
   grep -q "deploy:staging" package.json && echo "✅ Staging deployment script found"
   grep -q "deploy:production" package.json && echo "✅ Production deployment script found"
   grep -q "deploy:status" package.json && echo "✅ Status check script found"
   
   # Verify scripts use global QuikNation CLI
   grep -q "quiknation deploy" package.json && echo "✅ Scripts use global CLI"
   ```

### 10. **Domain Configuration Verification (NEW)**
   ```bash
   # Check if domain configuration exists
   [ -f ".quiknation/domain.json" ] && echo "✅ Domain configuration found" || echo "ℹ️  No domain configuration (optional)"
   
   # Verify domain configuration if it exists
   if [ -f ".quiknation/domain.json" ]; then
     # Extract domain information
     PRODUCTION_DOMAIN=$(grep -o '"productionDomain":"[^"]*"' .quiknation/domain.json | cut -d'"' -f4)
     STAGING_DOMAIN=$(grep -o '"stagingDomain":"[^"]*"' .quiknation/domain.json | cut -d'"' -f4)
     
     echo "Production Domain: $PRODUCTION_DOMAIN"
     echo "Staging Domain: $STAGING_DOMAIN"
     
     # Test DNS resolution
     if [ ! -z "$PRODUCTION_DOMAIN" ]; then
       dig +short "$PRODUCTION_DOMAIN" A | head -1 || echo "⚠️  DNS resolution failed for $PRODUCTION_DOMAIN"
     fi
     
     if [ ! -z "$STAGING_DOMAIN" ]; then
       dig +short "$STAGING_DOMAIN" A | head -1 || echo "⚠️  DNS resolution failed for $STAGING_DOMAIN"
     fi
   fi
   
   # Check for domain-related environment variables
   grep -q "DOMAIN_" .env.example && echo "✅ Domain environment variables in template" || echo "ℹ️  No domain variables (optional)"
   
   # Verify domain management scripts
   grep -q "domain:" package.json && echo "✅ Domain management scripts found" || echo "ℹ️  No domain scripts (optional)"
   ```

### 11. **SSL Certificate Verification (NEW)**
   ```bash
   # Check SSL certificate status if domains are configured
   if [ -f ".quiknation/domain.json" ]; then
     PRODUCTION_DOMAIN=$(grep -o '"productionDomain":"[^"]*"' .quiknation/domain.json | cut -d'"' -f4)
     
     if [ ! -z "$PRODUCTION_DOMAIN" ]; then
       # Test HTTPS connectivity
       curl -Is "https://$PRODUCTION_DOMAIN" | head -1 && echo "✅ HTTPS accessible" || echo "⚠️  HTTPS not accessible"
       
       # Check SSL certificate validity
       echo | openssl s_client -servername "$PRODUCTION_DOMAIN" -connect "$PRODUCTION_DOMAIN:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null && echo "✅ SSL certificate valid" || echo "⚠️  SSL certificate check failed"
     fi
   fi
   ```

### 12. **Port Allocation and Conflicts Check**
   ```bash
   # Check port allocation for current project
   PROJECT_NAME=$(basename $(pwd))
   quiknation ports --list --instance quiknation-apps | grep "$PROJECT_NAME" || echo "⚠️  Port not yet allocated"
   
   # Check for port conflicts
   quiknation ports --list --instance quiknation-apps
   # Shows all allocated ports and potential conflicts
   ```

## Verification Report

After running all checks, Claude will generate a comprehensive report:

### ✅ **PASSED CHECKS**
```
✅ AWS CLI installed and configured
✅ AWS credentials valid and working
✅ AWS region set to us-east-2
✅ Route53 access working (for domain management)
✅ SSM Parameter Store access working
✅ QuikNation SSH keys accessible
✅ QuikNation CLI installed and functional
✅ SSH connectivity to EC2 instances working
✅ GitHub repository properly configured
✅ GitHub Actions workflow exists
✅ Deployment scripts configured correctly
✅ Port allocation complete
✅ Database configuration templates ready
✅ Domain configuration found and valid (if configured)
✅ DNS resolution working for custom domains (if configured)
✅ SSL certificates valid and accessible (if configured)
✅ Domain management scripts available (if configured)
```

### ⚠️ **WARNINGS**
```
⚠️  GitHub CLI not installed (optional)
⚠️  Branch protection rules not configured (recommended)
⚠️  Database URLs not set in repository secrets (required for deployment)
⚠️  Domain configuration not set up (optional for professional URLs)
⚠️  DNS resolution taking longer than expected (propagation in progress)
⚠️  SSL certificate expiring soon (auto-renewal should handle this)
⚠️  HTTPS not accessible (domain setup may be incomplete)
```

### ❌ **FAILED CHECKS**
```
❌ AWS CLI not installed
❌ AWS credentials not configured
❌ Route53 access denied (missing permissions)
❌ QuikNation CLI not found
❌ SSH connectivity failed
❌ GitHub repository not found
❌ Required secrets missing
❌ Domain configuration invalid or corrupted
❌ DNS resolution completely failed
❌ SSL certificate expired or invalid
❌ Custom domains not accessible
```

### 📋 **ACTION ITEMS**
```
1. Install AWS CLI: Run setup-aws-cli command
2. Configure GitHub secrets: Add DATABASE_URL_STAGING and DATABASE_URL_PRODUCTION
3. Set repository variables: PORT_STAGING and PORT_PRODUCTION values needed
4. Initialize QuikNation: Run setup-quiknation-deployment if not completed
5. Set up custom domains: Run setup-domain-management command (optional)
6. Configure Route53: Add hosted zones for your domains
7. Fix SSL certificates: Re-run domain setup or check certificate status
8. Update DNS: Verify domain name servers point to Route53
```

## Success Criteria

**DEPLOYMENT READY** ✅ when all of these pass:

✅ **AWS Access**: CLI installed, credentials configured, SSM and Route53 access working  
✅ **SSH Connectivity**: Can connect to QuikNation EC2 instances  
✅ **QuikNation CLI**: Installed globally and functional  
✅ **GitHub Setup**: Repository configured with secrets and variables  
✅ **Port Allocation**: Ports assigned and no conflicts  
✅ **Workflow Ready**: GitHub Actions deployment workflow exists  
✅ **Database Config**: Environment templates and configuration ready  
✅ **Domain Setup**: Custom domains and SSL certificates working (if configured)  

## Next Steps Based on Results

### If All Checks Pass ✅
```
🎉 DEPLOYMENT READY!

You can now:
1. Push to develop branch → Automatic staging deployment
2. Push to main branch → Automatic production deployment
3. Monitor deployments: npm run deploy:status
4. Check logs and processes on EC2 instances
```

### If Some Checks Fail ❌
```
📝 SETUP INCOMPLETE

Run these commands to fix issues:
1. setup-aws-cli - Fix AWS configuration and Route53 access
2. setup-github-deployment - Fix GitHub setup
3. setup-quiknation-deployment - Fix QuikNation CLI setup
4. setup-domain-management - Fix domain and SSL configuration (if needed)
5. verify-deployment-setup - Re-run verification
```

## Detailed Troubleshooting

### AWS CLI Issues
```bash
# AWS CLI not found
which aws || echo "AWS CLI not installed - run setup-aws-cli"

# Credentials issues
aws sts get-caller-identity || echo "AWS credentials not configured"

# Region issues
aws configure get region || aws configure set region us-east-2
```

### SSH Connectivity Issues
```bash
# Test manual SSH connection
ssh -i ~/.ssh/quiknation-apps-key.pem ec2-user@[EC2_HOST_IP] "echo 'SSH working'"

# Check SSH key in SSM
aws ssm get-parameter --name "/quiknation-cli/ssh-keys/quiknation-apps" --with-decryption

# Verify QuikNation CLI SSH functionality
quiknation status --instance quiknation-apps
```

### GitHub Issues
```bash
# Check repository access
git ls-remote origin

# Verify organization membership
gh api user/memberships/orgs/imaginationeverywhere --silent && echo "✅ Org member"

# Test GitHub Actions permissions
gh workflow list
```

### QuikNation CLI Issues
```bash
# Reinstall QuikNation CLI
npm uninstall -g quiknation-cli
npm install -g git+ssh://git@github.com/imaginationeverywhere/quiknation-cli.git

# Verify installation
which quiknation
quiknation --version
```

### Port Allocation Issues
```bash
# Check current allocations
quiknation ports --list --instance quiknation-apps

# Allocate ports if missing
quiknation ports --allocate $(basename $(pwd))-backend --instance quiknation-apps

# Release conflicted ports
quiknation ports --release old-project-name --instance quiknation-apps
```

### Domain Configuration Issues
```bash
# Check domain configuration status
quiknation domain verify --project $(basename $(pwd))

# List current domain configurations
quiknation domain list

# Fix corrupted domain configuration
rm -f .quiknation/domain.json
setup-domain-management

# Verify DNS resolution manually
dig +short api.yourproject.com A
dig +short api-dev.yourproject.com A
```

### SSL Certificate Issues
```bash
# Check certificate status
npm run domain:verify

# Check certificate expiration
echo | openssl s_client -servername api.yourproject.com -connect api.yourproject.com:443 2>/dev/null | openssl x509 -noout -dates

# Renew SSL certificates
quiknation domain setup --renew

# Test HTTPS connectivity
curl -I https://api.yourproject.com/health
```

### Route53 and DNS Issues
```bash
# Check Route53 access
aws route53 list-hosted-zones

# Check domain nameservers
dig NS yourproject.com

# Check DNS propagation
nslookup api.yourproject.com 8.8.8.8

# Verify Route53 records
aws route53 list-resource-record-sets --hosted-zone-id Z1234567890ABC
```

## Security Verification

### Secrets and Keys Security Check
```bash
# Verify SSH keys are not in repository
find . -name "*.pem" -not -path "./.git/*" | wc -l
# Expected: 0 (no SSH keys in repo)

# Check for accidentally committed secrets
grep -r "DATABASE_URL" . --exclude-dir=.git --exclude="*.example" | wc -l
# Expected: 0 (no real database URLs in code)

# Verify .env is in .gitignore
grep -q "\.env" .gitignore && echo "✅ .env properly ignored"

# Verify domain configuration is not committed
find . -name "domain.json" -not -path "./.git/*" | wc -l
# Expected: 0 (domain configuration should not be in git)

# Check for accidentally committed SSL certificates
find . -name "*.pem" -o -name "*.crt" -o -name "*.key" | grep -v ".git" | wc -l
# Expected: 0 (no SSL certificates in repository)
```

### GitHub Security Check
```bash
# Check if repository is private (recommended)
gh repo view --json visibility -q .visibility
# Expected: "private" for most projects

# Verify branch protection (if configured)
gh api repos/imaginationeverywhere/$(basename $(pwd))/branches/main/protection || echo "⚠️  No branch protection"
```

## Performance Verification

### EC2 Instance Health Check
```bash
# Check EC2 instance resources
quiknation status --instance quiknation-apps
# Shows: CPU usage, memory, disk space, running processes

# Check deployed applications
ssh -i ~/.ssh/quiknation-apps-key.pem ec2-user@[EC2_HOST_IP] "pm2 list"
# Shows: All running PM2 processes and their status
```

### Network Connectivity Check
```bash
# Test port accessibility (from EC2)
quiknation execute --instance quiknation-apps --command "netstat -tlnp | grep :30"
# Shows: All listening ports in 3000-3999 range
```

## What's Next

After successful verification:

1. ✅ **Complete Setup Verified** - All systems ready for deployment
2. ➡️ **Domain Verification** - Verify custom domains and SSL certificates are working (if configured)
3. ➡️ **First Deployment** - Push code to develop branch for staging
4. ➡️ **Production Deployment** - Push code to main branch for production
5. ➡️ **HTTPS Testing** - Test custom domains with SSL certificates
6. ➡️ **Monitoring** - Use deployment status commands for ongoing monitoring
7. ➡️ **Team Onboarding** - Share setup process with other developers

This verification command ensures your entire QuikNation deployment pipeline is correctly configured and ready for production use with automatic EC2 deployments and professional domain management via GitHub Actions.