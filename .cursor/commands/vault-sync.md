# /vault-sync — Sync Memory to Auset Brain Vault

**Powered by:** Carter (Carter G. Woodson) — Context Documenter

Bidirectional sync between Claude's `memory/` files and the Obsidian `auset-brain/` vault.

## Usage
```
/vault-sync                                    # Full bidirectional sync
/vault-sync --to-vault                         # Memory → Vault (one-way)
/vault-sync --from-vault                       # Vault → Memory (one-way)
/vault-sync --daily                            # Create/update today's daily note
/vault-sync --status                           # Show sync status
```

## Arguments
- `--to-vault` — Sync new/changed memory files into the Obsidian vault
- `--from-vault` — Sync vault changes back to memory files
- `--daily` — Create or update today's daily note with session activity
- `--status` — Show what's in sync and what's not
- `--agents` — Sync agent registry to vault `Agents/` directory
- `--full` — Full rebuild of the vault from memory (destructive for vault)

## What It Does

### Memory → Vault (--to-vault)
1. Scan `memory/` for files newer than their vault counterparts
2. Convert frontmatter to Obsidian format (add `aliases`, `tags`)
3. Convert cross-references to `[[wikilinks]]`
4. Categorize into vault directories:
   - `type: user` → `People/`
   - `type: feedback` → `Feedback/`
   - `type: project` → `Projects/`
   - `type: reference` → `Projects/`
5. Update `MOC.md` index

### Vault → Memory (--from-vault)
1. Scan vault for notes not in `memory/`
2. Convert wikilinks back to plain markdown
3. Write to `memory/` with proper frontmatter
4. Update `MEMORY.md` index

### Daily Note (--daily)
1. Create `Daily/YYYY-MM-DD.md` if it doesn't exist
2. Log: priorities, completed items, decisions, feedback received
3. Link to relevant vault notes via wikilinks

## Vault Structure
```
auset-brain/
├── Daily/       — Session logs (one per day)
├── Projects/    — Products, Herus, sprints, references
├── Decisions/   — Architecture, protocols, infrastructure
├── Feedback/    — Amen Ra corrections (NEVER lose these)
├── People/      — Team, clients, credentials
├── Agents/      — Named agent profiles with wikilinks
├── Canvas/      — Visual relationship maps (JSON Canvas)
├── Templates/   — Note templates
└── MOC.md       — Map of Content (master index)
```

## Session Workflow
```
Session start:  Read auset-brain/MOC.md for context
During session: Write feedback/decisions IMMEDIATELY to vault
Session end:    /vault-sync --daily (log the day's work)
```

## Related Commands
- `/carter` — Talk to Carter (context documentation agent)
- `/clara-research` — Auto-research loop that writes findings to vault
