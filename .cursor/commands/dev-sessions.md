# /dev-sessions — Track Developer Sessions

**Founders Only.** View what your developers are working on, how long they're spending, and what they've produced.

## Usage
```
/dev-sessions                                  # Show all developer activity
/dev-sessions --dev amos                       # Show Amos's recent sessions
/dev-sessions --dev marvin                     # Show Marvin's recent sessions
/dev-sessions --dev ibrahim                    # Show Ibrahim's recent sessions
/dev-sessions --today                          # Today's activity across all devs
/dev-sessions --week                           # This week's summary
/dev-sessions --report                         # Generate a developer activity report
```

## Arguments
- `--dev <name>` — Filter to a specific developer
- `--today` — Today's sessions only
- `--week` — This week's sessions
- `--report` — Generate formatted activity report
- `--commits` — Show git commit activity per dev
- `--memory` — Show what's in each dev's memory space

## How It Works

Each developer's session data is stored in the Auset Brain vault:
```
~/auset-brain/developers/
├── amos/
│   ├── sessions/          ← Session logs (date, project, duration, work done)
│   └── memory/            ← Dev's personal memory (what they've learned, decisions)
├── marvin/
│   ├── sessions/
│   └── memory/
└── ibrahim/
    ├── sessions/
    └── memory/
```

### Session Tracking (Automatic)
When a developer works in any Heru project with the Auset Platform:
1. **Session start:** Log developer identity (git config), project, timestamp
2. **During session:** Track commands used, files changed, commits made
3. **Session end:** Write session summary to `~/auset-brain/developers/<name>/sessions/`

### Developer Memory (Separate from Founders)
- Developers get their OWN memory space — they don't see yours
- Their corrections, preferences, and learned patterns stored in their memory/
- Founders can read all developer memory (you own the platform)

## Access Rules

| Who | Can Read Own Sessions | Can Read Other Dev Sessions | Can Read Founders' Vault |
|-----|----------------------|---------------------------|------------------------|
| **Amen Ra** | YES | YES (all devs) | YES |
| **Quik** | YES | YES (all devs) | YES |
| Amos | YES | NO | NO |
| Marvin | YES | NO | NO |
| Ibrahim | YES | NO | NO |

## Related Commands
- `/brain-sync` — Sync vault to all channels
- `/vault-sync` — Sync memory to vault
