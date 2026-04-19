# dispatch-cloud-agent — Dispatch Tasks to Cursor Cloud Agents

**Agent:** Bessie (Bessie Coleman — first Black woman international pilot, flew in the clouds, projected influence from the skies)

Send named agents to **Cursor Cloud Agents** — long-running tasks that run on Cursor's cloud infrastructure instead of local or EC2. Use for heavy work: full-codebase TypeScript fixes, large refactors, migrations, and tasks touching many files. Bessie dispatches, monitors status, and pulls results (commits, branches, PRs). All runs must be audit-logged.

## Usage
```
/dispatch-cloud-agent <agent> --repo <owner/repo> [--branch <branch>] "<task description>"

# Examples
/dispatch-cloud-agent rosa --repo imaginationeverywhere/fmo --branch develop "Fix all auth bypasses across the entire backend"
/dispatch-cloud-agent fela --repo imaginationeverywhere/fmo --branch develop "Fix all TypeScript errors in mobile/"
/dispatch-cloud-agent katherine --repo imaginationeverywhere/fmo "Refactor booking modal into 6 components"
/dispatch-cloud-agent toussaint --repo imaginationeverywhere/fmo --branch main "Migration: add tenant_id to all backend models"
```

## Arguments
- **`<agent>`** (required) — Named agent to run in the cloud (e.g. rosa, fela, katherine, toussaint). Bessie injects agent context from `.claude/agents/<name>.md`.
- **`--repo <owner/repo>`** (required) — GitHub repo in form `owner/repo` (e.g. `imaginationeverywhere/fmo`).
- **`--branch <branch>`** (optional) — Target branch (default: `develop` or repo default).
- **`"<task description>"`** (required) — Full task text. Be specific so the cloud agent has clear scope.

## When to Use Cloud vs Local/EC2
| Target | Command | Best for |
|--------|---------|----------|
| **Local** | `/dispatch-agent --target local` | Quick tasks, <5 min |
| **EC2** | `/dispatch-agent --target aws` or `qc1` | Focused tasks, <15 min |
| **Cloud** | `/dispatch-cloud-agent` | Heavy tasks, >15 min; >10 files; full-codebase sweeps |

Use **Bessie (this command)** when:
- Task is estimated >15 minutes
- Task touches >10 files
- Full codebase sweep (TS fix, lint fix, migration)
- EC2 instances are occupied
- You want parallel cloud agents without more EC2s

## Audit Logging (REQUIRED)

Every dispatch and completion **must** be recorded:

| Field | Description |
|-------|-------------|
| **Agent name** | e.g. rosa, fela, katherine |
| **Start time (ET)** | When the cloud agent run started (Eastern Time) |
| **End time (ET)** | When the run completed (Eastern Time) |
| **Repo** | owner/repo |
| **Branch** | Target branch |
| **Task description** | Full task text (or summary) |
| **Result** | success / fail |
| **PR URL** | If a PR was created, the URL |

**Where to log:** Append to `docs/audit/cloud-dispatch.md` in the target repo.

## Execution Steps

1. **Resolve agent** — Read `.claude/agents/<agent>.md` and include role/capabilities in context for the cloud run.
2. **Validate repo/branch** — Ensure repo exists and branch is valid (or use default).
3. **Dispatch to Cursor Cloud** — Invoke Cursor Cloud Agent CLI with repo, branch, agent context, and task. Record **start time (ET)** and write audit log entry (start).
4. **Monitor** — Optionally poll or subscribe for status until complete.
5. **Pull results** — When complete: capture commits, branch name, PR URL if created. Record **end time (ET)** and update audit log with result and PR URL.

## Related Commands
- **/dispatch-agent** — Bayard: local and QCS1 dispatch
- **/pickup-prompt** — Automated prompt lifecycle execution (queue-based)
