# JIRA API Curl Commands - Project Template

This file contains the configured JIRA API commands for your project. Replace placeholders with your project values.

## Prerequisites

⚠️ **IMPORTANT**: This command template requires values from your `docs/PRD.md` file.

The PRD should contain:
- Project name and key for JIRA mapping
- Team member information for assignments
- Technology stack for validation context
- Security requirements for compliance

## Project Configuration

**Note**: These values should come from your `docs/PRD.md` and JIRA setup:

```bash
JIRA_DOMAIN="[JIRA_DOMAIN]"           # e.g., company.atlassian.net
PROJECT_KEY="[PROJECT_KEY]"           # From PRD.md project code
BASE64_AUTH="[BASE64_AUTH]"           # Base64 encoded email:token
BOARD_ID="[BOARD_ID]"                 # e.g., 123
```

## Quick Project Commands

### Project Epic and Children
```bash
# Get specific epic and all its children
curl -X GET \
  "https://[JIRA_DOMAIN]/rest/api/3/search?jql=Epic Link=[EPIC-KEY] OR key=[EPIC-KEY]" \
  -H "Authorization: Basic [BASE64_AUTH]" \
  -H "Accept: application/json"

# Get project stories  
curl -X GET \
  "https://[JIRA_DOMAIN]/rest/api/3/search?jql=project=[PROJECT_KEY] AND issuetype=Story" \
  -H "Authorization: Basic [BASE64_AUTH]" \
  -H "Accept: application/json"

# Get all subtasks
curl -X GET \
  "https://[JIRA_DOMAIN]/rest/api/3/search?jql=project=[PROJECT_KEY] AND issuetype=Sub-task" \
  -H "Authorization: Basic [BASE64_AUTH]" \
  -H "Accept: application/json"
```

## Search Commands

### All Project Issues
```bash
curl -X GET \
  "https://[JIRA_DOMAIN]/rest/api/3/search?jql=project=[PROJECT_KEY]" \
  -H "Authorization: Basic [BASE64_AUTH]" \
  -H "Accept: application/json"
```

### By Issue Type
```bash
# Epics
curl -X GET \
  "https://[JIRA_DOMAIN]/rest/api/3/search?jql=project=[PROJECT_KEY] AND issuetype=Epic" \
  -H "Authorization: Basic [BASE64_AUTH]" \
  -H "Accept: application/json"

# Stories  
curl -X GET \
  "https://[JIRA_DOMAIN]/rest/api/3/search?jql=project=[PROJECT_KEY] AND issuetype=Story" \
  -H "Authorization: Basic [BASE64_AUTH]" \
  -H "Accept: application/json"

# Tasks
curl -X GET \
  "https://[JIRA_DOMAIN]/rest/api/3/search?jql=project=[PROJECT_KEY] AND issuetype=Task" \
  -H "Authorization: Basic [BASE64_AUTH]" \
  -H "Accept: application/json"

# Sub-tasks
curl -X GET \
  "https://[JIRA_DOMAIN]/rest/api/3/search?jql=project=[PROJECT_KEY] AND issuetype=Sub-task" \
  -H "Authorization: Basic [BASE64_AUTH]" \
  -H "Accept: application/json"
```

### By Status
```bash
# In Progress
curl -X GET \
  "https://[JIRA_DOMAIN]/rest/api/3/search?jql=project=[PROJECT_KEY] AND status='In Progress'" \
  -H "Authorization: Basic [BASE64_AUTH]" \
  -H "Accept: application/json"

# To Do
curl -X GET \
  "https://[JIRA_DOMAIN]/rest/api/3/search?jql=project=[PROJECT_KEY] AND status='To Do'" \
  -H "Authorization: Basic [BASE64_AUTH]" \
  -H "Accept: application/json"

# Done
curl -X GET \
  "https://[JIRA_DOMAIN]/rest/api/3/search?jql=project=[PROJECT_KEY] AND status=Done" \
  -H "Authorization: Basic [BASE64_AUTH]" \
  -H "Accept: application/json"
```

### Epic and Children
```bash
# Replace [EPIC-KEY] with your epic key
curl -X GET \
  "https://[JIRA_DOMAIN]/rest/api/3/search?jql=Epic Link=[EPIC-KEY] OR key=[EPIC-KEY]" \
  -H "Authorization: Basic [BASE64_AUTH]" \
  -H "Accept: application/json"
```

## Issue Management

### Get Issue Details
```bash
curl -X GET \
  "https://[JIRA_DOMAIN]/rest/api/3/issue/[ISSUE-KEY]" \
  -H "Authorization: Basic [BASE64_AUTH]" \
  -H "Accept: application/json"
```

### Create Issue
```bash
curl -X POST \
  "https://[JIRA_DOMAIN]/rest/api/3/issue" \
  -H "Authorization: Basic [BASE64_AUTH]" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "project": {"key": "[PROJECT_KEY]"},
      "summary": "Issue Title",
      "description": {
        "type": "doc",
        "version": 1,
        "content": [{
          "type": "paragraph", 
          "content": [{
            "type": "text",
            "text": "Issue description"
          }]
        }]
      },
      "issuetype": {"name": "Story"},
      "priority": {"name": "High"}
    }
  }'
```

### Update Issue
```bash
curl -X PUT \
  "https://[JIRA_DOMAIN]/rest/api/3/issue/[ISSUE-KEY]" \
  -H "Authorization: Basic [BASE64_AUTH]" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "summary": "Updated Title",
      "priority": {"name": "Medium"}
    }
  }'
```

### Add Comment
```bash
curl -X POST \
  "https://[JIRA_DOMAIN]/rest/api/3/issue/[ISSUE-KEY]/comment" \
  -H "Authorization: Basic [BASE64_AUTH]" \
  -H "Content-Type: application/json" \
  -d '{
    "body": {
      "type": "doc",
      "version": 1,
      "content": [{
        "type": "paragraph",
        "content": [{
          "type": "text", 
          "text": "Comment text"
        }]
      }]
    }
  }'
```

### Transition Issue
```bash
# Get transitions
curl -X GET \
  "https://[JIRA_DOMAIN]/rest/api/3/issue/[ISSUE-KEY]/transitions" \
  -H "Authorization: Basic [BASE64_AUTH]" \
  -H "Accept: application/json"

# Apply transition
curl -X POST \
  "https://[JIRA_DOMAIN]/rest/api/3/issue/[ISSUE-KEY]/transitions" \
  -H "Authorization: Basic [BASE64_AUTH]" \
  -H "Content-Type: application/json" \
  -d '{"transition": {"id": "[TRANSITION_ID]"}}'
```

## Advanced Queries

### Specific Fields
```bash
curl -X GET \
  "https://[JIRA_DOMAIN]/rest/api/3/search?jql=project=[PROJECT_KEY]&fields=key,summary,status,assignee" \
  -H "Authorization: Basic [BASE64_AUTH]" \
  -H "Accept: application/json"
```

### Pagination
```bash
curl -X GET \
  "https://[JIRA_DOMAIN]/rest/api/3/search?jql=project=[PROJECT_KEY]&startAt=0&maxResults=25" \
  -H "Authorization: Basic [BASE64_AUTH]" \
  -H "Accept: application/json"
```

### My Issues
```bash
curl -X GET \
  "https://[JIRA_DOMAIN]/rest/api/3/search?jql=project=[PROJECT_KEY] AND assignee=currentUser()" \
  -H "Authorization: Basic [BASE64_AUTH]" \
  -H "Accept: application/json"
```

### Recent Updates
```bash
curl -X GET \
  "https://[JIRA_DOMAIN]/rest/api/3/search?jql=project=[PROJECT_KEY] AND updated >= -1w" \
  -H "Authorization: Basic [BASE64_AUTH]" \
  -H "Accept: application/json"
```

## Setup Instructions

1. **Replace Placeholders:**
   - `[JIRA_DOMAIN]` → your-company.atlassian.net
   - `[PROJECT_KEY]` → your project key (e.g., PROJ)
   - `[BASE64_AUTH]` → your base64 encoded credentials
   - `[BOARD_ID]` → your board ID (optional)
   - `[EPIC-KEY]` → specific epic keys
   - `[ISSUE-KEY]` → specific issue keys

2. **Generate Base64 Auth:**
   ```bash
   echo -n 'email@company.com:API_TOKEN' | base64
   ```

3. **Test Connection:**
   ```bash
   curl -X GET \
     "https://[JIRA_DOMAIN]/rest/api/3/myself" \
     -H "Authorization: Basic [BASE64_AUTH]" \
     -H "Accept: application/json"
   ```

4. **Customize for Your Workflow:**
   - Update issue type names if different
   - Modify status names to match your workflow
   - Add custom fields as needed
   - Adjust query parameters for your use case

## Integration with Claude Commands

This file provides the API foundation that the `create-jira-plan-todo` command uses for all JIRA operations. The command references these patterns for:

- **Epic Creation**: Uses the create issue patterns
- **Story Management**: Leverages the search and update patterns  
- **Task Synchronization**: Employs the transition and comment patterns
- **Progress Tracking**: Utilizes the search and field query patterns

### Linking to create-jira-plan-todo

The `create-jira-plan-todo` command automatically loads configuration from this file and uses these proven API patterns for all JIRA integration operations. See `.claude/commands/create-jira-plan-todo.md` for details on how these commands integrate with the full workflow.

## Security Notes

- Store this file securely with actual credentials
- Add `project-curl-commands.md` to `.gitignore` if it contains real credentials
- Use environment variables for production deployments
- Rotate API tokens regularly per security policy
- Consider using service accounts for team-shared access

## Troubleshooting

### Connection Issues
- Verify JIRA URL format includes `https://`
- Check API token is valid and not expired
- Ensure base64 encoding is correct

### Permission Problems  
- Confirm you have browse/create/edit permissions
- Verify project access for your account
- Check issue type permissions

### API Errors
- Review JIRA REST API documentation
- Check required vs. optional fields
- Validate JSON syntax in POST requests

## Notes

- All commands use HTTPS for security
- Atlassian Document Format required for descriptions  
- Some operations require specific JIRA permissions
- Custom fields may vary between JIRA instances
- Issue type names may be customized per project