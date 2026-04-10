# /dispatch-agent — Send a Named Agent to a Task

**Amen Ra's direct dispatch command.** Bypass the queue, send a specific agent to a specific task.

## Usage
```
/dispatch-agent katherine "Fix the QCR dashboard layout"
/dispatch-agent cheikh "Add booking mutation to GraphQL schema"
/dispatch-agent rosa "Fix auth bypass on admin routes"
/dispatch-agent otis "Create n8n workflows for FMO"
/dispatch-agent robert "Provision EC2 for WCR backend"
```

## Arguments
- `<agent-name>` (required) — The named agent to dispatch
- `<task>` (required) — What they should do (natural language)
- `--target local|qc1|aws` — WHERE to dispatch (default: auto-detect)
- `--heru <name>` — Which Heru project
- `--priority high|normal|low` — Queue priority (default: normal)
- `--ac <criteria>` — Acceptance criteria for the task

## Agent Registry

### Process Managers (Don't Write Code)
| Agent | Named After | Role | Model |
|-------|-------------|------|-------|
| **Granville** | Granville T. Woods | Architect, requirements, PR merge | Opus 4.6 |
| **Mary** | Dr. Mary McLeod Bethune | Product Owner, client requirements | Opus 4.6 |
| **Maya** | Dr. Maya Angelou | Planner, task prompts, work queues | Sonnet 4.6 |
| **Nikki** | Dr. Nikki Giovanni | Dispatcher, monitoring, standups | Haiku 4.5 |
| **Gary** | Garrett Morgan | PR reviewer, code quality | Opus 4.6 |
| **Fannie Lou** | Fannie Lou Hamer | Deliverable validation | Opus 4.6 |

### Infrastructure (High-Stakes)
| Agent | Named After | Role | Model |
|-------|-------------|------|-------|
| **Robert** | Robert Smalls | CDK, EC2, AMI, IAM, cost tracking | Opus 4.6 |
| **Still** | William Still | SSH/SSM access, key management, file transfer | Cursor Auto |

### Coding Agents (Write Code)
| Agent | Named After | Specialty |
|-------|-------------|-----------|
| **Rosa** | Rosa Parks | Clerk auth, RBAC, JWT |
| **Katherine** | Katherine Johnson | Next.js, App Router, frontend |
| **Fela** | Fela Kuti | React Native, mobile, Expo |
| **Cheikh** | Cheikh Anta Diop | GraphQL backend, resolvers, schema |
| **Madam CJ** | Madam C.J. Walker | Stripe Connect, payments, payouts |
| **Imhotep** | Imhotep | PostgreSQL, DataLoader, queries |
| **Langston** | Langston Hughes | Email/Slack notifications |
| **Lorraine** | Lorraine Hansberry | Playwright E2E tests |
| **Clark** | Kenneth B. Clark | Auth/Security, identity verification |
| **Otis** | Otis Boykin | n8n workflows, automation |
| **Ida** | Ida B. Wells | Heru Feedback SDK integration |
| **Booker** | Booker T. Washington | Mobile builds on QC1 |

## Target Rules
- `--target local` — Run on Amen Ra's machine (ask first! Machine overheats)
- `--target qc1` — Internal Herus: QCR, QuikCarry, QuikNation, Site962
- `--target aws` — Client Herus: FMO, WCR, My Voyages

## Dispatch Process
1. Resolve agent name → load identity from `.claude/agents/<name>.md`
2. Resolve target → determine WHERE the agent runs
3. Build task prompt with acceptance criteria
4. Dispatch via Cursor Agent CLI (or Claude Code for process managers)
5. Agent creates worktree, executes task, creates PR when done
6. Report dispatch to Amen Ra

## Rules
- Every dispatched agent MUST create a PR when done
- ONE focused task per agent
- Max 4 concurrent Cursor agents on any machine
- Tester bugs = immediate priority, skip the queue
- NEVER run local agents without telling Amen Ra first
- Gap analysis BEFORE dispatch — never duplicate work

## Related Commands
- `/nikki` — Automated dispatch from queue (Nikki does this)
- `/gran` — Architecture decisions before dispatching
- `/ship` — Full pipeline (includes automated dispatch)
