# /tasks-parallel - Parallel Task Execution

Identify and execute independent tasks simultaneously using multiple agents.

## Usage

```
/tasks-parallel                     # Show parallelization opportunities
/tasks-parallel --execute           # Spawn agents for parallel tasks
/tasks-parallel --dry-run           # Preview without executing
/tasks-parallel --max-agents=3      # Limit concurrent agents (default: 3)
/tasks-parallel --wait              # Wait for all agents to complete
/tasks-parallel --task=7,8,9        # Execute specific tasks in parallel
```

## Implementation

### Step 1: Dependency Analysis

Build a dependency graph from tasks:

```javascript
function buildDependencyGraph(tasks) {
  const graph = {};

  for (const task of tasks) {
    graph[task.id] = {
      task,
      dependsOn: task.blockedBy || [],
      blocks: task.blocks || [],
      canStart: false
    };
  }

  // Mark tasks that can start
  for (const id in graph) {
    const node = graph[id];
    if (node.task.status === 'pending') {
      const allDepsComplete = node.dependsOn.every(depId => {
        const dep = graph[depId];
        return dep && dep.task.status === 'completed';
      });
      node.canStart = allDepsComplete;
    }
  }

  return graph;
}
```

### Step 2: Find Parallelizable Tasks

```javascript
function getParallelizableTasks(tasks) {
  return tasks.filter(task =>
    task.status === 'pending' &&
    (task.blockedBy || []).length === 0
  );
}
```

### Step 3: Display Analysis (default)

```
📊 Parallel Task Analysis

Dependency Graph:
  ┌─ #1 Setup (✅ completed)
  │
  ├─ #2 Auth (✅ completed)
  │   └─ #5 Dashboard (🔄 in progress)
  │
  ├─ #3 Database (✅ completed)
  │   └─ #6 API (🔄 in progress)
  │
  └─ #4 Config (✅ completed)
      ├─ #7 Email (⏳ ready)
      ├─ #8 Caching (⏳ ready)
      └─ #9 Docs (⏳ ready)

═══════════════════════════════════════════

PARALLELIZABLE TASKS: 3

  #7: Add email notifications
      Est: 30 min | No dependencies | Ready to start

  #8: Implement caching
      Est: 20 min | No dependencies | Ready to start

  #9: Write API docs
      Est: 15 min | No dependencies | Ready to start

These tasks have NO dependencies on each other
and can be executed SIMULTANEOUSLY.

Run '/tasks-parallel --execute' to start parallel execution.
```

### Step 4: Execute Parallel Tasks (--execute)

Spawn multiple agents using the Task tool:

```javascript
const parallelTasks = getParallelizableTasks(tasks);
const maxAgents = options.maxAgents || 3;
const tasksToRun = parallelTasks.slice(0, maxAgents);

const agents = [];

for (const task of tasksToRun) {
  // Update task status
  task.status = 'in_progress';
  task.startedAt = new Date().toISOString();
  task.assignedAgent = `agent-${generateId()}`;

  // Spawn agent
  const agent = Task({
    subagent_type: "general-purpose",
    description: `Execute: ${task.subject}`,
    prompt: buildTaskExecutionPrompt(task),
    run_in_background: true
  });

  agents.push({ task, agent });
}

// Save updated tasks
saveProjectTasks(tasks);
```

### Task Execution Prompt

```markdown
You are executing Task #${task.id} from the project task list.

**Task:** ${task.subject}

**Description:**
${task.description}

**Acceptance Criteria:**
${task.acceptanceCriteria?.map(c => `- [ ] ${c}`).join('\n') || 'None specified'}

**Instructions:**
1. Analyze the task requirements
2. Read relevant existing code to understand patterns
3. Implement the required functionality
4. Write or update tests
5. Ensure TypeScript compiles
6. Update documentation if needed

**On Success:**
Update .claude/project-tasks/tasks.json:
- Set status to "completed"
- Add completedAt timestamp
- Add summary to metadata

**On Blocker:**
Update .claude/project-tasks/tasks.json:
- Keep status as "in_progress"
- Add blocker description to metadata
- Do NOT mark as completed

**Files to update:**
.claude/project-tasks/tasks.json

**Important:**
- Follow existing project patterns
- Do not modify unrelated code
- Report progress in metadata
```

### Step 5: Monitor Parallel Execution

```
🚀 Parallel Execution Started

Agents Spawned: 3

┌────────────────────────────────────────────────────────────────┐
│ Agent A                                                        │
│ Task #7: Add email notifications                               │
│ Status: RUNNING                                                │
│ Output: /tmp/claude/.../agent-a.output                         │
│ Started: 15:30:00                                              │
├────────────────────────────────────────────────────────────────┤
│ Agent B                                                        │
│ Task #8: Implement caching                                     │
│ Status: RUNNING                                                │
│ Output: /tmp/claude/.../agent-b.output                         │
│ Started: 15:30:02                                              │
├────────────────────────────────────────────────────────────────┤
│ Agent C                                                        │
│ Task #9: Write API docs                                        │
│ Status: RUNNING                                                │
│ Output: /tmp/claude/.../agent-c.output                         │
│ Started: 15:30:04                                              │
└────────────────────────────────────────────────────────────────┘

Monitoring parallel execution...

Use these commands to check progress:
  Read /tmp/claude/.../agent-a.output    # Check Agent A
  Read /tmp/claude/.../agent-b.output    # Check Agent B
  Read /tmp/claude/.../agent-c.output    # Check Agent C
  /tasks-monitor                          # Full dashboard
```

### Step 6: Wait for Completion (--wait)

If `--wait` flag is used, wait for all agents:

```
⏳ Waiting for parallel agents to complete...

Progress:
  Agent A (#7): ████████░░░░░░░░ 50%
  Agent B (#8): ██████████████░░ 90%
  Agent C (#9): ████████████████ DONE ✅

Updates:
  15:35:00 - Agent C completed Task #9 (5 min)
  15:38:00 - Agent B completed Task #8 (8 min)
  15:42:00 - Agent A completed Task #7 (12 min)

═══════════════════════════════════════════

✅ All Parallel Tasks Completed

Results:
  Task #7: COMPLETED (email notifications added)
  Task #8: COMPLETED (Redis caching implemented)
  Task #9: COMPLETED (API documentation written)

Total time: 12 minutes (vs ~45 min sequential)
Time saved: ~33 minutes (73% faster)

Next: Run '/tasks-review' to review completed tasks
```

## Dry Run Mode (--dry-run)

Preview what would happen without executing:

```
🔍 Parallel Execution Preview (Dry Run)

Would spawn 3 agents:

  Agent A → Task #7 "Add email notifications"
    - Estimated duration: 30 min
    - Files likely affected: src/email/, src/templates/
    - Dependencies: none

  Agent B → Task #8 "Implement caching"
    - Estimated duration: 20 min
    - Files likely affected: src/cache/, src/config/
    - Dependencies: none

  Agent C → Task #9 "Write API docs"
    - Estimated duration: 15 min
    - Files likely affected: docs/api/
    - Dependencies: none

Potential conflicts: NONE
  (Tasks affect different areas of codebase)

To execute: /tasks-parallel --execute
```

## Conflict Detection

Before parallel execution, check for potential conflicts:

```javascript
function detectConflicts(tasks) {
  const filePatterns = tasks.map(t => t.metadata?.filesAffected || []);
  const conflicts = [];

  for (let i = 0; i < tasks.length; i++) {
    for (let j = i + 1; j < tasks.length; j++) {
      const overlap = findFileOverlap(filePatterns[i], filePatterns[j]);
      if (overlap.length > 0) {
        conflicts.push({
          task1: tasks[i].id,
          task2: tasks[j].id,
          files: overlap
        });
      }
    }
  }

  return conflicts;
}
```

If conflicts detected:
```
⚠️ Potential Conflicts Detected

Tasks #7 and #8 may both modify:
  - src/config/redis.ts

Options:
  1. Run sequentially (safer)
  2. Run in parallel (may need manual merge)
  3. Assign to same agent

Enter choice [1/2/3]: _
```

## Output on Completion

Updates to tasks.json after parallel execution:

```json
{
  "tasks": [
    {
      "id": "7",
      "status": "completed",
      "completedAt": "2025-01-31T15:42:00Z",
      "assignedAgent": "agent-abc123",
      "metadata": {
        "executionType": "parallel",
        "duration": "12m",
        "filesChanged": 5
      }
    }
  ],
  "orchestration": {
    "lastParallelRun": "2025-01-31T15:30:00Z",
    "parallelExecutions": [
      {
        "startedAt": "2025-01-31T15:30:00Z",
        "completedAt": "2025-01-31T15:42:00Z",
        "tasks": ["7", "8", "9"],
        "timeSaved": "33m"
      }
    ]
  }
}
```
