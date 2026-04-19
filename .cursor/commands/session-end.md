# session-end - Close a Session and Preserve Context

Every great session deserves a proper ending. Not an abrupt stop — a deliberate close. Write down what happened. Flag what's unfinished. Set the next session up for success.

## Usage
```
/session-end
/session-end "Good session, QCR pickup flow is done"
/session-end --exit
```

## Arguments
- `<notes>` (optional) — Any final thoughts or notes to include in the checkpoint
- `--exit` — After writing the checkpoint, exit Claude Code. The session is over.

## What This Command Does

### 1. Gather Session Context
Review the conversation to identify:
- **What was done** — Features built, bugs fixed, decisions made, files changed
- **Decisions made** — Any architectural, strategic, or priority decisions
- **What's pending** — Unfinished work, blocked items, next steps
- **New facts learned** — Anything Amen Ra said that should be in memory but isn't yet

### 2. Write to Obsidian Vault (PRIMARY — Carter's system)
Create or update today's daily note in the vault:

**a) Write daily note:**
```
auset-brain/Daily/YYYY-MM-DD.md
```
Use the template at `auset-brain/Templates/Daily Note.md`. Include:
- Session summary (what was done)
- Decisions made (with `[[wikilinks]]` to Decisions/ notes)
- Pending items for next session
- Links to relevant notes

**b) Write any new Feedback/Decision/Project notes to vault:**
- Corrections from Amen Ra → `auset-brain/Feedback/feedback-<topic>.md`
- Architectural decisions → `auset-brain/Decisions/<topic>.md`
- New project facts → `auset-brain/Projects/<topic>.md`
- New people info → `auset-brain/People/<name>.md`
Each with YAML frontmatter and `[[wikilinks]]`.

**c) Update MOC.md if new notes were added:**
Add links to any new notes in the appropriate section of `auset-brain/MOC.md`.

### 2b. Write Flat Memory Checkpoint (backward compat)
Also update `memory/session-checkpoint.md` — the flat system still works as fallback:

```markdown
# Session Checkpoint — [Date]

## What Was Done
- [Concrete accomplishments]

## Decisions Made
- [Key decisions with context]

## Pending
- [ ] [Unfinished items]
- [ ] [Blocked items with reason]

## New Context
- [Anything important that came up]

## Next Session Should
- [Recommended first actions]
```

### 3. Write Any Pending Memory Files
If Amen Ra shared new facts, corrections, or feedback during the session that haven't been saved yet — write them to BOTH systems NOW:

**Vault (primary):**
- Corrections → `auset-brain/Feedback/feedback-<topic>.md`
- Project facts → `auset-brain/Projects/project-<topic>.md`
- People info → `auset-brain/People/<name>.md`
- Resources → `auset-brain/Decisions/reference-<topic>.md`

**Flat memory (fallback):**
- `memory/feedback-*.md`, `memory/project-*.md`, `memory/user-*.md`, `memory/reference-*.md`

### 4. Session Summary
Display a clean closing report:

```
SESSION END — March 15, 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ACCOMPLISHED:
  - [what got done]

DECISIONS:
  - [what was decided]

PENDING:
  - [what's left]

MEMORY UPDATED:
  - session-checkpoint.md (updated)
  - [any new memory files written]

NEXT SESSION:
  - [recommended first actions]

Session saved. Context preserved.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 5. Exit (if --exit flag)
If `--exit` was passed, after writing everything, exit Claude Code cleanly.

## What This Command Does NOT Do
- Does NOT commit code (use `/git-commit-docs` for that)
- Does NOT push to remote
- Does NOT post to Slack
- Does NOT dispatch any agents

This is PRESERVATION. Saving context so the next session doesn't start from zero.

## Why --exit Exists

Sometimes you're done for the night. You don't want to type `/session-end` and then also type `/exit`. One command, clean close:

```
/session-end --exit "Good night. QCR pickup done, start on FMO tomorrow."
```

Checkpoint written. Memory saved. Claude exits. Done.

## Why This Matters

**The self-improving loop depends on this.** If sessions end without checkpoints, the next session starts blind. Every uncheckpointed session is context permanently lost.

The AI takes notes on itself so compaction never loses critical context. This command is half of that loop. `/session-start` is the other half.

## Related Commands
- `/session-start` — Begin a session with full context recovery
- `/gran` — Talk to Granville (architecture)
- `/mary` — Talk to Mary (product/business)
- `/council` — Talk to both Granville and Mary
