# Setup Domain Management Command

## Overview
This Claude Code custom command provides dedicated domain management for QuikNation projects, enabling professional custom domains with SSL certificates, Route53 DNS management, and automatic nginx reverse proxy configuration. This command is designed to work seamlessly with existing QuikNation deployments and the PRD-driven development workflow.

## Prerequisites

⚠️ **REQUIRED BEFORE RUNNING**: 
1. **QuikNation CLI Setup**: Must have completed `setup-quiknation-deployment` first
2. **AWS Route53 Access**: AWS CLI configured with Route53 permissions
3. **Hosted Zone**: At least one hosted zone configured in Route53
4. **Active Deployment**: Project must be deployed to an EC2 instance
5. A `docs/PRD.md` file must exist with domain requirements
6. Must be run from the `backend/` workspace directory

⚠️ **AWS PERMISSIONS REQUIRED**:
- `route53:ListHostedZones`
- `route53:ChangeResourceRecordSets`
- `route53:GetChange`
- `acm:RequestCertificate`
- `acm:DescribeCertificate`
- `acm:ListCertificates`

## Current Status
📌 **Domain Management**: ✅ **NEW** - Professional domain setup with SSL automation
📌 **Route53 Integration**: ✅ **AVAILABLE** - DNS management and record creation
📌 **SSL Automation**: ✅ **WORKING** - Let's Encrypt certificate generation and renewal
📌 **Nginx Configuration**: ✅ **AUTOMATED** - Reverse proxy with SSL termination
📌 **Multi-Domain Support**: ✅ **ENABLED** - Multiple projects on same EC2 instance

## Command Usage

When you invoke this command, Claude will:

### 1. **Environment Validation**
   - Verify we're in a backend workspace with existing QuikNation configuration
   - Check for `.quiknation/` directory and deployment configuration
   - Validate AWS CLI access to Route53
   - Confirm EC2 instance accessibility
   - Extract domain requirements from PRD.md

### 2. **Domain Requirements Analysis**
   Extract domain preferences from PRD.md:
   - **Project Branding**: Custom domain requirements for professional presentation
   - **SSL/TLS Requirements**: Security compliance needs
   - **Environment Separation**: Staging vs production domain patterns
   - **Multi-tenancy**: Support for multiple project domains

### 3. **Route53 Hosted Zone Management**
   Interactive hosted zone selection:
   ```
   Available hosted zones in your AWS account:
   1. yourcompany.com (Z1234567890ABC)
   2. yourclient.com (Z9876543210DEF)
   3. yourproject.io (Z5555555555GHI)
   
   Select hosted zone for this project: 
   ```

### 4. **Domain Pattern Configuration**
   Configure professional domain patterns:
   - **Production Domain**: `https://api.{basedomain}.com`
   - **Staging Domain**: `https://api-dev.{basedomain}.com`
   - **Custom Patterns**: Support for subdomain variations
   - **Wildcard Support**: Configure wildcard SSL certificates

### 5. **DNS Record Creation**
   Automated DNS management:
   - **A Records**: Point domains to EC2 public IP
   - **CNAME Records**: Alias configuration if needed
   - **TTL Management**: Optimize DNS propagation timing
   - **Health Checks**: DNS-based health monitoring

### 6. **SSL Certificate Management**
   Comprehensive SSL/TLS setup:
   ```bash
   # Let's Encrypt certificate generation
   quiknation domain setup --instance {instance-name}
   
   # Certificate validation and installation
   quiknation domain create --project {project-name} --domain {base-domain}
   
   # Automatic renewal configuration
   quiknation domain verify --project {project-name}
   ```

### 7. **Nginx Reverse Proxy Configuration**
   Automated nginx setup:
   - **SSL Termination**: Handle HTTPS traffic and certificate presentation
   - **Reverse Proxy**: Route traffic to backend application port
   - **Security Headers**: HSTS, CSP, and other security configurations
   - **Rate Limiting**: Basic DDoS protection
   - **Gzip Compression**: Performance optimization

### 8. **Domain Configuration Storage**
   Local configuration management:
   ```json
   {
     "projectName": "your-project-backend",
     "baseDomain": "yourproject.com",
     "productionDomain": "api.yourproject.com",
     "stagingDomain": "api-dev.yourproject.com",
     "hostedZoneId": "Z1234567890ABC",
     "certificateArn": "arn:aws:acm:us-east-1:123456789012:certificate/...",
     "sslProvider": "letsencrypt",
     "nginxConfigured": true
   }
   ```

### 9. **EC2 Instance Integration**
   Deploy nginx configuration to EC2:
   - **Config Upload**: Transfer nginx site configuration
   - **SSL Certificate Installation**: Deploy Let's Encrypt certificates
   - **Nginx Reload**: Apply configuration changes
   - **Health Verification**: Confirm HTTPS endpoints are responding

### 10. **GitHub Actions Integration**
   Update deployment workflows:
   - **Domain Environment Variables**: Add staging and production domains
   - **SSL Certificate Monitoring**: Check certificate expiration
   - **Health Checks**: Verify HTTPS endpoints during deployment
   - **Domain Validation**: Confirm DNS resolution

## Domain Configuration Options

### Standard Domain Patterns
```
Production:  https://api.yourproject.com
Staging:     https://api-dev.yourproject.com
Admin:       https://admin.yourproject.com (optional)
Webhooks:    https://hooks.yourproject.com (optional)
```

### Custom Domain Patterns
```
Multi-tenant: https://client1.yourproject.com
Geographic:   https://api-us.yourproject.com
Versioned:    https://v2.api.yourproject.com
Environment:  https://api.staging.yourproject.com
```

### SSL Certificate Types
- **Let's Encrypt**: Free, automated certificates (recommended)
- **AWS Certificate Manager**: AWS-managed certificates for AWS services
- **Wildcard Certificates**: Support for *.yourproject.com patterns

## Generated Configuration Files

After running this command:

```
backend/
├── .quiknation/
│   ├── domain.json                  # Domain configuration
│   └── nginx-config.conf            # Generated nginx configuration
├── .github/
│   └── workflows/
│       └── deploy-backend.yml       # Updated with domain variables
└── .env.example                     # Updated with domain configuration
```

## Integration with Existing Workflow

### PRD-Driven Domain Setup
- **Automatic Detection**: Extract domain requirements from PRD.md
- **Brand Alignment**: Domain patterns match project branding requirements
- **Security Compliance**: SSL configuration follows PRD security standards
- **Performance**: Domain setup optimized for PRD performance targets

### Monorepo Compatibility
- **Workspace Awareness**: Detects backend workspace context
- **Shared Configuration**: Leverages existing QuikNation setup
- **Path Management**: Uses relative paths for monorepo compatibility
- **Build Integration**: Works with existing deployment workflows

### JIRA Integration Ready
- **Todo Generation**: Creates domain setup todos for tracking
- **Progress Monitoring**: Domain configuration tracked through existing workflow
- **Team Coordination**: Domain setup becomes part of project epic

## Command Workflow Example

**Complete Domain Setup Process:**
```
1. Developer runs: setup-domain-management
2. Command validates QuikNation deployment exists
3. Extract domain requirements from PRD.md
4. Interactive Route53 hosted zone selection
5. Domain pattern configuration (production/staging)
6. DNS record creation and validation
7. SSL certificate generation and installation
8. Nginx reverse proxy configuration
9. EC2 deployment and health verification
10. GitHub Actions workflow updates
11. Local configuration storage and validation
```

## Benefits

### For Developers
- **Professional URLs**: Custom branded domains for all environments
- **Automatic SSL**: No manual certificate management required
- **DNS Automation**: No manual DNS configuration needed
- **One-Command Setup**: Complete domain configuration in single command
- **Health Monitoring**: Automatic domain and SSL health checks

### For Projects
- **Brand Consistency**: Professional domain patterns across all environments
- **Security by Default**: HTTPS everywhere with automatic certificate renewal
- **Performance**: Nginx reverse proxy with compression and caching
- **Scalability**: Support for multiple domains and environments
- **Compliance**: SSL/TLS security for regulatory requirements

### For Teams
- **Standardized Domains**: Consistent domain patterns across all projects
- **Reduced DevOps**: Automated domain and SSL management
- **Client Presentation**: Professional URLs for client-facing APIs
- **Team Coordination**: Shared domain management processes

## Advanced Configuration

### Multiple Domain Support
For projects requiring multiple domains:
```bash
# Set up primary domain
setup-domain-management

# Add additional domains
npm run domain:create --domain additional.com
npm run domain:create --domain client-specific.net
```

### Custom Nginx Configuration
For advanced nginx needs:
```bash
# Generate base configuration
setup-domain-management

# Customize nginx config in .quiknation/nginx-config.conf
# Deploy custom configuration
npm run domain:setup --custom-config
```

### SSL Certificate Monitoring
Monitor certificate health:
```bash
# Check certificate status
npm run domain:verify

# Check certificate expiration
npm run domain:list

# Renew certificates manually
quiknation domain setup --renew
```

## Troubleshooting

### Common Issues

1. **"No hosted zones found"**
   ```bash
   # Check Route53 hosted zones
   aws route53 list-hosted-zones
   
   # Create hosted zone if needed
   aws route53 create-hosted-zone --name yourproject.com --caller-reference $(date +%s)
   ```

2. **"Domain already exists"**
   ```bash
   # Check existing domain configuration
   npm run domain:list
   
   # Remove existing configuration
   npm run domain:remove --force
   
   # Recreate domain configuration
   setup-domain-management
   ```

3. **"SSL certificate generation failed"**
   ```bash
   # Check domain ownership
   dig api.yourproject.com
   
   # Verify DNS propagation
   nslookup api.yourproject.com
   
   # Retry SSL generation
   npm run domain:setup --ssl-only
   ```

4. **"Nginx configuration failed"**
   ```bash
   # Check nginx status on EC2
   ssh ec2-user@{instance-ip} "sudo nginx -t"
   
   # Reload nginx configuration
   npm run domain:setup --nginx-only
   
   # Check nginx logs
   ssh ec2-user@{instance-ip} "sudo tail -f /var/log/nginx/error.log"
   ```

5. **"Domain not responding"**
   ```bash
   # Check DNS resolution
   dig api.yourproject.com
   
   # Test direct IP access
   curl -H "Host: api.yourproject.com" http://{instance-ip}:{port}/health
   
   # Verify nginx configuration
   ssh ec2-user@{instance-ip} "sudo nginx -T"
   ```

### Validation Commands
```bash
# Verify domain configuration
npm run domain:verify

# List all domain configurations
npm run domain:list

# Check SSL certificate status
quiknation domain verify --project your-project-name

# Test domain health
curl -I https://api.yourproject.com/health

# Check DNS propagation
dig api.yourproject.com A +short
```

## Security Considerations

- **DNS Security**: Use DNS validation for SSL certificates
- **Certificate Management**: Let's Encrypt certificates auto-renew
- **Nginx Security**: Security headers and SSL configuration
- **Access Control**: Route53 permissions follow least privilege
- **Monitoring**: SSL certificate expiration monitoring

## Next Steps After Setup

1. **Domain Verification**: Verify all domains resolve correctly
2. **SSL Testing**: Test HTTPS endpoints with SSL labs
3. **Performance Testing**: Test nginx reverse proxy performance
4. **Monitoring Setup**: Configure domain and SSL monitoring
5. **Documentation**: Update project documentation with domain information
6. **Team Training**: Share domain management process with team

## Integration with Other Commands

This command works with the existing setup workflow:

### Complete Workflow
1. **`setup-aws-cli`** - AWS CLI with Route53 permissions
2. **`setup-github-deployment`** - Repository secrets and variables
3. **`setup-quiknation-deployment`** - QuikNation CLI deployment setup
4. **`setup-domain-management`** - Custom domain and SSL setup (this command)
5. **`verify-deployment-setup`** - Complete verification including domains

### Available Scripts
After setup, these scripts are available:
```json
{
  "scripts": {
    "domain:setup": "quiknation domain setup",
    "domain:create": "quiknation domain create",
    "domain:verify": "quiknation domain verify",
    "domain:list": "quiknation domain list",
    "domain:remove": "quiknation domain remove"
  }
}
```

This command provides enterprise-grade domain management with developer-friendly automation, seamlessly integrating professional domain setup into the QuikNation deployment workflow.