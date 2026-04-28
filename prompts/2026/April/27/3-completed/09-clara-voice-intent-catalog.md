# Clara Voice Intent Catalog (MASTER)

**Authority:** Mo, 2026-04-27 evening
**Read after:** prompt 08 (architecture)
**Lives where:** spec in this repo; runtime classifier on the gateway loads from this catalog (NEVER bundled in CLI binary)

---

## Why

Users will SPEAK to Clara, not just type. Every typed command needs ≥5 natural phrasings that route to the same intent. The voice classifier matches phrasings → intent → params; the gateway runs the sealed template. Same firewall as typed.

This catalog is the source of truth. Edit here; gateway syncs from this file (or a generated artifact) on deploy. The CLI never sees the full catalog — it sends raw transcript, server classifies.

---

## Catalog format

```yaml
intent: "<intent_id>"
typed: "clara <verb> <args>"
tier: "taste" | "plus" | "cook" | "orpheus"
params:
  - name: <name>
    type: <string|number|boolean>
    required: true
    extract_pattern: <how to pull from utterance, regex or LLM extractor>
phrasings:
  - "natural phrasing 1"
  - "natural phrasing 2"
  - ...
```

---

## Section A — Heru bootstrap

```yaml
intent: "new"
typed: "clara new <heru-name>"
tier: "taste"
params:
  - name: heru_name
    type: string
    required: true
    extract_pattern: "called <heru_name> | named <heru_name> | for <heru_name>"
phrasings:
  - "Clara, start a new agent called <name>"
  - "Make a new agent for <name>"
  - "Create a Heru named <name>"
  - "Spin up a new project called <name>"
  - "I want to start building <name>"
  - "Bootstrap a new agent for <name>"
```

```yaml
intent: "doctor"
typed: "clara doctor"
tier: "taste"
phrasings:
  - "Clara, run a doctor check"
  - "Is everything healthy?"
  - "Check if my setup is good"
  - "Run diagnostics"
  - "What's broken?"
  - "Verify my install"
```

## Section B — Auth + frontend

```yaml
intent: "wire-auth"
typed: "clara wire-auth --clerk"
tier: "plus"
params:
  - name: provider
    type: string
    enum: ["clerk"]
phrasings:
  - "Clara, wire up authentication"
  - "Add Clerk to this project"
  - "Set up sign-in"
  - "Wire auth with Clerk"
  - "Add login to my agent"
  - "Connect Clerk auth"
```

```yaml
intent: "deploy.frontend"
typed: "clara deploy frontend [--target cloudflare|amplify]"
tier: "cook"
params:
  - name: target
    type: string
    enum: ["cloudflare", "amplify"]
    default: "cloudflare"
phrasings:
  - "Clara, deploy the frontend"
  - "Ship the website"
  - "Deploy to Cloudflare"
  - "Deploy frontend to Amplify"
  - "Push the site live"
  - "Get the frontend running"
```

## Section C — Backend + brain

```yaml
intent: "deploy.backend"
typed: "clara deploy backend"
tier: "cook"
phrasings:
  - "Clara, deploy the backend"
  - "Ship the server"
  - "Deploy the API"
  - "Push the backend live"
  - "Get the backend running"
```

```yaml
intent: "provision-brain"
typed: "clara provision-brain"
tier: "cook"
phrasings:
  - "Clara, provision the brain"
  - "Set up memory for this agent"
  - "Stand up the brain"
  - "Create the agent's memory"
  - "Provision per-agent memory"
```

```yaml
intent: "verify-brain"
typed: "clara verify-brain"
tier: "taste"
phrasings:
  - "Clara, check the brain"
  - "Test the brain"
  - "Is the brain working?"
  - "Run a brain query test"
  - "Verify memory works"
```

## Section D — Talents

```yaml
intent: "attach-talent"
typed: "clara attach-talent <talent-name>"
tier: "plus"
params:
  - name: talent_name
    type: string
    required: true
phrasings:
  - "Clara, attach the <name> talent"
  - "Hire <name>"
  - "Add <name> to my team"
  - "Bring in <name>"
  - "Install the <name> talent"
```

```yaml
intent: "talent.new"
typed: "clara talent new <name>"
tier: "cook"
params:
  - name: talent_name
    type: string
    required: true
phrasings:
  - "Clara, create a new talent called <name>"
  - "Author a talent named <name>"
  - "I want to make a talent called <name>"
  - "Start a new talent <name>"
```

## Section E — Gears

```yaml
intent: "gear.add"
typed: "clara gear add <gear-name>"
tier: "plus"
params:
  - name: gear_name
    type: string
    required: true
    enum: ["email-receiver-cf", "eas-attestation", "voice-clone", ...]
phrasings:
  - "Clara, add the <name> gear"
  - "Install the <name> gear"
  - "Equip <name>"
  - "Add <name> to this project"
  - "Hook up <name>"
```

## Section F — Cognitive verbs (existing)

```yaml
intent: "analyze"
typed: "clara analyze <text|@file>"
phrasings:
  - "Clara, analyze this"
  - "Take a look at this"
  - "What do you think of this"
  - "Run analysis on <topic>"
```

```yaml
intent: "think"
typed: "clara think <prompt>"
phrasings:
  - "Clara, think about <topic>"
  - "Reason through <topic>"
  - "What's your take on <topic>"
```

```yaml
intent: "critically-think"
phrasings:
  - "Clara, push back on this"
  - "Critically think about <topic>"
  - "Devil's advocate this"
```

```yaml
intent: "creative-thinking"
phrasings:
  - "Clara, brainstorm <topic>"
  - "Get creative with <topic>"
  - "What are some ideas for <topic>"
```

```yaml
intent: "truth"
phrasings:
  - "Clara, give me the truth"
  - "What's actually true about <claim>"
  - "Be straight with me about <topic>"
```

```yaml
intent: "facts"
phrasings:
  - "Clara, just the facts"
  - "What do we know about <topic>"
  - "Pull facts on <topic>"
```

```yaml
intent: "save"
typed: "clara save <key> <value>"
phrasings:
  - "Clara, remember that <statement>"
  - "Save this: <statement>"
  - "Note that <fact>"
```

```yaml
intent: "remember"
typed: "clara remember <key>"
phrasings:
  - "Clara, what did I tell you about <topic>"
  - "Remember anything about <topic>"
  - "Recall <topic>"
```

## Section G — Operations

```yaml
intent: "deploy.smoke"
typed: "clara smoke"
phrasings:
  - "Clara, run the smoke test"
  - "Test everything"
  - "End-to-end smoke"
```

```yaml
intent: "config.get"
typed: "clara config get <key>"
phrasings:
  - "Clara, what's my <key>"
  - "Show config for <key>"
```

```yaml
intent: "config.set"
typed: "clara config set <key> <value>"
phrasings:
  - "Clara, set <key> to <value>"
  - "Configure <key> as <value>"
```

```yaml
intent: "login"
typed: "clara login"
phrasings:
  - "Clara, sign me in"
  - "Log in"
  - "Connect my account"
```

```yaml
intent: "the-brain"
typed: "clara the-brain"
phrasings:
  - "Clara, ask the brain"
  - "Query memory"
  - "What does the brain know about <topic>"
```

---

## Acceptance criteria

- Catalog deployed to gateway intent classifier on every gateway release
- CLI binary contains ZERO references to phrasings (audit: `grep -E "(start a new|hire|brainstorm)" packages/cli/dist/index.js` returns nothing)
- Confidence threshold tuned per intent — low-confidence routes ask for confirmation, never silently mis-route a destructive intent (e.g., never auto-route an ambiguous phrase to `deploy.backend`)
- Every new command added in 10–22 ALSO adds its phrasings to this catalog before merge

---

## Archived (catalog landed in-repo)

**Canonical YAML:** [`docs/catalog/voice-intent-catalog.yaml`](../../../../../docs/catalog/voice-intent-catalog.yaml) — structured intents A–G; **`typed`** for `new` reflects shipped **`clara init`** (see [`docs/catalog/README.md`](../../../../../docs/catalog/README.md)).

**Audit:** [`scripts/audit-cli-intent-catalog.mjs`](../../../../../scripts/audit-cli-intent-catalog.mjs) — `npm run audit:cli-intent-catalog`.

**Platform:** Gateway classifier deploy + confidence thresholds remain Hermes/clara-platform owned.

**Moved:** `prompts/2026/April/27/3-completed/` (2026-04-27).
