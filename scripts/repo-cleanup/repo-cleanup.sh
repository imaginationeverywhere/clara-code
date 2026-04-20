#!/usr/bin/env bash
# repo-cleanup.sh — Consolidate branches, worktrees, and PRs into develop.
# Auset Platform command backing /repo-cleanup.
#
# Usage:
#   ./scripts/repo-cleanup/repo-cleanup.sh                  # dry run, current repo
#   ./scripts/repo-cleanup/repo-cleanup.sh --execute        # live, current repo
#   ./scripts/repo-cleanup/repo-cleanup.sh --all-herus      # dry run, all clients/*
#   ./scripts/repo-cleanup/repo-cleanup.sh --all-herus --execute
#   ./scripts/repo-cleanup/repo-cleanup.sh --repo /path     # single named repo
#
# What it does (in order):
#   1. git fetch --all --prune
#   2. List worktrees — remove any whose branch no longer exists or is merged
#   3. List all branches (local + remote) — for each non-protected branch:
#        - if ahead of develop AND clean merge: merge into develop, delete branch
#        - if ahead of develop with conflicts: FLAG, leave alone
#        - if not ahead (already merged): delete
#   4. List open PRs via gh — for each:
#        - if mergeable + targeting develop or main: squash merge
#        - if conflicted: comment "needs rebase" and leave open
#        - if stale (>14 days no commits): close with comment
#   5. Push develop, prune remote
#   6. Emit report CSV + markdown summary
#
# Protected branches (NEVER touched): main, master, develop, production, release/*
set -euo pipefail

PROTECTED_REGEX='^(main|master|develop|production|release/.*)$'
PROTECTED_REMOTE_REGEX='^origin/(main|master|develop|production|release/.*|HEAD)$'
STALE_PR_DAYS=14

EXECUTE=0
ALL_HERUS=0
SINGLE_REPO=""
HERU_ROOT="/Volumes/X10-Pro/Native-Projects/clients"

while (( "$#" )); do
  case "$1" in
    --execute)    EXECUTE=1; shift ;;
    --all-herus)  ALL_HERUS=1; shift ;;
    --repo)       SINGLE_REPO="$2"; shift 2 ;;
    --heru-root)  HERU_ROOT="$2"; shift 2 ;;
    -h|--help)
      grep '^#' "$0" | sed 's/^# \?//'; exit 0 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

TS="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
REPORT_ROOT="${SINGLE_REPO:-$(pwd)}/reports/repo-cleanup/$TS"
FLEET_ROLLUP=""

log() { echo "[$(date -u +%H:%M:%S)] $*"; }
note() { echo "$*" >> "$REPORT_MD"; }

cleanup_one_repo() {
  local REPO="$1"
  local REPO_NAME="$(basename "$REPO")"
  log "────────────────────────────────────────────────"
  log "REPO: $REPO_NAME  ($REPO)"
  log "────────────────────────────────────────────────"

  if [ ! -d "$REPO/.git" ]; then
    log "  skip: not a git repo"
    return 0
  fi

  if [ -f "$REPO/.heru-skip" ]; then
    log "  skip: .heru-skip marker present"
    return 0
  fi

  cd "$REPO"

  local RPT_DIR="$REPO/reports/repo-cleanup/$TS"
  mkdir -p "$RPT_DIR"
  local REPORT_MD="$RPT_DIR/report.md"
  local REPORT_CSV="$RPT_DIR/actions.csv"
  : > "$REPORT_MD"; : > "$REPORT_CSV"
  echo "action,target,result,detail" >> "$REPORT_CSV"
  {
    echo "# repo-cleanup — $REPO_NAME — $TS"
    echo ""
    echo "Mode: $([ $EXECUTE -eq 1 ] && echo EXECUTE || echo DRY-RUN)"
    echo ""
  } >> "$REPORT_MD"

  # 0. Uncommitted changes guard
  if [ -n "$(git status --porcelain)" ]; then
    log "  ABORT: uncommitted changes in $REPO_NAME — commit or stash first"
    echo "abort,working-tree,dirty,uncommitted changes" >> "$REPORT_CSV"
    return 0
  fi

  # 1. Fetch + prune
  log "  [1/6] git fetch --all --prune"
  if [ $EXECUTE -eq 1 ]; then
    git fetch --all --prune --quiet 2>&1 | head -20 || true
  fi

  # 2. Worktrees
  log "  [2/6] worktree audit"
  local WT_LIST
  WT_LIST=$(git worktree list --porcelain 2>/dev/null || true)
  echo "$WT_LIST" | awk '/^worktree /{path=$2; branch=""; detached=0} /^branch /{branch=$2} /^detached/{detached=1} /^$/{if(path){print path"\t"branch"\t"detached; path=""}}END{if(path) print path"\t"branch"\t"detached}' | while IFS=$'\t' read -r WT_PATH WT_BRANCH WT_DETACHED; do
    if [ "$WT_PATH" = "$REPO" ] || [ -z "$WT_PATH" ]; then continue; fi
    local BR_NAME="${WT_BRANCH#refs/heads/}"
    if [ "$WT_DETACHED" = "1" ] || ! git show-ref --verify --quiet "refs/heads/$BR_NAME"; then
      log "    remove stale worktree: $WT_PATH (branch=$BR_NAME)"
      echo "worktree-remove,$WT_PATH,planned,detached or branch gone" >> "$REPORT_CSV"
      if [ $EXECUTE -eq 1 ]; then
        git worktree remove --force "$WT_PATH" 2>&1 | tail -3 || true
      fi
    fi
  done
  if [ $EXECUTE -eq 1 ]; then git worktree prune; fi

  # 3. Branches
  log "  [3/6] branch consolidation"
  # Switch to develop first
  if git show-ref --verify --quiet refs/heads/develop; then
    [ $EXECUTE -eq 1 ] && git checkout develop --quiet
  else
    log "    NOTE: no local develop branch — skipping merge step"
    echo "branch-merge,all,skipped,no local develop" >> "$REPORT_CSV"
    return 0
  fi

  # Local branches
  while IFS= read -r BR; do
    BR="${BR## }"; BR="${BR/#\* /}"
    [ -z "$BR" ] && continue
    if [[ "$BR" =~ $PROTECTED_REGEX ]]; then continue; fi

    # Is it ahead of develop?
    local AHEAD
    AHEAD=$(git rev-list --count "develop..$BR" 2>/dev/null || echo 0)
    local BEHIND
    BEHIND=$(git rev-list --count "$BR..develop" 2>/dev/null || echo 0)

    if [ "$AHEAD" = "0" ]; then
      log "    delete already-merged branch: $BR (behind=$BEHIND)"
      echo "branch-delete,$BR,merged,already in develop" >> "$REPORT_CSV"
      if [ $EXECUTE -eq 1 ]; then git branch -D "$BR" >/dev/null 2>&1 || true; fi
    else
      # Try dry-merge to detect conflicts
      if git merge-tree "$(git merge-base develop "$BR")" develop "$BR" 2>/dev/null | grep -q '^<<<<<<<'; then
        log "    CONFLICT: $BR ahead=$AHEAD, needs manual merge"
        echo "branch-flag,$BR,conflict,ahead=$AHEAD behind=$BEHIND" >> "$REPORT_CSV"
      else
        log "    auto-merge: $BR (ahead=$AHEAD) → develop"
        echo "branch-merge,$BR,planned,ahead=$AHEAD" >> "$REPORT_CSV"
        if [ $EXECUTE -eq 1 ]; then
          if git merge --no-ff --quiet -m "chore(cleanup): merge $BR into develop" "$BR"; then
            git branch -D "$BR" >/dev/null 2>&1 || true
            echo "branch-merged-and-deleted,$BR,ok," >> "$REPORT_CSV"
          else
            git merge --abort 2>/dev/null || true
            echo "branch-merge,$BR,failed,merge aborted" >> "$REPORT_CSV"
          fi
        fi
      fi
    fi
  done < <(git branch --format='%(refname:short)')

  # Remote branches (delete remote refs for already-merged, but NEVER push-force)
  while IFS= read -r BR; do
    [ -z "$BR" ] && continue
    if [[ "$BR" =~ $PROTECTED_REMOTE_REGEX ]]; then continue; fi
    local SHORT="${BR#origin/}"
    local AHEAD
    AHEAD=$(git rev-list --count "develop..$BR" 2>/dev/null || echo 0)
    if [ "$AHEAD" = "0" ]; then
      log "    remote branch already merged: $BR"
      echo "remote-branch-merged,$SHORT,merged,in develop" >> "$REPORT_CSV"
      if [ $EXECUTE -eq 1 ]; then
        git push origin --delete "$SHORT" 2>&1 | tail -2 || true
      fi
    fi
  done < <(git branch -r --format='%(refname:short)')

  # 4. Pull requests (needs gh CLI)
  log "  [4/6] pull requests"
  if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
    gh pr list --state open --json number,title,isDraft,mergeable,headRefName,baseRefName,updatedAt --limit 100 2>/dev/null | python3 - "$REPORT_CSV" "$EXECUTE" "$STALE_PR_DAYS" <<'PY'
import json, sys, subprocess, datetime
csv_path, execute, stale_days = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
prs = json.load(sys.stdin)
now = datetime.datetime.now(datetime.timezone.utc)
def log_action(a, t, r, d):
    with open(csv_path,'a') as f: f.write(f"{a},{t},{r},{d}\n")
for pr in prs:
    num = pr['number']; title = pr['title'].replace(',', ' '); base = pr['baseRefName']; head = pr['headRefName']
    updated = datetime.datetime.fromisoformat(pr['updatedAt'].replace('Z','+00:00'))
    age_days = (now - updated).days
    if pr.get('isDraft'):
        print(f"    PR #{num} [{head} → {base}]: DRAFT, skip ({title[:50]})")
        log_action('pr-skip', f"#{num}", 'draft', f"age={age_days}d")
        continue
    merge = pr.get('mergeable')  # MERGEABLE / CONFLICTING / UNKNOWN
    if base not in ('develop','main','master'):
        print(f"    PR #{num} [{head} → {base}]: non-standard base, skip")
        log_action('pr-skip', f"#{num}", 'non-standard-base', base)
        continue
    if merge == 'CONFLICTING':
        print(f"    PR #{num} [{head} → {base}]: CONFLICT, age={age_days}d, flagging")
        log_action('pr-flag', f"#{num}", 'conflict', f"age={age_days}d")
        if execute:
            subprocess.run(['gh','pr','comment',str(num),'--body','Flagged by /repo-cleanup — needs rebase against base. Will not auto-merge.'], check=False)
        continue
    if age_days >= stale_days and merge != 'MERGEABLE':
        print(f"    PR #{num}: STALE ({age_days}d, mergeable={merge}), closing")
        log_action('pr-close', f"#{num}", 'stale', f"age={age_days}d mergeable={merge}")
        if execute:
            subprocess.run(['gh','pr','close',str(num),'--comment',f'Closed by /repo-cleanup — no updates in {age_days} days and not cleanly mergeable. Reopen if still needed.'], check=False)
        continue
    if merge == 'MERGEABLE':
        print(f"    PR #{num} [{head} → {base}]: MERGEABLE, squash-merging")
        log_action('pr-merge', f"#{num}", 'planned', f"age={age_days}d")
        if execute:
            r = subprocess.run(['gh','pr','merge',str(num),'--squash','--delete-branch','--auto'], capture_output=True, text=True)
            if r.returncode == 0:
                log_action('pr-merged', f"#{num}", 'ok', '')
            else:
                log_action('pr-merge', f"#{num}", 'failed', r.stderr.strip().replace(',',' ')[:120])
    else:
        print(f"    PR #{num}: mergeable=UNKNOWN, skipping (needs re-fetch)")
        log_action('pr-skip', f"#{num}", 'mergeable-unknown', '')
PY
  else
    log "    gh CLI not installed or not authed, skipping PR step"
    echo "pr-audit,all,skipped,gh not available" >> "$REPORT_CSV"
  fi

  # 5. Push develop + final prune
  log "  [5/6] push develop, prune"
  if [ $EXECUTE -eq 1 ]; then
    git push origin develop 2>&1 | tail -3 || true
    git remote prune origin 2>&1 | tail -3 || true
  fi

  # 6. Summary
  log "  [6/6] summary → $REPORT_MD"
  {
    echo ""
    echo "## Actions"
    echo '```'
    cat "$REPORT_CSV"
    echo '```'
  } >> "$REPORT_MD"

  FLEET_ROLLUP="$FLEET_ROLLUP$REPO_NAME,$RPT_DIR/report.md"$'\n'

  cd - >/dev/null
}

if [ $ALL_HERUS -eq 1 ]; then
  log "FLEET MODE — scanning $HERU_ROOT/*"
  if [ ! -d "$HERU_ROOT" ]; then
    log "ERROR: HERU_ROOT $HERU_ROOT not found"; exit 1
  fi
  for REPO in "$HERU_ROOT"/*/; do
    REPO="${REPO%/}"
    cleanup_one_repo "$REPO" || log "  (continuing past error in $REPO)"
  done
elif [ -n "$SINGLE_REPO" ]; then
  cleanup_one_repo "$SINGLE_REPO"
else
  cleanup_one_repo "$(pwd)"
fi

if [ -n "$FLEET_ROLLUP" ]; then
  ROLLUP_DIR="/tmp/repo-cleanup-rollup-$TS"
  mkdir -p "$ROLLUP_DIR"
  echo "$FLEET_ROLLUP" > "$ROLLUP_DIR/fleet-index.csv"
  log ""
  log "Fleet rollup index: $ROLLUP_DIR/fleet-index.csv"
fi

log ""
log "Done. $([ $EXECUTE -eq 1 ] && echo 'Live run complete.' || echo 'DRY RUN — re-run with --execute to apply.')"
