# Clara prompt queue — implementation roadmap (08–22)

**Phase A (prompts 01–02)** is **complete** (code-side). Source files: `3-completed/01-fix-ci-redness-and-tts-auth.md`, `3-completed/02-fix-backend-hermes-env-rename.md`. Platform follow-up for **02** (SSM rename, remove `HERMES_*` fallback) remains ops-owned.

This file orders the prompts under `1-not-started/` by **dependency** and **required owning team**. Full delivery spans multiple sprints; treat **08** as the architecture gate for **09** and **22**.

## Status legend

- **Code** — landable in `clara-code` with PRs + tests  
- **Platform** — AWS SSM, App Runner, gateway, Modal, Clerk dashboards  
- **Product** — specs, pricing matrix, copy  

---

## Phase B — Architecture lock (read before building commands)

| Prompt | Title | Owner | Notes |
|--------|--------|-------|--------|
| **08** | clara-command-ip-firewall-architecture | Product / Architect | **MASTER**: intents on gateway; CLI is dumb dispatcher; no prompt IP in binary. Informs **09** and **22**. |

---

## Phase C — Voice + intents + doctor + bootstrap

| Prompt | Title | Owner | Notes |
|--------|--------|-------|--------|
| **09** | clara-voice-intent-catalog | Product + Gateway | Server-side phrasing → intent map; pairs with **08**. |
| **11** | clara-doctor-real | Code | Scaffold + toolchain + probes + tier; partial: **`GET /api/v1/tier-status`**, optional **`POST /api/v1/run`** (feature flag), **`last-error.json`** replay. |
| **10** | clara-new-heru-bootstrap | Code + Templates | New Heru repo scaffolding; may depend on gateway **`intent: new`**. |

---

## Phase D — Auth, deploy, brain

| Prompt | Title | Owner | Notes |
|--------|--------|-------|--------|
| **12** | clara-wire-auth-clerk | Code | Clerk wiring across CLI/IDE/web as specified. |
| **13** | clara-deploy-frontend | Platform | Hosting pipeline (e.g. Amplify / Pages). |
| **14** | clara-provision-brain | Platform + Gateway | Brain provisioning flow. |
| **15** | clara-verify-brain | Code + Ops | Verification / health checks against brain URL. |

---

## Phase E — Talents + gear + firewall retrofit

| Prompt | Title | Owner | Notes |
|--------|--------|-------|--------|
| **16** | clara-attach-talent | Code + Backend | Harness attach API / UX. |
| **17** | clara-talent-new | Code + Marketplace | New talent authoring flow. |
| **18** | clara-gear-add-namespace-and-email-receiver | Code | Namespace + inbound email as specified. |
| **19** | clara-gear-eas-attestation | Code + Apple/EAS | Mobile/EAS pipeline. |
| **20** | clara-gear-voice-clone | Code + Voice | Voice clone gear; overlaps backend voice routes. |
| **21** | clara-daysha-end-to-end-smoke | QA | E2E smoke after C–E milestones. |
| **22** | clara-existing-commands-firewall-retrofit | Code | Retrofit older commands to **08** intent contract. |

---

## Suggested sequencing

1. **08** (read-only / doc lock for team)  
2. **09** (intent catalog) then **22** (retrofit)  
3. **11** (doctor) in parallel with **10** once gateway endpoints exist  
4. **12 → 13** then **14 → 15**  
5. **16 → 17** → **18–20** → **21**

---

## Not done in a single PR

Prompts **08–22** require **gateway (`/v1/run`, tier-status, intent templates)** and often **AWS / Clerk** access. Track each prompt as its own epic with acceptance criteria from the prompt file.
