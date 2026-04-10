# /push-herus — Push Platform Changes to All Heru Repos

Commit and push `.claude/` and `.cursor/` changes from every Heru project to its GitHub remote — fast, in parallel.

**Prerequisites:** Run `sync-herus-symlink.sh` first (one-time) to replace copied files with symlinks to the boilerplate. After that, all Herus read commands/agents from the boilerplate source directly. This command pushes the symlink references to GitHub so remote environments (QC1, EC2) get them on pull.

## Usage
```
/push-herus                          # Push all Herus (8 parallel)
/push-herus --jobs 4                 # Push 4 at a time (lighter on CPU)
/push-herus --jobs 12                # Push 12 at a time (faster, heavier)
/push-herus --dry-run                # Show what would be pushed, don't do it
/push-herus --message "feat: new commands"  # Custom commit message
/push-herus --list                   # Just list discovered Heru repos
```

## Arguments
- No args — Push all Herus, 8 parallel, default commit message
- `--jobs <N>` — Number of parallel pushes (default: 8)
- `--dry-run` — Preview only, no commits or pushes
- `--message "<msg>"` — Custom commit message (default: `chore(auset): sync platform commands + agents (symlinked)`)
- `--list` — List all discovered Heru repos and exit

## Execution Steps

### Step 1: Run the Push Script

Execute the parallel push script in the background so it doesn't block the session:
```bash
/Volumes/X10-Pro/Native-Projects/AI/quik-nation-ai-boilerplate/.claude/scripts/push-herus.sh <args>
```

Pass through any arguments the user provided (`--jobs`, `--dry-run`, `--message`).

**Run this in the background** using `run_in_background: true` — it can take several minutes across 40+ repos. Tell Mo it's running and you'll report when done.

### Step 2: Handle --list

If `--list` is passed, just discover and list the Heru repos:
```bash
find /Volumes/X10-Pro/Native-Projects -maxdepth 4 -name ".claude" -type d 2>/dev/null \
  | grep -v node_modules | grep -v ".git/" | grep -v quik-nation-ai-boilerplate \
  | sed 's|/.claude$||' | sort \
  | while read dir; do [ -d "$dir/.git" ] && basename "$dir"; done
```

### Step 3: Report Results

When the background task completes, read the output and show Mo the summary:
```
PUSH HERUS COMPLETE
━━━━━━━━━━━━━━━━━━━━
  Pushed: <N>
  Skipped: <N> (nothing to commit / no remote)
  Failed: <N>

  Failed repos (if any):
    <repo> ... <reason>
━━━━━━━━━━━━━━━━━━━━
```

### Step 4: Post to Live Feed (if pushed > 0)

```bash
echo "$(date '+%H:%M:%S') | boilerplate | PROGRESS | HQ | /push-herus: <N> Herus pushed to GitHub" >> ~/auset-brain/Swarms/live-feed.md
```

## How It Works

1. **Discovers** all projects with `.claude/` dirs under `/Volumes/X10-Pro/Native-Projects/`
2. **Filters** to only git repos (has `.git/` directory), excludes boilerplate itself
3. **For each repo:** `git add .claude/ .cursor/` → check if anything changed → commit → push
4. **Parallel execution:** 8 repos at a time (configurable with `--jobs`)
5. **Collects results** and reports pushed/skipped/failed counts

## Architecture: Symlinks + Push

The Auset platform uses a **symlink-first** model for sharing commands and agents:

```
BOILERPLATE (source of truth)
  .claude/commands/*.md  ←── 428 command files
  .claude/agents/*.md    ←── 117 agent files

EVERY HERU (symlinked)
  .claude/commands → /Volumes/X10-Pro/.../boilerplate/.claude/commands
  .claude/agents  → /Volumes/X10-Pro/.../boilerplate/.claude/agents
```

- **Local:** Edit boilerplate → all 64 Herus see it instantly (symlink)
- **Remote:** `/push-herus` commits the symlinks to GitHub so QC1/EC2 get them on pull
- **One-time setup:** `.claude/scripts/sync-herus-symlink.sh` (already done)

## What Gets Committed
- `.claude/commands` (symlink)
- `.claude/agents` (symlink)
- `.claude/plans/micro` (symlink)
- `.cursor/commands` (symlink)
- `.cursor/agents` (symlink)
- `.cursor/plans/micro` (symlink)

## What Does NOT Get Committed
- Project-specific files (`.claude/settings.json`, `CLAUDE.md`, etc.)
- Application code (frontend/, backend/, etc.)
- Only `.claude/` and `.cursor/` are staged

## Safety
- Never force-pushes
- If push is rejected (needs pull), logs it as FAILED for manual resolution
- Only stages `.claude/` and `.cursor/` — never touches project code
- Skips repos with no remote, detached HEAD, or nothing to commit

## Related Commands
- `/sync-herus` — Old copy-based sync (replaced by symlinks for local)
- `/update-boilerplate` — Pull updates FROM the boilerplate (opposite direction)
- `/commands` — Navigate the commands that just got pushed
