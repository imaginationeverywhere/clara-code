# Swarm Accountability Rules — NON-NEGOTIABLE

**Owner:** Daisy (Scrum Master) | **Reports to:** Mary (Product Owner)
**Effective:** March 20, 2026 | **Target:** April 1 MVP (85% burndown)

---

## Agent Tier Assignment

| Task Complexity | Agent Tier | Cost | Time Limit |
|----------------|-----------|------|------------|
| Simple (component, style fix, config) | Cursor Auto/Composer (Tier 0) | Free | 15 min |
| Medium (feature, API endpoint, page) | Cursor Auto/Composer (Tier 0) | Free | 45 min |
| Complex (auth flow, payment, multi-file) | Cursor Premium (Tier 1) | Subscription | 90 min |
| Architecture (schema design, migration) | Claude Code Max / Opus (Tier 2) | Subscription | 2 hours |

**Rule:** ALL coding tasks default to Cursor Auto/Composer. Premium ONLY for complex tasks with Amen Ra or Granville approval.

---

## Time Limits — HARD DEADLINES

| Task Size | Max Time | What Happens If Exceeded |
|-----------|----------|--------------------------|
| Small (1 file) | 15 min | Agent replaced immediately |
| Medium (2-5 files) | 45 min | Warning at 30 min. Replaced at 45. |
| Large (6+ files) | 90 min | Check-in at 45 min. Replaced at 90. |
| Epic (full feature) | 2 hours | Check-in at 1 hour. Replaced at 2. |

**Replacement process:** Kill the agent. Start a new agent on the SAME task with a cleaner prompt. Do NOT let a stuck agent burn time.

---

## Code Review Rules — 3 STRIKES

| Strike | What Happens |
|--------|-------------|
| Strike 1 | Gary flags issues. Agent fixes. Normal. |
| Strike 2 | Gary flags SAME type of issue. Agent gets a warning in the prompt. |
| Strike 3 | Agent is REPLACED. New agent gets the task with Gary's feedback included in the prompt. |

**What counts as a strike:**
- TypeScript errors that tsc --noEmit catches
- Missing auth checks (no context.auth?.userId)
- Breaking existing functionality
- Ignoring the PR review feedback
- Submitting the same broken code twice

---

## Daily Accountability Metrics

**Every agent reports (via Daisy):**
1. **Tasks completed** — count of merged PRs or committed features
2. **Tasks in progress** — what they're working on right now
3. **Blockers** — what's stopping them
4. **Time spent** — actual vs estimated

**Daisy tracks:**
- Tasks completed per agent per day
- Average time per task
- Code review pass rate (first attempt vs retries)
- Burndown percentage per Heru

---

## Swarm Dispatch Rules

1. **ONE agent per task** — no two agents on the same file
2. **Worktrees ALWAYS** — agents work in git worktrees, never main checkout
3. **PR when done** — every completed task creates a PR, no direct commits
4. **Named agents ONLY** — no anonymous "agent" dispatches. Every task has a named owner.
5. **Gap analysis BEFORE dispatch** — check what's already done before sending an agent

---

## Escalation Chain

| Issue | Who Handles | Escalate To |
|-------|------------|-------------|
| Agent stuck > time limit | Nikki replaces | Daisy logs |
| Code review fails 3x | Gary flags | Daisy replaces agent, reports to Mary |
| Architecture question | Coding agent asks | Granville decides (does NOT code) |
| Product question | Any agent asks | Mary decides |
| Blocker (missing env var, access) | Agent flags | Amen Ra resolves |
| Agent working on wrong thing | Daisy catches | Nikki reassigns |

---

## Performance Tracking

**Green (on track):**
- Task completed within time limit
- Code review passes on first or second try
- PR merged same day

**Yellow (at risk):**
- Task exceeds 75% of time limit
- Code review fails once
- PR open > 24 hours

**Red (failing):**
- Task exceeds time limit
- Code review fails 3x
- Agent replaced

---

## What Makes an Agent "Replaced"

An agent is replaced when:
1. They exceed their time limit
2. They fail code review 3 times on the same task
3. They produce code that breaks existing functionality
4. They work on the wrong task
5. They ignore review feedback
6. They hallucinate APIs or features that don't exist

**Replacement means:** Kill the process, start a NEW agent with a BETTER prompt that includes what went wrong.

---

## Daily Standup Format (Daisy Posts to Slack)

```
DAILY STANDUP — [DATE]

COMPLETED YESTERDAY:
- [Agent] finished [task] in [Heru] — PR #XX merged
- [Agent] finished [task] in [Heru] — PR #XX merged

IN PROGRESS TODAY:
- [Agent] working on [task] in [Heru] — est. [X] min
- [Agent] working on [task] in [Heru] — est. [X] min

BLOCKED:
- [Heru]: [blocker] — needs [who] to resolve

BURNDOWN: XX% complete (target: 85% by April 1)
AGENTS ACTIVE: X | REPLACED TODAY: X | PRs MERGED: X
```
