# dispatch-agent — Dispatch Named Agents to Any Target

**Agent:** Bayard (Bayard Rustin — organized March on Washington, master of logistics and coordination)

Send named agents to Cursor Agent CLI on any machine — local, QC1, or AWS ephemeral swarm. Bayard resolves agent names to their full context (definition, skills, command knowledge), injects it into the prompt, and dispatches. One command to send any agent anywhere.

## Usage
```
# By agent name — Bayard auto-injects agent context
/dispatch-agent otis --heru fmogrooming "Create booking flow n8n workflows"
/dispatch-agent robert --target aws "Launch 3 agents for QCR"
/dispatch-agent katherine --target qc1 --heru quikcarrental "Fix Next.js routing"
/dispatch-agent cheikh --heru fmogrooming "Implement createFmoBooking resolver"

# By command name — resolves to the owning agent
/dispatch-agent /n8n-create-workflows --heru fmogrooming
/dispatch-agent /swarm-manage --target aws "Launch FMO swarm"
/dispatch-agent /pencil-design --heru quikcarrental "Design booking screens"

# Generic (no agent) — plain Cursor dispatch
/dispatch-agent --prompt tasks/prompts/PROMPT-FMO-A1.md --heru fmogrooming
/dispatch-agent "Run type-check and fix errors" --heru site962
```

## Arguments
- `<agent|command>` (first arg, optional) — Agent name or `/command` to invoke. Bayard looks up:
  - Agent def at `.claude/agents/<name>.md` — injects role, capabilities, constraints
  - Skills at `.claude/skills/<domain>/` — injects specialized knowledge
  - Command at `.claude/commands/<command>.md` — injects workflow steps
- `<prompt>` or `--prompt <path>` — Task text or path to task prompt file
- `--target local|qc1|aws` — Where to run (default: `local`)
  - **`local`** — Run Cursor Agent CLI on this machine
  - **`qc1`** — SSH into Quik Cloud (Mac M4 Pro) and run Cursor Agent there
  - **`aws`** — Provision ephemeral EC2 instance(s) via Robert's swarm launcher
- `--heru <name>` — Target one Heru project (fuzzy match)
- `--herus <a,b,c>` — Multiple Herus (comma-separated)
- `--agents <N>` — Number of parallel agents (default: 1, max: 6 for qc1, 5 for aws)
- `--tier 0|1` — Tier 0 = fast model (default); Tier 1 = deeper model for complex work
- `--parallel` — Dispatch to multiple workspaces in parallel
- `--sequential` — One workspace at a time
- `--plan` — Read-only: Cursor analyzes, no file changes
- `--ask` — Q&A mode: Cursor answers questions
- `--out-dir <dir>` — Output directory (default: `tasks/results/`)
- `--dry-run` — Print the exact command(s) without running

## Agent Quick Reference

### Core Team
| Name | Role | Command | Best Target |
|------|------|---------|-------------|
| **Granville** | Architect (Opus) | — | — (conversation only) |
| **Mary** | Product Owner (Opus) | — | — (conversation only) |
| **Maya** | Planner (Sonnet) | `/maya` | — (conversation only) |
| **Nikki** | Dispatcher (Haiku) | `/nikki` | — (pipeline only) |
| **Gary** | PR Reviewer | — | local |
| **Bayard** | Cursor Dispatcher | `/dispatch-agent` | all |

### Frontend Agents
| Name | Role | Command | Best Target |
|------|------|---------|-------------|
| **Katherine** | Next.js | — | qc1 (internal), aws (client) |
| **Dorothy** | Tailwind/CSS | — | qc1/aws |
| **Phillis** | Redux/State | — | qc1/aws |
| **Miriam** | Apollo Frontend | — | qc1/aws |
| **Nandi** | TypeScript Frontend | — | qc1/aws |
| **Chimamanda** | SEO | — | qc1/aws |

### Backend Agents
| Name | Role | Command | Best Target |
|------|------|---------|-------------|
| **Benjamin** | Express.js | — | qc1/aws |
| **Cheikh** | GraphQL Backend | — | qc1/aws |
| **Toussaint** | TypeScript Backend | — | qc1/aws |
| **Imhotep** | PostgreSQL | — | qc1/aws |
| **Dessalines** | Sequelize ORM | — | qc1/aws |

### Integration Agents
| Name | Role | Command | Best Target |
|------|------|---------|-------------|
| **Madam CJ** | Stripe Payments | — | qc1/aws |
| **Rosa** | Clerk Auth | — | qc1/aws |
| **Harriet** | Twilio SMS | — | qc1/aws |
| **Sojourner** | SendGrid Email | — | qc1/aws |
| **Mae** | Google Analytics | — | qc1/aws |

### Specialized Agents
| Name | Role | Command | Best Target |
|------|------|---------|-------------|
| **Otis** | n8n Workflows | `/n8n-create-workflows` | local/qc1 |
| **Robert** | Ephemeral Swarm | `/swarm-manage` | aws |
| **Lois** | Pencil AI Design | `/pencil-design` | local |
| **Carter** | Obsidian Memory | `/vault-sync` | local |
| **Clark** | Auth/Security | — | qc1/aws |
| **Fela** | Mobile (React Native) | — | qc1 |
| **Booker T** | QC1 Build Agent | — | qc1 |

### DevOps Agents
| Name | Role | Command | Best Target |
|------|------|---------|-------------|
| **Elijah** | AWS Cloud | — | aws |
| **Lewis** | Docker | — | qc1/aws |
| **Shirley** | CI/CD Pipeline | — | local |
| **Charles** | Git Workflow | — | local |

## Target Routing

### `--target local` (default)
Runs `cursor agent` directly on this machine.
```bash
cursor agent --print --trust --force --workspace <path> "<prompt>"
```
- Output captured to `tasks/results/<slug>.md`
- Max agents: limited by local resources

### `--target qc1`
SSHs into Quik Cloud (Mac M4 Pro at 100.113.53.80 via Tailscale) and runs `cursor agent` there.
```bash
ssh quik-cloud "cd ~/projects/<heru> && cursor agent --print --trust --force '<prompt>'" > tasks/results/<slug>.md
```
- SSH credentials from SSM: `/quik-nation/quik-cloud/ssh-*`
- Best for: Internal Herus (QCR, QC, QN, Site962), iOS/Android builds, heavy compute
- Max agents: 6 (M4 Pro handles it)
- Heru projects live at `~/projects/<heru>` on QC1

### `--target aws`
Hands off to Robert (swarm-manage) to provision ephemeral EC2 instances.
```bash
node infrastructure/swarm/orchestrator/swarm-launcher.js \
  --project <heru> --task-file <prompt-path> --agents <N>
```
- Best for: Client Herus (FMO, WCR, My Voyages), parallelizable tasks
- Cost: ~$0.02/agent/hr (t3.micro)
- Agents self-terminate on completion, create PRs targeting develop
- Max agents: 5 per launch

## Behavior (NON-NEGOTIABLE)

**CRITICAL: This command MUST use the Bash tool to run `cursor agent` CLI. NEVER use Claude subagents, Agent tool, or any other execution method. The ONLY acceptable execution is `cursor agent` via Bash.**

### Execution Steps

1. **Resolve agent** — If agent name given, read `.claude/agents/<name>.md` and extract role/context to prepend to prompt.
2. **Resolve prompt** — Use inline text or read from `tasks/prompts/` file. If prompt is long, save to `tasks/prompts/PROMPT-<SLUG>.md` first.
3. **Resolve workspace** — Current dir (default), or Heru path from `--heru`. Heru paths:
   - Internal: `/Volumes/X10-Pro/Native-Projects/AI/<heru>/` or `~/projects/<heru>` on QC1
   - Client: `/Volumes/X10-Pro/Native-Projects/clients/<heru>/`
4. **Save prompt to file** — Always save the full prompt to `tasks/prompts/PROMPT-<SLUG>.md` for traceability.
5. **Execute via Bash** — Run the EXACT command below. No exceptions:

**Local (`--target local`):**
```bash
cursor agent --print --trust --force \
  --workspace <WORKSPACE_PATH> \
  "$(cat tasks/prompts/PROMPT-<SLUG>.md)" \
  > tasks/results/<SLUG>-result.md 2>&1
```

**QC1 (`--target qc1`):**
```bash
ssh quik-cloud "cd ~/projects/<heru> && cursor agent --print --trust --force \
  '$(cat tasks/prompts/PROMPT-<SLUG>.md)'" \
  > tasks/results/<SLUG>-result.md 2>&1
```

**AWS (`--target aws`):**
```bash
ssh -i /tmp/build-farm-key.pem ec2-user@<IP> \
  "cd ~/projects/<heru> && cursor agent --print --trust --force \
  '$(cat tasks/prompts/PROMPT-<SLUG>.md)'" \
  > tasks/results/<SLUG>-result.md 2>&1
```

6. **Report** — After execution, show: target, workspace, output file path, exit code.

### What This Command Does NOT Do
- Does NOT use the Agent tool or Claude subagents — EVER
- Does NOT ask "should I run this?" — it RUNS IT (Amen Ra already said to dispatch)
- Does NOT suggest commands for the user to copy — it EXECUTES them via Bash

## CLI Contract (Bayard)
Every dispatch MUST use:
- `--print` — So output is capturable.
- `--trust` — No interactive trust prompts.
- `--workspace <path>` — Explicit project path.
Output MUST be written to `tasks/results/` (or specified `--out-dir`) and the path reported.

## Routing Rules (from memory)
- **Internal Herus** (QCR, QuikCarry, QuikNation, Site962) → `--target qc1`
- **Client Herus** (FMO, WCR, My Voyages) → `--target aws`
- **Boilerplate / platform work** → `--target local`
- When in doubt, use `--dry-run` to see the command before running.

## Safety
- Respect memory and max-agent limits per target.
- Use `--dry-run` to verify the command before running.
- QC1: Never touch Screen Sharing. Never exceed 6 concurrent agents.
- AWS: Robert handles provisioning and teardown. Instances self-terminate at 3hr max.
- All targets: Agents work in worktrees, NEVER in main checkout.

## Related Commands
- **/swarm-manage** — Robert's direct interface for AWS infrastructure (CDK, AMI, cost reports)
- **/nikki** — Talk to Nikki about what to dispatch; use /dispatch-agent to execute
- **/maya** — Maya produces task prompts in `tasks/prompts/`; Bayard runs them via this command
