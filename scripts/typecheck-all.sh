#!/usr/bin/env bash
# Walk every tsconfig.json in the repo and run `tsc --noEmit` in its directory.
# Prints a summary at the end. Exits non-zero if any workspace fails.
#
# Catches what `pnpm check` misses: workspaces without check scripts, dirs
# outside the pnpm workspace tree (mobile/, mockups/, ide/, desktop/), and
# packages whose own tsconfig has stricter settings than the root tsgo run.
#
# Usage:
#   bash scripts/typecheck-all.sh          # check everything, full summary
#   bash scripts/typecheck-all.sh --quiet  # only print failing workspaces
#   bash scripts/typecheck-all.sh --first  # stop on first failure

set -eo pipefail

QUIET=false
STOP_ON_FIRST=false
for arg in "$@"; do
  case "$arg" in
    --quiet) QUIET=true ;;
    --first) STOP_ON_FIRST=true ;;
    -h|--help)
      echo "Usage: $0 [--quiet] [--first]"
      echo "  --quiet  only print failing workspaces (still summarizes)"
      echo "  --first  stop on first failure"
      exit 0 ;;
  esac
done

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# Find every tsconfig.json, skip generated/vendor dirs
DIRS=$(find . -name "tsconfig.json" \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -not -path "*/.next/*" \
  -not -path "*/coverage/*" \
  -not -path "*/build/*" \
  -not -path "*/.open-next/*" \
  -not -path "*/.wrangler/*" \
  | xargs -I {} dirname {} | sort -u)

TOTAL=0
PASSED=0
FAILED=0
FAILED_DIRS=()

# ANSI colors (skip if not a tty)
if [ -t 1 ]; then
  GREEN="\033[32m"; RED="\033[31m"; YELLOW="\033[33m"; RESET="\033[0m"
else
  GREEN=""; RED=""; YELLOW=""; RESET=""
fi

echo "Walking $(echo "$DIRS" | wc -l | tr -d ' ') tsconfig.json directories…"
echo ""

for d in $DIRS; do
  TOTAL=$((TOTAL + 1))
  rel="${d#./}"

  # Run tsc --noEmit, capture output
  if output=$(cd "$d" && npx --no-install tsc --noEmit 2>&1); then
    PASSED=$((PASSED + 1))
    [ "$QUIET" = false ] && echo -e "  ${GREEN}✓${RESET} $rel"
  else
    FAILED=$((FAILED + 1))
    FAILED_DIRS+=("$rel")
    echo -e "  ${RED}✗${RESET} $rel"
    # Print only the actual error lines, not full tsc noise
    echo "$output" | grep -E "error TS|^Found [0-9]+ error" | head -10 | sed 's/^/      /'
    if [ "$STOP_ON_FIRST" = true ]; then
      echo ""
      echo -e "${RED}Stopping on first failure (--first).${RESET}"
      exit 1
    fi
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All $TOTAL workspaces clean.${RESET}"
  exit 0
else
  echo -e "${RED}✗ $FAILED of $TOTAL workspaces failed:${RESET}"
  for d in "${FAILED_DIRS[@]}"; do
    echo "    - $d"
  done
  echo ""
  echo -e "${YELLOW}Re-run with: cd <dir> && npx tsc --noEmit  for full output.${RESET}"
  exit 1
fi
