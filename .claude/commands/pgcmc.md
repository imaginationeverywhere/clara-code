# /pgcmc — Send to PGCMC session

**Team:** PGCMC Team
**Alias:** `pgcmc`
**Project:** `/Volumes/X10-Pro/Native-Projects/clients/new-pgcmc-website-and-app`
**Client:** Prince George's County Muslim Council (pgcmc.org)

## Direct Communication (tmux send-keys)

If arguments are provided, inject the message directly into the PGCMC tmux pane:

```bash
PANE_ID=$(tmux list-panes -a -F '#{pane_id} #{pane_title}' | grep -i 'pgcmc' | grep -v 'CURSOR' | head -1 | awk '{print $1}')
if [ -n "$PANE_ID" ]; then
  tmux send-keys -t "$PANE_ID" "$ARGUMENTS" Enter
  echo "Sent to PGCMC ($PANE_ID): $ARGUMENTS"
else
  echo "ERROR: PGCMC pane not found. Is the swarm running?"
  tmux list-panes -a -F '#{pane_id} #{pane_title}' | head -20
fi
```

## Fallback — Session Registry

If the tmux pane is not found, fall back to the session registry:

1. **Show active sessions** so the caller knows who's online:
```bash
.claude/scripts/session-registry.sh list
```

2. **Wake the team** (this also logs the directive to the live feed for HQ visibility):
```bash
.claude/scripts/session-registry.sh wake "PGCMC" "$ARGUMENTS"
```

3. **Confirm** with status: "Sent to PGCMC. [Active on TTY X / NOT FOUND]"

Team mapping: hq=Headquarters, pkgs=Packages, wcr=WCR, qn=QuikNation, st=Seeking, s962=962, qcr=QCR, qcarry=Carry, fmo=FMO, devops=DevOps, slk=Slack, pgcmc=PGCMC, kls=KLS, trackit=TrackIt
