# /swarm — Kick Off the Agent Swarm on This Project

**EXECUTE IMMEDIATELY.** This command turns this Heru session into a fully autonomous build machine.

## What /swarm Does

1. Reads the project's PRD, plans, and vault context
2. Identifies what needs to be built (gap analysis)
3. Creates a prioritized task list
4. Dispatches agents to tasks in parallel
5. Tracks progress and reports back
6. Writes results to the vault so the boilerplate can analyze

## Usage
```
/swarm                          # Full swarm — gap analysis + dispatch
/swarm --frontend               # Frontend tasks only
/swarm --backend                # Backend tasks only
/swarm --deploy                 # Deployment tasks only
/swarm --status                 # Show current swarm progress
/swarm --report                 # Generate swarm report for the boilerplate
```

## Execution Steps

### Step 1: Load Context
```
Read these in order:
1. docs/PRD.md (or docs/clara/CLARA_PRD.md) — what to build
2. ~/auset-brain/session-tracker.md — what happened recently
3. ~/auset-brain/hot-context.md — real-time cross-project updates
4. .claude/plans/micro/ — micro plans for this project
5. docs/swarm-accountability-rules.md — the rules
```

### Step 2: Gap Analysis
```
Run /gap-analysis or manually check:
- What screens/pages exist? (frontend/)
- What API endpoints exist? (backend/src/routes/)
- What GraphQL resolvers exist? (backend/src/graphql/)
- What database models exist? (backend/src/models/)
- What's deployed? (check Amplify/EC2 status)
- What's tested? (run npm test if exists)
```

### Step 3: Create Task List
```
For each gap found, create a task:
- Task name
- Agent assignment (Katherine for frontend, Daniel for backend, etc.)
- Estimated time (15 min / 45 min / 90 min)
- Dependencies (what must be done first)
- Acceptance criteria
```

### Step 4: Dispatch Agents via Cursor (NOT Claude subagents)

**CRITICAL: ALL coding tasks MUST use Cursor Agent CLI, NOT Claude Code subagents.**
Claude Code is the orchestrator — it dispatches Cursor agents to do the work.

```bash
# Use /dispatch-cursor to send tasks to Cursor agents:
/dispatch-cursor --agent katherine --task "Convert landing page from Magic Patterns"
/dispatch-cursor --agent daniel --task "Create Express server with Clerk auth middleware"
/dispatch-cursor --agent cheikh --task "Build GraphQL schema from PRD"

# Or use the cursor-orchestration skill directly:
# 1. Write a prompt file for each task
# 2. Launch cursor-agent-cli with the prompt
# 3. Collect results
```

**Why Cursor, not Claude subagents:**
- Cursor agents use the flat-rate subscription (no per-token cost)
- Claude Code Max usage is limited — save it for orchestration
- Cursor Auto/Composer handles coding tasks efficiently
- Cursor Premium for complex tasks (auth, payments, multi-file)

**Model assignment from sprint-tasks.md:**
- "Cursor Auto" → cursor-agent-cli with default model
- "Cursor Premium" → cursor-agent-cli with premium flag (needs Amen Ra approval)

### Step 5: Track & Report
```
After each task completes:
1. Update task status
2. Check time vs estimate
3. Run code review (/gary)
4. If passed, merge
5. If failed, apply 3-strike rule

Write swarm report to:
~/auset-brain/Swarm-Reports/<project>/<date>.md
```

### Step 6: Report Back to Boilerplate
```
Write summary to vault:
~/auset-brain/Swarm-Reports/<project>/latest.md

Contents:
- Tasks completed (count + list)
- Tasks failed (count + reasons)
- Agents replaced (count + reasons)
- Time spent vs estimated
- What's left to do
- Blockers for boilerplate to resolve
```

## Swarm Rules (from docs/swarm-accountability-rules.md)
- ALL coding = Cursor Auto/Composer (Tier 0) by default
- Complex tasks = Cursor Premium with approval
- Time limits: 15 min (small) → 2 hours (epic)
- 3 code review strikes = agent replaced
- Worktrees ALWAYS
- PR for every task
- Named agents only

## Vault Integration
- Read from: `~/auset-brain/` (cross-project context)
- Write to: `~/auset-brain/Swarm-Reports/<project>/`
- Hot context: `~/auset-brain/hot-context.md` (real-time updates)

## After Swarm
Run `/swarm --report` to generate the report, then the boilerplate session can run:
```
# From boilerplate:
/daisy --standup    # Reads all swarm reports
/daisy --burndown   # Calculates burndown across all 9 Herus
```

## Related Commands
- `/daisy` — Scrum Master (tracks all swarms)
- `/council` — Architecture + Product decisions
- `/ship` — Full pipeline (Granville → Maya → Nikki → agents → Gary → merge)
- `/gap-analysis` — Deep analysis of what's done vs what's needed

## Task Pull (from Platform Central)

When `/swarm` runs, FIRST check for pre-generated tasks:
```
~/auset-brain/Swarm-Tasks/<this-project>/sprint-tasks.md
```

If the file exists:
1. Read the task list
2. Skip gap analysis (already done by Platform Central)
3. Go straight to dispatch

If the file does NOT exist:
1. Run gap analysis locally
2. Generate tasks
3. Write them to the vault for Platform Central to see

## Writing Results Back

After EACH task completes, update:
```
~/auset-brain/Swarm-Reports/<this-project>/latest.md
```

Format:
```markdown
# Swarm Report — <Project> — <Date> <Time>

## Completed
- [x] Task 1 | Katherine | 32 min (est 45) | PR #12 merged
- [x] Task 2 | Daniel | 88 min (est 90) | PR #13 merged

## In Progress
- [ ] Task 3 | Cheikh | started 10 min ago

## Failed
- [!] Task 4 | Nat | 3 strikes on code review | REPLACED by Percy

## Blockers
- Need .env.develop credentials for Clerk
- Database not migrated yet

## Summary
Tasks: 8 total | 4 done | 2 in progress | 1 failed | 1 blocked
Burndown: 50%
```
