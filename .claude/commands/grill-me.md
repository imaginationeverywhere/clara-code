# /grill-me — Interrogate requirements before planning

**Inspired by:** “Grill Me” pattern — ask sharp questions *before* writing a plan or code, so you don’t build the wrong thing.

## When to use

- A feature or change is described in one sentence and might hide ambiguity.
- Stakeholders skipped edge cases, data ownership, or success criteria.
- You are about to enter plan mode but the requirement is still fuzzy.

## Usage

```text
/grill-me "Add a wishlist feature"
```

Pass the **feature or change** as the argument (quoted). If no argument is given, ask the user for a one-paragraph description first.

## How it works (3 steps)

1. **Grill** — Output **5–8 numbered questions** only. Do **not** write a plan, tasks, or code.
2. **Wait** — Stop and wait for the human’s answers (or “skip question N with assumption: …”).
3. **Summarize** — After answers: produce **exactly 10 bullet points** capturing the agreed requirements, then ask: **“Should I proceed to plan mode?”** Only if they confirm, move to planning or implementation.

## Question categories (cover all six)

Aim for at least one question from each category (merge where it makes sense; total 5–8 questions):

1. **Scope** — What is explicitly in scope? What is explicitly out of scope?
2. **Users** — Who uses this? Primary vs secondary actors? Mental model?
3. **Edge cases** — What if data is missing, duplicate, or conflicting? What if the user abandons mid-flow?
4. **Data** — What is stored, where, retention, PII, and **tenant_id** / multi-tenant boundaries if applicable?
5. **Integration** — What systems, APIs, or pages does this touch? What breaks if those change?
6. **Success** — How do we verify “done”? Metrics, QA checklist, or demo script?

## Rules

- Questions should be **specific** to the feature argument, not generic boilerplate only.
- Do **not** produce architecture, file lists, or timelines until step 3 is approved for planning.
- If the user asks you to skip grilling, warn once that ambiguity risk increases, then continue only if they insist.

## Command metadata

```yaml
name: grill-me
version: 1.0.0
```
