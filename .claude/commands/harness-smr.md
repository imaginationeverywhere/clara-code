# /harness-smr — Agent Harness SMR (Subject Matter Reference)

**SMR = Subject Matter Reference.** This command loads the full agent harness knowledge base for the Clara Platform Team and HQ. Use it to get oriented on harness patterns, our architecture decisions, and the relevant frameworks before doing any harness work.

## Usage
```
/harness-smr                          # Full reference dump
/harness-smr --concepts               # Core harness concepts only
/harness-smr --our-stack              # Clara's specific harness stack
/harness-smr --compare                # Framework comparison (Hermes vs Archon vs Paperclip)
/harness-smr --dispatch               # Dispatch patterns and workflow nodes
```

## What Is a Harness?

A **harness** is the infrastructure environment that wraps AI agents — the constraints, feedback loops, routing, memory, and governance that make agents reliable at scale. The model is NOT the product. The harness is the product.

> "Repository knowledge is the system of record — agents only know what's in the repo."
> "Corrections are cheap, waiting is expensive — optimize for fix-forward at high throughput."
> "Humans steer, agents execute."
> — awesome-agent-harness principles

---

## The Three Frameworks We Studied

### 1. Hermes (News Research) — Our Runtime
**What it is:** Self-improving, open-source AI agent framework. Python. 19K stars. MIT licensed.

**Key capabilities:**
- 40+ tools: web search, terminal, file system, browser automation, code execution, TTS, vision
- **Self-improving learning loop** — captures trajectories, packages interactions as reusable skills
- 6 deployment backends: local, Docker, SSH, Singularity, Daytona, **Modal** (serverless — pays $0 idle)
- 12 messaging platforms: Telegram, Discord, Slack, WhatsApp, Signal, Email, and more
- Cross-platform continuity — start CLI, get notified on Telegram, resume on Discord, no context lost
- Has `hermes-claw migrate` — one command to import OpenClaw memories, skills, API keys

**Why we chose it:** Self-improving memory baked into core. Python-native (compatible with Modal, Bedrock, Voxtral). Serverless backend. Hermes IS Clara's learning brain — it gets smarter the longer it runs with a user.

**Limitation:** Not Windows. Learning loop only triggers on complex tasks. Security: use Docker/Modal (not local) for production.

---

### 2. Archon (coleam00) — The Pattern We Use for Workflows
**What it is:** YAML workflow engine for AI coding agents. Think GitHub Actions but for agents. Makes agent behavior deterministic and repeatable.

**Key concepts:**
- **Workflow nodes** (YAML DAGs): prompt-based AI nodes, bash script nodes, git operations, human approval gates
- **Loop nodes**: "retry until tests pass" or "pause until human approves" as first-class constructs
- **Worktree isolation**: each workflow run gets its own git branch/worktree — true parallelism without merge conflicts
- **17 bundled workflows**: archon-fix-github-issue, archon-idea-to-pr, archon-smart-pr-review, archon-refactor-safely, etc.
- **Multi-platform dispatch**: same workflows from CLI, Slack, Telegram, GitHub webhooks, Discord

**Key insight for us:** Archon's workflow abstraction is exactly how we should encode our swarm prompts. Instead of "write a prompt and dispatch manually," we write a YAML workflow with validation gates and let the harness execute it. This is the future of our `prompts/` directory.

**Pattern we're adopting:** `prompt → YAML workflow → worktree isolation → validation gate → PR`

---

### 3. Paperclip — Our Governance Layer
**What it is:** Multi-agent framework / org chart governance. 41K stars. Exploded in weeks.

**Key insight:** Paperclip is NOT an AI agent. It's a **harness** — a framework that brings YOUR agents and builds a team around them.

**Architecture:**
- CEO agent gets the vision → delegates to team agents
- Each agent: unique skills, models, budgets, reporting lines
- Inbox-based delegation (agents assign tasks to each other + to you)
- Human approval gates built in
- GitHub integration: agents commit, push, create PRs
- Skills marketplace: install from skills.sh

**"Memento Man" mental model:** Each agent only knows what's written down. The harness IS the memory. This is exactly why our vault, SOUL.md files, and live-feed matter.

**How we use Paperclip in Clara:**
- `imaginationeverywhere/paperclip` — forked, governs Clara agent teams
- Org chart: 85 agents, their roles, who reports to whom
- Tickets: what work is assigned to which agent
- Budgets: inference spend limits per agent
- Heartbeats: is each agent healthy?

---

## Clara's Harness Stack (Decided — LOCKED)

```
┌─────────────────────────────────────────────┐
│         Paperclip (Governance)              │
│  Org chart · Tickets · Budgets · KPIs       │
└────────────────┬────────────────────────────┘
                 │ directives + status
                 ▼
┌─────────────────────────────────────────────┐
│      Hermes Gateway (claraagents.com)        │
│  Routes messages → correct agent instance   │
│  Platforms: Webhook, Telegram, Slack, SMS   │
└────────────────┬────────────────────────────┘
                 │
    ┌────────────┼────────────┐
    ▼            ▼            ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│  CLARA   │ │GRANVILLE │ │   MARY   │  × 85 agents
│ SOUL.md  │ │ SOUL.md  │ │ SOUL.md  │
│ Memory   │ │ Memory   │ │ Memory   │
│ Skills   │ │ Skills   │ │ Skills   │
│DeepSeek  │ │DeepSeek  │ │DeepSeek  │
│  V3.2    │ │  V3.2    │ │  V3.2    │
└──────────┘ └──────────┘ └──────────┘
                 │
    ┌────────────┼────────────┐
    ▼            ▼            ▼
┌──────────┐ ┌──────────┐ ┌────────────────┐
│  Bedrock │ │  Modal   │ │  S3 Vault      │
│ DeepSeek │ │  Voice   │ │  auset-brain   │
│  V3.2    │ │ (Voxtral)│ │  + Syncthing   │
└──────────┘ └──────────┘ └────────────────┘
```

### Component Decision Table

| Component | Platform | Status |
|---|---|---|
| Agent runtime | **Modal** (serverless, hibernates to $0) | To build |
| LLM inference | **Bedrock — DeepSeek V3.2** | To wire |
| Voice STT/TTS/Clone | **Modal voice server (Voxtral)** | LIVE ✓ |
| Gateway domain | **claraagents.com** | To deploy |
| Governance | **Paperclip** (imaginationeverywhere/paperclip) | To configure |
| Memory / vault | **S3 auset-brain-vault** | LIVE ✓ |
| Harness UI | **marketing.quiknation.com/harness** | To build |
| File sync (dev) | **Syncthing** | To install |

---

## Key Harness Principles (From Our Research)

### From awesome-agent-harness
1. **Repository is the system of record** — agents only know what's written down. The SOUL.md, live-feed.md, team-registry.md ARE the agent's world.
2. **Fewer tools, more expressiveness** — progressive disclosure. Don't overwhelm agents with 40 tools; give them what they need for their role.
3. **Corrections are cheap, waiting is expensive** — optimize for fast fix-forward, not perfect first-time.
4. **Mechanical architecture enforcement** — don't code review invariants; the harness enforces them.
5. **Humans steer, agents execute** — humans write specs + intent. Agents implement. Never the reverse.

### From Hermes
6. **Trajectory capture** — record every tool call, decision, and order. Package successful trajectories as reusable skills. THIS is how Clara improves over time.
7. **Serverless = zero idle cost** — Modal hibernates. You pay for compute seconds, not uptime. $5-10/mo for a 24/7 agent (vs dedicated VPS).
8. **Cross-platform continuity** — start on CLI, get notified on Telegram, respond on web. Context doesn't reset.

### From Archon
9. **YAML workflows encode team knowledge** — the harness holds institutional knowledge, not individual humans.
10. **Worktree isolation enables parallelism** — 5 agents can work on the same repo simultaneously without conflicts.
11. **Loop nodes = the QA feedback loop** — "implement until tests pass" is a first-class construct.

### From Paperclip
12. **Memento Man** — each agent only knows what's written down. The harness IS the memory. If it's not in the registry, the agent doesn't know it.
13. **CEO → team delegation** — the harness distributes work. Mo is a board member, not a task manager.
14. **Skills marketplace** — agents can be extended with new capabilities at runtime.

---

## The Harness Movement (Big Picture)

The industry is converging on this insight:

> **The model is NOT the differentiator. The harness is.**

OpenClaw went from 0 → 300K stars in 60 days because it solved platform routing, not because it built a better model. Paperclip went viral because it solved team governance, not because it's smarter than Claude. Hermes is growing because it solves memory, not because it has better weights.

**Clara's competitive advantage is NOT DeepSeek V3.2.**
**Clara's competitive advantage is the harness: SOUL.md files, vault memory, skill auto-learning, Paperclip governance, and the live-feed coordination layer.**

A competitor can copy our LLM choice in an afternoon. They cannot copy 400 years of cultural identity and 2 years of accumulated vault memory.

---

## The CP Team's First Build: Hermes + Gateway

The Clara Platform Team's immediate mission (Prompt 04 — pending Mo approval):

1. **Write Clara's SOUL.md** — identity, voice, rules, role
2. **Wire Bedrock DeepSeek V3.2** — config.yaml per agent
3. **Deploy Hermes Gateway to Modal** — claraagents.com entry point
4. **Test end-to-end** — Mo says "Hello Clara" → DeepSeek responds → Voxtral speaks

This is the harness going live. Everything else builds on top.

---

## Reference Documents (Read Before Building)

- `.claude/plans/2026-04-08-clara-agent-harness-full-architecture.md` — APPROVED full system diagram
- `.claude/plans/2026-04-08-harness-paperclip-platform-architecture.md` — Harness + Paperclip architecture
- `.claude/plans/2026-04-05-independent-agent-harness-architecture.md` — Original design (superseded)
- `prompts/2026/April/08/1-not-started/04-hermes-clara-setup.md` — Prompt 04 (pending Mo approval)
- `infrastructure/voice/VOICE-TO-SWARM.md` — Voice routing + agent groups
- `~/auset-brain/Swarms/team-registry.md` — Full team roster

---

## Related Commands
- `/cp-team` — Open Clara Platform Team session
- `/harness-smr` — This document (SMR reference)
- `vtalk cp-team` — Talk to CP team via voice
- `/session-start` — Full session startup with harness context
