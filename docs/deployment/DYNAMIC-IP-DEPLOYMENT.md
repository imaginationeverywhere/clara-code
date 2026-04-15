# Dynamic IP Deployment for EC2 Instances

**Quick Reference Guide for EC2 Deployments with Dynamic IP Addresses**

## Problem

EC2 instances without Elastic IPs change their public IP address whenever they stop/start, causing GitHub Actions deployment failures.

## Solution

Query AWS for the current IP address using the EC2 instance ID on each deployment.

## Quick Setup

### Step 1: Store Instance IDs

```bash
# Run the interactive setup script
npm run deploy:setup-dynamic-ip

# Or manually store instance IDs in Parameter Store
aws ssm put-parameter \
  --name "/your-project/deployment/staging-instance-id" \
  --value "i-0c851042b3e385682" \
  --type "String" \
  --overwrite
```

### Step 2: Copy Workflow Files

```bash
# Copy reusable IP resolution workflow
cp .github/workflows/resolve-ec2-ip.yml your-project/.github/workflows/

# Copy deployment workflow example
cp .github/workflows/deploy-backend-dynamic-ip.yml your-project/.github/workflows/
```

### Step 3: Test IP Resolution

```bash
# Test that IP resolution works
npm run deploy:test-ip-resolution
```

## How It Works

### Workflow Architecture

```yaml
jobs:
  # 1. Resolve current EC2 IP
  resolve-ip:
    uses: ./.github/workflows/resolve-ec2-ip.yml
    with:
      environment: staging

  # 2. Deploy using resolved IP
  deploy:
    needs: resolve-ip
    steps:
      - name: Deploy
        run: |
          ssh ec2-user@${{ needs.resolve-ip.outputs.ec2_ip }} \
            "cd /var/www/project && ./deploy.sh"
```

### IP Resolution Process

```
1. Get Instance ID from Parameter Store
   ↓
2. Query AWS for Current IP
   aws ec2 describe-instances --instance-ids <id>
   ↓
3. Fallback to Cached IP (if query fails)
   ↓
4. Update Cached IP in Parameter Store
   ↓
5. Use IP for SSH Deployment
```

## Benefits

| Feature | Dynamic IP | Elastic IP |
|---------|-----------|------------|
| **Cost** | $0 | $0 (when associated)<br>$3.60/month (when not) |
| **IP Changes** | Yes (on stop/start) | Never |
| **Setup Complexity** | Medium (automated) | Simple |
| **GitHub Actions** | 5 extra steps | Direct IP usage |
| **Best For** | Dev/Staging environments<br>Cost optimization | Production environments<br>24/7 uptime |

## Usage Examples

### Deploy to Staging

```bash
# GitHub Actions automatically:
# 1. Resolves staging instance IP
# 2. Deploys to current IP
# 3. Updates cached IP

git push origin develop
```

### Deploy to Production

```bash
# Same process for production
git push origin main
```

### Manual IP Check

```bash
# Get current IP for staging
aws ec2 describe-instances \
  --instance-ids $(aws ssm get-parameter \
    --name "/your-project/deployment/staging-instance-id" \
    --query 'Parameter.Value' --output text) \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text
```

## Migration to Elastic IP

If you need a permanent IP address:

```bash
# Convert to Elastic IP
npm run deploy:convert-elastic-ip

# This will:
# 1. Allocate an Elastic IP
# 2. Associate it with your instance
# 3. Store in Parameter Store
# 4. Provide instructions for DNS updates
```

## Troubleshooting

### Issue: "Instance ID not found"

```bash
# Check Parameter Store
aws ssm get-parameter \
  --name "/your-project/deployment/staging-instance-id"

# Fix: Store correct instance ID
npm run deploy:setup-dynamic-ip
```

### Issue: "IP resolution returns None"

```bash
# Check instance state
aws ec2 describe-instances --instance-ids i-YOUR-ID

# If stopped, start instance
aws ec2 start-instances --instance-ids i-YOUR-ID
```

### Issue: "SSH connection failed"

```bash
# Test IP resolution
npm run deploy:test-ip-resolution

# Check security groups allow SSH from GitHub Actions
# Add GitHub's IP ranges or use 0.0.0.0/0 (less secure)
```

## Cost Analysis

### Scenario: Dev/Staging Environment

**Current Setup (Dynamic IP)**:
- EC2 running 8hrs/day: ~$50/month
- Dynamic IP: $0
- **Total: $50/month**

**Alternative (Elastic IP)**:
- EC2 running 8hrs/day: ~$50/month
- Elastic IP not associated 16hrs/day: ~$12/month
- **Total: $62/month (+24% cost)**

### Scenario: Production Environment (24/7)

**Option A (Dynamic IP)**:
- EC2 running 24/7: ~$150/month
- Dynamic IP: $0
- **Total: $150/month**
- ⚠️ IP changes if instance restarts

**Option B (Elastic IP)**:
- EC2 running 24/7: ~$150/month
- Elastic IP (associated): $0
- **Total: $150/month**
- ✅ Permanent IP (recommended for production)

## Best Practices

### 1. Use Dynamic IP For:
- ✅ Development environments
- ✅ Staging environments
- ✅ Cost-sensitive projects
- ✅ Instances that stop/start frequently

### 2. Use Elastic IP For:
- ✅ Production environments (24/7)
- ✅ When you need DNS stability
- ✅ When simplicity > cost savings
- ✅ When you have < 5 IPs per region

### 3. Always Implement:
- ✅ Fallback to cached IP
- ✅ IP change notifications
- ✅ Instance state monitoring
- ✅ Automated testing

### 4. Monitor:
- 📊 Track IP changes over time
- 📊 Monitor deployment success rates
- 📊 Alert on failed IP resolutions
- 📊 Audit Parameter Store access

## Files Created

```
your-project/
├── .github/
│   └── workflows/
│       ├── resolve-ec2-ip.yml              # Reusable IP resolution
│       └── deploy-backend-dynamic-ip.yml   # Full deployment example
├── scripts/
│   └── setup-dynamic-ip-resolution.js      # Interactive setup
└── docs/
    └── deployment/
        └── DYNAMIC-IP-DEPLOYMENT.md        # This file
```

## Parameter Store Structure

```
/your-project/
└── deployment/
    ├── staging-instance-id          # i-0c851042b3e385682
    ├── staging-ip                   # 44.210.115.201 (cached)
    ├── staging-ip-previous          # For change detection
    ├── production-instance-id       # i-0a1b2c3d4e5f6g7h8
    ├── production-ip                # 18.206.33.147 (cached)
    └── production-ip-previous       # For change detection
```

## Further Reading

- [AWS EC2 Instance IPs](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-instance-addressing.html)
- [Elastic IP Addresses](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/elastic-ip-addresses-eip.html)
- [GitHub Actions with AWS](https://github.com/aws-actions/configure-aws-credentials)
- [Complete Setup Guide](.claude/commands/setup-dynamic-ip-deployment.md)

---

**Need Help?**
- Run interactive setup: `npm run deploy:setup-dynamic-ip`
- Test IP resolution: `npm run deploy:test-ip-resolution`
- Convert to Elastic IP: `npm run deploy:convert-elastic-ip`
