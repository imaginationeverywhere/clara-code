# Implement `clara deploy frontend [--target cloudflare|amplify]`

## Role
You are **Bessie Coleman** implementing `clara deploy frontend` in `packages/cli/`. Daysha directive §B requires CF + Amplify support; CF is default.

## Read first
- 07 (Daysha §B)
- 08 (firewall)
- 09 (voice catalog §B)
- `.claude/standards/cf.md` (Cloudflare Pages standard)
- `.claude/standards/aws-deployment-standard.md` (Amplify standard)

## Intent contract

```yaml
intent: "deploy.frontend"
tier: "cook"
params:
  target: "cloudflare" | "amplify"  (default: "cloudflare")
  env: "develop" | "production"  (default: "develop")
```

Voice: catalog 09 §B.

## Task

`packages/cli/src/commands/deploy.ts` already exists for backend. Refactor:

1. Promote `deploy` to a multi-target command:
   - `clara deploy backend` (existing)
   - `clara deploy frontend --target cloudflare`
   - `clara deploy frontend --target amplify`
2. New flag-parsing: subcommand `frontend|backend` + `--target` + `--env`.
3. Both subcommands hit `intent: "deploy.<surface>"` via `runIntent`.
4. CLI receives an SSE stream of phases:
   - `building` (next build / opennextjs-cloudflare build)
   - `bundling` (CF Pages worker bundle / Amplify zip)
   - `pushing` (CF KV/R2 / Amplify CodeCommit / S3)
   - `deploying` (CF Pages deployment / Amplify pipeline)
   - `live` (with the final URL)
5. Renders Ink progress UI with the current phase + spinner.
6. On `live` event, prints "Live at <url>" and exits 0.

Server-side (gateway):
- `templates/deploy-frontend.md` orchestrates per-target build via the platform's deploy infrastructure
- All AWS / Cloudflare credentials live in SSM, not CLI
- The build itself happens on the platform's build farm, not on the user's laptop

## Acceptance

- `clara deploy frontend` (no flags) defaults to CF + develop
- `--target amplify --env production` switches both
- 403 tier_lock for Taste/Plus tiers (Cook+ only)
- Streams phase events; user sees progress
- Final `live` event prints the URL on its own line for easy copy
- Cancel (Ctrl-C) sends abort to gateway, gateway gracefully halts the deploy or rolls back
- Tests: argv parsing, tier_lock, success path, mid-deploy abort, both targets
- **IP audit:** zero AWS/CF SDK calls in `packages/cli/`, zero credentials/keys, zero deploy orchestration logic

## Constraints

- CLI never invokes `wrangler` / `aws` / `next build` directly — server orchestrates
- Each phase event is rendered with a single line (no excessive spam)
- Final URL printed UNADORNED on its own line (so users can `clara deploy frontend | tail -1` to extract it)

## Mo is watching

Daysha's site has to be deployable in one command. No "now go to the dashboard and click these 12 things."
