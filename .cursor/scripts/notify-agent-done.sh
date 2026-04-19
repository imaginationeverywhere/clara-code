#!/bin/bash
# notify-agent-done.sh — Post agent updates to Slack #maat-agents
# Keep it SHORT. No jargon. Summaries only.
#
# Usage: notify-agent-done.sh <project> <status> <summary> [channel]
#
# Examples:
#   notify-agent-done.sh "Sliplink" "done" "Build errors fixed, ready to deploy"
#   notify-agent-done.sh "World Cup Ready" "working" "Fixing the feedback widget"
#   notify-agent-done.sh "QuikCarRental" "blocked" "Need repo access from Ibrahim"

PROJECT="${1:-unknown}"
STATUS="${2:-update}"
SUMMARY="${3:-No details}"
CHANNEL="${4:-C0AKANS4UNB}"  # Default: #maat-agents

# Get Slack token
SLACK_TOKEN=$(aws ssm get-parameter --name '/quik-nation/shared/SLACK_BOT_TOKEN' --with-decryption --query 'Parameter.Value' --output text 2>/dev/null)
[ -z "$SLACK_TOKEN" ] && echo "No Slack token" && exit 1

# Simple status indicators
case "$(echo "$STATUS" | tr '[:upper:]' '[:lower:]')" in
  done|success|complete|fixed)  ICON="✅" ;;
  failed|error|broke)           ICON="❌" ;;
  blocked|waiting)              ICON="🚫" ;;
  working|started|running)      ICON="🔨" ;;
  *)                            ICON="📌" ;;
esac

# Short and clean — one line summary
MSG="${ICON} *${PROJECT}* — ${SUMMARY}"

# Post
curl -s -X POST "https://slack.com/api/chat.postMessage" \
  -H "Authorization: Bearer $SLACK_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"channel\":\"${CHANNEL}\",\"text\":\"${MSG}\"}" \
  | python3 -c "import sys,json; r=json.load(sys.stdin); exit(0 if r.get('ok') else 1)" 2>/dev/null \
  && echo "Sent" || echo "Failed"
