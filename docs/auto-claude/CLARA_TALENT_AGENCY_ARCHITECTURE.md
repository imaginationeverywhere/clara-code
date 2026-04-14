# Clara Talent Agency — Full System Architecture

**Version:** 1.0.0
**Date:** 2026-04-14
**Author:** Carruthers (Tech Lead, Clara Code)
**Status:** HQ APPROVED — use this as the single source of truth for all build work

**Related docs:**
- `docs/internal/CLARA_TALENT_AGENCY.md` — Business model, pricing, commission
- `docs/internal/PRODUCT_PRD.md` — Subscription tiers, voice exchange definition

---

## System Overview

The Clara Talent Agency is a three-part platform built on top of the existing Clara Code backend:

1. **GraphQL Federation Gateway** — one API endpoint for subscribing developers; routes to all registered Talent subgraphs
2. **Talent Registry** — approval workflow, subgraph registration, Developer Program billing
3. **Two web frontends** — `talent.claracode.ai` (marketplace browser) + `developers.claracode.ai` (developer portal)

```
╔═══════════════════════════════════════════════════════════════════════╗
║                     DEVELOPER-FACING SURFACES                        ║
╠══════════════════════════╦════════════════════════════════════════════╣
║  talent.claracode.ai     ║  developers.claracode.ai                  ║
║  Browse & install Talents║  Submit Talents, track installs, revenue  ║
╠══════════════════════════╩════════════════════════════════════════════╣
║                     CLARA CODE BACKEND (ECS Fargate)                 ║
║                                                                       ║
║  ┌────────────────────────────────────────────────────────────────┐  ║
║  │  Apollo Router  ─  api.claracode.ai/graphql  (supergraph)     │  ║
║  │  One endpoint. Routes queries to correct subgraph.            │  ║
║  └────────┬──────────────────────┬─────────────────────────┬─────┘  ║
║           │                      │                         │         ║
║     ┌─────▼──────┐  ┌────────────▼──────────┐  ┌──────────▼──────┐ ║
║     │ Clara Core │  │  Talent Registry       │  │ Talent Subgraphs│ ║
║     │ Subgraph   │  │  Subgraph              │  │ (3rd party)     │ ║
║     │ voice      │  │  marketplace listings  │  │ dev's own server│ ║
║     │ agents     │  │  install/uninstall     │  │ Clara calls     │ ║
║     │ ask/stream │  │  usage tracking        │  │ server-to-server│ ║
║     └────────────┘  └────────────────────────┘  └─────────────────┘ ║
║                                                                       ║
║  ┌────────────────────────────────────────────────────────────────┐  ║
║  │  REST API (existing Express)                                   │  ║
║  │  /api/checkout /api/voice /api/user /api/talents /api/registry │  ║
║  └────────────────────────────────────────────────────────────────┘  ║
╠═══════════════════════════════════════════════════════════════════════╣
║                     Neon PostgreSQL                                   ║
║  users · subscriptions · api_keys · voice_usage · talents            ║
║  talent_installs · talent_subgraphs · developer_programs             ║
╠═══════════════════════════════════════════════════════════════════════╣
║                     Private npm Registry (Verdaccio)                 ║
║  registry.claracode.ai  →  @claracode/sdk  @claracode/marketplace-sdk║
╚═══════════════════════════════════════════════════════════════════════╝
```

---

## Service Breakdown

### 1. Apollo Router (Federation Gateway)

**What it is:** A standalone Rust binary (Apollo Router) that composes multiple GraphQL subgraphs into one unified supergraph. All subscribing developers query `api.claracode.ai/graphql` — the router handles routing to the correct subgraph transparently.

**Technology:** Apollo Router v1.x (Rust-based, replaces Apollo Gateway 2.x)

**Deployment:** Sidecar container alongside the existing Express backend on ECS Fargate, OR a separate ECS service on port 4000 behind the same load balancer path `/graphql`.

**Supergraph composition:** Managed via `rover supergraph compose` using a `supergraph.yaml` config that lists all approved Talent subgraph URLs. When a new Talent is approved, the registry service writes a new `supergraph.yaml` and sends SIGHUP to Apollo Router for hot-reload (no downtime).

**Auth:** Apollo Router forwards the `Authorization: Bearer <token>` header to all subgraphs. Each subgraph verifies the token against Clara's JWKS endpoint or validates the Clara service token for server-to-server calls.

**Configuration:**
```yaml
# router.yaml (managed — do not edit manually)
supergraph:
  schema:
    source: file
    file: ./supergraph-schema.graphql  # rebuilt on each Talent approval

headers:
  all:
    request:
      - propagate:
          named: authorization
      - insert:
          name: x-clara-service-token
          value: "${env.CLARA_SERVICE_TOKEN}"
```

### 2. Clara Core Subgraph

**What it is:** The first-party GraphQL subgraph that exposes Clara Code's native capabilities: voice, agents, ask, stream. This is the schema subscribing developers get "for free" — every Clara Code plan includes access to this subgraph.

**Deployment:** Part of the existing Express backend. A new `/graphql/clara-core` endpoint (Apollo Server 4) alongside the existing REST routes.

**Schema (public surface — NO internal names):**
```graphql
type Query {
  me: User
  models: [Model!]!
  agents: [Agent!]!
}

type Mutation {
  ask(prompt: String!, model: ModelName): Message!
  startVoiceSession: VoiceSession!
  createAgent(name: String!, soul: String!): Agent!
}

type Subscription {
  stream(prompt: String!, model: ModelName): StreamChunk!
}

enum ModelName { MARY MAYA NIKKI }

type Message { role: String! content: String! voiceUrl: String }
type VoiceSession { id: ID! }
type Agent { id: ID! name: String! }
type StreamChunk { text: String! done: Boolean! }
type Model { name: ModelName! displayName: String! thinking: Boolean! }
type User { id: ID! tier: String! voiceExchangesUsed: Int! voiceExchangesLimit: Int }
```

### 3. Talent Registry Service

**What it is:** The database layer and admin API that manages Talent lifecycle: registration, approval, installation, usage tracking.

**Lives in:** `backend/src/features/talent-registry/` — a feature module within the existing Express backend.

**Database tables:**
```sql
-- talent developers who paid the $99/year program fee
CREATE TABLE developer_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL UNIQUE,
  stripe_subscription_id VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'active',  -- 'active' | 'canceled'
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- registered Talents
CREATE TABLE talents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_user_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL UNIQUE,              -- e.g. "github-talent"
  display_name VARCHAR(255) NOT NULL,             -- e.g. "GitHub"
  description TEXT,
  category VARCHAR(100),                          -- 'productivity' | 'data' | 'communication' | ...
  pricing_type VARCHAR(50) NOT NULL DEFAULT 'free', -- 'free' | 'paid'
  price_cents INTEGER,                            -- monthly price in cents (null if free)
  subgraph_url TEXT,                              -- developer's GraphQL endpoint (internal)
  voice_commands JSONB,                           -- array of voice command patterns
  status VARCHAR(50) NOT NULL DEFAULT 'pending',  -- 'pending' | 'approved' | 'rejected' | 'suspended'
  stripe_price_id VARCHAR(255),                   -- for paid Talents
  install_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- which users have installed which Talents
CREATE TABLE talent_installs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  talent_id UUID NOT NULL REFERENCES talents(id),
  installed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  stripe_subscription_id VARCHAR(255),            -- for paid Talents
  UNIQUE(user_id, talent_id)
);

CREATE INDEX idx_talents_status ON talents(status);
CREATE INDEX idx_talent_installs_user ON talent_installs(user_id);
```

**REST API endpoints:**
```
# Talent browsing (public)
GET  /api/talents                    — list approved Talents (with optional category filter)
GET  /api/talents/:id                — get a single Talent's public metadata

# Talent management (Developer Program required)
POST /api/talents                    — register a new Talent (submit for approval)
PUT  /api/talents/:id                — update Talent metadata
GET  /api/talents/:id/analytics      — install count, usage, revenue

# Talent installation (subscription required)
POST /api/talents/:id/install        — install a Talent for the current user
DELETE /api/talents/:id/install      — uninstall

# Developer Program
POST /api/developer-program/enroll   — create $99/yr Stripe checkout session
GET  /api/developer-program/status   — check enrollment status

# Internal admin (Clara Code team only — requires ADMIN role)
PATCH /api/admin/talents/:id/status  — approve or reject a submitted Talent
```

### 4. Talent Marketplace Frontend (`talent.claracode.ai`)

**What it is:** The public browsing and installation interface for the Clara Talent Agency.

**Technology:** Next.js 15, Tailwind CSS, deployed to Cloudflare Pages.
**Repo location:** `packages/talent-marketplace/` (new package in this monorepo)

**Pages:**
- `/` — Featured Talents, category browser, search
- `/talent/[slug]` — Talent detail page: description, voice commands, pricing, install button
- `/installed` — User's installed Talents (auth-gated)
- `/categories/[category]` — Browse by category

**Design:** Follows Clara Code design system (`#09090F` bg, `#7C3AED` purple, `#7BCDD8` teal, Inter + JetBrains Mono).

### 5. Developer Portal (`developers.claracode.ai`)

**What it is:** The Talent creator dashboard. Talent developers manage submissions, see analytics, track revenue.

**Technology:** Next.js 15, Tailwind CSS, deployed to Cloudflare Pages.
**Repo location:** `packages/developer-portal/` (new package in this monorepo)

**Pages:**
- `/` — Dashboard: installs, revenue, pending reviews
- `/talents/new` — Submit a new Talent (manifest form + subgraph URL)
- `/talents/[id]` — Talent detail: status, analytics, edit
- `/program` — Developer Program billing: enroll, manage subscription
- `/docs` — Link to developer documentation

### 6. Marketplace SDK (`@claracode/marketplace-sdk`)

**What it is:** The npm package Talent developers install to build their subgraphs. Distributed through the private registry (`registry.claracode.ai`). Requires $99/yr Developer Program.

**Repo location:** `packages/marketplace-sdk/` (new package in this monorepo)

**What it provides:**
```typescript
// Verify incoming Clara service tokens on subgraph requests
export function verifyClaraServiceToken(token: string): boolean;

// Build a standard Talent manifest
export function defineTalent(manifest: TalentManifest): TalentManifest;

// Type definitions for voice command schemas
export interface TalentManifest {
  name: string;
  displayName: string;
  description: string;
  category: TalentCategory;
  voiceCommands: VoiceCommandPattern[];
  pricingType: 'free' | 'paid';
  priceMonthly?: number;  // USD
}

export interface VoiceCommandPattern {
  pattern: string;         // "show my {resource}"
  description: string;
  examples: string[];
}
```

---

## Build Order

Prompts must be executed in this sequence due to dependencies:

```
Phase 1 — Infrastructure Foundation
  Prompt 06: Apollo Router + Clara Core Subgraph
  Prompt 07: Talent Registry DB tables + REST API

Phase 2 — Developer Monetization
  Prompt 08: Developer Program billing ($99/yr Stripe)
  Prompt 09: Marketplace SDK scaffold (@claracode/marketplace-sdk)

Phase 3 — Frontend Surfaces
  Prompt 10: talent.claracode.ai marketplace frontend
  Prompt 11: developers.claracode.ai developer portal

Phase 4 — First-Party Talents
  Prompt 12: First-party Talent subgraphs (gateway-connect, clerk-auth)
```

Prompts 01–05 (already queued) are backend prerequisites. All 12 prompts together constitute the complete Clara Talent Agency MVP.

---

## Security Model

### Developer ↔ Subscriber Isolation (NON-NEGOTIABLE)

Third-party Talent developers **never receive** subscriber identity or API keys. The isolation is enforced at the gateway layer:

1. Subscriber sends: `Authorization: Bearer cc_live_<key>`
2. Apollo Router validates the key (via Clara backend middleware)
3. Router forwards to Talent subgraph: `x-clara-service-token: <service-token>` (NOT the user's key)
4. Talent subgraph verifies `x-clara-service-token` using `@claracode/marketplace-sdk`
5. Talent subgraph receives: voice command context + whatever data Clara explicitly includes in the subgraph query headers

The subscriber's identity is represented only by a scoped, non-reversible context token — not their actual user ID or API key.

### Subgraph URL Confidentiality

Talent subgraph URLs are stored in the `talents` table and used only by the Apollo Router in server-to-server calls. They are **never** returned in any public API response. Subscribers never know the endpoint of a Talent they've installed.

### Voice Command Security

All voice command patterns in Talent manifests are reviewed before approval to prevent:
- Patterns that could trigger on common speech accidentally
- Patterns designed to intercept other Talents' commands
- Patterns that request sensitive operations without clear user intent

---

## Environment Variables (Complete List)

```bash
# Existing
DATABASE_URL=
CLERK_SECRET_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# From Prompt 01
STRIPE_PRICE_PRO=
STRIPE_PRICE_BUSINESS=
FRONTEND_URL=

# From Prompt 03
MAYA_BACKEND_URL=
MARY_BACKEND_URL=
NIKKI_BACKEND_URL=

# From Prompt 04
VERDACCIO_URL=
VERDACCIO_ADMIN_PASSWORD=
REGISTRY_PUBLIC_URL=

# New — Clara Talent Agency
APOLLO_ROUTER_PORT=4000
CLARA_SERVICE_TOKEN=         # service-to-service token (high entropy, rotate quarterly)
SUPERGRAPH_CONFIG_PATH=./supergraph.yaml
STRIPE_PRICE_DEVELOPER_PROGRAM=  # $99/year Stripe price ID
TALENT_MARKETPLACE_URL=https://talent.claracode.ai
DEVELOPER_PORTAL_URL=https://developers.claracode.ai
```

---

## Data Flow: Developer Installing a Talent

```
1. Subscriber browses talent.claracode.ai
2. Clicks "Install" on GitHub Talent (free)
3. POST /api/talents/github-talent/install
   → Backend verifies subscriber has active subscription
   → Inserts row in talent_installs table
   → Returns success
4. Apollo Router reloads config (if this Talent wasn't already in the supergraph)
5. Subscriber can now query:
   api.claracode.ai/graphql → { github { myPullRequests { ... } } }
6. Router routes to GitHub Talent's subgraph (server-to-server, Clara service token)
7. Response flows back through Router → subscriber
```

## Data Flow: Paid Talent Installation

```
1. Subscriber clicks "Install" on Linear Talent ($5/month)
2. POST /api/talents/linear-talent/install
   → Backend creates Stripe Checkout session for the Talent's price
   → Returns checkout URL
3. Subscriber completes Stripe Checkout
4. stripe webhook: checkout.session.completed
   → Backend inserts talent_installs row with stripe_subscription_id
   → Talent developer's revenue starts accruing (85% to them, 15% to Clara)
5. Same query flow as above
```
