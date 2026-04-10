# /tasks-cleanup - Task List Cleanup

Clean up completed tasks and optionally reset task lists.

## Usage

```
/tasks-cleanup                    # Archive completed tasks (default)
/tasks-cleanup --archive          # Move completed to completed.json
/tasks-cleanup --clear-completed  # Delete all completed tasks
/tasks-cleanup --reset            # Reset entire task list (CAUTION!)
/tasks-cleanup --status           # Show cleanup statistics
```

## Implementation

### Step 1: Analyze Current Tasks

```javascript
// Read current state
const tasksFile = '.claude/project-tasks/tasks.json';
const completedFile = '.claude/project-tasks/completed.json';

const tasks = JSON.parse(fs.readFileSync(tasksFile));
const completed = fs.existsSync(completedFile)
  ? JSON.parse(fs.readFileSync(completedFile))
  : { tasks: [] };

// Categorize
const pendingTasks = tasks.tasks.filter(t => t.status === 'pending');
const inProgressTasks = tasks.tasks.filter(t => t.status === 'in_progress');
const completedTasks = tasks.tasks.filter(t => t.status === 'completed');
```

### Step 2: Default Behavior (--archive)

```
📊 Task Cleanup Analysis

Current State:
  Pending:     3 tasks
  In Progress: 1 task
  Completed:   8 tasks ← Will be archived

Archive completed tasks? [Y/n]: _
```

**On confirm:**
```javascript
// Move completed tasks to archive
completed.tasks.push(...completedTasks.map(t => ({
  ...t,
  archivedAt: new Date().toISOString()
})));

// Keep only last 100 in archive
if (completed.tasks.length > 100) {
  completed.tasks = completed.tasks.slice(-100);
}

// Remove completed from active
tasks.tasks = tasks.tasks.filter(t => t.status !== 'completed');

// Save both files
fs.writeFileSync(tasksFile, JSON.stringify(tasks, null, 2));
fs.writeFileSync(completedFile, JSON.stringify(completed, null, 2));
```

**Output:**
```
✅ Archived 8 completed tasks

Task List Now:
  Pending:     3 tasks
  In Progress: 1 task
  Completed:   0 tasks

Archive contains 23 tasks total
```

### Step 3: Clear Completed (--clear-completed)

Permanently delete completed tasks without archiving:

```
⚠️  This will permanently delete 8 completed tasks.
    They will NOT be archived.

Proceed? [y/N]: _
```

### Step 4: Full Reset (--reset)

Nuclear option - clears everything:

```
🚨 DANGER: Full Task List Reset

This will:
  ❌ Delete 3 pending tasks
  ❌ Delete 1 in-progress task
  ❌ Delete 8 completed tasks
  ❌ Clear archive (23 tasks)

This action is IRREVERSIBLE.

Type "RESET" to confirm: _
```

**On "RESET" typed:**
```javascript
// Reset to empty state
const emptyTasks = {
  version: "2.0.0",
  projectId: tasks.projectId,
  lastSyncedAt: new Date().toISOString(),
  lastSyncedBy: `${os.userInfo().username}@${os.hostname()}`,
  tasks: [],
  orchestration: tasks.orchestration,
  config: tasks.config
};

fs.writeFileSync(tasksFile, JSON.stringify(emptyTasks, null, 2));
fs.unlinkSync(completedFile); // Delete archive

// Also clear Claude Code session tasks
// Signal to clear via TaskUpdate/TaskList
```

**Output:**
```
🗑️  Task list has been reset.

All tasks deleted:
  - 3 pending
  - 1 in progress
  - 8 completed
  - 23 archived

Fresh start! Create new tasks with TaskCreate or /tasks-sync --load
```

### Step 5: Status (--status)

Show cleanup statistics without making changes:

```
📊 Task Cleanup Status

Active Tasks (.claude/project-tasks/tasks.json):
  Pending:       3 tasks
  In Progress:   1 task
  Completed:     8 tasks (ready to archive)
  ─────────────────────
  Total Active:  12 tasks

Archive (.claude/project-tasks/completed.json):
  Archived:      23 tasks
  Oldest:        2025-01-15 (16 days ago)
  Newest:        2025-01-30 (1 day ago)

Recommendations:
  • 8 completed tasks could be archived
  • Archive is within limits (23/100)

Run '/tasks-cleanup --archive' to clean up completed tasks.
```

## Integration with Claude Code Session Tasks

The cleanup also clears tasks from Claude Code's internal session:

```javascript
// After file cleanup, iterate session tasks
const sessionTasks = await TaskList();
for (const task of sessionTasks) {
  if (task.status === 'completed') {
    // Mark for removal from session display
    await TaskUpdate({ taskId: task.id, status: 'completed' });
  }
}
```

## Automatic Cleanup Rules

Configure in `.claude/project-tasks/tasks.json`:

```json
{
  "config": {
    "cleanup": {
      "autoArchive": true,
      "archiveAfterDays": 7,
      "maxArchiveSize": 100,
      "autoDeleteArchiveAfterDays": 90
    }
  }
}
```

## Git Integration

After cleanup, optionally commit:

```
Cleanup complete!

Changes staged:
  M .claude/project-tasks/tasks.json
  M .claude/project-tasks/completed.json

Commit these changes? [Y/n]: _

[commit] chore(tasks): archive 8 completed tasks
```
