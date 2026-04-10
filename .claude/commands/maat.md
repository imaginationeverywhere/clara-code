# maat — Three-Tier Agent Orchestration

Coordinate AI agents as a disciplined team using the Maat Protocol: Architect (Tier 1) → Manager (Tier 2) → Workers (Tier 3).

**Agent:** `maat-orchestrator`
**Skill:** `maat-orchestration`

## Usage

```
/maat init                          # Set up .maat/ config in current project
/maat status                        # Show all tiers, running agents, health
/maat dispatch <task>               # Dispatch a Worker agent (respects max 4)
/maat plan <description>            # Have Manager tier create/update project plans
/maat loop                          # Start the Manager monitoring loop
/maat escalate <issue>              # Escalate an issue to Architect tier
/maat audit                         # Show agent action log
```

## Arguments

- `init` — Initialize `.maat/config.yml` in the current project. Interactive setup asks for preferred models, budget, and project type.
- `status` — Show running agents (Workers), loop status (Manager), and session info (Architect). Checks `ps aux | grep cursor-agent`.
- `dispatch <task>` — Dispatch ONE focused Worker task. ALWAYS checks agent count first. Refuses if >= 4 running. Task must be specific and single-purpose.
- `plan <description>` — Manager-tier work: write PRDs, create plans, run status commands, generate reports. Best run by Sonnet.
- `loop` — Start the Manager monitoring loop (5-minute intervals). Wraps `/loop-supervisor` with Maat Protocol guards.
- `escalate <issue>` — Write an escalation report for the Architect tier. Used when Manager encounters something beyond simple fixes.
- `audit` — Show recent agent actions from `/tmp/haiku-supervisor-report.md` and git logs across projects.

## How It Works

### The Three Tiers

```
┌─────────────────────────────────────────┐
│  TIER 1: ARCHITECT (Opus)               │
│  Strategy, architecture, complex decisions│
│  NEVER does grunt work                   │
│  Reviews escalations from Manager        │
├─────────────────────────────────────────┤
│  TIER 2: MANAGER (Sonnet/Haiku)         │
│  Monitor-Decide-Dispatch (MDD)           │
│  Sonnet: plans, PRDs, status, docs       │
│  Haiku: monitoring loop, quality checks  │
│  NEVER writes code — DISPATCHES workers  │
├─────────────────────────────────────────┤
│  TIER 3: WORKERS (Cursor)               │
│  Code, tests, fixes, commits, messages   │
│  ONE focused task per agent              │
│  Max 4 concurrent                        │
│  ALL execution happens here              │
└─────────────────────────────────────────┘
```

### Terminal Layout

```
Terminal 1:  claude                    # Opus — Architect
Terminal 2:  claude --model sonnet     # Sonnet — Builder/Planner
Terminal 3:  claude --model haiku      # Haiku — Monitor (runs /maat loop)
Background:  cursor agent ...          # Workers — dispatched by Manager
```

### The MDD Cycle (Manager)

Every loop iteration:
1. **Monitor** — Check agent output, type errors, test results, file changes
2. **Decide** — Simple fix? Complex issue? Needs Architect?
3. **Dispatch** — Simple → send Worker. Complex → write escalation report.

### Safety Guards (NON-NEGOTIABLE)

1. **Max 4 Workers** — Always run `ps aux | grep cursor-agent | grep -v grep | wc -l` before dispatching
2. **If >= 4, SKIP** — Do not queue, do not wait, just skip
3. **ONE task per dispatch** — Never give a Worker multiple tasks
4. **Monitor and REPORT** — Manager reports findings, only dispatches for clear simple fixes
5. **Never dispatch for type-checking or tests** — that's monitoring, not fixing

## Examples

### Initialize a project
```
/maat init
```
Creates `.maat/config.yml` with your tier preferences.

### Check what's running
```
/maat status
```
Shows: 2 Workers active (QuikCarry fix, WCR tests), Haiku loop running, Opus session active.

### Dispatch a fix
```
/maat dispatch "Fix unused imports in /Volumes/X10-Pro/Native-Projects/clients/fmo/backend/src/resolvers/"
```
Checks agent count, dispatches if under 4, refuses if at capacity.

### Start monitoring
```
/maat loop
```
Starts the Haiku monitoring loop across all active projects.

## Related Commands
- `/loop-supervisor` — The raw monitoring loop (wrapped by `/maat loop`)
- `/dispatch-cursor` — Direct Cursor dispatch (wrapped by `/maat dispatch`)
- `/project-mvp-status` — MVP tracking (can be triggered by `/maat plan`)
- `/project-status` — Post-MVP tracking

## Related
- **Agent:** `maat-orchestrator`
- **Skill:** `maat-orchestration`
- **Repo:** github.com/imaginationeverywhere/maat-protocol
- **Domain:** maatagent.com
