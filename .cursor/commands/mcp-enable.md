# mcp-enable - Enable MCP Server

**Enable and activate MCP (Model Context Protocol) servers with automatic configuration and health checking**

## Purpose
Enable disabled MCP servers, install them if necessary, configure them automatically, and start them with proper integration into the Claude boilerplate development workflow.

## Usage
```bash
mcp-enable [server-name]
mcp-enable [server-name] --auto-configure
mcp-enable [server-name] --force-reinstall
mcp-enable --category [category-name]
mcp-enable --auto-detect
```

## Examples
```bash
mcp-enable aws                     # Enable AWS cloud server
mcp-enable database --auto-configure  # Enable database with automatic config
mcp-enable github --force-reinstall   # Force reinstall and enable GitHub server
mcp-enable --category cloud-deployment # Enable all cloud deployment servers
mcp-enable --auto-detect           # Enable all auto-detected servers
```

## Command Behavior

### 1. Single Server Enablement

#### Basic Enablement Process
1. **Remove from Disabled List**: Remove server from user's disabled servers list
2. **Installation Check**: Verify server is installed, install if missing
3. **Configuration Creation**: Generate or update server configuration
4. **Environment Validation**: Check required environment variables
5. **Server Activation**: Start the server and verify it's running
6. **Integration Setup**: Configure integration with existing workflow

#### Example Output
```bash
mcp-enable aws
```

```
ENABLING MCP SERVER: aws
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Server Information:
   Name: @modelcontextprotocol/server-aws
   Category: cloud-deployment
   Description: AWS cloud resource management
   
🔍 Pre-enablement Checks:
   ✅ Server available in registry
   ✅ Removed from disabled list
   🔧 Installation required
   ⚠️  Environment variables need configuration

📦 Installing Server:
   Installing @modelcontextprotocol/server-aws...
   ✅ Package installed successfully
   ✅ Created server directory: .claude/mcp/servers/aws/
   
⚙️  Configuring Server:
   ✅ Generated base configuration
   ⚠️  Missing environment variables:
      - AWS_ACCESS_KEY_ID
      - AWS_SECRET_ACCESS_KEY
      - AWS_DEFAULT_REGION
   
   💡 CONFIGURATION HELP:
   Add these to your .env file:
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key  
   AWS_DEFAULT_REGION=us-east-1
   
   Or use AWS CLI configuration:
   aws configure

🚀 Starting Server:
   Starting AWS MCP server...
   ✅ Server started successfully (PID: 45231)
   ✅ Health check passed
   
🔗 Integration Setup:
   ✅ Added to Claude Code MCP configuration
   ✅ Integrated with deployment commands
   ✅ Connected to infrastructure management
   
✅ SUCCESS: AWS MCP server enabled and running
   
💡 NEXT STEPS:
   • Test connection: mcp-status aws --health-check
   • Use in commands: setup-aws-cli, setup-project-api-deployment
   • View resources: Available in Claude Code AWS tools
```

### 2. Auto-Configuration Mode

#### Intelligent Configuration Setup
When using `--auto-configure`, the system automatically:

```bash
mcp-enable database --auto-configure
```

```
AUTO-CONFIGURING DATABASE SERVER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 Project Context Analysis:
   ✅ Found: PostgreSQL in docs/PRD.md
   ✅ Found: Sequelize in package.json
   ✅ Found: DATABASE_URL in .env file
   ✅ Detected: Development database configuration
   
📋 Auto-Configuration Decisions:
   Database Type: PostgreSQL
   Connection String: From .env DATABASE_URL
   Auto-migrate: Enabled (development mode)
   Query Logging: Enabled (debug level)
   Connection Pool: 10 connections (optimal for dev)
   
⚙️  Applying Configuration:
   ✅ Database connection validated
   ✅ Schema introspection enabled
   ✅ Query performance monitoring enabled
   ✅ Integration with Sequelize models configured
   
🚀 Server Status:
   ✅ Database server running and connected
   ✅ Ready for GraphQL integration
   ✅ Available in Claude Code database tools
   
📊 Connection Details:
   Database: project_development
   Host: localhost:5432
   Active Connections: 2/10
   Schema Tables: 8 discovered
```

### 3. Force Reinstall Mode

#### Complete Server Reinstallation
When using `--force-reinstall`:

```bash
mcp-enable filesystem --force-reinstall
```

```
FORCE REINSTALLING FILESYSTEM SERVER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🗑️  Cleanup Phase:
   ✅ Stopped existing server process
   ✅ Removed old installation directory
   ✅ Cleared cached configuration
   ✅ Reset server state
   
📦 Fresh Installation:
   Installing @modelcontextprotocol/server-filesystem@latest...
   ✅ Downloaded latest version (v1.2.3)
   ✅ Created clean server directory
   ✅ Initialized default configuration
   
🔒 Security Configuration:
   ✅ Set allowed paths: /Users/dev/project/
   ✅ Set denied paths: node_modules, .git, .env*, *.key
   ✅ Enabled file operation logging
   ✅ Set security level: High
   
🚀 Activation Complete:
   ✅ Server running with fresh installation
   ✅ All security policies applied
   ✅ Integration with Claude Code active
   
💡 UPGRADE BENEFITS:
   • Latest security patches applied
   • Improved performance (15% faster file operations)
   • New features: Directory watching, bulk operations
```

### 4. Category Enablement

#### Enable Multiple Related Servers
```bash
mcp-enable --category development-tools
```

```
ENABLING DEVELOPMENT TOOLS SERVERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Category: development-tools
   Servers to enable: github, testing, code-execution
   
🔍 Analyzing Requirements:
   github: Requires GITHUB_PERSONAL_ACCESS_TOKEN
   testing: Auto-configurable (test frameworks detected)
   code-execution: Ready (sandboxed mode)
   
⚡ Parallel Installation:
   [1/3] Installing github server... ✅ Complete
   [2/3] Installing testing server... ✅ Complete  
   [3/3] Installing code-execution server... ✅ Complete
   
⚙️  Configuration Phase:
   github: ⚠️  Token required for full functionality
   testing: ✅ Auto-configured for Jest + Playwright
   code-execution: ✅ Sandbox configured with security limits
   
🚀 Activation Results:
   ✅ github: Started (limited mode - configure token for full features)
   ✅ testing: Started and ready
   ✅ code-execution: Started in secure sandbox mode
   
📊 Category Status:
   Enabled: 3/3 servers
   Fully Configured: 2/3 servers
   Action Required: Configure GitHub token
   
💡 CONFIGURATION HELP:
   For github server full functionality:
   1. Create personal access token: https://github.com/settings/tokens
   2. Add to .env: GITHUB_PERSONAL_ACCESS_TOKEN=your_token
   3. Restart: mcp-restart github
```

### 5. Auto-Detection Enablement

#### Enable All Detected Servers
```bash
mcp-enable --auto-detect
```

```
AUTO-DETECTING AND ENABLING SERVERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 Project Analysis Results:
   📁 Files: .git, package.json, docs/PRD.md, backend/models/
   📋 PRD Keywords: AWS, PostgreSQL, GraphQL, Next.js
   📦 Dependencies: sequelize, @aws-sdk, apollo-server
   
🎯 Detection Results:
   Recommended for activation:
   ✅ git (already enabled)
   ✅ database (already enabled)  
   🔧 aws (detected AWS references)
   🔧 http (detected API requirements)
   ✅ filesystem (already enabled)
   
⚡ Auto-Enabling Detected Servers:
   [1/2] Enabling aws server...
      ✅ Installed and configured
      ⚠️  Needs AWS credentials
      
   [2/2] Enabling http server...
      ✅ Installed and ready
      ✅ API testing capabilities active
      
📊 Auto-Detection Summary:
   Total servers analyzed: 12
   Recommended for enabling: 4
   Already enabled: 2
   Newly enabled: 2
   Requiring configuration: 1 (aws credentials)
   
✅ AUTO-ENABLEMENT COMPLETE
   
🚀 New Capabilities Available:
   • AWS resource management
   • HTTP API testing and validation
   • Enhanced development workflow integration
   
💡 NEXT STEPS:
   1. Configure AWS credentials for cloud management
   2. Test new servers: mcp-status --health-check
   3. Explore new features in Claude Code
```

## Advanced Configuration Options

### Environment Variable Management
The enable command can automatically detect and help configure required environment variables:

```
ENVIRONMENT CONFIGURATION ASSISTANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Server: github
Required Variables:
❌ GITHUB_PERSONAL_ACCESS_TOKEN (missing)

Optional Variables:
⚪ GITHUB_BASE_URL (default: https://api.github.com)
⚪ GITHUB_TIMEOUT (default: 30000ms)

CONFIGURATION OPTIONS:

Option 1: Environment File (.env)
Add to your .env file:
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token_here

Option 2: System Environment
export GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token_here

Option 3: Interactive Configuration
Run: mcp-configure github --interactive

Verification:
After setting variables, run: mcp-restart github
```

### Security and Permissions
Each server is enabled with appropriate security settings:

```
SECURITY CONFIGURATION APPLIED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Server: code-execution
Security Level: Maximum (Sandboxed)

Applied Restrictions:
🔒 Execution timeout: 30 seconds
🔒 Memory limit: 512MB
🔒 File system access: Read-only to project files
🔒 Network access: Blocked
🔒 Process spawning: Disabled

Allowed Operations:
✅ JavaScript/TypeScript code execution
✅ Mathematical computations
✅ Data transformations
✅ Algorithm testing

Monitoring:
✅ All executions logged
✅ Resource usage tracked
✅ Security violations reported
```

### Integration Verification
After enabling, the system verifies integration:

```
INTEGRATION VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Claude Code Integration:
✅ Server registered with Claude Code
✅ Tools and capabilities exposed
✅ Context integration active

Boilerplate Workflow Integration:
✅ Available in process-todos command
✅ Integrated with deployment commands  
✅ Connected to JIRA workflow
✅ Spec-Kit workflow integration

Command Integration:
✅ setup-aws-cli (aws server)
✅ create-plan-todo (memory server)
✅ git-commit-docs-command (git server)

Verification Tests:
✅ Server responds to health check
✅ Basic functionality test passed
✅ Integration test passed
✅ Security test passed
```

## Error Handling and Recovery

### Common Issues and Automatic Resolution
```
ERROR RECOVERY SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Issue: Installation Failed
Cause: Network connectivity
Resolution: ✅ Retried with exponential backoff
Result: Installation successful on attempt 2

Issue: Environment Variable Missing
Cause: DATABASE_URL not found
Resolution: ✅ Prompted user with configuration help
Result: User guided through setup process

Issue: Port Conflict
Cause: Port 8080 already in use
Resolution: ✅ Automatically assigned port 8081
Result: Server started on alternative port

Issue: Permission Denied
Cause: Insufficient file system permissions
Resolution: ✅ Adjusted security policy within safe bounds
Result: Server operational with appropriate restrictions
```

### Rollback Capability
If enablement fails, automatic rollback occurs:

```
ROLLBACK EXECUTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Reason: Server failed health check after 3 attempts
Actions Taken:
✅ Stopped failed server process
✅ Restored previous configuration
✅ Cleaned up partial installation
✅ Reset server state to 'disabled'

System Status: ✅ Stable (no impact on other servers)
Recommendation: Check logs and retry with --force-reinstall
Support: Run mcp-status [server-name] --detailed for diagnostics
```

## Usage in Development Workflow

### Integration with Existing Commands
```bash
# Enable servers before major development work
mcp-enable --auto-detect
spec-workflow Build comprehensive user dashboard

# Enable specific servers for deployment
mcp-enable aws docker
setup-project-api-deployment

# Enable testing infrastructure for quality assurance
mcp-enable testing code-execution
process-todos --prp-mode
```

### Team Coordination
```bash
# Share enabled server configuration with team
mcp-status > team-mcp-config.txt

# Enable standard team servers
mcp-enable git database filesystem memory

# Enable role-specific servers
mcp-enable aws          # For DevOps team
mcp-enable testing      # For QA team
mcp-enable github       # For all developers
```

## Performance Considerations

### Startup Impact
```
SERVER ENABLEMENT PERFORMANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Installation Time: 15-30 seconds per server
Configuration Time: 2-5 seconds per server  
Startup Time: 3-8 seconds per server
Total Impact: Minimal (one-time cost)

Resource Usage After Enablement:
CPU Impact: +0.1-0.5% per server
Memory Impact: +15-50MB per server
Disk Impact: +10-25MB per server

Performance Grade: A+ (Negligible impact on development)
```

## File References
- **Server Registry**: `.claude/mcp/config/server-registry.json` - Available servers and installation info
- **User Configuration**: `.claude/mcp/config/user-config.json` - Disabled servers list and preferences  
- **Server Installations**: `.claude/mcp/servers/[server-name]/` - Individual server directories
- **Management Script**: `.claude/mcp/scripts/server-manager.js` - Core enablement logic
- **Environment Setup**: `.env` - Required environment variables for servers

---

## Command Implementation

This command executes the MCP server enablement system by running the implementation script:

```bash
node .claude/mcp/scripts/mcp-enable.js $@
```

When executed in Claude Code, this command:

1. **Parses Arguments**: Extracts server names, categories, and flags from command line
2. **Loads Configuration**: Reads current Claude settings and server registry  
3. **Validates Servers**: Ensures requested servers exist in verified registry
4. **Updates Settings**: Modifies `~/.claude/settings.local.json` with new server configurations
5. **Provides Feedback**: Shows enablement results and next steps

**Example Execution Flow:**
```bash
# User runs: /mcp-enable github-official database-postgres --verbose
# 
# System executes: node .claude/mcp/scripts/mcp-enable.js github-official database-postgres --verbose
#
# Output:
# 🔧 ENABLING MCP SERVERS
# ✅ Configured: github-mcp-server  
# ✅ Configured: enhanced-postgres-mcp-server
# 📁 Settings updated: ~/.claude/settings.local.json
```