# DevOps - Development Operations and Tooling Management

Orchestrated multi-agent command for managing development operations, boilerplate maintenance, documentation, and MCP server infrastructure. This command coordinates specialized agents to handle system updates, context documentation, and MCP server management with production-grade best practices.

## Agent Coordination

This command uses the **multi-agent-orchestrator** to coordinate three specialized DevOps agents:

1. **boilerplate-update-manager**: Intelligent update system, version management, multi-project synchronization
2. **claude-context-documenter**: CLAUDE.md creation, codebase documentation, AI context optimization
3. **mcp-server-manager**: MCP server discovery, installation, configuration, maintenance, health monitoring

The orchestrator intelligently coordinates these agents to provide comprehensive DevOps capabilities for maintaining development infrastructure and tooling.

## When to Use This Command

Use `/devops` when you need to:
- Check for and apply boilerplate updates across projects
- Create or update CLAUDE.md files for AI context
- Install and manage MCP servers for enhanced development
- Configure development environment and tooling
- Maintain documentation and system configuration
- Monitor and troubleshoot MCP server health
- Synchronize boilerplate updates across multiple projects
- Optimize AI context for Claude Code understanding

## Command Usage

### Complete DevOps Management
```bash
/devops "Perform complete development environment maintenance"
# Orchestrator activates ALL DevOps agents in coordinated sequence:
# 1. boilerplate-update-manager: Check for updates, apply if available
# 2. claude-context-documenter: Update CLAUDE.md with latest structure
# 3. mcp-server-manager: Health check all MCP servers, update configs
```

### Boilerplate Updates
```bash
/devops --update "Check for boilerplate updates and apply"
# Orchestrator activates:
# - boilerplate-update-manager: Update detection and application
# - claude-context-documenter: Update documentation if structure changes

/devops --update-check "Check available updates without applying"
# Non-destructive update check with version comparison

/devops --update-all-projects "Scan and update all projects in workspace"
# Multi-project update coordination
```

### Documentation Management
```bash
/devops --docs "Create/update CLAUDE.md for current project"
# Orchestrator activates:
# - claude-context-documenter: Analyze codebase structure
# - boilerplate-update-manager: Include boilerplate context
# - mcp-server-manager: Document available MCP servers

/devops --docs-scan "Analyze codebase and generate comprehensive docs"
# Deep analysis with automatic CLAUDE.md generation
```

### MCP Server Management
```bash
/devops --mcp "Manage MCP servers"
# Full MCP server lifecycle management

/devops --mcp-install "chrome,playwright,browserstack"
# Install specific MCP servers

/devops --mcp-health "Check health of all installed MCP servers"
# Comprehensive health monitoring

/devops --mcp-update "Update all MCP servers to latest versions"
# Coordinated MCP server updates
```

### Environment Configuration
```bash
/devops --init "Initialize development environment"
# Orchestrator coordinates:
# - boilerplate-update-manager: Initialize .boilerplate-manifest.json
# - claude-context-documenter: Create initial CLAUDE.md
# - mcp-server-manager: Install essential MCP servers
```

## DevOps Workflows

### 1. Project Initialization
Set up new project with complete dev environment:
- **Boilerplate Setup**: Initialize manifest and tracking
- **Documentation**: Generate CLAUDE.md from codebase
- **MCP Servers**: Install essential development servers
- **Configuration**: Environment variables and settings

### 2. System Maintenance
Regular maintenance and updates:
- **Update Checks**: Automatic boilerplate update detection
- **Documentation Updates**: Keep CLAUDE.md current
- **MCP Health Monitoring**: Ensure servers are operational
- **Configuration Validation**: Verify environment setup

### 3. Multi-Project Management
Coordinate updates across multiple projects:
- **Batch Updates**: Update all projects simultaneously
- **Version Sync**: Maintain consistent versions
- **Configuration Sync**: Share configurations across projects
- **Dependency Management**: Coordinate dependency updates

### 4. Troubleshooting
Diagnose and resolve dev environment issues:
- **Boilerplate Issues**: Resolve update conflicts
- **MCP Server Problems**: Fix server connectivity
- **Documentation Drift**: Sync docs with code
- **Configuration Errors**: Validate and fix config

## Boilerplate Management

### Update Detection
```bash
/devops --update-check
# Automatically detects:
# - New boilerplate versions available
# - Changed files and features
# - Breaking changes and migration paths
# - Compatible update strategies
```

### Intelligent Updates
```bash
/devops --update --strategy=safe
# Update strategies:
# - safe: Only non-breaking updates
# - commands-only: Update commands, skip infrastructure
# - docs-only: Update documentation only
# - full: Complete update with migrations
```

### Conflict Resolution
```bash
/devops --update --resolve-conflicts
# Orchestrator handles:
# - File conflict detection
# - Three-way merge strategies
# - Custom modifications preservation
# - Backup creation before updates
```

### Multi-Project Sync
```bash
/devops --update-all-projects --workspace=/path/to/projects
# Coordinates updates across:
# - All detected boilerplate projects
# - Dependency resolution
# - Version consistency
# - Rollback capabilities
```

## CLAUDE.md Documentation

### Automatic Generation
```bash
/devops --docs --generate
# Orchestrator analyzes and documents:
# - Directory structure and organization
# - Key files and their purposes
# - Custom commands and workflows
# - Integration patterns
# - MCP server configurations
```

### Context Optimization
```bash
/devops --docs --optimize-context
# Optimizes CLAUDE.md for:
# - Token efficiency
# - Relevant information prioritization
# - Clear navigation structure
# - Cross-referencing
```

### Documentation Sync
```bash
/devops --docs --sync
# Keeps documentation synchronized with:
# - Code structure changes
# - New features and commands
# - Updated workflows
# - Changed dependencies
```

## MCP Server Management

### Server Discovery
```bash
/devops --mcp-discover
# Discovers available MCP servers:
# - Official MCP servers
# - Community servers
# - Enterprise servers (Clerk, Twilio, etc.)
# - Custom servers
```

### Installation and Configuration
```bash
/devops --mcp-install "clerk-auth,twilio-communications,github"
# Orchestrator handles:
# - Server binary installation
# - Configuration file creation
# - Environment variable setup
# - Dependency resolution
```

### Health Monitoring
```bash
/devops --mcp-health --detailed
# Comprehensive health checks:
# - Server connectivity
# - API key validation
# - Resource usage
# - Performance metrics
# - Error rates
```

### Server Categories
```bash
# Enterprise Servers
/devops --mcp-install --category=enterprise
# Installs: clerk-auth, twilio-communications, sendgrid-email

# Development Servers
/devops --mcp-install --category=dev-tools
# Installs: github, gitlab, linear, playwright

# Browser Testing
/devops --mcp-install --category=browser-testing
# Installs: chrome, playwright, browserstack

# Specialized Knowledge
/devops --mcp-install --category=knowledge
# Installs: ultrathink-knowledge-graph, claude-historian
```

## Integration with Development Workflow

### With Process-Todos
```bash
# Before starting development session
/devops --health-check
/process-todos
# Ensures dev environment is healthy
```

### With Deploy-Ops
```bash
# Before deployment
/devops --update-check --docs-sync
/deploy-ops --backend
# Ensures system is up-to-date before deploy
```

### With Debug-Fix
```bash
# When dev environment issues occur
/debug-fix "MCP server not responding"
/devops --mcp-troubleshoot
```

## Advanced DevOps Features

### Automated Session Checks
```bash
/devops --auto-session-startup
# Configures automatic checks on session start:
# - Boilerplate update detection
# - MCP server health verification
# - Documentation sync check
# - Environment validation
```

### Telemetry and Analytics
```bash
/devops --telemetry --enable
# Anonymous telemetry for:
# - Update adoption rates
# - MCP server usage patterns
# - Command usage statistics
# - Error frequency analysis

/devops --telemetry --disable
# Disable telemetry while keeping functionality
```

### Backup and Restore
```bash
/devops --backup "Create backup before major update"
# Creates snapshots of:
# - Configuration files
# - Custom modifications
# - MCP server configs
# - Documentation

/devops --restore "backup-2025-01-15"
# Restores from backup
```

### Configuration Management
```bash
/devops --config --export "Export configuration for team sharing"
# Exports shareable configuration

/devops --config --import "team-config.json"
# Imports team-standardized configuration
```

## Monitoring and Observability

### System Health Dashboard
```bash
/devops --dashboard
# Displays:
# - Boilerplate version status
# - MCP server health indicators
# - Documentation currency
# - Environment configuration status
# - Recent errors and warnings
```

### Automated Alerts
```bash
/devops --alerts --configure
# Sets up alerts for:
# - Available updates
# - MCP server failures
# - Configuration drift
# - Security vulnerabilities
```

### Usage Metrics
```bash
/devops --metrics
# Reports on:
# - Command usage frequency
# - MCP server utilization
# - Update adoption timeline
# - Error trends
```

## Security and Compliance

### Credentials Management
```bash
/devops --secrets --audit
# Audits for:
# - Exposed API keys
# - Unencrypted secrets
# - Improper .gitignore
# - Credential rotation needs
```

### Update Security
```bash
/devops --update --verify-signatures
# Ensures updates are:
# - Cryptographically signed
# - From trusted sources
# - Free from tampering
# - Compatible with security policies
```

### MCP Server Security
```bash
/devops --mcp-security-audit
# Audits MCP servers for:
# - Secure communication channels
# - Proper authentication
# - Access control
# - Data handling compliance
```

## Prerequisites

This command benefits from:
- **Git Repository**: Version control for tracking changes
- **Network Access**: For checking updates and installing MCP servers
- **Write Permissions**: For updating files and configurations
- **API Credentials**: For enterprise MCP servers (Clerk, Twilio, etc.)

## Multi-Agent Orchestrator Benefits

The orchestrator provides:
- **Unified Management**: Single command for all DevOps operations
- **Intelligent Coordination**: Agents work together seamlessly
- **Conflict Prevention**: Automatic conflict detection and resolution
- **State Management**: Maintains consistent system state
- **Rollback Capabilities**: Safe update with rollback options
- **Efficient Context Usage**: Only loads relevant agent contexts when needed

## Best Practices

### Regular Maintenance
```bash
# Weekly maintenance routine
/devops --health-check
/devops --update-check
/devops --docs-sync
/devops --mcp-health
```

### Before Major Changes
```bash
# Pre-deployment checklist
/devops --backup "pre-deployment-$(date +%Y%m%d)"
/devops --update --strategy=safe
/devops --docs-sync
```

### Team Coordination
```bash
# Share standardized configuration
/devops --config --export "team-standard.json"
# Team members import:
/devops --config --import "team-standard.json"
```

## Output and Deliverables

### Update Reports
- Available updates with changelogs
- Applied changes summary
- Conflict resolution details
- Rollback procedures

### Documentation
- Updated CLAUDE.md with current structure
- Configuration documentation
- MCP server registry
- Troubleshooting guides

### Health Reports
- MCP server status dashboard
- System configuration validation
- Performance metrics
- Error logs and diagnostics

## Related Commands

- `/process-todos` - Execute development tasks
- `/debug-fix` - Troubleshoot dev environment issues
- `/deploy-ops` - Deployment operations
- `/plan-design` - Project planning and architecture

## Emergency DevOps Support

For critical dev environment issues:

```bash
/devops --emergency "Development environment completely broken"
# Orchestrator activates rapid recovery mode
# Attempts automatic recovery procedures
# Provides manual recovery steps if needed
```

## Continuous Improvement

```bash
/devops --feedback "Report issue or suggest improvement"
# Contributes to boilerplate improvement
# Helps identify common issues
# Suggests feature enhancements
```
