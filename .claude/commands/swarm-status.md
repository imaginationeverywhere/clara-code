# /swarm-status — Check Swarm Progress Across All Herus

**Runs from:** Platform Central (boilerplate) OR any Heru
**Purpose:** Show progress, blockers, and burndown for the sprint

## Usage
```
/swarm-status                      # All 9 Herus summary
/swarm-status qcr                  # Single Heru detail
/swarm-status --blockers           # Only show blockers
/swarm-status --completed          # Only show completed tasks
```

## What It Does
1. Reads `~/auset-brain/Swarm-Tasks/<project>/sprint-tasks.md` for each Heru
2. Reads `~/auset-brain/Swarm-Reports/<project>/latest.md` for results
3. Calculates: total tasks, completed, in progress, blocked, failed
4. Shows burndown percentage toward 85% target

## Output Format
```
SWARM STATUS — March 20, 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
| Heru          | Total | Done | %    | Status |
|---------------|-------|------|------|--------|
| QCR           | 24    | 18   | 75%  | 🟡     |
| Clara         | 32    | 8    | 25%  | 🔴     |
| QuikNation    | 18    | 12   | 67%  | 🟡     |
| FMO           | 20    | 15   | 75%  | 🟡     |
| WCR           | 22    | 5    | 23%  | 🔴     |
| QuikCarry     | 28    | 20   | 71%  | 🟡     |
| Site962        | 16    | 14   | 88%  | 🟢     |
| My Voyages    | 14    | 3    | 21%  | 🔴     |
| Heru Feedback | 12    | 10   | 83%  | 🟢     |
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Overall: 186 tasks | 105 done | 56% | Target: 85%
Days remaining: 12
```

## Related Commands
- `/swarm-plan` — Generate tasks (Platform Central)
- `/swarm` — Execute tasks (each Heru)
- `/daisy --burndown` — Detailed burndown
