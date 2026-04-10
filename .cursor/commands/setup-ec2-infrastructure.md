# Setup EC2 Infrastructure Command

## Overview
This Claude Code custom command performs the complete one-time setup of the **modern EC2 instance** for hosting multiple backend API projects with Node.js 20 LTS support. It prepares the server infrastructure including Node.js, nginx, PM2, security hardening, and monitoring - but does NOT configure specific project domains or applications.

**🆕 Targets Modern Instance**:
- **Instance ID**: i-015d05a70580df314
- **Public IP**: 3.89.29.97
- **Region**: us-east-1
- **Node.js**: v20.19.3 LTS (supports Clerk 2.4.1+ and modern dependencies)

**Run this command ONCE per EC2 instance**, then use `setup-project-api-deployment` for each individual project.

## Prerequisites

⚠️ **REQUIRED**:
1. **AWS CLI configured** with SSM Parameter Store access
2. **SSH keys available** in AWS SSM Parameter Store:
   - `/quiknation-cli/ssh-keys/quiknation-modern-backend` (for new modern instance)
   - `/quiknation-cli/ssh-keys/quiknation-apps` (legacy)
   - `/quiknation-cli/ssh-keys/quikinfluence-server` (legacy)
3. **EC2 instance running** and accessible
4. **Repository admin permissions** for initial setup

## Command Usage

**In Claude Code:**
```bash
"Set up the EC2 infrastructure for hosting backend APIs"
"Configure the QuikNation-Apps server infrastructure"
"Initialize EC2 server for multiple project deployments"
"Prepare the backend server infrastructure"
```

## What This Command Does

This command performs a comprehensive 9-phase infrastructure setup:

### Phase 1: Prerequisites Validation ✅
```bash
# Verify AWS CLI and credentials
aws --version
aws sts get-caller-identity

# Test SSH connectivity to EC2 instance
ssh -i ~/.ssh/deploy_key ec2-user@[EC2_HOST_IP] "echo 'SSH connection successful'"

# CRITICAL: Check if EC2 infrastructure is already set up
echo "🔍 Checking if EC2 infrastructure is already configured..."

# Check for infrastructure markers on EC2 instance
INFRASTRUCTURE_STATUS=$(ssh -i ~/.ssh/deploy_key ec2-user@[EC2_HOST_IP] "
  # Check for key infrastructure components
  if [ -f /home/ec2-user/infrastructure-health-check.sh ] && \
     [ -d /home/ec2-user/apps/shared ] && \
     systemctl is-active nginx >/dev/null 2>&1 && \
     command -v pm2 >/dev/null 2>&1 && \
     command -v quiknation >/dev/null 2>&1; then
    echo 'CONFIGURED'
  else
    echo 'NOT_CONFIGURED'
  fi
")

if [ "$INFRASTRUCTURE_STATUS" = "CONFIGURED" ]; then
    echo "✅ EC2 infrastructure is already set up!"
    echo ""
    echo "🎯 NEXT STEPS:"
    echo "This EC2 instance already has the infrastructure configured."
    echo "To deploy a new project, use:"
    echo ""
    echo "  setup-project-api-deployment"
    echo ""
    echo "📊 INFRASTRUCTURE STATUS:"
    ssh -i ~/.ssh/deploy_key ec2-user@[EC2_HOST_IP] "
      echo 'Nginx: '$(systemctl is-active nginx)
      echo 'PM2: '$(pm2 --version)
      echo 'QuikNation CLI: '$(quiknation --version)
      echo 'Shared directories: '$(ls -la /home/ec2-user/apps/shared | wc -l)' items'
      echo 'Active projects: '$(ls -la /home/ec2-user/projects 2>/dev/null | wc -l)' directories'
    "
    echo ""
    echo "🔍 To check infrastructure health:"
    echo "ssh -i ~/.ssh/deploy_key ec2-user@[EC2_HOST_IP] './infrastructure-health-check.sh'"
    echo ""
    echo "❌ SETUP HALTED - Infrastructure already configured"
    exit 0
fi

echo "✅ EC2 infrastructure not yet configured - proceeding with setup..."

# Verify QuikNation CLI availability
quiknation --version || echo "QuikNation CLI will be installed"
```

### Phase 2: Server Environment Setup 🖥️
```bash
# Connect to EC2 and update system
ssh -i ~/.ssh/deploy_key ec2-user@[EC2_HOST_IP] << 'EOF'
  # Update system
  sudo yum update -y
  sudo yum groupinstall -y "Development Tools"
  
  # Install Node.js 18.x
  curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
  sudo yum install -y nodejs
  
  # Install PM2 globally
  sudo npm install -g pm2
  
  # Install and configure nginx
  sudo yum install -y nginx
  sudo systemctl enable nginx
  
  # Install certbot for SSL certificates
  sudo yum install -y certbot python3-certbot-nginx
  
  # Install UFW firewall
  sudo yum install -y ufw
  
  # Install additional tools
  sudo yum install -y git htop curl wget unzip jq
  
  # Install fail2ban for security
  sudo yum install -y fail2ban
EOF
```

### Phase 3: Base Directory Structure 📁
```bash
# Create shared infrastructure directories
ssh -i ~/.ssh/deploy_key ec2-user@[EC2_HOST_IP] << 'EOF'
  # Create shared directories for multiple projects
  sudo mkdir -p /home/ec2-user/apps/shared/nginx
  sudo mkdir -p /home/ec2-user/apps/shared/logs
  sudo mkdir -p /home/ec2-user/apps/shared/ssl
  sudo mkdir -p /home/ec2-user/apps/shared/scripts
  
  # Create backup directories
  sudo mkdir -p /home/ec2-user/backups/nginx
  sudo mkdir -p /home/ec2-user/backups/ssl
  
  # Create projects directory
  sudo mkdir -p /home/ec2-user/projects
  
  # Set proper permissions
  sudo chown -R ec2-user:ec2-user /home/ec2-user/apps/
  sudo chown -R ec2-user:ec2-user /home/ec2-user/backups/
  sudo chown -R ec2-user:ec2-user /home/ec2-user/projects/
EOF
```

### Phase 4: Base Nginx Configuration 🌐
```bash
# Configure nginx for multiple projects
ssh -i ~/.ssh/deploy_key ec2-user@[EC2_HOST_IP] << 'EOF'
  # Backup original nginx configuration
  sudo cp /etc/nginx/nginx.conf /home/ec2-user/backups/nginx/nginx.conf.backup
  
  # Create sites-available and sites-enabled directories
  sudo mkdir -p /etc/nginx/sites-available
  sudo mkdir -p /etc/nginx/sites-enabled
  
  # Update main nginx.conf to include sites-enabled
  if ! grep -q "include /etc/nginx/sites-enabled/\*;" /etc/nginx/nginx.conf; then
    sudo sed -i '/http {/a\    include /etc/nginx/sites-enabled/*;' /etc/nginx/nginx.conf
  fi
  
  # Create default nginx configuration for health checks
  sudo tee /etc/nginx/sites-available/default << 'NGINX_EOF'
server {
    listen 80 default_server;
    server_name _;
    
    location /health {
        access_log off;
        return 200 "EC2 Infrastructure Ready\n";
        add_header Content-Type text/plain;
    }
    
    location / {
        return 444;
    }
}
NGINX_EOF
  
  # Enable default configuration
  sudo ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/
  
  # Test and start nginx
  sudo nginx -t
  sudo systemctl start nginx
  sudo systemctl enable nginx
EOF
```

### Phase 5: Security Hardening 🛡️
```bash
# Configure comprehensive security
ssh -i ~/.ssh/deploy_key ec2-user@[EC2_HOST_IP] << 'EOF'
  # Configure UFW firewall
  sudo ufw default deny incoming
  sudo ufw default allow outgoing
  
  # Allow SSH (port 22)
  sudo ufw allow ssh
  
  # Allow HTTP and HTTPS
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  
  # Allow port range for multiple projects (3000-3999)
  sudo ufw allow 3000:3999/tcp
  
  # Enable firewall
  sudo ufw --force enable
  
  # Configure fail2ban for SSH protection
  sudo tee /etc/fail2ban/jail.local << 'FAIL2BAN_EOF'
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/secure
maxretry = 5
bantime = 3600
findtime = 600
FAIL2BAN_EOF
  
  # Start fail2ban
  sudo systemctl enable fail2ban
  sudo systemctl start fail2ban
  
  # Secure SSH configuration
  sudo sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
  sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
  sudo systemctl reload sshd
EOF
```

### Phase 6: PM2 Infrastructure Setup ⚙️
```bash
# Set up PM2 for process management
ssh -i ~/.ssh/deploy_key ec2-user@[EC2_HOST_IP] << 'EOF'
  # Configure PM2 startup script
  pm2 startup systemd -u ec2-user --hp /home/ec2-user
  
  # Configure PM2 log rotation
  pm2 install pm2-logrotate
  pm2 set pm2-logrotate:max_size 10M
  pm2 set pm2-logrotate:retain 30
  pm2 set pm2-logrotate:compress true
  
  # Save PM2 configuration
  pm2 save
EOF
```

### Phase 7: Monitoring and Logging 📊
```bash
# Set up infrastructure monitoring
ssh -i ~/.ssh/deploy_key ec2-user@[EC2_HOST_IP] << 'EOF'
  # Configure log rotation for shared logs
  sudo tee /etc/logrotate.d/quiknation-infrastructure << 'LOGROTATE_EOF'
/home/ec2-user/apps/shared/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 ec2-user ec2-user
}
LOGROTATE_EOF
  
  # Create infrastructure health check script
  tee /home/ec2-user/infrastructure-health-check.sh << 'HEALTH_EOF'
#!/bin/bash
echo "=== QuikNation EC2 Infrastructure Health Check ==="
echo "Date: $(date)"
echo "Uptime: $(uptime)"
echo "Memory: $(free -h | grep Mem)"
echo "Disk: $(df -h / | tail -1)"
echo "CPU: $(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\\([0-9.]*\\)%* id.*/\\1/" | awk '{print 100 - $1"%"}')"
echo ""
echo "=== System Services Status ==="
systemctl is-active nginx && echo "✅ Nginx running" || echo "❌ Nginx not running"
systemctl is-active fail2ban && echo "✅ Fail2ban running" || echo "❌ Fail2ban not running"
echo ""
echo "=== PM2 Status ==="
pm2 list
echo ""
echo "=== Network Ports ==="
netstat -tlnp | grep -E ":(80|443|3[0-9]{3})" | head -20
echo ""
echo "=== Recent Nginx Logs ==="
sudo tail -5 /var/log/nginx/error.log
echo ""
echo "=== Disk Usage by Project ==="
du -sh /home/ec2-user/projects/* 2>/dev/null || echo "No projects deployed yet"
HEALTH_EOF
  
  chmod +x /home/ec2-user/infrastructure-health-check.sh
  
  # Set up cron job for infrastructure health checks
  crontab -l > /tmp/cron_backup || true
  echo "0 */6 * * * /home/ec2-user/infrastructure-health-check.sh >> /home/ec2-user/infrastructure-health.log 2>&1" >> /tmp/cron_backup
  crontab /tmp/cron_backup
EOF
```

### Phase 8: QuikNation CLI Installation 🔧
```bash
# Install QuikNation CLI globally
ssh -i ~/.ssh/deploy_key ec2-user@[EC2_HOST_IP] << 'EOF'
  # Install QuikNation CLI globally
  if ! command -v quiknation &> /dev/null; then
    echo "Installing QuikNation CLI..."
    sudo npm install -g git+ssh://git@github.com/imaginationeverywhere/quiknation-cli.git
    echo "✅ QuikNation CLI installed"
  else
    echo "✅ QuikNation CLI already installed"
  fi
  
  # Verify installation
  quiknation --version
EOF
```

### Phase 9: Final Verification ✅
```bash
# Comprehensive verification of infrastructure setup
ssh -i ~/.ssh/deploy_key ec2-user@[EC2_HOST_IP] << 'EOF'
  echo "=== EC2 INFRASTRUCTURE VERIFICATION ==="
  
  # Test nginx configuration
  echo "Testing nginx configuration..."
  sudo nginx -t && echo "✅ Nginx configuration valid" || echo "❌ Nginx configuration invalid"
  
  # Check system services
  echo "Checking system services..."
  systemctl is-active nginx && echo "✅ Nginx running" || echo "❌ Nginx not running"
  systemctl is-active fail2ban && echo "✅ Fail2ban running" || echo "❌ Fail2ban not running"
  
  # Test firewall configuration
  echo "Testing firewall configuration..."
  sudo ufw status | grep -q "Status: active" && echo "✅ Firewall configured" || echo "❌ Firewall not configured"
  
  # Check PM2 installation
  echo "Checking PM2 installation..."
  pm2 --version && echo "✅ PM2 installed" || echo "❌ PM2 installation failed"
  
  # Check QuikNation CLI
  echo "Checking QuikNation CLI..."
  quiknation --version && echo "✅ QuikNation CLI installed" || echo "❌ QuikNation CLI not installed"
  
  # Verify directory structure
  echo "Verifying directory structure..."
  ls -la /home/ec2-user/apps/shared/ && echo "✅ Shared directories created" || echo "❌ Directory structure incomplete"
  
  # Test health endpoint
  echo "Testing health endpoint..."
  curl -s http://localhost/health | grep -q "Infrastructure Ready" && echo "✅ Health endpoint working" || echo "❌ Health endpoint not working"
  
  echo ""
  echo "=== INFRASTRUCTURE SETUP COMPLETE ==="
  echo ""
  echo "✅ EC2 Infrastructure is ready for project deployments"
  echo "✅ Use 'setup-project-api-deployment' for each new project"
  echo "✅ Health check available at: http://[EC2_HOST_IP]/health"
  echo "✅ Infrastructure monitoring: /home/ec2-user/infrastructure-health-check.sh"
  echo ""
EOF
```

## Infrastructure Components Configured

### System Software
- **Node.js 18.x**: JavaScript runtime for backend applications
- **PM2**: Process manager for production Node.js applications
- **Nginx**: Web server and reverse proxy for multiple projects
- **Git**: Version control for deployments
- **Development Tools**: Compilers and build tools

### Security
- **UFW Firewall**: Configured with minimal required ports
- **Fail2ban**: Intrusion detection and prevention
- **SSH Hardening**: Key-based authentication only
- **SSL/TLS Ready**: Certbot installed for Let's Encrypt certificates

### Monitoring
- **Health Checks**: Automated infrastructure health monitoring
- **Log Rotation**: Automatic log management and cleanup
- **System Monitoring**: CPU, memory, disk usage tracking
- **Process Monitoring**: PM2 process management and monitoring

### Project Support
- **Multi-Project Structure**: Organized directories for multiple projects
- **Port Management**: Firewall configured for project port range (3000-3999)
- **Shared Resources**: Common nginx, SSL, and logging infrastructure
- **QuikNation CLI**: Installed globally for project deployments

## Expected Outcomes

After successful completion, you will have:

✅ **Production-Ready EC2 Infrastructure** supporting multiple backend projects  
✅ **Nginx Web Server** configured for reverse proxy and SSL termination  
✅ **Security Hardening** with firewall and intrusion detection  
✅ **PM2 Process Management** ready for application deployments  
✅ **Monitoring System** with health checks and log rotation  
✅ **QuikNation CLI** installed and ready for project deployments  
✅ **Shared Directory Structure** organized for multiple projects  

## Next Steps

1. **Per-Project Setup**: Run `setup-project-api-deployment` for each new project
2. **Health Monitoring**: Check `/home/ec2-user/infrastructure-health.log` regularly
3. **Security Updates**: Monitor system updates and security patches
4. **Capacity Planning**: Monitor resource usage as projects are added

## Troubleshooting

### Common Issues

**SSH Connection Failed**
```bash
# Check SSH key access
ssh -i ~/.ssh/deploy_key ec2-user@[EC2_HOST_IP] "echo 'test'"

# Verify key permissions
chmod 600 ~/.ssh/deploy_key

# Check security group allows SSH from your IP
```

**Nginx Configuration Errors**
```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -20 /var/log/nginx/error.log

# Restart nginx
sudo systemctl restart nginx
```

**PM2 Issues**
```bash
# Check PM2 status
pm2 status

# Restart PM2 daemon
pm2 kill && pm2 resurrect

# Check startup configuration
pm2 startup
```

**Firewall Blocking Connections**
```bash
# Check firewall rules
sudo ufw status numbered

# Allow specific port if needed
sudo ufw allow 3001/tcp

# Reset firewall if needed
sudo ufw --force reset
```

## Security Notes

- **SSH Keys**: Never commit SSH keys to repository
- **Firewall Rules**: Only necessary ports are opened
- **System Updates**: Regular security updates recommended
- **Access Control**: Only authorized users should have SSH access
- **Monitoring**: Regular health checks and log monitoring

This infrastructure setup provides a robust, secure foundation for hosting multiple backend API projects on a single EC2 instance.