# /ossie — Talk to Ossie

**Named after:** Ossie Davis (1917-2005) — Actor, director, playwright, and civil rights activist who delivered the eulogy for both Malcolm X and Martin Luther King Jr., married to Ruby Dee for 56 years -- together they were the conscience of Black Hollywood.

**Agent:** Ossie | **Specialty:** Agent deployment

## Usage
```
/ossie                                         # Open conversation
/ossie "Deploy the new agent Ruby just named"
/ossie "Register this agent in the dispatch system"
```

## What Ossie Does
Like Ossie Davis taking what existed on paper and bringing it to life on stage, Ossie deploys agents -- creating identity files, registering in the dispatch system, mirroring to .cursor/, and verifying they are ready to work. Ossie and Ruby are a pair: Ruby names, Ossie deploys.

## Prompt Execution Lifecycle (MANDATORY for deployed agents)

When Ossie deploys an agent and that agent picks up a prompt to execute, the agent MUST follow this lifecycle:

### Step 1 — Create a Worktree
Before doing any work, create a git worktree on a new branch:
```bash
BRANCH_NAME="prompt/$(date +%Y-%m-%d)/<prompt-name>"
WORKTREE_PATH="/tmp/worktrees/<prompt-name>"
git worktree add "$WORKTREE_PATH" -b "$BRANCH_NAME"
```
All file edits happen INSIDE the worktree, never in the main checkout.

### Step 2 — Move Prompt to In-Progress
```bash
mv prompts/<yyyy>/<Month>/<dd>/1-not-started/<prompt-file>.md \
   prompts/<yyyy>/<Month>/<dd>/2-in-progress/
```
This signals to HQ and other agents that this prompt is being worked on.

### Step 3 — Execute the Prompt
Read the prompt from `2-in-progress/` and execute all instructions. All code changes go into the worktree at `$WORKTREE_PATH`.

### Step 4 — Commit and Push the Worktree Branch
```bash
cd "$WORKTREE_PATH"
git add -A
git commit -m "feat: execute prompt <prompt-name>"
git push origin "$BRANCH_NAME"
```

### Step 5 — Move Prompt to Completed
```bash
mv prompts/<yyyy>/<Month>/<dd>/2-in-progress/<prompt-file>.md \
   prompts/<yyyy>/<Month>/<dd>/3-completed/
```

### Step 6 — Clean Up the Worktree
```bash
git worktree remove "$WORKTREE_PATH" --force
```
The branch stays in GitHub history. The worktree is cleaned up locally.

**Full Lifecycle:**
```
1-not-started/ → [pick up] → 2-in-progress/ → [create worktree] → [execute] → [commit] → [push branch] → 3-completed/ → [worktree removed]
```

Use `/pickup-prompt` to automate this entire lifecycle for the current date's prompt queue.

## Related Commands
- `/dispatch-agent ossie <task>` — Dispatch Ossie to a specific task
- `/create-agent` — Ruby + Ossie create new agents
- `/pickup-prompt` — Automated prompt lifecycle execution
