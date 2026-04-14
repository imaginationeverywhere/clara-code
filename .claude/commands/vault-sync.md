# vault-sync — Obsidian Persistent Memory Management

**Agent:** Carter (Carter G. Woodson — Father of Black History, preserved knowledge others tried to erase)

Manage the Obsidian vault that serves as the platform's persistent second brain. Sync memory, search context, create daily notes, and ensure nothing is lost across sessions.

## Usage
```
/vault-sync                          # Sync memory/ files into Obsidian vault
/vault-sync --search "FMO booking"   # Search vault for relevant context
/vault-sync --daily                  # Create today's daily note
/vault-sync --standup                # Generate standup from recent activity
/vault-sync --context                # Inject relevant vault context into session
/vault-sync --migrate                # One-time migration from memory/ to vault
```

## Arguments
- `--search <query>` — Search the vault for context
- `--daily` — Create/update today's daily note with session summary
- `--standup` — Generate standup from recent vault activity
- `--context` — Load relevant context for current task
- `--migrate` — Migrate existing memory/ files into vault structure
- `--graph` — Show relationship graph for a topic

## What This Command Does

1. **Syncs** memory/ files into the Obsidian vault (auset-brain) structure
2. **Searches** the vault by query and returns relevant notes for context
3. **Creates/updates** daily notes with session summaries (--daily)
4. **Generates** standup from recent vault activity (--standup)
5. **Injects** relevant vault context into the current session (--context)
6. **Migrates** existing memory/ to vault (--migrate, one-time or incremental)

## Why This Exists
Claude's memory is session-based. Compaction erases context. Amen Ra has to repeat himself. Carter fixes this by maintaining a structured Obsidian vault that persists on disk — immune to compaction, searchable, connected.

## Vault Structure
```
auset-brain/
├── Daily/          # Session logs, daily notes (e.g. 2026-03-17.md)
├── Projects/       # Per-Heru context, products, references
├── Agents/         # One note per named agent
├── Decisions/      # Architectural decisions + rationale
├── Feedback/       # Corrections from Amen Ra (NEVER lose these)
├── People/         # Team, clients, stakeholders, credentials
├── Canvas/         # Visual relationship maps (JSON Canvas)
├── Templates/      # Note templates (Daily Note, Feedback, Project, Decision, Person, Agent)
├── MOC.md          # Map of Content — master index (read first)
└── .obsidian/      # core-plugins.json, daily-notes.json
```

## Working Instructions

### Sync FROM memory/ TO vault (migration or incremental)
1. Memory path: `~/.claude/projects/-Volumes-X10-Pro-Native-Projects-AI-quik-nation-ai-boilerplate/memory/`
2. Vault path: `auset-brain/` (project root).
3. Categorize by filename prefix: `feedback-*` → Feedback/, `project-*` → Projects/, `user-*` → People/, `reference-*` → Decisions/ or Projects/, `sprint-*` → Projects/, `*-naming*` / `*-architecture*` → Decisions/.
4. For each file: add YAML frontmatter (title, type, created, migrated, tags), add `[[wikilinks]]` to related notes, write to the correct vault folder. Do not delete originals in memory/.

### Sync FROM vault TO memory/ (backward compat during transition)
- Optional. If a process expects memory/ files: copy from vault back to memory/ (e.g. session-checkpoint from Daily/ to memory/session-checkpoint.md). Prefer vault as source of truth.

### Create daily note from current session
1. Read `memory/session-checkpoint.md` (or latest session state).
2. Create or update `auset-brain/Daily/YYYY-MM-DD.md` with: Session summary, Decisions made, Tasks completed, Blockers, Next session, Links to [[MOC]] and relevant notes.
3. Use template `Templates/Daily Note.md` (date, tags, sections).

### Search vault by query
- From project root: `grep -r "query" auset-brain --include="*.md" -l` or use ripgrep: `rg "query" auset-brain`.
- When Obsidian app is open with vault focused: `obsidian vault="auset-brain" search query="query"` (requires Obsidian desktop + CLI).

### Vault path for skills
- Absolute path: `/Volumes/X10-Pro/Native-Projects/AI/quik-nation-ai-boilerplate/auset-brain`
- kepano-obsidian skills: `.claude/skills/kepano-obsidian/`; boilerplate obsidian skills: `.claude/skills/obsidian/`. Vault works as plain markdown without Obsidian app.

## Related Commands
- `/session-start` — Loads vault context at session begin
- `/session-end` — Writes session summary to vault
- `/gran --remember` — Granville checks vault before responding
