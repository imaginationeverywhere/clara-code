# Distribution — tag → npm + desktop + website + binaries

**TARGET REPO:** `imaginationeverywhere/clara-code`  
**Issued from:** `prompts/2026/April/23/3-completed/02-clara-code-team-directive-cli-ide-conversation.md`  
**Priority:** 4 (after all three surfaces are green locally)

## Goal

- GitHub Actions: on **`v*.*.*` tag**, run pipeline that:
  - Publishes **`clara`** to npm (and any workspace packages per release policy)
  - Builds **desktop** artifacts and uploads to R2 (or release assets)
  - Deploys **frontend** to Cloudflare
- One tag updates **CLI + IDE + website** in a predictable order with rollback notes.

## Acceptance

- Document required secrets (`NPM_TOKEN`, `EXPO_TOKEN` if EAS used elsewhere, CF API tokens, R2 credentials) in `docs/` or internal runbook only — no secret values in repo.

## References

- `prompts/2026/April/21/1-not-started/04-distribution-pipeline.md` (merge or dedupe)
- `.github/workflows/`
