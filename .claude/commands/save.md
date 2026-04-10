# /save — Explicitly Save Data to the Vault

**Save something specific to the Auset Brain vault RIGHT NOW.** Don't wait for session-end. Don't rely on checkpoints. When Mo says save, it goes to the vault immediately.

## Usage
```
/save                              # Save the last important thing discussed
/save "Maurice deal is $80/mo"     # Save a specific fact
/save decision                     # Save the last decision made
/save cost                         # Save cost-related data just discussed
```

## What This Command Does

1. Take what was just discussed (or the argument provided)
2. Determine the right memory type (decision, feedback, project, reference, user)
3. Write it to a memory file in `memory/` with proper frontmatter
4. Update `memory/MEMORY.md` index
5. Push to the Auset Brain vault (`~/auset-brain/`)
6. Confirm: "Saved to vault: [filename]"

## Rules
- Save IMMEDIATELY — not at session-end
- Use the EXACT numbers, names, and details from the conversation
- Never paraphrase or round numbers
- If Mo says "save that" — save the last significant statement or decision
- File naming: `<type>-<topic>.md` (e.g., `decision-maurice-agent-cost.md`)
