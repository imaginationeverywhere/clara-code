# Claude Code Template Variables

This directory contains Claude Code custom commands with template variables that need to be customized for your specific project and infrastructure.

## Required Template Variables

When copying this boilerplate to a new project, you MUST replace these template variables:

### Infrastructure Variables
- `[EC2_HOST_IP]` - Your EC2 instance IP address (e.g., "18.117.74.112")
- `[PROJECT_KEY]` - Your project key for port allocation (e.g., "dreamihaircare", "stacksbabiee")
- `[PROJECT_NAME]` - Human-readable project name (e.g., "Dreami Hair Care", "StacksBabiee")
- `[PROJECT_DOMAIN]` - Your project's base domain (e.g., "dreamihaircare.com", "stacksbabiee.com")

### Claude Code Settings Variables
- `CLAUDE_CODE_TASK_LIST_ID` - Unique identifier for project-scoped task lists
  - **Purpose**: Isolates Claude Code's internal task list per project
  - **Location**: `.claude/settings.json` → `env.CLAUDE_CODE_TASK_LIST_ID`
  - **Source**: Read from `docs/PRD.md` → `**Project Code**: [PROJECT_KEY]`
  - **Syncs with**: `projectId` in `.claude/project-tasks/tasks.json`
  - **Auto-sync**: The `project-tasks-sync` agent automatically extracts from PRD.md

### Template Replacement Process

1. **Copy the entire `.claude` directory** to your new project
2. **Replace all template variables** using find-and-replace:
   ```bash
   # Replace EC2 IP address
   find .claude -type f -exec sed -i '' 's/\[EC2_HOST_IP\]/YOUR_EC2_IP/g' {} \;

   # Replace project variables
   find .claude -type f -exec sed -i '' 's/\[PROJECT_KEY\]/yourprojectkey/g' {} \;
   find .claude -type f -exec sed -i '' 's/\[PROJECT_NAME\]/Your Project Name/g' {} \;
   find .claude -type f -exec sed -i '' 's/\[PROJECT_DOMAIN\]/yourproject.com/g' {} \;

   # Update Claude Code task list ID in settings.local.json
   sed -i '' 's/"CLAUDE_CODE_TASK_LIST_ID": "quik-nation-ai-boilerplate"/"CLAUDE_CODE_TASK_LIST_ID": "yourprojectkey"/g' .claude/settings.local.json

   # Update projectId in project-tasks/tasks.json
   sed -i '' 's/"projectId": "quik-nation-ai-boilerplate"/"projectId": "yourprojectkey"/g' .claude/project-tasks/tasks.json
   ```

3. **Verify all replacements** by searching for remaining brackets:
   ```bash
   grep -r "\[" .claude/
   ```

## Files Containing Template Variables

### Claude Code Settings
- `.claude/settings.local.json` - Project-specific Claude Code settings
  - `env.CLAUDE_CODE_TASK_LIST_ID` - Task list isolation per project
- `.claude/project-tasks/tasks.json` - Git-synced task storage
  - `projectId` - Must match `CLAUDE_CODE_TASK_LIST_ID`

### Port Management System
- `.claude/port-management.sh` - Main port management script
- `.claude/PORT_MANAGEMENT.md` - Documentation with examples

### Deployment Commands
- `.claude/commands/setup-ec2-infrastructure.md` - EC2 infrastructure setup
- `.claude/commands/setup-project-api-deployment.md` - Project-specific deployment
- `.claude/commands/verify-deployment-setup.md` - Deployment verification

## Important Notes

⚠️ **SECURITY**: Ensure template variables are replaced before committing to version control.

⚠️ **TESTING**: After replacement, test the port management system with:
```bash
./.claude/port-management.sh scan
```

⚠️ **VALIDATION**: Verify SSH connectivity to your EC2 instance before running deployment commands.
