# /session-continue — Save Everything Before Context Clear

**EXECUTE IMMEDIATELY.** This is step 1 of the context refresh cycle: save → /clear → /session-update.

## What This Does

Saves all session state to the vault so nothing is lost when you /clear. Like /session-end but you DON'T leave.

## Steps (DO ALL OF THESE)

### 0. Platform Vitals Snapshot (MANDATORY — HQ owns this)
```bash
.claude/scripts/platform-vitals.sh --json > /tmp/vitals-snapshot.json
.claude/scripts/platform-vitals.sh --quiet
```
Capture the JSON snapshot so the post-/clear session knows platform state at save time. If exit code is `2` (DOWN), include the DOWN list in the checkpoint under a `## Platform vitals at save` section so the next session picks up the breakage, not stale optimism.

### 1. Update Session Checkpoint
Write the current session state to `memory/session-checkpoint.md`:
- What happened this session (bullet points)
- What's in progress right now
- What's next
- Any blockers
- Active teams and their last known status (from live feed)

### 2. Update Daily Note
Append to today's daily note at `~/auset-brain/Daily/YYYY-MM-DD.md`:
- Session summary since last save
- Key decisions made
- Work completed

### 3. Post to Live Feed
```bash
echo "$(date '+%H:%M:%S') | $(basename $(pwd)) | SESSION CONTINUE | ${SWARM_TEAM:-Headquarters} | Saving state before context clear" >> ~/auset-brain/Swarms/live-feed.md
```

### 4. Sync Vault to S3
```bash
aws s3 sync ~/auset-brain/ s3://auset-brain-vault/ --exclude ".git/*" --exclude ".gate-token" --exclude "*.sh" --quiet 2>/dev/null
```

### 5. Confirm to Mo
Display:
```
SESSION SAVED
━━━━━━━━━━━━━━━━━━━━
  Checkpoint: ✓
  Daily note: ✓
  Live feed:  ✓
  S3 sync:    ✓

  Safe to /clear now.
  After /clear, run /session-update to reload.
━━━━━━━━━━━━━━━━━━━━
```

## What Happens Next
Mo types `/clear` (built-in) → context goes to 0 → Mo types `/session-update` → essentials reload → keep working.

## Related Commands
- `/clear` — Built-in Claude Code command, wipes context
- `/session-update` — Reload essentials after /clear
- `/session-start` — Full cold boot (new day)
- `/session-end` — Close session entirely
