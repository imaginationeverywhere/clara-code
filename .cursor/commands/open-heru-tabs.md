# /open-heru-tabs — Open LOCAL Claude Code Team Sessions

Opens **local** Claude Code sessions for one or more teams in the `swarm` tmux session on Mo's MacBook. Each team gets a pane that `cd`s into its LOCAL project directory under `/Volumes/X10-Pro/Native-Projects/clients/<project>` (or equivalent) and launches `claude`.

**Architecture (locked 2026-04-19, see `feedback-open-heru-tabs-vs-open-qcs1`):**
- **`/open-heru-tabs` → LOCAL Claude Code sessions.** The team (Mo + agents) writes prompts here, on this Mac. Zero SSH. Zero QCS1 interaction.
- **`/open-qcs1` → REMOTE QCS1 tmux windows** for Cursor agents to EXECUTE the prompts written locally. Separate command, separate layer.

**Do NOT:**
- SSH into QCS1 from panes opened by this command
- Attach local panes to QCS1's `heru-2` tmux session
- Run `claude` on QCS1 as part of this command

These are the exact mistakes the memory corrects. If a future version of this doc re-describes SSH behavior, the memory supersedes and this doc must be fixed.

## Usage

```
/open-heru-tabs ST WCR                       # 2 teams → heru-1 with left|right split
/open-heru-tabs ST WCR QCR FMO               # 4 teams → auto-packs into heru-1 (or heru-1 + heru-2 window)
/open-heru-tabs QN                           # 1 team → single pane
/open-heru-tabs --list                       # show all heru-N windows locally + all heru-2 windows on QCS1
/open-heru-tabs --close ST                   # close the ST window on QCS1 and drop its local pane
/open-heru-tabs --window heru-3 QCarry TRK   # open into a specific local window name
/open-heru-tabs --no-claude ST WCR           # open tabs but don't auto-start claude
```

## Arguments

| Flag / Arg | Description |
|------------|-------------|
| `<TEAM>...` | One or more team codes (see mapping table below). Positional, space-separated. |
| `--window <name>` | Local swarm window to create/reuse. Defaults to `heru-1`. If pane count would exceed 4, overflow goes to `heru-2`, `heru-3`, ... |
| `--list` | List current heru-N windows locally and heru-2 windows on QCS1, then exit. |
| `--close <TEAM>` | Kill the team's window on QCS1 and its local pane. |
| `--no-claude` | Don't auto-start `claude` in QCS1 windows. Leaves bare shell at project dir. |
| `--rename` | When exactly 1 team is passed, rename the local window to the team name instead of `heru-N`. |

## Team → Project Mapping (LOCAL paths on Mo's Mac)

| Code | Project | Local Path |
|------|---------|------------|
| `ST` | seeking-talent | `/Volumes/X10-Pro/Native-Projects/clients/seeking-talent` |
| `WCR` | world-cup-ready | `/Volumes/X10-Pro/Native-Projects/clients/world-cup-ready` |
| `QCR` | quikcarrental | `/Volumes/X10-Pro/Native-Projects/Quik-Nation/quikcarrental` |
| `FMO` | fmo | `/Volumes/X10-Pro/Native-Projects/clients/fmo` |
| `QN` | quiknation | `/Volumes/X10-Pro/Native-Projects/Quik-Nation/quiknation` |
| `QCarry` | quikcarry | `/Volumes/X10-Pro/Native-Projects/Quik-Nation/quikcarry` |
| `TRK` | trackit | `/Volumes/X10-Pro/Native-Projects/clients/trackit` |
| `TRK_POC` | trackit-poc | `/Volumes/X10-Pro/Native-Projects/clients/trackit-poc` (same team roster as TRK) |
| `KLS` | kingluxuryservices | `/Volumes/X10-Pro/Native-Projects/clients/kls` |
| `S962` | site962 | `/Volumes/X10-Pro/Native-Projects/Quik-Nation/site962` |
| `CA` | claraagents | `/Volumes/X10-Pro/Native-Projects/AI/claraagents` |
| `CC` | clara-code | `/Volumes/X10-Pro/Native-Projects/AI/clara-code` |
| `PKGS` | auset-packages | `/Volumes/X10-Pro/Native-Projects/AI/auset-packages` |
| `BP` | quik-nation-ai-boilerplate | `/Volumes/X10-Pro/Native-Projects/AI/quik-nation-ai-boilerplate` |

Codes are **case-insensitive** (`st`, `ST`, `St` all map to ST).

## Execution

### Step 1: Parse arguments

```bash
TEAMS=()
LOCAL_WINDOW="heru-1"
AUTO_CLAUDE=true
RENAME=false
LIST=false
CLOSE_TEAM=""

while [ $# -gt 0 ]; do
  case "$1" in
    --list) LIST=true; shift ;;
    --close) CLOSE_TEAM="$2"; shift 2 ;;
    --window) LOCAL_WINDOW="$2"; shift 2 ;;
    --no-claude) AUTO_CLAUDE=false; shift ;;
    --rename) RENAME=true; shift ;;
    -*)
      echo "Unknown flag: $1" >&2; exit 1 ;;
    *)
      TEAMS+=("$(echo "$1" | tr '[:lower:]' '[:upper:]')"); shift ;;
  esac
done
```

### Step 2: Validate swarm session exists

```bash
tmux has-session -t swarm 2>/dev/null || {
  echo "ERROR: No local 'swarm' tmux session found."
  echo "  Run: tmux new-session -d -s swarm"
  exit 1
}
```

### Step 3: Team → path resolver

```bash
resolve_path() {
  case "$1" in
    ST)     echo "~/projects/seeking-talent" ;;
    WCR)    echo "~/projects/world-cup-ready" ;;
    QCR)    echo "~/projects/quikcarrental" ;;
    FMO)    echo "~/projects/fmo" ;;
    QN)     echo "~/projects/quiknation" ;;
    QCARRY) echo "~/projects/quikcarry" ;;
    TRK)    echo "~/projects/trackit" ;;
    TRK_POC|TRKPOC|TRK-POC) echo "~/projects/trackit-poc" ;;
    KLS)    echo "~/projects/kingluxuryservices-v2" ;;
    S962)   echo "~/projects/site962" ;;
    CA)     echo "~/projects/claraagents" ;;
    CC)     echo "~/projects/clara-code" ;;
    PKGS)   echo "~/projects/quik-nation-packages" ;;
    BP)     echo "~/projects/quik-nation-ai-boilerplate" ;;
    *) echo "" ;;
  esac
}
```

### Step 4: --list mode

```bash
if [ "$LIST" = true ]; then
  echo "=== Local swarm windows ==="
  tmux list-windows -t swarm | grep -E 'heru-|^[0-9]+: (ST|WCR|QCR|FMO|QN|QCarry|TRK|KLS|S962|CA|CC|PKGS|BP)' || echo "  (none)"
  echo ""
  echo "=== QCS1 heru-2 windows ==="
  ssh quik-cloud "tmux list-windows -t heru-2 2>/dev/null" || echo "  heru-2 session not running on QCS1"
  exit 0
fi
```

### Step 5: --close mode

```bash
if [ -n "$CLOSE_TEAM" ]; then
  CLOSE_TEAM=$(echo "$CLOSE_TEAM" | tr '[:lower:]' '[:upper:]')
  # Kill QCS1 window
  ssh quik-cloud "tmux kill-window -t heru-2:$CLOSE_TEAM 2>/dev/null" && \
    echo "✓ Closed QCS1 window: heru-2:$CLOSE_TEAM" || \
    echo "  (QCS1 window heru-2:$CLOSE_TEAM not found)"
  # Find and kill any local pane whose title matches
  tmux list-panes -s -t swarm -F '#I.#P #T' | grep "QCS1: $CLOSE_TEAM" | while read tgt _; do
    tmux kill-pane -t "swarm:$tgt" && echo "✓ Closed local pane: swarm:$tgt"
  done
  exit 0
fi
```

### Step 6: Validate teams + ensure QCS1 heru-2 session exists

```bash
if [ ${#TEAMS[@]} -eq 0 ]; then
  echo "ERROR: At least one team code required. Usage: /open-heru-tabs ST WCR"
  exit 1
fi

for T in "${TEAMS[@]}"; do
  P=$(resolve_path "$T")
  [ -z "$P" ] && { echo "ERROR: Unknown team code '$T'. See mapping table in command doc."; exit 1; }
done

# Ensure heru-2 session exists on QCS1
ssh quik-cloud "tmux has-session -t heru-2 2>/dev/null || tmux new-session -d -s heru-2 -n bootstrap"
```

### Step 7: For each team — ensure QCS1 window + start claude (idempotent)

```bash
for T in "${TEAMS[@]}"; do
  QCS1_PATH=$(resolve_path "$T")

  # Create QCS1 tmux window if missing
  EXISTS=$(ssh quik-cloud "tmux list-windows -t heru-2 -F '#W' 2>/dev/null | grep -Fx '$T' || true")
  if [ -z "$EXISTS" ]; then
    echo "→ Creating QCS1 window: heru-2:$T at $QCS1_PATH"
    ssh quik-cloud "tmux new-window -t heru-2 -n '$T' -c '$QCS1_PATH'"
    NEW_WINDOW=true
  else
    echo "✓ QCS1 window heru-2:$T already exists"
    NEW_WINDOW=false
  fi

  # Start claude if not already running (and --no-claude not set)
  if [ "$AUTO_CLAUDE" = true ]; then
    RUNNING=$(ssh quik-cloud "tmux list-panes -t heru-2:$T -F '#{pane_current_command}' 2>/dev/null | grep -E '^(claude|node)$' || true")
    if [ -z "$RUNNING" ]; then
      echo "  → Starting claude in heru-2:$T"
      ssh quik-cloud "tmux send-keys -t heru-2:$T 'cd $QCS1_PATH && claude' Enter"
    else
      echo "  ✓ claude already running in heru-2:$T"
    fi
  fi
done
```

### Step 8: Create/reuse local window + layout panes

```bash
N=${#TEAMS[@]}

# Single team + --rename → use team name as window
if [ "$N" -eq 1 ] && [ "$RENAME" = true ]; then
  LOCAL_WINDOW="${TEAMS[0]}"
fi

# Create local window if missing
if ! tmux list-windows -t swarm -F '#W' | grep -Fxq "$LOCAL_WINDOW"; then
  echo "→ Creating local window: swarm:$LOCAL_WINDOW"
  tmux new-window -t swarm -n "$LOCAL_WINDOW"
  # Close auto-created first pane? No — reuse it for team 1.
  FIRST_PANE_FRESH=true
else
  echo "✓ Local window swarm:$LOCAL_WINDOW exists — adding panes"
  FIRST_PANE_FRESH=false
fi

# Attach each team to a pane
for i in "${!TEAMS[@]}"; do
  T="${TEAMS[$i]}"

  if [ "$i" -eq 0 ] && [ "$FIRST_PANE_FRESH" = true ]; then
    # Reuse the fresh pane that new-window created
    TARGET="swarm:$LOCAL_WINDOW.0"
  else
    # Split. Alternate horizontal/vertical for a clean grid:
    #   pane 2: horizontal (side-by-side)
    #   pane 3: vertical split of pane 0
    #   pane 4: vertical split of pane 1
    case "$i" in
      1) tmux split-window -h -t "swarm:$LOCAL_WINDOW" ;;
      2) tmux split-window -v -t "swarm:$LOCAL_WINDOW.0" ;;
      3) tmux split-window -v -t "swarm:$LOCAL_WINDOW.1" ;;
      *) tmux split-window -h -t "swarm:$LOCAL_WINDOW" ;;
    esac
    tmux select-layout -t "swarm:$LOCAL_WINDOW" tiled
    TARGET=$(tmux display-message -p -t "swarm:$LOCAL_WINDOW" '#{window_id}.#{pane_id}')
  fi

  # Label the pane
  tmux select-pane -t "$TARGET" -T "QCS1: $T"

  # SSH into QCS1 and attach to the team's window inside heru-2
  tmux send-keys -t "$TARGET" \
    "ssh quik-cloud -t 'tmux attach -t heru-2 \\; select-window -t $T'" \
    Enter
done

# Even out the layout
tmux select-layout -t "swarm:$LOCAL_WINDOW" tiled
```

### Step 9: Confirm

```bash
echo ""
echo "================================================"
echo "✓ Opened ${#TEAMS[@]} team(s) in swarm:$LOCAL_WINDOW"
echo "  Teams: ${TEAMS[*]}"
echo "  Local window: swarm:$LOCAL_WINDOW ($N pane$([ $N -ne 1 ] && echo s))"
echo "  QCS1 session: heru-2 (windows: ${TEAMS[*]})"
[ "$AUTO_CLAUDE" = true ] && echo "  Claude: auto-started" || echo "  Claude: NOT started (--no-claude)"
echo "================================================"
echo ""
echo "Switch to window: tmux select-window -t swarm:$LOCAL_WINDOW"
echo "Detach from QCS1: Ctrl-b d (returns to local pane w/ shell)"
echo "Kill a team:      /open-heru-tabs --close <TEAM>"
```

## Layout Examples

**2 teams (`ST WCR`):**
```
┌──────────────┬──────────────┐
│   QCS1: ST   │  QCS1: WCR   │
│  (claude)    │   (claude)   │
└──────────────┴──────────────┘
         swarm:heru-1
```

**4 teams (`ST WCR QCR FMO`):**
```
┌──────────────┬──────────────┐
│   QCS1: ST   │  QCS1: WCR   │
├──────────────┼──────────────┤
│  QCS1: QCR   │  QCS1: FMO   │
└──────────────┴──────────────┘
         swarm:heru-1 (tiled)
```

**5+ teams:** Use `--window heru-2` for the overflow:
```
/open-heru-tabs ST WCR QCR FMO                  # fills heru-1
/open-heru-tabs --window heru-2 QN QCarry TRK   # fills heru-2
```

## Idempotency Guarantees

- **Re-running with same args:** Reuses existing QCS1 windows, reuses existing local window, does NOT start a second `claude` if one is already running.
- **Re-running with a subset:** Never closes unrelated windows. Only `--close` removes things.
- **Re-running with additions:** New teams get appended as new panes in the target local window.

## Prerequisites

- Local: `tmux`, `swarm` session already running (`tmux new-session -d -s swarm`)
- QCS1: reachable via `ssh quik-cloud`, `tmux` installed, `claude` on PATH
- QCS1: projects cloned at `~/projects/<project-name>`
- Keychain unlocked locally (for SSH without password prompt)

## Related Commands
- `/open-qcs1` — Open a single named tab with a custom path (lower-level)
- `/dispatch-cursor` — Dispatch a Cursor agent prompt to an existing tab
- `/swarm` — Full swarm control (manage, plan, status)
- `/hq` — Open the HQ coordination window
- `/session-start` — Initialize the local swarm session from scratch

## Notes

- QCS1 = the ONLY permanent dev machine (Mac M4 Pro, `ayoungboy@100.113.53.80` via Tailscale alias `quik-cloud`)
- Max 6 concurrent Cursor agents on QCS1 (Ultra plan) — but Claude Code sessions are not Cursor agents
- Tab names = team codes (ST, WCR, ...) on QCS1; local window name is `heru-N` unless `--rename` is passed with exactly one team
- To add a new team to the mapping, edit the `resolve_path` function in Step 3 and the table at the top
