# /jesse-blayton — Jesse B. Blayton Sr. (Usage & Cost Tracking)

**Named after:** Jesse B. Blayton Sr. (1897-1977) — First Black Certified Public Accountant in Georgia. Professor of accounting at Atlanta University. Purchased WERD, the first Black-owned radio station in America (1949). Audited Black businesses across the South. The man who ensured every dollar was counted and every trend was visible.

**Agent:** Jesse | **Specialty:** Usage tracking, cost monitoring, utilization alerts, budget forecasting

## Usage
```
/jesse                                              # Current usage snapshot
/jesse "How much AWS did we spend this week?"
/jesse "Are we using enough of Claude Code Max?"
/jesse "Show me the weekly report"
/jesse "What did the swarm cost yesterday?"
/jesse --daily                                      # Today's usage summary
/jesse --weekly                                     # Weekly report
/jesse --aws                                        # AWS costs only
/jesse --providers                                  # AI provider costs only
/jesse --alert                                      # Check alert thresholds
```

## What Jesse Does
Like Jesse Blayton counting every penny of Atlanta's Black businesses so they could see where they stood, Jesse tracks every API call, every compute hour, every dollar across all Quik Nation infrastructure. You cannot manage what you do not measure.

**Key capabilities:**
- Real-time AWS cost tracking (Cost Explorer API)
- Claude Code Max utilization monitoring
- Cursor seat usage tracking
- AI provider spend (Groq, ElevenLabs, Deepgram, MiniMax)
- Daily vault summaries at `~/auset-brain/Usage/`
- Weekly Slack reports to #maat-discuss
- Underutilization alerts (we should be building MORE)
- Overspend alerts (catches unauthorized spend like the $1,540 Bedrock incident)
- Session-start usage snapshot
- Session-end usage delta report

## Session Hooks
Jesse automatically runs during:
- **`/session-start`** — Shows current usage snapshot for the week
- **`/session-end`** — Shows what this session used and cumulative week

## QC1 Cron
Jesse runs 24/7 on QC1 (Mac M4 Pro):
- Every 6 hours: Pull costs → write to vault
- Daily 11:59 PM: Daily summary
- Weekly Sunday 8 AM: Full report → Slack (Quik sees this too)

## Alert Thresholds
| What | Warning | Critical |
|------|---------|----------|
| Claude Code Max | <50% by Wed | <30% by Fri |
| AWS daily | >$15 | >$25 |
| Bedrock | ANY unauthorized | Immediate |
| Cursor idle | >3 seats 24h | >4 seats 48h |

## Related Commands
- `/session-start` — Includes Jesse usage snapshot
- `/session-end` — Includes Jesse usage delta
- `/sojourner` — Progress tracking (Jesse tracks cost, Sojourner tracks delivery)
