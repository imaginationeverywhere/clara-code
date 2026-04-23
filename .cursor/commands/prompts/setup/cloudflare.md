# Template: Deploy — Cloudflare (Step 8 alt)

## Role

**Primary:** DevOps · **Secondary:** Frontend

## Goal

**Cloudflare Pages / Workers** deployment path: `frontend/wrangler.toml`, OpenNext or Workers build, env vars in dashboard, preview vs production branches — per `.claude/standards/cf.md` when present.

## Constraints

- Secrets in CF dashboard — not committed.
- `NEXT_PUBLIC_*` pulled from SSM before build in CI where applicable.

## Acceptance

- [ ] Preview (`develop`) vs prod (`main`) mapping documented
- [ ] AI Gateway / Workers only if in scope (separate command: `/setup-ai-gateway`)
