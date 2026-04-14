# ship - Full Pipeline: Granville → Maya → Nikki → Agents → Gary

**The one command that runs the entire pipeline.** You describe what you want built, and the swarm handles the rest.

Named after the pipeline itself — four Black inventors working in sequence to ship code:
- **Granville** (Opus) writes requirements — Granville T. Woods, "The Black Edison"
- **Maya** (Sonnet) plans tasks + n8n workflows — Dr. Maya Angelou
- **Nikki** (Haiku) dispatches to ephemeral swarm — Dr. Nikki Giovanni
- **Gary** (Opus/Bedrock) reviews PRs and merges — Garrett Morgan, inventor of the gas mask and traffic light

## Usage
```
/ship "Add a chatbot to n8n using Ollama on QC1"
/ship "Fix the QCR pickup location bug"
/ship "Deploy Heru Feedback widget to all 53 Herus"
/ship "Build the Discovery intake form for Kinah"
```

## Arguments
- `<what_to_build>` (required) — Plain English description of what you want shipped
- `--priority critical|high|medium|low` — Sets dispatch priority (default: high)
- `--project <name>` — Target project (auto-detected if not specified)
- `--dry-run` — Show what would happen without dispatching

## What This Command Does

### Phase 1: Granville (Requirements) — ~2 minutes
1. Read the request and existing project context
2. Write a requirement doc at `tasks/requirements/REQ-<name>.md`
3. Include: MVP features, acceptance criteria, n8n workflow events, Auset modules needed

### Phase 2: Maya (Planning) — ~3 minutes
1. Read the requirement doc
2. Analyze the target project's codebase
3. Create task prompts with specific file paths, agent/skill selection
4. Create n8n workflow JSON if applicable
5. **MANDATORY:** Append `tasks/prompts/QUALITY-GATE-FOOTER.md` to every task prompt
6. Output: Farm-ready task prompts at `tasks/prompts/`

**Every task prompt MUST end with the Quality Gate footer.** This tells the agent exactly what to run before creating a PR. The footer lives at `tasks/prompts/QUALITY-GATE-FOOTER.md` — Maya appends it, agents execute it.

### Phase 3: Nikki (Dispatch) — ~1 minute
1. Read Maya's task prompts
2. Provision ephemeral t3.micro instances via `ec2.runInstances()`
3. Bootstrap each instance with project repo + required commands/agents/skills
4. Each agent works in a worktree, executes its task, creates a PR
5. Instances self-destruct after PR creation

### Phase 3.5: Quality Gate (MANDATORY — Blocks PR Creation)
**Every agent MUST pass ALL checks before creating a PR. No exceptions.**

```bash
# 1. TypeScript compiles — ZERO errors
pnpm run type-check

# 2. Build succeeds — ZERO errors
pnpm run build

# 3. Lint passes — ZERO errors
pnpm run lint

# 4. Tests pass — ALL green
pnpm run test

# 5. GraphQL validates (if backend)
pnpm run graphql:validate

# 6. Schema validates on ALL databases — ZERO mismatches
pnpm run validate:schema:local
pnpm run validate:schema:develop
pnpm run validate:schema:production

# 7. Migrations applied to ALL databases
NODE_ENV=local pnpm run db:migrate
NODE_ENV=develop pnpm run db:migrate
NODE_ENV=production pnpm run db:migrate

# 8. Docker healthcheck (if Docker project)
docker-compose up -d && sleep 60 && docker-compose ps
```

**Rules:**
- Agent CANNOT create PR until ALL checks pass
- If any check fails: fix it, don't skip it
- No `@ts-ignore`, no weakening tsconfig, no suppressing errors
- PR description MUST include output of `pnpm run type-check` and `pnpm run validate`
- If agent cannot fix a failure: report to Slack with error details (do NOT ship broken code)

**Why this exists:** On March 15, 2026, QCR had 549 TypeScript errors across 148 files, a production schema mismatch, and Docker backend unhealthy — because agents shipped code without running validation. A separate Cursor agent had to be dispatched just to fix the mess. This gate prevents that from ever happening again.

### Phase 4: Gary (Review & Merge) — ~5 minutes per PR
1. Opus on AWS Bedrock reviews each PR
2. **FIRST:** Verify Quality Gate passed (check PR description for validation output)
3. Checks: acceptance criteria met, no regressions, code quality, security
4. **If Quality Gate output missing from PR:** REJECT immediately, agent must re-run
5. Approves and merges to `develop` branch
6. Destroys the worktree
7. Reports results to Slack

## Pipeline Architecture
```
/ship "Build X"
  → Granville writes REQ-*.md (with acceptance criteria on EVERY section)
    → Maya creates task prompts + n8n workflows (includes Quality Gate checklist)
      → Nikki provisions ephemeral swarm (ec2.runInstances)
        → Agents execute in worktrees
          → QUALITY GATE: type-check, build, lint, test, validate, migrate, docker
            → Agents create PRs (with validation output in description)
              → Gary (Bedrock Opus) verifies gate + reviews → merges → destroys worktree
                → Slack report to #maat-agents
```

## Cost Per Ship
- Ephemeral instances: ~$0.17 per 8-instance cycle
- Bedrock Opus review: ~$0.05 per PR review
- Total: **~$0.50-$2.00 per feature shipped**

## Examples

### Ship a feature
```
/ship "Add dark mode to the QCR mobile app"
```
→ Granville writes the requirement → Maya plans 3 tasks (theme provider, toggle component, style updates) → Nikki dispatches 3 instances → Agents create 3 PRs → Gary reviews and merges all 3

### Ship a bug fix
```
/ship --priority critical "Fix the pickup location showing Main Office instead of actual address"
```
→ Granville writes requirement with the `simple.ts` resolver fix → Maya creates 1 task prompt → Nikki dispatches 1 instance → Agent fixes it → Gary merges

### Dry run
```
/ship --dry-run "Integrate Canopy insurance into QCR booking flow"
```
→ Shows the requirement, task prompts, and estimated cost without dispatching

## Related Commands
- `/gran` — Talk to Granville about what to build (think before you ship)
- `/maat` — Three-tier orchestration details
- `/progress` — Check what's been shipped
