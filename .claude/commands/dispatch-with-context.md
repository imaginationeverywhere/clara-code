# dispatch-with-context — Send a Named Agent to Work WITH Full Context

**Version:** 1.0.0

## Purpose

Dispatch a named agent (Ahmad Baba, Imhotep, Granville, etc.) with FULL session context preserved. The agent knows who they are, what happened in this session, what Mo corrected, and what their specific task is. No blank slates.

## Usage

```
/dispatch-with-context <agent-name> "<task description>"
```

## How It Works

### Step 1: Write Context File
Before spawning the agent, run the context writer:
```bash
.claude/hooks/write-agent-context.sh "<agent-name>" "<task description>"
```

This creates `~/auset-brain/Swarms/agent-context/<agent-name>.md` with:
- Agent identity (from team registry)
- Session checkpoint (what happened before dispatch)
- Recent corrections from Mo (last 5 feedback files)
- Team assignment and role
- The specific task
- Non-negotiable rules

### Step 2: Spawn Agent with Context Instruction
When calling the Agent tool, the prompt MUST start with:

```
READ ~/auset-brain/Swarms/agent-context/<agent-name>.md FIRST — this is your identity and context.
Then read ~/auset-brain/Swarms/team-registry.md to find your team section.
Then execute your task.
Report progress to the live feed.

YOUR TASK:
<task description>
```

### Step 3: Agent Reads Context
The sub-agent's first action is reading the context file. It now knows:
- Who it is
- What the session has been about
- What Mo corrected recently
- Its specific task and acceptance criteria

### Step 4: Agent Reports Back
When done, the agent writes to the live feed and the vault.

## Example

```
/dispatch-with-context "Ahmad Baba" "Deploy Clara Crawl to the shared develop server at 98.83.4.34. Add Firecrawl to the Docker Compose. Verify /v1/scrape returns 200."
```

This:
1. Writes context file with session state, corrections, team info
2. Spawns agent with "READ context file FIRST" instruction
3. Ahmad Baba reads context → knows Clara Crawl architecture, pricing, Fargate decision
4. Ahmad Baba executes the task with full awareness
5. Reports completion to live feed

## What This Replaces

Before: `Agent tool with a cold prompt → blank slate agent`
After: `Context file + Agent tool → agent with full session awareness`

## For Agent Teams (SendMessage)

When agents communicate mid-task via SendMessage, they should reference the context directory:
```
"Check ~/auset-brain/Swarms/agent-context/ for other agents' context if you need to coordinate."
```

## Related
- `/dispatch-agent` — Original dispatch (no context preservation)
- `/cron` — Observable recurring tasks
- Team registry at `~/auset-brain/Swarms/team-registry.md`
