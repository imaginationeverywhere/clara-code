# Clara prompt queue — implementation roadmap (10–22)

**Completed specs (reference):**

- **01–02** — `3-completed/01-*.md`, `02-*.md`
- **08** — **`docs/architecture/CLARA_INTENT_GATEWAY_AND_IP_FIREWALL.md`**
- **09** — **`docs/catalog/voice-intent-catalog.yaml`** + **`scripts/audit-cli-intent-catalog.mjs`** (gateway classifier deploy still platform-owned)

Platform follow-up for **02** (SSM rename, remove `HERMES_*` fallback) remains ops-owned.

This file orders remaining prompts under `1-not-started/` by **dependency** and **team**. Gateway implementation (**`/v1/run`**, intent registry) remains **Hermes / clara-platform**.

## Status legend

- **Code** — landable in `clara-code` with PRs + tests  
- **Platform** — AWS SSM, App Runner, gateway, Modal, Clerk dashboards  
- **Product** — specs, pricing matrix, copy  

---

## Phase C — Doctor + bootstrap

| Prompt | Title | Owner | Notes |
|--------|--------|-------|--------|
| **11** | clara-doctor-real | Code | Scaffold + toolchain + probes + tier; partial: **`GET /api/v1/tier-status`**, optional **`POST /api/v1/run`** (feature flag), **`last-error.json`** replay. |
| **10** | clara-new-heru-bootstrap | Code + Templates | New Heru repo scaffolding; gateway **`intent: new`** ↔ **`clara init`** per **`voice-intent-catalog.yaml`**. |

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
| **22** | clara-existing-commands-firewall-retrofit | Code | Retrofit older commands to intent contract; extend **`voice-intent-catalog.yaml`** when adding verbs. |

---

## Suggested sequencing

1. **22** (retrofit toward **`/v1/run`**) when gateway dispatch is ready  
2. **11** (doctor) in parallel with **10**  
3. **12 → 13** then **14 → 15**  
4. **16 → 17** → **18–20** → **21**

---

## Not done in a single PR

Prompts **10–22** still require **gateway** behavior and often **AWS / Clerk** access beyond what **`clara-code`** ships.
