# Clara catalogs

## Voice intent catalog (`voice-intent-catalog.yaml`)

**Purpose:** Source of truth for **intent IDs**, **typed CLI equivalents**, **tier hints**, **params**, and **≥5 spoken phrasings** per intent so voice and typed flows converge on the same **`POST /v1/run`** contract.

**Runtime:** The gateway voice classifier loads this catalog (or a build artifact produced from it). **`packages/cli/` must not embed catalog phrasing strings** for routing — see **`scripts/audit-cli-intent-catalog.mjs`**.

**Authority:** Prompt **`09-clara-voice-intent-catalog`** (`prompts/2026/April/27/3-completed/`). Architecture firewall: **`docs/architecture/CLARA_INTENT_GATEWAY_AND_IP_FIREWALL.md`**.

**Editing:** Add intents here before merging new `clara <verb>` commands; gateway team regenerates classifier weights / rules from this file on deploy.

### Commands

```bash
# After editing the catalog or CLI copy — fails if a catalog phrase appears in CLI TypeScript sources
node scripts/audit-cli-intent-catalog.mjs
```

Optional npm script: `npm run audit:cli-intent-catalog` (repo root).
