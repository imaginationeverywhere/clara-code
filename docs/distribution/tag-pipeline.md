# Tag-driven release pipeline (sketch)

**TARGET REPO:** `imaginationeverywhere/clara-code`

## Intent

A tag like `v0.2.0` should, in order:

1. **Build and publish** npm packages that ship on the public registry, including at minimum `clara` and `@clara/cli` (and any other published workspaces from the same version line).
2. **Build** `desktop/` (Tauri) and upload the `.dmg` to R2; emit or update a pointer URL in Cloudflare/SSM.
3. **Build and deploy** `frontend/` to Cloudflare Workers (OpenNext / `wrangler deploy` or project-specific workflow).

## GitHub Actions (outline)

- **Trigger:** `push: tags: ['v*']` and optional `workflow_dispatch` with a version input.
- **Permissions:** `contents: read`, `id-token` if using OIDC to R2, npm token from org secrets.
- **Jobs (example):** `test` (required) → `npm-publish` (uses `NPM_TOKEN`) → `build-desktop` (macOS runner, caches Rust) → `upload-dmg` → `deploy-frontend` (Node + Wrangler secrets).

## Secrets (never in the repo)

- `NPM_TOKEN` — `Automation` token for publishing.
- R2: account id, access key, bucket, public base URL.
- `frontend`: same env pattern as in `frontend/.env.example` and Wrangler dashboard.

Tighten the graph once the first tag release is run manually and the gaps are known.
