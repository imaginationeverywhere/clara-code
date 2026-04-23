---
description: Interrogate a feature requirement with sharp questions before planning or coding
---

# /grill-me — Requirements interrogation (before plan mode)

## Purpose

Use **before** writing a plan or implementation. The agent asks targeted questions to surface ambiguity, hidden assumptions, and scope gaps—so you do not build the wrong shape of feature. Inspired by the "Grill Me" pattern: interrogate the requirement first; code and plans come after clarity.

## When to use

- You have a one-line or vague feature request.
- Stakeholders disagree or the success criteria are fuzzy.
- The feature could touch auth, data, payments, or multiple surfaces—you need to pin boundaries first.
- You are about to enter plan mode but the requirement still has unknowns.

## How it works (3 steps)

1. **Grill** — Given the feature description (from the user’s `/grill-me "..."` argument), ask **5–8 sharp questions** as a **numbered list**. Cover the six categories below. **Do not** write a plan, pseudocode, or file list yet.
2. **Wait** — Stop and wait for the human’s answers. Do not assume answers. If something is still unclear after answers, ask a short follow-up (still no plan).
3. **Summarize & gate** — After answers: produce **exactly 10 bullet points** summarizing the agreed requirements, then ask: **“Should I proceed to plan mode?”** Only if they confirm, move to planning.

## Argument

The user passes a short feature description, e.g. `/grill-me "Add a wishlist feature"`. Treat that string as the requirement under interrogation.

## The six categories (always cover)

Ask questions that map to these—combine or split so the total stays **5–8 questions**, not a laundry list:

1. **Scope** — What is explicitly in scope? What is explicitly out of scope?
2. **Users** — Who exactly uses this? What is their mental model and primary job-to-be-done?
3. **Edge cases** — What happens on empty states, errors, offline, permission denied, or abuse?
4. **Data** — What is stored, where, retention, PII, and who can read/write it?
5. **Integration** — What systems, APIs, or teams does this touch? What breaks if this changes later?
6. **Success** — How do we verify “done”? Metrics, acceptance tests, or demo criteria?

## Rules for the agent

- Output **only** the numbered questions until the user has answered.
- **Never** output a plan, task list, or code in step 1.
- After answers: **10 bullets** of agreed requirements, then the single question: **Should I proceed to plan mode?**
- Keep questions specific to the feature description (no generic filler).

## Output format (step 1 template)

```text
## Questions before we plan

1. …
2. …
…

Answer each when ready. I will not draft a plan until you do.
```
