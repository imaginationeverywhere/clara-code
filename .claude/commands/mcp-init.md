# mcp-init - Initialize MCP Server System

**Complete MCP (Model Context Protocol) server initialization for Claude Code with automatic installation, configuration, and intelligent activation based on project context**

## Purpose
Initialize the complete MCP server management system for Claude Code boilerplate, automatically configuring all 39 MCP servers in the user's global Claude settings (~/.claude/settings.local.json) based on project analysis and intelligent detection.

## Implementation
This command executes the MCP initialization script that configures MCP servers directly in the user's Claude settings file.

## Usage
```bash
mcp-init
mcp-init --client claude
mcp-init --full-install
mcp-init --minimal
mcp-init --project-analysis
```

## Examples
```bash
mcp-init                        # Standard initialization with project analysis
mcp-init --client claude        # Initialize specifically for Claude Code client
mcp-init --full-install         # Install all available servers
mcp-init --minimal              # Install only core development servers
mcp-init --project-analysis     # Show analysis without installing
```

## Command Behavior

### 1. Standard Initialization

#### Complete System Setup Process
1. **System Requirements Check**: Verify Node.js, npm, and Claude Code compatibility
2. **Directory Structure Creation**: Set up MCP management directories
3. **Project Context Analysis**: Analyze PRD.md, package.json, and filesystem
4. **Server Selection**: Choose optimal servers based on analysis
5. **Automatic Installation**: Install and configure selected servers
6. **Claude Code Integration**: Configure MCP servers in Claude Code settings
7. **Health Verification**: Test all installed servers
8. **Documentation Generation**: Create usage guides and quick reference

#### Example Standard Initialization
```bash
mcp-init
```

```
🤖 INITIALIZING MCP SERVER SYSTEM FOR CLAUDE CODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Claude Code Boilerplate v1.6.0 - MCP Integration

🔍 SYSTEM REQUIREMENTS CHECK
✅ Node.js v20.2.0 (compatible)
✅ npm v9.6.4 (compatible)  
✅ Claude Code environment detected
✅ Project root identified: /Users/dev/my-project/
✅ Boilerplate structure validated

📁 SETTING UP MCP INFRASTRUCTURE
✅ Created: .claude/mcp/servers/
✅ Created: .claude/mcp/config/
✅ Created: .claude/mcp/logs/
✅ Created: .claude/mcp/templates/
✅ Generated: Server registry and configuration files

🔍 PROJECT CONTEXT ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 PRD Analysis (docs/PRD.md):
✅ Technology Stack: Next.js, Express, PostgreSQL, AWS
✅ Mockup Template: retail (e-commerce focus)
✅ Authentication: Clerk integration
✅ Deployment: AWS Amplify + EC2

📦 Package Dependencies Analysis:
✅ Database: sequelize, pg (PostgreSQL)
✅ Cloud Services: @aws-sdk, aws-amplify
✅ Testing: jest, playwright
✅ Version Control: Git repository detected

📁 Filesystem Analysis:
✅ Found: .git/ (Git repository)
✅ Found: .github/ (GitHub workflows)  
✅ Found: package.json (Node.js project)
✅ Found: backend/models/ (Database models)
✅ Missing: Dockerfile (containerization not detected)

🎯 SERVER RECOMMENDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ESSENTIAL SERVERS (Auto-install):
✅ filesystem - Secure file operations (REQUIRED)
✅ git - Repository management (REQUIRED) 
✅ memory - Cross-session context storage (REQUIRED)

PROJECT-SPECIFIC SERVERS (Detected):
🔧 database - PostgreSQL integration (detected in PRD + packages)
🔧 aws - Cloud resource management (detected in PRD + AWS packages)
🔧 http - API testing capabilities (detected API references)
🔧 github - GitHub integration (detected .github/ directory)
🔧 testing - Test execution (detected test frameworks)

⚠️  SERVERS REQUIRING CONFIGURATION:
• database: Needs DATABASE_URL environment variable
• aws: Needs AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
• github: Needs GITHUB_PERSONAL_ACCESS_TOKEN

📦 INSTALLING MCP SERVERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[1/8] Installing filesystem server...
   📥 Downloading @modelcontextprotocol/server-filesystem@latest
   ✅ Installation complete (24.3s)
   ⚙️  Configured with project-specific security settings
   
[2/8] Installing git server...
   📥 Downloading @modelcontextprotocol/server-git@latest  
   ✅ Installation complete (18.7s)
   ⚙️  Configured with repository integration
   
[3/8] Installing memory server...
   📥 Downloading @modelcontextprotocol/server-memory@latest
   ✅ Installation complete (12.1s)
   ⚙️  Configured with session persistence
   
[4/8] Installing database server...
   📥 Downloading @modelcontextprotocol/server-postgres@latest
   ✅ Installation complete (31.4s)
   ⚠️  Configuration incomplete - DATABASE_URL required
   
[5/8] Installing aws server...
   📥 Downloading @modelcontextprotocol/server-aws@latest
   ✅ Installation complete (28.9s)
   ⚠️  Configuration incomplete - AWS credentials required
   
[6/8] Installing http server...
   📥 Downloading @modelcontextprotocol/server-fetch@latest
   ✅ Installation complete (15.2s)
   ✅ Ready for API testing
   
[7/8] Installing github server...
   📥 Downloading @modelcontextprotocol/server-github@latest
   ✅ Installation complete (22.8s)
   ⚠️  Configuration incomplete - GitHub token required
   
[8/8] Installing testing server...
   📥 Downloading @modelcontextprotocol/server-testing@latest
   ✅ Installation complete (19.6s)
   ✅ Auto-configured for Jest and Playwright

🔗 CLAUDE CODE INTEGRATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚙️  Updating Claude Code settings (.claude/settings.local.json)...
✅ Added MCP server configurations
✅ Configured filesystem server with project scope
✅ Configured git server with repository access
✅ Configured memory server with session persistence
✅ Set up server auto-activation rules
✅ Integrated with boilerplate command system

🚀 STARTING ESSENTIAL SERVERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Starting core development servers...
🟢 filesystem server: Started (PID 12345) ✅ Healthy
🟢 git server: Started (PID 12346) ✅ Healthy  
🟢 memory server: Started (PID 12347) ✅ Healthy
🟢 http server: Started (PID 12348) ✅ Healthy
🟢 testing server: Started (PID 12349) ✅ Healthy

⏸️  Pending configuration:
🟡 database server: Installed, awaiting DATABASE_URL
🟡 aws server: Installed, awaiting AWS credentials  
🟡 github server: Installed, awaiting GitHub token

🎉 MCP INITIALIZATION COMPLETE!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 INSTALLATION SUMMARY:
✅ Successfully installed: 8/8 servers
✅ Fully configured and running: 5/8 servers
⚠️  Awaiting manual configuration: 3/8 servers
💾 Total disk usage: 89MB
🏃 Active server processes: 5
⚡ System resource impact: <1% CPU, 127MB RAM

🔧 CONFIGURATION NEEDED:
Add these environment variables to complete setup:

.env file:
DATABASE_URL=postgresql://username:password@localhost:5432/dbname
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret  
GITHUB_PERSONAL_ACCESS_TOKEN=your_github_token

After adding variables, run:
mcp-enable database aws github

🚀 READY TO USE:
• Claude Code now has MCP server integration
• Use 'mcp-status' to view current status
• Servers will auto-activate based on your development work
• All boilerplate commands enhanced with MCP capabilities

💡 QUICK START:
process-todos    # Now enhanced with MCP server context
spec-workflow    # Specifications can use MCP server data  
git-commit-docs-command  # Git operations via MCP server
```

### 2. Claude Code Specific Initialization

#### Optimized for Claude Code Client
```bash
mcp-init --client claude
```

```
🤖 CLAUDE CODE OPTIMIZED INITIALIZATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 CLAUDE CODE INTEGRATION FOCUS
Optimizing MCP server selection and configuration specifically for Claude Code workflows

📋 CLAUDE CODE COMPATIBILITY ANALYSIS:
✅ Claude Code version: Compatible
✅ MCP protocol version: Latest supported
✅ Configuration format: Claude Code native
✅ Tool integration: Full compatibility verified

⚙️  CLAUDE-SPECIFIC OPTIMIZATIONS:
🔧 Server startup: Optimized for Claude Code boot sequence
🔧 Memory management: Tuned for Claude Code resource usage
🔧 Tool integration: Enhanced Claude Code tool registration
🔧 Context sharing: Optimized for Claude Code context windows
🔧 Security policies: Aligned with Claude Code security model

📦 INSTALLING CLAUDE-OPTIMIZED SERVERS:
[Core] filesystem, git, memory - Enhanced for Claude Code
[Context] http, database - Optimized data access patterns
[Integration] github, testing - Streamlined for Claude workflows

🔗 CLAUDE CODE SETTINGS INTEGRATION:
✅ Created optimized .claude/settings.local.json
✅ Configured MCP servers with Claude-specific parameters
✅ Set up automatic tool registration
✅ Enabled context-aware server activation
✅ Integrated with Claude Code command system

✅ CLAUDE CODE OPTIMIZATION COMPLETE!
Your MCP servers are now perfectly tuned for Claude Code development workflows.
```

### 3. Full Installation Mode

#### Install All Available Servers
```bash
mcp-init --full-install
```

```
📦 FULL MCP SERVER INSTALLATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 INSTALLING ALL AVAILABLE SERVERS
This will install every MCP server in the registry for maximum functionality.

📊 INSTALLATION SCOPE:
Development Core: filesystem, git, memory
Database Integration: postgres, sqlite, mongodb  
API Integration: http, graphql, rest
Cloud Deployment: aws, azure, gcp, docker
Infrastructure: kubernetes, terraform
Development Tools: github, gitlab, bitbucket
Quality Assurance: testing, linting, security, performance
Specialized: code-execution, documentation, monitoring

⚠️  RESOURCE REQUIREMENTS:
Estimated disk usage: 280MB
Estimated memory usage: 450MB  
Estimated startup time: 180 seconds
Configuration complexity: High

📦 INSTALLING 24 SERVERS...
[Progress bar and installation details for each server]

✅ FULL INSTALLATION COMPLETE!
All MCP servers installed and available for activation.
Use 'mcp-status --category [category]' to manage by category.
Use 'mcp-enable --auto-detect' to activate relevant servers only.
```

### 4. Minimal Installation Mode

#### Essential Servers Only
```bash
mcp-init --minimal
```

```
⚡ MINIMAL MCP INSTALLATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 INSTALLING CORE SERVERS ONLY
Minimal footprint installation with essential development capabilities.

📦 MINIMAL SERVER SET:
✅ filesystem - Essential file operations
✅ git - Version control integration  
✅ memory - Session context storage

📊 MINIMAL FOOTPRINT:
Disk usage: 28MB
Memory usage: 89MB
Startup time: 15 seconds
Configuration: Automatic

✅ MINIMAL INSTALLATION COMPLETE!
Core development servers ready. Use 'mcp-enable' to add more servers as needed.
```

### 5. Project Analysis Mode

#### Show Analysis Without Installing
```bash
mcp-init --project-analysis
```

```
🔍 PROJECT ANALYSIS FOR MCP SERVER SELECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This analysis shows what MCP servers would be recommended for your project
without performing any installations.

📋 PROJECT CONTEXT ANALYSIS:
Technology Stack: Next.js + Express + PostgreSQL
Cloud Platform: AWS (Amplify + EC2)
Team Size: 3-5 developers  
Development Stage: Production setup
Mockup Template: E-commerce (retail)

🎯 SERVER RECOMMENDATIONS:

ESSENTIAL (Always recommended):
✅ filesystem - File operations and project navigation
✅ git - Version control integration
✅ memory - Cross-session context and patterns

HIGH PRIORITY (Strong indicators):
🔥 database - PostgreSQL detected in PRD and packages
🔥 aws - AWS services detected in configuration
🔥 github - GitHub workflows and repository detected
🔥 http - API testing for backend development

MEDIUM PRIORITY (Some indicators):
🔧 testing - Test frameworks detected in package.json
🔧 docker - May be useful for production deployment

LOW PRIORITY (Optional):
⚪ code-execution - Useful for development debugging
⚪ monitoring - Good for production optimization

NOT RECOMMENDED (No indicators):
❌ azure, gcp - AWS already selected
❌ mongodb - PostgreSQL already selected
❌ gitlab - GitHub already detected

📊 ANALYSIS SUMMARY:
Total servers available: 20
Recommended for installation: 8  
Essential servers: 3
Configuration required: 3 (database, aws, github)
Estimated setup time: 90 seconds + manual configuration

💡 NEXT STEPS:
Run 'mcp-init' to proceed with recommended installation
Or use 'mcp-init --minimal' for core servers only
Or use 'mcp-init --full-install' for maximum functionality
```

## Advanced Configuration Options

### Environment Detection and Setup
The initialization process automatically detects and configures environment requirements:

```
🔍 ENVIRONMENT CONFIGURATION DETECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

.env File Analysis:
✅ DATABASE_URL found - Database server will be fully configured
❌ AWS_ACCESS_KEY_ID missing - AWS server needs manual configuration
❌ GITHUB_PERSONAL_ACCESS_TOKEN missing - GitHub server needs manual setup

System Environment Check:
✅ NODE_ENV=development detected
✅ PATH includes Node.js binaries
⚠️  No global AWS CLI configuration found

Configuration Assistance:
🔧 Created .env.example with required variables
🔧 Generated configuration guides in .claude/mcp/docs/
🔧 Set up auto-detection for when variables become available

RECOMMENDATION:
Complete the .env file setup, then run 'mcp-enable --auto-detect' 
to automatically configure servers with newly available credentials.
```

### Integration with Existing Boilerplate Systems

#### PRD Integration
```
📋 PRD-DRIVEN SERVER CONFIGURATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Reading project context from docs/PRD.md:

Technology Stack Integration:
✅ Next.js → Enhanced filesystem server for component development
✅ Express.js → HTTP server for API testing and validation
✅ PostgreSQL → Database server with Sequelize integration
✅ Clerk Auth → GitHub server for authentication workflow integration
✅ AWS Deployment → AWS server for cloud resource management

Mockup Template Integration:
📱 Template: retail (e-commerce)
🔧 Configured servers for e-commerce development patterns:
   • Database server: Product, Order, User models expected
   • HTTP server: Payment API testing capabilities
   • AWS server: S3 for product images, Lambda for processing

Business Requirements Integration:
🎯 Team size: 3-5 developers → GitHub server for collaboration
🎯 Performance targets → Monitoring server capabilities enabled
🎯 Security requirements → Enhanced security policies applied
```

#### Workflow Integration
```
🔗 BOILERPLATE WORKFLOW INTEGRATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Command Enhancement:
✅ process-todos → Enhanced with MCP server context
✅ spec-workflow → Specifications can access MCP server data
✅ git-commit-docs-command → Git operations via MCP server  
✅ create-plan-todo → Memory server for pattern storage
✅ sync-jira → GitHub server for issue synchronization

Agent Coordination:
✅ All 22 specialized agents can now use MCP server capabilities
✅ TypeScript agents → Code execution server for validation
✅ Database agents → Direct database server integration
✅ AWS agents → Cloud resource server for infrastructure
✅ Testing agents → Testing server for automated execution

JIRA Integration:
✅ GitHub server → Enhanced GitHub issue creation
✅ Memory server → Todo pattern recognition and suggestions
✅ Database server → Project metrics and progress tracking
```

## Error Handling and Recovery

### Installation Failure Recovery
```
❌ INSTALLATION FAILURE RECOVERY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Issue: Network timeout during aws server installation
Recovery Actions:
[1] Detected network interruption
[2] Implemented exponential backoff retry
[3] Switched to mirror repository  
[4] Successfully completed installation on retry #2

Partial Installation Recovery:
✅ Completed servers: filesystem, git, memory, http
⚡ Retrying failed: aws, database, github
🔄 Retry successful: 3/3 servers recovered

FINAL STATUS: ✅ All servers installed successfully
Recovery time: 45 seconds
No manual intervention required
```

### Configuration Validation
```
🔍 POST-INSTALLATION VALIDATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Health Check Results:
✅ filesystem server: Responding, 15ms latency
✅ git server: Responding, 8ms latency  
✅ memory server: Responding, 3ms latency
✅ http server: Responding, 12ms latency
⚠️  database server: Not configured (needs DATABASE_URL)
⚠️  aws server: Not configured (needs credentials)
⚠️  github server: Not configured (needs token)

Configuration Validation:
✅ All server config files valid JSON
✅ Security policies properly applied
✅ Claude Code integration verified
✅ Auto-activation rules configured

System Integration Test:
✅ MCP protocol communication verified
✅ Tool registration successful
✅ Context sharing operational
✅ Command integration functional

VALIDATION RESULT: ✅ PASSED
Ready for development use with 5/8 servers fully operational.
```

## Usage in Development Workflow

### Integration with Boilerplate Commands
```bash
# Initialize MCP servers before starting development
mcp-init --client claude

# Start development with enhanced capabilities
process-todos    # Now with MCP server context
spec-workflow Build user authentication system  # Can access file system and git

# Deploy with cloud integration
mcp-enable aws
setup-project-api-deployment  # Enhanced with AWS MCP server
```

### Team Setup Workflow
```bash
# Team lead initializes standard configuration  
mcp-init --full-install
mcp-status --export-config > team-mcp-setup.json

# Team members use standard setup
mcp-init --config team-mcp-setup.json
mcp-enable --team-standard
```

## Performance and Resource Management

### Resource Usage Optimization
```
📊 RESOURCE USAGE OPTIMIZATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Installation Optimization:
🔧 Parallel server installation reduces setup time by 60%
🔧 Incremental dependency resolution saves 89MB disk space  
🔧 Smart caching reduces repeat installations by 95%

Runtime Optimization:
🔧 Lazy server activation - servers start only when needed
🔧 Resource pooling - shared memory for similar operations
🔧 Connection reuse - database and API connections optimized

Performance Monitoring:
📈 Server startup time: 3.2s average (target: <5s)
📈 Memory footprint: 127MB total (target: <200MB)
📈 CPU usage: <1% at idle (target: <2%)
📈 Response latency: 8ms average (target: <20ms)

Grade: A+ (Excellent performance profile)
```

## File References and Integration

### Generated File Structure
After initialization, the following structure is created:

```
.claude/mcp/
├── config/
│   ├── server-registry.json       # Available servers and metadata
│   ├── auto-config.json          # Auto-detection and activation rules  
│   └── user-config.json          # User preferences and disabled servers
├── servers/
│   ├── filesystem/               # Individual server installations
│   ├── git/
│   ├── memory/
│   └── [other-servers]/
├── logs/
│   ├── auto-install.log          # Installation log
│   ├── manager.log               # Management operations log
│   └── [server-name].log         # Individual server logs
├── scripts/
│   ├── server-manager.js         # Core management system
│   ├── auto-install.sh           # Installation automation
│   └── health-monitor.js         # Health checking and monitoring
└── docs/
    ├── QUICK-START.md            # Getting started guide
    ├── SERVER-GUIDE.md           # Individual server documentation
    └── TROUBLESHOOTING.md        # Common issues and solutions
```

### Claude Code Integration Files
```
.claude/
├── settings.local.json           # MCP server configurations for Claude Code
└── commands/
    ├── mcp-status.md            # Server status and management
    ├── mcp-enable.md            # Server enablement  
    ├── mcp-disable.md           # Server disablement
    └── mcp-init.md              # System initialization (this file)
```

## Next Steps After Initialization

### Immediate Actions
1. **Configure Environment Variables**: Complete .env file setup for database, AWS, and GitHub servers
2. **Test MCP Integration**: Run `mcp-status --health-check` to verify all servers
3. **Explore Enhanced Commands**: Try `process-todos` and `spec-workflow` with new MCP capabilities
4. **Team Coordination**: Share MCP configuration with team members

### Ongoing Management
1. **Regular Health Checks**: Use `mcp-status` to monitor server health
2. **Server Management**: Enable/disable servers as project needs change
3. **Performance Monitoring**: Monitor resource usage and optimize as needed
4. **Updates**: Keep MCP servers updated with latest versions

The MCP initialization system provides a comprehensive, intelligent foundation for enhanced Claude Code development workflows with automatic server management and project-context-aware configuration.

---

## Command Implementation

This command executes the MCP server initialization system by running the implementation script:

```bash
node .claude/mcp/scripts/mcp-init.js $@
```

When executed in Claude Code, this command:

1. **System Requirements Check**: Validates Node.js, Claude Code environment
2. **Project Analysis**: Analyzes PRD.md, package.json, filesystem for context
3. **Server Selection**: Chooses optimal servers based on installation profile and detection
4. **Claude Configuration**: Updates `~/.claude/settings.local.json` with verified server configurations  
5. **Completion Summary**: Shows configured servers and next steps

**Example Execution Flow:**
```bash
# User runs: /mcp-init --standard --verbose
# 
# System executes: node .claude/mcp/scripts/mcp-init.js --standard --verbose
#
# Output:
# 🤖 INITIALIZING MCP SERVER SYSTEM FOR CLAUDE CODE
# 📦 Loaded verified server registry: 20 verified servers available
# ✅ Successfully configured: 5 MCP servers
# 📁 Settings file: ~/.claude/settings.local.json
# ✨ Enhanced capabilities now available in Claude Code!
```