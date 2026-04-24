#!/usr/bin/env bash
# platform-vitals.sh — /hq owned platform health check across all Herus
# Invoked by: /platform-vitals, /session-start, /session-update, /session-continue, /session-end
# Owner: Headquarters (non-delegable). Execution may be delegated to /devops-team.
#
# Exit codes:
#   0 = all OK
#   1 = DEGRADED (warnings, no outages)
#   2 = DOWN (one or more systems out; session work should pause)
#
# Usage:
#   platform-vitals.sh            # cached (60s TTL) if available
#   platform-vitals.sh --fresh    # force live probe
#   platform-vitals.sh --json     # machine-readable
#   platform-vitals.sh --quiet    # one-line summary only
#   platform-vitals.sh --full     # show OK items too (default hides them)

set -uo pipefail

# ── Config ────────────────────────────────────────────────────────────────────
REGION="${AWS_REGION:-us-east-1}"
CACHE_DIR="${HOME}/.platform-vitals"
CACHE_FILE="${CACHE_DIR}/cache.json"
KNOWN_BROKEN="${CACHE_DIR}/known-broken.json"
CACHE_TTL=60
PROBE_TIMEOUT=5
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

mkdir -p "$CACHE_DIR"

# Flags
FRESH=0; JSON=0; QUIET=0; FULL=0
for a in "$@"; do
  case "$a" in
    --fresh) FRESH=1 ;;
    --json)  JSON=1 ;;
    --quiet) QUIET=1 ;;
    --full)  FULL=1 ;;
    -h|--help)
      sed -n '2,20p' "$0"; exit 0 ;;
  esac
done

# Colors (disabled if not a TTY)
if [[ -t 1 ]]; then
  RED=$'\033[0;31m'; YEL=$'\033[0;33m'; GRN=$'\033[0;32m'
  GRY=$'\033[0;90m'; BLD=$'\033[1m'; RST=$'\033[0m'
else
  RED=; YEL=; GRN=; GRY=; BLD=; RST=
fi

# ── Cache ─────────────────────────────────────────────────────────────────────
if [[ $FRESH -eq 0 && -f "$CACHE_FILE" ]]; then
  CACHE_AGE=$(( $(date +%s) - $(stat -f %m "$CACHE_FILE" 2>/dev/null || stat -c %Y "$CACHE_FILE" 2>/dev/null || echo 0) ))
  if [[ $CACHE_AGE -lt $CACHE_TTL ]]; then
    cat "$CACHE_FILE"
    exit $(jq -r '.exit_code' "$CACHE_FILE" 2>/dev/null || echo 0)
  fi
fi

# ── State ─────────────────────────────────────────────────────────────────────
declare -a RESULTS
OK_N=0; DEG_N=0; DOWN_N=0; UNK_N=0

emit() {
  # emit STATUS CATEGORY NAME DETAIL
  local status="$1" cat="$2" name="$3" detail="${4:-}"
  case "$status" in
    OK)       OK_N=$((OK_N+1)) ;;
    DEGRADED) DEG_N=$((DEG_N+1)) ;;
    DOWN)     DOWN_N=$((DOWN_N+1)) ;;
    UNKNOWN)  UNK_N=$((UNK_N+1)) ;;
  esac
  RESULTS+=("${status}|${cat}|${name}|${detail}")
}

# Override via known-broken.json (HQ-maintained list of systems declared broken
# via Mo/operator even if a probe passes). Format:
#   { "items": [ { "name": "Knowledge Engine", "detail": "..." } ] }
is_known_broken() {
  local name="$1"
  [[ -f "$KNOWN_BROKEN" ]] || return 1
  jq -e --arg n "$name" '.items[]? | select(.name==$n)' "$KNOWN_BROKEN" >/dev/null 2>&1
}

known_broken_detail() {
  local name="$1"
  jq -r --arg n "$name" '.items[]? | select(.name==$n) | .detail // "declared broken"' "$KNOWN_BROKEN" 2>/dev/null
}

# ── Probe helpers ─────────────────────────────────────────────────────────────
http_probe() {
  # http_probe CATEGORY NAME URL [EXPECTED_CODE_PREFIX]
  local cat="$1" name="$2" url="$3" expect="${4:-2}"
  if is_known_broken "$name"; then
    emit DOWN "$cat" "$name" "$(known_broken_detail "$name")"
    return
  fi
  local raw code
  raw=$(curl -sS -o /dev/null -w "%{http_code}" -m "$PROBE_TIMEOUT" "$url" 2>/dev/null) || raw=""
  # Take last 3 chars (handles multi-code output from edge cases)
  code="${raw: -3}"
  [[ -z "$code" || "$code" == "000" ]] && { emit DOWN "$cat" "$name" "unreachable"; return; }
  if [[ "$code" =~ ^${expect} ]]; then
    emit OK "$cat" "$name" "HTTP $code"
  else
    emit DEGRADED "$cat" "$name" "HTTP $code"
  fi
}

cmd_probe() {
  # cmd_probe CATEGORY NAME "shell command" "ok_msg"
  local cat="$1" name="$2" cmd="$3" okmsg="${4:-responsive}"
  if is_known_broken "$name"; then
    emit DOWN "$cat" "$name" "$(known_broken_detail "$name")"
    return
  fi
  if timeout "$PROBE_TIMEOUT" bash -c "$cmd" >/dev/null 2>&1; then
    emit OK "$cat" "$name" "$okmsg"
  else
    emit DOWN "$cat" "$name" "probe failed"
  fi
}

unknown_probe() {
  # For vitals we can't yet probe live — flagged so we don't forget
  emit UNKNOWN "$1" "$2" "${3:-probe not implemented}"
}

# ── A. Knowledge & Memory ─────────────────────────────────────────────────────
http_probe "Knowledge" "Knowledge Engine"       "https://brain-api.quiknation.com/health"
http_probe "Knowledge" "Obsidian Publish"       "https://brain.quiknation.com"
cmd_probe  "Knowledge" "Vault S3"               "aws s3 ls s3://auset-brain-vault/ --max-items 1 --region $REGION" "bucket reachable"
if [[ -x "${HOME}/auset-brain/vault-gate.sh" ]]; then
  cmd_probe "Knowledge" "Vault Gate"            "${HOME}/auset-brain/vault-gate.sh verify" "gate open"
else
  unknown_probe "Knowledge" "Vault Gate"        "vault-gate.sh not installed on this machine"
fi

# ── B. Voice & Agent Runtime ──────────────────────────────────────────────────
# Clara Voice Modal endpoint — URL from SSM if configured, else UNKNOWN
if CLARA_VOICE_URL=$(aws ssm get-parameter --name "/quik-nation/clara-voice/modal-url" --with-decryption --query 'Parameter.Value' --output text --region "$REGION" 2>/dev/null); then
  http_probe "Voice" "Clara Voice Modal"        "${CLARA_VOICE_URL%/}/health"
else
  unknown_probe "Voice" "Clara Voice Modal"     "SSM /quik-nation/clara-voice/modal-url not set"
fi
unknown_probe "Voice" "Hermes Agent Runtime"    "no health endpoint yet — runtime is L2, check after cp-team ships"
unknown_probe "Voice" "Clara Platform Runtime"  "memory-discipline layer scaffolding in progress"

# ── C. Models & LLM Routing ───────────────────────────────────────────────────
cmd_probe "Models" "AWS Bedrock"                "aws bedrock list-foundation-models --region $REGION --query 'modelSummaries[0].modelId' --output text" "API reachable"
if ANTHROPIC_KEY=$(aws ssm get-parameter --name "/quik-nation/shared/ANTHROPIC_API_KEY" --with-decryption --query 'Parameter.Value' --output text --region "$REGION" 2>/dev/null); then
  cmd_probe "Models" "Anthropic API"            "curl -sS -m $PROBE_TIMEOUT https://api.anthropic.com/v1/models -H 'x-api-key: $ANTHROPIC_KEY' -H 'anthropic-version: 2023-06-01' | grep -q 'data'" "key valid"
else
  unknown_probe "Models" "Anthropic API"        "ANTHROPIC_API_KEY not in SSM"
fi
unknown_probe "Models" "Fallback ladder"        "Cerebras/Groq/SambaNova/Gemini/OpenRouter — probe per-provider TBD"
unknown_probe "Models" "Proprietary models"     "mary-bethune/maya-angelou/nikki-giovanni — training status from /models repo"

# ── D. Infrastructure ─────────────────────────────────────────────────────────
cmd_probe "Infra" "QC1 (Mac M4 Pro)"            "ssh -o ConnectTimeout=$PROBE_TIMEOUT -o BatchMode=yes quik-cloud true 2>/dev/null" "SSH responsive"
# QCS3 build farm — use SSM-fetched key. (QCS2 decommissioned 2026-04-24.)
if aws ssm get-parameter --name "/quik-nation/build-farm/ssh-key" --with-decryption --query 'Parameter.Value' --output text --region "$REGION" >/tmp/_pv_farm_key.pem 2>/dev/null; then
  chmod 600 /tmp/_pv_farm_key.pem
  cmd_probe "Infra" "QCS3 build farm"           "ssh -i /tmp/_pv_farm_key.pem -o ConnectTimeout=$PROBE_TIMEOUT -o BatchMode=yes -o StrictHostKeyChecking=no ec2-user@3.234.210.39 true" "SSH responsive"
  rm -f /tmp/_pv_farm_key.pem
else
  unknown_probe "Infra" "QCS3 build farm"       "cannot fetch SSM key"
fi
cmd_probe "Infra" "Amplify (us-east-1)"         "aws amplify list-apps --max-results 1 --region us-east-1" "API reachable"
cmd_probe "Infra" "Amplify (us-east-2)"         "aws amplify list-apps --max-results 1 --region us-east-2" "API reachable"
unknown_probe "Infra" "Cloudflare Workers"      "claracode.ai / claraagents.com — covered by customer-facing section"
unknown_probe "Infra" "ECS Fargate clusters"    "dev+prod cluster names not yet codified"
unknown_probe "Infra" "Neon Postgres"           "per-Heru; HQ probe aggregates from Heru vitals"

# ── E. Auth & Payments ────────────────────────────────────────────────────────
http_probe "Payments" "Stripe API"              "https://api.stripe.com" "[24]"
http_probe "Payments" "Stripe Status"           "https://status.stripe.com"
http_probe "Auth"     "Clerk API"               "https://api.clerk.com" "[24]"
cmd_probe "Secrets"   "SSM (shared)"            "aws ssm get-parameter --name /quik-nation/shared/SLACK_BOT_TOKEN --region $REGION --query 'Parameter.Name' --output text" "readable"

# ── F. Customer-Facing Endpoints ──────────────────────────────────────────────
http_probe "Customer" "claracode.ai"            "https://claracode.ai"
http_probe "Customer" "claraagents.com"         "https://claraagents.com"
http_probe "Customer" "brain.quiknation.com"    "https://brain.quiknation.com"
http_probe "Customer" "admin.quiknation.com"    "https://admin.quiknation.com"

# ── G. Dev Pipeline ───────────────────────────────────────────────────────────
http_probe "Dev" "GitHub"                       "https://api.github.com"
http_probe "Dev" "GitHub Status"                "https://www.githubstatus.com"
if [[ -d .git ]]; then
  cmd_probe "Dev" "Git origin (this repo)"      "git ls-remote --exit-code origin HEAD" "reachable"
fi

# ── H. Comms ──────────────────────────────────────────────────────────────────
if SLK=$(aws ssm get-parameter --name "/quik-nation/shared/SLACK_BOT_TOKEN" --with-decryption --query 'Parameter.Value' --output text --region "$REGION" 2>/dev/null); then
  cmd_probe "Comms" "Slack bot"                 "curl -sS -m $PROBE_TIMEOUT -H 'Authorization: Bearer $SLK' https://slack.com/api/auth.test | grep -q '\"ok\":true'" "auth.test ok"
else
  unknown_probe "Comms" "Slack bot"             "SLACK_BOT_TOKEN not in SSM"
fi

# ── Aggregate ─────────────────────────────────────────────────────────────────
TOTAL=$((OK_N + DEG_N + DOWN_N + UNK_N))
if   [[ $DOWN_N -gt 0 ]]; then OVERALL="DOWN"; EXIT_CODE=2
elif [[ $DEG_N  -gt 0 ]]; then OVERALL="DEGRADED"; EXIT_CODE=1
elif [[ $UNK_N  -gt 0 ]]; then OVERALL="OK (with gaps)"; EXIT_CODE=0
else                           OVERALL="OK"; EXIT_CODE=0
fi

# ── Render ────────────────────────────────────────────────────────────────────
render_human() {
  local color=$GRN
  [[ "$OVERALL" == "DEGRADED"* ]] && color=$YEL
  [[ "$OVERALL" == "DOWN"* ]] && color=$RED

  if [[ $QUIET -eq 1 ]]; then
    printf "${BLD}PLATFORM VITALS${RST} [%s] %sOK=%d DEG=%d DOWN=%d UNK=%d  → %s%s%s\n" \
      "$TIMESTAMP" "$color" "$OK_N" "$DEG_N" "$DOWN_N" "$UNK_N" "$color" "$OVERALL" "$RST"
    return
  fi

  printf "\n${BLD}PLATFORM VITALS — %s${RST}\n" "$TIMESTAMP"
  printf "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
  printf "  ${BLD}OVERALL:${RST} %s%s%s  (OK=%d DEG=%d DOWN=%d UNK=%d of %d)\n\n" \
    "$color" "$OVERALL" "$RST" "$OK_N" "$DEG_N" "$DOWN_N" "$UNK_N" "$TOTAL"

  # DOWN first, then DEGRADED, then UNKNOWN, then OK (if --full)
  for want in DOWN DEGRADED UNKNOWN OK; do
    [[ $FULL -eq 0 && $want == OK ]] && continue
    for r in "${RESULTS[@]}"; do
      IFS='|' read -r status cat name detail <<<"$r"
      [[ "$status" != "$want" ]] && continue
      case "$status" in
        OK)       tag="${GRN}[OK]      ${RST}" ;;
        DEGRADED) tag="${YEL}[DEGRADED]${RST}" ;;
        DOWN)     tag="${RED}[DOWN]    ${RST}" ;;
        UNKNOWN)  tag="${GRY}[UNKNOWN] ${RST}" ;;
      esac
      printf "  %s %-24s %s%s%s\n" "$tag" "$name" "$GRY" "$detail" "$RST"
    done
  done

  printf "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
  if [[ $DOWN_N -gt 0 ]]; then
    printf "  ${RED}${BLD}ACTION REQUIRED:${RST} %d system(s) DOWN. HQ owns resolution.\n" "$DOWN_N"
    printf "  Delegate to /devops-team if appropriate. Do not proceed with queued work until triaged.\n\n"
  fi
}

render_json() {
  local items="["
  local first=1
  for r in "${RESULTS[@]}"; do
    IFS='|' read -r status cat name detail <<<"$r"
    [[ $first -eq 1 ]] && first=0 || items+=","
    items+=$(jq -cn --arg s "$status" --arg c "$cat" --arg n "$name" --arg d "$detail" \
      '{status:$s, category:$c, name:$n, detail:$d}')
  done
  items+="]"

  jq -n --arg ts "$TIMESTAMP" --arg overall "$OVERALL" \
        --argjson ok "$OK_N" --argjson deg "$DEG_N" --argjson down "$DOWN_N" --argjson unk "$UNK_N" \
        --argjson ec "$EXIT_CODE" --argjson items "$items" '
    { timestamp: $ts, overall: $overall, counts: {ok:$ok, degraded:$deg, down:$down, unknown:$unk},
      exit_code: $ec, items: $items }'
}

if [[ $JSON -eq 1 ]]; then
  render_json | tee "$CACHE_FILE"
else
  render_json > "$CACHE_FILE"   # always cache JSON
  render_human
fi

exit "$EXIT_CODE"
