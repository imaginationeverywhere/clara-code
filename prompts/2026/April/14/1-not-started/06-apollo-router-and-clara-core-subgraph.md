# Apollo Router + Clara Core Subgraph

**Source:** `docs/internal/CLARA_TALENT_AGENCY_ARCHITECTURE.md` — read this document before writing any code.
**Depends on:** Prompt 01 must be merged first (`api_keys` table with tier must exist); Prompt 03 must be merged (`MODELS` registry must exist)
**Branch:** `prompt/2026-04-14/06-apollo-router-clara-core-subgraph`
**Scope:** `backend/src/` (new GraphQL endpoint + middleware) + `apollo-router/` (new top-level directory)

---

## Context

Clara Code's developer API is GraphQL-first. All subscribing developers query one endpoint — `api.claracode.ai/graphql` — regardless of how many Talents they have installed. This is powered by Apollo Federation: an Apollo Router (Rust binary) sits in front, composing a supergraph from multiple subgraphs.

This prompt sets up:
1. **Clara Core Subgraph** — the first-party GraphQL subgraph that exposes Clara Code's native capabilities (voice, agents, ask, stream). Lives inside the Express backend at `/graphql/clara-core`.
2. **Apollo Router** — the federation gateway that routes all queries. Runs as a standalone process on port 4000, configured from `apollo-router/router.yaml`.

Third-party Talent subgraphs are wired in by later prompts (07+). For now the supergraph contains only the Clara Core subgraph.

---

## Required Work

### 1. Clara Core Subgraph — install dependencies

In `backend/`:
```bash
npm install @apollo/server @apollo/subgraph graphql graphql-ws
```

### 2. Clara Core Subgraph schema

Create `backend/src/graphql/clara-core/schema.ts`:

```typescript
import { gql } from "graphql-tag";

export const typeDefs = gql`
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.3", import: ["@key"])

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

  type Message {
    role: String!
    content: String!
    voiceUrl: String
  }

  type VoiceSession {
    id: ID!
  }

  type Agent {
    id: ID!
    name: String!
  }

  type StreamChunk {
    text: String!
    done: Boolean!
  }

  type Model {
    name: ModelName!
    displayName: String!
    thinking: Boolean!
  }

  type User {
    id: ID!
    tier: String!
    voiceExchangesUsed: Int!
    voiceExchangesLimit: Int
  }
`;
```

### 3. Clara Core Subgraph resolvers

Create `backend/src/graphql/clara-core/resolvers.ts`:

```typescript
import { MODELS, resolveModel } from "../../config/models";
import type { ClaraUser } from "../../middleware/api-key-auth";

export const resolvers = {
  Query: {
    me: (_: unknown, __: unknown, ctx: { user: ClaraUser }) => ({
      id: ctx.user.userId,
      tier: ctx.user.tier,
      voiceExchangesUsed: ctx.user.voiceExchangesUsed ?? 0,
      voiceExchangesLimit: ctx.user.tier === "free" ? 100 : null,
    }),

    models: (_: unknown, __: unknown, ctx: { user: ClaraUser }) => {
      const tierRank = { free: 0, pro: 1, business: 2 };
      const userRank = tierRank[ctx.user.tier as keyof typeof tierRank] ?? 0;
      return Object.values(MODELS)
        .filter((m) => tierRank[m.requiredTier as keyof typeof tierRank] <= userRank)
        .map((m) => ({ name: m.name.toUpperCase(), displayName: m.displayName, thinking: m.thinking }));
    },

    agents: async (_: unknown, __: unknown, ctx: { user: ClaraUser, db: any }) => {
      const rows = await ctx.db.query(
        "SELECT id, name FROM agents WHERE user_id = $1 ORDER BY created_at DESC",
        [ctx.user.userId]
      );
      return rows.rows;
    },
  },

  Mutation: {
    ask: async (_: unknown, args: { prompt: string; model?: string }, ctx: { user: ClaraUser }) => {
      const model = resolveModel(args.model?.toLowerCase(), ctx.user.tier as any);
      const response = await fetch(`${model.inferenceBackend}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: args.prompt }),
      });
      if (!response.ok) throw new Error(`Clara API request failed (${response.status})`);
      const data = await response.json() as any;
      return { role: "assistant", content: data.message?.content ?? "", voiceUrl: data.voiceUrl ?? null };
    },

    startVoiceSession: async (_: unknown, __: unknown, ctx: { user: ClaraUser }) => {
      const model = resolveModel(undefined, ctx.user.tier as any);
      const response = await fetch(`${model.inferenceBackend}/voice/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": ctx.user.userId },
      });
      if (!response.ok) throw new Error(`Clara voice session failed (${response.status})`);
      const data = await response.json() as any;
      if (!data.id) throw new Error("Clara voice session response missing id");
      return { id: data.id };
    },

    createAgent: async (_: unknown, args: { name: string; soul: string }, ctx: { user: ClaraUser, db: any }) => {
      const result = await ctx.db.query(
        "INSERT INTO agents (id, user_id, name, soul) VALUES (gen_random_uuid(), $1, $2, $3) RETURNING id, name",
        [ctx.user.userId, args.name, args.soul]
      );
      return result.rows[0];
    },
  },
};
```

### 4. Clara Core Subgraph server

Create `backend/src/graphql/clara-core/server.ts`:

```typescript
import { ApolloServer } from "@apollo/server";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { expressMiddleware } from "@apollo/server/express4";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";

export async function createClaraCoreSubgraph(db: any) {
  const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers }),
    introspection: true,
  });
  await server.start();

  // Returns Express middleware — mount at /graphql/clara-core in app.ts
  return expressMiddleware(server, {
    context: async ({ req }) => ({
      user: (req as any).claraUser,
      db,
    }),
  });
}
```

### 5. Mount Clara Core in Express

In `backend/src/app.ts`, after the existing route declarations:

```typescript
import { createClaraCoreSubgraph } from "./graphql/clara-core/server";
import { apiKeyAuth } from "./middleware/api-key-auth";

// Mount Clara Core Subgraph — requires API key auth
const claraCoreMiddleware = await createClaraCoreSubgraph(db);
app.use("/graphql/clara-core", apiKeyAuth, claraCoreMiddleware);
```

Note: the `app.ts` likely uses module-level initialization; adjust to match existing patterns (may need an async init function).

### 6. Apollo Router directory

Create `apollo-router/` at the project root:

```
apollo-router/
├── router.yaml          # Router config
├── supergraph.yaml      # Subgraph composition config
└── README.md            # How to run and update
```

**`apollo-router/router.yaml`:**
```yaml
# Apollo Router configuration — DO NOT edit manually (managed by Talent Registry service)
# See docs/internal/CLARA_TALENT_AGENCY_ARCHITECTURE.md for full spec

supergraph:
  schema:
    source: file
    file: ./supergraph-schema.graphql

headers:
  all:
    request:
      - propagate:
          named: authorization
      - insert:
          name: x-clara-service-token
          value: "${env.CLARA_SERVICE_TOKEN}"

include_subgraph_errors:
  all: true
```

**`apollo-router/supergraph.yaml`:**
```yaml
federation_version: =2.3.0

subgraphs:
  clara-core:
    routing_url: http://localhost:3031/graphql/clara-core
    schema:
      subgraph_url: http://localhost:3031/graphql/clara-core
```

Note: `routing_url` uses `BACKEND_INTERNAL_URL` in production — set from environment. For local dev, `http://localhost:3031/graphql/clara-core` is fine.

**`apollo-router/README.md`:**
```markdown
# Apollo Router

The Apollo Router is the GraphQL Federation gateway for Clara Code.

## Running locally

1. Install: https://www.apollographql.com/docs/router/quickstart
   ```
   curl -sSL https://router.apollo.dev/download/nix/latest | sh
   ```

2. Compose the supergraph schema:
   ```
   rover supergraph compose --config supergraph.yaml > supergraph-schema.graphql
   ```

3. Start the router:
   ```
   CLARA_SERVICE_TOKEN=dev-token ./router --config router.yaml
   ```

The router listens on port 4000 by default. Set APOLLO_ROUTER_PORT in the root .env to change.

## Adding a new Talent subgraph

When the Talent Registry approves a new Talent, it:
1. Appends the subgraph to supergraph.yaml
2. Reruns `rover supergraph compose`
3. Sends SIGHUP to the router process for hot-reload (no downtime)

Never edit supergraph.yaml manually in production — it is managed by the Talent Registry service.
```

### 7. Environment variables

Add to `backend/.env.example`:
```
# Apollo Router
APOLLO_ROUTER_PORT=4000
CLARA_SERVICE_TOKEN=      # service-to-service auth token; high-entropy random string; rotate quarterly
SUPERGRAPH_CONFIG_PATH=./apollo-router/supergraph.yaml
```

### 8. Rover installation in package.json scripts

In root `package.json`, add:
```json
{
  "scripts": {
    "router:compose": "rover supergraph compose --config apollo-router/supergraph.yaml > apollo-router/supergraph-schema.graphql",
    "router:start": "cd apollo-router && APOLLO_ROUTER_PORT=${APOLLO_ROUTER_PORT:-4000} ./router --config router.yaml"
  }
}
```

---

## Tests Required

Create `backend/src/__tests__/clara-core-subgraph.test.ts`:

- `GET /graphql/clara-core` without auth → HTTP 401
- `POST /graphql/clara-core { query: "{ me { id tier } }" }` with valid free-tier API key → returns user object with `tier: "free"`
- `POST /graphql/clara-core { query: "{ models { name displayName thinking } }" }` with free-tier key → returns only `MAYA`
- `POST /graphql/clara-core { query: "{ models { name } }" }` with pro-tier key → returns `MAYA`, `MARY`, `NIKKI`

All tests must pass. `npm test` must exit zero.

---

## Acceptance Criteria

- [ ] `POST /graphql/clara-core` endpoint exists and requires `Authorization: Bearer cc_live_<key>`
- [ ] `{ me { id tier } }` query returns authenticated user's info
- [ ] `{ models { name } }` respects tier gating (free = maya only, pro/business = all three)
- [ ] `apollo-router/` directory exists with `router.yaml`, `supergraph.yaml`, and `README.md`
- [ ] `npm run router:compose` succeeds (generates `supergraph-schema.graphql`)
- [ ] `npm run build` succeeds — no TypeScript errors
- [ ] `npm test` passes — all tests including new ones

## Do NOT

- Do not expose `inferenceBackend` URLs in any GraphQL response
- Do not return `ModelName` as lowercase strings from the schema — the enum uses uppercase `MARY`, `MAYA`, `NIKKI`
- Do not remove or break existing REST routes — this is additive
- Do not run the Apollo Router binary as part of the Express process — it is a separate process
