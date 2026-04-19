#!/bin/bash
# Cloud Sync Herus — Run from QC1 or EC2, not your laptop
# Pulls latest boilerplate from GitHub, syncs to all Herus, pushes each one
# You trigger this from your phone or any device, QC1 does the work

set -e

BOILERPLATE_REPO="git@github.com:imaginationeverywhere/quik-nation-ai-boilerplate.git"
BOILERPLATE_DIR="$HOME/sync-workspace/quik-nation-ai-boilerplate"
HERU_ORGS=("imaginationeverywhere" "Sliplink-Inc")
LOG_FILE="/tmp/cloud-sync-$(date +%Y%m%d-%H%M%S).log"
COMMIT_MSG="${1:-chore(auset): sync platform agents + commands from boilerplate}"

echo "=== Cloud Sync Herus ===" | tee "$LOG_FILE"
echo "Started: $(date)" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Step 1: Pull latest boilerplate
echo "--- Step 1: Pull latest boilerplate ---" | tee -a "$LOG_FILE"
if [ -d "$BOILERPLATE_DIR" ]; then
  cd "$BOILERPLATE_DIR" && git pull origin main 2>&1 | tee -a "$LOG_FILE"
else
  mkdir -p "$HOME/sync-workspace"
  git clone "$BOILERPLATE_REPO" "$BOILERPLATE_DIR" 2>&1 | tee -a "$LOG_FILE"
fi

# Step 2: Get list of all repos in approved orgs
echo "" | tee -a "$LOG_FILE"
echo "--- Step 2: Discover Heru repos ---" | tee -a "$LOG_FILE"
REPOS=()
for ORG in "${HERU_ORGS[@]}"; do
  echo "Scanning org: $ORG" | tee -a "$LOG_FILE"
  REPOS+=($(gh repo list "$ORG" --limit 200 --json name,sshUrl --jq '.[].sshUrl' 2>/dev/null))
done

# Remove the boilerplate itself
REPOS=(${REPOS[@]/*quik-nation-ai-boilerplate*/})

echo "Found ${#REPOS[@]} repos" | tee -a "$LOG_FILE"

# Step 3: Clone/pull each repo, sync files, push
echo "" | tee -a "$LOG_FILE"
echo "--- Step 3: Sync + Push ---" | tee -a "$LOG_FILE"

PUSHED=0
SKIPPED=0
FAILED=0
SYNC_DIR="$HOME/sync-workspace/herus"
mkdir -p "$SYNC_DIR"

for REPO_URL in "${REPOS[@]}"; do
  [ -z "$REPO_URL" ] && continue

  REPO_NAME=$(basename "$REPO_URL" .git)
  REPO_DIR="$SYNC_DIR/$REPO_NAME"

  echo "" | tee -a "$LOG_FILE"
  echo "Processing: $REPO_NAME" | tee -a "$LOG_FILE"

  # Clone or pull
  if [ -d "$REPO_DIR" ]; then
    cd "$REPO_DIR"
    git pull --rebase 2>&1 | tee -a "$LOG_FILE" || { echo "  PULL FAILED" | tee -a "$LOG_FILE"; FAILED=$((FAILED+1)); continue; }
  else
    git clone --depth 1 "$REPO_URL" "$REPO_DIR" 2>&1 | tee -a "$LOG_FILE" || { echo "  CLONE FAILED" | tee -a "$LOG_FILE"; FAILED=$((FAILED+1)); continue; }
    cd "$REPO_DIR"
  fi

  # Sync platform files
  mkdir -p .claude/commands .claude/agents .cursor/commands .cursor/agents 2>/dev/null

  cp "$BOILERPLATE_DIR/.claude/commands/"*.md .claude/commands/ 2>/dev/null
  cp "$BOILERPLATE_DIR/.claude/agents/"*.md .claude/agents/ 2>/dev/null
  cp "$BOILERPLATE_DIR/.claude/COMMAND_CHEAT_SHEET.md" .claude/ 2>/dev/null
  cp "$BOILERPLATE_DIR/.claude/org-gate.sh" .claude/ 2>/dev/null

  # Mirror to .cursor
  cp "$BOILERPLATE_DIR/.claude/commands/"*.md .cursor/commands/ 2>/dev/null
  cp "$BOILERPLATE_DIR/.claude/agents/"*.md .cursor/agents/ 2>/dev/null
  cp "$BOILERPLATE_DIR/.claude/COMMAND_CHEAT_SHEET.md" .cursor/ 2>/dev/null

  # Stage and commit
  git add .claude/ .cursor/ 2>/dev/null

  if git diff --cached --quiet 2>/dev/null; then
    echo "  SKIP (no changes): $REPO_NAME" | tee -a "$LOG_FILE"
    SKIPPED=$((SKIPPED+1))
    continue
  fi

  git commit -m "$COMMIT_MSG" 2>&1 | tee -a "$LOG_FILE"

  # Push with timeout
  timeout 30 git push 2>&1 | tee -a "$LOG_FILE"
  if [ $? -eq 0 ]; then
    echo "  PUSHED: $REPO_NAME" | tee -a "$LOG_FILE"
    PUSHED=$((PUSHED+1))
  else
    echo "  PUSH FAILED: $REPO_NAME" | tee -a "$LOG_FILE"
    FAILED=$((FAILED+1))
  fi
done

# Step 4: Report
echo "" | tee -a "$LOG_FILE"
echo "=== SYNC COMPLETE ===" | tee -a "$LOG_FILE"
echo "Pushed: $PUSHED" | tee -a "$LOG_FILE"
echo "Skipped: $SKIPPED" | tee -a "$LOG_FILE"
echo "Failed: $FAILED" | tee -a "$LOG_FILE"
echo "Log: $LOG_FILE" | tee -a "$LOG_FILE"
echo "Finished: $(date)" | tee -a "$LOG_FILE"

# Step 5: Post to Slack
SLACK_TOKEN=$(aws ssm get-parameter --name '/quik-nation/shared/SLACK_BOT_TOKEN' --with-decryption --query 'Parameter.Value' --output text --region us-east-1 2>/dev/null)
if [ -n "$SLACK_TOKEN" ]; then
  curl -s -X POST "https://slack.com/api/chat.postMessage" \
    -H "Authorization: Bearer $SLACK_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"channel\":\"C0AKANS4UNB\",\"text\":\"Cloud Sync Complete\nPushed: $PUSHED | Skipped: $SKIPPED | Failed: $FAILED\nCommit: $COMMIT_MSG\"}" > /dev/null
fi

# Upload log to S3
aws s3 cp "$LOG_FILE" "s3://auset-brain-vault/sync-logs/$(basename $LOG_FILE)" 2>/dev/null
