# /think — Check the Vault Before You Speak

**MANDATORY before responding to ANY question about costs, architecture, decisions, or client details.**

## What This Command Does

Forces the agent to READ the vault and memory BEFORE generating a response. No guessing. No recalculating from scratch. No contradicting what was already decided.

## Execution Steps

### Step 1: Read ALL feedback memory files
```bash
ls memory/feedback-*.md memory/decision-*.md memory/project-*.md memory/reference-*.md 2>/dev/null
```
Scan the file names. Read any that are relevant to the current question.

### Step 2: Read the session checkpoint
```bash
cat memory/session-checkpoint.md
```

### Step 3: Read the sprint plan
```bash
cat sprint-planning/sprint-2-plan.md
```

### Step 4: Check the Auset Brain vault for relevant files
```bash
ls ~/auset-brain/Swarms/team-registry.md
cat ~/auset-brain/session-tracker.md | tail -10
```

### Step 5: THEN respond

Only after reading the relevant files, respond to the user's question. If a decision was already made and documented, cite it. Do not recalculate or contradict it.

## Why This Exists

Mo's repeated correction: "Check your vault before you speak." Every time an agent gives a different number, contradicts a previous decision, or forgets something already documented — that wastes time, usage, and Mo's patience. This command forces the thinking step.

## Usage
```
/think                    # Before answering a complex question
/think "How much do Maurice's agents cost?"
/think "What's the voice stack?"
```

The agent reads, then speaks. Like a person who checks their notes before opening their mouth.
