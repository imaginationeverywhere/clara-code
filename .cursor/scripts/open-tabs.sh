#!/usr/bin/env bash
# open-tabs.sh — spawn Claude Code + Cursor agent panes/windows in the CURRENT tmux session
# See: .claude/commands/open-tabs.md
#
# Install (optional): cp .claude/scripts/open-tabs.sh ~/bin/open-tabs.sh && chmod +x ~/bin/open-tabs.sh
#
set -euo pipefail

LIVE_FEED="${HOME}/auset-brain/Swarms/live-feed.md"
KEYCHAIN_PASS_FILE="${HOME}/.agent-creds/keychain-password"
QCS1_HOST="${QCS1_HOST:-quik-cloud}"

DRY_RUN=false
LAYOUT="tabs" # tabs | panes
PROJECT_RESOLVED=""
PROJECT_ALIAS=""
AUTO_YES=false
CLAUDE_TEAMS=()
CURSOR_COUNT=0
CURSOR_PROMPTS="" # comma-separated basename prefixes
QCS1_COUNT=0
INTERACTIVE=false
# No argv → interactive prompts (same as /open-tabs with no flags)
if [ $# -eq 0 ]; then
  INTERACTIVE=true
fi

# Remote (QCS1) path when using SSH — defaults by alias; overridable with --remote-path
REMOTE_PATH_OVERRIDE=""

usage() {
  cat <<'EOF'
Usage: open-tabs.sh [options]
  --claude <t1,t2,...>   Open one tmux window/pane per team; runs claude in project dir
  --cursor <n>           Open n local Cursor agent tabs (cursor agent --yolo)
  --cursor <id,id,...>   Open one tab per prompt id (matches prompts/.../1-not-started/*id*.md)
  --cursor-qcs1 <n>      Open n tabs SSH'd to QCS1, then cursor agent --yolo
  --layout tabs|panes    tabs=new windows; panes=split current window
  --project PATH|ALIAS   Project directory (default: pwd). Aliases: boilerplate, wcr, qcr, ...
  --remote-path PATH     On QCS1, cd to this path (default: from alias map or ~/projects/<basename>)
  --dry-run              Print tmux commands only
  --yes                  Skip confirmation when opening 6+ tabs
  --interactive          Prompt for counts (stdin)
  -h, --help             This help

Full docs: .claude/commands/open-tabs.md
EOF
}

resolve_alias() {
  local a="${1:-}"
  case "$(printf '%s' "$a" | tr '[:upper:]' '[:lower:]')" in
    boilerplate|bp) echo "/Volumes/X10-Pro/Native-Projects/AI/quik-nation-ai-boilerplate" ;;
    wcr|world-cup-ready) echo "/Volumes/X10-Pro/Native-Projects/clients/world-cup-ready" ;;
    qcr|quikcarrental) echo "/Volumes/X10-Pro/Native-Projects/clients/quikcarrental" ;;
    s962|site962) echo "/Volumes/X10-Pro/Native-Projects/clients/site962" ;;
    fmo) echo "/Volumes/X10-Pro/Native-Projects/clients/fmo" ;;
    clara-code) echo "/Volumes/X10-Pro/Native-Projects/clients/clara-code" ;;
    clara-agents|claraagents) echo "/Volumes/X10-Pro/Native-Projects/clients/claraagents" ;;
    *) echo "$a" ;;
  esac
}

# Reject shell metacharacters in remote cd path (H2)
validate_remote_path() {
  local p="$1"
  if [[ ! "$p" =~ ^[~/a-zA-Z0-9._/+-]+$ ]]; then
    echo "ERROR: remote path must match ^[~/a-zA-Z0-9._/+-]+$ (got unsafe or unsupported characters)." >&2
    echo "  Example: --remote-path '~/projects/my-repo'" >&2
    exit 1
  fi
}

remote_path_for() {
  local local_path="$1"
  if [ -n "$REMOTE_PATH_OVERRIDE" ]; then
    validate_remote_path "$REMOTE_PATH_OVERRIDE"
    echo "$REMOTE_PATH_OVERRIDE"
    return
  fi
  case "$(basename "$local_path")" in
    quik-nation-ai-boilerplate) echo "~/projects/quik-nation-ai-boilerplate" ;;
    world-cup-ready) echo "~/projects/world-cup-ready" ;;
    quikcarrental) echo "~/projects/quikcarrental" ;;
    site962) echo "~/projects/site962" ;;
    fmo) echo "~/projects/fmo" ;;
    clara-code) echo "~/projects/clara-code" ;;
    claraagents) echo "~/projects/claraagents" ;;
    *) echo "~/projects/$(basename "$local_path")" ;;
  esac
}

ensure_tmux() {
  if [ -z "${TMUX:-}" ]; then
    echo "ERROR: /open-tabs must run inside an existing tmux session (attach tmux first)." >&2
    echo "  tmux display-message -p '#S'  # should print session name" >&2
    exit 1
  fi
}

session_name() {
  tmux display-message -p '#S'
}

unlock_keychain_macos() {
  if [[ "$(uname -s)" != "Darwin" ]]; then
    return 0
  fi
  if [ -f "$KEYCHAIN_PASS_FILE" ]; then
    local pw
    pw=$(cat "$KEYCHAIN_PASS_FILE")
    security unlock-keychain -p "$pw" "${HOME}/Library/Keychains/login.keychain-db" 2>/dev/null \
      && echo "🔑 Keychain unlocked (cursor CLI)" || true
  fi
}

heru_skip_check() {
  local d="$1"
  if [ -f "$d/.heru-skip" ]; then
    echo "ERROR: $d has .heru-skip — this Heru opts out of fleet sync; not opening tabs here." >&2
    exit 1
  fi
}

count_total() {
  local n=0
  n=$((n + ${#CLAUDE_TEAMS[@]}))
  if [ "$CURSOR_COUNT" -gt 0 ]; then n=$((n + CURSOR_COUNT)); fi
  if [ -n "$CURSOR_PROMPTS" ]; then
    local _IFS="$IFS"
    IFS=','
    # shellcheck disable=SC2206
    local parts=($CURSOR_PROMPTS)
    IFS="$_IFS"
    n=$((n + ${#parts[@]}))
  fi
  n=$((n + QCS1_COUNT))
  echo "$n"
}

prompt_day_dir() {
  local root="$1"
  local y m d
  y=$(date +%Y)
  m=$(date +%B)
  d=$(date +%-d)
  echo "$root/prompts/$y/$m/$d/1-not-started"
}

find_prompt_files() {
  local root="$1"
  local spec="$2"
  local dir
  dir="$(prompt_day_dir "$root")"
  local _IFS="$IFS"
  IFS=','
  # shellcheck disable=SC2206
  local ids=($spec)
  IFS="$_IFS"
  local id f found=()
  for id in "${ids[@]}"; do
    id="$(echo "$id" | xargs)"
    [ -z "$id" ] && continue
    f=$(ls "$dir"/*"${id}"*.md 2>/dev/null | head -1 || true)
    if [ -z "$f" ] || [ ! -f "$f" ]; then
      echo "WARN: No prompt matching *${id}*.md in $dir" >&2
      continue
    fi
    found+=("$f")
  done
  printf '%s\n' "${found[@]}"
}

append_live_feed() {
  local msg="$1"
  mkdir -p "$(dirname "$LIVE_FEED")"
  echo "$(date '+%H:%M:%S') | $(basename "$PROJECT_RESOLVED") | OPEN TABS | $(session_name):${msg} | by Mo" >>"$LIVE_FEED" 2>/dev/null || true
}

run_tmux() {
  if [ "$DRY_RUN" = true ]; then
    echo "[dry-run] $*"
  else
    "$@"
  fi
}

new_thing() {
  # new_thing <name> <command string for shell — passed to bash -lc>
  local win_name="$1"
  local cmd="$2"
  local sess
  sess="$(session_name)"
  if [ "$LAYOUT" = tabs ]; then
    run_tmux tmux new-window -t "$sess:" -n "$win_name" -c "$PROJECT_RESOLVED" bash -lc "$cmd"
  else
    # Additive splits only — never kill-window; original pane may stay idle
    run_tmux tmux split-window -c "$PROJECT_RESOLVED" bash -lc "$cmd"
  fi
}

finalize_pane_layout() {
  local total="$1"
  local sess
  sess="$(session_name)"
  [ "$LAYOUT" = panes ] || return 0
  if [ "$total" -ge 4 ]; then
    run_tmux tmux select-layout -t "$sess" tiled
  elif [ "$total" -eq 2 ] || [ "$total" -eq 3 ]; then
    run_tmux tmux select-layout -t "$sess" even-horizontal
  fi
}

parse_claude_list() {
  local s="$1"
  local _IFS="$IFS"
  IFS=','
  # shellcheck disable=SC2206
  CLAUDE_TEAMS=($s)
  IFS="$_IFS"
}

parse_cursor_arg() {
  local arg="$1"
  if [[ "$arg" =~ ^[0-9]+$ ]]; then
    CURSOR_COUNT="$arg"
  else
    CURSOR_PROMPTS="$arg"
  fi
}

# --- argv ---
while [ $# -gt 0 ]; do
  case "$1" in
    -h|--help) usage; exit 0 ;;
    --dry-run) DRY_RUN=true; shift ;;
    --yes) AUTO_YES=true; shift ;;
    --interactive) INTERACTIVE=true; shift ;;
    --layout)
      LAYOUT="$2"
      shift 2
      ;;
    --project)
      PROJECT_ALIAS="$2"
      shift 2
      ;;
    --remote-path)
      REMOTE_PATH_OVERRIDE="$2"
      shift 2
      ;;
    --claude)
      parse_claude_list "$2"
      shift 2
      ;;
    --cursor)
      parse_cursor_arg "$2"
      shift 2
      ;;
    --cursor-qcs1)
      if [[ ! "${2:-}" =~ ^[0-9]+$ ]]; then
        echo "ERROR: --cursor-qcs1 requires a non-negative integer (got: ${2:-})" >&2
        exit 1
      fi
      QCS1_COUNT="$2"
      shift 2
      ;;
    *)
      echo "Unknown arg: $1" >&2
      usage
      exit 1
      ;;
  esac
done

case "$LAYOUT" in
  tabs|panes) ;;
  *)
    echo "ERROR: --layout must be 'tabs' or 'panes' (got: $LAYOUT)" >&2
    exit 1
    ;;
esac

ensure_tmux

SESS="$(session_name)"

if [ "$INTERACTIVE" = true ] && [ ${#CLAUDE_TEAMS[@]} -eq 0 ] && [ "$CURSOR_COUNT" -eq 0 ] && [ -z "$CURSOR_PROMPTS" ] && [ "$QCS1_COUNT" -eq 0 ]; then
  echo "Interactive /open-tabs — tmux session: $SESS"
  read -r -p "Comma-separated Claude team names (or empty): " _t
  [ -n "$_t" ] && parse_claude_list "$_t"
  read -r -p "Local Cursor count [0]: " _c
  if [ -n "$_c" ]; then
    if [[ ! "$_c" =~ ^[0-9]+$ ]]; then
      echo "ERROR: Local Cursor count must be a non-negative integer (got: $_c)" >&2
      exit 1
    fi
    CURSOR_COUNT="$_c"
  fi
  read -r -p "Comma-separated prompt ids for Cursor (or empty): " _p
  [ -n "$_p" ] && CURSOR_PROMPTS="$_p"
  read -r -p "Cursor on QCS1 count [0]: " _q
  if [ -n "$_q" ]; then
    if [[ ! "$_q" =~ ^[0-9]+$ ]]; then
      echo "ERROR: Cursor on QCS1 count must be a non-negative integer (got: $_q)" >&2
      exit 1
    fi
    QCS1_COUNT="$_q"
  fi
  read -r -p "Layout tabs or panes [tabs]: " _l
  [ -n "$_l" ] && LAYOUT="${_l:-tabs}"
  read -r -p "Project path or alias [pwd]: " _proj
  if [ -n "$_proj" ]; then
    PROJECT_ALIAS="$_proj"
  fi
fi

# Default project
if [ -z "${PROJECT_ALIAS:-}" ]; then
  PROJECT_RESOLVED="$(pwd -P)"
else
  PROJECT_RESOLVED="$(resolve_alias "$PROJECT_ALIAS")"
fi

heru_skip_check "$PROJECT_RESOLVED"

TOTAL=$(count_total)
if [ "$TOTAL" -eq 0 ]; then
  echo "Nothing to open — pass --claude, --cursor, and/or --cursor-qcs1 (or --interactive)." >&2
  usage
  exit 1
fi

if [ "$TOTAL" -ge 6 ] && [ "$AUTO_YES" = false ] && [ "$DRY_RUN" = false ]; then
  read -r -p "About to open $TOTAL tabs/panes in tmux session '$SESS'. Continue? [y/N] " _a
  case "$_a" in
    y|Y|yes|YES) ;;
    *) echo "Aborted."; exit 1 ;;
  esac
fi

if [ "$CURSOR_COUNT" -gt 0 ] || [ -n "$CURSOR_PROMPTS" ] || [ "$QCS1_COUNT" -gt 0 ]; then
  unlock_keychain_macos
fi

RHOST="$(remote_path_for "$PROJECT_RESOLVED")"
validate_remote_path "$RHOST"

spawned=0

for team in "${CLAUDE_TEAMS[@]}"; do
  team="$(echo "$team" | xargs)"
  [ -z "$team" ] && continue
  safe_name="cc-${team//[^a-zA-Z0-9._-]/-}"
  _cc_msg=$(printf 'Claude Code — team %s — project %s' "$team" "$(basename "$PROJECT_RESOLVED")")
  new_thing "$safe_name" "$(printf 'cd %q && echo %q && exec claude' "$PROJECT_RESOLVED" "$_cc_msg")"
  spawned=$((spawned + 1))
done

if [ "$CURSOR_COUNT" -gt 0 ]; then
  local_i=1
  while [ "$local_i" -le "$CURSOR_COUNT" ]; do
    _cu_msg=$(printf 'Cursor — %s — run /pickup-prompt or paste prompt' "$(basename "$PROJECT_RESOLVED")")
    new_thing "cursor-${local_i}" "$(printf 'cd %q && echo %q && cursor agent --yolo' "$PROJECT_RESOLVED" "$_cu_msg")"
    spawned=$((spawned + 1))
    local_i=$((local_i + 1))
  done
fi

if [ -n "$CURSOR_PROMPTS" ]; then
  while IFS= read -r pfile; do
    [ -z "$pfile" ] && continue
    base="$(basename "$pfile" .md)"
    short="$(printf '%s' "$base" | cut -c1-20)"
    _pr_msg=$(printf 'Cursor — prompt: %s' "$base")
    new_thing "c-${short}" "$(printf 'cd %q && echo %q && cursor agent --yolo -p %q' "$PROJECT_RESOLVED" "$_pr_msg" "$pfile")"
    spawned=$((spawned + 1))
  done < <(find_prompt_files "$PROJECT_RESOLVED" "$CURSOR_PROMPTS")
fi

if [ "$QCS1_COUNT" -gt 0 ]; then
  qi=1
  while [ "$qi" -le "$QCS1_COUNT" ]; do
    # H2: RHOST is validated by validate_remote_path (allowlist ^[~/a-zA-Z0-9._/+-]+$),
    # so it's safe to interpolate unquoted and preserve tilde expansion.
    # QCS1_HOST is %q-quoted. ssh delivers the string to the remote login shell directly
    # (no intermediate `bash -lc`, which breaks && parsing and blocks tilde expansion).
    _qcs1_msg=$(printf '%q' "Cursor on QCS1 — ${RHOST} — run /pickup-prompt")
    _remote_cmd="cd ${RHOST} && echo ${_qcs1_msg} && cursor agent --yolo"
    new_thing "qcs1-${qi}" "$(printf 'ssh %q -t %q' "$QCS1_HOST" "$_remote_cmd")"
    spawned=$((spawned + 1))
    qi=$((qi + 1))
  done
fi

finalize_pane_layout "$spawned"

append_live_feed "spawned=${spawned};layout=${LAYOUT}"

echo "✅ OPEN TABS — session=$SESS spawned=$spawned (layout=$LAYOUT)"
if [ "$DRY_RUN" = true ]; then
  echo "(dry-run: no tmux commands were executed)"
fi
