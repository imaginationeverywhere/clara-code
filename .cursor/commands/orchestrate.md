# orchestrate - Claude Plans, Cursor Builds, You Ship

Full orchestration cycle: read backlog, plan work, dispatch to Cursor Agent CLI, review results, fix issues, push. Maximum output, minimum Max plan usage.

**Agent:** `cursor-orchestrator`
**Skill:** `cursor-orchestration`

## Usage
```
/orchestrate --epic 16                    # Work through Epic 16 stories
/orchestrate --story 16.1 --heru quikcarrental  # Specific story, specific Heru
/orchestrate --backlog                    # Pick next unfinished stories automatically
/orchestrate --task "Add auth guards to all resolvers" --all-herus
/orchestrate --review                     # Review results from last dispatch
/orchestrate --fix                        # Re-dispatch fixes from last review
/orchestrate --push                       # Push all completed work to remotes
```

## Arguments
- `--epic <N>` — Work through stories in a specific epic
- `--story <N.M>` — Target a specific story
- `--backlog` — Auto-select next unfinished stories from micro plans
- `--task <prompt>` — Custom task (not from backlog)
- `--heru <name>` — Target specific Heru (fuzzy matched)
- `--herus <n1,n2,...>` — Target multiple Herus
- `--all-herus` — Dispatch to all Herus (requires confirmation)
- `--model <model>` — Cursor model (default: auto)
- `--parallel` — Run dispatches simultaneously (default for multi-Heru)
- `--sequential` — Run one at a time
- `--review` — Review results from previous dispatch
- `--fix` — Re-dispatch fixes based on review
- `--push` — Push completed work to remotes
- `--dry-run` — Show plan without executing

## The Orchestration Cycle

### Phase 1: PLAN (1 Claude message)

Read the micro plans and determine what to dispatch:

```
Reading .claude/plans/micro/*.md...

Epic 16: Auset Platform Activation
  Story 16.1: Core Auth Guards ........... NOT STARTED → dispatch to Cursor
  Story 16.2: Payment Router ............. NOT STARTED → dispatch to Cursor
  Story 16.3: Feature Activation CLI ..... PARTIAL → dispatch to Cursor
  Story 16.4: Multi-tenant Isolation ..... NOT STARTED → dispatch to Cursor

Recommended dispatch plan:
  1. quikcarrental → Story 16.1 (auth guards)     [parallel]
  2. site962       → Story 16.1 (auth guards)     [parallel]
  3. quikcarrental → Story 16.2 (payment router)  [after 16.1]
  4. quikvibes     → Story 16.1 (auth guards)     [parallel]

Approve? [Y/n]
```

### Phase 2: DISPATCH (0 Claude messages)

Launch Cursor agents in background:

```bash
# Each dispatch is a background bash task — costs $0 Max messages
cursor agent --print --trust --force \
  --workspace /path/to/quikcarrental \
  "$ENHANCED_PROMPT" > /tmp/dispatch-quikcarrental-16.1.log 2>&1 &

cursor agent --print --trust --force \
  --workspace /path/to/site962 \
  "$ENHANCED_PROMPT" > /tmp/dispatch-site962-16.1.log 2>&1 &

cursor agent --print --trust --force \
  --workspace /path/to/quikvibes \
  "$ENHANCED_PROMPT" > /tmp/dispatch-quikvibes-16.1.log 2>&1 &
```

Wait for all to complete. Report progress.

### Phase 3: REVIEW (1 Claude message)

Collect results and review:

```
DISPATCH RESULTS
════════════════

  quikcarrental (Story 16.1) .... DONE
    Files: 8 modified, 3 created
    Changes: auth middleware, resolver guards, tests
    Review: PASS — follows patterns correctly

  site962 (Story 16.1) .......... DONE
    Files: 6 modified, 2 created
    Changes: auth middleware, resolver guards
    Review: NEEDS FIX — missing tenant_id check in 2 resolvers

  quikvibes (Story 16.1) ........ DONE
    Files: 7 modified, 2 created
    Changes: auth middleware, resolver guards
    Review: PASS

  Summary: 2 passed, 1 needs fixes
```

### Phase 4: FIX (0 Claude messages)

Re-dispatch fixes to Cursor:

```bash
cursor agent --print --trust --force \
  --workspace /path/to/site962 \
  "Fix: Add tenant_id check to resolvers in src/resolvers/events.ts and src/resolvers/venues.ts" \
  > /tmp/fix-site962-16.1.log 2>&1 &
```

### Phase 5: PUSH (1 Claude message)

After all reviews pass:

```bash
for PROJECT in quikcarrental site962 quikvibes; do
  cd "/path/to/$PROJECT"
  git add -A
  git commit -m "feat(auth): add auth guards to all resolvers (Story 16.1)"
  git push origin $(git branch --show-current)
done
```

**Total cost: 3 Claude messages for 3 projects.**

## Backlog Integration

The `--backlog` flag reads micro plans and picks work automatically:

1. Scan `.claude/plans/micro/*.md` for all stories
2. Check story status (NOT STARTED, PARTIAL, DONE)
3. Check dependencies (blocked stories are skipped)
4. Prioritize by epic order and dependency chain
5. Present top 3-5 dispatchable stories
6. User approves which to run

## Smart Model Selection

| Task Type | Recommended Model | Why |
|-----------|------------------|-----|
| CRUD scaffolding | `gpt-5.3-codex` | Fast, good at boilerplate |
| Complex logic | `sonnet-4` | Better reasoning |
| Quick fixes | `auto` | Let Cursor decide |
| Code analysis | `--mode plan` | Read-only, any model |

## Safety

- `--all-herus` ALWAYS requires explicit user confirmation
- Changes stay LOCAL until `--push` is explicitly called
- Every dispatch captures full output logs
- Claude Code reviews before anything gets pushed
- No destructive operations dispatched to Cursor
- Production branches require extra confirmation

## Related
- `/dispatch-cursor` — Single dispatch (this command wraps it in a full cycle)
- `/sync-herus --push` — Push platform files, not code
- `/gap-analysis` — Check what's done vs. planned
- `/progress` — Quick dashboard of epic status
- `/plan-design` — Create plans for Cursor to execute
