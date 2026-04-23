# Desktop: Tauri, `.dmg`, and R2 (Clara Code IDE)

**TARGET REPO:** `imaginationeverywhere/clara-code` · **dir:** `desktop/`

## Goals

- macOS `.dmg` (and later Windows `.exe`) for the Tauri v2 app described in [desktop/README.md](../../desktop/README.md).
- **Artifacts** uploaded to **Cloudflare R2** (or S3) with a stable URL (or versioned path) for `claracode.ai` to link in the [Install](../frontend/src/components/marketing/InstallSection.tsx) section.
- Reuse the same voice path as the CLI by depending on or mirroring patterns from `packages/clara-voice-client` in the static shell (see `build.frontendDist` in `tauri.conf.json`).

## Build (local, QCS1, or GitHub hosted runner)

1. From `desktop/`: `npm ci && npm run build` (Tauri + embedded `shell/`).
2. Collect the platform output under `src-tauri/target/…` and package `.dmg` per Tauri’s bundler.
3. Upload the artifact to R2; store the object key pattern in SSM/Wrangler, not in git.

## Site integration

- Add a **Download** (or `id="download"`) anchor in the marketing install section; link to the latest R2/HTTPS path after upload.
- Keep “Coming Soon” until a signed build and upload URL are ready.
