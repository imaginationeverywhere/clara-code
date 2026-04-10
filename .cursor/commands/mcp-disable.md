# mcp-disable - Disable MCP Server

**Safely disable and stop MCP (Model Context Protocol) servers with proper cleanup and state preservation**

## Purpose
Disable MCP servers while preserving configurations and data, stop running processes safely, and remove from active workflow integration while maintaining the ability to easily re-enable later.

## Usage
```bash
mcp-disable [server-name]
mcp-disable [server-name] --preserve-config
mcp-disable [server-name] --remove-completely
mcp-disable --category [category-name]
mcp-disable --temporary [duration]
```

## Examples
```bash
mcp-disable docker                    # Disable Docker server
mcp-disable aws --preserve-config     # Disable but keep configuration
mcp-disable mongodb --remove-completely  # Disable and remove installation
mcp-disable --category cloud-deployment  # Disable all cloud servers
mcp-disable github --temporary 1h     # Temporarily disable for 1 hour
```

## Command Behavior

### 1. Standard Server Disablement

#### Safe Disable Process
1. **Graceful Shutdown**: Stop server process with proper cleanup
2. **State Preservation**: Save current configuration and data
3. **Integration Removal**: Remove from active Claude Code integration
4. **User Configuration Update**: Add to disabled servers list
5. **Resource Cleanup**: Free system resources safely
6. **Verification**: Confirm server is properly disabled

#### Example Output
```bash
mcp-disable aws
```

```
DISABLING MCP SERVER: aws
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Server Information:
   Name: @modelcontextprotocol/server-aws
   Status: Currently running (PID: 45231)
   Uptime: 2h 34m
   Category: cloud-deployment
   
⚠️  Pre-disable Checks:
   ✅ No active operations detected
   ✅ No pending requests
   ✅ Safe to disable
   
🛑 Shutdown Process:
   Sending graceful shutdown signal...
   ✅ Server acknowledged shutdown request
   ✅ Completed pending operations
   ✅ Saved server state
   ✅ Process terminated cleanly (exit code: 0)
   
💾 Configuration Preservation:
   ✅ Current configuration backed up
   ✅ Environment variables preserved
   ✅ Connection settings saved
   ✅ Custom settings maintained
   
🔌 Integration Cleanup:
   ✅ Removed from Claude Code active servers
   ✅ Disabled in deployment commands
   ✅ Workflow integration paused
   ✅ Tool access revoked
   
📝 User Configuration Updated:
   ✅ Added 'aws' to disabled servers list
   ✅ Preferences updated
   ✅ Auto-activation disabled for this server
   
✅ SUCCESS: AWS server disabled successfully
   
📊 System Impact:
   CPU freed: 0.4%
   Memory freed: 67MB
   Active processes: Reduced by 1
   
💡 QUICK RE-ENABLE:
   To re-enable: mcp-enable aws
   Configuration will be automatically restored
```

### 2. Preserve Configuration Mode

#### Intelligent State Preservation
When using `--preserve-config`:

```bash
mcp-disable database --preserve-config
```

```
DISABLING DATABASE SERVER (PRESERVING CONFIG)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 Configuration Analysis:
   Database Type: PostgreSQL
   Connection Pool: 8 active connections
   Schema Cache: 15 tables cached
   Query History: 1,247 queries logged
   Custom Settings: 12 user modifications
   
⚠️  Connection Cleanup:
   Draining connection pool...
   ✅ Closed 8 database connections gracefully
   ✅ Committed pending transactions
   ✅ Released database locks
   ✅ Saved query cache to disk
   
💾 Enhanced Preservation:
   ✅ Database connection strings encrypted and saved
   ✅ Schema introspection cache preserved
   ✅ Query performance statistics saved
   ✅ User customizations backed up
   ✅ Migration state recorded
   
🛡️  Security Measures:
   ✅ Sensitive credentials encrypted
   ✅ Connection tokens securely stored
   ✅ Access logs maintained
   ✅ Audit trail preserved
   
✅ DATABASE SERVER DISABLED WITH FULL PRESERVATION
   
📋 Preserved Data:
   • Database schemas and table structures
   • Query performance optimization settings
   • Connection pool configurations
   • Custom query templates
   • Security and access control settings
   
🚀 Quick Restore Available:
   When re-enabled, server will restore to exact previous state
   Estimated restoration time: 5-10 seconds
```

### 3. Complete Removal Mode

#### Thorough Cleanup and Removal
When using `--remove-completely`:

```bash
mcp-disable mongodb --remove-completely
```

```
COMPLETELY REMOVING MONGODB SERVER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  WARNING: This will permanently remove the server and all configurations.
   This action cannot be undone without reinstallation.

🛑 Shutdown and Cleanup:
   ✅ Server process stopped
   ✅ Active connections closed
   ✅ Temporary files cleaned
   ✅ Cache directories cleared
   
🗑️  Complete Removal Process:
   [1/5] Removing server installation...
      ✅ Deleted: .claude/mcp/servers/mongodb/
      ✅ Package cache cleared
      
   [2/5] Removing configurations...
      ✅ Deleted: Server configuration files
      ✅ Deleted: User customizations
      ✅ Deleted: Connection templates
      
   [3/5] Removing logs and data...
      ✅ Deleted: Server log files (mongodb.log)
      ✅ Deleted: Performance metrics
      ✅ Deleted: Error reports
      
   [4/5] Updating system registrations...
      ✅ Removed from Claude Code configuration
      ✅ Removed from auto-detection rules
      ✅ Updated server registry
      
   [5/5] Final cleanup...
      ✅ Registry updated
      ✅ Dependencies cleaned
      ✅ System state normalized
      
✅ MONGODB SERVER COMPLETELY REMOVED
   
📊 System Impact:
   Disk space freed: 28MB
   Configuration entries removed: 15
   System footprint: Eliminated
   
⚠️  IMPORTANT NOTES:
   • Server must be reinstalled to use again: mcp-enable mongodb
   • All custom configurations will need to be recreated
   • This server will not appear in auto-detection until reinstalled
   
💡 Alternative: Consider 'mcp-disable mongodb --preserve-config' 
   for reversible disabling without data loss
```

### 4. Category Disablement

#### Disable Multiple Related Servers
```bash
mcp-disable --category cloud-deployment
```

```
DISABLING CLOUD DEPLOYMENT SERVERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Category: cloud-deployment
   Servers to disable: aws, azure, docker, kubernetes
   
🔍 Impact Assessment:
   aws: ⚠️  Used in deployment commands
   azure: ✅ Not currently in use
   docker: ⚠️  Used in development environment
   kubernetes: ✅ Not actively used
   
⚡ Disabling Servers (Priority Order):
   [1/4] Disabling kubernetes... ✅ Complete (no impact)
   [2/4] Disabling azure... ✅ Complete (no impact)
   [3/4] Disabling docker... ⚠️  Warning issued (see below)
   [4/4] Disabling aws... ⚠️  Warning issued (see below)
   
⚠️  WORKFLOW IMPACT WARNINGS:
   
   docker server disabled:
   • Affected commands: setup-production-environment
   • Alternative: Use local development without containers
   • Impact: Medium (development environment change)
   
   aws server disabled:
   • Affected commands: setup-aws-cli, setup-project-api-deployment
   • Alternative: Manual AWS management
   • Impact: High (deployment workflow affected)
   
📊 Category Disable Summary:
   Successfully disabled: 4/4 servers
   Warnings issued: 2 servers
   System resources freed: 156MB
   
💡 WORKFLOW RECOMMENDATIONS:
   • Update deployment scripts to use manual AWS processes
   • Consider local development setup without Docker
   • Team notification recommended for shared environments
   
✅ CLOUD DEPLOYMENT CATEGORY DISABLED
   
🚀 Quick Category Re-enable:
   mcp-enable --category cloud-deployment
```

### 5. Temporary Disablement

#### Time-Based Automatic Re-enabling
```bash
mcp-disable github --temporary 2h
```

```
TEMPORARILY DISABLING GITHUB SERVER (2 hours)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ Temporary Disable Configuration:
   Duration: 2 hours (120 minutes)
   Auto-enable time: 2025-09-07 23:45:23 UTC
   Reason: Temporary (user requested)
   
🛑 Graceful Shutdown:
   ✅ Server stopped with state preservation
   ✅ All configurations backed up
   ✅ Active operations completed
   ✅ Resources released
   
⏲️  Scheduling System:
   ✅ Auto-enable scheduled for 23:45 UTC
   ✅ Notification system configured
   ✅ Backup timer set (in case of system restart)
   ✅ Health check scheduled for re-enable time
   
📝 Temporary Disable Record:
   Server: github
   Disabled at: 2025-09-07 21:45:23 UTC
   Duration: 2h 0m
   Auto-enable: 2025-09-07 23:45:23 UTC
   Preservation: Full configuration backup
   
✅ GITHUB SERVER TEMPORARILY DISABLED
   
📊 During Disable Period:
   • GitHub integration unavailable in Claude Code
   • Repository operations will use local git only
   • Automated GitHub workflows paused
   • Manual GitHub access unaffected
   
🔔 Notifications:
   • 15 minutes before re-enable: Warning notification
   • At re-enable: Automatic restart notification
   • If re-enable fails: Error notification with manual instructions
   
⚡ MANUAL OVERRIDE OPTIONS:
   Enable early: mcp-enable github
   Extend duration: mcp-disable github --temporary 4h
   Make permanent: mcp-disable github (cancels auto-enable)
```

## Advanced Disablement Features

### Dependency Chain Management
The system analyzes and handles server dependencies:

```
DEPENDENCY IMPACT ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Disabling: database server

Dependent Servers Analysis:
✅ testing server: Can operate independently
⚠️  api server: May lose database query capabilities
⚠️  graphql server: Will lose schema introspection

Dependent Commands Analysis:
⚠️  process-todos: Database logging will be disabled
⚠️  spec-workflow: Database schema generation affected
✅ git-commit-docs-command: Not affected

RECOMMENDATION:
Consider disabling dependent servers first, or use --cascade option:
mcp-disable database --cascade

CASCADE OPTIONS:
• --cascade-disable: Also disable dependent servers
• --cascade-warn: Show warnings but continue
• --cascade-abort: Abort if dependencies exist (default)
```

### Safe Mode Protections
Critical servers have additional protections:

```
SAFE MODE PROTECTION ACTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Server: filesystem (development-core)
Protection Level: HIGH (Core Development Server)

⚠️  WARNING: This server is essential for Claude Code operation

Impact Assessment:
❌ Critical: File operations will be severely limited
❌ Critical: Code editing and management affected  
❌ Critical: Project navigation compromised

OVERRIDE REQUIRED:
To disable a core server, use: --force-disable
Example: mcp-disable filesystem --force-disable

ALTERNATIVES:
• Configure restricted access instead: mcp-configure filesystem --restrict
• Temporarily limit scope: mcp-configure filesystem --scope ./src/
• Disable specific features only: mcp-configure filesystem --readonly

RECOMMENDATION: Core servers should remain enabled for optimal development experience
```

### Cleanup Verification
After disabling, the system verifies proper cleanup:

```
CLEANUP VERIFICATION REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Server: docker (disabled)
Verification Time: 30 seconds post-disable

✅ Process Termination:
   • Server process (PID 12345) terminated cleanly
   • No zombie processes detected
   • Child processes properly cleaned up
   • Port 8080 released and available

✅ Resource Cleanup:
   • Memory freed: 89MB
   • CPU usage reduced: 0.6%
   • File handles closed: 15
   • Network connections closed: 3

✅ File System Cleanup:
   • Temporary files removed: 12 files, 4.2MB
   • Log rotation completed
   • Cache directories cleaned
   • Lock files removed

✅ Integration Cleanup:
   • Removed from Claude Code server list
   • Integration hooks disabled
   • Command associations updated
   • Tool registry updated

✅ Configuration Preservation:
   • Settings backed up to: .claude/mcp/config/disabled/docker.backup
   • User preferences preserved
   • Custom configurations maintained
   • Environment variables secured

VERIFICATION RESULT: ✅ COMPLETE AND CLEAN
```

## Workflow Integration and Impact

### Development Workflow Impact Assessment
```
WORKFLOW IMPACT ASSESSMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Disabled Server: aws
Impact Analysis:

HIGH IMPACT COMMANDS:
❌ setup-aws-cli: Will not function without AWS server
❌ setup-project-api-deployment: AWS deployment unavailable  
❌ amplify-deploy-production: Direct AWS operations affected

MEDIUM IMPACT COMMANDS:
⚠️  process-todos: Cloud deployment tasks may show warnings
⚠️  spec-workflow: AWS-related specifications affected
⚠️  create-jira-plan-todo: Cloud deployment epics limited

LOW IMPACT COMMANDS:
✅ git-commit-docs-command: Not affected
✅ sync-jira: Not affected
✅ create-plan-todo: Local planning unaffected

WORKAROUND SUGGESTIONS:
• Use manual AWS CLI commands instead of integrated server
• Modify PRD.md to use different cloud provider temporarily  
• Focus on local development until AWS server re-enabled
• Use alternative deployment methods (manual upload, CI/CD)

TEAM COORDINATION:
• Notify team members of AWS integration changes
• Update deployment documentation with manual steps
• Consider shared AWS server on dedicated development machine
```

### Auto-Detection Impact
```
AUTO-DETECTION IMPACT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Disabled Server: github
Auto-Detection Changes:

✅ Detection will continue to identify GitHub repositories
⚠️  Auto-enablement of GitHub server will be skipped
⚠️  New team members may need manual GitHub server setup
ℹ️  Detection logs will note server is "user-disabled"

Project Analysis Impact:
• PRD.md GitHub references: Will be noted but not acted upon
• .github/ directory: Detected but GitHub server remains disabled
• Git remote analysis: Will identify GitHub but won't activate server

Override Options:
• Re-enable for auto-detection: mcp-enable github --auto-detect-only
• Exclude from auto-detection: mcp-configure auto-detect --exclude github
• Temporary auto-detection skip: Automatically handled during disable period
```

## Troubleshooting and Recovery

### Failed Disable Recovery
```
DISABLE FAILURE RECOVERY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Issue: Server failed to stop gracefully
Server: testing (PID 98765)

RECOVERY ACTIONS TAKEN:
[1] Graceful shutdown attempt: ❌ Failed (timeout after 30s)
[2] Force termination (SIGTERM): ❌ Failed (process unresponsive)  
[3] Forced kill (SIGKILL): ✅ Success
[4] Process cleanup: ✅ Complete
[5] Resource recovery: ✅ Complete

POST-RECOVERY VERIFICATION:
✅ Process terminated (confirmed via ps)
✅ Port 8081 released and available
✅ Memory freed (142MB recovered)
✅ Temporary files cleaned
✅ Server marked as disabled in configuration

WARNING LOG CREATED:
Location: .claude/mcp/logs/disable-failure-testing-20250907.log
Contains: Detailed failure analysis and recovery steps taken

PREVENTION RECOMMENDATIONS:
• Server may have been overloaded - consider resource limits
• Check for infinite loops in server code
• Monitor server health before disable attempts
• Consider gradual resource reduction before disable

SYSTEM STATUS: ✅ Recovered and stable
```

### State Corruption Recovery
```
STATE CORRUPTION DETECTION AND RECOVERY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Issue Detected: Configuration file corruption during disable
Server: memory
Corruption Type: Invalid JSON in config file

AUTOMATIC RECOVERY PROCESS:
[1] Backup validation: ✅ Valid backup found (30 minutes old)
[2] Corrupted file quarantine: ✅ Moved to quarantine directory
[3] Backup restoration: ✅ Configuration restored from backup
[4] Integrity verification: ✅ Restored configuration valid
[5] Server state reset: ✅ Clean disable state confirmed

CORRUPTION ANALYSIS:
• Cause: Disk write interruption during config save
• Impact: Temporary (recovered within 15 seconds)
• Data loss: None (backup was recent)
• Prevention: Atomic write operations now enforced

QUARANTINED FILE:
Location: .claude/mcp/quarantine/memory-config-corrupt-20250907.json
Purpose: Available for forensic analysis if needed

RECOVERY RESULT: ✅ COMPLETE - No data loss, clean disable achieved
```

## Best Practices and Recommendations

### When to Disable Servers
```
SERVER DISABLE DECISION MATRIX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RECOMMENDED TO DISABLE:
✅ Unused cloud servers (aws, azure, gcp) when not deploying
✅ Language-specific servers when not using that language
✅ Testing servers during non-development periods
✅ Resource-intensive servers on low-spec machines
✅ Experimental servers after evaluation period

RECOMMENDED TO KEEP ENABLED:
⭐ Core servers: filesystem, git, memory
⭐ Project-specific servers: database (if using database)
⭐ Team collaboration servers: github (if using GitHub)
⭐ Development workflow servers: http, testing

SITUATIONAL:
🤔 code-execution: Disable for security, enable for development
🤔 docker: Disable for local dev, enable for container deployment
🤔 monitoring servers: Disable for privacy, enable for optimization

PERFORMANCE GUIDELINES:
• Monitor total resource usage: mcp-status --detailed
• Disable servers using >50MB when not needed
• Keep CPU usage under 2% total for all servers
• Prioritize workflow integration over resource savings
```

### Team Coordination Best Practices
```bash
# Share current server configuration
mcp-status --export-config > team-mcp-setup.json

# Document disabled servers for team
mcp-disable mongodb --document "Not using MongoDB in current sprint"

# Coordinate temporary disables  
mcp-disable aws --temporary 4h --notify-team "Maintenance window"

# Re-enable shared servers for team work
mcp-enable github database testing
```

## File References
- **User Configuration**: `.claude/mcp/config/user-config.json` - Disabled servers list and preferences
- **Backup Directory**: `.claude/mcp/config/disabled/` - Configuration backups for disabled servers
- **Server Directories**: `.claude/mcp/servers/` - Individual server installations (preserved unless --remove-completely)
- **Disable Logs**: `.claude/mcp/logs/disable-*.log` - Detailed disable operation logs
- **Management Script**: `.claude/mcp/scripts/server-manager.js` - Core disable logic and recovery procedures

---

## Command Implementation

This command executes the MCP server disablement system by running the implementation script:

```bash
node .claude/mcp/scripts/mcp-disable.js $@
```

When executed in Claude Code, this command:

1. **Parses Arguments**: Extracts server names, categories, and flags from command line
2. **Loads Configuration**: Reads current Claude settings and server registry
3. **Validates Safety**: Protects critical servers from accidental disablement  
4. **Preserves Configuration**: Backs up server configs for future re-enabling
5. **Updates Settings**: Removes servers from `~/.claude/settings.local.json`
6. **Provides Feedback**: Shows disablement results and recovery options

**Example Execution Flow:**
```bash
# User runs: /mcp-disable http database-postgres --verbose
# 
# System executes: node .claude/mcp/scripts/mcp-disable.js http database-postgres --verbose
#
# Output:
# 🔇 DISABLING MCP SERVERS
# ✅ Disabled: @modelcontextprotocol/server-fetch
# ✅ Disabled: enhanced-postgres-mcp-server  
# 📁 Configurations preserved for future re-enabling
```