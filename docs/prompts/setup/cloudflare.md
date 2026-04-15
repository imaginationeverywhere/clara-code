# Deploy — Cloudflare (Step 8 alt)

## What it does

**Cloudflare Pages / Workers** deployment for frontend or edge logic; pairs with `wrangler` and OpenNext patterns.

## Default behavior

Secrets in CF dashboard; preview branches on `develop`; production on `main` + custom domain.

## Customization options

Also see **`--cf`** in `/pickup-prompt` for the Cloudflare Pages integration standard.

## Example queue command

`/queue-prompt --cloudflare "Wire workers AI gateway route behind feature flag"`

## Example pickup command

`/pickup-prompt --cloudflare`

## Output location

`frontend/wrangler.toml`, Workers package, env documentation.

## Agent ownership

**DevOps** + **Frontend** (for edge bindings).

## Related

- [aws-deploy.md](aws-deploy.md)
- `docs/cloudflare/NEXTJS-CLOUDFLARE-WORKERS-DEPLOYMENT.md`
