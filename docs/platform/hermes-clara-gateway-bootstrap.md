# Hermes + Clara gateway — bootstrap (operator checklist)

This repository (`clara-code`) contains the marketing app, API routes, and monorepo packages. The **Hermes gateway runtime**, Modal deploy artifacts, and `~/.hermes/agents/clara/` layout live in the **Hermes** codebase and operator environments — not in this repo.

Use this checklist when executing the full “Clara live on Hermes” plan (see archived prompt `prompts/2026/April/19/3-completed/04-hermes-clara-setup.md`).

## Architecture (reference)

| Layer | Platform |
| --- | --- |
| Voice STT/TTS | Modal (`CLARA_VOICE_URL` / voice server paths) |
| LLM (agent runtime policy) | AWS Bedrock (e.g. DeepSeek — model IDs per your org) |
| Agent harness | Hermes (`hermes-agent` or successor repo) |
| Public gateway domain | `claraagents.com` (target) |

## Prerequisites (run locally before changing production)

```bash
# Voice server health
curl -fsS "https://info-24346--clara-voice-server-voiceserver-fastapi-app.modal.run/health"

# AWS identity (Bedrock access as required by your org)
aws sts get-caller-identity

# Hermes / gateway repo
gh repo view imaginationeverywhere/hermes-agent
```

If any step fails, stop and fix credentials or service availability before deploying.

## Where code lives

- **Clara Code (this repo):** web UI, `frontend/src/app/api/voice/*`, backend voice routes, Stripe, onboarding.
- **Hermes agent + gateway:** separate repository; deploy to Modal (or your chosen host) per that project’s README.
- **Operator machine:** `~/.hermes/agents/clara/SOUL.md`, `config.yaml`, and `~/auset-brain/` paths as defined in your Hermes install — not committed here.

## Environment variables (Hermes side — illustrative)

Use AWS SSM or your secret manager; do not commit secrets.

- `CLARA_STT_URL`, `CLARA_TTS_URL` — Modal voice endpoints
- `AWS_REGION`, Bedrock model identifiers
- `GATEWAY_SECRET`, webhook verification
- `LIVE_FEED_PATH` — if logging to `~/auset-brain/Swarms/live-feed.md`

## clara-code integration points

- Marketing and dashboard call **Next.js** proxies under `/api/voice/*` (TTS, greet, clone) so the Modal base URL is not exposed in client bundles.
- Backend Express routes under `/api/voice` require auth or API keys per route; keep parity with abuse/rate-limit policies when adding gateway traffic.

## Completion criteria (platform)

“Done” means: webhook → Hermes → Bedrock → TTS audio URL (or stream) → activity logged per your Hermes implementation — verified in staging before production DNS.
