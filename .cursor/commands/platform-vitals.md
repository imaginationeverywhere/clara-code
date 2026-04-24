# /platform-vitals — HQ-owned fleet health check

**Owner:** Headquarters (non-delegable). `/devops-team` may execute fixes, but `/hq` owns the check, the surfacing, and the outcome.

**Run this at:** session start, session update, session continue, session end — and any time you need ground truth on the platform.

## What it checks

Eight categories of platform vitals:

| Category | Examples |
|---|---|
| **Knowledge & Memory** | Knowledge Engine, Obsidian Publish, Vault S3, Vault Gate |
| **Voice & Agent Runtime** | Clara Voice Modal, Hermes, clara-platform-runtime |
| **Models & LLM Routing** | AWS Bedrock, Anthropic API, fallback ladder, proprietary models |
| **Infrastructure** | QC1, QCS2/QCS3 build farms, Amplify, Cloudflare, ECS Fargate, Neon |
| **Auth & Payments** | Stripe API + status, Clerk API, SSM shared secrets |
| **Customer-Facing** | claracode.ai, claraagents.com, brain.quiknation.com, admin.quiknation.com |
| **Dev Pipeline** | GitHub API, GitHub Status, git origin for current repo |
| **Comms** | Slack bot `auth.test` |

Each check returns one of: `OK` · `DEGRADED` · `DOWN` · `UNKNOWN`.

## Usage

```bash
# Human-readable (default)
.claude/scripts/platform-vitals.sh

# Force live probe (bypass 60s cache)
.claude/scripts/platform-vitals.sh --fresh

# Machine-readable
.claude/scripts/platform-vitals.sh --json

# One-line summary (for session banners)
.claude/scripts/platform-vitals.sh --quiet

# Include OK items in output
.claude/scripts/platform-vitals.sh --full
```

## Exit codes

- `0` — all OK (possibly with UNKNOWN probes)
- `1` — DEGRADED (warnings, no outages)
- `2` — DOWN (one or more systems out; **session work should pause**)

## Cache

Results cached at `~/.platform-vitals/cache.json` with 60s TTL. Multiple Herus starting together won't hammer endpoints.

## Known-broken override

HQ-maintained list at `~/.platform-vitals/known-broken.json`. Any name matching is forced to `DOWN` regardless of live probe. Format:

```json
{
  "items": [
    { "name": "Knowledge Engine", "detail": "clara-platform fixing embedding dim mismatch" }
  ]
}
```

Use this when Mo tells HQ a system is broken but a probe might pass (e.g., endpoint up but returning wrong data).

## Session command integration (MANDATORY)

These session commands MUST call `/platform-vitals` and surface the result before finishing:

- `/session-start` — run `--fresh`, block queued work if `DOWN`
- `/session-update` — run (cached ok), show summary in banner
- `/session-continue` — run, include JSON snapshot in checkpoint
- `/session-end` — run, flag DOWN in exit report

## When DOWN is reported

1. HQ surfaces the DOWN item immediately to the user.
2. HQ decides: fix inline (if in HQ lane + fast) OR dispatch a directive to `/devops-team`.
3. If delegated: HQ remains accountable. Re-run `/platform-vitals --fresh` until resolved.
4. Any DOWN is a **highest-priority blocker**. No other queued work proceeds until it's acknowledged or triaged.

## Heru fleet deployment

Propagate to all Herus via:
```bash
/sync-herus --commands --scripts --push
```

## Roadmap (probes not yet implemented — flagged UNKNOWN today)

- Hermes Agent Runtime health endpoint (after cp-team scaffolds)
- Clara Platform Runtime memory-discipline layer
- Per-provider fallback ladder probes (Cerebras, Groq, SambaNova, Gemini, OpenRouter)
- Proprietary model training status (mary-bethune, maya-angelou, nikki-giovanni)
- Cloudflare Worker deploy status
- ECS Fargate cluster enumeration
- Per-Heru Neon Postgres connection health

Add probes as infrastructure matures. Never silently drop the UNKNOWN row — it is the reminder to close the gap.

## Why HQ owns this

Mo's directive (2026-04-24): _"This is all on /hq you own this... when any system is down it is of the highest priority it is a blocker you can delegate to the /devops-team if it is appropriate but it still falls as /hq responsibility."_

Memory: `feedback-hq-owns-platform-vitals.md`, `decision-platform-vitals-on-every-session-command.md`.
