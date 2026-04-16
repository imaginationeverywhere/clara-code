# /migrate-amplify-to-cf — Amplify → Cloudflare (Workers) + DNS migration

Migrate an existing **Next.js Heru** from **AWS Amplify** to **Cloudflare Workers** (OpenNext), and move **DNS authority** from **Route53** to **Cloudflare** with a documented rollback path.

**Sister command:** `/cloudflare-workers-setup … --from-amplify` — use that for worker naming, `wrangler.toml`, and frontend wiring. **This command** is the **end-to-end playbook**: snapshots, DNS cutover, validation, cleanup, and rollback semantics.

**Canonical docs:** `docs/cloudflare/AMPLIFY-TO-CLOUDFLARE-MIGRATION.md` (narrative) · `docs/cloudflare/NEXTJS-CLOUDFLARE-WORKERS-DEPLOYMENT.md` (technical standard).

---

## Usage

```
/migrate-amplify-to-cf <domain>                    # Full migration: inventory → frontend → DNS → cutover
/migrate-amplify-to-cf <domain> --dry-run          # Print every step and command; no AWS/CF/registrar changes
/migrate-amplify-to-cf <domain> --frontend-only # Phases A–B only (no nameserver change)
/migrate-amplify-to-cf <domain> --dns-only      # Phases A + C–D (assume Worker already in prod path)
/migrate-amplify-to-cf <domain> --rollback       # Restore Amplify + Route53 from last snapshot (see below)
```

**Examples:** `imworldcupready.com`, `develop.imworldcupready.com` as preview — always pass the **apex** or primary production hostname’s registrable domain for inventory/DNS unless the prompt specifies otherwise.

---

## Preconditions

- AWS CLI configured (`aws sts get-caller-identity`).
- Access to **Amplify** app + **Route53** hosted zone for the domain (or read-only inventory if `--dry-run`).
- **Wrangler** authenticated (`wrangler whoami`); Cloudflare account with permission to create zones and manage DNS.
- **Registrar** access to change nameservers (if full migration).
- Snapshot directory writable: `docs/migrations/<domain>/` (created on first run).

---

## Phase A — Pre-flight (read-only)

### Step 1 — Inventory current state

- List Amplify apps; find app tied to this domain: `aws amplify list-apps`, `aws amplify get-app --app-id <id>`, branch env vars, redirects, custom headers.
- Export Route53 hosted zone records: `aws route53 list-hosted-zones-by-name`, then `aws route53 list-resource-record-sets --hosted-zone-id <id>`.
- Save JSON snapshot: `docs/migrations/<domain>/amplify-snapshot.<ISO8601>.json` (Amplify metadata + Route53 `ResourceRecordSets`).

**Never** delete or mutate Route53 in Phase A.

### Step 2 — Cloudflare zone

- `wrangler whoami`; note account ID.
- If zone missing: create zone in dashboard or API; confirm nameservers assigned.

### Step 3 — SSL

- For Cloudflare **proxied** orange-cloud records, Universal SSL applies once the zone is active on Cloudflare nameservers. Document **Full (strict)** when origin is known.

---

## Phase B — Frontend migration

Align with **`/cloudflare-workers-setup <worker> <domain> [preview] --from-amplify`**:

- `frontend/wrangler.toml`, OpenNext build, `next.config` per `docs/cloudflare/NEXTJS-CLOUDFLARE-WORKERS-DEPLOYMENT.md`.
- Secrets: `wrangler secret put` (never commit secrets).

### Step 4 — Adapt Next.js for Workers

- Implement or verify Worker config; pin Next/webpack per platform decisions in-repo.

### Step 5 — Deploy preview Worker

- Deploy preview: `wrangler deploy` with preview name/route (e.g. `*.workers.dev` or `develop.<domain>` on CF).

### Step 6 — Validate preview

- Smoke: auth, key flows, payments if applicable. **Block** nameserver change if failing.

---

## Phase C — DNS cutover

### Step 7 — Pre-create CF DNS records

- From Route53 export, create equivalent records on Cloudflare (respect MX/TXT for mail + verification).

### Step 8 — Reconcile

- Compare CF UI/API import vs Route53; fix drift.

### Step 9 — Nameservers (irreversible for “who serves DNS”)

- At registrar, replace NS with Cloudflare’s assigned **only** after Phase B passes.

### Step 10 — Propagation

- Wait for `dig @8.8.8.8 NS <domain>` to show Cloudflare NS (often 5–60+ minutes).

---

## Phase D — Production + cleanup

### Step 11 — Promote Worker to production

- Route apex/`www` to Worker routes or DNS as per OpenNext + zone setup.

### Step 12 — Disable Amplify auto-builds

- Disable branch deploys (do **not** delete app for 7 days). Write `docs/migrations/<domain>/cutover.md` with Amplify app ID, final SHA, CF zone ID, rollback notes.

---

## `--dry-run`

For every step, emit:

1. Intended AWS/CF/registrar **command** (redact secrets).
2. **Skip** any mutation: no `aws route53 change-resource-record-sets`, no registrar NS updates, no `wrangler deploy` (optional: allow `wrangler deploy --dry-run` if supported).

---

## `--rollback`

Requires **latest** `docs/migrations/<domain>/amplify-snapshot.*.json`.

1. Re-enable Amplify branch builds; redeploy last known good if needed.
2. At registrar, set NS back to Route53 delegation (from snapshot).
3. Restore Route53 records from snapshot via `change-resource-record-sets` batches (test in `--dry-run` first if tooling supports it).
4. Wait for DNS propagation; verify Amplify URL still serves.
5. **Manual rollback:** If automation fails, follow `docs/cloudflare/AMPLIFY-TO-CLOUDFLARE-MIGRATION.md` § Manual rollback.

---

## Idempotency

- Re-running after success should **no-op** or warn (detect CF zone + CF-serving traffic).
- Re-running mid-flight should **resume** from last completed phase using snapshot + `cutover.md` state.

---

## Related

- `/cloudflare-workers-setup` — Worker scaffolding
- `/pickup-prompt --migrate-amplify-to-cf` / `/queue-prompt --migrate-amplify-to-cf` — template injection
- `docs/migrations/README.md` — migration index
