# Context efficiency rules (non-negotiable)

These rules reduce Claude Code / Cursor token waste across agents and commands. Apply on every turn.

## Rules

1. **Read specific lines:** Never read an entire file when a range suffices. Use `Read` with `offset` + `limit`.

2. **Grep before read:** Use search to locate symbols or sections, then read only the matching region.

3. **Summarize tool results:** When a tool returns more than ~100 lines, extract only what is needed for the next step. Do not keep the full dump in working memory.

4. **Checkpoint trimming:** `memory/session-checkpoint.md` stays under **3KB**. Older narrative moves to `memory/session-archive/session-{N}.md`.

5. **Glob precision:** Prefer `path/` + extension patterns over `**/*`. Narrow scope first.

6. **MEMORY.md max 200 lines:** Keep `memory/MEMORY.md` as a short index; move detail to topic files.

## Estimated impact

Auditing wide reads, bloated checkpoints, and redundant globs typically saves **25–40%** of context tokens on long sessions (varies by workflow).
