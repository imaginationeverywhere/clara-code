# Implement `clara verify-brain` — query test against the new brain

## Role
You are **Vivien Thomas** implementing `clara verify-brain` in `packages/cli/`. Daysha directive §C. Last gate before declaring brain provisioning complete.

## Read first
- 07 (Daysha §C)
- 08 (firewall)
- 09 (voice catalog §C)
- 14 (provision-brain output schema)

## Intent contract

```yaml
intent: "verify-brain"
tier: "taste"
params:
  heru_name: string (from ~/.clara/<heru>/brain.json or --name)
  query: string (optional — defaults to a server-side canary query)
```

Voice: catalog 09 §C.

## Task

`clara verify-brain`:

1. `packages/cli/src/commands/verify-brain.ts` — argv + read `~/.clara/<heru>/brain.json` for the brain URL + SSM key path.
2. `runIntent("verify-brain", { heru_name, query? })`.
3. Server:
   - Resolves the SSM key, gets `CLARA_BRAIN_API_KEY`
   - Runs the canary query (or user's query) against `${brain_url}/query` with Bearer
   - Verifies retrieval round-trip works
   - Returns `{ ok, latency_ms, retrieved_count, sample_chunks }`
4. CLI prints:
   - ✓ brain reachable (latency)
   - ✓ retrieval working (N chunks returned)
   - ✓ embedding model active
   - On any failure, `claraHttpErrorMessage` + suggest `clara doctor`

## Acceptance

- Fresh provision → `clara verify-brain` returns ✓ across the board
- Empty corpus → returns `retrieved_count: 0` with note "Brain provisioned but no corpus ingested. Use the platform-side ingest flow." (NOT a failure — empty is valid)
- Wrong API key → 401, mapped error, suggests platform team
- Custom `--query "..."` runs the user's query against retrieval
- Returns `--json` for scripting
- Tests: provisioning round-trip (mocked), empty corpus, 401, custom query
- **IP audit:** zero brain query construction / SQL / cognee internals in CLI

## Constraints

- All brain queries go through the gateway, never direct
- API key never logged
- Latency reported in ms (round-trip, not just network)

## Mo is watching

Verify-brain is the green light for the rest of Daysha's stack to ride on. False positive = wasted Daysha pitch.
