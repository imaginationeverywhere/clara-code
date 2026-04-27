---
type: cursor-prompt
authored_by: HQ (Opus 4.7) on 2026-04-27
team: /clara-code
priority: P0 (constitutional — IP protection ships in customer binary)
target_repo: imaginationeverywhere/clara-code (Clara Code CLI + IDE extension monorepo)
related_spec: docs/architecture/BRAIN_API_ACCESS_CONTROL.md (boilerplate)
---

# Clara Code — `/the-brain-customer` wrapper + build pipeline grep gate

## Context (read this first)

The Clara Code CLI and IDE extension ship to paying Vibe Pros. The boilerplate has a founder-version `/the-brain` command (`.claude/commands/the-brain.md`) that defaults to `brain-api.quiknation.com` — that endpoint is the founders' working memory and contains all of Quik Nation's IP. **A customer-facing version of this command MUST NOT default to or accept `quiknation` as a target.**

Spec doc: **`docs/architecture/BRAIN_API_ACCESS_CONTROL.md`** in the boilerplate. Read in full. Section "Customer-facing /the-brain wrapper" defines what this prompt builds.

## What you are building

Two deliverables:

### A. The customer-facing command file: `the-brain-customer.md`

A new command file shipped in the Clara Code CLI install bundle and IDE extension. Defaults to `brain-api.claracode.ai` with the caller's tenant scope. Refuses `quiknation` as a parameter. The file should be authored as if Ossie Davis wrote it (he authored the founder version), but framed for customers.

Required behavior:

1. **Default brain target = `brain-api.claracode.ai`** with tenant_id from the running customer's JWT.
2. **`/the-brain quiknation` from a customer context = ERROR** with body:
   > Quik Nation Brain access is restricted to founders. You can query your tenant brain at brain-api.claracode.ai. If you need information from the platform, ask Quik Nation support at support@quiknation.com.
3. **Constitution obligation preserved.** The command still re-reads the local `BRAIN.md` and the inherited platform constitution (this part is identical to the founder version — the constitution is law for everyone).
4. **Live brain query obligation preserved**, but routed to the tenant brain. MCP first → HTTP fallback → vault read DOES NOT FALL BACK TO QN VAULT (customers don't have it; this branch is removed in the customer version).
5. **Failure modes documented in the command file** — same family as the founder version (don't recommend without checking the brain) but framed for customer agents.

### B. Build pipeline grep gate

Add a CI step to the Clara Code release pipeline that:

1. Greps the shipped CLI binary AND IDE extension `.vsix` artifact for the literal string `brain-api.quiknation.com`.
2. If found, **fails the release** with:
   ```
   ❌ RELEASE BLOCKED: shipped artifact contains 'brain-api.quiknation.com'
   This is a constitutional violation per BRAIN_API_ACCESS_CONTROL.md.
   Customer-facing surfaces MUST NOT contain founder-only brain endpoints.
   ```
3. Same gate also greps for the founder-version `the-brain.md` content (search for the unique string `Constitution + Live Brain Discipline`) — that file MUST NOT ship in the customer bundle either.

### Acceptance criteria

- [ ] `packages/cli/.claude/commands/the-brain-customer.md` (or wherever the CLI's command-set lives) authored, peer-reviewed by Ossie Davis if reachable
- [ ] Default endpoint resolution implemented in CLI command resolver: `brain-api.claracode.ai` for Clara Code customers
- [ ] `quiknation` parameter from customer context returns the locked error message
- [ ] `mcp__clara-brain__brain_query` MCP server config in the CLI install bundle uses customer JWT + `brain-api.claracode.ai`, NOT founder credentials
- [ ] Build pipeline grep gate added to `.github/workflows/release.yml` (or wherever the release CI lives)
- [ ] Gate runs on every release build (not just main)
- [ ] Test: simulate a binary containing the forbidden string → CI fails with the locked error message
- [ ] Test: clean binary → CI passes
- [ ] Test: customer CLI invokes `/the-brain quiknation` → returns locked error message, never makes a network request
- [ ] Test: customer CLI invokes `/the-brain` (no arg) → routes to `brain-api.claracode.ai` with tenant_id from JWT

## Branch + PR

- Branch from `develop`: `feat/the-brain-customer-wrapper-build-gate`
- PR title: `feat(cli): customer-facing /the-brain + release grep gate (constitutional IP gate)`
- PR description: cite `docs/architecture/BRAIN_API_ACCESS_CONTROL.md` § "Customer-facing /the-brain wrapper" and link this prompt
- PR-only on shared branches
- Mo reviews; Mo merges

## Out of scope (do NOT do in this prompt)

- Server-side enforcement on `brain-api.<product>` endpoints — prompt 07 covers that
- Server-side enforcement on `brain-api.quiknation.com` — prompt 06 covers that
- Customer dashboard for reading audit log — separate prompt
- Marketing copy for the trust positioning — separate prompt to /clara-code marketing

## Cross-references

- Spec: `docs/architecture/BRAIN_API_ACCESS_CONTROL.md`
- Founder version `/the-brain.md`: `quik-nation-ai-boilerplate/.claude/commands/the-brain.md`
- The Brain naming rule: `feedback-the-brain-always-means-quik-nation-brain.md`
- BRAIN.md at clara-code repo root
