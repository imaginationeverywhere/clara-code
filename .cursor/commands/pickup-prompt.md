# /pickup-prompt — Find and Execute All Not-Started Prompts

**Named after the pattern:** Cursor agents on QCS1 pick up prompts from `prompts/<yyyy>/<Month>/<dd>/1-not-started/` and execute them in isolated git worktrees.

## What This Command Does

Resolves today's date, finds ALL prompts in `1-not-started/`, and processes them in a loop — one by one — until the queue is empty. For each prompt: creates a detached worktree, executes the prompt, creates a branch FROM the worktree when done, pushes the branch, opens a PR, moves the prompt to `3-completed/`, and removes the worktree. **You do not need to re-run this command.** It loops automatically until all prompts are done.

## Usage

```
/pickup-prompt                    # Process ALL not-started prompts for today (loops automatically)
/pickup-prompt 2026/April/12      # Specific date
/pickup-prompt --list             # List all not-started prompts without executing
/pickup-prompt 01-cc-web-full.md  # Execute a specific prompt by filename only
/pickup-prompt --clerk            # Inject Clerk auth standard before executing (see below)
```

## Flags

### `--clerk`

When this flag is present, the agent MUST read `.claude/standards/clerk-auth.md` before executing any prompt. The standard's rules become mandatory constraints for the entire execution — overriding any conflicting instruction in the prompt itself.

Use this flag for any prompt that involves:
- Sign-in pages
- Sign-up pages
- Auth layouts
- SSO/OAuth flows
- Clerk-protected routes

```bash
# Detect --clerk flag
CLERK_STANDARD=""
if echo "$*" | grep -q "\-\-clerk"; then
  CLERK_STANDARD=$(cat .claude/standards/clerk-auth.md)
  echo "📋 Clerk Auth Standard loaded — applying mandatory constraints:"
  echo "   ❌ No <SignIn> or <SignUp> embedded components"
  echo "   ✅ useSignIn() / useSignUp() hooks required"
  echo "   ✅ SSO callback route required"
  echo ""
fi
```

The loaded standard is prepended to the prompt context before execution. If the prompt says `<SignIn appearance={{...}} />` anywhere, the agent overrides it with the hook pattern from the standard.

## Execution

### Step 0 — Pull latest + clean up merged prompt branches

Before looking for prompts, pull the latest and delete any prompt branches whose PRs have been merged (cleanup from the last run):

```bash
echo "Pulling latest from remote..."
git pull origin $(git branch --show-current) 2>&1
echo ""

echo "Cleaning up merged prompt branches from last run..."
gh pr list --state merged --json headRefName --jq '.[].headRefName' 2>/dev/null \
  | grep '^prompt/' \
  | while read BRANCH; do
      git branch -d "$BRANCH" 2>/dev/null || git branch -D "$BRANCH" 2>/dev/null
      git push origin --delete "$BRANCH" 2>/dev/null || true
      echo "  🗑️  Deleted merged branch: $BRANCH"
    done
echo ""
```

If the pull fails (merge conflict, dirty worktree), stop and report before proceeding.

### Step 1 — Resolve the prompt directory

```bash
YEAR=$(date +%Y)
MONTH=$(date +%B)    # Full month name: January, February, ...
DAY=$(date +%-d)     # Day without leading zero
PROMPT_DIR="prompts/${YEAR}/${MONTH}/${DAY}/1-not-started"

echo "Looking in: ${PROMPT_DIR}"
ls "${PROMPT_DIR}" 2>/dev/null || echo "No prompts directory found at ${PROMPT_DIR}"
```

### Step 2 — Loop: process every prompt until the queue is empty

**This is the main loop. Do NOT stop after one prompt. Do NOT ask the user to run the command again.**

```bash
while true; do
  # ── Find next prompt ──────────────────────────────────────────────────────
  if [ -n "$SPECIFIC_PROMPT" ]; then
    # Specific file requested (from ARGUMENTS)
    TARGET="${PROMPT_DIR}/${SPECIFIC_PROMPT}"
    [[ "$SPECIFIC_PROMPT" != *.md ]] && TARGET="${TARGET}.md"
    SPECIFIC_PROMPT=""  # only run specific once
  else
    TARGET=$(ls "${PROMPT_DIR}"/*.md 2>/dev/null | sort | head -1)
  fi

  if [ -z "$TARGET" ] || [ ! -f "$TARGET" ]; then
    echo ""
    echo "✅ Queue empty — all prompts processed for ${YEAR}/${MONTH}/${DAY}"
    echo "$(date '+%H:%M:%S') | $(basename $(pwd)) | QUEUE EMPTY | All prompts complete for ${YEAR}/${MONTH}/${DAY}" >> ~/auset-brain/Swarms/live-feed.md
    break
  fi

  PROMPT_NAME=$(basename "$TARGET" .md)

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "PICKING UP PROMPT: $(basename $TARGET)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  # ── Move to in-progress ───────────────────────────────────────────────────
  IN_PROGRESS_DIR="prompts/${YEAR}/${MONTH}/${DAY}/2-in-progress"
  mkdir -p "$IN_PROGRESS_DIR"
  mv "$TARGET" "$IN_PROGRESS_DIR/"
  INPROGRESS_FILE="${IN_PROGRESS_DIR}/$(basename $TARGET)"
  echo "📋 Moved to: ${INPROGRESS_FILE}"

  # ── Read the prompt ───────────────────────────────────────────────────────
  cat "$INPROGRESS_FILE"
  echo ""

  # ── Create a DETACHED worktree (no branch yet) ────────────────────────────
  WORKTREE_PATH="/tmp/worktrees/${PROMPT_NAME}"
  mkdir -p "/tmp/worktrees"

  # Remove stale worktree if it exists from a prior interrupted run
  git worktree remove "$WORKTREE_PATH" --force 2>/dev/null || true
  rm -rf "$WORKTREE_PATH" 2>/dev/null || true

  # Create worktree detached from current HEAD (develop)
  git worktree add --detach "$WORKTREE_PATH" 2>/dev/null || {
    echo "ERROR: Could not create worktree at $WORKTREE_PATH"
    # Move prompt back to not-started on failure
    mv "$INPROGRESS_FILE" "$TARGET"
    break
  }

  echo "🌿 Detached worktree created: $WORKTREE_PATH"
  echo "All changes happen inside the worktree — not in the main checkout."
  echo ""

  # ── EXECUTE THE PROMPT ────────────────────────────────────────────────────
  # Read the prompt from 2-in-progress/ and follow ALL instructions in it.
  # All file edits happen inside $WORKTREE_PATH.
  # [Cursor agent: execute the prompt content shown above inside $WORKTREE_PATH]

  # ── Create branch FROM the worktree (after work is done) ─────────────────
  BRANCH_NAME="prompt/${YEAR}-$(date +%m)-$(date +%d)/${PROMPT_NAME}"
  BRANCH_NAME=$(echo "$BRANCH_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9\/\-]/-/g' | sed 's/-\+/-/g')

  cd "$WORKTREE_PATH"

  # Create the branch here (from the worktree's current state)
  git checkout -b "$BRANCH_NAME" 2>/dev/null || {
    echo "ERROR: Could not create branch $BRANCH_NAME in worktree"
    cd - > /dev/null
    git worktree remove "$WORKTREE_PATH" --force 2>/dev/null
    mv "$INPROGRESS_FILE" "$TARGET"
    break
  }

  echo "🌿 Branch created from worktree: $BRANCH_NAME"

  # ── Commit the work ───────────────────────────────────────────────────────
  git add -A

  COMMIT_MSG="feat: execute prompt ${PROMPT_NAME}

Prompt source: prompts/${YEAR}/${MONTH}/${DAY}/2-in-progress/$(basename $INPROGRESS_FILE)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

  git commit -m "$COMMIT_MSG" 2>/dev/null || echo "(nothing to commit — prompt may have been docs-only)"

  # ── Push the branch to GitHub ─────────────────────────────────────────────
  REMOTE=$(git remote | head -1)
  if [ -z "$REMOTE" ]; then
    echo "⚠️  No git remote found — skipping push and PR"
  else
    git push "$REMOTE" "$BRANCH_NAME" 2>&1
    echo ""
    echo "🚀 Pushed branch: $BRANCH_NAME → $REMOTE"

    # ── Create a PR on that branch ────────────────────────────────────────
    PR_TITLE="feat: ${PROMPT_NAME}"
    PR_BODY="## Prompt Execution

**Prompt:** \`${PROMPT_NAME}\`
**Date:** ${YEAR}/${MONTH}/${DAY}
**Source:** \`prompts/${YEAR}/${MONTH}/${DAY}/3-completed/$(basename $INPROGRESS_FILE)\`

## Summary
Executed by Cursor agent via \`/pickup-prompt\`. See prompt file for full task description.

## Review
Run \`/review-code\` to auto-detect this PR, review it, merge into develop, and delete the branch.

🤖 Generated with [Claude Code](https://claude.com/claude-code)"

    gh pr create \
      --title "$PR_TITLE" \
      --body "$PR_BODY" \
      --base develop \
      --head "$BRANCH_NAME" 2>&1

    PR_URL=$(gh pr list --head "$BRANCH_NAME" --json url --jq '.[0].url' 2>/dev/null)
    echo ""
    echo "📬 PR created: $PR_URL"
  fi

  # ── Return to main repo ───────────────────────────────────────────────────
  cd - > /dev/null

  # ── Move prompt to 3-completed ────────────────────────────────────────────
  COMPLETED_DIR="prompts/${YEAR}/${MONTH}/${DAY}/3-completed"
  mkdir -p "$COMPLETED_DIR"
  mv "$INPROGRESS_FILE" "$COMPLETED_DIR/"
  echo ""
  echo "✅ Prompt complete. Moved to: ${COMPLETED_DIR}/$(basename $INPROGRESS_FILE)"

  # ── Remove the worktree (branch stays in git history) ─────────────────────
  git worktree remove "$WORKTREE_PATH" --force 2>/dev/null
  echo "🧹 Worktree cleaned up: $WORKTREE_PATH"

  # ── Post progress to live feed ────────────────────────────────────────────
  echo "$(date '+%H:%M:%S') | $(basename $(pwd)) | PROMPT COMPLETE | ${PROMPT_NAME} | Branch: ${BRANCH_NAME} | PR: ${PR_URL:-N/A}" >> ~/auset-brain/Swarms/live-feed.md

  # ── Count remaining ───────────────────────────────────────────────────────
  REMAINING=$(ls "${PROMPT_DIR}"/*.md 2>/dev/null | wc -l | tr -d ' ')
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  if [ "$REMAINING" -gt 0 ]; then
    echo "📋 ${REMAINING} prompt(s) remaining — picking up next..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
  else
    echo "📋 0 prompts remaining — queue clear."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  fi

  # Loop continues automatically to the next prompt

done
```

## Directory Convention

```
prompts/
└── 2026/
    └── April/
        └── 12/
            ├── 1-not-started/     ← All prompts queue here
            │   ├── 01-web-navbar.md
            │   ├── 02-ecs-deploy.md
            │   └── 03-test-fix.md
            ├── 2-in-progress/     ← Moved here when agent starts (one at a time)
            └── 3-completed/       ← Moved here when work is done + PR opened
```

## Worktree Convention

```
/tmp/worktrees/
└── 01-web-navbar/       ← Detached worktree, cleaned up after PR is created

Branch created INSIDE the worktree (after work is done):
  prompt/2026-04-12/01-web-navbar

PR base:  develop
PR head:  prompt/2026-04-12/01-web-navbar
```

## Full Lifecycle Summary

```
Step 0: git pull + delete merged prompt branches from last run
    ↓
1-not-started/ → [pick up] → 2-in-progress/
    ↓
[create DETACHED worktree at /tmp/worktrees/<name>]
    ↓
[execute prompt — all edits inside worktree]
    ↓
[git checkout -b <branch> inside worktree]
[git commit]
[git push origin <branch>]
[gh pr create --base develop --head <branch>]
    ↓
3-completed/
[worktree removed]
    ↓
[LOOP — pick up next prompt automatically]
    ↓
[when 1-not-started/ is empty → post to live feed → done]
```

## Key Rules

- **Never stop after one prompt.** Loop until `1-not-started/` is empty.
- **Worktree is created DETACHED** — no branch at creation time.
- **Branch is created FROM the worktree AFTER work is done** — `git checkout -b` inside the worktree.
- **Worktree is deleted after the PR is opened** — the branch lives in GitHub.
- **On next run, Step 0 cleans up merged PR branches** — `git pull` + delete merged `prompt/*` branches.
- **All edits happen inside `$WORKTREE_PATH`** — never in the main checkout.
- Prompts are numbered (01-, 02-) — lower number = higher priority.
- If a worktree creation fails, the prompt is moved back to `1-not-started/` and the loop stops.

## Notes

- The worktree branch stays in GitHub as a record of what was done
- PR base is always `develop`
- Run `/review-code` after prompts complete — it auto-detects open prompt PRs, reviews, merges, and deletes the branches
- If `1-not-started/` is empty at start, posts "QUEUE EMPTY" to live feed and exits

## Command Metadata

```yaml
name: pickup-prompt
version: 3.0.0
changelog:
  - v3.0.0: Auto-loop all prompts; worktree detached then branch; gh pr create; cleanup merged branches on Step 0
  - v2.1.0: Added Step 0 git pull
  - v2.0.0: Worktree lifecycle (create → execute → push → cleanup)
  - v1.0.0: Initial release
```
