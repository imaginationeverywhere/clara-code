# /pickup-prompt — Find and Execute the Next Not-Started Prompt

**Named after the pattern:** Cursor agents on QCS1 pick up prompts from `prompts/<yyyy>/<Month>/<dd>/1-not-started/` and execute them in isolated git worktrees.

## What This Command Does

Resolves today's date, finds the `1-not-started/` directory for that date, picks the first available prompt, moves it to `2-in-progress/`, creates a git worktree, executes the prompt, then moves it to `3-completed/` and pushes the branch to GitHub.

## Usage

```
/pickup-prompt                    # Find and execute the next not-started prompt for today
/pickup-prompt 2026/April/12      # Specific date
/pickup-prompt --list             # List all not-started prompts without executing
/pickup-prompt 01-cc-web-full.md  # Execute a specific prompt by filename
```

## Execution

### Step 0 — Pull latest from remote

Before looking for prompts, pull the latest from the remote so any prompts HQ queued are available:

```bash
echo "Pulling latest from remote..."
git pull origin $(git branch --show-current) 2>&1
echo ""
```

If the pull fails (e.g., merge conflict, dirty worktree), stop and report the error before proceeding.

### Step 1 — Resolve the prompt directory

```bash
YEAR=$(date +%Y)
MONTH=$(date +%B)   # Full month name: January, February, ... (matches directory convention)
DAY=$(date +%-d)    # Day without leading zero
PROMPT_DIR="prompts/${YEAR}/${MONTH}/${DAY}/1-not-started"

echo "Looking in: ${PROMPT_DIR}"
ls "${PROMPT_DIR}" 2>/dev/null || echo "No prompts directory found at ${PROMPT_DIR}"
```

### Step 2 — List available prompts

```bash
PROMPTS=$(ls "${PROMPT_DIR}"/*.md 2>/dev/null | sort)
if [ -z "$PROMPTS" ]; then
  echo "✅ No prompts waiting in ${PROMPT_DIR}"
  exit 0
fi

echo "Prompts waiting:"
for f in $PROMPTS; do
  echo "  - $(basename $f)"
done
```

### Step 3 — Pick up the first prompt (or the one named in ARGUMENTS)

If `$ARGUMENTS` is empty, take the first file alphabetically (lowest number = highest priority).
If `$ARGUMENTS` names a file, use that one.

```bash
if [ -n "$ARGUMENTS" ] && [ "$ARGUMENTS" != "--list" ]; then
  # Specific file requested
  TARGET="${PROMPT_DIR}/${ARGUMENTS}"
  if [[ "$ARGUMENTS" != *.md ]]; then
    TARGET="${TARGET}.md"
  fi
else
  # Take the first prompt
  TARGET=$(ls "${PROMPT_DIR}"/*.md 2>/dev/null | sort | head -1)
fi

if [ ! -f "$TARGET" ]; then
  echo "ERROR: Prompt not found: ${TARGET}"
  exit 1
fi

PROMPT_NAME=$(basename "$TARGET" .md)

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PICKING UP PROMPT: $(basename $TARGET)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat "$TARGET"
```

### Step 4 — Move to in-progress

```bash
IN_PROGRESS_DIR="prompts/${YEAR}/${MONTH}/${DAY}/2-in-progress"
mkdir -p "$IN_PROGRESS_DIR"
mv "$TARGET" "$IN_PROGRESS_DIR/"
echo ""
echo "📋 Moved to: ${IN_PROGRESS_DIR}/$(basename $TARGET)"
```

### Step 5 — Create a git worktree for the work

Generate a branch name from the prompt filename and today's date, then create a worktree:

```bash
# Sanitize branch name: lowercase, replace non-alphanumeric with hyphens
BRANCH_NAME="prompt/${YEAR}-$(date +%m)-$(date +%d)/${PROMPT_NAME}"
BRANCH_NAME=$(echo "$BRANCH_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9\/\-]/-/g' | sed 's/-\+/-/g')

WORKTREE_PATH="/tmp/worktrees/${PROMPT_NAME}"
mkdir -p "/tmp/worktrees"

# Create worktree on a new branch
git worktree add "$WORKTREE_PATH" -b "$BRANCH_NAME" 2>/dev/null || {
  # Branch may already exist — use it
  git worktree add "$WORKTREE_PATH" "$BRANCH_NAME" 2>/dev/null || {
    echo "ERROR: Could not create worktree at $WORKTREE_PATH"
    exit 1
  }
}

echo "🌿 Worktree created: $WORKTREE_PATH (branch: $BRANCH_NAME)"
echo ""
echo "Working in: $WORKTREE_PATH"
```

### Step 6 — Execute the prompt

Read the full prompt content (from `2-in-progress/`) and follow all instructions in it.
All file edits happen inside the worktree at `$WORKTREE_PATH`.

After completion, commit the work in the worktree:

```bash
cd "$WORKTREE_PATH"

# Stage all changes made during execution
git add -A

# Commit with prompt name as message
git commit -m "feat: execute prompt ${PROMPT_NAME}

Prompt source: prompts/${YEAR}/${MONTH}/${DAY}/2-in-progress/$(basename $TARGET)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>" 2>/dev/null || echo "(nothing to commit — prompt may have been docs-only)"
```

### Step 7 — Push the worktree branch to GitHub

```bash
cd "$WORKTREE_PATH"

# Get the remote (default: origin)
REMOTE=$(git remote | head -1)
if [ -z "$REMOTE" ]; then
  echo "⚠️  No git remote found — skipping push"
else
  git push "$REMOTE" "$BRANCH_NAME" 2>&1
  echo ""
  echo "🚀 Pushed branch: $BRANCH_NAME → $REMOTE"
fi
```

### Step 8 — Move prompt to completed

Back in the main repo, move the prompt from `2-in-progress/` to `3-completed/`:

```bash
COMPLETED_DIR="prompts/${YEAR}/${MONTH}/${DAY}/3-completed"
mkdir -p "$COMPLETED_DIR"
INPROGRESS_FILE="${IN_PROGRESS_DIR}/$(basename $TARGET)"
mv "$INPROGRESS_FILE" "$COMPLETED_DIR/"
echo ""
echo "✅ Prompt complete. Moved to: ${COMPLETED_DIR}/$(basename $TARGET)"
```

### Step 9 — Clean up the worktree

```bash
# Remove the worktree (branch stays in git history)
git worktree remove "$WORKTREE_PATH" --force 2>/dev/null
echo "🧹 Worktree cleaned up: $WORKTREE_PATH"
```

### Step 10 — Check for the next prompt

```bash
NEXT=$(ls "${PROMPT_DIR}"/*.md 2>/dev/null | sort | head -1)
if [ -n "$NEXT" ]; then
  echo ""
  echo "Next prompt waiting: $(basename $NEXT)"
  echo "Run /pickup-prompt to continue."
else
  echo ""
  echo "$(date '+%H:%M:%S') | $(basename $(pwd)) | QUEUE EMPTY | All prompts complete for ${YEAR}/${MONTH}/${DAY}" >> ~/auset-brain/Swarms/live-feed.md
  echo "Queue clear for today. Posting to live feed."
fi
```

## Directory Convention

```
prompts/
└── 2026/
    └── April/
        └── 12/
            ├── 1-not-started/     ← Cursor agents pick from here
            │   ├── 01-web-navbar.md
            │   ├── 02-ecs-deploy.md
            │   └── 03-test-fix.md
            ├── 2-in-progress/     ← Moved here when agent starts work
            └── 3-completed/       ← Moved here when work is done + pushed
```

## Worktree Convention

```
/tmp/worktrees/
└── 01-web-navbar/                 ← One worktree per prompt (cleaned up after push)

Branch naming:
  prompt/2026-04-12/01-web-navbar
```

## Full Lifecycle Summary

```
1-not-started/   →   [pick up]   →   2-in-progress/
                                          ↓
                                   [create worktree]
                                   [execute prompt]
                                   [git commit]
                                   [git push branch]
                                          ↓
                                     3-completed/
                                   [worktree removed]
```

## Notes

- Prompts are numbered (01-, 02-) — lower number = higher priority
- Each prompt is a complete Cursor agent task spec — self-contained instructions
- Agents run one prompt at a time; pick up the next when done
- The worktree branch stays in GitHub history as a record of what was done
- PR creation (if needed) is handled by the Clara Code team's review workflow
- If `1-not-started/` is empty, the agent's queue is clear — post to live feed
