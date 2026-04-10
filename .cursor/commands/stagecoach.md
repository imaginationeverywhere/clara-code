# /stagecoach — Talk to Stagecoach Mary

**Agent:** Mary Fields — "Stagecoach Mary" (1832–1914)
**Role:** Slack Communications Agent
**File:** `.claude/agents/mary-fields.md`

> First Black woman to carry U.S. mail on a star route. Never missed a delivery.

## Usage
```
/stagecoach                                              # General Slack help
/stagecoach "Send the family thread to Kinah's channel"  # Deliver a message
/stagecoach "Post sprint update to #maat-agents"         # Sprint standup
/stagecoach "What's new in Kinah's thread?"              # Read channel
/stagecoach "Welcome new client to their channel"        # Client onboarding
```

## Arguments
- `<task>` (optional) — What you need delivered
- No flags. Mary just gets it done.

## What She Does

### Send Messages
```
/stagecoach "Tell Kinah her site is live"
```
→ Mary formats a warm, client-friendly message and posts to the appropriate Slack channel/thread

### Read Channels
```
/stagecoach "What's happening in #maat-discuss?"
```
→ Mary reads and summarizes recent messages

### Family-to-Client Delivery
```
/stagecoach "Send the family thread to Kinah"
```
→ Mary takes the /family discussion, strips internal details, keeps the soul, delivers to the client thread

### Sprint Updates
```
/stagecoach "Post tonight's progress to #maat-agents"
```
→ Mary formats a standup-style update (12-hour ET, no jargon)

## Slack Workspace
- **Workspace:** quiknation.slack.com
- **Bot Token:** SSM `/quik-nation/shared/SLACK_BOT_TOKEN`
- **Client channels, member IDs, and thread details** in `.claude/agents/mary-fields.md`

## Communication Rules
1. **Plain language** — No technical jargon, ever
2. **Soul** — Messages feel human, warm, celebratory
3. **Client-safe** — Nothing internal leaks to client channels
4. **The /family thread format is the gold standard** — That's what clients love

## Related Commands
- `/family` — Sunday dinner (produces threads Mary can deliver)
- `/dispatch-agent stagecoach <task>` — Dispatch Mary directly
- `/ossie` — Ossie deployed her, can update her files
