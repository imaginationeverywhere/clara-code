# Project Tasks

This directory contains project-specific tasks that sync across devices via git.

## How It Works

1. Tasks are stored in `tasks.json`
2. When you push/pull, tasks sync automatically
3. Start Claude Code on any device to continue where you left off

## Files

| File | Purpose |
|------|---------|
| `tasks.json` | Active tasks (pending, in_progress) |
| `completed.json` | Archived completed tasks |
| `.sync-metadata.json` | Sync tracking and device info |

## Commands

| Command | Description |
|---------|-------------|
| `/tasks-sync` | Full sync (load + save) |
| `/tasks-sync --load` | Load tasks from project |
| `/tasks-sync --save` | Save session tasks to project |
| `/tasks-sync --push` | Save and git push |
| `/tasks-sync --status` | Show sync status |
| `/tasks-sync --migrate` | Migrate session tasks to project |

## Cross-Device Workflow

### On Your Computer
```bash
# Work on tasks
# Tasks auto-save to .claude/project-tasks/

# When done, push
git add . && git commit -m "chore: sync tasks" && git push
```

### On Another Device (Phone/Tablet/Other Computer)
```bash
# Pull latest
git pull

# Open Claude Code - tasks load automatically
# Continue working where you left off
```

## Task Schema

```json
{
  "id": "unique-task-id",
  "subject": "Task title",
  "description": "Detailed description",
  "status": "pending|in_progress|completed",
  "priority": "high|medium|low",
  "jiraKey": "PROJECT-123",
  "createdAt": "2025-01-31T10:00:00Z",
  "updatedAt": "2025-01-31T14:30:00Z"
}
```

## Privacy Note

- Tasks are committed to git and visible to anyone with repo access
- Don't include sensitive information (passwords, API keys) in task descriptions
- Use JIRA keys to reference sensitive details stored securely
