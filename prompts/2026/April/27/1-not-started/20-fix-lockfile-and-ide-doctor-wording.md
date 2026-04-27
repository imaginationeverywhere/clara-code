# Fix: regenerate `pnpm-lock.yaml` + replace `clara doctor` → `Clara: Doctor` in IDE error mapping

**Source:** Code review `docs/review/20260427-132355-code-review.md`
**Grade received:** A− (code quality), BLOCKED (CI)
**Issues to fix:** 1 P0 (CI blocker), 1 medium (brand consistency)
**Estimated time:** 5–10 minutes
**Owner:** /clara-code (anyone — this is two small mechanical fixes)

---

## Context

PR #71 (Sprint 3 prompts 06–19) is solid code but cannot merge: CI fails because `pnpm-lock.yaml` is stale relative to `frontend/package.json` (specifier order changed in a prior merge to develop, lockfile didn't follow). PR #71 doesn't touch either file — it inherits the broken state. This corrective prompt fixes the lockfile drift so PR #71 (and every subsequent PR) gets a green install.

While in there, also fix one medium-severity brand-consistency issue identified in the review: IDE error messages say `Run \`clara doctor\` for status` but `clara doctor` is a terminal command that Vibe Pros can't run from inside VS Code. The IDE should reference its own command-palette name `Clara: Doctor`.

---

## Required Fixes

### P0: Regenerate `pnpm-lock.yaml`

**Problem:** CI's `pnpm install --frozen-lockfile` errors with `ERR_PNPM_OUTDATED_LOCKFILE`:
```
specifiers in the lockfile (...) don't match specs in package.json (...)
```
The package SET is identical between lockfile and package.json — only the ORDER differs. Newer pnpm enforces strict order match.

**Fix:**
```bash
# From repo root
pnpm install
```

That regenerates `pnpm-lock.yaml` to match the current `frontend/package.json` ordering. Do NOT edit either file by hand. Do NOT add `--no-frozen-lockfile` to CI workflows — that masks future drift instead of catching it.

Commit only the regenerated `pnpm-lock.yaml`. Do not bundle unrelated dependency changes.

### Medium: IDE doctor wording

**File:** `packages/ide-extension/src/http-errors.ts`
**Problem:** 5 strings reference `Run \`clara doctor\`` — a CLI command that doesn't exist inside VS Code. Strategy briefing prompt 16 mandated surface-appropriate wording: CLI says `clara doctor`, IDE says `Clara: Doctor` (the command-palette name).

**Fix:** Replace every occurrence in that one file:
- `\`clara doctor\`` → `\`Clara: Doctor\``

Should be 5 substitutions. The CLI version (`packages/cli/src/lib/http-errors.ts`) is correct — DO NOT touch it. Only the IDE file.

---

## Acceptance Criteria

- [ ] `pnpm install` runs cleanly locally; `pnpm-lock.yaml` is regenerated
- [ ] CI's `pnpm install --frozen-lockfile` step succeeds (verify by re-running CI on this PR)
- [ ] `grep "clara doctor" packages/ide-extension/src/http-errors.ts` returns ZERO hits
- [ ] `grep "Clara: Doctor" packages/ide-extension/src/http-errors.ts` returns 5 hits
- [ ] CLI version `packages/cli/src/lib/http-errors.ts` is UNCHANGED
- [ ] `npm run check` passes
- [ ] Commit message: `fix: regenerate pnpm-lock.yaml + IDE doctor wording per review of PR #71`

## Do NOT

- Do not touch any other file
- Do not "modernize" or restructure unrelated code
- Do not add `--no-frozen-lockfile` to CI workflows
- Do not change CLI error messages (they're correct)
- Do not modify `frontend/package.json` itself — only the lockfile follows

## Once merged

PR #71's CI re-runs automatically and goes green. Then `/review-code` re-runs and Phase 6 auto-merges PR #71 into develop. No human intervention needed beyond merging this small PR first.
