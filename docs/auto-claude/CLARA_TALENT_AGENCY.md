# Clara Talent Agency — Architecture & Business Model

**Version:** 1.0.0
**Date:** 2026-04-14
**Owner:** Amen Ra Mendel (CTO & Co-Founder)
**Status:** CANONICAL

---

## What Is the Clara Talent Agency

The **Clara Talent Agency** (`talent.claracode.ai`) is Clara Code's curated marketplace for Talents and packages. It is the single distribution point for:

1. **Talents** — voice-native capabilities built by the community and by Clara
2. **Packages** — gated npm packages from Clara's private registry (`@claracode/*`)

The name is intentional and layered:
- *Talent agency* (entertainment) — represents talent, curates who gets in, connects creators to opportunity, takes a commission
- *Agent* (AI) — every developer on Clara Code is building agents; the Agency powers those agents

---

## Talents — Definition

A **Talent** is a packaged capability unit that combines voice commands with tools, skills, or both. The voice commands component is always present — without it, it's an API, not a Talent.

| Composition | Example |
|---|---|
| Tool + voice commands | GitHub PR manager — "show my open PRs" |
| Skill + voice commands | Code reviewer — "review this function" |
| Tool + Skill + voice commands | Linear workflow — "triage my sprint tickets" |

### Talents Are API Calls — IP Protection by Architecture

**Talent code never runs inside Clara Code or the user's machine.** A Talent developer runs a GraphQL subgraph on their own server. Clara's federation gateway routes voice-triggered requests to that subgraph server-to-server. The developer's implementation is never exposed, downloaded, or decompilable.

```
User speaks voice command
    → Clara identifies active Talent
    → Clara federation gateway calls Talent's GraphQL subgraph (server-to-server)
    → Talent's server resolves the request (developer's IP, their infra)
    → Response returned through federation
    → Clara speaks result to user
    → Developer earns a usage event (if paid Talent)
```

### Isolation — CRITICAL

Third-party Talent developers **never have direct access to subscribing developers.** Clara's backend mediates every call:
- Talent developer receives: voice command context + Clara service token + scoped data Clara chooses to pass
- Talent developer NEVER receives: subscriber API key, subscriber identity, subscription tier, or platform data
- Subscribing developer NEVER sees: the Talent vendor's server URL, schema, or implementation

---

## GraphQL Federation Architecture

Clara Code runs an **Apollo Federation supergraph gateway**. Every approved Talent developer publishes a GraphQL subgraph running on their own server. The gateway composes all approved subgraphs into one unified schema.

```
Clara Federation Gateway (api.claracode.ai/graphql — supergraph)
├── Clara Core Schema      (voice, agents, ask, stream — first-party)
├── Talent A Subgraph  →   talent-a-vendor.com/graphql
├── Talent B Subgraph  →   talent-b-vendor.com/graphql
└── Talent N Subgraph  →   talent-n-vendor.com/graphql
```

**Subscribing developer experience:** ONE endpoint, ONE API key, infinite capabilities. They query `api.claracode.ai/graphql` — the gateway routes to the correct Talent subgraph transparently. They never change their connection code when adding a new Talent.

This is GraphQL Federation's original promise extended across company boundaries — not just internal microservices, but a cross-company, third-party, marketplace-driven graph.

---

## Clara Developer Program

**$99/year** to register as a Talent developer. Pays for:

- Access to `@claracode/marketplace-sdk` (Marketplace SDK)
- Ability to register a GraphQL subgraph with the federation gateway
- Ability to submit Talents for Clara's approval
- Developer dashboard: install counts, revenue analytics, usage metrics
- Developer portal at `developers.claracode.ai`
- Billing infrastructure — Clara handles all subscriber payments; developer just sets their price

### What the Marketplace SDK Provides

`@claracode/marketplace-sdk` — distributed through the Clara Talent Agency private registry:
- Voice command manifest schema (declare what voice phrases trigger this Talent)
- Subgraph registration tooling (register your GraphQL endpoint with Clara's gateway)
- Auth handshake utilities (verify Clara service tokens on incoming requests)
- Review submission CLI (`clara-talent submit`)

---

## Talent Pricing & Commission

| Type | Price | Clara Commission | Developer Gets |
|---|---|---|---|
| Free Talent | $0 | 0% | Full goodwill, install analytics |
| Paid Talent | Developer-set | **15%** | **85%** |

**"We are not greedy."** — Amen Ra. 15% is a values statement. Apple charges 30%. Clara charges 15%. Talent creators keep 85% of every dollar their work earns.

A significant portion of Talents in the marketplace will be free — from Clara (first-party), from open-source contributors, and from developers building reputation before monetizing.

---

## First-Party Free Talents (Clara Publishes)

These bootstrap the marketplace and serve as reference implementations:

| Talent | Purpose | SDK Required |
|---|---|---|
| `@claracode/talent-clerk-auth` | User authentication for Talent developers | `@claracode/marketplace-sdk` |
| `@claracode/talent-gateway-connect` | Standard Clara gateway integration helper | `@claracode/marketplace-sdk` |
| `@claracode/talent-stripe-billing` | Payment handling boilerplate | `@claracode/marketplace-sdk` |
| `@claracode/talent-voice-utils` | Voice command parsing utilities | `@claracode/marketplace-sdk` |

---

## Private npm Registry

Clara Code operates a private npm registry at `registry.claracode.ai` (Verdaccio). Scoped packages under `@claracode/` are served from this registry. Public npm packages are proxied transparently.

**Authentication:** Clara Code account credentials (Clerk). Package access is gated by subscription tier and/or Developer Program membership.

```bash
# One-time setup for subscribers
npm login --registry https://registry.claracode.ai

# Install gated packages
npm install @claracode/sdk          # requires active subscription
npm install @claracode/marketplace-sdk  # requires $99/yr Developer Program
```

---

## Marketplace Approval Process

All Talents go through Clara's review before listing. Review focuses on:
1. **Voice security** — no voice injection attack vectors; manifests declare exact command patterns
2. **API contract** — subgraph schema follows Clara's federation standards
3. **No data leakage** — Talent does not store or transmit subscriber identity

Approved Talents receive the **"Clara Certified"** badge on their marketplace listing.

---

## Two SDKs — Do Not Confuse

| SDK | Package | Access | Purpose |
|---|---|---|---|
| End-User SDK | `@claracode/sdk` | API key + subscription | BUILD apps that use Clara voice/agents |
| Marketplace SDK | `@claracode/marketplace-sdk` | $99/yr Developer Program | BUILD Talents for the Agency |

---

## Related Documents

- `docs/internal/PRODUCT_PRD.md` — Subscription tiers, pricing, voice exchange definition
- `docs/internal/MVP_PROGRESS.md` — Current build state
