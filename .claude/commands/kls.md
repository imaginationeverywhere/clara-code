# /kls — Send to Kings Luxury Services session

**Team:** Kings Luxury Services Team
**Alias:** `kls`
**Project:** `/Volumes/X10-Pro/Native-Projects/clients/kingluxuryservicesllc`
**Client:** King Luxury Services LLC — luxury transportation, concierge, private jets, airport transfers, weddings, corporate events
**Repo:** `imaginationeverywhere/kingluxuryservicesllc`

## Direct Communication (tmux send-keys)

If arguments are provided, inject the message directly into the KLS tmux pane:

```bash
PANE_ID=$(tmux list-panes -a -F '#{pane_id} #{pane_title}' | grep -i 'kls' | grep -v 'CURSOR' | head -1 | awk '{print $1}')
if [ -n "$PANE_ID" ]; then
  tmux send-keys -t "$PANE_ID" "$ARGUMENTS" Enter
  echo "Sent to Kings Luxury Services ($PANE_ID): $ARGUMENTS"
else
  echo "ERROR: KLS pane not found. Is the swarm running?"
  tmux list-panes -a -F '#{pane_id} #{pane_title}' | head -20
fi
```

## Usage
```
/kls                    # Send message to Kings Luxury session
/kls "Start your agenda"
```

## What This Does
Sends a message to the Kings Luxury Services team session via tmux send-keys. The team handles all development for the KLS luxury transportation platform.

## Team Roster
- **PO:** Virgil (Virgil Abloh) — luxury brand + design vision
- **Tech Lead:** Herman (Herman J. Russell) — business infrastructure
- **Code Reviewer:** Constance (Constance Baker Motley) — quality + compliance

## Related Commands
- `/dispatch-team kls "message"` — Send directive from HQ
- `/virgil` — Talk to Virgil (PO)
- `/herman` — Talk to Herman (Tech Lead)
- `/constance` — Talk to Constance (Code Reviewer)
