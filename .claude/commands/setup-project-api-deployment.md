# Setup Project API Deployment Command

## Overview
This Claude Code custom command configures deployment for a new backend API project on QuikNation infrastructure. It handles Route53 domain setup, SSL certificates, nginx configuration, GitHub Actions, QuikNation CLI integration, and all project-specific deployment requirements.

**Run this command ONCE per project** after the EC2 infrastructure is set up with `setup-ec2-infrastructure`.

## Prerequisites

⚠️ **REQUIRED**:
1. **EC2 Infrastructure Setup**: Must have run `setup-ec2-infrastructure` first
2. **PRD.md file**: Must exist with project context and requirements
3. **GitHub Repository**: Repository created with admin permissions
4. **Route53 Hosted Zone**: Domain hosted zone must exist in Route53
5. **AWS CLI configured** with Route53 and SSM Parameter Store access
6. **NEON Database**: Staging and production databases created

⚠️ **MUST BE RUN FROM**: `backend/` workspace directory

## Command Usage

**In Claude Code:**
```bash
"Set up API deployment for this project"
"Configure QuikNation deployment with custom domains"
"Initialize backend deployment pipeline"
"Set up project API with domains and SSL"
```

## What This Command Does

This command performs a comprehensive 13-phase project deployment setup:

### Phase 1: Environment Validation ✅
```bash
# Verify we're in backend workspace
if [ ! -f "../docs/PRD.md" ]; then
    echo "❌ CRITICAL ERROR: Must be run from backend/ directory with PRD.md in docs/"
    exit 1
fi

# Verify EC2 infrastructure is set up
INFRASTRUCTURE_STATUS=$(ssh -i ~/.ssh/deploy_key ec2-user@[EC2_HOST_IP] "
  if [ -f /home/ec2-user/infrastructure-health-check.sh ] && \
     systemctl is-active nginx >/dev/null 2>&1 && \
     command -v quiknation >/dev/null 2>&1; then
    echo 'READY'
  else
    echo 'NOT_READY'
  fi
")

if [ "$INFRASTRUCTURE_STATUS" != "READY" ]; then
    echo "❌ CRITICAL ERROR: EC2 infrastructure not set up"
    echo "❌ Please run 'setup-ec2-infrastructure' first"
    exit 1
fi

echo "✅ EC2 infrastructure ready for project deployment"
```

### Phase 2: Port Management & Discovery 🔍
```bash
# Initialize port management system
echo "🔍 Initializing port management system..."

# Check if port management script exists
if [ ! -f "../.claude/port-management.sh" ]; then
    echo "❌ CRITICAL ERROR: Port management script not found"
    echo "❌ Ensure you have copied the complete Claude Code boilerplate"
    exit 1
fi

# Make port management script executable
chmod +x ../.claude/port-management.sh

# Initialize port registry on EC2 if needed
echo "🔧 Initializing port registry..."
../.claude/port-management.sh init

# Display current port usage
echo ""
echo "📊 CURRENT PORT USAGE ANALYSIS:"
echo "================================="
../.claude/port-management.sh scan

echo ""
echo "📋 CURRENT PORT REGISTRY:"
echo "=========================="
../.claude/port-management.sh show

echo ""
echo "⏳ Continuing with automatic port allocation..."
```

### Phase 3: Project Context Extraction & Port Allocation 📋
```bash
# Extract project context from PRD.md
PROJECT_NAME=$(grep -A 1 "Project Name:" ../docs/PRD.md | tail -1 | sed 's/.*: //' | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]//g')
BASE_DOMAIN=$(grep -A 1 "Base Domain:" ../docs/PRD.md | tail -1 | sed 's/.*: //')
ADMIN_EMAIL=$(grep -A 1 "Admin Email:" ../docs/PRD.md | tail -1 | sed 's/.*: //')

# Generate domain names
PRODUCTION_DOMAIN="api.${BASE_DOMAIN}"
STAGING_DOMAIN="api-dev.${BASE_DOMAIN}"
PROJECT_BACKEND_NAME="${PROJECT_NAME}-backend"

echo "📋 Project Information:"
echo "Project: ${PROJECT_NAME}"
echo "Base Domain: ${BASE_DOMAIN}"
echo "Production Domain: ${PRODUCTION_DOMAIN}"
echo "Staging Domain: ${STAGING_DOMAIN}"
echo "Admin Email: ${ADMIN_EMAIL}"

# Automatically allocate ports using port management system
echo ""
echo "🎯 Allocating ports automatically..."
PORT_ALLOCATION=$(../.claude/port-management.sh allocate "${PROJECT_NAME}" "${PROJECT_NAME^} Backend" "${PRODUCTION_DOMAIN}" "${STAGING_DOMAIN}")

if [ $? -eq 0 ]; then
    PRODUCTION_PORT=$(echo $PORT_ALLOCATION | cut -d' ' -f1)
    STAGING_PORT=$(echo $PORT_ALLOCATION | cut -d' ' -f2)
    
    echo "✅ Ports allocated successfully:"
    echo "   Production Port: ${PRODUCTION_PORT}"
    echo "   Staging Port: ${STAGING_PORT}"
    
    # Verify no conflicts
    ../.claude/port-management.sh check "${PRODUCTION_PORT}" "${STAGING_PORT}"
    if [ $? -ne 0 ]; then
        echo "❌ CRITICAL ERROR: Port conflicts detected"
        echo "❌ Please resolve conflicts and try again"
        exit 1
    fi
else
    echo "❌ CRITICAL ERROR: Could not allocate ports"
    echo "❌ Please check port management system and try again"
    exit 1
fi

echo ""
echo "📊 FINAL CONFIGURATION:"
echo "======================="
echo "Project: ${PROJECT_NAME}"
echo "Production Domain: ${PRODUCTION_DOMAIN} → Port ${PRODUCTION_PORT}"
echo "Staging Domain: ${STAGING_DOMAIN} → Port ${STAGING_PORT}"
echo "Admin Email: ${ADMIN_EMAIL}"
```

### Phase 4: Route53 Domain Configuration 🌐
```bash
# Configure domains in Route53
echo "🔧 Configuring Route53 domains..."

# Verify hosted zone exists
HOSTED_ZONE_ID=$(aws route53 list-hosted-zones-by-name --dns-name "${BASE_DOMAIN}" --query "HostedZones[?Name=='${BASE_DOMAIN}.'].Id" --output text)

if [ -z "$HOSTED_ZONE_ID" ]; then
    echo "❌ CRITICAL ERROR: Route53 hosted zone not found for domain '${BASE_DOMAIN}'"
    echo "❌ Please create a hosted zone for '${BASE_DOMAIN}' first"
    exit 1
fi

# Extract clean hosted zone ID
HOSTED_ZONE_ID=$(echo "$HOSTED_ZONE_ID" | sed 's|/hostedzone/||')
echo "✅ Route53 hosted zone found: ${HOSTED_ZONE_ID}"

# Get EC2 public IP
EC2_IP=$(aws ec2 describe-instances --filters "Name=tag:Name,Values=QuikNation-Apps" --query "Reservations[0].Instances[0].PublicIpAddress" --output text)
echo "✅ EC2 Public IP: ${EC2_IP}"

# Create production domain A record
PRODUCTION_RECORD=$(aws route53 list-resource-record-sets --hosted-zone-id "${HOSTED_ZONE_ID}" --query "ResourceRecordSets[?Name=='${PRODUCTION_DOMAIN}.' && Type=='A'].ResourceRecords[0].Value" --output text)

if [ -z "$PRODUCTION_RECORD" ] || [ "$PRODUCTION_RECORD" == "None" ]; then
    echo "🔧 Creating A record for ${PRODUCTION_DOMAIN}..."
    cat > /tmp/production-dns.json << EOF
{
    "Changes": [{
        "Action": "CREATE",
        "ResourceRecordSet": {
            "Name": "${PRODUCTION_DOMAIN}",
            "Type": "A",
            "TTL": 300,
            "ResourceRecords": [{
                "Value": "${EC2_IP}"
            }]
        }
    }]
}
EOF
    aws route53 change-resource-record-sets --hosted-zone-id "${HOSTED_ZONE_ID}" --change-batch file:///tmp/production-dns.json
    echo "✅ Production domain ${PRODUCTION_DOMAIN} configured"
else
    echo "✅ Production domain ${PRODUCTION_DOMAIN} already exists"
fi

# Create staging domain A record
STAGING_RECORD=$(aws route53 list-resource-record-sets --hosted-zone-id "${HOSTED_ZONE_ID}" --query "ResourceRecordSets[?Name=='${STAGING_DOMAIN}.' && Type=='A'].ResourceRecords[0].Value" --output text)

if [ -z "$STAGING_RECORD" ] || [ "$STAGING_RECORD" == "None" ]; then
    echo "🔧 Creating A record for ${STAGING_DOMAIN}..."
    cat > /tmp/staging-dns.json << EOF
{
    "Changes": [{
        "Action": "CREATE",
        "ResourceRecordSet": {
            "Name": "${STAGING_DOMAIN}",
            "Type": "A",
            "TTL": 300,
            "ResourceRecords": [{
                "Value": "${EC2_IP}"
            }]
        }
    }]
}
EOF
    aws route53 change-resource-record-sets --hosted-zone-id "${HOSTED_ZONE_ID}" --change-batch file:///tmp/staging-dns.json
    echo "✅ Staging domain ${STAGING_DOMAIN} configured"
else
    echo "✅ Staging domain ${STAGING_DOMAIN} already exists"
fi

# Wait for DNS propagation
echo "⏳ Waiting for DNS propagation (30 seconds)..."
sleep 30

# Clean up temp files
rm -f /tmp/production-dns.json /tmp/staging-dns.json
```

### Phase 5: Project Directory Setup 📁
```bash
# Create project directories on EC2
echo "📁 Creating project directories..."

ssh -i ~/.ssh/deploy_key ec2-user@${EC2_IP} << EOF
  # Create project-specific directories
  mkdir -p /home/ec2-user/projects/${PROJECT_BACKEND_NAME}
  mkdir -p /home/ec2-user/projects/${PROJECT_BACKEND_NAME}-staging
  
  # Create project logs directories
  mkdir -p /home/ec2-user/projects/${PROJECT_BACKEND_NAME}/logs
  mkdir -p /home/ec2-user/projects/${PROJECT_BACKEND_NAME}-staging/logs
  
  # Create project PID directories
  mkdir -p /home/ec2-user/projects/${PROJECT_BACKEND_NAME}/pids
  mkdir -p /home/ec2-user/projects/${PROJECT_BACKEND_NAME}-staging/pids
  
  # Create project-specific nginx config directory
  mkdir -p /home/ec2-user/projects/${PROJECT_BACKEND_NAME}/nginx
  
  # Set proper permissions
  chown -R ec2-user:ec2-user /home/ec2-user/projects/${PROJECT_BACKEND_NAME}*
  
  echo "✅ Project directories created"
EOF
```

### Phase 6: Nginx Configuration 🔧
```bash
# Create nginx configurations for the project
echo "🔧 Creating nginx configurations..."

# Create production nginx config
cat > /tmp/production-nginx.conf << EOF
# Nginx configuration for ${PROJECT_NAME} Production API
# Domain: ${PRODUCTION_DOMAIN}
# Port: ${PRODUCTION_PORT}

server {
    listen 80;
    server_name ${PRODUCTION_DOMAIN};
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${PRODUCTION_DOMAIN};
    
    # SSL Configuration (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/${PRODUCTION_DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${PRODUCTION_DOMAIN}/privkey.pem;
    
    # SSL Security Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    
    # Rate Limiting for Production
    limit_req_zone \$binary_remote_addr zone=${PROJECT_NAME}_prod:10m rate=60r/m;
    limit_req zone=${PROJECT_NAME}_prod burst=10 nodelay;
    
    # Logging
    access_log /var/log/nginx/${PRODUCTION_DOMAIN}.access.log;
    error_log /var/log/nginx/${PRODUCTION_DOMAIN}.error.log;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Proxy Configuration
    location / {
        proxy_pass http://localhost:${PRODUCTION_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
        
        # CORS Headers
        add_header Access-Control-Allow-Origin "https://${BASE_DOMAIN}" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type, Accept, X-Requested-With" always;
        add_header Access-Control-Allow-Credentials true always;
        
        # Handle preflight requests
        if (\$request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "https://${BASE_DOMAIN}";
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Authorization, Content-Type, Accept, X-Requested-With";
            add_header Access-Control-Allow-Credentials true;
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type 'text/plain; charset=utf-8';
            add_header Content-Length 0;
            return 204;
        }
    }
    
    # Health Check Endpoint
    location /health {
        proxy_pass http://localhost:${PRODUCTION_PORT}/health;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        access_log off;
    }
    
    # GraphQL Endpoint
    location /graphql {
        proxy_pass http://localhost:${PRODUCTION_PORT}/graphql;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Webhook Endpoints
    location /webhooks {
        proxy_pass http://localhost:${PRODUCTION_PORT}/webhooks;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 30s;
    }
    
    # Security: Block common attack patterns
    location ~* \\.(php|asp|aspx|jsp|cgi)\$ {
        return 444;
    }
    
    location ~* /\\.(ht|git|svn) {
        deny all;
        return 444;
    }
}
EOF

# Create staging nginx config
cat > /tmp/staging-nginx.conf << EOF
# Nginx configuration for ${PROJECT_NAME} Staging API
# Domain: ${STAGING_DOMAIN}
# Port: ${STAGING_PORT}

server {
    listen 80;
    server_name ${STAGING_DOMAIN};
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${STAGING_DOMAIN};
    
    # SSL Configuration (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/${STAGING_DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${STAGING_DOMAIN}/privkey.pem;
    
    # SSL Security Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    
    # Rate Limiting for Staging (more permissive)
    limit_req_zone \$binary_remote_addr zone=${PROJECT_NAME}_staging:10m rate=100r/m;
    limit_req zone=${PROJECT_NAME}_staging burst=20 nodelay;
    
    # Logging
    access_log /var/log/nginx/${STAGING_DOMAIN}.access.log;
    error_log /var/log/nginx/${STAGING_DOMAIN}.error.log;
    
    # Staging Environment Header
    add_header X-Environment "staging" always;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Proxy Configuration
    location / {
        proxy_pass http://localhost:${STAGING_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
        
        # CORS Headers for Staging (more permissive)
        add_header Access-Control-Allow-Origin "https://dev.${BASE_DOMAIN}" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type, Accept, X-Requested-With" always;
        add_header Access-Control-Allow-Credentials true always;
        
        # Handle preflight requests
        if (\$request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "https://dev.${BASE_DOMAIN}";
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Authorization, Content-Type, Accept, X-Requested-With";
            add_header Access-Control-Allow-Credentials true;
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type 'text/plain; charset=utf-8';
            add_header Content-Length 0;
            return 204;
        }
    }
    
    # Health Check Endpoint
    location /health {
        proxy_pass http://localhost:${STAGING_PORT}/health;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        access_log off;
    }
    
    # GraphQL Endpoint
    location /graphql {
        proxy_pass http://localhost:${STAGING_PORT}/graphql;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # GraphQL Playground (staging only)
    location /graphql-playground {
        proxy_pass http://localhost:${STAGING_PORT}/graphql-playground;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Allow broader access for development
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type, Accept, X-Requested-With" always;
    }
    
    # Webhook Endpoints
    location /webhooks {
        proxy_pass http://localhost:${STAGING_PORT}/webhooks;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 30s;
    }
    
    # Testing/Debug Endpoints (staging only)
    location /debug {
        proxy_pass http://localhost:${STAGING_PORT}/debug;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Allow access from anywhere for debugging
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type, Accept, X-Requested-With" always;
    }
    
    # Security: Block common attack patterns
    location ~* \\.(php|asp|aspx|jsp|cgi)\$ {
        return 444;
    }
    
    location ~* /\\.(ht|git|svn) {
        deny all;
        return 444;
    }
}
EOF

# Copy nginx configurations to server
scp -i ~/.ssh/deploy_key /tmp/production-nginx.conf ec2-user@${EC2_IP}:/home/ec2-user/projects/${PROJECT_BACKEND_NAME}/nginx/
scp -i ~/.ssh/deploy_key /tmp/staging-nginx.conf ec2-user@${EC2_IP}:/home/ec2-user/projects/${PROJECT_BACKEND_NAME}/nginx/

# Install nginx configurations
ssh -i ~/.ssh/deploy_key ec2-user@${EC2_IP} << EOF
  # Copy configurations to nginx sites-available
  sudo cp /home/ec2-user/projects/${PROJECT_BACKEND_NAME}/nginx/production-nginx.conf /etc/nginx/sites-available/${PRODUCTION_DOMAIN}.conf
  sudo cp /home/ec2-user/projects/${PROJECT_BACKEND_NAME}/nginx/staging-nginx.conf /etc/nginx/sites-available/${STAGING_DOMAIN}.conf
  
  # Enable sites
  sudo ln -sf /etc/nginx/sites-available/${PRODUCTION_DOMAIN}.conf /etc/nginx/sites-enabled/
  sudo ln -sf /etc/nginx/sites-available/${STAGING_DOMAIN}.conf /etc/nginx/sites-enabled/
  
  # Test nginx configuration
  sudo nginx -t
  
  echo "✅ Nginx configurations installed"
EOF

# Clean up temp files
rm -f /tmp/production-nginx.conf /tmp/staging-nginx.conf
```

### Phase 7: SSL Certificate Setup 🔒
```bash
# Generate SSL certificates with Let's Encrypt
echo "🔒 Setting up SSL certificates..."

ssh -i ~/.ssh/deploy_key ec2-user@${EC2_IP} << EOF
  # Generate SSL certificates for both domains
  sudo certbot --nginx -d ${PRODUCTION_DOMAIN} --non-interactive --agree-tos --email ${ADMIN_EMAIL}
  sudo certbot --nginx -d ${STAGING_DOMAIN} --non-interactive --agree-tos --email ${ADMIN_EMAIL}
  
  # Set up automatic renewal (if not already set)
  sudo crontab -l > /tmp/cron_backup || true
  if ! grep -q "certbot renew" /tmp/cron_backup; then
    echo "0 12 * * * /usr/bin/certbot renew --quiet --no-self-upgrade" | sudo tee -a /tmp/cron_backup
    echo "5 12 * * * /bin/systemctl reload nginx" | sudo tee -a /tmp/cron_backup
    sudo crontab /tmp/cron_backup
  fi
  
  # Test certificate renewal
  sudo certbot renew --dry-run
  
  # Reload nginx with SSL configuration
  sudo systemctl reload nginx
  
  echo "✅ SSL certificates configured"
EOF
```

### Phase 8: QuikNation CLI Configuration 🔧
```bash
# Configure QuikNation CLI for the project
echo "🔧 Configuring QuikNation CLI..."

# Initialize QuikNation project
ssh -i ~/.ssh/deploy_key ec2-user@${EC2_IP} << EOF
  # Initialize QuikNation project
  cd /home/ec2-user/projects/${PROJECT_BACKEND_NAME}
  quiknation init --name ${PROJECT_BACKEND_NAME} --port ${PRODUCTION_PORT}
  
  # Configure staging environment
  cd /home/ec2-user/projects/${PROJECT_BACKEND_NAME}-staging
  quiknation init --name ${PROJECT_BACKEND_NAME}-staging --port ${STAGING_PORT}
  
  echo "✅ QuikNation CLI configured"
EOF
```

### Phase 9: PM2 Ecosystem Configuration ⚙️
```bash
# Create PM2 ecosystem configuration
echo "⚙️ Creating PM2 ecosystem configuration..."

cat > /tmp/ecosystem.config.js << EOF
// PM2 Ecosystem Configuration for ${PROJECT_NAME} Backend
module.exports = {
  apps: [
    {
      name: '${PROJECT_BACKEND_NAME}',
      script: './dist/index.js',
      instances: 1,
      exec_mode: 'cluster',
      max_memory_restart: '512M',
      node_args: '--max-old-space-size=512',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      pid_file: './pids/app.pid',
      env_production: {
        NODE_ENV: 'production',
        PORT: ${PRODUCTION_PORT},
        API_URL: 'https://${PRODUCTION_DOMAIN}',
        FRONTEND_URL: 'https://${BASE_DOMAIN}',
        DATABASE_URL: process.env.DATABASE_URL_PRODUCTION,
        CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY_PRODUCTION,
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY_PRODUCTION,
        SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
        TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
        TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
        AWS_REGION: 'us-east-2',
        AWS_S3_BUCKET: '${PROJECT_NAME}',
        AWS_S3_PREFIX: 'prod',
        REDIS_URL: process.env.REDIS_URL_PRODUCTION,
        JWT_SECRET: process.env.JWT_SECRET_PRODUCTION,
        WEBHOOK_SECRET_STRIPE: process.env.WEBHOOK_SECRET_STRIPE_PRODUCTION,
        WEBHOOK_SECRET_CLERK: process.env.WEBHOOK_SECRET_CLERK_PRODUCTION,
        LOG_LEVEL: 'info',
        ENABLE_GRAPHQL_PLAYGROUND: false,
        ENABLE_CORS_DEBUG: false,
        RATE_LIMIT_REQUESTS: 60,
        RATE_LIMIT_WINDOW: 60000,
        SESSION_SECRET: process.env.SESSION_SECRET_PRODUCTION,
        COOKIE_SECURE: true,
        COOKIE_SAMESITE: 'strict',
        TRUST_PROXY: true
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: ${STAGING_PORT},
        API_URL: 'https://${STAGING_DOMAIN}',
        FRONTEND_URL: 'https://dev.${BASE_DOMAIN}',
        DATABASE_URL: process.env.DATABASE_URL_STAGING,
        CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY_STAGING,
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY_STAGING,
        SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
        TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
        TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
        AWS_REGION: 'us-east-2',
        AWS_S3_BUCKET: '${PROJECT_NAME}',
        AWS_S3_PREFIX: 'dev',
        REDIS_URL: process.env.REDIS_URL_STAGING,
        JWT_SECRET: process.env.JWT_SECRET_STAGING,
        WEBHOOK_SECRET_STRIPE: process.env.WEBHOOK_SECRET_STRIPE_STAGING,
        WEBHOOK_SECRET_CLERK: process.env.WEBHOOK_SECRET_CLERK_STAGING,
        LOG_LEVEL: 'debug',
        ENABLE_GRAPHQL_PLAYGROUND: true,
        ENABLE_CORS_DEBUG: true,
        RATE_LIMIT_REQUESTS: 100,
        RATE_LIMIT_WINDOW: 60000,
        SESSION_SECRET: process.env.SESSION_SECRET_STAGING,
        COOKIE_SECURE: true,
        COOKIE_SAMESITE: 'lax',
        TRUST_PROXY: true
      }
    }
  ],
  
  deploy: {
    production: {
      user: 'ec2-user',
      host: ['${EC2_IP}'],
      ref: 'origin/main',
      repo: 'git@github.com:imaginationeverywhere/${PROJECT_NAME}.git',
      path: '/home/ec2-user/projects/${PROJECT_BACKEND_NAME}',
      'post-deploy': 'npm install --production && npm run build && pm2 reload ecosystem.config.js --env production',
      'post-setup': 'npm install --production && npm run build',
      'pre-deploy-local': 'echo "Deploying to production..."',
      'pre-setup': 'echo "Setting up production environment..."'
    },
    
    staging: {
      user: 'ec2-user',
      host: ['${EC2_IP}'],
      ref: 'origin/develop',
      repo: 'git@github.com:imaginationeverywhere/${PROJECT_NAME}.git',
      path: '/home/ec2-user/projects/${PROJECT_BACKEND_NAME}-staging',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env staging',
      'post-setup': 'npm install && npm run build',
      'pre-deploy-local': 'echo "Deploying to staging..."',
      'pre-setup': 'echo "Setting up staging environment..."'
    }
  }
};
EOF

# Copy ecosystem configuration to server
scp -i ~/.ssh/deploy_key /tmp/ecosystem.config.js ec2-user@${EC2_IP}:/home/ec2-user/projects/${PROJECT_BACKEND_NAME}/
scp -i ~/.ssh/deploy_key /tmp/ecosystem.config.js ec2-user@${EC2_IP}:/home/ec2-user/projects/${PROJECT_BACKEND_NAME}-staging/

# Clean up temp file
rm -f /tmp/ecosystem.config.js
```

### Phase 10: Environment Templates 📝
```bash
# Create environment file templates
echo "📝 Creating environment templates..."

cat > .env.example << EOF
# ${PROJECT_NAME} Backend Environment Configuration
# Copy this file to .env and fill in the actual values

# Node.js Configuration
NODE_ENV=development
PORT=3001

# API Configuration
API_URL=https://${PRODUCTION_DOMAIN}
FRONTEND_URL=https://${BASE_DOMAIN}

# Database Configuration
DATABASE_URL_STAGING=postgresql://username:password@host:5432/${PROJECT_NAME}_staging
DATABASE_URL_PRODUCTION=postgresql://username:password@host:5432/${PROJECT_NAME}_production

# Authentication Services
CLERK_SECRET_KEY_STAGING=your_clerk_secret_key_staging
CLERK_SECRET_KEY_PRODUCTION=your_clerk_secret_key_production
JWT_SECRET_STAGING=your_jwt_secret_staging
JWT_SECRET_PRODUCTION=your_jwt_secret_production

# Payment Processing
STRIPE_SECRET_KEY_STAGING=your_stripe_secret_key_staging
STRIPE_SECRET_KEY_PRODUCTION=your_stripe_secret_key_production
WEBHOOK_SECRET_STRIPE_STAGING=your_stripe_webhook_secret_staging
WEBHOOK_SECRET_STRIPE_PRODUCTION=your_stripe_webhook_secret_production

# Email Services
SENDGRID_API_KEY=your_sendgrid_api_key

# SMS Services
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token

# AWS Services
AWS_REGION=us-east-2
AWS_S3_BUCKET=${PROJECT_NAME}
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# Redis Cache
REDIS_URL_STAGING=redis://localhost:6379
REDIS_URL_PRODUCTION=redis://localhost:6379

# Security
SESSION_SECRET_STAGING=your_session_secret_staging
SESSION_SECRET_PRODUCTION=your_session_secret_production
WEBHOOK_SECRET_CLERK_STAGING=your_clerk_webhook_secret_staging
WEBHOOK_SECRET_CLERK_PRODUCTION=your_clerk_webhook_secret_production

# Performance
RATE_LIMIT_REQUESTS=60
RATE_LIMIT_WINDOW=60000

# Application Settings
LOG_LEVEL=info
ENABLE_GRAPHQL_PLAYGROUND=false
ENABLE_CORS_DEBUG=false
COOKIE_SECURE=true
COOKIE_SAMESITE=strict
TRUST_PROXY=true

# Deployment Configuration
PRODUCTION_DOMAIN=${PRODUCTION_DOMAIN}
STAGING_DOMAIN=${STAGING_DOMAIN}
PRODUCTION_PORT=${PRODUCTION_PORT}
STAGING_PORT=${STAGING_PORT}
EOF

echo "✅ Environment template created"
```

### Phase 11: Package.json Enhancement 📦
```bash
# Add deployment scripts to package.json
echo "📦 Enhancing package.json with deployment scripts..."

# Check if package.json exists
if [ ! -f package.json ]; then
    echo "⚠️ package.json not found - creating basic structure"
    cat > package.json << EOF
{
  "name": "${PROJECT_BACKEND_NAME}",
  "version": "1.0.0",
  "description": "${PROJECT_NAME} Backend API",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsx watch src/index.ts",
    "test": "jest"
  },
  "dependencies": {},
  "devDependencies": {}
}
EOF
fi

# Add deployment scripts using Node.js
node -e "
const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Add deployment scripts
packageJson.scripts = {
  ...packageJson.scripts,
  'deploy:staging': 'echo \"Deploying to staging...\" && quiknation deploy --environment staging',
  'deploy:production': 'echo \"Deploying to production...\" && quiknation deploy --environment production',
  'deploy:status': 'quiknation status',
  'deploy:logs': 'quiknation logs',
  'deploy:restart': 'quiknation restart',
  'deploy:stop': 'quiknation stop',
  'deploy:health': 'curl -f https://${PRODUCTION_DOMAIN}/health && curl -f https://${STAGING_DOMAIN}/health',
  'setup:github': 'echo \"Run setup-github-deployment command in Claude Code\"',
  'setup:verify': 'echo \"Run verify-deployment-setup command in Claude Code\"'
};

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('✅ Package.json enhanced with deployment scripts');
"
```

### Phase 12: GitHub Actions Workflow 🔄
```bash
# Create GitHub Actions workflow
echo "🔄 Creating GitHub Actions workflow..."

mkdir -p .github/workflows

cat > .github/workflows/deploy-backend.yml << EOF
name: Deploy Backend API

on:
  push:
    branches: [ develop, main ]
    paths:
      - 'backend/**'
      - '.github/workflows/deploy-backend.yml'
  pull_request:
    branches: [ develop, main ]
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        environment: \${{ github.ref == 'refs/heads/main' && fromJSON('["production"]') || fromJSON('["staging"]') }}
    
    environment: \${{ matrix.environment }}
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: 'backend/package-lock.json'
    
    - name: Install dependencies
      run: |
        cd backend
        npm ci
    
    - name: Build application
      run: |
        cd backend
        npm run build
    
    - name: Run tests
      run: |
        cd backend
        npm test
    
    - name: Configure SSH
      run: |
        mkdir -p ~/.ssh
        echo "\${{ secrets.QUIKNATION_APPS_SSH_KEY }}" > ~/.ssh/id_rsa
        chmod 600 ~/.ssh/id_rsa
        ssh-keyscan -H ${EC2_IP} >> ~/.ssh/known_hosts
    
    - name: Deploy to \${{ matrix.environment }}
      run: |
        cd backend
        
        # Set environment variables
        export NODE_ENV=\${{ matrix.environment }}
        export PORT=\${{ matrix.environment == 'production' && '${PRODUCTION_PORT}' || '${STAGING_PORT}' }}
        export API_URL=\${{ matrix.environment == 'production' && 'https://${PRODUCTION_DOMAIN}' || 'https://${STAGING_DOMAIN}' }}
        export DATABASE_URL=\${{ matrix.environment == 'production' && secrets.DATABASE_URL_PRODUCTION || secrets.DATABASE_URL_STAGING }}
        
        # Deploy using QuikNation CLI
        ssh -i ~/.ssh/id_rsa ec2-user@${EC2_IP} << 'DEPLOY_EOF'
          cd /home/ec2-user/projects/${PROJECT_BACKEND_NAME}\${{ matrix.environment == 'staging' && '-staging' || '' }}
          
          # Pull latest code
          git pull origin \${{ matrix.environment == 'production' && 'main' || 'develop' }}
          
          # Install dependencies
          npm ci \${{ matrix.environment == 'production' && '--production' || '' }}
          
          # Build application
          npm run build
          
          # Restart PM2 process
          pm2 reload ecosystem.config.js --env \${{ matrix.environment }}
          
          # Health check
          sleep 10
          curl -f \${{ matrix.environment == 'production' && 'https://${PRODUCTION_DOMAIN}/health' || 'https://${STAGING_DOMAIN}/health' }}
        DEPLOY_EOF
    
    - name: Verify deployment
      run: |
        # Wait for deployment to stabilize
        sleep 30
        
        # Check health endpoints
        curl -f \${{ matrix.environment == 'production' && 'https://${PRODUCTION_DOMAIN}/health' || 'https://${STAGING_DOMAIN}/health' }}
        
        # Check SSL certificate
        echo | openssl s_client -connect \${{ matrix.environment == 'production' && '${PRODUCTION_DOMAIN}:443' || '${STAGING_DOMAIN}:443' }} -servername \${{ matrix.environment == 'production' && '${PRODUCTION_DOMAIN}' || '${STAGING_DOMAIN}' }} | grep -q "Verify return code: 0"
    
    - name: Notify on failure
      if: failure()
      run: |
        echo "Deployment failed for \${{ matrix.environment }} environment"
        echo "Check logs: ssh -i ~/.ssh/id_rsa ec2-user@${EC2_IP} 'pm2 logs ${PROJECT_BACKEND_NAME}\${{ matrix.environment == 'staging' && '-staging' || '' }}'"
EOF

echo "✅ GitHub Actions workflow created"
```

### Phase 13: Final Verification and Setup Summary 🎯
```bash
# Final verification of all components
echo "🎯 Performing final verification..."

# Test domain resolution
echo "Testing domain resolution..."
dig +short ${PRODUCTION_DOMAIN} | grep -q "${EC2_IP}" && echo "✅ Production domain resolves" || echo "⚠️ Production domain not fully propagated"
dig +short ${STAGING_DOMAIN} | grep -q "${EC2_IP}" && echo "✅ Staging domain resolves" || echo "⚠️ Staging domain not fully propagated"

# Test nginx configuration
ssh -i ~/.ssh/deploy_key ec2-user@${EC2_IP} << 'EOF'
  echo "Testing nginx configuration..."
  sudo nginx -t && echo "✅ Nginx configuration valid" || echo "❌ Nginx configuration invalid"
  
  echo "Checking SSL certificates..."
  sudo certbot certificates | grep -q "${PRODUCTION_DOMAIN}" && echo "✅ Production SSL certificate installed" || echo "⚠️ Production SSL certificate missing"
  sudo certbot certificates | grep -q "${STAGING_DOMAIN}" && echo "✅ Staging SSL certificate installed" || echo "⚠️ Staging SSL certificate missing"
  
  echo "Verifying project directories..."
  [ -d "/home/ec2-user/projects/${PROJECT_BACKEND_NAME}" ] && echo "✅ Production project directory created" || echo "❌ Production project directory missing"
  [ -d "/home/ec2-user/projects/${PROJECT_BACKEND_NAME}-staging" ] && echo "✅ Staging project directory created" || echo "❌ Staging project directory missing"
EOF

echo ""
echo "🎉 PROJECT API DEPLOYMENT SETUP COMPLETE!"
echo "================================================="
echo ""
echo "✅ **CONFIGURED:**"
echo "   • Route53 domains: ${PRODUCTION_DOMAIN}, ${STAGING_DOMAIN}"
echo "   • SSL certificates with Let's Encrypt"
echo "   • Nginx reverse proxy configurations"
echo "   • PM2 ecosystem configuration"
echo "   • QuikNation CLI integration"
echo "   • GitHub Actions workflow"
echo "   • Environment templates"
echo "   • Deployment scripts"
echo ""
echo "🎯 **NEXT STEPS:**"
echo "1. **Configure GitHub Repository Secrets:**"
echo "   • DATABASE_URL_STAGING"
echo "   • DATABASE_URL_PRODUCTION"
echo "   • CLERK_SECRET_KEY_STAGING"
echo "   • CLERK_SECRET_KEY_PRODUCTION"
echo "   • STRIPE_SECRET_KEY_STAGING"
echo "   • STRIPE_SECRET_KEY_PRODUCTION"
echo "   • Other environment-specific secrets"
echo ""
echo "2. **Set up databases in NEON:**"
echo "   • Create staging database: ${PROJECT_NAME}_staging"
echo "   • Create production database: ${PROJECT_NAME}_production"
echo ""
echo "3. **Deploy your application:**"
echo "   • Push to 'develop' branch → deploys to staging"
echo "   • Push to 'main' branch → deploys to production"
echo ""
echo "4. **Test your API endpoints:**"
echo "   • Staging: https://${STAGING_DOMAIN}/health"
echo "   • Production: https://${PRODUCTION_DOMAIN}/health"
echo ""
echo "📊 **MONITORING:**"
echo "   • Health checks: npm run deploy:health"
echo "   • Status: npm run deploy:status"
echo "   • Logs: npm run deploy:logs"
echo ""
echo "🔗 **DOMAINS CONFIGURED:**"
echo "   • Production: https://${PRODUCTION_DOMAIN}"
echo "   • Staging: https://${STAGING_DOMAIN}"
echo ""
```

## Generated Project Structure

After running this command, your backend workspace will have:

```
backend/
├── package.json                     # Enhanced with deployment scripts
├── .env.example                     # Complete environment template
├── .github/
│   └── workflows/
│       └── deploy-backend.yml       # GitHub Actions deployment workflow
├── src/
│   └── index.ts                     # Your application entry point
├── dist/                            # Built TypeScript output
├── logs/                            # Application logs
├── pids/                            # PM2 process IDs
└── README.md                        # Project documentation
```

## Integration Features

### Route53 & DNS Management
- **Automatic Domain Creation**: Creates A records for both staging and production
- **DNS Propagation Verification**: Waits for and verifies DNS propagation
- **Hosted Zone Detection**: Automatically finds and uses existing hosted zones

### SSL Certificate Management
- **Let's Encrypt Integration**: Automatic SSL certificate generation
- **Dual Environment Support**: Separate certificates for staging and production
- **Automatic Renewal**: Configures automatic certificate renewal

### Nginx Reverse Proxy
- **Environment-Specific Configuration**: Different settings for staging vs production
- **Security Headers**: HSTS, CSP, XSS protection, and more
- **Rate Limiting**: Production-appropriate rate limits
- **CORS Configuration**: Proper CORS headers for frontend integration

### PM2 Process Management
- **Environment Isolation**: Separate PM2 processes for staging and production
- **Log Management**: Structured logging with rotation
- **Memory Management**: Automatic restart on memory limits
- **Health Monitoring**: Built-in health checks

### GitHub Integration
- **Automated Workflows**: Deploy on push to develop/main branches
- **Environment Variables**: Proper secret management
- **Health Verification**: Post-deployment health checks
- **SSL Verification**: Certificate validation

### QuikNation CLI Integration
- **Project Initialization**: Automatic project setup
- **Port Management**: Automated port allocation
- **Deployment Commands**: Simplified deployment scripts

## Security Features

- **SSL/TLS Encryption**: All traffic encrypted with Let's Encrypt certificates
- **Security Headers**: Comprehensive security header configuration
- **Rate Limiting**: DDoS protection with configurable limits
- **Environment Isolation**: Separate configurations for staging and production
- **Secret Management**: GitHub secrets for sensitive data
- **Access Control**: SSH key-based authentication only

## Monitoring & Logging

- **Health Endpoints**: Automated health check endpoints
- **Application Logs**: Structured logging with PM2
- **Nginx Logs**: Access and error logs for each domain
- **SSL Monitoring**: Certificate expiration monitoring
- **Deployment Verification**: Automated post-deployment checks

## Next Steps After Setup

1. **Configure GitHub Secrets**: Add all required repository secrets
2. **Set up NEON Databases**: Create staging and production databases
3. **Deploy Application**: Push to develop/main branches
4. **Verify Domains**: Check SSL certificates and domain resolution
5. **Monitor Health**: Use deployment scripts to monitor application health

This command provides a complete, production-ready API deployment setup with professional domains, SSL certificates, and automated deployment pipelines.