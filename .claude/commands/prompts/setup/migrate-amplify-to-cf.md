# Template: Migrate Amplify → Cloudflare (`--migrate-amplify-to-cf`)

## Role

**Primary:** DevOps / Platform · **Secondary:** Frontend

## Goal

Execute the **Amplify → Cloudflare Workers** migration for domain **`DOMAIN`** (substitute from command args), including Route53 → Cloudflare DNS cutover, **without** skipping snapshots or rollback documentation.

## Mandatory execution

The agent MUST follow **`.claude/commands/migrate-amplify-to-cf.md`** and **`docs/cloudflare/AMPLIFY-TO-CLOUDFLARE-MIGRATION.md`** in full. Use **`/cloudflare-workers-setup`** for Worker scaffolding where applicable.

## Flags (from user prompt)

- `--dry-run` — no mutating AWS/CF/registrar calls
- `--frontend-only` — stop before nameserver change
- `--dns-only` — DNS phases only (Worker must already be validated)
- `--rollback` — restore from snapshot

## Deliverables

- `docs/migrations/<domain>/amplify-snapshot.<timestamp>.json`
- `docs/migrations/<domain>/cutover.md` on success
- Live feed line on completion (`~/auset-brain/Swarms/live-feed.md`) when applicable

## Acceptance

- [ ] Snapshot exists before any destructive DNS change
- [ ] Preview validated before NS cutover
- [ ] Rollback path documented
