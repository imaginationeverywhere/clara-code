# Dispatch Team — Send a directive to any team session

**Version:** 1.0.0
**Category:** Swarm Coordination

## Purpose

Wake an idle team session and send them a directive directly from HQ. Uses the session registry to find the team by alias, discovers their TTY dynamically, and injects the message via AppleScript.

## Usage

```
/dispatch-team <alias> <message>
```

## Team Aliases

| Alias | Team | Registry Match |
|-------|------|----------------|
| `pkgs` | Auset Packages Team | "Packages" |
| `wcr` | WCR Team | "WCR" |
| `qn` | QuikNation Team | "QuikNation" or "Quik Nation" |
| `st` | Seeking Talent Team | "Seeking" |
| `s962` | Site 962 Team | "962" |
| `qcr` | QCR Team | "QCR" or "QuikCar" |
| `qcarry` | QuikCarry Team | "QuikCarry" or "Carry" |
| `fmo` | FMO Team | "FMO" |
| `devops` | DevOps Team | "DevOps" |
| `hq` | Headquarters | "Headquarters" |
| `all` | ALL teams (skips HQ) | wake-all |

## Examples

```
/dispatch-team pkgs Build the project-dashboard package
/dispatch-team wcr Push to develop and verify Amplify deploy
/dispatch-team all Check the live feed for Sprint 2 Day 2 directives
/dispatch-team qn Execute the Clara AI experience prototype prompt
```

## How It Works

1. Resolve alias to team search term
2. Run `session-registry.sh discover` to scan running Claude Code processes
3. Find the matching session by name (partial match, case-insensitive)
4. Send the message via AppleScript `do script` to the target terminal tab
5. Log the dispatch to the live feed

## Implementation

When this command is invoked, execute:

```bash
# Map alias to search term
case "$ALIAS" in
    pkgs|packages)  SEARCH="Packages" ;;
    wcr)            SEARCH="WCR" ;;
    qn|quiknation)  SEARCH="QuikNation" ;;
    st|seeking)     SEARCH="Seeking" ;;
    s962|site962)   SEARCH="962" ;;
    qcr)            SEARCH="QCR" ;;
    qcarry)         SEARCH="Carry" ;;
    fmo)            SEARCH="FMO" ;;
    devops)         SEARCH="DevOps" ;;
    all)            .claude/scripts/session-registry.sh wake-all "$MESSAGE"; exit ;;
    *)              SEARCH="$ALIAS" ;;
esac

# Wake the session
.claude/scripts/session-registry.sh wake "$SEARCH" "$MESSAGE"

# Log to live feed
echo "$(date '+%H:%M:%S') | quik-nation-ai-boilerplate | DISPATCH | HQ → ${ALIAS} | ${MESSAGE}" >> ~/auset-brain/Swarms/live-feed.md
```

## Related Commands
- `/dispatch-agent` — Send a named agent to a task
- `/swarm` — Kick off the agent swarm
