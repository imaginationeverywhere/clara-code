# sync-herus - Push Auset Platform Changes to All Heru Projects

Synchronize Auset platform files (commands, plans, agents, cheat sheets, skills) from the boilerplate to every Heru project at once. No more telling the AI to "push to all projects" manually.

**Agent:** `platform-sync-manager`

## Usage
```
/sync-herus                          # Sync everything (commands, cheat sheet, plans)
/sync-herus --commands               # Only sync .claude/commands/
/sync-herus --plans                  # Only sync .claude/plans/micro/
/sync-herus --cheat-sheet            # Only sync COMMAND_CHEAT_SHEET.md
/sync-herus --agents                 # Only sync .claude/agents/
/sync-herus --dry-run                # Show what would be synced without doing it
/sync-herus --list                   # List all Heru projects found
/sync-herus --file <path>            # Sync a specific file to all Herus
/sync-herus --push                   # Sync files AND git push to remote repos
/sync-herus --commands --push        # Sync commands then push all Herus to remote
/sync-herus --push-only              # Skip file sync, just git commit+push each Heru
```

## Arguments
- No args — Full sync of all syncable files
- `--commands` — Sync `.claude/commands/*.md` files only
- `--plans` — Sync `.claude/plans/micro/*.md` files only
- `--cheat-sheet` — Sync `.claude/COMMAND_CHEAT_SHEET.md` only
- `--agents` — Sync `.claude/agents/*.md` files only
- `--skills` — Sync `.claude/skills/` directory
- `--file <relative-path>` — Sync one specific file (e.g., `.claude/commands/progress.md`)
- `--dry-run` — Preview what would be synced, don't copy
- `--list` — List all discovered Heru projects
- `--include-cursor` — Also mirror to `.cursor/` directories (default: true)
- `--no-cursor` — Skip `.cursor/` mirroring
- `--push` — After syncing files, git add + commit + push each Heru to its remote
- `--push-only` — Skip file sync, just git commit + push any pending changes in each Heru
- `--commit-message <msg>` — Custom commit message (default: "chore(auset): sync platform commands from boilerplate")

## Execution Steps

### Step 1: Discover All Heru Projects

**CRITICAL: Only sync to ROOT-LEVEL `.claude/` directories.** Some monorepo projects have nested `.claude/` dirs inside `frontend/`, `mobile/`, `admin/`, etc. — NEVER sync boilerplate commands to those. Only sync to the `.claude/` that is at the git repository root.

Find all projects with `.claude` directories, then filter to git-root only:
```bash
# Find .claude dirs, resolve to git root, only keep root-level .claude
find /Volumes/X10-Pro/Native-Projects -maxdepth 4 -name ".claude" -type d 2>/dev/null \
  | grep -v node_modules \
  | grep -v ".git/" \
  | grep -v quik-nation-ai-boilerplate \
  | while read CLAUDE_DIR; do
    PROJECT=$(dirname "$CLAUDE_DIR")
    GITROOT=$(cd "$PROJECT" && git rev-parse --show-toplevel 2>/dev/null)
    # Only include if this .claude is at the git root (not nested in a subdirectory)
    if [ -n "$GITROOT" ] && [ "$PROJECT" = "$GITROOT" ]; then
      echo "$CLAUDE_DIR"
    elif [ -z "$GITROOT" ]; then
      # Not a git repo — still include if .claude is direct child of project
      echo "$CLAUDE_DIR"
    fi
  done | sort
```

Also check the secondary working directory with the same git-root filter:
```bash
find /Users/amenra/Native-Projects -maxdepth 4 -name ".claude" -type d 2>/dev/null \
  | grep -v node_modules \
  | grep -v ".git/" \
  | grep -v quik-nation-ai-boilerplate \
  | while read CLAUDE_DIR; do
    PROJECT=$(dirname "$CLAUDE_DIR")
    GITROOT=$(cd "$PROJECT" && git rev-parse --show-toplevel 2>/dev/null)
    if [ -n "$GITROOT" ] && [ "$PROJECT" = "$GITROOT" ]; then
      echo "$CLAUDE_DIR"
    elif [ -z "$GITROOT" ]; then
      echo "$CLAUDE_DIR"
    fi
  done | sort
```

Deduplicate by project name. Report count.

### Step 2: Determine What to Sync

**Default (no flags) — sync these:**
- `.claude/commands/*.md` — All command files
- `.claude/COMMAND_CHEAT_SHEET.md` — Quick reference
- `.claude/plans/micro/*.md` — Micro plan files (if they exist)

**With flags — sync only what's specified.**

Source is always: `/Volumes/X10-Pro/Native-Projects/AI/quik-nation-ai-boilerplate/`

### Step 3: Sync to Each Heru

For each Heru project:
```bash
SRC="/Volumes/X10-Pro/Native-Projects/AI/quik-nation-ai-boilerplate"
PROJECT="<heru-project-path>"

# Create directories if needed
mkdir -p "$PROJECT/.claude/commands"

# Copy files
cp "$SRC/.claude/commands/"*.md "$PROJECT/.claude/commands/" 2>/dev/null
cp "$SRC/.claude/COMMAND_CHEAT_SHEET.md" "$PROJECT/.claude/" 2>/dev/null

# Mirror to .cursor if it exists and --no-cursor not set
if [ -d "$PROJECT/.cursor" ]; then
  mkdir -p "$PROJECT/.cursor/commands"
  cp "$SRC/.claude/commands/"*.md "$PROJECT/.cursor/commands/" 2>/dev/null
  cp "$SRC/.claude/COMMAND_CHEAT_SHEET.md" "$PROJECT/.cursor/" 2>/dev/null
fi
```

### Step 4: Report Results

```
SYNC COMPLETE — Auset Platform → All Herus

  Files synced: 148 command files + 1 cheat sheet
  Herus updated: 53 (.claude) + 34 (.cursor mirrors)
  Total copies: 348 files

  Updated Herus:
    quikcarrental ............. OK
    quikvibes ................. OK
    dreamihaircare ............ OK
    world-cup-ready ........... OK
    ... (all projects listed)

  Skipped:
    quik-nation-ai-boilerplate (source — skipped)
```

**When `--push` or `--push-only` is used, append push results:**
```
GIT PUSH RESULTS:

  Pushed: 47 Herus
    quikcarrental ............. PUSHED (main)
    quikvibes ................. PUSHED (main)
    dreamihaircare ............ PUSHED (develop)
    ...

  Skipped: 4
    my-voyages ................ SKIP (nothing to commit)
    test-project .............. SKIP (no remote)

  Failed: 2
    world-cup-ready ........... FAILED (push rejected — pull first)
    stacksbabiee .............. FAILED (auth error)

  Summary: 47 pushed, 4 skipped, 2 failed
```

### Step 5: Git Push to Remote (when `--push` or `--push-only`)

Only runs if `--push` or `--push-only` is specified. For `--push`, this runs AFTER file sync. For `--push-only`, this is the ONLY step.

**Safety checks first:**
```bash
# For each Heru project:
PROJECT="<heru-project-path>"

# 1. Check it's a git repo
if [ ! -d "$PROJECT/.git" ]; then
  echo "SKIP (not a git repo): $PROJECT"
  continue
fi

# 2. Check it has a remote
REMOTE=$(cd "$PROJECT" && git remote 2>/dev/null | head -1)
if [ -z "$REMOTE" ]; then
  echo "SKIP (no remote): $PROJECT"
  continue
fi

# 3. Check current branch
BRANCH=$(cd "$PROJECT" && git branch --show-current 2>/dev/null)
if [ -z "$BRANCH" ]; then
  echo "SKIP (detached HEAD): $PROJECT"
  continue
fi
```

**Git operations:**
```bash
COMMIT_MSG="${CUSTOM_MSG:-chore(auset): sync platform commands from boilerplate}"

cd "$PROJECT"

# Stage only .claude/ and .cursor/ changes (never stage project code)
git add .claude/ .cursor/ 2>/dev/null

# Check if there's anything to commit
if git diff --cached --quiet; then
  echo "SKIP (nothing to commit): $(basename $PROJECT)"
  continue
fi

# Commit and push
git commit -m "$COMMIT_MSG"
git push "$REMOTE" "$BRANCH"
```

**Error handling:**
- If commit fails → log and continue to next Heru
- If push fails (auth, network, etc.) → log failure and continue
- Never `--force` push — if push is rejected, log it for manual resolution
- Collect results for the report

### Step 6: Verify (Optional)

Quick verification that key files landed:
```bash
# Spot-check 3 random Herus
for proj in $(shuf -n 3 <<< "$HERU_LIST"); do
  test -f "$proj/.claude/commands/progress.md" && echo "$proj: OK" || echo "$proj: MISSING"
done
```

## What Gets Synced vs. What Doesn't

### SYNCED (Platform-level, shared across all Herus)
- `.claude/commands/*.md` — All commands
- `.claude/COMMAND_CHEAT_SHEET.md` — Quick reference
- `.claude/plans/micro/*.md` — Micro plans (when using --plans)
- `.claude/agents/*.md` — Agent definitions (when using --agents)

### NEVER SYNCED (Project-specific)
- `.claude/settings.json` — Per-project settings
- `.claude/config/` — Per-project configuration
- `CLAUDE.md` — Root project instructions (project-specific)
- `.claude/plans/` (non-micro) — Project-specific plans
- `docs/`, `backend/`, `frontend/` — All project code

## Examples

```bash
# Just added new commands, push them everywhere
/sync-herus --commands

# Updated micro plans with Yapit, push to all Herus
/sync-herus --plans

# Full sync after a big boilerplate update
/sync-herus

# See what would happen without doing it
/sync-herus --dry-run

# Push one specific new file
/sync-herus --file .claude/commands/talk.md

# How many Herus do we have?
/sync-herus --list

# Sync commands AND push to all remote repos
/sync-herus --commands --push

# Full sync + push everything to remote
/sync-herus --push

# Push with a custom commit message
/sync-herus --push --commit-message "feat(auset): add dialogue-first commands"

# Don't sync files — just commit and push what's already there
/sync-herus --push-only

# Push only with custom message
/sync-herus --push-only --commit-message "chore(auset): sync platform updates"
```

## Related Commands
- `/update-boilerplate` — Pull updates FROM the boilerplate (opposite direction)
- `/sync-boilerplate-commands` — Older version of this (sync-herus replaces it)
- `/commands` — Navigate the commands you just synced
- `/progress` — Check platform progress across all epics
