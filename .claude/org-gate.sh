#!/bin/bash
# Auset Platform — GitHub Organization Gate
# The platform ONLY works inside approved GitHub organizations.
# Fork it to a personal repo? Commands disabled. Agents disabled. Dead.

APPROVED_ORGS=("imaginationeverywhere")
GATE_RESULT="DENIED"

# Get the git remote URL
REMOTE_URL=$(git remote get-url origin 2>/dev/null)

if [ -z "$REMOTE_URL" ]; then
  echo "NO_REMOTE"
  exit 1
fi

# Extract the org/owner from the remote URL
# Handles both SSH (git@github.com:org/repo.git) and HTTPS (https://github.com/org/repo.git)
if [[ "$REMOTE_URL" == *"github.com"* ]]; then
  # Extract org name
  ORG=$(echo "$REMOTE_URL" | sed -E 's|.*github\.com[:/]([^/]+)/.*|\1|')

  for APPROVED in "${APPROVED_ORGS[@]}"; do
    if [ "$ORG" = "$APPROVED" ]; then
      GATE_RESULT="APPROVED"
      break
    fi
  done
fi

case "$1" in
  check)
    if [ "$GATE_RESULT" = "APPROVED" ]; then
      echo "ORG_APPROVED:$ORG"
      exit 0
    else
      echo "ORG_DENIED:$ORG"
      echo ""
      echo "This repository is not in an approved GitHub organization."
      echo "Approved orgs: ${APPROVED_ORGS[*]}"
      echo "Your org: $ORG"
      echo ""
      echo "Auset Platform features are DISABLED."
      exit 1
    fi
    ;;

  who)
    # Identify the current developer by git config or GitHub CLI
    GIT_EMAIL=$(git config user.email 2>/dev/null)
    GIT_NAME=$(git config user.name 2>/dev/null)
    GH_USER=$(gh api user --jq '.login' 2>/dev/null)

    echo "GIT_NAME:$GIT_NAME"
    echo "GIT_EMAIL:$GIT_EMAIL"
    echo "GH_USER:$GH_USER"
    echo "ORG:$ORG"
    ;;

  *)
    echo "Auset Platform Organization Gate"
    echo ""
    echo "Usage: org-gate.sh <command>"
    echo ""
    echo "Commands:"
    echo "  check  — Verify this repo is in an approved org"
    echo "  who    — Identify the current developer"
    echo ""
    echo "Approved orgs: ${APPROVED_ORGS[*]}"
    ;;
esac
