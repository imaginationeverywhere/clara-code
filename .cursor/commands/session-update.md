# /session-update — Reload Context After Clear

**EXECUTE IMMEDIATELY.** This is step 3 of the context refresh cycle: /session-continue → /clear → session-update.

## What This Does

Reloads ONLY what you need to keep working. No ceremony. No standup. No Slack check. Just context.

## Steps (DO ALL OF THESE)

### 0. Platform Vitals Check (MANDATORY — HQ owns this)
```bash
.claude/scripts/platform-vitals.sh --quiet
```
If exit code is `2` (DOWN), **you MUST surface the down systems before doing anything else**. Show the full output with `.claude/scripts/platform-vitals.sh --fresh`. HQ retains ownership; delegate fix to `/devops-team` if appropriate. Do not proceed with queued work until DOWN items are triaged with Mo. Non-HQ teams: report the DOWN list to the live feed and wait for HQ direction.

### 1. Detect Team Identity
```bash
echo $SWARM_TEAM
```
If set, you are that team. If not, you are Headquarters.

### 2. Read Session Checkpoint
Read `memory/session-checkpoint.md` — this is where you left off before /clear.

### 3. Read Team Registry (Agenda Only)
```bash
cat ~/auset-brain/Swarms/team-registry.md
```
Find YOUR team's section. Read the agenda and current roster. That's your task list.

### 4. Read Live Feed (Last 15 Lines)
```bash
tail -15 ~/auset-brain/Swarms/live-feed.md
```
See what happened since you saved. Any directives from HQ? Any team reports?

### 5. Read Philosophy (HQ Only)
If you are Headquarters, also read:
- `~/auset-brain/Philosophy/founders-intent.md`
- `~/auset-brain/Philosophy/the-struggle.md`
- `~/auset-brain/Philosophy/sankofa.md`

These are the WHY. The checkpoint is the WHAT. Both matter for HQ.

### 6. Confirm to Mo
Display:
```
SESSION UPDATED
━━━━━━━━━━━━━━━━━━━━
  Team: <team name or Headquarters>
  Platform vitals: <OK | DEGRADED | DOWN (N systems)>
  Checkpoint loaded: ✓
  Agenda loaded: ✓
  Feed checked: ✓

  LAST STATE:
  <2-3 lines from checkpoint — what was in progress>

  CONTINUING WITH:
  <next task from agenda>

  Ready.
━━━━━━━━━━━━━━━━━━━━
```

### 7. Resume Work
**DO NOT ask Mo what to do.** The checkpoint and agenda tell you. Continue executing.

## What This Does NOT Do
- No full startup ceremony
- No family standup
- No Slack check
- No cross-project context
- No git log review

Those belong to `/session-start` (cold boot). This is a hot reload.

## Operating Rules Still Apply
- Only your team's agents speak
- Mary is HQ boss
- Don't ask Mo for decisions in your AC
- Report to HQ on the feed
- Default permission mode (not auto) for teams

## Related Commands
- `/session-continue` — Save state before /clear
- `/clear` — Built-in Claude Code command
- `/session-start` — Full cold boot (new day)
- `/session-end` — Close session entirely
