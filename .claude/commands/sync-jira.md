# sync-jira: [PROJECT_NAME] Jira Integration Management

Establish and maintain bidirectional synchronization between your local [PROJECT_NAME] development workflow and the [PROJECT_KEY] Jira project board.

## Prerequisites

⚠️ **REQUIRED**: 
1. A `docs/PRD.md` file must exist before setting up JIRA integration
2. Frontend mockup template must be selected for proper project initialization

The PRD provides essential project context that JIRA integration requires:
- **Project Identity**: Name, description, and JIRA project mapping
- **Monorepo Structure**: Frontend (AWS Amplify), backend (shared EC2), mobile workspaces
- **Technology Stack**: Next.js 16 + React 19 (frontend), Express + Apollo Server (backend)
- **Deployment Context**: AWS Amplify build specs, shared EC2 port management
- **Team Structure**: Roles, assignment filtering, and workspace responsibilities
- **Security Requirements**: Clerk Auth, JWT validation, compliance tracking
- **Performance Targets**: Load times, API response targets, scaling requirements
- **Frontend Mockup Template**: Selected template for UI/UX baseline

## How to Use This Command

**In Claude Code, run one of these:**
- `sync-jira --connect` - Initial setup and connection (requires PRD.md)
- `sync-jira --configure-personal` - Set up personal filtering  
- `sync-jira --test-connection` - Test current connection
- `sync-jira --migrate-todos` - Convert existing todos to Jira structure
- `sync-jira` - Perform daily synchronization

**Simply ask Claude:**
- "Run sync-jira to connect to our Jira project"
- "Can you sync-jira --connect to set up our [PROJECT_KEY] integration?"
- "Please run sync-jira --configure-personal"

**If PRD.md doesn't exist:** The command will guide you to create it from `docs/PRD-TEMPLATE.md` first.

## Command Implementation

When you invoke this command, I will:

### For --connect or initial setup:
1. **Check Project Configuration**: Verify [PROJECT_KEY] project settings in jira-config/
2. **Mockup Template Selection**: 
   - Present available templates: retail, booking, property-rental, restaurant, custom
   - Check PRD for `[MOCKUP_TEMPLATE_CHOICE]` preference
   - Validate custom mockup structure if selected
   - Store selection for future frontend work
3. **Test Jira Connection**: Connect to quikinfluence-team.atlassian.net and verify access to [PROJECT_KEY] project
4. **Set Up Authentication**: Guide you through API token setup if needed
5. **Fetch Project Structure**: Download epics and stories from your [PROJECT_KEY] board
6. **Create Enhanced Directories**: Build epic/story directory structure with workspace and mockup awareness
7. **Configure Monorepo Integration**: Set up frontend/backend workspace synchronization with mockup baseline
8. **Migrate Existing Work**: Map your current todos to Jira structure with workspace context
9. **Configure Sync Settings**: Set up bidirectional synchronization preferences for monorepo

### For --configure-personal:
1. **Identify Your Jira User**: Connect your local identity to Jira account
2. **Analyze Your Assignments**: Find tasks assigned to you in [PROJECT_KEY] project
3. **Set Up Personal Filtering**: Configure what work appears in your workspace
4. **Team Membership Detection**: Identify teams you belong to for coordination
5. **Preference Configuration**: Set up notification and visibility preferences

### For --test-connection:
1. **Verify Configuration**: Check all config files are present and valid
2. **Test API Connection**: Ensure connectivity to Jira
3. **Validate Permissions**: Confirm you can read/write [PROJECT_KEY] project data
4. **Check Sync Status**: Report on last sync and any pending issues

### For --migrate-todos:
1. **Analyze Existing Todos**: Scan your current todo files
2. **Suggest Epic/Story Mapping**: Recommend how to organize work in Jira structure
3. **Create Jira Items**: Generate corresponding epics/stories/tasks in [PROJECT_KEY] project
4. **Reorganize File Structure**: Move files to new epic/story hierarchy
5. **Preserve All Work**: Ensure no existing work is lost during migration

### For daily sync (no parameters):
1. **Bidirectional Analysis**: Check for changes in both local files and Jira
2. **Conflict Detection**: Identify any conflicting updates
3. **Intelligent Resolution**: Apply resolution strategies based on change type
4. **Update Local Files**: Sync Jira changes to your workspace
5. **Push Local Progress**: Update Jira with your development progress
6. **Generate Summary**: Report on sync results and any issues

## When You Invoke This Command

I will analyze what you're trying to accomplish and execute the appropriate workflow:

- If you specify `--connect`, I'll guide you through initial setup
- If you specify `--configure-personal`, I'll set up personal filtering  
- If configuration doesn't exist, I'll automatically start with `--connect`
- If you just say "sync-jira", I'll perform daily synchronization
- If there are issues, I'll provide specific troubleshooting guidance

## Authentication Setup

For the `--connect` option, I will:
1. Guide you to generate a Jira API token at: https://id.atlassian.com/manage-profile/security/api-tokens
2. Help you store it securely in your `.jira-token` file
3. Test the connection and permissions
4. Set up the secure API configuration

## Directory Structure Created

After successful setup, your enhanced monorepo structure will be:
```
# Monorepo Root Structure
├── frontend/                       # Next.js 16 app (AWS Amplify)
├── backend/                        # Express + Apollo Server (Shared EC2)
├── mobile/                         # React Native (future)
├── docs/
│   └── PRD.md                      # **REQUIRED** Project context
├── todo/
│   ├── jira-config/                # Integration control center
│   │   ├── project-config.json     # [PROJECT_KEY] project configuration
│   │   ├── personal-config.json    # Your filtering preferences
│   │   ├── status-mappings.json    # Workflow state mappings
│   │   ├── sync-history.json      # Operation logs
│   │   └── mockup-config.json     # Frontend mockup template selection
│   ├── not-started/
│   │   └── [PROJECT_KEY]-[EPIC]/   # Epic directories with workspace context
│   │       ├── epic-overview.md    # Business context + deployment targets
│   │       └── [PROJECT_KEY]-[STORY]/  # Story directories
│   │           ├── story-plan.md   # Technical plan (frontend/backend)
│   │           ├── frontend-tasks/ # Next.js/Amplify specific tasks
│   │           └── backend-tasks/  # Express/EC2 specific tasks
│   ├── in-progress/ [same structure]
│   └── completed/ [same structure]
└── todo-summaries/                 # Pattern library with workspace context
    ├── completed/                  # Summaries with deployment context
    ├── relationships.json          # Epic/story/workspace relationships
    └── README.md                   # Summary system documentation
```

## Error Handling

I will provide specific guidance for:
- **Network connectivity issues**: Steps to resolve connection problems
- **Authentication failures**: How to renew or reconfigure API tokens
- **Permission problems**: Working with your Jira admin to get proper access
- **Configuration conflicts**: Resolving setup or sync conflicts
- **Migration issues**: Handling complex todo-to-Jira mapping problems

## Security and Privacy

- API tokens stored locally in `.jira-token` (automatically added to .gitignore)
- All communication uses HTTPS encryption
- Only accesses [PROJECT_KEY] project data you have permissions for
- No sensitive development details shared with Jira beyond task status
- Complete audit trail of all sync operations

Ready to get started? Just run `sync-jira --connect` and I'll guide you through the setup process!