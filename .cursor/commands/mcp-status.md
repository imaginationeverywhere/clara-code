# mcp-status - MCP Server Status and Management

**Comprehensive MCP server status display and management interface**

## Purpose
Display the current status of all MCP (Model Context Protocol) servers in the Claude boilerplate, including installation status, running state, health information, and management options.

## Usage
```bash
mcp-status
mcp-status --detailed
mcp-status --category [category-name]
mcp-status --health-check
```

## Examples
```bash
mcp-status                           # Show basic status of all servers
mcp-status --detailed                # Show detailed status with configuration info
mcp-status --category development-core  # Show only development core servers
mcp-status --health-check           # Run health check and show results
```

## Command Behavior

### 1. Basic Status Display
Shows essential information for all MCP servers:

#### Status Categories
- **🟢 Running**: Server is active and responding
- **🟡 Installed**: Server installed but not running
- **🔴 Stopped**: Server was running but stopped
- **⚪ Available**: Server available for installation
- **🚫 Disabled**: Server disabled by user configuration

#### Basic Information Display
```
MCP SERVER STATUS OVERVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DEVELOPMENT CORE (3/3 servers)
🟢 filesystem     - Secure filesystem operations
🟢 git            - Git repository management  
🟢 memory         - Cross-session context storage

DATABASE INTEGRATION (1/2 servers)
🟡 database       - PostgreSQL integration (installed, not running)
⚪ sqlite         - SQLite database server (available)

API INTEGRATION (2/2 servers)  
🟢 http           - HTTP requests and API testing
🚫 graphql        - GraphQL server integration (disabled)

CLOUD & DEPLOYMENT (1/3 servers)
🟡 aws            - AWS cloud management (installed, not running)
⚪ azure          - Azure cloud integration (available)
⚪ docker         - Container operations (available)

SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Running: 4 servers
📦 Installed: 6 servers  
🔄 Available: 12 servers
🚫 Disabled: 1 server

Auto-detection: ENABLED
Health monitoring: ENABLED
Last health check: 2 minutes ago
```

### 2. Detailed Status Mode

#### Server Details
Each server shows:
- **Configuration**: Current settings and parameters
- **Resource Usage**: CPU, memory, connection count
- **Uptime**: How long server has been running
- **Log Activity**: Recent log entries and activity level
- **Environment**: Required and configured environment variables

#### Example Detailed Output
```
FILESYSTEM SERVER (development-core)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status: 🟢 Running (2h 34m uptime)
Package: @modelcontextprotocol/server-filesystem@latest
Process ID: 12345
Auto-activate: ✅ Enabled

Configuration:
  Allowed Paths: /Users/dev/project/
  Denied Paths: node_modules, .git, .env*
  Security Level: High
  
Performance:
  CPU Usage: 0.2%
  Memory: 45MB
  Active Connections: 3
  
Recent Activity:
  [14:23] File read: package.json
  [14:22] Directory list: src/components/
  [14:21] File write: README.md

Environment Variables:
  ✅ PROJECT_ROOT: /Users/dev/project
  ❌ FILESYSTEM_LOG_LEVEL: Not set (using default)
```

### 3. Category Filtering

#### Available Categories
- **development-core**: Essential development servers (filesystem, git, memory)
- **database**: Database connectivity servers (postgres, sqlite, mongodb)
- **api-integration**: API and HTTP servers (fetch, graphql, rest)
- **cloud-deployment**: Cloud platform servers (aws, azure, gcp)
- **infrastructure**: Container and infrastructure servers (docker, kubernetes)
- **development-tools**: Developer platform servers (github, gitlab, bitbucket)
- **quality-assurance**: Testing and quality servers (testing, linting, security)

#### Category Status Display
```bash
mcp-status --category database
```

```
DATABASE INTEGRATION SERVERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟢 postgres       - PostgreSQL database integration
   Connections: 2 active, 5 pool
   Database: project_dev (connected)
   Last Query: SELECT * FROM users (1s ago)

🟡 sqlite         - SQLite database server  
   Status: Installed but not running
   Auto-activate: Based on file detection
   Trigger: *.sqlite, *.db files

🚫 mongodb        - MongoDB integration
   Status: Disabled by user
   Last disabled: 2 days ago
   Reason: Not using MongoDB in current project

Category Health: 1/3 servers running
Auto-detection: Will activate sqlite if database files found
```

### 4. Health Check Mode

#### Comprehensive Health Assessment
```bash
mcp-status --health-check
```

Performs active health checks on all running servers:

```
MCP HEALTH CHECK REPORT
Generated: 2025-09-07 21:45:23 UTC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RUNNING SERVERS HEALTH
🟢 filesystem     - Response time: 12ms ✅ Healthy
🟢 git            - Response time: 8ms  ✅ Healthy  
🟢 memory         - Response time: 5ms  ✅ Healthy
🟡 database       - Connection timeout  ⚠️  Degraded

SYSTEM RESOURCES
CPU Usage: 2.1% (Normal)
Memory Usage: 234MB (Normal)
Disk Space: 89GB available (Good)
Network: All connections stable

POTENTIAL ISSUES
⚠️  Database server responding slowly
   - Connection pool may be exhausted
   - Recommendation: Restart database server
   - Command: mcp-restart database

📋 RECOMMENDATIONS
• Consider enabling 'aws' server (AWS resources detected)
• Update 'filesystem' server (v1.2.3 available)
• Review disabled servers for potential re-enabling

Next health check: Automatic in 30 seconds
```

## Advanced Features

### Auto-Detection Results
Shows what the system automatically detected and activated:

```
AUTO-DETECTION ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRD Analysis (docs/PRD.md):
✅ Found: "PostgreSQL" → Activated database server
✅ Found: "AWS Amplify" → Recommended aws server
❌ Not found: Docker keywords → docker server not activated

File System Analysis:
✅ .git directory → git server activated
✅ package.json → Node.js ecosystem servers activated
❌ Dockerfile not found → docker server not recommended

Package Dependencies:
✅ Found: sequelize → database server activated
✅ Found: @aws-sdk → aws server recommended
❌ Not found: testing frameworks → testing servers not activated

Auto-activation Summary:
• 4 servers auto-activated based on project analysis
• 2 servers recommended for manual activation  
• 0 conflicts or issues detected
```

### Quick Management Actions
Status display includes quick action suggestions:

```
QUICK ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Recommended Actions:
🔧 mcp-enable aws        # Enable AWS server (detected in PRD)
🔧 mcp-install testing   # Install testing server (test files found)  
🔧 mcp-restart database  # Restart slow database server
🔧 mcp-configure github  # Configure GitHub token for enhanced features

Recently Disabled:
📅 2 days ago: mongodb (not needed for current project)
📅 1 week ago: docker (switched to local development)

Server Updates Available:
📦 filesystem: v1.2.2 → v1.2.3 (bug fixes)
📦 git: v1.1.0 → v1.2.0 (new features)
```

## Integration with Project Context

### PRD-Driven Recommendations
Based on docs/PRD.md analysis:

```
PROJECT CONTEXT RECOMMENDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

From PRD Analysis:
📋 Technology Stack: Next.js, Express, PostgreSQL, AWS
🎯 Mockup Template: retail (e-commerce focus)
🏢 Team Size: 3-5 developers

Recommended Server Configuration:
✅ Core servers (already active): filesystem, git, memory
✅ Database server (active): postgres
🔧 Should enable: aws, testing, github  
❌ Not needed: docker, mongodb, azure

Alignment Score: 85% (Very Good)
Missing: AWS integration for Amplify deployment
```

### Workspace Integration
Shows how servers integrate with monorepo workspaces:

```
WORKSPACE INTEGRATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

frontend/ workspace:
• filesystem: ✅ Access to src/, components/, pages/
• git: ✅ Branch management and commit operations
• aws: 🔧 Recommended for Amplify deployment
• testing: 🔧 Recommended (React components found)

backend/ workspace:  
• filesystem: ✅ Access to api/, models/, migrations/
• database: ✅ Connected to development database
• git: ✅ Repository operations
• http: ✅ API testing and validation

mobile/ workspace:
• filesystem: ✅ Access to mobile app source
• git: ✅ Version control integration
• Status: Future expansion planned
```

## Error Handling and Troubleshooting

### Common Issues and Solutions
```
TROUBLESHOOTING GUIDE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ Server won't start:
   • Check: Required environment variables
   • Fix: mcp-configure [server-name]

❌ Performance issues:
   • Check: Resource usage in detailed mode
   • Fix: mcp-restart [server-name]

❌ Auto-detection not working:
   • Check: PRD.md exists and contains keywords
   • Fix: Run mcp-auto-detect manually

❌ Configuration errors:  
   • Check: .claude/mcp/config/ files
   • Fix: Delete config and run mcp-configure

Support: See docs/detailed/MCP-TROUBLESHOOTING.md
```

## Usage in Development Workflow

### Integration with Existing Commands
The mcp-status command works seamlessly with other boilerplate commands:

```bash
# Check MCP status before starting development
mcp-status --health-check
process-todos

# After PRD changes, check recommendations
specify Build new authentication system
mcp-status --category development-tools  # May recommend github server

# Before deployment, ensure cloud servers are ready
mcp-status --category cloud-deployment
setup-project-api-deployment
```

### Team Coordination
Status display helps with team coordination:

```
TEAM COORDINATION INFO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Shared Servers (Team Access):
🟢 git         - Shared repository access
🟢 database    - Shared development database
🟡 aws         - Team AWS account (configure tokens)

Personal Servers (Local Only):
🟢 filesystem  - Local file access only
🟢 memory      - Personal context storage
🟢 http        - Local API testing

Team Recommendations:
• All team members should enable: git, database, filesystem
• Optional for role: aws (deployment team), testing (QA team)
• Personal preference: github, code-execution, memory
```

## Performance and Monitoring

### Resource Monitoring
```
RESOURCE USAGE MONITORING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

System Impact:
• Total CPU: 1.2% (4 servers running)
• Total Memory: 156MB (lightweight)
• Disk Usage: 45MB (server installations)
• Network: 12KB/s average (API calls)

Per-Server Resource Usage:
filesystem: 0.3% CPU, 32MB RAM
git: 0.2% CPU, 28MB RAM  
memory: 0.1% CPU, 15MB RAM
database: 0.6% CPU, 81MB RAM

Performance Grade: A+ (Excellent)
Recommendation: Current configuration is well-optimized
```

## File References
- **Server Registry**: `.claude/mcp/config/server-registry.json` - Available servers and configuration
- **Auto Configuration**: `.claude/mcp/config/auto-config.json` - Automatic detection rules
- **User Preferences**: `.claude/mcp/config/user-config.json` - Personal server settings
- **Server Logs**: `.claude/mcp/logs/` - Individual server log files
- **Management Script**: `.claude/mcp/scripts/server-manager.js` - Core management system

---

## Command Implementation

This command executes the MCP server status system by running the implementation script:

```bash
node .claude/mcp/scripts/mcp-status.js $@
```

When executed in Claude Code, this command:

1. **Loads Configuration**: Reads Claude settings and verified server registry
2. **Analyzes Status**: Checks which servers are configured vs available
3. **Categorizes Display**: Groups servers by category with health indicators
4. **Provides Details**: Shows server commands, environment requirements, descriptions
5. **Health Checking**: Tests server connectivity when requested
6. **Action Guidance**: Suggests next steps for server management

**Example Execution Flow:**
```bash
# User runs: /mcp-status --detailed --health-check
# 
# System executes: node .claude/mcp/scripts/mcp-status.js --detailed --health-check
#
# Output:
# MCP SERVER STATUS OVERVIEW
# ✅ Configured servers: 5/20
# 🟢 ACTIVE @modelcontextprotocol/server-filesystem  
# 🟢 ACTIVE github-mcp-server
# 📊 Configuration summary and health check results
```