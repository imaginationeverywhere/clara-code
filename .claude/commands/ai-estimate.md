# /ai-estimate — Machine-Speed Timeline Estimation

**Version:** 1.0.0
**Created by:** Mo's directive, April 14, 2026

Forces honest AI-speed estimates. Cursor agents work at machine speed — 24/7, in parallel, without fatigue. This command converts human developer estimates into actual machine timelines and ends the "Sprint 3, Sprint 4, Sprint 5" anti-pattern.

## Usage

```
/ai-estimate                                   # Estimate the last plan discussed in this conversation
/ai-estimate "build 15 prompt templates"       # Estimate specific work
/ai-estimate "everything Granville just laid out"
/ai-estimate --breakdown                       # Task-by-task with agent assignments
/ai-estimate --dispatch                        # Estimate AND generate the prompt files to dispatch
```

## The Rule (NON-NEGOTIABLE for ALL agents)

**Every agent that gives a timeline estimate MUST use machine time, not human time.**

Human developers estimate based on:
- 8-hour workdays with breaks and meetings
- Sequential work (one task at a time)
- Fatigue, context-switching, and cognitive overhead
- "Sprints" measured in weeks

Cursor agents run on:
- 24/7, no breaks
- True parallel execution (up to 6 agents simultaneously on QCS1)
- Machine speed — no fatigue, no overhead
- Continuous execution until the queue is empty

**The correction factor: divide the human estimate by 10-50x.**

| ❌ Human estimate | ✅ Machine estimate |
|------------------|-------------------|
| "Sprint 3 (April 16-30)" | "~4 hours with 6 agents" |
| "Sprint 4 work" | "~2 hours after Sprint 3 PRs merge" |
| "Sprint 5 — Phase 3" | "~3 hours, queue behind Sprint 4" |
| "This will take weeks" | "15 prompts → dispatch today → PRs tonight" |
| "A few days of development" | "1-2 agent sessions, ~3 hours total" |
| "Significant engineering effort" | "Write the prompts. Dispatch now." |
| "Planning needed first" | "The plan IS the prompt. Write it now." |

---

## Cursor Agent Speed Baselines (QCS1 — M4 Pro)

These are REAL numbers, not estimates. Adjust based on task complexity.

| Task Type | Time Per Agent |
|-----------|---------------|
| Read + analyze a codebase section | 30-90 seconds |
| Write a single file (50-200 lines) | 2-5 minutes |
| Write a full feature (5-15 files) | 15-45 minutes |
| Write + run tests + fix failures | 20-60 minutes |
| Create a new command or agent | 10-20 minutes |
| Create a prompt template (.template file) | 5-15 minutes |
| Add a flag to an existing command | 5-10 minutes |
| Debug + fix a specific bug | 5-20 minutes |
| PR creation + description | 2-5 minutes |
| Full /pickup-prompt lifecycle (one prompt) | 20-60 minutes |
| Run /sync-herus (push to 53 Herus) | 5-10 minutes |
| EAS iOS build on QCS1 | 15-25 minutes |
| EAS Android build on QCS1 | 8-15 minutes |

---

## Parallel Execution Capacity

QCS1 (Mac M4 Pro) supports up to **6 concurrent Cursor agents** without degradation.
Mo has Cursor Ultra = unlimited agent licenses.
The hardware is the limit, not the license.

**Batching math:**

```
15 tasks:
  1 agent sequential:     15 × 30min = 7.5 hours
  6 agents parallel:      ceil(15/6) × 30min = 3 batches × 30min = 1.5 hours
  Dependencies required:  some tasks must follow others — adjust batches accordingly
```

**Dependency types:**
- `PARALLEL`: can run simultaneously (independent features)
- `SEQUENTIAL`: must follow another task (e.g., DB schema before API that uses it)
- `AFTER_MERGE`: must wait for a PR to merge before starting (e.g., SDK built on top of template engine)

---

## Estimation Output Format

When executing `/ai-estimate`, produce this exact format:

```
AI TIMELINE ESTIMATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Work: [description of what's being estimated]

TASK BREAKDOWN:
  01. [task name] ........... ~Xmin  [PARALLEL / SEQUENTIAL after 02]
  02. [task name] ........... ~Xmin  [PARALLEL]
  03. [task name] ........... ~Xmin  [SEQUENTIAL after 01]
  ...

SEQUENTIAL (1 agent):          ~X hours
PARALLEL (6 agents, QCS1):     ~X hours  ← RECOMMENDED
CRITICAL PATH:                 ~X hours  (longest dependency chain)

AGENT BATCHES (6 concurrent):
  Batch 1 (~Xmin):  01, 02, 03, 04, 05, 06
  Batch 2 (~Xmin):  07, 08, 09 (after Batch 1)
  Batch 3 (~Xmin):  10, 11 (after 09 merges)

HUMAN DEVELOPER EQUIVALENT:  X weeks / X sprints
MACHINE REALITY:              X hours / X days

WHAT BLOCKS US (if anything):
  - [dependency: external, credential, approval — not agent time]

READY TO DISPATCH:
  → Write prompts for Batch 1 now
  → /pickup-prompt processes them tonight
  → Batch 2 prompts written after Batch 1 PRs merge
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## What Counts as Legitimately Multi-Day or Multi-Week

The ONLY things that justify a multi-day or multi-week estimate are **waits that are not agent execution time:**

| Wait Type | Duration | Why |
|-----------|----------|-----|
| Apple App Store review | 1-7 days | Apple's process, not ours |
| Google Play review | 1-3 days | Google's process, not ours |
| Model training run (QLoRA on QCS1) | 2-8 hours GPU time | Hardware, not agent work |
| Client provides assets/credentials | Unknown | Human dependency |
| Waiting for a PR to merge (CI/CD) | 10-30 min | Pipeline, not agent |
| Legal/regulatory process | Varies | External |

**Everything else is agent time.** If an agent can do it, it takes hours. Write the prompts. Dispatch now.

---

## When to Apply This Command

**Proactively — without being asked:**
- Any time an agent in a plan says "Sprint X" as a unit of time
- Any time an agent says "this will take weeks"
- Any time a roadmap uses 2-week sprint blocks where machine execution applies
- When Granville lays out architecture and needs to convert it to dispatch plan

**On demand:**
- Mo asks: "how long does all this take?"
- Before any dispatch decision, to confirm we're not waiting unnecessarily
- When the team needs a realistic go-live date

---

## Applied to the Granville Template Architecture (Example)

Granville said "Sprint 3, Sprint 4, Sprint 5" — here's the machine reality:

```
AI TIMELINE ESTIMATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Work: Clara Prompt Template System + SDK + API (what Granville called "3 sprints")

TASK BREAKDOWN:
  01. Create .claude/prompt-templates/ directory structure ....... ~10min  [PARALLEL]
  02. Write auth/clerk-login-signup.md.template .................. ~15min  [PARALLEL]
  03. Write commerce/stripe-subscriptions.md.template ............ ~15min  [PARALLEL]
  04. Write platform/admin-dashboard.md.template ................. ~15min  [PARALLEL]
  05. Write platform/user-profile-wallet.md.template ............. ~15min  [PARALLEL]
  06. Write 10 remaining templates (6 agents, 2 each) ............ ~30min  [PARALLEL]
  07. Add --from-template flag to /pickup-prompt .................. ~30min  [SEQUENTIAL after 01]
  08. Build parameter substitution engine ({{variable}}) ......... ~30min  [SEQUENTIAL after 01]
  09. Fix --apple substring bug (from Granville audit) ........... ~10min  [PARALLEL]
  10. Fix push failure handling .................................. ~20min  [PARALLEL]
  11. Fix break→continue on worktree failure ..................... ~10min  [PARALLEL]
  12. Add orphaned prompt detection .............................. ~15min  [PARALLEL]
  13. Create @quiknation/clara-sdk package scaffold .............. ~45min  [SEQUENTIAL after 07+08]
  14. Implement clara.build() with template resolution ........... ~60min  [SEQUENTIAL after 13]
  15. POST /api/build on Hermes ................................. ~60min  [SEQUENTIAL after 14]
  16. Test: "I need login and sign-up" end-to-end ............... ~30min  [SEQUENTIAL after 15]

SEQUENTIAL (1 agent):          ~7 hours
PARALLEL (6 agents, QCS1):     ~3 hours  ← RECOMMENDED
CRITICAL PATH:                 ~3.5 hours (01 → 07+08 → 13 → 14 → 15 → 16)

AGENT BATCHES (6 concurrent):
  Batch 1 (~30min):  01, 02, 03, 04, 05, 09  [all parallel, start immediately]
  Batch 2 (~30min):  06, 10, 11, 12, 07, 08  [after Batch 1; 07+08 need 01 done]
  Batch 3 (~60min):  13, 14 [after 07+08 merge]
  Batch 4 (~90min):  15, 16 [after 14 merges]

HUMAN DEVELOPER EQUIVALENT:  3 sprints / 6 weeks
MACHINE REALITY:              ~3.5 hours critical path, ~6 hours wall clock

WHAT BLOCKS US:
  - Nothing external. All agent work.

READY TO DISPATCH:
  → Batch 1: Write 6 prompts now → /pickup-prompt tonight → done
  → Batch 2: Write prompts after Batch 1 PRs reviewed
  → Batches 3+4: Sequential dependencies, write as prior PRs merge
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Granville called it "3 sprints." The machine says: **3.5 hours critical path. Dispatch today.**

---

## Rule Enforcement

This command creates a standing rule for the entire agent network:

**NO AGENT may give a human timeline estimate without also providing the machine-speed estimate.**

If Granville says "Sprint 3" — `/ai-estimate` should fire automatically or Mo should invoke it.
If Maya writes a plan with "2-week timeline" — `/ai-estimate` corrects it before dispatch.
If any agent says "weeks" — that agent should immediately follow with the machine equivalent.

This is permanent. This is in the platform. All agents inherit this rule.

---

## Command Metadata

```yaml
name: ai-estimate
version: 1.0.0
created: 2026-04-14
directive: Mo — "forces agents to give AI timeline estimates, not human timeline estimates. To do all this should only take hours and maybe some days but definitely not weeks."
enforcement: ALL agents — Granville, Maya, Nikki, all team leads
anti-pattern: "Sprint X", "weeks", "significant effort", "will take time"
correct-pattern: "X hours", "X agent batches", "dispatch today", "PRs tonight"
```
