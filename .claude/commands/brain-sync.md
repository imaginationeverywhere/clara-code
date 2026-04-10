# /brain-sync — Push Auset Brain to All Channels

Syncs the vault from `~/auset-brain/` to all channels so Amen Ra has context everywhere.

## Usage
```
/brain-sync                                    # Full sync to all channels
/brain-sync --slack                            # Post session summary to Slack
/brain-sync --qc1                              # Sync vault to QC1 via rsync
/brain-sync --github                           # Push vault to private GitHub repo
/brain-sync --s3                               # Upload to S3 for EC2 agents
/brain-sync --claude-project                   # Generate file for Claude.ai Project upload
/brain-sync --status                           # Show sync status across all channels
```

## Arguments
- `--slack` — Post today's session summary to Slack #maat-brain
- `--qc1` — rsync vault to QC1 over Tailscale
- `--github` — git push vault to private GitHub repo
- `--s3` — Upload vault to S3 bucket `auset-brain-vault`
- `--claude-project` — Regenerate `CLAUDE-PROJECT-CONTEXT.md` for claude.ai upload
- `--status` — Show last sync time for each channel
- `--all` — Sync everything (default)

## Channels

### 1. Slack (#maat-brain)
Posts a formatted session summary so Amen Ra can check his phone.
```bash
# Uses SLACK_BOT_TOKEN from SSM
curl -X POST "https://slack.com/api/chat.postMessage" \
  -H "Authorization: Bearer $SLACK_TOKEN" \
  -d "channel=#maat-brain" \
  -d "text=$(cat ~/auset-brain/Daily/$(date +%Y-%m-%d).md)"
```

### 2. QC1 (rsync over Tailscale)
```bash
rsync -avz --delete ~/auset-brain/ ayoungboy@100.113.53.80:~/auset-brain/
```

### 3. GitHub Private Repo
```bash
cd ~/auset-brain && git add -A && git commit -m "vault sync $(date)" && git push
```

### 4. S3 Bucket (EC2 agents)
```bash
aws s3 sync ~/auset-brain/ s3://auset-brain-vault/ --exclude ".git/*" --exclude ".obsidian/*"
```

### 5. Claude.ai Project
Regenerates `~/auset-brain/CLAUDE-PROJECT-CONTEXT.md` with latest session info.
Upload manually to your Claude.ai Project "Granville / Auset Brain".

## Session Workflow
```
Working in any Heru...
  → Session ends
    → /brain-sync
      → Slack gets summary (phone)
      → QC1 gets vault (agents)
      → GitHub gets push (anywhere)
      → S3 gets upload (EC2)
      → Claude.ai Project stays current (mobile/desktop)
```

## Setup (One-Time)
1. **Slack:** Create #maat-brain channel, add Slack bot
2. **GitHub:** `cd ~/auset-brain && git init && gh repo create auset-brain --private && git push -u origin main`
3. **S3:** `aws s3 mb s3://auset-brain-vault --region us-east-1`
4. **Claude.ai:** Create Project "Granville / Auset Brain", upload CLAUDE-PROJECT-CONTEXT.md
5. **QC1:** Ensure rsync works: `rsync -avz ~/auset-brain/ ayoungboy@100.113.53.80:~/auset-brain/`

## Related Commands
- `/vault-sync` — Sync between memory/ and vault
- `/clara-research` — Auto-research writes to vault
- `/carter` — Talk to Carter about documentation
