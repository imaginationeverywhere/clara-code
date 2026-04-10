# /create-agent-team — Spin Up a New Agent Team

**Created by:** Ossie Davis pattern (agent deployment automation)
**Named after:** Ossie Davis (1917-2005) — actor, director, activist. Deployed agents of change his entire life.

## Usage

```
/create-agent-team <team-name> "<description>"
/create-agent-team clara-code "Voice-first AI coding agent team"
/create-agent-team quiksession "Music studio IP tracking and blockchain attribution team"
```

## What This Command Does

1. **Mary defines roles** — Product Owner calls the team composition (who's needed)
2. **Ruby names agents** — Ruby researches and assigns historical Black figures to each role
3. **Ossie creates agent files** — `.claude/agents/<name>.md` for each team member
4. **Registers in agent-map** — adds entries to `.claude/scripts/agent-map.sh`
5. **Creates team registry entry** — adds team to `~/auset-brain/Swarms/team-registry.md`
6. **Creates swarm alias** — adds shell alias so Mo can launch with one command
7. **Writes initial agenda** — seeds the team's first session agenda from the description

## Execution Steps

### Step 1: Define Team Roles

Based on the team name and description, identify the roles needed:

**Standard team composition (adjust per team):**
- Product Owner — owns WHAT gets built
- Tech Lead — owns HOW it gets built, architecture decisions
- Frontend Engineer — owns UI/UX implementation
- Backend Engineer — owns API, DB, integrations
- Dev Relations / Specialist — domain-specific (varies by team)

### Step 2: Call Ruby to Name the Agents

For each role, Ruby (the naming agent) assigns a historical Black figure whose life and work match the role's responsibilities. Every name is a history lesson.

**Invoke Ruby's naming logic:**
```
For each role:
  - Research historical Black figures whose work aligns with the role
  - Check that the name isn't already taken in agent-map.sh
  - Assign name, write brief identity paragraph
  - Name format: first-name or first-last (lowercase, hyphenated)
```

**Naming rules:**
- No living people
- No sacred/martyr names (Malcolm X, MLK, Emmett Till — off limits)
- Every name should be someone students should know but often don't
- The name should TEACH something about Black history

### Step 3: Create Agent Files

For each named agent, create `.claude/agents/<name>.md`:

```markdown
---
name: <name>
full_name: <Full Historical Name> (<birth>-<death>)
role: <role on this team>
team: <team-name>
model: sonnet  # or opus for PO/TL, haiku for dispatch
---

# <Name> (<Full Name>)

**Historical context:** [2-3 sentences about who they were and why their work matches this role]

**Role on <team>:** [What this agent owns on the team]

**Domain:** [Specific technical/product domain]

**Does NOT:** [Clear boundaries — what this agent doesn't do]

**In the pipeline:** [How this agent fits in the team's workflow]
```

### Step 4: Register in agent-map.sh

Add to `.claude/scripts/agent-map.sh`:
```bash
register_agent "<name>" "<Full Name>" "<role>" "<team>" "<model>"
```

### Step 5: Create Team Registry Entry

Add to `~/auset-brain/Swarms/team-registry.md`:

```markdown
## <Team Name> Team

**PO:** <PO name>
**Tech Lead:** <TL name>
**Project path:** /path/to/repo
**Swarm alias:** <team>
**Status:** Active

### Team Roster
| Agent | Historical Figure | Role |
|-------|-----------------|------|
| <name> | <Full Name> | <role> |

### Session Agenda
[Generated from the team description — Sprint 1 tasks]

### Last Session Summary
[Empty until first session runs]
```

### Step 6: Create Shell Alias

Add to `.claude/scripts/agent-aliases.sh`:
```bash
alias <team>='SWARM_TEAM="<Team Name> Team" claude --project /path/to/repo'
```

### Step 7: Confirm to Mo

Output:
```
✅ <Team Name> Team created

Agents:
  • <name> (<Full Name>) — <role>
  • <name> (<Full Name>) — <role>
  [...]

Repo: <github-url>
Registry: ~/auset-brain/Swarms/team-registry.md
Launch: /<team-alias>

Ready to go.
```

## Notes

- Always check agent-map.sh before naming to avoid duplicates
- Teams inherit the swarm communication protocol (feed + inbox, no send-keys)
- Each agent gets a SOUL.md entry when the Hermes harness is ready
- The PO is always named from a figure known for institution-building, community leadership
- The Tech Lead is always named from a figure known for invention, engineering, problem-solving

## Related Commands

- `/create-agent` — Create a single agent (use for adding to existing teams)
- `/ossie` — Deploy a specific agent (register + activate)
- `/ruby` — Name an agent from historical Black figures
- `/session-start` — Boot a team session
