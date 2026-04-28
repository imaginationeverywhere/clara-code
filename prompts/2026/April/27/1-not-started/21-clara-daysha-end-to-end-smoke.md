# Implement `clara smoke daysha` — end-to-end Daysha-readiness smoke test

## Role
You are **Mae Jemison** implementing the end-to-end smoke. Daysha directive §G. This is the green light that unblocks the Daysha pitch.

## Read first
- 07 (Daysha §G — the exact one-line smoke command)
- 08, 09 (firewall, catalog)
- 10–20 (every command this smoke chains)

## Intent contract

```yaml
intent: "smoke.daysha"
tier: "cook"
params:
  heru_name: string (default: "daysha-taylor")
  cleanup: boolean (default: true — tear down at end so smoke is repeatable)
```

Voice: catalog 09 §G.

## Task

`clara smoke daysha` runs the entire Daysha-readiness checklist as a single command:

1. `clara new daysha-taylor`
2. `cd daysha-taylor`
3. `clara wire-auth --clerk`
4. `clara deploy frontend --target cloudflare`
5. `clara deploy backend`
6. `clara provision-brain`
7. `clara verify-brain`
8. `clara attach-talent daysha-mvp`
9. `clara gear add email-receiver-cf`
10. `clara gear add eas-attestation` (skip if Phase 0 not live; warn but don't fail)
11. End-to-end test: hit the live frontend URL, send a test email to the receiver, query the agent via voice/text, assert response

Each step:
- Run via the underlying intent
- Stream progress to user
- On any failure: clean error message + which step failed + suggest `clara doctor`
- On success: continue to next

Final output:
- A receipts file `~/.clara/smoke-daysha-<timestamp>.json` with:
  - Frontend URL
  - Backend URL
  - Brain URL
  - Attached talents
  - Installed gears
  - Email address
  - Total time
  - Total minutes consumed
  - "ALL GREEN" signal posted to live feed (per directive 07): `CLARA-CODE | DAYSHA-READY | ALL GREEN | <smoke-log-path>`

## Cleanup mode

- Default: delete the test agent + brain + Cloudflare routes + Clerk app + EAS publisher after smoke completes (so smoke is repeatable)
- `--keep` flag preserves everything (for debugging / demo)
- Cleanup runs even on failure (rollback) unless `--no-cleanup-on-failure` is passed

## Acceptance

- Fresh laptop with valid AWS + CF + Clerk + Bedrock + Modal credentials in SSM passes the smoke in ≤ 15 minutes total
- Smoke output is parseable (`--json` flag for CI consumption)
- Failures bisect cleanly — user knows which step broke and how to retry just that step
- Live feed gets the "ALL GREEN" signal on success
- 403 tier_lock for Taste/Plus
- Tests: success path (mocked dispatcher), each step's failure path with rollback, --keep mode, --json mode
- **IP audit:** smoke is just a sequencer of intents — zero new IP introduced

## Constraints

- Smoke must NEVER leave production-tier resources lingering (cost control)
- Cleanup is best-effort but logs everything that didn't tear down so operator can manual-clean
- Total cost of one smoke run logged so we can budget how often to run

## Mo is watching

Until this exits green, the Daysha pitch stays parked. Until it exits green REPEATABLY across machines, we can't claim Clara Code ships businesses for clients. This is the bar.
