# Setup EC2 Multi-App Deployment

## Overview

This command sets up a complete deployment pipeline for a backend application on a shared EC2 instance with multiple applications. It handles:

- ✅ Route53 DNS configuration with dynamic IP updates
- ✅ AWS Parameter Store environment variable management
- ✅ PM2 application clustering with port isolation
- ✅ GitHub Actions workflow setup with OIDC authentication
- ✅ Nginx reverse proxy configuration
- ✅ SSL/TLS certificate management
- ✅ Slack notification integration

**This command is designed for projects using the shared QuikNation EC2 instance** that hosts multiple applications (e.g., fmogrooming, dreamihaircare, quiknation).

## Prerequisites

### AWS Resources Required
1. **EC2 Instance**: Shared instance with:
   - Ubuntu 20.04 or later
   - Node.js 18+ installed
   - PM2 globally installed
   - Nginx configured and running
   - SSH key stored in Parameter Store

2. **Route53 Hosted Zone**: Domain zone must exist
3. **AWS Systems Manager Parameter Store**: For secrets and configuration
4. **GitHub Repository**: With admin access

### Local Requirements
- AWS CLI configured with credentials
- Bash 4.0+
- jq for JSON parsing
- curl for testing

## Command Usage

In Claude Code:
```
setup-ec2-multi-app-deployment

setup-ec2-multi-app-deployment --app-name=fmo

setup-ec2-multi-app-deployment --interactive
```

## Configuration

### Required Repository Variables (GitHub Settings → Variables)

```yaml
# EC2 Instance Configuration
EC2_INSTANCE_ID: "i-0c851042b3e385682"           # Shared EC2 instance ID
EC2_SSH_KEY_PARAM: "/shared-ec2/ssh-key"         # Parameter Store path to SSH private key

# Application Configuration
APP_NAME: "fmo"                                   # Application name (used for PM2, folders, domains)
APP_DOMAIN: "api-dev.fmogrooming.com"             # Public API domain
API_PORT: "3005"                                  # Port for this app (3005, 3008, 3010, etc.)
HOSTED_ZONE_ID: "Z1234567890ABC"                 # Route53 zone ID

# Optional: Additional Configuration
APP_DESCRIPTION: "FMO Grooming API"               # For documentation
TEAM_SLACK_CHANNEL: "#fmo-deployments"            # For notifications
```

### Required Repository Secrets (GitHub Settings → Secrets)

```yaml
AWS_ACCESS_KEY_ID: "AKIA..."              # AWS access key
AWS_SECRET_ACCESS_KEY: "wJal..."           # AWS secret key
SLACK_WEBHOOK_URL: "https://hooks.slack..." # Slack notification webhook (optional)
```

## Setup Process

### Phase 1: Environment Validation
The command validates:
- ✅ GitHub repository is accessible
- ✅ AWS credentials are configured
- ✅ Route53 hosted zone exists
- ✅ EC2 instance is running
- ✅ SSH key is accessible in Parameter Store

### Phase 2: Port Management
The command:
- Scans current port usage on EC2
- Verifies chosen port is available
- Registers port in port management system
- Prevents port conflicts

### Phase 3: Parameter Store Setup
Stores environment variables securely:
```
/shared-ec2/apps/{APP_NAME}/staging/
  ├── NODE_ENV: "staging"
  ├── PORT: "3005"
  ├── CLERK_SECRET_KEY: "sk_test_..."
  ├── CLERK_PUBLISHABLE_KEY: "pk_test_..."
  ├── STRIPE_SECRET_KEY: "sk_test_..."
  ├── STRIPE_WEBHOOK_SECRET: "whsec_..."
  ├── DATABASE_URL: "postgresql://..."
  ├── REDIS_URL: "redis://..."
  ├── BACKEND_URL: "https://api-dev.fmogrooming.com"
  └── ... other environment variables
```

### Phase 4: GitHub Actions Setup
Creates `.github/workflows/deploy-ec2-staging.yml` with:
- Multi-app awareness
- Automatic Route53 updates
- Parameter Store integration
- Security scanning
- Pre-deployment validation
- Post-deployment health checks
- Slack notifications

### Phase 5: Nginx Configuration
Sets up reverse proxy for:
```nginx
server {
    server_name api-dev.fmogrooming.com;
    listen 443 ssl http2;

    location / {
        proxy_pass http://localhost:3005;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Phase 6: Route53 DNS Configuration
Creates A record pointing to EC2 instance:
- **Name**: api-dev.fmogrooming.com
- **Type**: A
- **Value**: EC2 public IP
- **TTL**: 300 seconds (auto-updated on redeploy)

## Environment Variables Setup

### Quick Setup (Recommended)
```bash
# In Claude Code:
setup-ec2-multi-app-deployment --interactive
```

### Manual Parameter Store Setup
```bash
# Store individual environment variables
aws ssm put-parameter --name "/shared-ec2/apps/fmo/staging/CLERK_SECRET_KEY" \
  --value "sk_test_..." --type "SecureString" --overwrite

aws ssm put-parameter --name "/shared-ec2/apps/fmo/staging/STRIPE_SECRET_KEY" \
  --value "sk_test_..." --type "SecureString" --overwrite

# Batch upload from .env file
./scripts/setup-app-environment.sh --app-name fmo --env-file .env.local
```

## Deployment Workflow

### First Time Setup
```bash
# 1. Create repository variables and secrets in GitHub UI
# 2. Run setup command
setup-ec2-multi-app-deployment

# 3. Push to develop branch
git push origin develop

# 4. Watch deployment in GitHub Actions
# 5. Verify Route53 DNS update
# 6. Test health endpoint
curl https://api-dev.fmogrooming.com/health
```

### Subsequent Deployments
```bash
# Just push to develop - automatic deployment
git push origin develop

# Monitor in GitHub Actions UI
# Automatic Route53 update to new IP if needed
# Automatic PM2 restart with zero downtime
```

### Manual Deployment
```bash
# If you need to redeploy without code changes
# In GitHub UI: Actions → Deploy Backend API → Run workflow

# Or from CLI
gh workflow run deploy-ec2-staging.yml --ref develop
```

## Monitoring and Troubleshooting

### Check Deployment Status
```bash
# View PM2 processes on EC2
ssh ec2-user@{EC2_IP} pm2 list

# Check PM2 logs
ssh ec2-user@{EC2_IP} pm2 logs fmo-staging

# View Nginx logs
ssh ec2-user@{EC2_IP} sudo tail -f /var/log/nginx/access.log
```

### Common Issues

#### Issue: DNS not resolving
```bash
# Check Route53 record
aws route53 list-resource-record-sets --hosted-zone-id Z1234567890ABC \
  --query "ResourceRecordSets[?Name=='api-dev.fmogrooming.com.']"

# Verify EC2 public IP
aws ec2 describe-instances --instance-ids i-0c851042b3e385682 \
  --query "Reservations[0].Instances[0].PublicIpAddress"
```

#### Issue: Port already in use
```bash
# Check port usage
ssh ec2-user@{EC2_IP} lsof -i :3005

# View port registry
./.claude/port-management.sh show

# Find available port
./.claude/port-management.sh allocate
```

#### Issue: Application not starting
```bash
# SSH into EC2
ssh ec2-user@{EC2_IP}

# Check PM2 status
pm2 list
pm2 logs fmo-staging

# Check environment variables
cat /home/ec2-user/projects/fmo-backend/.env

# Test manual start
cd /home/ec2-user/projects/fmo-backend
npm run build
PORT=3005 node dist/index.js
```

#### Issue: Parameter Store credentials not loading
```bash
# Verify AWS credentials on GitHub
aws sts get-caller-identity

# Check Parameter Store access
aws ssm get-parameter --name "/shared-ec2/apps/fmo/staging/CLERK_SECRET_KEY"

# Verify Parameter Store bootstrap script on EC2
ssh ec2-user@{EC2_IP} ls -la /home/ec2-user/scripts/load-env.sh
```

## Advanced Configuration

### Custom Domain Setup
```bash
# Use different domain structure
APP_DOMAIN: "fmo-api-staging.example.com"
APP_DOMAIN: "staging.api.fmogrooming.com"
```

### Multi-Region Deployment
```bash
# Deploy to different regions
aws ssm get-parameter --region eu-west-1 --name "/shared-ec2/ssh-key"
aws route53 create-health-check --health-check-config ...
```

### Blue-Green Deployment
```bash
# Use two ports for zero-downtime updates
API_PORT: "3005"              # Current production
API_PORT_BLUE_GREEN: "3015"   # Temporary for deployment

# Nginx switches traffic after validation
```

## Security Best Practices

1. **Rotate SSH keys regularly**
   ```bash
   aws ssm put-parameter --name "/shared-ec2/ssh-key" \
     --value "$(cat new_key.pem)" --type "SecureString" --overwrite
   ```

2. **Use secure Parameter Store values**
   - Always use `--type "SecureString"` for secrets
   - Encrypt with KMS key
   - Set IAM policies for GitHub Actions access

3. **Limit GitHub Actions permissions**
   ```yaml
   permissions:
     id-token: write    # OIDC for AWS authentication
     contents: read     # Read-only repository access
   ```

4. **Monitor deployments**
   - Enable CloudWatch logs
   - Set up Slack alerts for failures
   - Review GitHub Actions logs regularly

## Reusable Across Projects

This setup is designed to be used by **all projects** on the shared EC2 instance. Just provide different values:

### FMO Setup
```
APP_NAME: fmo
APP_DOMAIN: api-dev.fmogrooming.com
API_PORT: 3005
```

### DreamiHairCare Setup
```
APP_NAME: dreamihaircare
APP_DOMAIN: api-dev.dreamihaircare.com
API_PORT: 3008
```

### QuikNation Setup
```
APP_NAME: quiknation
APP_DOMAIN: api-dev.quiknation.com
API_PORT: 3010
```

Each app gets its own:
- PM2 process
- Port on EC2
- Nginx reverse proxy configuration
- Route53 DNS record
- Parameter Store environment configuration
- GitHub Actions workflow

## Support

For issues or questions:
1. Check logs: `pm2 logs {APP_NAME}-staging`
2. Review GitHub Actions output
3. Check Route53 records
4. Verify Parameter Store values
5. Test connectivity: `curl https://{APP_DOMAIN}/health`

## Integration with Other Commands

This command works alongside:
- `setup-ec2-infrastructure` - One-time EC2 setup
- `.claude/port-management.sh` - Port conflict prevention
- `setup-github-deployment` - GitHub repository setup
- `setup-domain-management` - Domain and DNS management

See `.claude/commands/` for more information.
