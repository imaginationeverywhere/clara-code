# [QCS1 Cursor] Fix clara-code main-branch CI — expand `glm-*` model name union

**Target repo:** `imaginationeverywhere/clara-code`
**Target branch:** new branch off `main`, named `fix/ai-glm-model-union`
**Urgency:** P0 — main CI is red, blocking PR #64 + PR #65 + every future PR
**Estimated time:** 5–10 minutes
**Owner:** /clara-code (the `packages/ai/` directory is harness/AI runtime, in /clara-code's lane)

---

## Background

On `imaginationeverywhere/clara-code` `main`, the CI workflow `build-check-test` is failing with 11 TypeScript errors. ALL errors are the same shape:

```
packages/ai/test/<filename>.test.ts(<line>,<col>):
  error TS2345: Argument of type '"glm-5"' is not assignable to parameter
  of type '"glm-4.5-air" | "glm-4.7" | "glm-5-turbo" | "glm-5.1"'.
```

The model names referenced in tests but missing from the literal union:
- `"glm-5"`
- `"glm-4.5-flash"`
- `"glm-4.7-flash"`
- `"glm-4.6v"`

Existing union:
```typescript
"glm-4.5-air" | "glm-4.7" | "glm-5-turbo" | "glm-5.1"
```

Tests are valid — they reference real model IDs. The union was tightened too aggressively at some point and tests weren't updated. The fix is to **expand the union** to match the test expectations.

## Task

1. **Locate the union type defn** — likely in `packages/ai/src/<something>.ts`. Search for the existing union members:
   ```bash
   grep -rn '"glm-4.5-air"' packages/ai/src/
   ```
2. **Expand the union** to include the four missing names alongside the existing four:
   ```typescript
   type ZhipuModel =
     | "glm-4.5-air"
     | "glm-4.5-flash"   // ADD
     | "glm-4.6v"        // ADD
     | "glm-4.7"
     | "glm-4.7-flash"   // ADD
     | "glm-5"           // ADD
     | "glm-5-turbo"
     | "glm-5.1";
   ```
   (Type name may differ — match what's there. Add the four missing names alphabetically or by version.)
3. **Run validation locally:**
   ```bash
   pnpm install
   pnpm run check
   ```
   Should now pass.
4. **Commit + push + open PR:**
   - Branch: `fix/ai-glm-model-union`
   - Commit message:
     ```
     fix(ai): expand glm model name union to include glm-5, 4.5-flash, 4.7-flash, 4.6v

     Tests in packages/ai/test/ reference these model names; the literal
     union was missing them. Expanding the union fixes 11 TS2345 errors
     blocking main CI and every downstream PR (including #64, #65).

     Co-Authored-By: <agent-name> <noreply@anthropic.com>
     ```
   - PR title: `fix(ai): expand glm model name union to match test expectations`
   - PR body should call out: blocks PR #64 + #65, fix is one-file, no behavioral change

## Acceptance criteria

- [ ] `pnpm run check` passes locally before push
- [ ] Branch is `fix/ai-glm-model-union` off latest `main`
- [ ] Single-file change (the type defn) — no test edits, no source-code edits beyond the union expansion
- [ ] PR opened against `main`
- [ ] Once CI green: PR is mergeable, no conflicts

## Constraints

- **Do NOT edit any `packages/ai/test/*.test.ts` files.** Tests are correct; the type defn is what needs to change.
- **Do NOT add unrelated changes.** This is a P0 CI unblock — single-purpose PR.
- **Do NOT bypass CI** if it still fails after the union widening (means we missed a model name — find it, add it, re-run).
- **Do NOT push to main directly.** PR-only on shared branches per platform policy.
- **No internal codenames** in commit messages, PR title, or PR body.
- **No "unlimited"** anywhere.

## After this PR merges

PRs #64 and #65 can be re-CI'd and will go green. Notify /clara-platform (me) when this lands so I can chain the merge ceremony.
