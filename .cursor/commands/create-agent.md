# /create-agent — Ruby Names, Ossie Deploys

**Powered by:** Ruby (Ruby Dee) + Ossie (Ossie Davis)
**The couple:** Married 56 years. Masters of Ceremony at the March on Washington. Ruby gives identity. Ossie brings it to life.

## Usage
```
/create-agent "We need an agent for shipping integration"
/create-agent --name "Bessie" --role "API Gateway" --namesake "Bessie Coleman"
/create-agent --from-existing express-backend-architect
/create-agent --list                           # Show all named agents
```

## Arguments
- `<description>` (required unless using flags) — What the new agent should do
- `--name <name>` — Skip Ruby's naming step, use this name directly
- `--namesake <person>` — The historical figure this agent is named after
- `--role <role>` — The agent's role/specialty
- `--from-existing <agent-file>` — Name an existing generic agent (give it an identity)
- `--list` — List all named agents in the registry
- `--conversational` — This agent gets a name-based command (like `/gran`)
- `--action <command-name>` — This agent gets a purpose-based command

## How It Works

### Step 1: Ruby Names (Identity)
Ruby researches Black historical figures and finds the perfect match:
- The namesake's story MUST parallel the agent's role
- The name must be a teaching moment
- No duplicates in the registry

### Step 2: Ossie Deploys (Files)
Ossie creates all the files:

```
.claude/agents/<name>.md          ← Agent identity (who they are, their story)
.cursor/agents/<name>.md          ← Mirror copy

# If conversational agent:
.claude/commands/<name>.md        ← Talk to the agent
.cursor/commands/<name>.md        ← Mirror copy

# If action agent:
.claude/commands/<purpose>.md     ← What the agent does
.cursor/commands/<purpose>.md     ← Mirror copy
```

### Step 3: Register
- Add to Ruby's registry table in `.claude/agents/ruby-dee.md`
- Add to `/dispatch-agent` registry
- Verify dispatchable

## Naming Standard (NON-NEGOTIABLE)

| Agent Type | Command Name | Example |
|------------|-------------|---------|
| Conversational (you TALK to them) | Agent's name | `/gran`, `/mary`, `/nikki` |
| Action (they DO something) | The purpose | `/n8n-create-workflows`, `/validate-graphql` |

**Commands = PURPOSE. Agents = IDENTITY.**

The agent file holds WHO they are. The command file holds WHAT they do.

## Examples

### New Agent from Scratch
```
/create-agent "We need an agent for Twilio SMS campaigns"
```
→ Ruby: "Sojourner — Sojourner Truth. She traveled the country delivering her message to anyone who would listen. An SMS agent delivers messages everywhere."
→ Ossie: Creates `sojourner-truth.md`, command `sms-campaigns.md`, mirrors to `.cursor/`

### Name an Existing Generic Agent
```
/create-agent --from-existing express-backend-architect
```
→ Ruby: "Carter — Carter G. Woodson, Father of Black History. He structured how we understand and teach history. This agent structures how Express backends are architected."
→ Ossie: Creates `carter-woodson.md`, updates `express-backend-architect.md` to reference Carter

### Named Agent with Conversational Command
```
/create-agent --conversational --name "Zora" --namesake "Zora Neale Hurston" --role "Documentation and storytelling"
```
→ Ossie: Creates `zora-neale-hurston.md` + `/zora` command, mirrors to `.cursor/`

## The Registry

Current named agents are listed in `.claude/agents/ruby-dee.md` under "The Registry."

### Quick Reference
```
# Process Managers
/gran        → Granville (Architect)
/mary        → Mary (Product Owner)
/nikki       → Nikki (Dispatcher)
/gary        → Gary (PR Reviewer)
/fannie-lou  → Fannie Lou (Validator)

# Creation
/create-agent → Ruby + Ossie (naming + deployment)

# Full Pipeline
/ship        → Granville → Maya → Nikki → Agents → Gary → Fannie Lou → merge
/dispatch-agent <name> <task> → Send any named agent directly
```

## Related Commands
- `/gran --invent` — Granville invents a capability, then calls Ruby + Ossie
- `/dispatch-agent` — Dispatch any named agent
- `/ship` — Full pipeline
