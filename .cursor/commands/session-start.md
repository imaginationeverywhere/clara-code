# session-start - Begin a Session with Full Context

Named after the ritual of preparation. Before Granville invented, before Mary built the business, before Maya wrote, before Nikki spoke — they prepared. They gathered what they knew. They remembered what mattered. Then they began.

That's what this command does. It prepares the mind before the work begins.

## Usage
```
/session-start
/session-start "Working on QCR pickup flow today"
/session-start --quick
```

## Arguments
- `<focus>` (optional) — What you plan to work on this session. Helps prioritize which memory to surface.
- `--quick` — Skip Slack check, just load memory and checkpoint. Fast start.
- `--full` — Full startup: memory + checkpoint + Slack + boilerplate update check + task list review.

## What This Command Does

Runs the session startup ritual in this order:

### 1. Read Obsidian Vault (PRIMARY — Carter's system)
Read from the Obsidian vault at `auset-brain/` — this is the platform's persistent second brain:

**a) Read MOC (Map of Content) — the master index:**
```
auset-brain/MOC.md
```
This replaces `memory/MEMORY.md`. It has LESSONS LEARNED at the top, links to all Decisions, Feedback, Projects, People, and Agents notes via `[[wikilinks]]`.

**b) Read today's daily note (if it exists):**
```
auset-brain/Daily/YYYY-MM-DD.md
```
This replaces `memory/session-checkpoint.md`. Contains last session's summary, decisions, and pending items.

**c) Read yesterday's daily note (if today's doesn't exist yet):**
```
auset-brain/Daily/YYYY-MM-DD.md  (yesterday's date)
```

**d) If `<focus>` was provided, search the vault:**
```bash
grep -rl "<focus keyword>" auset-brain/ --include="*.md" | head -10
```
Read the most relevant notes for the topic.

**Display:** Brief summary of where we left off + lessons loaded.

### 1b. Fallback: Read Flat Memory (if vault is empty or missing)
If `auset-brain/MOC.md` doesn't exist or is empty, fall back to the old system:
- Read `memory/session-checkpoint.md`
- Read `memory/MEMORY.md` and LESSONS LEARNED section
- Load topic-specific memory files if `<focus>` was provided

This ensures backward compatibility during the transition period.

### 3. Check Slack #maat-discuss (unless --quick)
Read the last 10 messages from `#maat-discuss` (C0AKQ8J63CN) — Amen Ra's direct line:
```bash
SLACK_TOKEN=$(aws ssm get-parameter --name '/quik-nation/shared/SLACK_BOT_TOKEN' --with-decryption --query 'Parameter.Value' --output text --region us-east-1) && curl -s "https://slack.com/api/conversations.history?channel=C0AKQ8J63CN&limit=10" -H "Authorization: Bearer $SLACK_TOKEN"
```
Summarize any flagged items, priorities, blockers, or decisions.

### 4. Report to User
Display a clean startup report:

```
SESSION START — March 15, 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LAST SESSION:
  [2-3 line summary of what happened]

PENDING:
  - [unfinished items from checkpoint]

LESSONS LOADED: [count] rules active

SLACK (#maat-discuss):
  [any flagged items, or "No new items"]

FOCUS: [whatever the user said, or "General session"]

Ready. What are we building?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 5. Initialize Session Tracking
Start tracking significant actions for the checkpoint update cycle (~every 10 actions).

## What This Command Does NOT Do
- Does NOT run boilerplate update checks (that's `session-startup-handler`)
- Does NOT create tasks or plans
- Does NOT start any agents or dispatch work
- Does NOT write any code

This is PREPARATION. Gathering context. Becoming ready.

## Why This Matters

Context loss is the #1 killer of productivity across Claude sessions. Every session starts from zero unless we actively recover state. This command is the antidote.

**Without `/session-start`:** "What were we working on?" → 10 minutes of archaeology.
**With `/session-start`:** Full context in 15 seconds. Start building immediately.

## Related Commands
- `/session-end` — Close the session, write checkpoint, preserve context
- `/gran` — Talk to Granville (architecture)
- `/mary` — Talk to Mary (product/business)
- `/council` — Talk to both Granville and Mary
