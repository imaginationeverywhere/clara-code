# /qc1 — Dispatch to QC1 (Mac M4 Pro) Claude Code

**⚡ THIS COMMAND CONSUMES QC1 CLAUDE CODE QUOTA (Haiku model)**

Explicitly routes a prompt to QC1's Claude Code (Haiku). Every invocation is deliberate —
you must type `/qc1` to trigger any Claude Code usage on that machine.

## Usage

```
/qc1 <heru> "<prompt>"
/qc1 <heru> <prompt-file-path>
```

**Examples:**
```
/qc1 WCR "implement the stadium seating selector component"
/qc1 KLS "fix the invoice PDF generation — amount is showing null"
/qc1 BP "run the full test suite and report failures"
/qc1 CC ~/prompts/clara-code-auth.md
```

## Heru Registry (QC1 paths)

| Alias | Project | QC1 Path |
|-------|---------|----------|
| `BP`  | Boilerplate (HQ) | `/Users/ayoungboy/projects/quik-nation-ai-boilerplate` |
| `WCR` | World Cup Ready | `/Users/ayoungboy/projects/world-cup-ready` |
| `QN`  | Quik Nation | `/Users/ayoungboy/projects/quiknation` |
| `QCR` | QuikCarRental | `/Users/ayoungboy/projects/quikcarrental` |
| `FMO` | FMO | `/Users/ayoungboy/projects/fmo` |
| `S962`| Site 962 | `/Users/ayoungboy/projects/site962` |
| `CC`  | Clara Code | `/Users/ayoungboy/projects/clara-code` |
| `CA`  | Clara Agents | `/Users/ayoungboy/projects/claraagents` |
| `TRK` | TrackIt | `/Users/ayoungboy/projects/trackit` |
| `QCarry` | QuikCarry | `/Users/ayoungboy/projects/quikcarry` |
| `KLS` | King Luxury Services | `/Users/ayoungboy/projects/kls` |
| `ST`  | Seeking Talent | `/Users/ayoungboy/projects/seeking-talent` |

## What Claude Must Do When This Command Is Invoked

Arguments come in as: `$ARGUMENTS`

1. **Parse arguments** — split on first whitespace to get `<heru>` and `<prompt>`

2. **Look up the QC1 path** from the registry above. If the heru alias is unrecognized, stop and ask.

3. **Display dispatch header** — make it unmistakably clear this is QC1 usage:
   ```
   ⚡ QC1 DISPATCH
   ─────────────────────────────
   Heru:    <HERU>
   Path:    <QC1_PATH>
   Model:   Haiku (claude-haiku-4-5-20251001)
   Machine: quik-cloud (Mac M4 Pro)
   ─────────────────────────────
   ```

4. **Save the prompt file on QC1 first** (NON-NEGOTIABLE — strikes-worthy if skipped):
   ```bash
   ssh quik-cloud "mkdir -p <QC1_PATH>/prompts/qc1-inbox && cat > <QC1_PATH>/prompts/qc1-inbox/<TIMESTAMP>.md" <<'PROMPT'
   <prompt content>
   PROMPT
   ```

5. **Run Claude Code headlessly on QC1**:
   ```bash
   ssh quik-cloud "cd <QC1_PATH> && claude -p '<prompt>' --dangerously-skip-permissions 2>&1"
   ```
   Stream the output back to the local session.

6. **On completion**, print:
   ```
   ✅ QC1 dispatch complete — <HERU>
   Prompt saved: <QC1_PATH>/prompts/qc1-inbox/<TIMESTAMP>.md
   ```

## Notes

- Model is locked to Haiku on QC1 via `~/.claude/settings.json` — cannot be overridden remotely
- If the prompt is a file path, read the file locally first, then send its contents
- If `quik-cloud` SSH is unreachable, fail loudly — do NOT silently fall back to running locally
- Never dispatch to multiple herus simultaneously from this command — one at a time, explicit
