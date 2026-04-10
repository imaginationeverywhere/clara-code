# /marketing — Send to Marketing Team session

## Direct Communication (tmux send-keys)

If arguments are provided, inject the message directly into the Marketing tmux pane:

```bash
PANE_ID=$(tmux list-panes -a -F '#{pane_id} #{pane_title}' | grep -i 'marketing' | grep -v 'CURSOR' | head -1 | awk '{print $1}')
if [ -n "$PANE_ID" ]; then
  tmux send-keys -t "$PANE_ID" "$ARGUMENTS" Enter
  echo "Sent to Marketing ($PANE_ID): $ARGUMENTS"
else
  echo "ERROR: Marketing pane not found. Is the swarm running?"
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
.claude/scripts/session-registry.sh wake "Marketing" "$ARGUMENTS"
```

3. **Confirm** with status: "Sent to Marketing. [Active on TTY X / NOT FOUND]"

## The Marketing Team

**Reports to:** Mary (Product Owner)
**Specialty:** Brand strategy, cultural marketing, social media, PR, content, live streaming, VRD (Video/Radio/Display) generation

### The 11 Agents

| Agent | Namesake | Role |
|-------|----------|------|
| **Vince** | Vince Cullers | Copywriting + Targeted Ads |
| **Barbara** | Barbara Proctor | Brand Strategy + Ethical Growth |
| **Eunice** | Eunice Johnson | Experiential Marketing + Content |
| **Moss** | Moss Kendrix | PR + B2B Partnerships |
| **Don** | Don Cornelius | Cultural Marketing + Media |
| **Melvin** | Melvin Van Peebles | Short-Form Video (TikTok, Reels, Shorts) |
| **Gil** | Gil Scott-Heron | Long-Form Video + Audio (YouTube, Podcasts) |
| **Ethel** | Ethel Payne | Community + Conversations (X, Threads, Reddit, Discord) |
| **Romare** | Romare Bearden | Visual Brand + Discovery (IG, Pinterest, FB) |
| **Claude B** | Claude Barnett | B2B + Owned Audience (LinkedIn, Newsletter, WhatsApp) |
| **Dick** | Dick Gregory | Live Streaming + Black Platforms (Twitch, Fanbase, Blaqspot) |

### How to Dispatch

- `/marketing "<directive>"` — Send to the whole team (Mary routes)
- `/vince "<task>"` — Direct to Vince (copy + targeted ads)
- `/barbara "<task>"` — Direct to Barbara (brand strategy)
- `/don "<task>"` — Direct to Don (cultural moments)
- etc.

Team mapping: hq=Headquarters, pkgs=Packages, wcr=WCR, qn=QuikNation, st=Seeking, s962=962, qcr=QCR, qcarry=Carry, fmo=FMO, devops=DevOps, slk=Slack, pgcmc=PGCMC, kls=KLS, trackit=TrackIt, marketing=Marketing
