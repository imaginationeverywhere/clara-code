# S2-02 — Web UI Surface Dispatch: Prompts 02-06

**Repo:** `imaginationeverywhere/clara-code`
**Machine:** QCS1 (Mac M4 Pro)
**Agent:** Motley (Frontend/CLI)
**Priority:** HIGH — these prompts build the IDE panel, CLI/TUI, and remaining web surfaces

---

## Context

Cursor implementation prompts for the Clara Code product surfaces were written and archived to
this repository. They live at `prompts/2026/April/10/` on QCS1 (the prompts were removed from
the local dev machine but remain on QCS1 at `/Users/ayoungboy/Projects/clara-code/`).

Each prompt targets a specific product surface and branch. Your job is to read each prompt
and execute it with a Cursor agent in a fresh worktree — one agent per surface, one branch
per surface.

---

## Prompts to Execute (in order)

### Prompt 02 — IDE Panel (VS Code Extension Chrome)
- **File:** `prompts/2026/April/10/02-cc-ide.md`
- **Branch:** `feat/ide-complete`
- **Surface:** The IDE-side panel within Clara Code (the VS Code fork) — voice bar integration,
  agent status panel, settings panel
- **Cursor mode:** `auto` (full autonomous execution)

### Prompt 03 — CLI / TUI (Ink Terminal Interface)
- **File:** `prompts/2026/April/10/03-cc-cli-tui.md`
- **Branch:** `feat/cli-tui-complete`
- **Surface:** `packages/tui` — the `clara` terminal command, full-screen TUI, IDE panel mode (280px)
- **Cursor mode:** `auto`

### Prompts 04-06 (in `prompts/2026/April/10/1-not-started/`)
Scan this directory and execute any remaining cc-prefixed prompts:
- **Branch naming:** use the prompt filename slug (e.g., `04-cc-sdk.md` → `feat/sdk-complete`)
- **Cursor mode:** `auto` for each

---

## Execution Instructions (Per Prompt)

For **each** prompt file:

```bash
# 1. Create worktree on the target branch
BRANCH_NAME="feat/<surface>-complete"
git worktree add /tmp/clara-code-<surface> $BRANCH_NAME 2>/dev/null || \
  git worktree add /tmp/clara-code-<surface> -b $BRANCH_NAME develop

# 2. Open the prompt file and read it fully before starting
cat prompts/2026/April/10/<prompt-file>.md

# 3. Launch Cursor agent in the worktree directory
# cursor --background-agent /tmp/clara-code-<surface> \
#   --mode auto \
#   --prompt "$(cat prompts/2026/April/10/<prompt-file>.md)"

# 4. After completion, commit and push the branch
cd /tmp/clara-code-<surface>
git add -A
git commit -m "feat(<surface>): implement <surface> surface per S2 prompt"
git push origin $BRANCH_NAME

# 5. Create a PR to develop
gh pr create \
  --repo imaginationeverywhere/clara-code \
  --base develop \
  --head $BRANCH_NAME \
  --title "feat(<surface>): <surface> complete" \
  --body "S2 surface prompt: $(basename <prompt-file>.md)\n\nAC: see prompt file."
```

---

## Constraints

- **Do NOT merge to develop** — create PRs only. Carruthers reviews before merge.
- **One branch per surface** — no combining surfaces in one commit
- **Max 4 concurrent Cursor agents on QCS1** — stagger if running all 5 prompts
- **IP protection rule:** No server-side scripts or credentials in `frontend/` or `packages/web-ui/`
  All API calls go through `packages/web-ui/src/app/api/` Next.js routes or the Express backend
- If a prompt references packages that don't exist yet (e.g., `@ie/clara-sdk`), scaffold a
  minimal stub — don't block on it

---

## After All PRs Are Opened

Report back to the live feed:
```bash
echo "$(date '+%H:%M:%S') | clara-code | PROGRESS | Clara Code Team | S2-02 DONE — PRs opened for prompts 02-06 surfaces" >> ~/auset-brain/Swarms/live-feed.md
```

---

## Acceptance Criteria

- [ ] Branch `feat/ide-complete` pushed with IDE panel implementation
- [ ] Branch `feat/cli-tui-complete` pushed with TUI/CLI implementation
- [ ] All additional `1-not-started/` cc-prompts executed on their own branches
- [ ] PRs created for each branch targeting `develop`
- [ ] No server credentials or scripts in client packages
- [ ] TypeScript compiles cleanly on each branch (`npx tsc --noEmit` in packages/web-ui)
