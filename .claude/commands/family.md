# family — Broadcast to the Quik Nation Agent Family

**Command (not an agent).** Any agent can use this. No agent definition, no registry entry.

Broadcasts a message to the entire Quik Nation agent family and key humans: #maat-agents and a DM to Quik (Rashad). Use for welcomes, milestones, sprint wins, and culture moments.

## Usage

```
/family "Welcome Bessie to the family!"
/family "FMO Sprint 1 complete — 3 PRs delivered from AWS"
/family "Rosa fixed 5 auth bypasses today"
/family --milestone "First PR from ephemeral swarm"
/family --include cali "Cali, heads up: Rekhit deploy in 10"
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<message>` | Yes | The message to broadcast. Plain language, no jargon. |
| `--milestone` | No | Marks this as a milestone announcement (adds celebration formatting). |
| `--include <names>` | No | **Future:** Additional people to DM (e.g. cali, ed, vision, kinah). Not implemented yet; document for when Slack IDs are available. |

## What It Does

1. **Posts to Slack #maat-agents** (channel `C0AKANS4UNB`) — all agents see this channel.
2. **DMs Quik (Rashad)** (user `U01V84TNMGT`) — co-founder, always in the loop.
3. **Signs from the invoker** — e.g. Granville, Mary, The Council, Nikki, or whoever is running the command.
4. **Plain language only** — no jargon (feedback rule).
5. **Timestamps in Eastern time** (feedback rule).

## Message Format

**Regular message:**
```
[Agent Name]: <message>
— <timestamp ET>
```

**Milestone:**
```
MILESTONE: <message>

— <Agent Name>, <timestamp ET>
```

## Execution (MUST use Bash + Slack API)

The executing agent MUST run Bash to call the Slack API. Do not dispatch a Claude subagent for this.

### Steps

1. **Resolve signer** — From context, set `SIGNER` (e.g. "Granville", "Mary", "The Council", "Nikki"). Default: "Quik Nation".
2. **Build message body** — Use the format above (regular or milestone). Keep it short and plain.
3. **Get Eastern timestamp** — In Bash: `TZ=America/New_York date '+%b %d, %Y at %I:%M %p ET'`.
4. **Fetch token** — `SLACK_TOKEN=$(aws ssm get-parameter --name '/quik-nation/shared/SLACK_BOT_TOKEN' --with-decryption --query 'Parameter.Value' --output text --region us-east-1)`.
5. **Post to #maat-agents** — `chat.postMessage` with `channel: "C0AKANS4UNB"` and the formatted text.
6. **DM Quik** — `chat.postMessage` with `channel: "U01V84TNMGT"` and the same formatted text.

### Bash / cURL Pattern

- Use SSM to get `SLACK_BOT_TOKEN` (parameter `/quik-nation/shared/SLACK_BOT_TOKEN`).
- Post to channel AND to Quik — always both.
- Escape the message body for JSON (newlines as `\n`, quotes as `\"`), or use `jq -n --arg text "$BODY" '{channel: "C0AKANS4UNB", text: $text}'` to build the payload safely.

## Slack IDs (Reference)

| Target | ID |
|--------|-----|
| #maat-agents | C0AKANS4UNB |
| Quik (Rashad) | U01V84TNMGT |
| Ibrahim Aziz | U05UPV1B89F |
| Ryan Beckles | U05UQBGKNFK |
| **Token (SSM)** | `/quik-nation/shared/SLACK_BOT_TOKEN` |

## Behavior Rules

- **MUST** use Bash to call the Slack API (no Claude subagents for the post).
- **MUST** use SSM for `SLACK_BOT_TOKEN`.
- **MUST** post to the channel and DM Quik — always both.
- Keep messages short and plain language.
- **Future:** `--include` adds DMs to named people (lookup their Slack IDs when implemented).

## Why This Exists

Family celebrates together. When someone new joins, when a milestone is hit, when a sprint ships — the whole family hears about it. That's culture. That's what makes this team different.
