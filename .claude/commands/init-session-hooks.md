# init-session-hooks

**Purpose**: Initialize session startup hooks for automatic boilerplate update checking and telemetry reporting in existing Quik Nation AI Boilerplate projects

**Context**: This command sets up the session hook system that enables automatic update detection and telemetry collection at the start of every Claude session. It configures the project for seamless integration with the boilerplate-update-manager agent.

## Command Usage

```bash
init-session-hooks                    # Initialize with default settings
init-session-hooks --enable-all      # Enable all features (updates + telemetry)
init-session-hooks --updates-only    # Enable only update checking
init-session-hooks --telemetry-only  # Enable only telemetry reporting
init-session-hooks --disable-all     # Disable session hooks
init-session-hooks --check-status    # Show current hook configuration
init-session-hooks --workspace       # Initialize all projects in workspace
init-session-hooks --force           # Force reinitialize existing configuration
```

## Core Functionality

### 1. **Session Hook Configuration Setup**
Creates or updates `.claude/session-hooks.json` with appropriate settings:

```json
{
  "session": {
    "startup": {
      "enabled": true,
      "hooks": [
        {
          "name": "boilerplate-update-check",
          "agent": "boilerplate-update-manager", 
          "priority": 1,
          "mandatory": true,
          "description": "Check for boilerplate updates and report telemetry",
          "failureMode": "continue-silently",
          "maxExecutionTime": 10000,
          "conditions": {
            "hasBoilerplate": true
          }
        }
      ]
    },
    "telemetry": {
      "enabled": true,
      "remoteRepository": "git@github.com:imaginationeverywhere/quik-nation-ai-boilerplate.git",
      "collectUsageData": true,
      "collectPerformanceData": true,
      "collectErrorData": true,
      "anonymizeData": true,
      "reportingInterval": "session-start"
    },
    "updateChecking": {
      "enabled": true,
      "checkFrequency": "session-start",
      "remoteRepository": "git@github.com:imaginationeverywhere/quik-nation-ai-boilerplate.git",
      "timeout": 5000,
      "retryAttempts": 2,
      "offlineMode": "graceful-fallback"
    }
  },
  "version": "1.0.0",
  "lastUpdated": "2025-08-08T00:00:00Z"
}
```

### 2. **Project Detection and Validation**
Identifies eligible projects for session hook installation:

```
Boilerplate Project Detection:
✅ .claude/ directory exists
✅ .claude/commands/update-boilerplate.md found
✅ Boilerplate structure detected (monorepo or single workspace)
✅ Compatible with session hook system

Project Type: Full Monorepo
Workspaces: frontend (Next.js), backend (Express.js)
Estimated Setup Time: 30 seconds
```

### 3. **Manifest Integration**
Updates or creates `.boilerplate-manifest.json` to track session hook status:

```json
{
  "version": "1.0.0",
  "projectType": "full-monorepo",
  "workspaces": ["frontend", "backend"],
  "sessionHooks": {
    "enabled": true,
    "installedVersion": "1.0.0",
    "installedDate": "2025-08-08T00:00:00Z",
    "lastUpdateCheck": null,
    "updateCheckFrequency": "session-start"
  },
  "telemetry": {
    "enabled": true,
    "anonymized": true,
    "lastReported": null
  }
}
```

### 4. **Interactive Setup Workflow**

```
🔧 Quik Nation AI Boilerplate Session Hooks Initialization
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Project: MyProject
📍 Location: /path/to/project
🏗️  Type: Full Monorepo (frontend + backend)

🎯 Session Hook Features:
[✓] Automatic update checking on session start
[✓] Telemetry reporting for boilerplate improvement
[✓] Integration with boilerplate-update-manager agent
[✓] Multi-project portfolio support

📊 Privacy & Data Collection:
• Usage analytics: Command frequency, feature adoption
• Performance metrics: Session startup times, error rates  
• Deployment patterns: AWS services, database configs
• All data is anonymized and helps improve the boilerplate

⚠️  Note: You can disable telemetry anytime while keeping update checks

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎛️  Configuration Options:
[1] Full setup (recommended) - Updates + telemetry
[2] Updates only - Just update checking
[3] Minimal setup - Basic configuration only
[4] Custom configuration - Manual setup
[5] Skip setup - Don't initialize hooks

Choose option [1-5]: 1

✅ Session hooks initialized successfully!
🚀 Your next Claude session will automatically check for updates.

Next steps:
• Start a new Claude session to test automatic checking
• Run 'init-session-hooks --check-status' to verify setup
• Use 'update-boilerplate --check' to manually check for updates
```

### 5. **Workspace-Wide Initialization**
For developers with multiple boilerplate projects:

```bash
# Scan workspace for boilerplate projects
init-session-hooks --workspace /Users/amenra/Projects

# Results:
🔍 Scanning workspace for Quik Nation AI Boilerplate projects...

Found 4 boilerplate projects:
├── ✅ quikaction (session hooks: not configured)
├── ✅ dreamihaircare (session hooks: not configured)  
├── ✅ pink-collar-contractors (session hooks: configured v1.0.0)
└── 📦 quik-nation-ai-boilerplate (source repository - skipping)

🎯 Initialize session hooks for 2 projects?
[y/N]: y

✅ Initialized session hooks for:
  • quikaction
  • dreamihaircare

🚀 All projects now configured for automatic update checking!
```

## Configuration Templates

### Default Configuration
```json
{
  "session": {
    "startup": {
      "enabled": true,
      "showNotifications": true,
      "silentMode": false
    },
    "telemetry": {
      "enabled": true,
      "level": "standard"
    },
    "updateChecking": {
      "enabled": true,
      "frequency": "session-start"
    }
  }
}
```

### Updates Only Configuration
```json
{
  "session": {
    "startup": {
      "enabled": true,
      "showNotifications": true,
      "silentMode": false
    },
    "telemetry": {
      "enabled": false
    },
    "updateChecking": {
      "enabled": true,
      "frequency": "session-start"
    }
  }
}
```

### Minimal Configuration
```json
{
  "session": {
    "startup": {
      "enabled": true,
      "showNotifications": false,
      "silentMode": true
    },
    "telemetry": {
      "enabled": false
    },
    "updateChecking": {
      "enabled": true,
      "frequency": "weekly"
    }
  }
}
```

## Integration Steps

### 1. **Environment Preparation**
- Validate project structure and boilerplate compatibility
- Check write permissions for configuration files
- Verify network connectivity for remote repository access
- Ensure Claude Code can execute session hooks

### 2. **Configuration File Creation**
- Generate `.claude/session-hooks.json` with appropriate settings
- Update `.boilerplate-manifest.json` with hook metadata
- Create backup of existing configurations if present
- Set up proper file permissions and .gitignore entries

### 3. **Agent Integration**
- Verify `boilerplate-update-manager.md` agent is available
- Configure agent activation triggers and parameters
- Set up session startup handler integration
- Test agent communication and authority transfer

### 4. **Validation and Testing**
- Perform dry-run of session startup sequence
- Test update checking against remote repository
- Validate telemetry collection and anonymization
- Verify graceful failure handling for network issues

## Security and Privacy Configuration

### Data Collection Settings
```json
{
  "telemetry": {
    "collectUsageData": true,        // Command usage patterns
    "collectPerformanceData": true,  // Session performance metrics
    "collectErrorData": true,        // Anonymized error reporting  
    "collectDeploymentData": true,   // AWS service usage patterns
    "anonymizeData": true,           // Always anonymize personal info
    "dataRetention": "90-days",      // Local data retention period
    "optOut": false                  // User can opt out anytime
  }
}
```

### Privacy Controls
- **Personal Information**: Never collected (names, emails, credentials)
- **Project Data**: Never transmitted (file contents, business data)
- **Environment Variables**: Never accessed or reported
- **Anonymization**: All data anonymized before transmission
- **Opt-out Available**: Users can disable telemetry while keeping updates

### Network Security
- **HTTPS Only**: All remote communications use secure protocols
- **Repository Verification**: Verify repository authenticity before connections
- **Timeout Protection**: Prevent hanging connections from blocking sessions
- **Graceful Degradation**: Continue session even if remote services unavailable

## Troubleshooting

### Common Issues

**Issue**: "Project not recognized as boilerplate"
**Solution**: 
```bash
# Check project structure
init-session-hooks --check-status
# Or force initialization
init-session-hooks --force
```

**Issue**: "Permission denied creating configuration files"
**Solution**: 
```bash
# Fix file permissions
chmod 755 .claude/
# Retry initialization
init-session-hooks --force
```

**Issue**: "Network timeout during repository check"
**Solution**:
```bash
# Initialize with offline mode
init-session-hooks --offline
# Or increase timeout in configuration
```

**Issue**: "Session hooks not executing on startup"
**Solution**:
```bash
# Verify configuration
init-session-hooks --check-status
# Test manual execution
session-startup-handler --force --verbose
```

### Diagnostic Commands
```bash
# Check current configuration status
init-session-hooks --check-status

# Validate project compatibility
init-session-hooks --validate

# Test session startup sequence
init-session-hooks --test-startup

# Show debug information
init-session-hooks --debug
```

## Advanced Configuration

### Custom Hook Timing
```json
{
  "session": {
    "updateChecking": {
      "checkFrequency": "daily",        // daily, weekly, session-start
      "quietHours": {
        "enabled": true,
        "start": "09:00",
        "end": "17:00"
      }
    }
  }
}
```

### Performance Tuning
```json
{
  "session": {
    "startup": {
      "maxExecutionTime": 8000,       // Milliseconds
      "retryAttempts": 1,
      "backgroundExecution": true
    }
  }
}
```

### Team Configuration
For teams, create shared configuration template:

```bash
# Initialize all team projects with same settings
init-session-hooks --workspace --config-template team-settings.json
```

## Integration with Existing Workflow

### JIRA Integration
Session hooks respect existing JIRA configurations:
- Preserve JIRA credentials and settings
- Don't interfere with JIRA sync operations  
- Include JIRA usage in telemetry (anonymized)

### Git Integration
- Add session hook files to `.gitignore` appropriately
- Respect existing git workflow and commit patterns
- Don't interfere with version control operations

### Deployment Integration  
- Session hooks work with all deployment commands
- Include deployment patterns in telemetry
- Don't interfere with CI/CD pipeline operations

This initialization system ensures that all Quik Nation AI Boilerplate projects can benefit from automatic update checking and contribute to ecosystem improvement through telemetry, while maintaining complete user control over privacy and configuration settings.