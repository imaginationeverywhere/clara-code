# Distribution: tag, npm, desktop, R2, Cloudflare

One Git tag (for example `v0.1.0`) is the anchor for a coordinated release. This doc lists **where** each surface is updated, **which secrets** are required in GitHub Actions, and **rollback** notes. **Never** commit secret values; store them in GitHub environment secrets, Cloudflare, or 1Password.

## Surfaces

| Step | What | How |
|------|------|-----|
| 1 | `@imaginationeverywhere/clara-voice-client` + `clara` on npm | GitHub Actions `release-on-tag` job `publish-npm` (or manual `pnpm publish` from a clean checkout) |
| 2 | macOS `.dmg` for the Tauri app | Same workflow job `build-desktop`, artifact + optional GitHub Release + optional R2 object |
| 3 | `claracode.ai` (OpenNext on Workers) | Either Cloudflare’s **Git-integrated** build (develop/main) or `wrangler deploy` in CI (see `frontend/wrangler.toml`) |

`NEXT_PUBLIC_CLARA_DESKTOP_DMG_URL` in the **frontend** build (Cloudflare build env) should point to the public HTTPS URL of the current `.dmg` (R2 public bucket, r2.dev, or `https://github.com/.../releases/download/.../file.dmg`).

## GitHub repository secrets (optional, for `.github/workflows/release-on-tag.yml`)

| Secret | Used for |
|--------|-----------|
| `NPM_TOKEN` | `npm`/`pnpm` publish to the registry; scope must include `clara` and `@imaginationeverywhere/clara-voice-client` |
| `CF_API_TOKEN` + `CF_ACCOUNT_ID` | `wrangler deploy` for the Workers + OpenNext bundle (only if you deploy from Actions instead of CF Git builds) |
| R2: `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ACCOUNT_ID`, `R2_BUCKET`, and optionally `R2_DMG_KEY` (object key, e.g. `releases/Clara-Code-0.1.0.dmg`) | `aws s3 cp` to the R2 S3 API endpoint, or `wrangler r2 object put` — **optional** if you only attach the `.dmg` to the GitHub Release and use that URL in `NEXT_PUBLIC_CLARA_DESKTOP_DMG_URL` |

`EXPO_TOKEN` is not required for the current Tauri macOS build; reserve it for future EAS jobs.

## Order of operations (recommended)

1. Bump versions in the packages you publish (at minimum `packages/clara-voice-client` and `packages/cli`) so the npm version **matches the tag** (e.g. tag `v0.1.0` → `0.1.0` in `package.json`).
2. Commit, tag: `git tag v0.1.0 && git push origin v0.1.0` (or use `node scripts/release.mjs` for the monorepo release flow, which also tags).
3. After CI finishes: set **Cloudflare** (or the Git integration env) to the new `NEXT_PUBLIC_CLARA_DESKTOP_DMG_URL` if the `.dmg` URL changed, then redeploy the site if needed.
4. Smoke: `npm install -g clara@latest`, run `clara` / `clara tui`, download the `.dmg`, open the app.

## Rollback

- **npm**: `npm unpublish` only within the unpublish window; else deprecate a bad version and publish a patch. Prefer a forward-fix `v0.1.1`.
- **Desktop**: re-point the download URL to a previous R2 or GitHub asset; users keep old `.dmg` until they replace the file.
- **Website**: roll back the Workers deployment in Cloudflare or deploy a known-good build from a prior git SHA.

## Related

- [Cloudflare + Next 16 + OpenNext](./cloudflare/NEXTJS-16-CLOUDFLARE-WORKERS-DEPLOYMENT.md) for Workers-specific steps.
- `.github/workflows/desktop-macos-dmg.yml` — branch-path CI for desktop artifacts without a tag.
- `.github/workflows/release-on-tag.yml` — full tag pipeline (npm + desktop + optional R2/CF), when secrets are set.
