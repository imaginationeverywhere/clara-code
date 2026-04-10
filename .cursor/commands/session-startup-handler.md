# session-startup-handler

**Purpose**: Automatic session startup system that executes mandatory boilerplate update checks and telemetry reporting for all Quik Nation AI Boilerplate projects

**Context**: This command is automatically triggered at the start of every Claude session in a boilerplate-enabled project. It performs update detection, telemetry collection, and provides immediate feedback about available updates without disrupting the user workflow.

## Automatic Execution

This handler is **automatically executed** at session startup when:
- Current directory contains `.claude/` directory
- Project has boilerplate structure (`.boilerplate-manifest.json` or recognizable boilerplate files)
- Session hooks are enabled in `.claude/session-hooks.json`

## Core Functions

### 1. **Session Startup Trigger**
```bash
# Automatically executed - no manual invocation needed
# Runs silently in background during Claude session initialization
```

### 2. **Update Detection Workflow**
- **Quick Repository Check**: Connect to `git@github.com:imaginationeverywhere/quik-nation-ai-boilerplate.git`
- **Version Comparison**: Compare current project version against latest available
- **Immediate Notification**: Inform user of available updates without blocking session
- **Graceful Failure**: Continue silently if update check fails (network issues, etc.)

### 3. **Telemetry Collection**
- **Usage Analytics**: Track command utilization patterns and frequency
- **Performance Metrics**: Monitor session startup times and system performance
- **Feature Adoption**: Analyze which boilerplate features are actively used
- **Error Reporting**: Collect anonymized error patterns for system improvement
- **Deployment Patterns**: Monitor AWS service usage, database configurations, deployment frequency

### 4. **User Communication**
```
🚀 Quik Nation AI Boilerplate Session Started
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Project: [PROJECT_NAME] (v1.0.0)
🔄 Update Status: 3 updates available (v1.1.0)
📊 Session: 42nd this month | Last update: 5 days ago

⚡ Quick Actions:
  • update-boilerplate --check (view available updates)
  • update-boilerplate --commands-only (safe update)
  • update-boilerplate (full interactive update)

🎯 Ready for development!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Implementation Details

### Project Detection Logic
```javascript
function detectBoilerplateProject(cwd) {
  const indicators = [
    '.boilerplate-manifest.json',
    '.claude/commands/update-boilerplate.md',
    '.claude/session-hooks.json',
    'pnpm-workspace.yaml + frontend/ + backend/',
    'CLAUDE.md + .claude/ directory structure'
  ];
  
  return indicators.some(indicator => existsSync(path.join(cwd, indicator)));
}
```

### Update Check Process
1. **Repository Connection**: Quick fetch from remote repository
2. **Version Resolution**: Parse current project version from manifest or git tags
3. **Comparison Logic**: Semantic version comparison with available updates
4. **Change Analysis**: Categorize updates (commands, docs, infrastructure, breaking changes)
5. **User Notification**: Concise summary with actionable next steps

### Telemetry Data Collection
**Collected Anonymously**:
- Project type (frontend-only, backend-only, full-monorepo)
- Workspace configuration (Next.js, Express, React Native)
- Command usage frequency and patterns
- Update adoption rates and timing
- Error rates and common failure points
- Performance metrics (startup time, command execution time)
- Feature utilization (JIRA integration, deployment commands, etc.)

**Never Collected**:
- Personal information or credentials
- Business data or project content
- Environment variables or configuration secrets
- File contents or code snippets

### Remote Repository Integration
```bash
# Repository endpoints for update checking
REMOTE_REPO="git@github.com:imaginationeverywhere/quik-nation-ai-boilerplate.git"
VERSION_ENDPOINT="https://api.github.com/repos/imaginationeverywhere/quik-nation-ai-boilerplate/releases/latest"
TELEMETRY_ENDPOINT="https://api.github.com/repos/imaginationeverywhere/quik-nation-ai-boilerplate/issues"
```

### Error Handling and Graceful Failure
- **Network Timeout**: Fall back to cached version information
- **Repository Unavailable**: Continue session with last known status
- **Permission Issues**: Skip telemetry reporting, continue with update check
- **Parsing Errors**: Log error anonymously, continue session startup
- **System Resource Issues**: Defer operations to avoid blocking user

## Integration with Boilerplate-Update-Manager Agent

### Agent Activation
The session startup handler automatically activates the `boilerplate-update-manager` agent when:
- Updates are detected during session startup
- User requests update operations
- Multi-project scanning is needed
- Telemetry reporting is triggered

### Command Authority Transfer
```markdown
session-startup-handler → boilerplate-update-manager
│
├── Update Detection Results
├── Project Manifest Data  
├── Telemetry Collection
├── Remote Repository Status
└── User Context for Operations
```

### Seamless Integration
- **Silent Operation**: No user interruption during normal session startup
- **Contextual Activation**: Agent receives full session context for informed decisions
- **Authority Handoff**: Update manager takes complete control when updates are needed
- **Continuous Monitoring**: Session handler continues monitoring throughout session

## Configuration Options

### Session Hook Configuration
Located in `.claude/session-hooks.json`:
```json
{
  "session": {
    "startup": {
      "enabled": true,
      "boilerplateUpdateCheck": {
        "enabled": true,
        "timeout": 5000,
        "silentMode": false,
        "showNotifications": true
      }
    },
    "telemetry": {
      "enabled": true,
      "anonymizeData": true,
      "collectUsageData": true,
      "collectPerformanceData": true
    }
  }
}
```

### Project-Specific Overrides
In `.boilerplate-manifest.json`:
```json
{
  "sessionHooks": {
    "updateCheckFrequency": "daily",
    "telemetryLevel": "minimal",
    "notificationStyle": "compact"
  }
}
```

## Multi-Project Support

### Workspace Scanning
The session handler can detect and manage multiple boilerplate projects:
```bash
# Automatic workspace detection
/Users/amenra/Projects/
├── quikaction/           (boilerplate v1.0.0 → v1.1.0 available)
├── dreamihaircare/       (boilerplate v1.0.0 → v1.1.0 available)  
├── pink-collar-contractors/ (boilerplate v1.1.0 - current)
└── quik-nation-ai-boilerplate/   (source repository)
```

### Portfolio Management
- **Centralized Status**: View update status across all projects
- **Bulk Operations**: Apply updates to multiple projects simultaneously  
- **Consistency Tracking**: Monitor version consistency across portfolio
- **Usage Analytics**: Aggregate telemetry across all projects

## Security and Privacy

### Data Protection
- **Anonymization**: All telemetry data is anonymized before transmission
- **Local Storage**: Sensitive project data never leaves local environment
- **Opt-out Available**: Users can disable telemetry while keeping update checks
- **Encryption**: All remote communications use secure protocols

### Credential Management
- **No Credential Collection**: System never collects API keys, tokens, or passwords
- **Environment Protection**: Environment variables and config files are excluded
- **Permission Respect**: Operations respect existing file permissions and access controls

## Troubleshooting

### Common Issues

**Issue**: Session startup takes too long
**Solution**: Reduce timeout in session-hooks.json or enable silent mode

**Issue**: Update checks fail consistently  
**Solution**: Check network connectivity and repository access permissions

**Issue**: Too many notifications during startup
**Solution**: Set `silentMode: true` or `showNotifications: false` in config

**Issue**: Telemetry reporting errors
**Solution**: Disable telemetry or check network permissions for GitHub API access

### Debug Mode
```bash
# Enable verbose session startup logging
export CLAUDE_SESSION_DEBUG=true
```

### Manual Override
```bash
# Skip automatic session startup (for debugging)
export CLAUDE_SKIP_SESSION_HOOKS=true

# Force session startup execution
session-startup-handler --force --verbose
```

## Performance Considerations

### Startup Time Optimization
- **Parallel Execution**: Update check and telemetry run concurrently
- **Timeout Management**: Operations complete within 5-10 seconds maximum
- **Caching Strategy**: Cache remote data to reduce repeated network calls
- **Background Processing**: Defer non-critical operations to not block user interaction

### Resource Usage
- **Memory Efficient**: Minimal memory footprint during session startup
- **Network Conscious**: Batch operations and respect bandwidth limitations
- **CPU Friendly**: Avoid intensive operations during session initialization
- **Disk I/O Minimal**: Efficient file operations with minimal disk access

## Integration Examples

### Standard Session Start
```
User opens Claude Code in project directory
  ↓
session-startup-handler detects boilerplate project
  ↓
Quick update check against remote repository (2s)
  ↓  
Telemetry collection and reporting (1s)
  ↓
User notification with update status
  ↓
Normal Claude session continues
```

### Update Available Scenario
```
User opens Claude Code
  ↓
Update detected during session startup
  ↓
boilerplate-update-manager agent activated
  ↓
User receives actionable update notification
  ↓
User can continue working or apply updates immediately
```

### Multi-Project Portfolio
```
User working across multiple boilerplate projects
  ↓
Session handler aggregates status across portfolio
  ↓
Unified notification about updates across all projects  
  ↓
Option to bulk update or manage projects individually
```

This session startup handler ensures that all Quik Nation AI Boilerplate users stay informed about available updates and contribute to the continuous improvement of the boilerplate ecosystem through comprehensive telemetry reporting, while maintaining a smooth and efficient development experience.