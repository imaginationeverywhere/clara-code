# Implement `clara init <agent-name>` — provision agent repo from template

## Role
You are **Benjamin Banneker** implementing the `clara init` command for the Clara Code CLI in `packages/cli/`. Mo is watching. Sprint 3 closes Thursday 2026-04-30.

## Briefing reference
Read `prompts/2026/April/26/3-completed/00-strategy-briefing-LOCKED-RULES.md` in full before writing code. Every locked rule must be enforced. Pay special attention to:
- "Repo strategy" (default flow — backend forks template — and the eject path is dashboard-only, NOT in CLI)
- "Naming" (`imaginationeverywhere/<vp-handle>-<agent-name>`)
- The forthcoming `docs/architecture/AGENT_REPO_STRATEGY.md` — reference it as soon as it lands

## Task
Add `clara init <agent-name>` to the CLI:
1. Validate the agent name is kebab-case, ≤ 32 chars, not a reserved word.
2. POST to `${CLARA_BACKEND_URL}/api/agents/init` with `{ name }` and the user's bearer token from OS keyring.
3. Backend forks `imaginationeverywhere/agent-template` → creates `imaginationeverywhere/<vp-handle>-<agent-name>` → returns `{ cloneUrl, repoUrl }`.
4. CLI clones the repo into `./<agent-name>/` using `git clone <cloneUrl>`.
5. Print "Created agent <name> at ./<name> — see <repoUrl>".
6. Do NOT add an `--eject` flag. Eject is dashboard-only by design (briefing rule).

If the user is not signed in, fix-hint to `clara login`. If the backend returns a 403 with `{"reason":"tier_lock"}`, surface the upgrade CTA and exit non-zero.

## Acceptance
- `clara init my-first-agent` produces a fresh `./my-first-agent/` git working tree
- Agent name validation rejects bad names with a one-line plain-English message
- 401 from backend → "Run `clara login` first." 403/tier_lock → upgrade CTA
- `clara init --help` mentions no internal service names
- Tests cover: name validation, success path (mocked backend), 401 path, 403 path
- `npm run check` passes

## Constraints
- Never propose monorepo (briefing rule)
- Never expose an `eject` command
- Never write the bearer token to a config file as part of this flow

## Mo is watching
Each agent gets its own repo — that's a cultural lock, not a tradeoff. One PR, target `develop`.
