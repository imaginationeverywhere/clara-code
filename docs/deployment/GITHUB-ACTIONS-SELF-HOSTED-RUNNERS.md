# GitHub Actions Self-Hosted Runners Setup Guide

Complete guide for setting up and managing GitHub Actions self-hosted runners on developer machines for deployment workflows.

**Table of Contents:**
- [Overview & Requirements](#overview--requirements)
- [Installation Guide](#installation-guide)
- [Configuration](#configuration)
- [Security & Credentials](#security--credentials)
- [Runner Management](#runner-management)
- [Troubleshooting](#troubleshooting)
- [Advanced Setup](#advanced-setup)
- [Team Coordination](#team-coordination)

---

## Overview & Requirements

### What are Self-Hosted Runners?

Self-hosted runners are machines you manage and maintain that execute GitHub Actions workflows. Unlike GitHub-hosted runners, self-hosted runners have:

- **Full control** over the runtime environment
- **Access** to local resources and networks
- **No time limits** on job execution
- **Custom tools** and configurations
- **Secure credential storage** using local authentication

### Why Self-Hosted Runners for Deployments?

| Aspect | GitHub-Hosted | Self-Hosted |
|--------|---------------|-------------|
| **Use Case** | Regression testing | Deployments |
| **Environment** | Ephemeral | Persistent |
| **Access** | Isolated | Full control |
| **Credentials** | GitHub Secrets | Local storage |
| **Deployment** | ❌ Not suitable | ✅ Required |
| **Cost** | Per-minute billing | One-time setup |

### System Requirements

**macOS (Development):**
- macOS 10.15 (Catalina) or newer
- 2+ CPU cores
- 4GB+ RAM
- 20GB+ free disk space
- Stable internet connection

**Linux (Optional):**
- Ubuntu 20.04 LTS or newer
- 2+ CPU cores
- 4GB+ RAM
- 20GB+ free disk space

**Network Requirements:**
```
Outbound connectivity to:
- github.com:443
- api.github.com:443
- uploads.github.com:443
- objects.githubusercontent.com:443
- *.aws.amazon.com:443
- *.execute-api.{{REGION}}.amazonaws.com:443
```

### Terminology

- **Runner:** The GitHub Actions runner application
- **Labels:** Tags that identify runner capabilities (e.g., `macos`, `deployment`)
- **Workflow:** GitHub Actions CI/CD definition file (.yml)
- **Job:** Individual task within a workflow
- **Step:** Command or action within a job

---

## Installation Guide

### Step 1: Get Registration Token

1. Go to **GitHub Repository → Settings → Actions → Runners**
2. Click **New self-hosted runner**
3. Select **macOS** as the operating system
4. Note the registration URL and token (valid for 1 hour)

Keep this token safe - you'll need it for configuration.

### Step 2: Create Runner Directory

```bash
# Create standard directory for GitHub Actions runner
mkdir -p /Users/{{USERNAME}}/Projects/actions-runner
cd /Users/{{USERNAME}}/Projects/actions-runner
```

**Why this location?**
- Consistent across all developer machines
- Easy to backup and version
- Isolated from system directories
- Clear naming convention

### Step 3: Download Runner Package

```bash
# Check latest version at https://github.com/actions/runner/releases

# Download runner package (replace {{VERSION}} with latest)
curl -o actions-runner-osx-x64-{{VERSION}}.tar.gz \
  -L https://github.com/actions/runner/releases/download/v{{VERSION}}/actions-runner-osx-x64-{{VERSION}}.tar.gz

# Verify checksum (recommended)
curl -o actions-runner-osx-x64-{{VERSION}}.tar.gz.sha256sum \
  -L https://github.com/actions/runner/releases/download/v{{VERSION}}/actions-runner-osx-x64-{{VERSION}}.tar.gz.sha256sum

shasum -a 256 -c actions-runner-osx-x64-{{VERSION}}.tar.gz.sha256sum
```

### Step 4: Extract Runner

```bash
# Extract runner files
tar xzf ./actions-runner-osx-x64-{{VERSION}}.tar.gz

# Verify extraction
ls -la

# You should see:
# bin/
# externals/
# run.sh
# config.sh
# svc.sh
# etc.
```

### Step 5: Configure Runner

```bash
# Run configuration script
./config.sh \
  --url https://github.com/{{OWNER}}/{{REPO}} \
  --token {{REGISTRATION_TOKEN}} \
  --name {{MACHINE_NAME}}-runner \
  --labels macos,development,deployment \
  --runnergroup default \
  --replace

# Example:
# ./config.sh \
#   --url https://github.com/imaginationeverywhere/quik-nation-ai-boilerplate \
#   --token ABCDEF1234567890 \
#   --name macbook-pro-runner \
#   --labels macos,development,deployment
```

**Configuration Options:**

| Option | Required | Description |
|--------|----------|-------------|
| `--url` | Yes | GitHub repository URL |
| `--token` | Yes | Registration token (1-hour validity) |
| `--name` | Yes | Runner name (must be unique) |
| `--labels` | No | CSV list of labels for identification |
| `--runnergroup` | No | Runner group name (default: default) |
| `--replace` | No | Replace existing runner config |
| `--work` | No | Working directory (default: _work) |

### Step 6: Install LaunchAgent (macOS Auto-Start)

```bash
# Install as LaunchAgent (auto-starts on login)
./svc.sh install

# Verify installation
launchctl list | grep com.github.actions.runner
```

This creates `/Library/LaunchAgents/com.github.actions.runner.service.plist`

### Step 7: Start Runner Service

```bash
# Start the runner service
./svc.sh start

# Verify it's running
./svc.sh status

# Output should show:
# ● GitHub Actions Runner (com.github.actions.runner.service)
# Loaded: loaded (/Library/LaunchAgents/com.github.actions.runner.service.plist)
# Active: active (running)
```

### Step 8: Verify Runner is Connected

1. Go to **GitHub Repository → Settings → Actions → Runners**
2. You should see your runner listed with status **Idle** (green)
3. Verify labels match configuration

**If not visible:**
```bash
# Check runner logs
tail -50 /Users/{{USERNAME}}/Projects/actions-runner/_diag/Runner_{{DATE}}.log

# Common issues:
# - Network connectivity (check firewall)
# - Token expired (get new token and re-configure)
# - Invalid URL (verify repository URL)
```

---

## Configuration

### Runner Configuration File

**Location:** `/Users/{{USERNAME}}/Projects/actions-runner/.runner`

**Do NOT manually edit.** Use `config.sh` instead.

**Auto-Generated Configuration:**
```yaml
name: {{MACHINE_NAME}}-runner
labels:
  - macos
  - development
  - deployment
  - self-hosted
url: https://github.com/{{OWNER}}/{{REPO}}
groups: default
```

### Environment Setup

Create environment variables for deployment:

```bash
# Create .env.runner file in runner directory
cat > /Users/{{USERNAME}}/Projects/actions-runner/.env.runner << 'EOF'
# AWS Configuration
export AWS_REGION=us-east-1
export AWS_PROFILE=default

# Deployment Configuration
export APP_ENVIRONMENT=development
export DEPLOYMENT_TIMEOUT=1800

# GitHub Configuration
export GITHUB_TOKEN={{GITHUB_PAT}}

# Notification Configuration
export SLACK_WEBHOOK_URL={{SLACK_WEBHOOK}}
EOF

# Make secure (not world-readable)
chmod 600 /Users/{{USERNAME}}/Projects/actions-runner/.env.runner

# Source in svc.sh (if needed for custom environment)
```

### Working Directory Setup

```bash
# Runner creates _work directory for job execution
/Users/{{USERNAME}}/Projects/actions-runner/_work/
├── _temp/           # Temporary files
├── _actions/        # Downloaded actions
└── {{REPO_NAME}}/   # Cloned repository
```

**Clean up old jobs (optional):**
```bash
# Remove old job artifacts
cd /Users/{{USERNAME}}/Projects/actions-runner/_work
rm -rf */

# Or use runner cleanup script
./bin/Runner.Listener --cleanup
```

---

## Security & Credentials

### AWS Credentials

**Recommended:** Store credentials in `~/.aws/credentials`

```bash
# Create AWS credentials file
mkdir -p ~/.aws
cat > ~/.aws/credentials << 'EOF'
[default]
aws_access_key_id = {{YOUR_ACCESS_KEY}}
aws_secret_access_key = {{YOUR_SECRET_KEY}}

[staging]
aws_access_key_id = {{STAGING_KEY}}
aws_secret_access_key = {{STAGING_SECRET}}
EOF

# Secure the file (400 = read-only for owner)
chmod 400 ~/.aws/credentials

# Create AWS config
cat > ~/.aws/config << 'EOF'
[default]
region = us-east-1
output = json

[profile staging]
region = us-east-1
EOF

# Verify credentials
aws sts get-caller-identity
```

**Workflow Usage:**
```yaml
- name: Configure AWS
  run: |
    # Automatically reads from ~/.aws/credentials
    aws sts get-caller-identity

    # Or use specific profile
    aws s3 ls --profile staging
```

### SSH Keys for EC2 Deployment

```bash
# Create SSH directory
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Copy EC2 private key
# (Never commit SSH keys to repository!)
cp /path/to/ec2-key.pem ~/.ssh/ec2-key.pem

# Secure the key (600 = read/write for owner only)
chmod 600 ~/.ssh/ec2-key.pem

# Test SSH connection
ssh -i ~/.ssh/ec2-key.pem -o StrictHostKeyChecking=no ec2-user@{{EC2_IP}} "echo 'SSH working'"
```

**Workflow Usage:**
```yaml
- name: Deploy to EC2
  run: |
    ssh -i ~/.ssh/ec2-key.pem ec2-user@{{EC2_IP}} "command-to-execute"
```

### GitHub Personal Access Token (PAT)

```bash
# Create PAT at GitHub → Settings → Developer settings → Personal access tokens

# Store in GitHub CLI
gh auth login
# Select GitHub.com
# Select HTTPS
# Paste your token

# Or store in ~/.bash_profile or ~/.zshrc
export GITHUB_TOKEN={{YOUR_PAT}}

# Verify
gh auth status
```

### NEVER in Repository

❌ **NEVER commit these to git:**
```
.aws/credentials         # AWS credentials
.ssh/id_rsa              # SSH private keys
.env                     # Local environment variables
.env.local               # Local secrets
```

✅ **Add to .gitignore:**
```bash
.aws/
.ssh/
.env
.env.local
.env.*.local
.runner-creds
```

---

## Runner Management

### Service Control Commands

**macOS LaunchAgent Control:**

```bash
# Start runner service
/Users/{{USERNAME}}/Projects/actions-runner/svc.sh start
# or
launchctl start com.github.actions.runner.service

# Stop runner service
/Users/{{USERNAME}}/Projects/actions-runner/svc.sh stop
# or
launchctl stop com.github.actions.runner.service

# Check status
/Users/{{USERNAME}}/Projects/actions-runner/svc.sh status
# or
launchctl list | grep com.github.actions.runner

# Restart service
/Users/{{USERNAME}}/Projects/actions-runner/svc.sh stop
/Users/{{USERNAME}}/Projects/actions-runner/svc.sh start

# Uninstall service (for removal)
/Users/{{USERNAME}}/Projects/actions-runner/svc.sh uninstall
```

### Checking Runner Status

**In GitHub UI:**
```
GitHub → Settings → Actions → Runners
```

**From Terminal:**
```bash
# Check if runner process is running
ps aux | grep Runner.Worker
ps aux | grep Runner.Listener

# View runner logs
tail -f /Users/{{USERNAME}}/Projects/actions-runner/_diag/Runner_*.log
tail -f /Users/{{USERNAME}}/Projects/actions-runner/_diag/Worker_*.log

# Check runner listener log
tail -100 /Users/{{USERNAME}}/Projects/actions-runner/_diag/Runner_{{RUNNER_NAME}}_*.log
```

### Updating Runner

```bash
cd /Users/{{USERNAME}}/Projects/actions-runner

# Stop the runner
./svc.sh stop

# Wait for jobs to complete
sleep 30

# Backup old configuration
cp .runner .runner.backup
cp .env .env.backup 2>/dev/null || true

# Remove old runner files
rm -rf bin/ externals/ *.tar.gz

# Download new version
curl -o actions-runner-osx-x64-{{NEW_VERSION}}.tar.gz \
  -L https://github.com/actions/runner/releases/download/v{{NEW_VERSION}}/actions-runner-osx-x64-{{NEW_VERSION}}.tar.gz

tar xzf ./actions-runner-osx-x64-{{NEW_VERSION}}.tar.gz

# Configuration is preserved automatically
# Restart the runner
./svc.sh start

# Verify update
./bin/Runner.Listener --version
```

### Removing Runner

```bash
cd /Users/{{USERNAME}}/Projects/actions-runner

# 1. Uninstall the service
./svc.sh uninstall

# 2. Remove registration (need token)
./config.sh remove --token {{NEW_TOKEN}}
# Get token from: GitHub → Settings → Actions → Runners → Select runner → Remove

# 3. Clean up directory
cd ..
rm -rf actions-runner/

# 4. Verify removal
# Check GitHub UI - runner should no longer appear
```

---

## Troubleshooting

### Runner Not Connecting to GitHub

**Symptoms:**
- Runner shows as "Offline" in GitHub UI
- Runner not accepting jobs

**Diagnostic:**
```bash
# Check network connectivity
ping github.com
curl -v https://github.com

# Check runner logs
tail -100 /Users/{{USERNAME}}/Projects/actions-runner/_diag/Runner_*.log

# Look for errors like:
# - "Unable to connect"
# - "Network is unreachable"
# - "Connection timeout"
```

**Solutions:**
```bash
# 1. Check firewall
sudo lsof -i :443 | grep LISTEN

# 2. Check DNS
nslookup github.com
dig github.com

# 3. Test GitHub connectivity
curl -v https://api.github.com

# 4. Re-authenticate runner
cd /Users/{{USERNAME}}/Projects/actions-runner

# Get new token from GitHub UI
./config.sh remove --token {{OLD_TOKEN}}
./config.sh --url https://github.com/{{OWNER}}/{{REPO}} --token {{NEW_TOKEN}}

# 5. Restart service
./svc.sh restart
```

### Workflow Can't Find Runner

**Symptoms:**
- Workflow stuck in queue
- "No available runners with labels" error

**Causes:**
```yaml
# ❌ WRONG: Runner label doesn't exist
runs-on: [self-hosted, windows]

# ✅ CORRECT: Use exact labels registered
runs-on: [self-hosted, macos, deployment]
```

**Check Registered Labels:**
```bash
# View runner labels in GitHub UI
# GitHub → Settings → Actions → Runners → Select your runner

# Or check locally
grep -A 5 "labels:" /Users/{{USERNAME}}/Projects/actions-runner/.runner
```

**Fix:**
```bash
# Re-configure with correct labels
cd /Users/{{USERNAME}}/Projects/actions-runner
./config.sh --url ... --token ... --labels macos,deployment,development
```

### Job Timeout or Hangs

**Symptoms:**
- Job runs indefinitely
- Job times out after 6 hours
- "Runner has been timed out waiting for action"

**Check Process:**
```bash
# Is runner process running?
ps aux | grep Runner

# If stuck, kill it
pkill -9 -f Runner.Worker

# Check for zombie processes
ps aux | grep defunct

# Restart service
/Users/{{USERNAME}}/Projects/actions-runner/svc.sh restart
```

**Check Logs:**
```bash
# View worker logs
tail -f /Users/{{USERNAME}}/Projects/actions-runner/_diag/Worker_*.log

# Check for memory issues
top -b -n 1 | head -20
```

**Workflow Fixes:**
```yaml
# Add explicit timeout
jobs:
  deploy:
    runs-on: [self-hosted, macos, deployment]
    timeout-minutes: 30  # ← Prevents infinite hang

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          timeout-minutes: 5  # ← Timeout per step
```

### AWS Credentials Not Found

**Symptoms:**
- "Unable to locate credentials"
- "NoCredentialsError"
- AWS CLI returns authentication errors

**Check Credentials:**
```bash
# Verify credentials file exists
ls -la ~/.aws/credentials

# Check permissions (should be 400)
stat ~/.aws/credentials

# View contents (CAREFUL - contains secrets!)
cat ~/.aws/credentials

# Test credentials
aws sts get-caller-identity

# Check for credential profile
aws configure list

# Use specific profile
export AWS_PROFILE=staging
aws sts get-caller-identity
```

**Workflow Access:**
```yaml
# Credentials automatically available in workflow
steps:
  - name: AWS Auth
    run: aws sts get-caller-identity

  # Or specify profile
  - name: AWS with Profile
    run: AWS_PROFILE=staging aws s3 ls
```

**Fix Permissions:**
```bash
chmod 400 ~/.aws/credentials
chmod 600 ~/.aws/config
```

### SSH Key Not Found

**Symptoms:**
- "Permission denied (publickey)"
- "Could not open a connection to your authentication agent"

**Check SSH Keys:**
```bash
# List SSH keys
ls -la ~/.ssh/

# Test SSH connection
ssh -i ~/.ssh/ec2-key.pem -v ec2-user@{{EC2_IP}}

# Check key permissions (should be 600)
stat ~/.ssh/ec2-key.pem

# Add key to SSH agent
ssh-add ~/.ssh/ec2-key.pem

# List keys in agent
ssh-add -l
```

**Workflow SSH:**
```yaml
steps:
  - name: SSH Deploy
    run: |
      # Key should be in ~/.ssh/
      ssh -i ~/.ssh/ec2-key.pem ec2-user@{{EC2_IP}} "command"

      # Or use SSH agent
      ssh-keyscan -H {{EC2_IP}} >> ~/.ssh/known_hosts
      ssh ec2-user@{{EC2_IP}} "command"
```

**Fix Permissions:**
```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/ec2-key.pem
chmod 644 ~/.ssh/known_hosts
```

### Runner Running Out of Disk Space

**Symptoms:**
- Job fails with "No space left on device"
- Disk full errors
- Slow performance

**Check Disk Usage:**
```bash
# Check disk space
df -h

# Check runner directory size
du -sh /Users/{{USERNAME}}/Projects/actions-runner/

# Check working directory
du -sh /Users/{{USERNAME}}/Projects/actions-runner/_work/
```

**Clean Up:**
```bash
# Remove old job artifacts
cd /Users/{{USERNAME}}/Projects/actions-runner/_work
rm -rf */

# Remove old runner downloads
cd /Users/{{USERNAME}}/Projects/actions-runner
rm -f *.tar.gz*

# Clean system cache
rm -rf ~/Library/Caches/*

# Use disk utility to clear space
```

### macOS Security Prompts

**Symptoms:**
- Workflow prompts for password
- "Cannot find executable" errors
- Code signing issues

**Solutions:**
```bash
# Allow runner to execute without prompts
sudo dseditgroup -o edit -a {{USERNAME}} -t user com.apple.access_sessionkeychain

# Or give permanent permission
sudo chmod +a "user:{{USERNAME}} allow execute" \
  /Users/{{USERNAME}}/Projects/actions-runner/bin/Runner.Worker
```

---

## Advanced Setup

### Multiple Runners on Single Machine

Run multiple runners concurrently for different deployments:

```bash
# Create separate directories
mkdir -p /Users/{{USERNAME}}/Projects/actions-runner-prod
mkdir -p /Users/{{USERNAME}}/Projects/actions-runner-staging

# Configure each separately
cd /Users/{{USERNAME}}/Projects/actions-runner-prod
./config.sh --name {{NAME}}-prod --labels macos,deployment,production

cd /Users/{{USERNAME}}/Projects/actions-runner-staging
./config.sh --name {{NAME}}-staging --labels macos,deployment,staging

# Install both services
# LaunchAgent names must be different
# Edit /Library/LaunchAgents/com.github.actions.runner.service.plist
# Add suffix for each: ...runner-1.plist, ...runner-2.plist

# Start both
./svc.sh start -n 1
./svc.sh start -n 2
```

### Container-Based Runners (Docker)

Run workflows in Docker containers:

```bash
# Install Docker
# https://docs.docker.com/desktop/mac/install/

# Runner can execute Docker commands
# Make sure Docker daemon is running
```

**Workflow with Docker:**
```yaml
jobs:
  build:
    runs-on: [self-hosted, macos, deployment]

    container:
      image: node:18-alpine

    steps:
      - uses: actions/checkout@v4
      - run: npm install && npm test
```

### Custom Scripts & Tools

Add deployment tools to runner:

```bash
# Create scripts directory
mkdir -p /Users/{{USERNAME}}/Projects/actions-runner/scripts

# Add custom deployment scripts
cat > /Users/{{USERNAME}}/Projects/actions-runner/scripts/deploy.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Deploying application..."
# Your deployment logic here

echo "✅ Deployment complete"
EOF

chmod +x /Users/{{USERNAME}}/Projects/actions-runner/scripts/deploy.sh

# Use in workflow
- name: Deploy
  run: /Users/{{USERNAME}}/Projects/actions-runner/scripts/deploy.sh
```

---

## Team Coordination

### Shared Runner Groups

Create runner groups for team collaboration:

**GitHub UI Setup:**
1. Go to **Organization Settings → Actions → Runner groups**
2. Click **New runner group**
3. Name: "Development Team Runners"
4. Add team members' runners to group

**Workflow Configuration:**
```yaml
jobs:
  deploy:
    runs-on: [self-hosted, macos, deployment]
    # Will use any runner in your organization with these labels
```

### Documentation for Team

Create team runbook:

```markdown
# Team GitHub Actions Runners

## Setup (One-time)
1. Go to GitHub Actions Runners settings
2. Get registration token
3. Run setup.sh with token

## Daily Usage
- Runners auto-start on login
- Check status: GitHub → Settings → Actions → Runners
- Runners idle when not in use

## Troubleshooting
- See GITHUB-ACTIONS-SELF-HOSTED-RUNNERS.md
- Check status in GitHub UI
- View logs in runner directory

## Support
- Contact: {{TEAM_CONTACT}}
```

### Health Monitoring

Set up periodic checks:

```bash
# Create health check script
cat > /Users/{{USERNAME}}/Projects/actions-runner/health-check.sh << 'EOF'
#!/bin/bash

echo "🏥 GitHub Actions Runner Health Check"
echo "====================================="

# Check runner process
if ps aux | grep -q "Runner.Worker"; then
  echo "✅ Runner process running"
else
  echo "❌ Runner process NOT running"
fi

# Check service status
if launchctl list | grep -q "com.github.actions.runner"; then
  echo "✅ Service enabled"
else
  echo "❌ Service NOT enabled"
fi

# Check disk space
DISK_USAGE=$(df /Users/{{USERNAME}} | awk 'NR==2 {print $5}' | sed 's/%//')
echo "💾 Disk usage: ${DISK_USAGE}%"
if [ $DISK_USAGE -gt 80 ]; then
  echo "⚠️  WARNING: Disk almost full!"
fi

# Check network
if curl -s https://api.github.com >/dev/null 2>&1; then
  echo "✅ Network connectivity OK"
else
  echo "❌ Cannot reach GitHub API"
fi

echo "====================================="
EOF

chmod +x /Users/{{USERNAME}}/Projects/actions-runner/health-check.sh

# Run periodically (e.g., weekly)
/Users/{{USERNAME}}/Projects/actions-runner/health-check.sh
```

---

## Quick Reference

### Essential Commands

```bash
# Navigation
cd /Users/{{USERNAME}}/Projects/actions-runner

# Service management
./svc.sh start          # Start runner
./svc.sh stop           # Stop runner
./svc.sh status         # Check status
./svc.sh install        # Install service
./svc.sh uninstall      # Uninstall service

# Configuration
./config.sh             # Re-configure runner
./config.sh remove      # Remove runner

# Logs
tail -f _diag/Runner_*.log
tail -f _diag/Worker_*.log

# Check processes
ps aux | grep Runner
ps aux | grep Runner.Worker

# Check credentials
aws sts get-caller-identity
ssh -T git@github.com
```

### Common Fixes

| Issue | Fix |
|-------|-----|
| Runner offline | Restart service: `./svc.sh restart` |
| Credentials error | Check `~/.aws/credentials` permissions |
| SSH fails | Test: `ssh -i ~/.ssh/key.pem user@host` |
| Disk full | Clean `_work/` directory |
| Job timeout | Add `timeout-minutes` to workflow |
| Can't find runner | Check labels match `runs-on` |

---

## Support & Resources

- **GitHub Actions Documentation:** https://docs.github.com/en/actions
- **Runner Repository:** https://github.com/actions/runner
- **Runner Releases:** https://github.com/actions/runner/releases
- **MacOS LaunchAgent Documentation:** https://developer.apple.com/library/archive/documentation/MacOSX/Conceptual/BPSystemStartup/Chapters/CreatingLaunchAgents.html

---

**Last Updated:** October 2024
**Questions?** See `.github/workflows/CLAUDE.md` or contact DevOps team
