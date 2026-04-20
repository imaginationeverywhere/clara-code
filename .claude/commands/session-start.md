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
- `<focus>` (optional) — What you plan to work on this session. Used as an extra `brain_query` topic.
- `--quick` — Skip Slack check; still load checkpoint, daily note, MOC snippet, and brain queries.
- `--full` — Full startup: everything below + Slack + (if configured) boilerplate/task checks.

## What This Command Does

Run the startup ritual **in this order**. Prefer **`brain_query`** (MCP tool `brain_query` from server `clara-brain`) for priorities and focus — do **not** load `memory/MEMORY.md` wholesale; it is a short index only (see repo `memory/MEMORY.md`).

### 1. Read `memory/session-checkpoint.md`

Repo-local handoff: what happened last session, pending work, decisions to preserve.

### 2. Read today’s daily note (vault)

Path pattern (expand `~`):

```
~/auset-brain/Daily/YYYY-MM-DD.md
```

If today’s file does not exist yet, read **yesterday’s** daily note instead.

### 3. Read **only** the LESSONS LEARNED / top section of `auset-brain/MOC.md`

Target ~20–40 lines — the map of content and “read first” links, not the entire vault.

### 4. `brain_query` — current priorities

Invoke:

```text
brain_query({ topic: "current priorities active pending work sprint", k: 10 })
```

Use results as the primary “what matters now” signal.

### 5. `brain_query` — optional focus

If the user passed `<focus>`, also run:

```text
brain_query({ topic: "<focus>", k: 5 })
```

### 6. Degraded mode (brain unreachable)

If `brain_query` fails (HTTP 5xx, timeout **5s**, missing API key, or MCP error):

- Say clearly: **DEGRADED MODE — brain API unavailable; using vault grep fallback.**
- Fallback: search the vault for the focus keyword:

```bash
grep -Rl "keyword" auset-brain/ --include='*.md' 2>/dev/null | head -10
```

Read the best-matching notes. Do **not** silently pretend the brain responded.

### 7. Slack `#maat-discuss` (unless `--quick`)

Read the last 10 messages from `#maat-discuss` (C0AKQ8J63CN):

```bash
SLACK_TOKEN=$(aws ssm get-parameter --name '/quik-nation/shared/SLACK_BOT_TOKEN' --with-decryption --query 'Parameter.Value' --output text --region us-east-1) && curl -s "https://slack.com/api/conversations.history?channel=C0AKQ8J63CN&limit=10" -H "Authorization: Bearer $SLACK_TOKEN"
```

Summarize flagged items, priorities, blockers, or decisions.

### 8. Report to user

Display a **compact** startup report (aim for minimal token use vs. dumping large files):

```
SESSION START — [date]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CHECKPOINT:
  [2-3 lines from session-checkpoint / daily note]

BRAIN (priorities):
  [short bullet summary from brain_query OR degraded-mode notice]

FOCUS QUERY:
  [if focus provided — short summary from brain_query or fallback]

SLACK (#maat-discuss):
  [flagged items, or "No new items" / skipped if --quick]

Ready. What are we building?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 9. Initialize session tracking

Start tracking significant actions for the checkpoint update cycle (~every 10 actions).

## What This Command Does NOT Do

- Does not load all of `auset-brain/MEMORY.md` or the full MOC into context — use `brain_query` + targeted reads.
- Does not run boilerplate update checks (see dedicated handlers/commands).
- Does not create tasks or plans by itself.
- Does not start agents or dispatch work.
- Does not write code.

This is **preparation**: gather context, then build.

## Why This Matters

Context loss is the #1 killer of productivity across sessions. **`brain_query`** pulls what matters; the vault index and `memory/MEMORY.md` stay thin.

## Related Commands

- `/session-end` — Close the session, write checkpoint, preserve context
- `/gran` — Talk to Granville (architecture)
- `/mary` — Talk to Mary (product/business)
- `/council` — Talk to both Granville and Mary
