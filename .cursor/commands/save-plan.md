# save-plan - Save Plan to Project Directory

After exiting plan mode, this command finds the most recent plan from `~/.claude/plans/`, renames it meaningfully, and saves it to both `.claude/plans/` and `.cursor/plans/` in the project.

## Usage
```
/save-plan [plan-name]
```

## Arguments
- `plan-name` (optional) — Meaningful name for the plan (e.g., "yapit-integration", "auth-system-design"). If not provided, auto-generates from plan content.

## Execution Steps

### Step 1: Find the Latest Plan
```bash
# Find most recently modified plan in ~/.claude/plans/
ls -t ~/.claude/plans/*.md | head -1
```

### Step 2: Generate Meaningful Name
If no name provided:
- Read the plan content
- Extract the main topic/feature from the title or first heading
- Generate kebab-case name: `<topic>-<type>.md`
- Types: plan, design, architecture, migration, integration

### Step 3: Ensure Directories Exist
```bash
mkdir -p .claude/plans
mkdir -p .cursor/plans
```

### Step 4: Copy Plan to Project
```bash
cp ~/.claude/plans/<random-name>.md .claude/plans/<meaningful-name>.md
cp ~/.claude/plans/<random-name>.md .cursor/plans/<meaningful-name>.md
```

### Step 5: Confirm
Report to user:
```
Plan saved:
  .claude/plans/<meaningful-name>.md
  .cursor/plans/<meaningful-name>.md
```

## Auto-Save Behavior

**IMPORTANT FOR ALL AGENTS**: When exiting plan mode (`ExitPlanMode`), you MUST automatically run the equivalent of this command. Do not wait for the user to invoke `/save-plan` — do it proactively:

1. After `ExitPlanMode` completes, find the plan in `~/.claude/plans/`
2. Generate a meaningful name from the plan content
3. Copy to `.claude/plans/` and `.cursor/plans/`
4. Tell the user where it was saved

This behavior is enforced in the root CLAUDE.md `Plan Mode Directory Convention` section.

## Examples
```
/save-plan yapit-payment-integration
/save-plan auth-system-redesign
/save-plan site962-migration-plan
/save-plan          # auto-generates name from content
```
