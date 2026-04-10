# /swarm-plan — Generate Sprint Tasks for a Heru

**Runs from:** Platform Central (boilerplate)
**Purpose:** Generate the task list for a specific Heru and push to the vault

## Usage
```
/swarm-plan qcr                    # Generate tasks for QuikCarRental
/swarm-plan clara                  # Generate tasks for Clara Agents
/swarm-plan all                    # Generate tasks for ALL 9 Herus
/swarm-plan --status               # Show which Herus have plans
```

## What It Does
1. Reads the Heru's PRD/plans from the vault or project
2. Runs gap analysis (what exists vs what's needed)
3. Creates a task list with agent assignments + time estimates
4. Writes to `~/auset-brain/Swarm-Tasks/<project>/sprint-tasks.md`
5. Each task has: name, agent, estimate, acceptance criteria, dependencies

## Task File Format
```markdown
# Sprint Tasks — <Project> — <Date>

## P0 (Must ship for MVP)
- [ ] Task 1 | Agent: Katherine | Est: 45 min | AC: Page renders with all components
- [ ] Task 2 | Agent: Daniel | Est: 90 min | AC: All API endpoints return 200

## P1 (Should have)
- [ ] Task 3 | Agent: Cheikh | Est: 45 min | AC: GraphQL schema validates

## P2 (Nice to have)
- [ ] Task 4 | Agent: Lois | Est: 15 min | AC: Dark mode toggle works
```

## Where Tasks Live
```
~/auset-brain/Swarm-Tasks/
├── quikcarrental/sprint-tasks.md
├── claraagents/sprint-tasks.md
├── quiknation/sprint-tasks.md
├── fmo/sprint-tasks.md
├── world-cup-ready/sprint-tasks.md
├── quikcarry/sprint-tasks.md
├── site962/sprint-tasks.md
├── my-voyages/sprint-tasks.md
└── heru-feedback/sprint-tasks.md
```

## Related Commands
- `/swarm` — Pulls these tasks and executes them (runs in each Heru)
- `/swarm-status` — Check progress across all Herus
- `/daisy --burndown` — Burndown report
