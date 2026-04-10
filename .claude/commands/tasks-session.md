# /tasks-session - Multi-Session Coordination

Register and manage multiple Claude Code sessions for parallel work and monitoring.

## Usage

```
/tasks-session register <name>      # Register this session with a human-readable name
/tasks-session list                 # List all active sessions
/tasks-session claim <task-id>      # Claim a task for this session
/tasks-session release <task-id>    # Release a task back to pool
/tasks-session status               # Show this session's status
/tasks-session monitor              # Register as the monitor session
/tasks-session worker               # Register as a worker session
/tasks-session end                  # End this session's registration
```

## How It Works

### Session Registry File
Location: `.claude/project-tasks/.sessions.json`

```json
{
  "sessions": {
    "monitor-1": {
      "role": "monitor",
      "registeredAt": "2025-01-31T16:00:00Z",
      "lastHeartbeat": "2025-01-31T16:05:00Z",
      "device": "macbook-pro",
      "status": "active",
      "tasks": []
    },
    "worker-1": {
      "role": "worker",
      "registeredAt": "2025-01-31T16:00:05Z",
      "lastHeartbeat": "2025-01-31T16:04:30Z",
      "device": "macbook-pro",
      "status": "active",
      "tasks": ["7", "8"]
    },
    "worker-2": {
      "role": "worker",
      "registeredAt": "2025-01-31T16:00:10Z",
      "lastHeartbeat": "2025-01-31T16:04:45Z",
      "device": "iphone",
      "status": "active",
      "tasks": ["9"]
    }
  },
  "config": {
    "heartbeatInterval": "30s",
    "sessionTimeout": "5m"
  }
}
```

## Commands

### Register a Session

```bash
# In Terminal 1 (Computer)
/tasks-session register monitor-1

# In Terminal 2 (Computer - another window)
/tasks-session register worker-1

# On Phone
/tasks-session register worker-phone
```

**Output:**
```
✅ Session Registered

Session ID: worker-1
Role: worker
Device: macbook-pro
Registered: 2025-01-31 16:00:05

This session can now:
  - Claim tasks with: /tasks-session claim <task-id>
  - View assigned tasks: /tasks-session status
  - Release tasks: /tasks-session release <task-id>

Other active sessions:
  - monitor-1 (monitor) - active
  - worker-phone (worker) - active
```

### Quick Registration

```bash
/tasks-session monitor    # Auto-registers as "monitor-{n}"
/tasks-session worker     # Auto-registers as "worker-{n}"
```

### List Sessions

```bash
/tasks-session list
```

**Output:**
```
📋 Active Sessions

┌──────────────┬──────────┬─────────────┬───────────┬─────────┐
│ Session ID   │ Role     │ Device      │ Status    │ Tasks   │
├──────────────┼──────────┼─────────────┼───────────┼─────────┤
│ monitor-1    │ monitor  │ macbook-pro │ ✅ active │ -       │
│ worker-1     │ worker   │ macbook-pro │ ✅ active │ #7, #8  │
│ worker-phone │ worker   │ iphone      │ ✅ active │ #9      │
│ worker-2     │ worker   │ ipad        │ ⚠️ stale  │ #10     │
└──────────────┴──────────┴─────────────┴───────────┴─────────┘

Stale sessions (no heartbeat > 5 min) may be auto-cleaned.
```

### Claim a Task

```bash
/tasks-session claim 7
```

**Output:**
```
✅ Task Claimed

Task #7: "Add email notifications"
Claimed by: worker-1
Status: in_progress

The task is now assigned to this session.
Other sessions will see it as "claimed by worker-1".

Start working on the task, then:
  - Complete: Update task status to "completed"
  - Release: /tasks-session release 7
```

### Session Status

```bash
/tasks-session status
```

**Output:**
```
📊 Session Status: worker-1

Role: worker
Registered: 10 minutes ago
Last Heartbeat: 30 seconds ago
Device: macbook-pro

Claimed Tasks:
  #7: Add email notifications [in_progress]
  #8: Implement caching [pending]

Available Tasks (unclaimed):
  #9: Write API docs
  #10: Set up monitoring

Commands:
  /tasks-session claim 9     Claim task #9
  /tasks-session release 7   Release task #7
  /tasks-session end         End this session
```

## Multi-Session Workflow

### Step 1: Open Multiple Sessions

**Terminal 1 (Monitor):**
```bash
cd /path/to/project
claude
> /tasks-session register monitor
```

**Terminal 2 (Worker 1):**
```bash
cd /path/to/project
claude
> /tasks-session register worker-1
```

**Phone (Worker 2):**
```bash
# Open Claude Code app
> /tasks-session register worker-phone
```

### Step 2: Claim Tasks

**Worker 1:**
```bash
/tasks-session claim 7
/tasks-session claim 8
# Now working on tasks 7 and 8
```

**Worker Phone:**
```bash
/tasks-session claim 9
# Now working on task 9
```

### Step 3: Monitor Progress

**Monitor session:**
```bash
/tasks-monitor

# Shows:
# - worker-1: Tasks #7, #8 in progress
# - worker-phone: Task #9 in progress
# - Alerts if any session goes stale
```

### Step 4: Complete and Sync

**Worker 1 (when done):**
```bash
# Mark task complete
# Then push changes
git add . && git commit -m "feat: email notifications" && git push
/tasks-session release 7
```

**Other sessions:**
```bash
git pull
# See updated task status
```

## Heartbeat System

Sessions send heartbeats to show they're active:

```javascript
// Every 30 seconds, update lastHeartbeat
sessions[sessionId].lastHeartbeat = new Date().toISOString();
```

Sessions with no heartbeat for 5 minutes are marked "stale".

**Auto-cleanup:**
```bash
/tasks-session list --cleanup    # Remove stale sessions
```

## Integration with Other Commands

### With /tasks-parallel
```bash
/tasks-parallel --execute --sessions=worker-1,worker-2,worker-3
# Assigns tasks to specific registered sessions
```

### With /tasks-monitor
```bash
/tasks-monitor --session=monitor-1
# Monitor runs under registered session ID
```

### With /tasks-orchestrate
```bash
/tasks-orchestrate --coordinator=monitor-1
# Orchestrator uses session ID for coordination
```

## Getting Session ID

To see your current session info:

```bash
/tasks-session status
```

Or check the sessions file:
```bash
cat .claude/project-tasks/.sessions.json
```

## Error Handling

### Session Name Taken
```
❌ Session name "worker-1" is already registered

Options:
  1. Use a different name: /tasks-session register worker-2
  2. Take over (if stale): /tasks-session register worker-1 --force
```

### Task Already Claimed
```
❌ Task #7 is already claimed by "worker-1"

Options:
  1. Wait for worker-1 to release it
  2. Claim a different task: /tasks-session claim 8
  3. Force claim (use carefully): /tasks-session claim 7 --force
```

### Stale Session
```
⚠️ Session "worker-2" appears stale (no heartbeat for 8 minutes)

The session may have:
  - Lost connection
  - Been closed without /tasks-session end
  - Crashed

Options:
  1. Clean up: /tasks-session list --cleanup
  2. Take over tasks: /tasks-session claim 10 --force
```

## Best Practices

1. **Always register** when starting a session that will work on tasks
2. **Use meaningful names** like "monitor", "worker-frontend", "worker-api"
3. **End sessions properly** with `/tasks-session end`
4. **Pull before claiming** to see latest task states
5. **Push after completing** so other sessions see progress
