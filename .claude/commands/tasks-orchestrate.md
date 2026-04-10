# /tasks-orchestrate - Intelligent Task Orchestration

Full task orchestration with monitoring, parallel execution, and quality review.

## Usage

```
/tasks-orchestrate                    # Interactive orchestration mode
/tasks-orchestrate --auto             # Automatic task management
/tasks-orchestrate --parallel         # Focus on parallel execution
/tasks-orchestrate --review           # Focus on quality review
/tasks-orchestrate --monitor          # Continuous monitoring
/tasks-orchestrate --report           # Generate progress report
```

## Implementation

### Step 1: Load Task State

1. Read `.claude/project-tasks/tasks.json`
2. Build dependency graph from `blocks`/`blockedBy` fields
3. Categorize tasks by status and dependencies

### Step 2: Analyze Parallelization Opportunities

```
For each task with status="pending":
  If blockedBy is empty:
    Mark as PARALLELIZABLE
  Else:
    Check if all blocking tasks are completed
    If yes: Mark as READY
    If no: Mark as BLOCKED
```

**Output:**
```
📊 Dependency Analysis Complete

Parallelizable Tasks (can start now):
  #7: Add email notifications
  #8: Implement caching

Blocked Tasks (waiting on dependencies):
  #9: Deploy to production (blocked by #7, #8)

Dependency Chain:
  #7 ──┐
       ├──► #9
  #8 ──┘
```

### Step 3: Execute Parallel Tasks (--parallel or --auto)

When `--parallel` or `--auto` flag is used:

1. Identify parallelizable tasks
2. For each task, spawn a sub-agent using the Task tool:

```javascript
// Spawn parallel agents
const parallelTasks = getParallelizableTasks();

for (const task of parallelTasks.slice(0, maxAgents)) {
  // Use Task tool to spawn agent
  Task({
    subagent_type: "general-purpose",
    description: `Execute task: ${task.subject}`,
    prompt: buildTaskPrompt(task),
    run_in_background: true
  });
}
```

**Task Prompt Template:**
```markdown
You are executing a task from the project task list.

**Task ID:** ${task.id}
**Subject:** ${task.subject}
**Description:** ${task.description}

**Instructions:**
1. Read the task requirements carefully
2. Implement the required functionality
3. Run relevant tests
4. Update task status when complete
5. Report any blockers

**On Completion:**
- Update .claude/project-tasks/tasks.json
- Set status to "completed"
- Add completion summary to metadata

**On Blocker:**
- Update status to "blocked"
- Add blocker description
- Do NOT mark as completed
```

### Step 4: Monitor Progress (--monitor)

When `--monitor` flag is used:

1. Start a background monitoring loop
2. Every interval (default 5 minutes):
   - Check task statuses
   - Identify stale in-progress tasks
   - Detect newly completed tasks
   - Alert on blockers
3. Output monitoring dashboard

**Monitoring Loop:**
```
while (monitoring) {
  tasks = readProjectTasks()

  // Check for issues
  for (task of tasks) {
    if (task.status === 'in_progress') {
      elapsed = now - task.startedAt
      if (elapsed > 60 minutes) {
        alert("Task running long: " + task.subject)
      }
    }

    if (task.status === 'completed' && task.review?.required) {
      if (task.review.status === 'pending') {
        alert("Task needs review: " + task.subject)
      }
    }
  }

  // Display dashboard
  displayDashboard(tasks)

  sleep(interval)
}
```

### Step 5: Quality Review (--review)

When `--review` flag is used:

1. Find tasks marked completed or needing review
2. For each task:
   - Check acceptance criteria
   - Verify code changes
   - Run tests
   - Validate patterns
3. Mark as APPROVED or NEEDS_CHANGES

**Review Checklist:**
```
□ Acceptance criteria met
□ Code compiles without errors
□ All tests pass
□ No new linting errors
□ Documentation updated
□ No hardcoded secrets
□ Follows project patterns
```

### Step 6: Generate Report (--report)

Output a comprehensive progress report:

```markdown
# Task Progress Report
**Project:** quikcarrental
**Generated:** 2025-01-31 15:30:00

## Summary
- Total Tasks: 10
- Completed: 6 (60%)
- In Progress: 2
- Pending: 2
- Blocked: 0

## Velocity
- Avg completion time: 25 minutes
- Tasks completed today: 4
- Estimated remaining: 1 hour

## Dependency Graph
[Visual representation]

## Risk Areas
- Task #5 running longer than estimated
- Task #9 has multiple dependencies

## Recommendations
1. Consider parallelizing tasks #7 and #8
2. Review Task #5 for blockers
3. Break down Task #10 into subtasks
```

## Interactive Mode (default)

When run without flags, enter interactive mode:

```
╔═══════════════════════════════════════════════════════════════╗
║                    TASK ORCHESTRATOR                          ║
╠═══════════════════════════════════════════════════════════════╣
║ Commands:                                                     ║
║   [p] Parallel - Execute parallel tasks                       ║
║   [m] Monitor  - Start monitoring                             ║
║   [r] Review   - Review completed tasks                       ║
║   [s] Status   - Show current status                          ║
║   [d] Deps     - Show dependency graph                        ║
║   [q] Quit     - Exit orchestrator                            ║
╚═══════════════════════════════════════════════════════════════╝

Enter command: _
```

## Multi-Agent Coordination

### Spawning Background Agents

Use the Task tool with `run_in_background: true`:

```markdown
**Agent 1** (Task #7: Email notifications)
- Status: Running
- Output: /tmp/claude/.../agent-1.output
- Started: 15:00:00

**Agent 2** (Task #8: Caching)
- Status: Running
- Output: /tmp/claude/.../agent-2.output
- Started: 15:00:05

Use 'Read' tool on output files to check progress.
Use 'TaskOutput' tool to get final results.
```

### Result Collection

After agents complete:
1. Read each agent's output
2. Merge changes to task file
3. Handle any conflicts
4. Update orchestration status

## Output Examples

### Successful Parallel Execution
```
🚀 Parallel Execution Started

Spawned 3 agents:
  Agent A → Task #7 "Add email notifications" [RUNNING]
  Agent B → Task #8 "Implement caching" [RUNNING]
  Agent C → Task #9 "Write API docs" [RUNNING]

Progress:
  ████░░░░░░ 40% - Agent A making progress
  ██████░░░░ 60% - Agent B almost done
  ████████░░ 80% - Agent C finalizing

Completed:
  ✅ Agent C finished Task #9 (12 min)
  ✅ Agent B finished Task #8 (15 min)
  ✅ Agent A finished Task #7 (18 min)

All parallel tasks completed successfully!
```

### Review Output
```
🔍 Quality Review: Task #5

Acceptance Criteria:
  ✅ User can view dashboard
  ✅ Real-time data updates
  ⚠️ Mobile responsive (partial)
  ✅ Error states handled

Code Quality:
  ✅ TypeScript: No errors
  ✅ ESLint: No warnings
  ✅ Tests: 12/12 passed
  ⚠️ Coverage: 72% (target: 80%)

Security:
  ✅ No hardcoded secrets
  ✅ Input validation present
  ✅ Auth checks in place

Verdict: NEEDS_CHANGES
  - Improve mobile responsiveness
  - Increase test coverage to 80%

Task status updated to: IN_PROGRESS (needs revision)
```

## Integration Points

- **Task Sync**: Reads/writes `.claude/project-tasks/tasks.json`
- **Sub-Agents**: Uses Task tool for parallel execution
- **Background**: Uses `run_in_background` for monitoring
- **JIRA**: Can sync orchestration status to JIRA

## Best Practices

1. **Start Small**: Begin with 2-3 parallel agents max
2. **Review First**: Enable review for critical tasks
3. **Monitor Actively**: Use monitoring for long-running tasks
4. **Check Dependencies**: Ensure dependency graph is accurate
5. **Handle Failures**: Have a plan for agent failures
