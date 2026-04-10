# /tasks-sync - Project Task Synchronization

Synchronize Claude Code tasks with project-local storage for cross-device continuity.

## Usage

```
/tasks-sync              # Full sync (load from project + save current)
/tasks-sync --load       # Load tasks from project only
/tasks-sync --save       # Save current tasks to project only
/tasks-sync --push       # Save tasks and git push
/tasks-sync --status     # Show sync status
/tasks-sync --init       # Initialize project task storage
/tasks-sync --migrate    # Migrate current session tasks to project
```

## Implementation

### Step 1: Determine Operation Mode

Parse the command arguments to determine the operation:
- No args or `--sync`: Full bidirectional sync
- `--load`: Load from `.claude/project-tasks/tasks.json`
- `--save`: Save current session tasks to project
- `--push`: Save + git commit + git push
- `--status`: Display sync status
- `--init`: Create project task storage
- `--migrate`: Move session tasks to project storage

### Step 2: Project Task Storage

**Location**: `.claude/project-tasks/`

**Files**:
```
.claude/project-tasks/
├── tasks.json          # Active tasks
├── completed.json      # Archived completed tasks
├── .sync-metadata.json # Sync tracking
└── README.md           # Usage documentation
```

### Step 3: Operations

#### --init: Initialize Project Task Storage

```bash
# Create directory structure
mkdir -p .claude/project-tasks

# Create tasks.json
cat > .claude/project-tasks/tasks.json << 'EOF'
{
  "version": "1.0.0",
  "projectId": "PROJECT_NAME",
  "lastSyncedAt": null,
  "lastSyncedBy": null,
  "tasks": []
}
EOF

# Create completed.json
cat > .claude/project-tasks/completed.json << 'EOF'
{
  "version": "1.0.0",
  "completedTasks": []
}
EOF

# Create sync metadata
cat > .claude/project-tasks/.sync-metadata.json << 'EOF'
{
  "initialized": "TIMESTAMP",
  "lastSync": null,
  "devices": []
}
EOF

# Create README
cat > .claude/project-tasks/README.md << 'EOF'
# Project Tasks

This directory contains project-specific tasks that sync across devices via git.

## How It Works

1. Tasks are stored in `tasks.json`
2. When you push/pull, tasks sync automatically
3. Start Claude Code on any device to continue where you left off

## Files

- `tasks.json` - Active tasks
- `completed.json` - Archived completed tasks
- `.sync-metadata.json` - Sync tracking info

## Commands

- `/tasks-sync` - Sync tasks with project
- `/tasks-sync --load` - Load tasks from project
- `/tasks-sync --save` - Save tasks to project
- `/tasks-sync --push` - Save and git push
EOF
```

#### --load: Load Tasks from Project

1. Read `.claude/project-tasks/tasks.json`
2. For each task in the file:
   - Check if task already exists in session (by ID)
   - If not, create it using TaskCreate
   - If exists, update status if different
3. Display summary: "Loaded X tasks from project"

#### --save: Save Tasks to Project

1. Use TaskList to get all current session tasks
2. Read existing `.claude/project-tasks/tasks.json`
3. Merge tasks:
   - New tasks: Add to file
   - Existing tasks: Update if session version is newer
   - Completed tasks: Move to `completed.json`
4. Update `.sync-metadata.json` with:
   - `lastSync`: Current timestamp
   - `device`: hostname + username
5. Write updated `tasks.json`
6. Display summary: "Saved X tasks to project"

#### --push: Save + Git Push

1. Run --save operation
2. Stage task files:
   ```bash
   git add .claude/project-tasks/
   ```
3. Commit with message:
   ```bash
   git commit -m "chore(tasks): sync project tasks

   - X active tasks
   - Y completed tasks

   Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
   ```
4. Push to remote:
   ```bash
   git push origin HEAD
   ```

#### --status: Show Sync Status

Display:
```
📋 Project Tasks Sync Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Project: quikcarrental
Storage: .claude/project-tasks/

Session Tasks: 5 (3 pending, 2 in progress)
Project Tasks: 4 (2 pending, 2 in progress)

Last Synced: 2025-01-31 14:30:00
Synced By: amenra@macbook-pro

Status: ⚠️ 1 task not synced to project

Actions:
  /tasks-sync --save   Save session tasks to project
  /tasks-sync --push   Save and push to remote
```

#### --migrate: Migrate Session Tasks

1. Get all tasks from current session
2. Initialize project storage if needed
3. Save all session tasks to project
4. Display: "Migrated X tasks to project storage"

### Step 4: Automatic Sync (Session Hooks)

On session start, if `.claude/project-tasks/tasks.json` exists:
1. Automatically load tasks
2. Display: "📋 Loaded X project tasks"

On significant task changes:
1. Auto-save to project (debounced, every 30 seconds)
2. No git commit (user controls that)

### Step 5: Conflict Resolution

When loading tasks that conflict with session:
1. Compare timestamps
2. Newer version wins
3. Log conflicts for user review

## Output Examples

### Successful Init
```
✅ Project task storage initialized

Created:
  .claude/project-tasks/tasks.json
  .claude/project-tasks/completed.json
  .claude/project-tasks/.sync-metadata.json
  .claude/project-tasks/README.md

Next steps:
  1. Create tasks: Use TaskCreate or /tasks-sync --migrate
  2. Save tasks: /tasks-sync --save
  3. Commit: git add . && git commit -m "feat: add project tasks"
```

### Successful Load
```
📋 Loaded 5 project tasks

  1. [in_progress] Complete Admin Dashboard (QCR-001)
  2. [pending] Implement payment flow
  3. [pending] Add email notifications
  4. [pending] Write API documentation
  5. [pending] Set up monitoring

Use /tasks to see full task list
```

### Successful Push
```
✅ Tasks synced and pushed

Saved: 5 tasks
Committed: chore(tasks): sync project tasks
Pushed: main → origin/main

Your tasks are now available on all devices!
```

## Integration with Existing Commands

### /process-todos
- Automatically loads project tasks on start
- Saves task progress periodically

### /update-todos
- Includes project task status in sync

### /commit (git workflow)
- Offers to include task sync in commit

## Notes

- Tasks are stored in plain JSON (human-readable)
- Git handles versioning and conflict detection
- Works with any git remote (GitHub, GitLab, etc.)
- Mobile access via GitHub app + Claude Code mobile
