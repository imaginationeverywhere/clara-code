# /tasks-monitor - Background Task Monitoring

Launch a background agent to continuously monitor task progress and alert on issues.

## Usage

```
/tasks-monitor                      # Start monitoring (default 5 min interval)
/tasks-monitor --interval=10m       # Check every 10 minutes
/tasks-monitor --once               # Single check, no loop
/tasks-monitor --alert-blockers     # Only alert on blockers
/tasks-monitor --background         # Run as background agent
/tasks-monitor --stop               # Stop background monitor
```

## Implementation

### Step 1: Start Monitor

**Foreground Mode (default):**
Display live monitoring dashboard that updates periodically.

**Background Mode (--background):**
Spawn a background agent using Task tool:

```javascript
Task({
  subagent_type: "general-purpose",
  description: "Monitor task progress",
  prompt: `
    You are a task monitoring agent.

    **Instructions:**
    1. Read .claude/project-tasks/tasks.json every ${interval}
    2. Check for:
       - Tasks in progress > 1 hour
       - Completed tasks pending review
       - Blocked tasks
       - Parallelization opportunities
    3. Write alerts to .claude/project-tasks/.monitor-alerts.json
    4. Continue until stopped

    **Alert Format:**
    {
      "timestamp": "ISO-8601",
      "type": "warning|error|info",
      "taskId": "id",
      "message": "description"
    }
  `,
  run_in_background: true
});
```

### Step 2: Monitor Checks

On each interval, perform these checks:

#### Check 1: Stale In-Progress Tasks
```
For each task where status = "in_progress":
  If startedAt exists and (now - startedAt) > 60 minutes:
    Alert: "Task running long: {subject}"
```

#### Check 2: Pending Reviews
```
For each task where status = "completed":
  If review.required = true and review.status = "pending":
    Alert: "Task needs review: {subject}"
```

#### Check 3: Blocked Tasks
```
For each task where status = "pending":
  If blockedBy is not empty:
    Check if any blocking tasks are also blocked (deadlock)
    Alert if deadlock detected
```

#### Check 4: Parallel Opportunities
```
Count tasks where:
  status = "pending" AND blockedBy is empty
If count >= 2:
  Info: "{count} tasks ready for parallel execution"
```

### Step 3: Display Dashboard

```
╔═══════════════════════════════════════════════════════════════╗
║                    TASK MONITOR                               ║
║                    Last Check: 15:30:00                       ║
╠═══════════════════════════════════════════════════════════════╣
║ HEALTH                                                        ║
║   ✅ No blockers detected                                     ║
║   ⚠️  1 task running > 1 hour                                 ║
║   📋 2 tasks ready for parallel execution                     ║
╠═══════════════════════════════════════════════════════════════╣
║ IN PROGRESS                                                   ║
║   #5 Payment integration    [45 min] ██████████░░░░░░        ║
║   #6 User dashboard         [20 min] ██████░░░░░░░░░░        ║
╠═══════════════════════════════════════════════════════════════╣
║ PENDING REVIEW                                                ║
║   #4 Authentication flow    [completed 10 min ago]            ║
╠═══════════════════════════════════════════════════════════════╣
║ ALERTS                                                        ║
║   15:25 ⚠️  Task #5 approaching 1 hour mark                  ║
║   15:20 ℹ️  Tasks #7, #8 can run in parallel                 ║
╚═══════════════════════════════════════════════════════════════╝

Next check in: 4:32
[Press 'q' to quit, 'r' to refresh now]
```

### Step 4: Alert Storage

Write alerts to `.claude/project-tasks/.monitor-alerts.json`:

```json
{
  "lastCheck": "2025-01-31T15:30:00Z",
  "alerts": [
    {
      "id": "alert-001",
      "timestamp": "2025-01-31T15:25:00Z",
      "type": "warning",
      "taskId": "5",
      "message": "Task approaching 1 hour mark",
      "acknowledged": false
    },
    {
      "id": "alert-002",
      "timestamp": "2025-01-31T15:20:00Z",
      "type": "info",
      "taskId": null,
      "message": "2 tasks ready for parallel execution",
      "acknowledged": true
    }
  ],
  "stats": {
    "totalChecks": 15,
    "alertsGenerated": 5,
    "avgCheckDuration": "2.3s"
  }
}
```

## Output Examples

### Single Check (--once)
```
📊 Task Monitor - Single Check

Status:
  ✅ Completed: 4
  🔄 In Progress: 2
  ⏳ Pending: 4
  🚫 Blocked: 0

Issues Found:
  ⚠️  Task #5 "Payment integration" running for 65 minutes
  ℹ️  Task #4 completed but pending review

Opportunities:
  🚀 Tasks #7, #8, #9 can be parallelized (no dependencies)

Recommendations:
  1. Check on Task #5 - may be stuck
  2. Review Task #4 before starting dependent tasks
  3. Consider /tasks-parallel to speed up remaining work
```

### Background Monitor Started
```
🔄 Background Monitor Started

Agent ID: monitor-abc123
Interval: 5 minutes
Output: /tmp/claude/.../monitor-abc123.output

The monitor will:
  - Check task progress every 5 minutes
  - Write alerts to .claude/project-tasks/.monitor-alerts.json
  - Continue until you run /tasks-monitor --stop

To check status:
  - View alerts: Read .claude/project-tasks/.monitor-alerts.json
  - View output: Read /tmp/claude/.../monitor-abc123.output
  - Stop monitor: /tasks-monitor --stop
```

### Alert Notification
When running in background and an alert is triggered:
```
🚨 TASK MONITOR ALERT

Time: 2025-01-31 15:45:00
Type: WARNING
Task: #5 "Payment integration"

Message:
  Task has been in progress for over 1 hour.
  This may indicate:
    - Complex implementation
    - Unexpected blockers
    - Need for assistance

Suggested Actions:
  1. Check task status: /tasks-review --task=5
  2. View task details in tasks.json
  3. Consider breaking into subtasks
```

## Integration

- Writes to `.claude/project-tasks/.monitor-alerts.json`
- Reads from `.claude/project-tasks/tasks.json`
- Can trigger `/tasks-review` for completed tasks
- Can suggest `/tasks-parallel` when opportunities exist
