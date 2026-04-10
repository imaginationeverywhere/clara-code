# Command Consolidation Plan

## Overview

This document outlines the consolidation of existing commands into the new domain-specific agent orchestration system. The new system provides better context optimization, coordinated multi-agent workflows, and clearer command organization.

## New Domain-Specific Commands

The following new orchestrated commands have been created:

1. **/debug-fix** - Debugging and bug resolution (app-troubleshooter, typescript-bug-fixer, graphql-bug-fixer)
2. **/plan-design** - Planning and design (business-analyst-bridge, project-management-bridge, plan-mode-orchestrator, product-design-specialist)
3. **/backend-dev** - Backend development (express, graphql-backend, nodejs, typescript-backend, sequelize, postgresql)
4. **/frontend-dev** - Frontend development (nextjs, shadcn, i18n, mockup-converter, graphql-frontend, typescript-frontend, redux-persist)
5. **/integrations** - Third-party services (shippo, clerk, stripe, google-analytics, slack, twilio)
6. **/devops** - Development operations (boilerplate-update, claude-context, mcp-server)
7. **/deploy-ops** - Deployment (git-commit-docs, docker-port, aws-orchestrator)
8. **/test-automation** - Testing (playwright-executor, testing-automation, chrome-mcp, playwright-mcp, browserstack-mcp)

## Commands to Deprecate (Replaced by New System)

### Planning Commands (Replaced by /plan-design)
- **create-plan-todo** → Use `/plan-design` instead
- **create-plan-todo-instructions** → Documentation merged into `/plan-design`
- **create-plan-todo-template** → Template functionality in `/plan-design`

**Migration Path**: The `/plan-design` command provides comprehensive planning with business analysis, product design, and project management integration.

### JIRA Commands (Replaced by /plan-design)
- **create-jira-plan-todo** → Use `/plan-design --pm-tool=jira`
- **process-jira-todos** → Use `/process-todos` (has built-in PM integration)
- **update-jira-todos** → Use `/update-todos` (has built-in PM integration)
- **simulate-jira-workflow** → Functionality available in `/plan-design`
- **jira-integration-guide** → Documentation merged into `/plan-design`

**Migration Path**: All JIRA functionality is now handled through the project-management-bridge agent, which supports multiple PM systems (JIRA, Linear, Asana, GitHub Projects).

### Docker Commands (Replaced by /devops and /deploy-ops)
- **docker-monitor** → Use `/devops --docker-status`
- **docker-logs** → Use `/devops --docker-logs`
- **docker-ports** → Use `/deploy-ops --port-registry`

**Migration Path**: Docker management is now part of the comprehensive DevOps and deployment orchestration.

## Commands to Keep (Core Functionality)

### Todo Management (Core Workflow)
- **process-todos** - ✅ KEEP - Core development workflow command
- **update-todos** - ✅ KEEP - Progress tracking and synchronization
- **sync-jira** - ✅ KEEP - Project management system connection setup

### Deployment Commands (Specific Workflows)
- **setup-aws-cli** - ✅ KEEP - One-time AWS configuration
- **setup-ec2-infrastructure** - ✅ KEEP - One-time EC2 setup
- **setup-project-api-deployment** - ✅ KEEP - Per-project backend deployment
- **setup-github-deployment** - ✅ KEEP - GitHub Actions configuration
- **setup-domain-management** - ✅ KEEP - Domain and SSL setup
- **setup-dynamic-ip-deployment** - ✅ KEEP - Dynamic IP handling for EC2
- **verify-deployment-setup** - ✅ KEEP - Deployment validation
- **amplify-deploy-staging** - ✅ KEEP - Amplify staging deployment
- **amplify-deploy-production** - ✅ KEEP - Amplify production deployment
- **amplify-deploy-status** - ✅ KEEP - Amplify deployment monitoring

**Rationale**: These are specific setup/deployment workflows that complement /deploy-ops rather than duplicate it.

### MCP Management (Core Functionality)
- **mcp-init** - ✅ KEEP - MCP server initialization
- **mcp-status** - ✅ KEEP - MCP server health monitoring
- **mcp-enable** - ✅ KEEP - Enable specific MCP servers
- **mcp-disable** - ✅ KEEP - Disable specific MCP servers

**Rationale**: These are specific MCP management commands that /devops coordinates but doesn't replace.

### Session and Environment
- **session-startup-handler** - ✅ KEEP - Automatic session initialization
- **init-session-hooks** - ✅ KEEP - Session hook configuration
- **init-manifest** - ✅ KEEP - Boilerplate manifest initialization
- **setup-production-environment** - ✅ KEEP - Production environment setup

### Git and Documentation
- **git-commit-docs-command** - ✅ KEEP - Core git workflow with docs
- **advanced-git** - ✅ KEEP - Advanced git operations
- **organize-docs** - ✅ KEEP - Documentation organization

### Boilerplate Management
- **update-boilerplate** - ✅ KEEP - Boilerplate update system
- **boilerplate-auto-version** - ✅ KEEP - Automatic version management

### Maintenance and Monitoring
- **restore-functionality** - ✅ KEEP - Functionality recovery system
- **prevent-overwrites** - ✅ KEEP - Proactive functionality protection
- **project-curl-commands** - ✅ KEEP - API testing templates

### Spec-Kit Integration
- **specify** - ✅ KEEP - Executable specification creation
- **plan** - ✅ KEEP - Technical implementation plans
- **tasks** - ✅ KEEP - Task breakdown from plans
- **spec-workflow** - ✅ KEEP - Complete spec-driven development

### Quick Reference
- **QUICK-START** - ✅ KEEP - Getting started guide
- **SUMMARY-EXPORT-QUICK-REFERENCE** - ✅ KEEP - Export documentation

## Implementation Plan

### Phase 1: Create Deprecation Notices (Immediate)
Add deprecation notices to commands being replaced:

```markdown
# [Command Name]

**⚠️ DEPRECATED**: This command is deprecated in favor of the new agent orchestration system.

**Use instead**: `/plan-design [options]`

**Migration Guide**: See [COMMAND-CONSOLIDATION-PLAN.md](../COMMAND-CONSOLIDATION-PLAN.md)

[Rest of original command documentation for reference]
```

### Phase 2: Update CLAUDE.md (Next)
Update CLAUDE.md to:
1. Prominently feature new domain-specific commands
2. Mark deprecated commands with deprecation notice
3. Provide clear migration paths
4. Update workflow examples to use new commands

### Phase 3: Update Process-Todos Integration (Next)
Ensure process-todos intelligently uses new domain-specific commands:
- Frontend tasks automatically use `/frontend-dev` context
- Backend tasks automatically use `/backend-dev` context
- Planning tasks use `/plan-design` context
- Testing tasks use `/test-automation` context

### Phase 4: Create Migration Guide (Documentation)
Create comprehensive migration guide showing:
- Old command → New command mapping
- Workflow transformations
- Benefits of new system
- Troubleshooting common migration issues

### Phase 5: Gradual Removal (Future)
After 2-3 months of deprecation:
1. Monitor usage analytics (if telemetry enabled)
2. Ensure no projects depend on deprecated commands
3. Remove deprecated command files
4. Update all documentation references

## Benefits of New System

### Context Optimization
- **70-80% reduction** in context usage per command
- Only relevant agents loaded when needed
- Multi-agent coordination reduces redundancy

### Improved Developer Experience
- Clearer command organization by domain
- Consistent command patterns across domains
- Better discoverability of functionality

### Enhanced Functionality
- Multi-agent coordination enables complex workflows
- Cross-domain optimization (e.g., frontend + backend + deployment)
- Proactive agent activation based on context

### Maintainability
- Centralized agent logic
- Easier to add new functionality
- Consistent patterns across all domains

## Backward Compatibility

### Transition Period
- Deprecated commands will remain functional for 2-3 months
- Deprecation warnings will be displayed when using old commands
- Migration guide provides clear upgrade path

### Automatic Migration
- process-todos will automatically use new system
- No breaking changes for existing workflows
- Gradual adoption at user's pace

## Communication Plan

### Announcement
- Update CHANGELOG.md with new system announcement
- Create blog post/documentation explaining benefits
- Provide clear examples of new commands in action

### Support
- Migration guide with comprehensive examples
- Troubleshooting section for common issues
- Community support channels for questions

## Success Metrics

- Reduction in context usage per command execution
- User adoption rate of new commands
- Reduction in duplicate command creation
- Improved command discoverability
- Faster agent response times

## Rollout Schedule

- **Week 1**: Create deprecation notices for old commands
- **Week 2**: Update CLAUDE.md and core documentation
- **Week 3**: Update process-todos integration
- **Week 4**: Create comprehensive migration guide
- **Week 5**: Announce new system to users
- **Weeks 6-18**: Transition period with both systems
- **Week 19+**: Gradual removal of deprecated commands
