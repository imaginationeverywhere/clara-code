# Implement `clara provision-brain` — per-Heru memory substrate

## Role
You are **Cheikh Anta Diop** implementing `clara provision-brain` in `packages/cli/`. Daysha directive §C. Memory: `project_dedicated_4gb_app_runner_per_heru_2026-04-26.md` + `AGENT_BRAIN_NAMESPACING.md`.

## Read first
- 07 (Daysha §C)
- 08 (firewall)
- 09 (voice catalog §C)
- `docs/architecture/AGENT_BRAIN_NAMESPACING.md` (three-substrate map)

## Intent contract

```yaml
intent: "provision-brain"
tier: "cook"
params:
  heru_name: string (from cwd's package.json or --name)
  region: string (default: "us-east-1")
```

Voice: catalog 09 §C.

## Task

Add `clara provision-brain`:

1. `packages/cli/src/commands/provision-brain.ts` — argv + `runIntent("provision-brain", { heru_name, region })`.
2. Server orchestrates (CLI never touches AWS/Neon):
   - Provision dedicated 4GB App Runner per Heru with Node + Python supervisord (combined-container pattern)
   - Provision Neon `<heru>_brain` snake-cased database
   - Wire Bedrock Titan v2 embeddings (1024-dim)
   - Configure LLM via `LLM_API_BASE` (Hermes-routed, never direct Bedrock from the brain)
   - Set up subdomain `brain-api.<heru>.claracode.ai` → App Runner default URL via Cloudflare CNAME
   - Generate `CLARA_BRAIN_API_KEY` in SSM, inject into App Runner
   - Run `cognee` initial migration to create dataset tables
3. Stream progress events:
   - `provisioning` (App Runner spinning up)
   - `db-ready` (Neon database created)
   - `subdomain-live` (CF DNS propagated)
   - `cognee-init` (dataset tables ready)
   - `live` (with the brain URL + the SSM key path for `CLARA_BRAIN_API_KEY`)
4. On `live`, also write `~/.clara/<heru>/brain.json` with `{ brain_url, ssm_key_path }` for `clara verify-brain` to pick up.

## Acceptance

- `clara provision-brain` from a Heru repo stands up the entire brain substrate end-to-end
- Time-to-live ≤ 5 minutes typical (App Runner first boot ~2-3 min)
- 403 tier_lock for Taste/Plus
- 409 if a brain already exists for this Heru — refuses to clobber, suggests `--force` (which deletes + recreates)
- `--dry-run` prints the plan + estimated cost ($/mo) without provisioning
- Tests: tier_lock, success path (mocked SSE), 409 conflict, --dry-run cost estimate
- **IP audit:** zero AWS / Neon / Cloudflare API calls in `packages/cli/`, zero connection-string templates

## Constraints

- One brain per Heru (enforced server-side via the namespace directive)
- Customer never sees `quiknation` brain endpoint — must always default to `brain-api.<heru>.claracode.ai`
- Bedrock model scope is locked to DeepSeek + Haiku (per memory `bedrock_scope_deepseek_haiku_only.md`)
- Default LLM is Gemma 4 26B MoE on Modal (per `project_gemma_4_26b_moe_canonical_choice.md`)

## Mo is watching

Per-Heru brain is the moat — every agent has its own working memory. Don't share. Don't leak across tenants. The architecture doc locked this — implement faithfully.
