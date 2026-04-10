# setup-dynamic-ip-deployment

**Purpose**: Configure GitHub Actions deployment workflows to handle EC2 instances with dynamic IP addresses

**Context**: EC2 instances without Elastic IPs change their public IP address whenever they stop/start. This command implements automatic IP resolution by querying AWS for the current IP using the instance ID, eliminating deployment failures from IP changes.

## Command Usage

**Claude Code Commands**:
```bash
setup-dynamic-ip-deployment                           # Interactive setup for dynamic IP resolution
setup-dynamic-ip-deployment --staging                # Configure staging environment only
setup-dynamic-ip-deployment --production             # Configure production environment only
setup-dynamic-ip-deployment --test                   # Test IP resolution without changes
setup-dynamic-ip-deployment --elastic-ip             # Convert to Elastic IP instead
```

**npm Scripts**:
```bash
npm run deploy:setup-dynamic-ip                      # Setup dynamic IP resolution
npm run deploy:test-ip-resolution                    # Test current IP resolution
npm run deploy:convert-elastic-ip                    # Convert to Elastic IP
```

## Problem Statement

### The Dynamic IP Challenge

**Scenario**:
```bash
# Day 1: Deploy works fine
EC2 IP: 44.210.115.201
GitHub Actions SSH: ✅ Success

# Day 2: EC2 instance stopped/started to save costs
EC2 IP: 18.206.33.147  # ❌ IP changed!
GitHub Actions SSH: ❌ Connection failed - host not found
```

**Why IPs Change**:
- EC2 stop/start operations
- Instance failures and auto-recovery
- Scaling events
- AWS infrastructure maintenance

**Impact**:
- ❌ Deployment failures
- ❌ Manual workflow updates required
- ❌ Team coordination overhead
- ❌ Delayed hotfixes and releases

## Solution Architecture

### Dynamic IP Resolution Pattern

```yaml
# .github/workflows/deploy-backend.yml
jobs:
  deploy:
    steps:
      # 1. Get Instance ID from Parameter Store
      - name: Get EC2 Instance ID
        id: instance-id
        run: |
          INSTANCE_ID=$(aws ssm get-parameter \
            --name "/${{ env.PROJECT_NAME }}/deployment/staging-instance-id" \
            --query 'Parameter.Value' \
            --output text)
          echo "instance_id=$INSTANCE_ID" >> $GITHUB_OUTPUT

      # 2. Query Current IP from AWS
      - name: Resolve Current EC2 IP
        id: ec2-ip
        run: |
          CURRENT_IP=$(aws ec2 describe-instances \
            --instance-ids ${{ steps.instance-id.outputs.instance_id }} \
            --query 'Reservations[0].Instances[0].PublicIpAddress' \
            --output text)
          echo "current_ip=$CURRENT_IP" >> $GITHUB_OUTPUT
          echo "✅ Resolved EC2 IP: $CURRENT_IP"

      # 3. Update Parameter Store (for reference)
      - name: Update Parameter Store IP
        run: |
          aws ssm put-parameter \
            --name "/${{ env.PROJECT_NAME }}/deployment/staging-ip" \
            --value "${{ steps.ec2-ip.outputs.current_ip }}" \
            --overwrite \
            --type String

      # 4. Deploy to Current IP
      - name: Deploy to EC2
        run: |
          ssh -i ~/.ssh/deploy_key \
            ec2-user@${{ steps.ec2-ip.outputs.current_ip }} \
            "cd /var/www/${{ env.PROJECT_NAME }} && ./deploy.sh"
```

### Fallback Strategy

```yaml
# Graceful degradation if instance ID lookup fails
- name: Resolve EC2 IP with Fallback
  id: ec2-ip
  run: |
    # Try instance ID resolution first
    if [ -n "${{ steps.instance-id.outputs.instance_id }}" ]; then
      CURRENT_IP=$(aws ec2 describe-instances \
        --instance-ids ${{ steps.instance-id.outputs.instance_id }} \
        --query 'Reservations[0].Instances[0].PublicIpAddress' \
        --output text 2>/dev/null)
    fi

    # Fallback to Parameter Store cached IP
    if [ -z "$CURRENT_IP" ] || [ "$CURRENT_IP" = "None" ]; then
      echo "⚠️  Instance ID resolution failed, using cached IP"
      CURRENT_IP=$(aws ssm get-parameter \
        --name "/${{ env.PROJECT_NAME }}/deployment/staging-ip" \
        --query 'Parameter.Value' \
        --output text)
    fi

    echo "current_ip=$CURRENT_IP" >> $GITHUB_OUTPUT
    echo "✅ EC2 IP: $CURRENT_IP"
```

## Implementation Steps

### Step 1: Store Instance IDs in Parameter Store

```bash
#!/bin/bash
# Store EC2 instance IDs for each environment

PROJECT_NAME="your-project"

# Staging instance
aws ssm put-parameter \
  --name "/${PROJECT_NAME}/deployment/staging-instance-id" \
  --value "i-0c851042b3e385682" \
  --type "String" \
  --description "Staging EC2 instance ID for dynamic IP resolution" \
  --overwrite

# Production instance
aws ssm put-parameter \
  --name "/${PROJECT_NAME}/deployment/production-instance-id" \
  --value "i-0a1b2c3d4e5f6g7h8" \
  --type "String" \
  --description "Production EC2 instance ID for dynamic IP resolution" \
  --overwrite

echo "✅ Instance IDs stored in Parameter Store"
```

### Step 2: Update GitHub Actions Workflows

**Before (Static IP - Breaks on IP Change)**:
```yaml
# ❌ Old approach - hardcoded IP
env:
  EC2_HOST: 44.210.115.201  # Breaks when instance restarts!

jobs:
  deploy:
    steps:
      - name: Deploy
        run: ssh ec2-user@${{ env.EC2_HOST }} "./deploy.sh"
```

**After (Dynamic IP - Always Works)**:
```yaml
# ✅ New approach - dynamic resolution
env:
  PROJECT_NAME: your-project
  AWS_REGION: us-east-1

jobs:
  deploy:
    steps:
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Get Instance ID
        id: instance-id
        run: |
          INSTANCE_ID=$(aws ssm get-parameter \
            --name "/${{ env.PROJECT_NAME }}/deployment/staging-instance-id" \
            --query 'Parameter.Value' \
            --output text)
          echo "instance_id=$INSTANCE_ID" >> $GITHUB_OUTPUT

      - name: Resolve Current EC2 IP
        id: ec2-ip
        run: |
          CURRENT_IP=$(aws ec2 describe-instances \
            --instance-ids ${{ steps.instance-id.outputs.instance_id }} \
            --query 'Reservations[0].Instances[0].PublicIpAddress' \
            --output text)

          if [ -z "$CURRENT_IP" ] || [ "$CURRENT_IP" = "None" ]; then
            echo "❌ Failed to resolve IP for instance ${{ steps.instance-id.outputs.instance_id }}"
            exit 1
          fi

          echo "current_ip=$CURRENT_IP" >> $GITHUB_OUTPUT
          echo "✅ Resolved EC2 IP: $CURRENT_IP"

      - name: Update Cached IP
        run: |
          aws ssm put-parameter \
            --name "/${{ env.PROJECT_NAME }}/deployment/staging-ip" \
            --value "${{ steps.ec2-ip.outputs.current_ip }}" \
            --overwrite

      - name: Deploy to EC2
        run: |
          ssh -o StrictHostKeyChecking=no \
            -i ~/.ssh/deploy_key \
            ec2-user@${{ steps.ec2-ip.outputs.current_ip }} \
            "cd /var/www/${{ env.PROJECT_NAME }} && ./deploy.sh"
```

### Step 3: Create Reusable Workflow

```yaml
# .github/workflows/resolve-ec2-ip.yml
name: Resolve EC2 IP

on:
  workflow_call:
    inputs:
      environment:
        required: true
        type: string
        description: 'Environment (staging or production)'
    outputs:
      ec2_ip:
        description: 'Current EC2 public IP address'
        value: ${{ jobs.resolve-ip.outputs.ec2_ip }}

jobs:
  resolve-ip:
    runs-on: ubuntu-latest
    outputs:
      ec2_ip: ${{ steps.get-ip.outputs.current_ip }}

    steps:
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ${{ vars.AWS_REGION }}

      - name: Get Instance ID
        id: instance-id
        run: |
          INSTANCE_ID=$(aws ssm get-parameter \
            --name "/${{ vars.PROJECT_NAME }}/deployment/${{ inputs.environment }}-instance-id" \
            --query 'Parameter.Value' \
            --output text)
          echo "instance_id=$INSTANCE_ID" >> $GITHUB_OUTPUT

      - name: Get Current EC2 IP
        id: get-ip
        run: |
          CURRENT_IP=$(aws ec2 describe-instances \
            --instance-ids ${{ steps.instance-id.outputs.instance_id }} \
            --query 'Reservations[0].Instances[0].PublicIpAddress' \
            --output text)

          # Fallback to cached IP
          if [ -z "$CURRENT_IP" ] || [ "$CURRENT_IP" = "None" ]; then
            echo "⚠️  Using cached IP from Parameter Store"
            CURRENT_IP=$(aws ssm get-parameter \
              --name "/${{ vars.PROJECT_NAME }}/deployment/${{ inputs.environment }}-ip" \
              --query 'Parameter.Value' \
              --output text)
          else
            # Update cached IP
            aws ssm put-parameter \
              --name "/${{ vars.PROJECT_NAME }}/deployment/${{ inputs.environment }}-ip" \
              --value "$CURRENT_IP" \
              --overwrite
          fi

          echo "current_ip=$CURRENT_IP" >> $GITHUB_OUTPUT
          echo "✅ EC2 IP for ${{ inputs.environment }}: $CURRENT_IP"
```

**Use in Main Workflow**:
```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging

on:
  push:
    branches: [develop]

jobs:
  resolve-ip:
    uses: ./.github/workflows/resolve-ec2-ip.yml
    with:
      environment: staging
    secrets: inherit

  deploy:
    needs: resolve-ip
    runs-on: ubuntu-latest
    steps:
      - name: Deploy
        run: |
          ssh ec2-user@${{ needs.resolve-ip.outputs.ec2_ip }} \
            "cd /var/www/${{ vars.PROJECT_NAME }} && ./deploy.sh"
```

### Step 4: Test IP Resolution

```bash
#!/bin/bash
# scripts/test-ip-resolution.sh

PROJECT_NAME="your-project"
ENVIRONMENT="staging"

echo "🔍 Testing Dynamic IP Resolution"
echo "=================================="

# Get instance ID
echo ""
echo "📋 Fetching instance ID..."
INSTANCE_ID=$(aws ssm get-parameter \
  --name "/${PROJECT_NAME}/deployment/${ENVIRONMENT}-instance-id" \
  --query 'Parameter.Value' \
  --output text)

if [ -z "$INSTANCE_ID" ]; then
  echo "❌ Instance ID not found in Parameter Store"
  exit 1
fi

echo "✅ Instance ID: $INSTANCE_ID"

# Get current IP
echo ""
echo "🔍 Resolving current IP..."
CURRENT_IP=$(aws ec2 describe-instances \
  --instance-ids "$INSTANCE_ID" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text)

if [ -z "$CURRENT_IP" ] || [ "$CURRENT_IP" = "None" ]; then
  echo "❌ Failed to resolve IP"
  exit 1
fi

echo "✅ Current IP: $CURRENT_IP"

# Get instance state
echo ""
echo "📊 Instance Status:"
aws ec2 describe-instances \
  --instance-ids "$INSTANCE_ID" \
  --query 'Reservations[0].Instances[0].[State.Name,InstanceType,LaunchTime]' \
  --output text

# Test SSH connectivity
echo ""
echo "🔐 Testing SSH connectivity..."
if ssh -o ConnectTimeout=5 \
       -o StrictHostKeyChecking=no \
       -i ~/.ssh/deploy_key \
       ec2-user@"$CURRENT_IP" \
       "echo 'Connection successful'" 2>/dev/null; then
  echo "✅ SSH connection successful"
else
  echo "❌ SSH connection failed"
  exit 1
fi

echo ""
echo "✅ All tests passed!"
```

## Alternative: Elastic IP Solution

### When to Use Elastic IP

**Benefits**:
- ✅ IP never changes (persistent)
- ✅ Can use DNS with fixed A record
- ✅ Simpler GitHub Actions (no dynamic lookup)
- ✅ Free when associated with running instance

**Considerations**:
- 💰 Costs $0.005/hour if NOT associated ($3.60/month)
- 💰 Free if associated with a running instance
- ⚠️ Limited to 5 Elastic IPs per region (can request increase)

### Allocate Elastic IP

```bash
#!/bin/bash
# Allocate and associate Elastic IP

PROJECT_NAME="your-project"
INSTANCE_ID="i-0c851042b3e385682"

echo "🔧 Allocating Elastic IP..."

# Allocate Elastic IP
ALLOCATION=$(aws ec2 allocate-address \
  --region us-east-1 \
  --tag-specifications "ResourceType=elastic-ip,Tags=[{Key=Name,Value=${PROJECT_NAME}-staging},{Key=Project,Value=${PROJECT_NAME}}]" \
  --output json)

ELASTIC_IP=$(echo "$ALLOCATION" | jq -r '.PublicIp')
ALLOCATION_ID=$(echo "$ALLOCATION" | jq -r '.AllocationId')

echo "✅ Allocated Elastic IP: $ELASTIC_IP"
echo "✅ Allocation ID: $ALLOCATION_ID"

# Associate with instance
echo ""
echo "🔗 Associating with instance $INSTANCE_ID..."
aws ec2 associate-address \
  --instance-id "$INSTANCE_ID" \
  --allocation-id "$ALLOCATION_ID"

echo "✅ Elastic IP associated successfully"

# Store in Parameter Store
echo ""
echo "💾 Storing in Parameter Store..."
aws ssm put-parameter \
  --name "/${PROJECT_NAME}/deployment/staging-ip" \
  --value "$ELASTIC_IP" \
  --type "String" \
  --overwrite

aws ssm put-parameter \
  --name "/${PROJECT_NAME}/deployment/staging-elastic-ip-allocation-id" \
  --value "$ALLOCATION_ID" \
  --type "String" \
  --overwrite

echo "✅ Complete! Your instance now has a permanent IP: $ELASTIC_IP"
echo ""
echo "📋 Next Steps:"
echo "  1. Update Route53 DNS: api-staging.yourdomain.com → $ELASTIC_IP"
echo "  2. Update GitHub Actions: Use $ELASTIC_IP directly (no dynamic lookup needed)"
echo "  3. Update firewall rules to allow this IP"
```

### GitHub Actions with Elastic IP

```yaml
# Much simpler with Elastic IP - no dynamic resolution needed
env:
  EC2_HOST: 44.210.115.201  # Elastic IP - never changes

jobs:
  deploy:
    steps:
      - name: Deploy to EC2
        run: |
          ssh ec2-user@${{ env.EC2_HOST }} \
            "cd /var/www/${{ vars.PROJECT_NAME }} && ./deploy.sh"
```

## Cost Comparison

### Dynamic IP (Free)
```
Monthly Cost: $0
- No Elastic IP charges
- Instance running: $0
- Instance stopped: $0

Complexity:
- GitHub Actions: 5 extra steps
- Maintenance: Minimal (automated)
- Failure risk: Low (with fallback)
```

### Elastic IP (Free when associated)
```
Monthly Cost: $0 (if instance always running)
- Elastic IP associated: $0
- Elastic IP NOT associated: $3.60/month

Monthly Cost (if stopping instances to save):
- Running 8hrs/day: ~$80 saved on EC2, $3.60 spent on EIP
- Net savings: ~$76.40/month

Complexity:
- GitHub Actions: Simple (static IP)
- Maintenance: None
- Failure risk: Very low
```

### Recommendation

**Use Dynamic IP Resolution If**:
- You stop/start instances frequently
- Cost optimization is critical
- You have multiple environments (dev/staging/prod)
- Team is comfortable with AWS automation

**Use Elastic IP If**:
- Instances run 24/7
- You need persistent DNS records
- Simplicity is more important than flexibility
- You have fewer than 5 IPs per region needed

## Troubleshooting

### Issue: Instance ID Not Found

```bash
# Check Parameter Store
aws ssm get-parameter \
  --name "/your-project/deployment/staging-instance-id"

# List all instances
aws ec2 describe-instances \
  --query 'Reservations[].Instances[].[InstanceId,Tags[?Key==`Name`].Value|[0],State.Name,PublicIpAddress]' \
  --output table

# Store correct instance ID
aws ssm put-parameter \
  --name "/your-project/deployment/staging-instance-id" \
  --value "i-YOUR-INSTANCE-ID" \
  --overwrite
```

### Issue: IP Resolution Returns "None"

```bash
# Check instance state
aws ec2 describe-instances \
  --instance-ids "i-YOUR-INSTANCE-ID" \
  --query 'Reservations[0].Instances[0].[State.Name,PublicIpAddress]'

# If stopped, start instance
aws ec2 start-instances --instance-ids "i-YOUR-INSTANCE-ID"

# Wait for running state
aws ec2 wait instance-running --instance-ids "i-YOUR-INSTANCE-ID"

# Get new IP
aws ec2 describe-instances \
  --instance-ids "i-YOUR-INSTANCE-ID" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text
```

### Issue: SSH Connection Failed

```bash
# Test IP resolution
CURRENT_IP=$(aws ec2 describe-instances \
  --instance-ids "i-YOUR-INSTANCE-ID" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text)

echo "Resolved IP: $CURRENT_IP"

# Test SSH manually
ssh -v -o ConnectTimeout=10 \
  -i ~/.ssh/deploy_key \
  ec2-user@"$CURRENT_IP"

# Check security group rules
aws ec2 describe-security-groups \
  --group-ids "sg-YOUR-SECURITY-GROUP" \
  --query 'SecurityGroups[0].IpPermissions'
```

## Best Practices

### 1. Always Use Fallback Strategy
```yaml
# Never rely on single source
- Primary: Instance ID lookup
- Fallback: Cached Parameter Store IP
- Validation: Check IP is not empty or "None"
```

### 2. Update Cached IP on Success
```yaml
# Keep Parameter Store in sync
- name: Cache Current IP
  if: success()
  run: |
    aws ssm put-parameter \
      --name "/${{ env.PROJECT_NAME }}/deployment/staging-ip" \
      --value "${{ steps.ec2-ip.outputs.current_ip }}" \
      --overwrite
```

### 3. Add Monitoring and Alerts
```yaml
# Notify on IP changes
- name: Check IP Change
  run: |
    OLD_IP=$(aws ssm get-parameter \
      --name "/${{ env.PROJECT_NAME }}/deployment/staging-ip" \
      --query 'Parameter.Value' --output text)

    if [ "$OLD_IP" != "${{ steps.ec2-ip.outputs.current_ip }}" ]; then
      echo "⚠️  EC2 IP changed: $OLD_IP → ${{ steps.ec2-ip.outputs.current_ip }}"
      # Send Slack notification
      curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
        -d '{"text":"🔄 Staging IP changed: '"$OLD_IP"' → '"${{ steps.ec2-ip.outputs.current_ip }}"'"}'
    fi
```

### 4. Tag Instances for Easy Identification
```bash
# Tag instances properly
aws ec2 create-tags \
  --resources "i-YOUR-INSTANCE-ID" \
  --tags \
    "Key=Name,Value=your-project-staging" \
    "Key=Environment,Value=staging" \
    "Key=Project,Value=your-project" \
    "Key=ManagedBy,Value=terraform"

# Query by tags instead of instance ID
aws ec2 describe-instances \
  --filters \
    "Name=tag:Project,Values=your-project" \
    "Name=tag:Environment,Values=staging" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text
```

## Integration with Existing Commands

### Update setup-project-api-deployment

```bash
# Add during Phase 1: Environment Validation
echo "🔧 Configuring dynamic IP resolution..."

# Store instance ID
aws ssm put-parameter \
  --name "/${PROJECT_NAME}/deployment/staging-instance-id" \
  --value "$EC2_INSTANCE_ID" \
  --type "String" \
  --overwrite

# Get and cache current IP
CURRENT_IP=$(aws ec2 describe-instances \
  --instance-ids "$EC2_INSTANCE_ID" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text)

aws ssm put-parameter \
  --name "/${PROJECT_NAME}/deployment/staging-ip" \
  --value "$CURRENT_IP" \
  --type "String" \
  --overwrite

echo "✅ Dynamic IP resolution configured"
echo "   Instance ID: $EC2_INSTANCE_ID"
echo "   Current IP: $CURRENT_IP"
```

### Update GitHub Actions Templates

All deployment workflows should use the dynamic IP resolution pattern by default, with clear comments explaining the benefits.

This command ensures your deployments never fail due to EC2 IP address changes while keeping costs at $0.
