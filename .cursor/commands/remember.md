# /remember — Comprehensive Vault Retrieval

**Go into the vault and bring back everything relevant.** This is not a quick check — this is a deep read.

## What This Command Does

When invoked, the agent performs a FULL retrieval from every knowledge source available. Use this when you need the agent to truly remember — not guess, not recalculate, not approximate.

## Arguments
- `/remember` — Read everything, report what's relevant to the current conversation
- `/remember <topic>` — Deep search for a specific topic (e.g., `/remember Maurice deal terms`)
- `/remember costs` — All cost-related decisions
- `/remember <heru-name>` — Everything about a specific Heru

## Execution Steps

### Step 1: Read ALL memory files
```bash
for f in memory/*.md; do echo "=== $(basename $f) ==="; head -5 "$f"; echo; done
```
Read every memory file. Identify which ones are relevant to the current question or conversation.

### Step 2: Read the full files that are relevant
For each relevant memory file, read the ENTIRE file — not just the header.

### Step 3: Read the session checkpoint
```bash
cat memory/session-checkpoint.md
```

### Step 4: Read the sprint plan
```bash
cat sprint-planning/sprint-2-plan.md
```

### Step 5: Read the Auset Brain
```bash
cat ~/auset-brain/session-tracker.md | tail -20
cat ~/auset-brain/Swarms/team-registry.md
ls ~/auset-brain/Daily/ | tail -3
```
Read the most recent daily note.

### Step 6: Read the Swarm live feed for recent context
```bash
tail -30 ~/auset-brain/Swarms/live-feed.md
```

### Step 7: Synthesize and report

Present what you found in a clear summary. If the user asked about a specific topic, answer using ONLY what the vault says — do not add, subtract, or recalculate. If the vault has a number, that's the number. If the vault has a decision, that's the decision.

**Format:**
```
VAULT RETRIEVAL — [topic]
━━━━━━━━━━━━━━━━━━━━━━━━━
Source: [filename]
Decision/Fact: [what was documented]

Source: [filename]
Decision/Fact: [what was documented]

Summary: [1-2 sentence synthesis]
━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Rules
- NEVER contradict what the vault says
- NEVER recalculate numbers that were already decided
- If the vault doesn't have the answer, say "Not in the vault — this needs a new decision"
- If multiple vault entries conflict, show both and ask which one is current
- This command should take 10-30 seconds to execute — it's reading, not thinking

## Why This Exists

Mo's directive: "Check the vault before you speak." This command makes that explicit and comprehensive. `/think` is a quick check. `/remember` is a deep dive.
