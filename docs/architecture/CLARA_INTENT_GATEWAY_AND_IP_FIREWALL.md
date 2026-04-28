# Clara intent gateway + command IP firewall (architecture lock)

**Status:** Ratified for `clara-code` + Hermes / **clara-platform** handoff  
**Source prompt (archived):** [`prompts/2026/April/27/3-completed/08-clara-command-ip-firewall-architecture.md`](../../prompts/2026/April/27/3-completed/08-clara-command-ip-firewall-architecture.md)  
**Read before:** prompts **09** (voice intent catalog), **22** (command retrofit), and any new `clara <verb>` that talks to the LLM.

This document is the **repo canon** for how Clara keeps **prompt templates and routing logic off the client**, matching the Claude Code slash-command model: the binary is a **thin actuator**; the **gateway** owns templates, brain retrieval, model choice, tier gates, and post-processing.

---

## 1. Principle

| Ships in the public CLI / IDE / voice client | Stays server-side (gateway + brain) |
|---------------------------------------------|-------------------------------------|
| Command name and argv parsing | Prompt templates for each intent |
| HTTP dispatch: `intent`, `params`, `surface` | Brain context retrieval |
| Applying returned patches / stdout to disk | Model selection per intent |
| Reading `tier` / minutes from API responses | Diff/post-processing that builds the patch |
| User-facing error strings (mapped) | Cost and tier enforcement logic |

**Forbidden in client source** (enforced by review + future `scripts/audit-cli-ip.sh`):

- Prompt template prose for product commands
- Hardcoded **product** model IDs used to drive command behavior (instrumentation test fixtures may use sandbox IDs in tests only)
- Brain SQL / query construction
- Raw HTTP status strings surfaced to users (`claraHttpErrorMessage` and cousins only)

> **Note:** `backend/src/lib/ip-firewall.ts` is the **agent output** firewall (sanitization of model names / internal URLs in agent replies). That is complementary; **this doc** is about **command / intent** IP and gateway boundaries.

---

## 2. Target runtime diagram

```
USER          CLI / IDE / VOICE              GATEWAY (Hermes)          LLM + BRAIN
────          ─────────────────              ────────────────          ───────────
"clara …"     parse argv → intent + params
              POST /v1/run                 →  registry lookup
              { intent, surface, params,     template fill + brain
                context }                   →  LLM / tools
                                          ←  { ok, diff, minutes, … }
              apply diff locally
```

Voice:

1. ASR → text  
2. **Server-side** classifier: text + context → `{ intent, params, confidence }`  
3. Same `/v1/run` path as typed commands when confidence is high enough; otherwise clarify with the user.

The **phrasing → intent** catalog is a **product/gateway asset**; the client may send **raw transcript** only — not the full mapping table for production bundles.

---

## 3. Wire contract (normative)

### 3.1 Request

`POST ${gatewayBase}/v1/run` with `Authorization: Bearer …` (session or API key as product defines).

```json
{
  "intent": "new",
  "surface": "cli",
  "params": {},
  "context": {
    "cwd": "/path/to/repo",
    "git_remote": "https://github.com/org/repo.git",
    "active_files": [],
    "user_prefs": {}
  }
}
```

- **`intent`:** stable string ID agreed with the **gateway intent registry** (e.g. `new`, `wire-auth`, `deploy.frontend`).
- **`surface`:** `cli` | `ide` | `voice` (extend only with versioning).
- **`params`:** intent-specific; document JSON Schema per intent in prompt **09** / gateway registry.
- **`context`:** best-effort client facts; never secrets in plain JSON.

### 3.2 Success response (illustrative)

```json
{
  "ok": true,
  "diff": [{ "path": "README.md", "op": "update", "content": "..." }],
  "stdout_lines": [],
  "minutes_remaining": null,
  "next_suggestions": []
}
```

### 3.3 Errors

Reuse existing HTTP semantics and bodies: **`tier_lock`**, **`minutes_exhausted`**, and mapped messages per `packages/cli/src/lib/http-errors.ts` (and IDE mirrors). Clients **render**; they do **not** invent tier outcomes.

---

## 4. Implementation map (who owns what)

| Capability | Owner | Repo / surface |
|------------|--------|----------------|
| Intent registry (`intent` → template, tier, retrieval) | **clara-platform / Hermes** | Gateway service |
| `POST /v1/run` implementation | **Gateway** | Hermes host behind `CLARA_GATEWAY_URL` |
| **`POST /api/v1/run`** compatibility stub / BFF | **clara-code backend** | `backend/src/routes/v1.ts` — returns **`501` `intent_gateway_pending`** until gateway wires dispatch |
| Thin CLI dispatcher (`runIntent` → HTTP) | **clara-code** | Planned: `packages/cli/src/lib/intent-dispatch.ts`; until then per-command `fetch` |
| **`clara doctor`** tier / optional run probe | **clara-code** | Backend **`GET /api/v1/tier-status`**, optional **`POST /api/v1/run`** via **`CLARA_FEATURE_INTENT_DISPATCH`** |
| Voice classifier | **Gateway** (Phase 0+) | Not in thin client |
| **`scripts/audit-cli-ip.sh`** | **clara-code** | TODO: grep `dist/` for forbidden patterns in CI |

---

## 5. Gateway alignment checklist (platform + gateway team)

Use this before declaring “intent dispatch live” for customers.

1. **Route parity** — Production traffic uses **`POST …/v1/run`** on the **public gateway host** with the JSON shape in §3. Confirm whether **App Runner** exposes **`/api/v1/run`** only (BFF) and whether edge **rewrites** `/v1/run` → backend or forwards to Hermes directly.
2. **Registry** — Gateway has authoritative **`intent` → { template, tier, model_policy }**; templates are **not** present in `clara` npm tarball.
3. **Auth** — Same Bearer model as existing Clara API keys / Clerk session; no user JWT embedded in `context` from untrusted clients without signing.
4. **Tier / minutes** — Enforcement server-side only; **`GET /v1/tier-status`** (or **`GET /api/v1/tier-status`** on backend) stays consistent with billing DB.
5. **Voice** — Classifier deploys **server-side**; STT client sends audio/transcript to controlled endpoints only.
6. **Deprecation** — Remove **`intent_gateway_pending`** path once **`/v1/run`** returns real payloads end-to-end.
7. **Audit** — Run **`audit-cli-ip.sh`** on release artifacts; block release on new forbidden strings.

---

## 6. clara-code backlog (engineering)

1. Add **`runIntent()`** helper posting to resolved gateway **`/v1/run`** with shared error mapping.
2. Refactor command modules under **`packages/cli/src/commands/`** to parsing + **`runIntent`** only (incremental; prompt **22**).
3. Implement **`scripts/audit-cli-ip.sh`** and wire into **`npm run check`** or release CI.
4. Keep **`docs/backend-rest-api.md`** in sync with **`/api/v1/*`** stubs until gateway absorbs traffic entirely.

---

## 7. References

- `docs/catalog/voice-intent-catalog.yaml` — voice + typed intent IDs, phrasings for gateway classifier (**prompt 09**)
- `docs/backend-rest-api.md` — **`GET /api/v1/tier-status`**, **`POST /api/v1/run`**
- `packages/cli/src/lib/http-errors.ts` — user-facing error mapping
- `packages/cli/src/lib/gateway.ts` — default gateway base (`CLARA_GATEWAY_URL`)
- `backend/src/lib/ip-firewall.ts` — agent reply sanitization (distinct from command IP)
- `prompts/2026/April/27/1-not-started/IMPLEMENTATION-ROADMAP.md` — sequencing for **09–22**
