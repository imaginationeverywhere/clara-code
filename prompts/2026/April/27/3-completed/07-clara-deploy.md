---
type: cursor-prompt
status: completed-archived
archived: 2026-04-27
authored_by: HQ
team: /clara-code
target_repos: clara-code
---

**Archival note (2026-04-27):** Sprint 3 prompt work is implemented in `packages/cli` and/or `packages/ide-extension` (cognitive verbs, deploy, TUI chat, config, IDE commands, status bar, shared HTTP error mapping, minutes, tier lock). This file is archived; product parity with live backend may evolve separately.

# Implement `clara deploy` — agent build + push + App Runner trigger

## Role
You are **Benjamin Banneker** implementing the `clara deploy` command for the Clara Code CLI in `packages/cli/`. Mo is watching. Sprint 3 closes Thursday 2026-04-30.

## Briefing reference
Read `prompts/2026/April/26/1-not-started/00-strategy-briefing-LOCKED-RULES.md` in full before writing code. Pay special attention to:
- "Pricing-driven feature gates" — `clara deploy` is **Cook+ only** (tier-gated server-side)
- "What the QCS1 agents do NOT do" — you do NOT touch App Runner config, Dockerfile, or IAM. The CLI orchestrates via the backend; the backend owns the deploy plumbing.
- The forthcoming `docs/architecture/AGENT_REPO_STRATEGY.md` for the orchestration contract

## Task
Add `clara deploy` (run from inside an agent repo cloned via `clara init`):
1. Read agent identity from `./clara.json` (or fall back to repo name).
2. POST `${CLARA_BACKEND_URL}/api/agents/<name>/deploy` with the user's bearer token.
3. The backend owns the build/push/trigger sequence. The CLI's job is only to:
   - Stream progress events from the response (SSE: `building`, `pushing`, `deploying`, `live`, `failed`)
   - Render a clean progress UI (Ink spinner with current step)
   - Surface the final URL on success: "Live at <url>"
4. On 403 tier_lock with `reason: "deploy_requires_cook"`, render the upgrade CTA and exit non-zero.

## Acceptance
- `clara deploy` from a Cook+ account walks through the streamed phases and prints the live URL
- `clara deploy` from a Taste/Plus account returns the upgrade CTA, no partial state created on the server
- The CLI never invokes `docker`, `aws`, or `apprunner` directly — only HTTP to the backend
- Tests cover: tier-locked path, success path (mocked SSE), failure mid-build
- `npm run check` passes

## Constraints
- No `Dockerfile`, no `docker push`, no AWS SDK in the CLI
- No client-side tier gating — render whatever the server returns
- Never write a deploy log to disk; logs stream and disappear

## Mo is watching
The CLI is a brand surface, not a build server. Every byte of deploy plumbing belongs on the platform side. One PR, target `develop`.
