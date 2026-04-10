# cron — Observable Recurring Tasks with Purpose

**Version:** 1.0.0
**Agent:** general-purpose

## Purpose

Start, stop, and monitor recurring tasks within a Claude Code session. Every cron job has a **name**, a **purpose** (why it's running), and optional **stop conditions**. This is how HQ monitors team sessions and how teams report progress.

## Usage

```bash
# Start a cron job
/cron start <interval> "<prompt>" --name <name> [--stop-after <duration>] [--stop-when "<condition>"] [--reason "<why>"]

# Stop a cron job
/cron stop <name>
/cron stop --all

# List active cron jobs
/cron list

# View a specific job's purpose and history
/cron status <name>
```

## Arguments

### `/cron start`

| Argument | Required | Description | Example |
|----------|----------|-------------|---------|
| `<interval>` | Yes | How often to run. Formats: `5m`, `10m`, `30m`, `1h` | `5m` |
| `"<prompt>"` | Yes | What to do each time it fires | `"Check live feed for team updates"` |
| `--name <name>` | Yes | Human-readable name for this job | `--name feed-watcher` |
| `--reason "<why>"` | No | WHY this job exists — the business purpose | `--reason "HQ needs to track team progress in vault"` |
| `--stop-after <duration>` | No | Auto-stop after this duration. Formats: `1h`, `2h`, `4h`, `8h` | `--stop-after 2h` |
| `--stop-when "<condition>"` | No | Natural language stop condition — checked each run | `--stop-when "all teams report AGENDA COMPLETE"` |
| `--quiet` | No | Don't output unless there's something new to report | `--quiet` |

### `/cron stop`

| Argument | Required | Description |
|----------|----------|-------------|
| `<name>` | Yes (unless --all) | Stop a specific job by name |
| `--all` | No | Stop all active cron jobs |

### `/cron list`

No arguments. Shows all active jobs with name, interval, reason, uptime, and next fire time.

### `/cron status <name>`

Shows detailed info for one job: reason, interval, times fired, last output, stop conditions.

## Execution Steps

### When `/cron start` is invoked:

1. **Validate the interval** — parse `5m` → `*/5 * * * *`, `1h` → `0 * * * *`, etc.

2. **Create the CronCreate job** with the prompt. Include the name and reason in the prompt preamble:
   ```
   [CRON: {name}] [REASON: {reason}]
   {user's prompt}
   If --stop-when condition is met, report it and suggest stopping this cron.
   If --quiet flag is set, only respond if there's something new to report.
   ```

3. **Store job metadata** in a session variable (or write to a temp file):
   ```json
   {
     "name": "feed-watcher",
     "cronId": "<id from CronCreate>",
     "interval": "5m",
     "prompt": "Check live feed for team updates",
     "reason": "HQ needs to track team progress in vault",
     "startedAt": "2026-03-31T10:30:00-04:00",
     "stopAfter": "2h",
     "stopWhen": "all teams report AGENDA COMPLETE",
     "timesFired": 0,
     "lastOutput": null
   }
   ```

4. **If --stop-after is set**, also create a one-shot CronCreate that fires at the stop time and deletes the recurring job:
   ```
   At {stop time}: CronDelete the job and announce "Cron '{name}' auto-stopped after {duration}"
   ```

5. **Confirm to user:**
   ```
   CRON STARTED
   ━━━━━━━━━━━━━━━━━━━━━━━━
     Name:     {name}
     Interval: every {interval}
     Reason:   {reason}
     Prompt:   "{prompt}"
     Stop:     {after duration | when condition | manual}
     ID:       {cronId}
   ```

### When `/cron stop` is invoked:

1. **Find the job** by name in the session metadata
2. **Call CronDelete** with the stored cronId
3. **If --all**, delete all tracked jobs
4. **Confirm:**
   ```
   CRON STOPPED
   ━━━━━━━━━━━━━━━━━━━━━━━━
     Name:     {name}
     Ran:      {timesFired} times over {uptime}
     Reason:   {reason}
   ```

### When `/cron list` is invoked:

Display a table:
```
ACTIVE CRON JOBS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Name            Interval   Reason                          Uptime    Fires
  feed-watcher    5m         Track team progress in vault    1h 23m    16
  deploy-watch    10m        Monitor Amplify deploy          0h 40m    4

  Stop conditions:
    feed-watcher:  auto-stop after 2h (37m remaining)
    deploy-watch:  stop when "Amplify shows green"
```

### When `/cron status <name>` is invoked:

```
CRON STATUS: feed-watcher
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Name:       feed-watcher
  Interval:   every 5 minutes
  Reason:     HQ needs to track team progress in vault
  Prompt:     "Check live feed for team updates"
  Started:    10:30 AM ET
  Uptime:     1h 23m
  Times fired: 16
  Stop after: 2h (37m remaining)
  Stop when:  all teams report AGENDA COMPLETE

  Last output (10:55 AM):
    Site 962 Team: PROGRESS — wired 12/21 dashboard pages
    QCR Team: AGENDA COMPLETE — all P1 bugs fixed
```

## Common Patterns

### HQ monitoring team sessions
```bash
/cron start 5m "Check ~/auset-brain/Swarms/live-feed.md for team updates. Report any AGENDA COMPLETE, REPORTING IN, PROGRESS, or TO:Headquarters messages. Store significant updates in the vault." \
  --name hq-feed-monitor \
  --reason "HQ tracks all team progress and stores in vault" \
  --stop-after 8h
```

### Team reporting to HQ
```bash
/cron start 5m "Write progress to ~/auset-brain/Swarms/live-feed.md with format: TIME | PROJECT | PROGRESS | TEAM | what we just did" \
  --name team-reporter \
  --reason "Team reports progress to HQ every 5 minutes" \
  --quiet
```

### Monitoring a deployment
```bash
/cron start 2m "Check Amplify deploy status for develop.quikcarrental.com. Report if status changes from PENDING to SUCCEED or FAILED." \
  --name deploy-watch \
  --reason "Watching QCR Amplify deploy after push to develop" \
  --stop-when "deploy shows SUCCEED or FAILED" \
  --stop-after 30m
```

### Monitoring build farm
```bash
/cron start 10m "SSH to QCS1 (ayoungboy@100.113.53.80) and check: disk usage, RAM, running Cursor agents, keychain status." \
  --name qcs1-health \
  --reason "Monitor build farm during swarm operations" \
  --stop-after 4h
```

### Watching for PR reviews
```bash
/cron start 15m "Check gh pr list --state open for any PRs needing review. Report new PRs or status changes." \
  --name pr-watcher \
  --reason "QCR team needs to know when Cursor agent PRs are ready for review" \
  --stop-when "no open PRs remain"
```

## Integration with Feed Watcher

The cron command complements the shell-based feed watcher (`.claude/scripts/feed-watcher.sh`):

| Tool | What it does | Cost |
|------|-------------|------|
| Feed watcher (tail -f) | Instant file change detection, writes to hq-notifications.md | $0 — pure shell |
| /cron feed-monitor | Reads feed into conversation, surfaces updates to user/agents | ~50 tokens/check |

**Both should run together.** Feed watcher catches events instantly. Cron brings them into the conversation where agents can act on them.

## Notes for Claude Code

When executing this command:

1. **Use CronCreate/CronDelete tools** — these are the underlying primitives
2. **Track metadata in conversation context** — job names, IDs, reasons, fire counts
3. **Respect --quiet flag** — if nothing new, say nothing (don't waste tokens)
4. **Include reason in every cron output** — so the user always knows WHY something is running
5. **Honor stop conditions** — check --stop-when condition each fire, announce when met
6. **Auto-expire reminder** — CronCreate jobs auto-expire after 7 days. Mention this on start.
7. **Off-minute scheduling** — avoid :00 and :30 marks. Pick odd minutes (e.g., :07, :23) to reduce API load.

## Related Commands

- `/loop` — Quick ad-hoc loop (simpler, no observability)
- `/session-start` — Starts standard crons for swarm coordination
- `/session-end` — Stops all crons and reports final status

## Command Metadata

```yaml
name: cron
category: infrastructure
agent: general-purpose
version: 1.0.0
author: Ossie Davis + Mary Bethune (HQ)
```
