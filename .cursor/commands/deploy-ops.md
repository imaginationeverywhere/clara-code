# Deploy-Ops - Deployment and Operations Management

Orchestrated multi-agent command for managing code deployments, documentation, and AWS cloud infrastructure. This command coordinates specialized agents to handle git workflows with documentation updates, Docker port management for shared infrastructure, and comprehensive AWS service orchestration with production-grade best practices.

## Agent Coordination

This command uses the **multi-agent-orchestrator** to coordinate three specialized deployment agents:

1. **git-commit-docs-manager**: Git workflows, commit documentation, CHANGELOG.md management, PR creation
2. **docker-port-manager**: Port allocation and collision detection for Docker deployments
3. **aws-cloud-services-orchestrator**: AWS CLI setup, EC2 deployment, Amplify deployment, infrastructure management

The orchestrator intelligently coordinates these agents to provide comprehensive deployment and operations capabilities from code commit through production deployment.

## When to Use This Command

Use `/deploy-ops` when you need to:
- Commit code with comprehensive documentation updates
- Deploy backend to shared EC2 infrastructure
- Deploy frontend to AWS Amplify (staging or production)
- Manage Docker port allocation for containerized deployments
- Set up AWS infrastructure and credentials
- Create pull requests with proper documentation
- Update CHANGELOG.md with version bumps
- Configure domain management and SSL certificates
- Monitor deployment health and status

## Command Usage

### Complete Deployment Workflow
```bash
/deploy-ops "Deploy complete application to production"
# Orchestrator activates ALL deployment agents in coordinated sequence:
# 1. git-commit-docs-manager: Commit changes with docs and changelog
# 2. docker-port-manager: Verify port allocations for deployment
# 3. aws-cloud-services-orchestrator: Deploy to EC2 and Amplify
```

### Git Commit with Documentation
```bash
/deploy-ops --commit "Implement user authentication feature"
# Orchestrator activates:
# - git-commit-docs-manager: Stage changes, update docs, create commit
# - Comprehensive documentation updates (README, CHANGELOG, technical docs)

/deploy-ops --pr "Create pull request for authentication feature"
# git-commit-docs-manager creates PR with:
# - Descriptive title and summary
# - Test plan and checklist
# - Documentation references
```

### Backend Deployment
```bash
/deploy-ops --backend "Deploy API to shared EC2"
# Orchestrator coordinates:
# - docker-port-manager: Allocate/verify port assignments
# - aws-cloud-services-orchestrator: Deploy to EC2 with PM2
# - git-commit-docs-manager: Tag deployment version

/deploy-ops --backend --staging
# Deploy to staging environment

/deploy-ops --backend --production
# Deploy to production with additional safety checks
```

### Frontend Deployment
```bash
/deploy-ops --frontend "Deploy Next.js app to Amplify"
# Orchestrator coordinates:
# - aws-cloud-services-orchestrator: Amplify deployment
# - git-commit-docs-manager: Tag deployment version

/deploy-ops --amplify-staging
# Deploy to Amplify staging branch

/deploy-ops --amplify-production
# Deploy to Amplify production with safety gates
```

### Port Management
```bash
/deploy-ops --port-scan "Scan for available ports on shared EC2"
# docker-port-manager analyzes current usage

/deploy-ops --port-allocate "Allocate port for new project"
# Intelligent port allocation avoiding conflicts

/deploy-ops --port-registry "Display current port allocations"
# Shows all project port assignments
```

### AWS Infrastructure Setup
```bash
/deploy-ops --aws-setup "Configure AWS CLI and infrastructure"
# Orchestrator coordinates:
# - aws-cloud-services-orchestrator: AWS CLI configuration
# - Set up SSM Parameter Store access
# - Configure Route53 for domains

/deploy-ops --domain-setup "mydomain.com"
# Configure domain with SSL certificates
```

## Deployment Workflows

### 1. Development to Production Pipeline
Complete deployment pipeline:
- **Code Commit**: Commit with comprehensive documentation
- **Port Allocation**: Verify Docker/EC2 port assignments
- **Staging Deployment**: Deploy to staging for validation
- **Testing**: Automated and manual testing
- **Production Deployment**: Deploy to production with monitoring
- **Version Tagging**: Git tags for deployment tracking

### 2. Shared EC2 Backend Deployment
Backend deployment to shared infrastructure:
- **Port Management**: Dynamic port allocation
- **PM2 Ecosystem**: Process management configuration
- **Environment Variables**: Secure credential management
- **Health Checks**: Liveness and readiness endpoints
- **Monitoring**: CloudWatch integration
- **Rollback**: Automated rollback on failure

### 3. AWS Amplify Frontend Deployment
Frontend deployment pipeline:
- **Build Optimization**: Optimized amplify.yml configuration
- **Environment Configuration**: Branch-specific env vars
- **Domain Management**: Custom domains with SSL
- **Cache Invalidation**: CloudFront cache management
- **Preview Deployments**: PR-based preview environments
- **Performance Monitoring**: Core Web Vitals tracking

### 4. Docker Container Deployment
Containerized deployment management:
- **Port Collision Detection**: Prevent port conflicts
- **Container Registry**: Push to ECR or Docker Hub
- **Multi-Container Orchestration**: Docker Compose or ECS
- **Resource Limits**: CPU and memory constraints
- **Health Monitoring**: Container health checks
- **Log Aggregation**: Centralized logging

## Git and Documentation Management

### Comprehensive Commit Workflow
```bash
/deploy-ops --commit "Feature: Add payment processing"
# git-commit-docs-manager executes:
# 1. Stage all relevant changes
# 2. Update CHANGELOG.md with version bump
# 3. Update technical documentation
# 4. Update README if public-facing changes
# 5. Create commit with conventional commit format
# 6. Add Claude Code co-authorship attribution
```

### Pull Request Creation
```bash
/deploy-ops --pr "Payment integration feature"
# git-commit-docs-manager creates PR with:
# - Summary of changes (business and technical)
# - Test plan with manual testing checklist
# - Related issues and dependencies
# - Deployment notes and considerations
# - Breaking changes documentation
```

### Version Management
```bash
/deploy-ops --version-bump "minor"
# Updates version in package.json and CHANGELOG.md
# Options: major, minor, patch

/deploy-ops --release "v1.5.0"
# Creates release tag with release notes
```

### Documentation Sync
```bash
/deploy-ops --docs-sync
# Ensures all documentation is current:
# - API documentation from code
# - Database schema from migrations
# - Environment variable documentation
# - Deployment procedures
```

## Port Management for Shared Infrastructure

### Intelligent Port Allocation
```bash
/deploy-ops --port-allocate --project="my-api"
# docker-port-manager:
# 1. Scans current port usage
# 2. Checks port registry for conflicts
# 3. Allocates next available port in range
# 4. Updates centralized port registry
# 5. Validates assignment uniqueness
```

### Port Registry Management
```bash
/deploy-ops --port-show
# Displays current allocations:
# Port 3001: project-a-api (PM2 id: 0)
# Port 3002: project-b-api (PM2 id: 1)
# Port 3003: project-c-api (PM2 id: 2)

/deploy-ops --port-release --project="old-api"
# Releases port allocation for decommissioned project
```

### Port Conflict Resolution
```bash
/deploy-ops --port-verify
# Verifies no port conflicts exist
# Reports any discrepancies between registry and actual usage

/deploy-ops --port-heal
# Automatically resolves port conflicts
# Updates registry to match actual usage
```

## AWS Cloud Operations

### EC2 Backend Deployment
```bash
/deploy-ops --ec2-deploy
# aws-cloud-services-orchestrator coordinates:
# 1. SSH into shared EC2 instance
# 2. Pull latest code from repository
# 3. Install/update dependencies
# 4. Run database migrations
# 5. Configure PM2 ecosystem with allocated port
# 6. Start/restart application
# 7. Verify health check endpoint
# 8. Update Route53 if domain configured
```

### Amplify Frontend Deployment
```bash
/deploy-ops --amplify-deploy --branch=main
# aws-cloud-services-orchestrator:
# 1. Validates amplify.yml configuration
# 2. Checks environment variables
# 3. Triggers Amplify build
# 4. Monitors build progress
# 5. Validates successful deployment
# 6. Invalidates CloudFront cache
# 7. Runs smoke tests
# 8. Reports deployment metrics
```

### Infrastructure as Code
```bash
/deploy-ops --infra-deploy
# Deploys AWS CDK infrastructure:
# - VPC and networking
# - EC2 instances and security groups
# - RDS database instances
# - S3 buckets and CloudFront
# - Route53 DNS records
# - IAM roles and policies
```

### Multi-Region Deployment
```bash
/deploy-ops --multi-region --regions="us-east-1,eu-west-1,ap-southeast-1"
# Coordinates deployments across multiple AWS regions
```

## Integration with Development Workflow

### With Backend-Dev
```bash
# After backend implementation
/backend-dev "Complete order management API"
# Then deploy:
/deploy-ops --backend --staging
```

### With Frontend-Dev
```bash
# After frontend implementation
/frontend-dev "Complete product catalog page"
# Then deploy:
/deploy-ops --frontend --staging
```

### With Process-Todos
```bash
# Complete task and deploy in one workflow
/process-todos --task=AUTH-123
/deploy-ops --commit "Complete authentication feature AUTH-123"
/deploy-ops --backend --staging
```

### With Debug-Fix
```bash
# After fixing production issue
/debug-fix "Payment webhook processing failure"
/deploy-ops --hotfix "Fix Stripe webhook signature validation"
/deploy-ops --backend --production --fast-track
```

## Advanced Deployment Features

### Blue-Green Deployment
```bash
/deploy-ops --blue-green --backend
# Orchestrator manages:
# - Deploy to green environment
# - Run health checks and smoke tests
# - Switch traffic from blue to green
# - Monitor for errors
# - Rollback to blue if issues detected
```

### Canary Deployment
```bash
/deploy-ops --canary --percentage=10
# Gradual traffic shift to new version:
# - Deploy new version alongside current
# - Route 10% traffic to new version
# - Monitor error rates and performance
# - Gradually increase to 100%
# - Rollback if metrics degrade
```

### Feature Flag Deployment
```bash
/deploy-ops --feature-flag="new-checkout" --enabled=false
# Deploy with feature disabled
# Enable progressively through configuration
```

### Automated Rollback
```bash
/deploy-ops --rollback
# Automated rollback to previous version:
# - Identifies last successful deployment
# - Reverts code to previous version
# - Restores database if needed
# - Validates rollback success
# - Notifies team of rollback
```

## Monitoring and Observability

### Deployment Monitoring
```bash
/deploy-ops --monitor
# Real-time deployment monitoring:
# - Build progress and logs
# - Deployment status across environments
# - Error rates and performance metrics
# - Resource utilization
# - User impact assessment
```

### Health Checks
```bash
/deploy-ops --health-check --all
# Comprehensive health validation:
# - Backend API responsiveness
# - Database connectivity
# - External service integrations
# - Frontend accessibility
# - SSL certificate validity
```

### Deployment Metrics
```bash
/deploy-ops --metrics
# Deployment analytics:
# - Deployment frequency
# - Success/failure rates
# - Mean time to deploy
# - Mean time to recovery
# - Change failure rate
```

## Security and Compliance

### Secrets Management
```bash
/deploy-ops --secrets-rotate
# Rotates secrets in production:
# - Database credentials
# - API keys
# - JWT signing keys
# - OAuth client secrets
```

### Security Scanning
```bash
/deploy-ops --security-scan
# Pre-deployment security checks:
# - Dependency vulnerability scan
# - Secrets exposure detection
# - Container image scanning
# - Infrastructure misconfiguration detection
```

### Compliance Validation
```bash
/deploy-ops --compliance-check
# Validates compliance requirements:
# - SOC 2 audit logging
# - GDPR data handling
# - PCI DSS payment security
# - HIPAA if applicable
```

## Prerequisites

This command benefits from:
- **Git Repository**: Clean working directory for commits
- **AWS Credentials**: Proper IAM permissions configured
- **SSH Access**: Keys for EC2 instance access
- **Port Registry**: Centralized port allocation tracking
- **Documentation**: Up-to-date CHANGELOG.md and README.md

## Multi-Agent Orchestrator Benefits

The orchestrator provides:
- **Unified Deployment**: Single command for complete deployment pipeline
- **State Management**: Tracks deployment state across stages
- **Rollback Coordination**: Automated rollback across all components
- **Documentation Sync**: Ensures docs match deployed code
- **Port Safety**: Prevents port conflicts in shared infrastructure
- **AWS Integration**: Seamless AWS service coordination
- **Efficient Context Usage**: Only loads relevant agent contexts when needed

## Best Practices

### Pre-Deployment Checklist
```bash
# Always run before production deployment
/deploy-ops --pre-deploy-check
# Validates:
# - All tests passing
# - Documentation updated
# - Security scan passed
# - Staging deployment successful
# - Rollback plan confirmed
```

### Deployment Windows
```bash
# Schedule deployments during low-traffic periods
/deploy-ops --schedule="2025-01-20T02:00:00Z" --backend --production
```

### Communication
```bash
# Notify team of deployments
/deploy-ops --deploy --notify
# Sends Slack notifications to relevant channels
```

## Output and Deliverables

### Deployment Reports
- Deployment timeline and duration
- Components deployed and versions
- Health check results
- Performance metrics comparison
- Error logs and warnings

### Documentation Updates
- Updated CHANGELOG.md with version
- Deployment notes in technical docs
- API documentation if changed
- Configuration documentation

### Infrastructure State
- Port allocation registry
- AWS resource inventory
- Environment variable documentation
- SSL certificate expiration tracking

## Related Commands

- `/backend-dev` - Backend development before deployment
- `/frontend-dev` - Frontend development before deployment
- `/integrations` - Third-party service configuration
- `/debug-fix` - Troubleshoot deployment issues
- `/test-automation` - Run tests before deployment

## Emergency Deployment Support

For critical production deployments:

```bash
/deploy-ops --emergency --hotfix "Critical security vulnerability fix"
# Orchestrator enables fast-track deployment
# Bypasses non-critical checks
# Prioritizes speed while maintaining safety
# Enhanced monitoring post-deployment
```

## Rollback Procedures

```bash
/deploy-ops --rollback --version="v1.4.2"
# Automated rollback with:
# - Code reversion to specified version
# - Database migration rollback if needed
# - Configuration restoration
# - Health validation
# - Team notification
```
