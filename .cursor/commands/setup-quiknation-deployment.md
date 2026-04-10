# Setup QuikNation Deployment Command

## Overview
This Claude Code custom command integrates the QuikNation-CLI into your project, enabling seamless backend deployment to EC2 instances with GitHub Actions, port management, and secure credential handling. It leverages your existing PRD.md for project context and works perfectly with the monorepo structure.

## Prerequisites

⚠️ **RECOMMENDED SETUP ORDER**: 
1. **AWS CLI Setup**: Run `setup-aws-cli` command first (if AWS CLI not installed)
2. **GitHub Setup**: Run `setup-github-deployment` command (if repository secrets not configured)
3. **QuikNation CLI Setup**: This command (`setup-quiknation-deployment`)
4. **Domain Setup**: Run `setup-domain-management` command (for custom domains and SSL)
5. **Verification**: Run `verify-deployment-setup` command

⚠️ **REQUIRED**: 
1. **QuikNation-CLI Global Installation**: Install globally from private repository
   ```bash
   npm install -g git+ssh://git@github.com/imaginationeverywhere/quiknation-cli.git
   ```
2. **AWS CLI Access**: AWS CLI configured with SSM Parameter Store and Route53 access (run `setup-aws-cli` if needed)
3. **GitHub Repository**: Repository secrets and variables configured (run `setup-github-deployment` if needed)
4. A `docs/PRD.md` file must exist (copy from `docs/PRD-TEMPLATE.md` if needed)
5. Must be run from the `backend/` workspace directory
6. SSH access to the `imaginationeverywhere/quiknation-cli` private repository
7. **AWS Route53**: Access to Route53 for DNS management (for custom domains)

## Current Status
📌 **CLI Installation Status**: ✅ **WORKING** - The npm installation issues have been resolved
📌 **SSH Functionality**: ✅ **WORKING** - SSH client now uses system ssh/scp commands
📌 **Core Commands**: ✅ **AVAILABLE** - Basic CLI structure and commands are functional  
📌 **Deployment Features**: ✅ **WORKING** - Full deployment functionality now available
📌 **Domain Management**: ✅ **NEW** - Custom domain and SSL certificate automation available
📌 **Route53 Integration**: ✅ **NEW** - DNS management with professional domain patterns
📌 **SSL Automation**: ✅ **NEW** - Let's Encrypt integration with auto-renewal

## Command Usage

When you invoke this command, Claude will:

### 1. **Environment Validation**
   - Verify we're in a backend workspace (`backend/` directory)
   - Check for `docs/PRD.md` existence and extract project context
   - Validate QuikNation-CLI availability
   - Confirm GitHub repository connection
   - Detect monorepo structure (pnpm workspace)

### 2. **Project Context Extraction**
   Extract from PRD.md:
   - Project name and description
   - Technology stack requirements
   - Database configuration needs
   - Security and performance requirements
   - Deployment environment preferences
   - Team structure and responsibilities

### 3. **EC2 Instance Selection**
   Interactive selection process:
   ```
   Select your target EC2 instance:
   1. QuikNation-Apps (i-080ef6ece906660c0) - Port range: 3000-3199, Domain: Enabled
   2. QuikInfluence-Server (i-033b611761fe27b79) - Port range: 3200-3399, Domain: Enabled
   
   Choose (1-2): 
   ```

### 4. **Domain Configuration (NEW)**
   Custom domain and SSL certificate setup:
   - **Domain Requirements Detection**: Extract domain preferences from PRD.md
   - **Route53 Integration**: List available hosted zones in your AWS account
   - **Domain Pattern Selection**: Configure professional domain patterns:
     - Production: `https://api.{yourdomain}.com`
     - Staging: `https://api-dev.{yourdomain}.com`
   - **SSL Certificate Setup**: Automatic Let's Encrypt certificate generation
   - **DNS Management**: Automatic DNS record creation and management
   - **Domain Validation**: Verify domain ownership and DNS propagation

### 5. **Database Configuration**
   Guide through NEON PostgreSQL setup:
   - Staging database URL input and validation
   - Production database URL input and validation
   - Connection testing recommendations
   - Environment variable configuration

### 6. **Prerequisites Verification**
   Automated verification of setup requirements:
   ```bash
   # Verify AWS CLI and credentials
   aws --version && aws sts get-caller-identity
   
   # Test SSH key access via AWS SSM Parameter Store
   aws ssm get-parameter --name "/quiknation-cli/ssh-keys/quiknation-apps" --with-decryption
   
   # Verify Route53 access for domain management
   aws route53 list-hosted-zones --max-items 5
   
   # Verify QuikNation-CLI installation
   quiknation --version
   
   # Check GitHub repository configuration
   git remote -v
   ```

### 7. **QuikNation-CLI Integration**
   Automated setup process using global CLI:
   ```bash
   # Run QuikNation-CLI initialization with PRD context
   quiknation init --name {project-name}-backend
   
   # Configure workspace awareness
   quiknation workspace --validate
   
   # Allocate ports for the project
   quiknation ports --allocate {project-name}-backend --instance {selected-instance}
   
   # Set up domain configuration (if domains enabled)
   quiknation domain setup --instance {selected-instance}
   quiknation domain create --project {project-name} --instance {selected-instance}
   
   # Test SSH connectivity
   quiknation status --instance {selected-instance}
   ```

### 8. **GitHub Repository Secrets Setup**
   Comprehensive secrets configuration guide:
   
   **Required Repository Secrets:**
   ```
   GITHUB_SSH_KEY                   # SSH private key for accessing QuikNation-CLI private repo
   QUIKNATION_APPS_SSH_KEY          # SSH private key for QuikNation-Apps EC2
   QUIKINFLUENCE_SERVER_SSH_KEY     # SSH private key for QuikInfluence-Server EC2
   DATABASE_URL_STAGING             # NEON PostgreSQL staging database URL
   DATABASE_URL_PRODUCTION          # NEON PostgreSQL production database URL
   ```
   
   **Required Repository Variables:**
   ```
   PORT_STAGING                     # Allocated staging port
   PORT_PRODUCTION                  # Allocated production port
   USE_BUILT                        # Set to "true"
   DOMAIN_STAGING                   # Staging domain (e.g., api-dev.yourproject.com)
   DOMAIN_PRODUCTION                # Production domain (e.g., api.yourproject.com)
   SSL_ENABLED                      # Set to "true" for SSL certificate automation
   ```

### 9. **Backend Package.json Enhancement**
   Automatically adds QuikNation deployment scripts using global CLI:
   ```json
   {
     "scripts": {
       "deploy:staging": "echo 'Deploying to staging...' && quiknation deploy --environment staging",
       "deploy:production": "echo 'Deploying to production...' && quiknation deploy --environment production", 
       "deploy:status": "quiknation status",
       "deploy:ports": "quiknation ports --list",
       "deploy:github-check": "quiknation github --check",
       "deploy:workspace": "quiknation workspace --validate",
       "deploy:init": "quiknation init",
       "domain:setup": "quiknation domain setup",
       "domain:create": "quiknation domain create",
       "domain:verify": "quiknation domain verify",
       "domain:list": "quiknation domain list",
       "domain:remove": "quiknation domain remove"
     }
   }
   ```

### 10. **GitHub Actions Workflow Generation**
   Creates optimized deployment workflow at `.github/workflows/deploy-backend.yml`:
   - Environment-specific deployments (staging on develop, production on main)
   - Monorepo-aware build process using pnpm
   - Secure SSH key handling via repository secrets
   - Health checks and deployment verification
   - Port management and conflict detection
   - **Domain configuration and SSL certificate management**
   - **Nginx reverse proxy setup with domain support**

### 11. **Environment Configuration**
   Creates comprehensive `.env.example`:
   ```bash
   # Node.js Configuration
   NODE_ENV=development
   PORT=3001
   
   # Database Configuration
   DATABASE_URL_STAGING=postgresql://user:pass@host:5432/dbname_staging
   DATABASE_URL_PRODUCTION=postgresql://user:pass@host:5432/dbname_production
   
   # QuikNation Deployment
   DEPLOYMENT_INSTANCE=quiknation-apps
   DEPLOYMENT_ENVIRONMENT=staging
   
   # Domain Configuration (NEW)
   CUSTOM_DOMAIN_ENABLED=true
   DOMAIN_STAGING=api-dev.yourproject.com
   DOMAIN_PRODUCTION=api.yourproject.com
   SSL_CERTIFICATE_ENABLED=true
   SSL_PROVIDER=letsencrypt
   
   # QuikNation-CLI Installation (install globally)
   # npm install -g git+ssh://git@github.com/imaginationeverywhere/quiknation-cli.git
   
   # Security
   JWT_SECRET=your-jwt-secret-here
   ENCRYPTION_KEY=your-encryption-key-here
   
   # External Services (from PRD requirements)
   STRIPE_SECRET_KEY=sk_test_...
   CLERK_SECRET_KEY=sk_test_...
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   ```

### 12. **Deployment Readiness Validation**
   Comprehensive validation checklist:
   - ✅ QuikNation-CLI configuration verified
   - ✅ Port allocation confirmed
   - ✅ GitHub repository secrets guide provided
   - ✅ Database connection requirements documented
   - ✅ Deployment workflow generated
   - ✅ Backend scripts updated
   - ✅ Environment template created
   - ✅ Monorepo integration verified
   - ✅ **Domain configuration setup (NEW)**
   - ✅ **Route53 hosted zones verified (NEW)**
   - ✅ **SSL certificate automation configured (NEW)**
   - ✅ **Nginx reverse proxy integration ready (NEW)**

## Generated File Structure

After running this command, your backend workspace will have:

```
backend/
├── package.json                     # Enhanced with QuikNation deployment scripts
├── .env.example                     # Complete environment template with domain config
├── .quiknation/                     # QuikNation configuration directory
│   └── domain.json                  # Domain configuration (generated)
├── .github/
│   └── workflows/
│       └── deploy-backend.yml       # GitHub Actions deployment workflow with domains
├── src/
│   └── index.ts                     # QuikNation-compatible entry point
├── tsconfig.json                    # TypeScript configuration
└── README.md                        # Updated with deployment and domain instructions
```

## Integration with Existing Boilerplate Features

### PRD-Driven Configuration
- **Automatic Context**: Project name, tech stack, and requirements from PRD.md
- **Consistent Naming**: Backend project named as `{project-name}-backend`
- **Technology Alignment**: Deployment configuration matches PRD technology choices
- **Security Compliance**: Deployment follows PRD security requirements
- **Domain Requirements**: Custom domain preferences extracted from PRD.md
- **SSL/TLS Configuration**: Certificate automation based on security requirements

### Monorepo Awareness
- **Workspace Detection**: Automatically detects pnpm workspace structure
- **Path Management**: Scripts use relative paths for monorepo compatibility
- **Build Integration**: Deployment works with existing `pnpm build` commands
- **Shared Dependencies**: Leverages root-level dependencies where appropriate

### JIRA Integration Ready
- **Todo Generation**: Creates deployment-related todos for JIRA sync
- **Epic Structure**: Deployment setup becomes part of project epic tracking
- **Task Management**: Individual deployment tasks tracked in todo system
- **Progress Monitoring**: Deployment readiness tracked through existing workflow

## Command Workflow Example

**Complete Setup Process:**
```
1. Developer runs: setup-quiknation-deployment
2. Command validates environment and PRD.md
3. Interactive EC2 instance selection (QuikNation-Apps or QuikInfluence-Server)
4. Domain configuration setup and Route53 integration (NEW)
5. Database URL configuration and validation
6. QuikNation-CLI initialization with project context
7. Port allocation and conflict checking
8. Domain creation and SSL certificate setup (NEW)
9. GitHub secrets configuration guide (enhanced with domain variables)
10. Backend package.json enhancement (with domain scripts)
11. GitHub Actions workflow generation (with domain support)
12. Environment template creation (with domain configuration)
13. Deployment readiness validation and next steps
```

## Benefits

### For Developers
- **Guided Setup**: Step-by-step configuration without DevOps expertise
- **PRD Integration**: No need to re-enter project information
- **Secure by Default**: GitHub secrets and secure deployment patterns enforced
- **Monorepo Ready**: Works seamlessly with existing workspace structure
- **One Command Setup**: Complete deployment configuration in single command
- **Professional Domains**: Custom domain setup with SSL certificates included
- **DNS Automation**: Route53 integration eliminates manual DNS configuration

### For DevOps
- **Standardized Deployment**: Consistent deployment patterns across all projects
- **Security Compliance**: SSH keys and credentials properly managed
- **Port Management**: Automatic port allocation prevents conflicts
- **Audit Trail**: All deployments tracked through GitHub Actions
- **Infrastructure Reuse**: Leverages existing EC2 instances efficiently
- **Domain Standardization**: Consistent domain patterns across all projects
- **SSL Management**: Automated certificate lifecycle management
- **DNS Infrastructure**: Centralized Route53 management

### For Teams
- **Consistent Workflow**: Same deployment process for all QuikNation projects
- **Documentation**: Comprehensive setup and deployment documentation
- **Error Prevention**: Validation prevents common configuration mistakes
- **Team Coordination**: Shared deployment infrastructure and processes
- **Brand Consistency**: Professional domain patterns for client-facing APIs
- **SSL by Default**: Secure HTTPS endpoints for all environments

## Advanced Configuration

### Custom QuikNation-CLI Path
The CLI should be installed globally. If you need to use a local installation:
```bash
# For local development/testing, you can use npx
npx git+ssh://git@github.com/imaginationeverywhere/quiknation-cli.git <command>

# Or set a custom path if needed
export QUIKNATION_CLI_PATH="$(which quiknation)"
```

### Multiple EC2 Instances
For projects requiring multiple instances:
1. Run command once for primary instance
2. Manually configure additional instances using QuikNation-CLI directly
3. Update GitHub Actions workflow for multi-instance deployment

### Custom Database Configuration
For non-NEON databases:
1. Complete standard setup process
2. Manually update database URLs in repository secrets
3. Verify connection strings match your database provider format

## Troubleshooting

### Common Issues

1. **"PRD.md not found"**
   ```bash
   # Copy template and fill in project details
   cp docs/PRD-TEMPLATE.md docs/PRD.md
   # Edit docs/PRD.md with your project information
   ```

2. **"Not in backend workspace"**
   ```bash
   # Navigate to backend directory
   cd backend
   # Run command from backend workspace
   setup-quiknation-deployment
   ```

3. **"QuikNation-CLI not found"**
   ```bash
   # Install QuikNation-CLI globally
   npm install -g git+ssh://git@github.com/imaginationeverywhere/quiknation-cli.git
   
   # Verify installation
   quiknation --version
   
   # If still not found, check global npm installation
   npm list -g --depth=0 | grep quiknation-cli
   ```

4. **"GitHub repository not connected"**
   ```bash
   # Initialize git and add remote
   git init
   git remote add origin https://github.com/username/repo-name.git
   ```

5. **"No hosted zones found in Route53"**
   ```bash
   # Check Route53 hosted zones
   aws route53 list-hosted-zones
   
   # Create a hosted zone if needed
   aws route53 create-hosted-zone --name yourproject.com --caller-reference $(date +%s)
   ```

6. **"Domain configuration failed"**
   ```bash
   # Verify Route53 permissions
   aws route53 list-hosted-zones --max-items 1
   
   # Check domain ownership
   quiknation domain verify --project your-project-name
   
   # Reset domain configuration if needed
   quiknation domain remove --project your-project-name --force
   quiknation domain create --project your-project-name
   ```

7. **"SSL certificate generation failed"**
   ```bash
   # Check certificate status
   npm run domain:verify
   
   # List certificates
   npm run domain:list
   
   # Retry SSL setup
   npm run domain:setup
   ```

### Validation Commands
```bash
# Verify QuikNation configuration
npm run deploy:github-check

# Check port allocation
npm run deploy:ports

# Test deployment status
npm run deploy:status

# Validate workspace structure
quiknation workspace --validate

# Verify domain configuration (NEW)
npm run domain:verify

# List domain configurations (NEW)
npm run domain:list

# Check SSL certificate status (NEW)
quiknation domain verify --project your-project-name
```

## Security Notes

- **SSH Keys**: Never commit SSH keys to repository - always use GitHub secrets
- **Database URLs**: Keep production database URLs in repository secrets only
- **Environment Variables**: Use .env.example as template, never commit actual .env
- **API Keys**: All sensitive credentials should be in GitHub repository secrets
- **Access Control**: Only repository administrators should manage deployment secrets
- **Domain Configuration**: Never commit domain configuration files (.quiknation/domain.json)
- **SSL Certificates**: Let's Encrypt certificates managed automatically - no manual intervention needed
- **Route53 Access**: Ensure AWS credentials have minimal permissions for Route53 operations

## Next Steps After Setup

1. **Final Verification**: Run `verify-deployment-setup` command to ensure everything is configured correctly
2. **Repository Secrets**: Add all required secrets to GitHub repository (if not done via `setup-github-deployment`)
3. **Database Creation**: Create staging and production databases in NEON
4. **Domain Setup**: Run `setup-domain-management` command to configure custom domains and SSL
5. **Local Testing**: Test local development with environment variables
6. **Staging Deployment**: Push to develop branch to trigger staging deployment
7. **Production Deployment**: Push to main branch for production deployment
8. **Domain Verification**: Verify custom domains and SSL certificates are working
9. **Monitoring**: Use deployment status commands to monitor deployments

## Integration with Other Setup Commands

This command works seamlessly with the other setup commands in the workflow:

### Complete Setup Workflow
1. **`setup-aws-cli`** - Install and configure AWS CLI for SSH key and Route53 access
2. **`setup-github-deployment`** - Configure GitHub repository secrets and variables
3. **`setup-quiknation-deployment`** - Initialize QuikNation CLI and deployment (this command)
4. **`setup-domain-management`** - Configure custom domains and SSL certificates (NEW)
5. **`verify-deployment-setup`** - Comprehensive verification of entire setup including domains

### Helper Scripts Available
- `npm run setup:aws` - Reminder to run AWS CLI setup in Claude Code
- `npm run setup:github` - Reminder to run GitHub setup in Claude Code
- `npm run setup:domain` - Reminder to run domain management setup in Claude Code (NEW)
- `npm run verify:deployment` - Reminder to run verification in Claude Code
- `node scripts/install-aws-cli.js` - Direct AWS CLI installation script
- `node scripts/verify-aws-setup.js` - Direct AWS setup verification script
- `node scripts/setup-github-secrets.js` - Direct GitHub setup guidance script

This command integrates QuikNation deployment seamlessly into the Quik Nation AI Boilerplate workflow, providing enterprise-grade deployment capabilities with developer-friendly setup and maintenance.

## Current Implementation Notes

### ✅ Fully Working Features
- CLI global installation via npm
- SSH client using system ssh/scp commands
- Remote command execution on EC2 instances
- File upload and download capabilities
- EC2 deployment commands
- Real-time deployment status checking
- Port allocation and management
- GitHub Actions workflow generation
- Repository secrets configuration guides
- Environment template creation
- Package.json script enhancement
- **Custom domain management with Route53 integration (NEW)**
- **SSL certificate automation with Let's Encrypt (NEW)**
- **Professional domain patterns (api.project.com) (NEW)**
- **Nginx reverse proxy with SSL termination (NEW)**

### 🎯 Ready for Production
The QuikNation CLI now provides complete deployment functionality:
- **SSH Operations**: Connect, execute commands, upload/download files
- **EC2 Deployment**: Full deployment workflow to both EC2 instances
- **Port Management**: Automatic port allocation and conflict detection
- **GitHub Integration**: Complete CI/CD workflow with repository secrets
- **Monorepo Support**: Workspace-aware deployment process
- **Domain Management**: Complete custom domain and SSL certificate automation
- **DNS Operations**: Route53 integration for professional domain setup
- **SSL/TLS Security**: Automatic Let's Encrypt certificate generation and renewal
- **Nginx Integration**: Reverse proxy setup with SSL termination

The boilerplate provides a complete, production-ready foundation for QuikNation deployment integration with professional domain management.