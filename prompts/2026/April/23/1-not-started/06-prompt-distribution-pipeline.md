# Prompt — tag-driven distribution (CLI + desktop + site)

**TARGET REPO:** `imaginationeverywhere/clara-code`

## Goal

- One **Git tag** (e.g. `v1.0.0`) → npm publish (CLI + `clara` if split), Tauri build(s), R2 upload, `frontend` Workers deploy. Document in `docs/distribution/pipeline.md`.
- Reuse or extend existing workflows; ensure secrets (npm token, R2, CF) via GitHub org settings, not in repo.
- **Depends on:** `03-`, `04-`, `05-` in meaningful order; can stub with dry-runs first.
