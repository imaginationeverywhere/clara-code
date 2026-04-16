# /open-tabs — Claude Code + Cursor agent windows/panes in the current tmux session

Spawn **additive** tmux **windows** (tabs) or **panes** (splits) in the **session you are already in** — no new tmux server, no detached session, **no `kill-window`** (aligned with `feedback-tmux-layout-dont-kill-windows.md`).

**Implementation:** `.claude/scripts/open-tabs.sh` (run from a shell inside tmux).

## Usage

```bash
/open-tabs                                        # Interactive prompts (stdin)
/open-tabs --claude HQ,Clara-Code,Clara-Platform  # One Claude Code window per team (local)
/open-tabs --cursor 3                              # Three local Cursor agent tabs
/open-tabs --cursor-qcs1 3                         # Three SSH → QCS1 tabs, then cursor agent
/open-tabs --cursor "23-00,23-15"                  # Cursor tabs bound to today’s prompt files (basename match)
/open-tabs --layout panes                          # split-window instead of new-window
/open-tabs --claude HQ --cursor-qcs1 3 --layout tabs
/open-tabs --dry-run                              # Print tmux commands; do not run
/open-tabs --project boilerplate --cursor 2
/open-tabs --project /path/to/repo --remote-path '~/projects/custom' --cursor-qcs1 1
```

### Direct script (from repo)

```bash
cd /path/to/repo   # inside tmux
bash .claude/scripts/open-tabs.sh --dry-run --claude HQ --cursor 1
# Optional: cp .claude/scripts/open-tabs.sh ~/bin/open-tabs && chmod +x ~/bin/open-tabs
```

## Requirements

- **Must run inside tmux** — `echo $TMUX` non-empty; `tmux display-message -p '#S'` prints session name.
- **macOS** for full Cursor keychain behavior (optional `~/.agent-creds/keychain-password`, same pattern as `pickup-dispatch.sh`). On Linux, script still runs; unlock step is skipped.
- **SSH:** `quik-cloud` host alias (see `open-qcs1.md`).

## Flags (script)

| Flag | Description |
|------|-------------|
| `--claude t1,t2,...` | One window/pane each; runs `claude` after `cd` to project |
| `--cursor N` | N local tabs with `cursor agent --yolo` |
| `--cursor id,id,...` | Comma-separated **prompt id** substrings → today’s `prompts/<y>/<Month>/<d>/1-not-started/*id*.md` |
| `--cursor-qcs1 N` | N tabs SSH to QCS1, `cd` remote path, `cursor agent --yolo` |
| `--layout tabs\|panes` | **tabs** = `new-window`; **panes** = `split-window` (current window only) |
| `--project PATH\|ALIAS` | Project directory (default: `pwd -P`). See alias table below. |
| `--remote-path PATH` | Override remote `cd` for `--cursor-qcs1` (default: map from repo basename → `~/projects/<name>`) |
| `--dry-run` | Echo what would run |
| `--yes` | Skip confirmation when spawning **6+** tabs/panes |
| `--interactive` | Prompt for teams / counts / layout / project |
| `-h`, `--help` | Short usage |

## Project aliases (`--project`)

Paths are Mo’s canonical layout; override with an absolute `--project` if your tree differs.

| Alias | Example resolution |
|-------|---------------------|
| `boilerplate`, `bp` | `/Volumes/X10-Pro/Native-Projects/AI/quik-nation-ai-boilerplate` |
| `wcr`, `world-cup-ready` | `.../clients/world-cup-ready` |
| `qcr`, `quikcarrental` | `.../clients/quikcarrental` |
| `s962`, `site962` | `.../clients/site962` |
| `fmo` | `.../clients/fmo` |
| `clara-code` | `.../clients/clara-code` |
| `clara-agents`, `claraagents` | `.../clients/claraagents` |

Non-matching values are treated as **literal paths**.

## Safety

- **Refuses outside tmux** with a clear error.
- **Confirms** before opening **6+** spawns (unless `--yes` or `--dry-run`).
- **`.heru-skip`** at project root → abort (opt-out Herus are not opened).
- **Additive only** — no `tmux kill-window`, no closing panes.
- **Shell safety (v1.0.1+):** `--claude` team names, echo text, and remote `cd` targets are passed through `printf %q` (no injection into `bash -lc`). **`--remote-path` / computed `RHOST`** must match `^[~/a-zA-Z0-9._/+-]+$` or the script exits. **`--cursor-qcs1`** must be numeric (interactive prompts too). **`--help`** uses a built-in usage block (no fragile `sed` from markdown).
- **Live feed** (best-effort): append to `~/auset-brain/Swarms/live-feed.md`:
  - `OPEN TABS | <session>:spawned=N;layout=tabs|panes | by Mo`

## Composability

| Command | Role |
|---------|------|
| **`/open-qcs1`** | Single SSH tab to QCS1 with named path — use for one-off; **`--cursor-qcs1 N`** is the multi-tab variant here |
| **`/swarm`**, **`swarm-manage`** | Standard swarm / farm layouts — **`/open-tabs`** is ad-hoc, does **not** replace `decision-swarm-tmux-layout-standard.md` (hq, heru-N, c-swarm, c-platform) |
| **`/pickup-prompt`** | After opening Cursor tabs, run prompts or paste instructions |

## Related

- `decision-swarm-tmux-layout-standard.md` — four-tab baseline
- `.claude/commands/open-qcs1.md` — single QCS1 window
- `.claude/scripts/pickup-dispatch.sh` — keychain unlock pattern for Cursor on QCS1

## Command metadata

```yaml
name: open-tabs
version: 1.0.1
owner: Ossie Davis (commands)
changelog:
  - 1.0.1: Security — printf %q for all user-controlled bash -lc fragments; validate remote path charset; numeric --cursor-qcs1; self-contained usage(); SSH via printf 'ssh %q -t bash -lc %q' …
  - 1.0.0: Initial — open-tabs.sh + tmux session detection, aliases, dry-run, 6+ confirm, live feed, .heru-skip
```
