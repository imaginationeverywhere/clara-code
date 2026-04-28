# Upgrade `clara doctor` from probe-stub to scaffold-integrity check

## Role
You are **Mary McLeod Bethune** upgrading `clara doctor` in `packages/cli/`. Sprint 3 shipped the probe-only stub (commit `83c2acc7`). Daysha directive §A requires the REAL doctor: scaffold integrity + toolchain prerequisites, not just endpoint health.

## Read first
- `prompts/.../07-clara-code-daysha-build-readiness-directive.md` §A
- `prompts/.../08-clara-command-ip-firewall-architecture.md`
- `packages/cli/src/commands/doctor.ts` (the existing stub)

## Intent contract

```yaml
intent: "doctor"
tier: "taste"
params:
  scope: "all" | "scaffold" | "endpoints" | "auth" | "tier"  (default: "all")
```

Voice: catalog 09 §A.

## Task

Extend the existing `commands/doctor.ts` to add scaffold-integrity checks alongside the existing probes. Keep probes (gateway/brain/backend) intact.

New checks (run when in a Heru repo):

1. **Toolchain prerequisites** (local — no gateway call):
   - Node ≥ 20
   - pnpm installed
   - git available + repo initialized
   - aws CLI present (warn if missing — needed for deploy)
   - cf CLI / wrangler present (warn if missing)
   - docker present (warn — needed for backend deploy)

2. **Scaffold integrity** (compares cwd against expected Heru structure):
   - `BRAIN.md` exists at repo root
   - `CLAUDE.md` exists at repo root
   - `.claude/` directory exists
   - `frontend/`, `backend/`, `infrastructure/` dirs exist (warn if any missing — may not be a Heru repo)
   - `package.json` has the expected workspaces
   - `pnpm-workspace.yaml` if applicable

3. **Endpoint probes** (existing — unchanged):
   - gateway / brain / backend HEAD probes
   - auth: `~/.clara/credentials.json` present

4. **Tier + minutes status** (gateway call):
   - GET `${gateway}/v1/tier-status` with bearer
   - Returns current tier + minutes remaining
   - Cache result so the status bar (CLI footer / IDE) can read it

5. **Last-error replay**:
   - Read `~/.clara/last-error.json` (written by other commands on failure)
   - Show plain-English summary if present
   - Suggest re-running the failing command or contacting support

Output format: same per-line `✓ / ~ / ✗` glyphs as the existing stub. Add a "scaffold" section between auth and tier.

## Server-side (gateway / clara-platform owns)

- `GET /v1/tier-status` — returns `{ tier, minutes_remaining, billing_cycle_end }` from the bearer's account.

## Acceptance

- `clara doctor` runs all 5 check categories sequentially with parallel HTTP probes
- Total wall time ≤ 10s on healthy install
- Inside a non-Heru directory: scaffold check shows "not a Heru repo (skipped)" — no false errors
- Inside a Heru repo: shows missing files / dirs explicitly
- Toolchain warnings don't fail the command (exit 0 if only warnings)
- Failures (auth missing, gateway unreachable, brain unreachable) exit non-zero
- `--scope=scaffold` runs only scaffold checks
- Tests: each scope independently, in-repo / out-of-repo modes, all-green / partial-failure paths
- `npm run check` passes
- **IP audit:** zero brain query content / model names / gateway internals visible in CLI binary

## Constraints

- All endpoint probes have 5s timeout
- Toolchain probes via `which` / `command -v` — no shelling out to commands themselves
- `last-error.json` write side-effect is OWNED by `lib/intent-dispatch.ts` (when other commands fail) — doctor only reads it
- No raw HTTP errors leaked — `claraHttpErrorMessage` for non-2xx

## Mo is watching

`clara doctor` is the universal escape valve every other command's fix-hint references. If doctor lies, the whole error UX collapses.
