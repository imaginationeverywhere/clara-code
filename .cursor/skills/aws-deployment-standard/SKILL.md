---
name: aws-deployment-standard
description: Implement AWS deployments with Amplify for frontends, App Runner/EC2 for backends, and infrastructure automation. Use when deploying to AWS, setting up Amplify, configuring EC2, or automating deployments. Triggers on requests for AWS deployment, Amplify setup, EC2 configuration, or cloud infrastructure.
---

# AWS Deployment Standard

Production-grade AWS deployment patterns from DreamiHairCare and QuikNation implementations with Amplify for frontends, App Runner/EC2 for backends, and comprehensive infrastructure automation.

## Skill Metadata

- **Name:** aws-deployment-standard
- **Version:** 1.0.0
- **Category:** Infrastructure & DevOps
- **Source:** DreamiHairCare + QuikNation Production Implementation
- **Related Skills:** docker-containerization-standard, ci-cd-pipeline-standard

## When to Use This Skill

Use this skill when:
- Deploying Next.js frontends to AWS Amplify
- Deploying Node.js/Express backends to App Runner or EC2
- Setting up PM2 process management
- Configuring nginx reverse proxy
- Managing AWS Parameter Store secrets
- Setting up multi-environment deployments (staging/production)

## Core Patterns

### 1. AWS Amplify Deployment (Frontend)

```yaml
# amplify.yml - Monorepo Next.js deployment
version: 1
runtime:
  versions:
    node: 20

applications:
  - appRoot: frontend
    frontend:
      phases:
        preBuild:
          commands:
            # Environment info logging
            - echo "🚀 Build Info:"
            - echo "  • Project: $(basename $(pwd))"
            - echo "  • Branch: $AWS_BRANCH"
            - echo "  • Commit: $AWS_COMMIT_ID"
            - echo "  • App Root: frontend/"

            # Optional: Change detection (save build minutes)
            - |
              if [ "$AWS_COMMIT_ID" != "" ]; then
                CHANGED=$(git diff --name-only $AWS_COMMIT_ID~1 $AWS_COMMIT_ID || echo "frontend/")
                if ! echo "$CHANGED" | grep -E "^(frontend/|package\.json|pnpm-lock|amplify\.yml)"; then
                  echo "⏭️ No frontend changes. Skipping build."
                  exit 0
                fi
              fi

            # Slack notification (optional)
            - 'curl -X POST -H "Content-type: application/json" --data "{\"text\":\"🚀 Build Started\\n• Branch: $AWS_BRANCH\\n• Commit: ${AWS_COMMIT_ID:0:7}\"}" $SLACK_WEBHOOK_URL 2>/dev/null || true'

            # Install pnpm
            - npm install -g pnpm@9

            # Install dependencies with fallback
            - pnpm install --frozen-lockfile || pnpm install --legacy-peer-deps

        build:
          commands:
            # Build with error handling
            - |
              cd frontend && pnpm run build || (
                curl -X POST -H "Content-type: application/json" \
                  --data "{\"text\":\"❌ Build FAILED\\n• Branch: $AWS_BRANCH\"}" \
                  $SLACK_WEBHOOK_URL 2>/dev/null
                exit 1
              )

            # Create Next.js SSR manifest
            - |
              mkdir -p .next
              cat > .next/deploy-manifest.json << "EOF"
              {"version": 1, "framework": "next-ssr"}
              EOF

        postBuild:
          commands:
            - echo "✅ Build completed successfully"
            - 'curl -X POST -H "Content-type: application/json" --data "{\"text\":\"✅ Deployed Successfully\\n• Branch: $AWS_BRANCH\"}" $SLACK_WEBHOOK_URL 2>/dev/null || true'

      artifacts:
        baseDirectory: frontend/.next
        files:
          - '**/*'

      cache:
        paths:
          - node_modules/**/*
          - frontend/node_modules/**/*
          - frontend/.next/cache/**/*
          - .pnpm-store/**/*
```

### 2. PM2 Ecosystem Configuration (Backend)

```javascript
// ecosystem.config.js - Production PM2 configuration
module.exports = {
  apps: [
    {
      name: 'project-backend',
      script: './dist/index.js',
      instances: 1,
      exec_mode: 'cluster',
      max_memory_restart: '400M',
      node_args: '--max-old-space-size=384',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      pid_file: './pids/app.pid',
      restart_delay: 5000,
      max_restarts: 5,

      env_production: {
        NODE_ENV: 'production',
        PORT: 3007,
        API_URL: 'https://api.example.com',
        FRONTEND_URL: 'https://example.com',
        DATABASE_URL: process.env.DATABASE_URL_PRODUCTION,
        CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY_PRODUCTION,
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY_PRODUCTION,
        AWS_REGION: 'us-east-1',
        LOG_LEVEL: 'info',
        ENABLE_GRAPHQL_PLAYGROUND: false,
        RATE_LIMIT_REQUESTS: 60,
        RATE_LIMIT_WINDOW: 60000,
        COOKIE_SECURE: true,
        COOKIE_SAMESITE: 'strict',
        TRUST_PROXY: true,
      },

      env_staging: {
        NODE_ENV: 'staging',
        PORT: 3008,
        API_URL: 'https://api-dev.example.com',
        FRONTEND_URL: 'https://dev.example.com',
        DATABASE_URL: process.env.DATABASE_URL_STAGING,
        CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY_STAGING,
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY_STAGING,
        LOG_LEVEL: 'debug',
        ENABLE_GRAPHQL_PLAYGROUND: true,
        RATE_LIMIT_REQUESTS: 100,
        RATE_LIMIT_WINDOW: 60000,
        COOKIE_SECURE: true,
        COOKIE_SAMESITE: 'lax',
        TRUST_PROXY: true,
      },

      env_development: {
        NODE_ENV: 'development',
        PORT: 3001,
        API_URL: 'http://localhost:3001',
        FRONTEND_URL: 'http://localhost:3000',
        DATABASE_URL: process.env.DATABASE_URL,
        LOG_LEVEL: 'debug',
        ENABLE_GRAPHQL_PLAYGROUND: true,
        RATE_LIMIT_REQUESTS: 1000,
        COOKIE_SECURE: false,
        COOKIE_SAMESITE: 'lax',
        TRUST_PROXY: false,
      },
    },
  ],

  deploy: {
    production: {
      user: 'ec2-user',
      host: ['ec2-ip-address'],
      ref: 'origin/main',
      repo: 'git@github.com:org/repo.git',
      path: '/home/ec2-user/apps/project-backend',
      'post-deploy': 'cd backend && npm install --prod && npm run build && pm2 reload ecosystem.config.js --env production',
      'post-setup': 'cd backend && npm install --prod && npm run build',
    },

    staging: {
      user: 'ec2-user',
      host: ['ec2-ip-address'],
      ref: 'origin/develop',
      repo: 'git@github.com:org/repo.git',
      path: '/home/ec2-user/apps/project-backend-staging',
      'post-deploy': 'cd backend && npm install && npm run build && pm2 reload ecosystem.config.js --env staging',
      'post-setup': 'cd backend && npm install && npm run build',
    },
  },
};
```

### 3. AWS Parameter Store Secrets Management

```bash
#!/bin/bash
# setup-parameter-store.sh - Migrate secrets to AWS Parameter Store

set -e

PROJECT_NAME="${1:-project}"
ENVIRONMENT="${2:-production}"

# Function to create parameter
create_parameter() {
  local name=$1
  local value=$2
  local description=$3

  aws ssm put-parameter \
    --name "/${PROJECT_NAME}/${ENVIRONMENT}/${name}" \
    --value "${value}" \
    --type "SecureString" \
    --description "${description}" \
    --overwrite

  echo "✅ Created parameter: /${PROJECT_NAME}/${ENVIRONMENT}/${name}"
}

# Upload secrets from .env file
upload_from_env() {
  local env_file=$1

  if [ ! -f "$env_file" ]; then
    echo "❌ File not found: $env_file"
    exit 1
  fi

  while IFS='=' read -r key value; do
    # Skip comments and empty lines
    [[ $key =~ ^#.*$ ]] && continue
    [[ -z $key ]] && continue

    # Remove quotes from value
    value=$(echo "$value" | sed 's/^["'"'"']//;s/["'"'"']$//')

    # Create parameter
    create_parameter "$key" "$value" "Auto-imported from $env_file"
  done < "$env_file"
}

# Download secrets to .env file
download_to_env() {
  local output_file=$1

  echo "# Auto-generated from AWS Parameter Store" > "$output_file"
  echo "# Generated: $(date)" >> "$output_file"
  echo "" >> "$output_file"

  # Get all parameters for this project/environment
  aws ssm get-parameters-by-path \
    --path "/${PROJECT_NAME}/${ENVIRONMENT}" \
    --with-decryption \
    --query 'Parameters[*].[Name,Value]' \
    --output text | while read -r name value; do
      # Extract key name from full path
      key=$(echo "$name" | sed "s|/${PROJECT_NAME}/${ENVIRONMENT}/||")
      echo "${key}=${value}" >> "$output_file"
    done

  echo "✅ Downloaded secrets to: $output_file"
}

# Main
case "$3" in
  upload)
    upload_from_env "$4"
    ;;
  download)
    download_to_env "$4"
    ;;
  *)
    echo "Usage: $0 <project> <environment> <upload|download> <file>"
    exit 1
    ;;
esac
```

### 4. nginx Reverse Proxy Configuration

```nginx
# /etc/nginx/conf.d/project.conf

# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

# Upstream for backend
upstream project_backend {
    server 127.0.0.1:3007;
    keepalive 32;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name api.example.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name api.example.com;

    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

    # SSL security settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Logging
    access_log /var/log/nginx/project_access.log;
    error_log /var/log/nginx/project_error.log;

    # Health check endpoint (no rate limiting)
    location /health {
        proxy_pass http://project_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }

    # GraphQL endpoint
    location /graphql {
        limit_req zone=api burst=20 nodelay;

        proxy_pass http://project_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Buffer settings
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
    }

    # Webhooks (no rate limiting for trusted sources)
    location /webhooks {
        proxy_pass http://project_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Preserve raw body for signature verification
        proxy_set_header Content-Type $content_type;
        proxy_pass_request_body on;
    }

    # All other routes
    location / {
        limit_req zone=api burst=10 nodelay;

        proxy_pass http://project_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 5. Port Management System

```bash
#!/bin/bash
# port-management.sh - Intelligent port allocation for shared EC2

set -e

PORT_REGISTRY="/home/ec2-user/port-registry.json"
PORT_RANGE_START=3000
PORT_RANGE_END=3100

# Initialize registry if not exists
init_registry() {
  if [ ! -f "$PORT_REGISTRY" ]; then
    echo '{"ports": {}, "nextPort": 3000}' > "$PORT_REGISTRY"
  fi
}

# Scan current port usage
scan_ports() {
  echo "🔍 Scanning port usage..."
  echo ""
  echo "Active processes:"
  ss -tlnp 2>/dev/null | grep -E ":(30[0-9]{2})" | while read -r line; do
    port=$(echo "$line" | grep -oE ":(30[0-9]{2})" | cut -d: -f2)
    pid=$(echo "$line" | grep -oE "pid=[0-9]+" | cut -d= -f2)
    process=$(ps -p "$pid" -o comm= 2>/dev/null || echo "unknown")
    echo "  Port $port: $process (PID: $pid)"
  done
  echo ""
  echo "Registered ports:"
  jq -r '.ports | to_entries[] | "  \(.key): \(.value.port) (\(.value.environment))"' "$PORT_REGISTRY"
}

# Show port registry
show_registry() {
  echo "📋 Port Registry:"
  jq '.' "$PORT_REGISTRY"
}

# Allocate new port
allocate_port() {
  local project=$1
  local environment=$2

  init_registry

  # Check if already allocated
  existing=$(jq -r ".ports[\"${project}-${environment}\"].port // empty" "$PORT_REGISTRY")
  if [ -n "$existing" ]; then
    echo "⚠️ Port already allocated for ${project}-${environment}: $existing"
    return 0
  fi

  # Find next available port
  next_port=$(jq -r '.nextPort' "$PORT_REGISTRY")

  # Check if port is in use
  while ss -tlnp 2>/dev/null | grep -q ":${next_port} "; do
    next_port=$((next_port + 1))
    if [ $next_port -gt $PORT_RANGE_END ]; then
      echo "❌ No available ports in range $PORT_RANGE_START-$PORT_RANGE_END"
      exit 1
    fi
  done

  # Allocate port
  jq --arg proj "${project}-${environment}" \
     --argnumber port "$next_port" \
     --arg env "$environment" \
     '.ports[$proj] = {port: $port, environment: $env, allocated: now | todate} | .nextPort = ($port + 1)' \
     "$PORT_REGISTRY" > "$PORT_REGISTRY.tmp" && mv "$PORT_REGISTRY.tmp" "$PORT_REGISTRY"

  echo "✅ Allocated port $next_port for ${project}-${environment}"
  echo "$next_port"
}

# Main
case "$1" in
  scan)
    scan_ports
    ;;
  show)
    init_registry
    show_registry
    ;;
  allocate)
    allocate_port "$2" "$3"
    ;;
  *)
    echo "Usage: $0 {scan|show|allocate <project> <environment>}"
    exit 1
    ;;
esac
```

### 6. EC2 Infrastructure Setup Script

```bash
#!/bin/bash
# setup-ec2-infrastructure.sh - One-time EC2 setup

set -e

echo "🚀 Setting up EC2 infrastructure..."

# Update system
sudo yum update -y

# Install Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install nginx
sudo amazon-linux-extras install nginx1 -y
sudo systemctl start nginx
sudo systemctl enable nginx

# Install certbot for SSL
sudo yum install -y certbot python3-certbot-nginx

# Create directories
mkdir -p /home/ec2-user/apps
mkdir -p /home/ec2-user/logs
mkdir -p /home/ec2-user/scripts

# Initialize port registry
echo '{"ports": {}, "nextPort": 3000}' > /home/ec2-user/port-registry.json

# Configure PM2 to start on boot
pm2 startup systemd -u ec2-user --hp /home/ec2-user

# Set up log rotation
sudo tee /etc/logrotate.d/pm2 << 'EOF'
/home/ec2-user/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0640 ec2-user ec2-user
}
EOF

echo "✅ EC2 infrastructure setup complete"
echo ""
echo "Next steps:"
echo "1. Configure nginx for your projects"
echo "2. Set up SSL certificates: sudo certbot --nginx -d api.example.com"
echo "3. Deploy your applications"
```

## Environment Variables

### AWS Configuration
```bash
# AWS Region and Account
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=123456789012

# EC2 Configuration
EC2_HOST_IP=3.xxx.xxx.xxx
EC2_SSH_KEY_NAME=my-key-pair

# Domain Configuration
PROJECT_DOMAIN=example.com
API_SUBDOMAIN=api
FRONTEND_SUBDOMAIN=app

# Amplify Configuration
AMPLIFY_APP_ID=dxxxxxxxxx
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
```

### Application Secrets (Parameter Store)
```bash
# Store in AWS Parameter Store
/project/production/DATABASE_URL
/project/production/CLERK_SECRET_KEY
/project/production/STRIPE_SECRET_KEY
/project/production/JWT_SECRET
/project/production/SESSION_SECRET
```

## Implementation Checklist

### Frontend (Amplify)
- [ ] Create amplify.yml in repository root
- [ ] Configure environment variables in Amplify console
- [ ] Set up custom domain with SSL
- [ ] Configure branch deployments (main → production, develop → staging)
- [ ] Enable Slack notifications (optional)
- [ ] Test build locally before pushing

### Backend (EC2/App Runner)
- [ ] Run EC2 infrastructure setup script
- [ ] Configure nginx reverse proxy
- [ ] Set up SSL certificates with certbot
- [ ] Create PM2 ecosystem.config.js
- [ ] Upload secrets to Parameter Store
- [ ] Configure GitHub Actions for deployment
- [ ] Set up port allocation for project

### Security
- [ ] Enable HTTPS everywhere
- [ ] Configure security headers in nginx
- [ ] Set up rate limiting
- [ ] Use Parameter Store for secrets (not .env files)
- [ ] Enable CloudWatch logging

### Monitoring
- [ ] Configure PM2 logs
- [ ] Set up CloudWatch alarms
- [ ] Enable health check endpoints
- [ ] Configure Slack notifications for deployments

## Related Commands

- `/implement-aws-deployment` - Complete AWS deployment setup
- `/implement-ci-cd` - CI/CD pipeline implementation

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-15 | Initial release from DreamiHairCare/QuikNation patterns |
