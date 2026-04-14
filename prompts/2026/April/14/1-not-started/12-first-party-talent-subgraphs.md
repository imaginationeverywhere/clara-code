# First-Party Talent Subgraphs — `gateway-connect` + `clerk-auth`

**Source:** `docs/auto-claude/CLARA_TALENT_AGENCY_ARCHITECTURE.md` and `docs/auto-claude/CLARA_TALENT_AGENCY.md` — read both documents before writing any code.
**Depends on:** Prompt 09 must be merged (`@claracode/marketplace-sdk` must be published to the private registry)
**Branch:** `prompt/2026-04-14/12-first-party-talent-subgraphs`
**Scope:** `packages/talents/` (new directory in this monorepo)

---

## Context

Clara publishes first-party free Talents to bootstrap the marketplace and to serve as reference implementations for developers building their own Talents. These are published by Clara — not third-party developers — so they don't go through the marketplace approval process. They are inserted directly into the `talents` table with `status = 'approved'` via a seed script.

This prompt builds two first-party Talents:

1. **`@claracode/talent-gateway-connect`** — Standard Clara gateway integration helper. Gives every agent the baseline federation health check and session info queries.
2. **`@claracode/talent-clerk-auth`** — User authentication for Talent developers. Lets a Talent developer wire Clerk auth into their subgraph with minimal boilerplate.

Both Talents are free, approved by default, and serve as the reference implementation for how a proper Talent subgraph should be structured.

---

## Required Work

### 1. Create the packages directory

```
packages/talents/
├── gateway-connect/         # @claracode/talent-gateway-connect
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts
│   │   ├── schema.ts
│   │   ├── resolvers.ts
│   │   └── server.ts
│   └── manifest.ts
└── clerk-auth/              # @claracode/talent-clerk-auth
    ├── package.json
    ├── tsconfig.json
    ├── src/
    │   ├── index.ts
    │   ├── schema.ts
    │   ├── resolvers.ts
    │   └── server.ts
    └── manifest.ts
```

### 2. `@claracode/talent-gateway-connect`

#### `packages/talents/gateway-connect/manifest.ts`

```typescript
import { defineTalent } from "@claracode/marketplace-sdk";

export const manifest = defineTalent({
  name: "gateway-connect",
  displayName: "Gateway Connect",
  description: "Baseline federation health and session info for Clara agents.",
  category: "developer-tools",
  voiceCommands: [
    {
      pattern: "check clara status",
      description: "Check your Clara connection and session status",
      examples: ["check clara status", "is clara connected"],
    },
  ],
  pricingType: "free",
});
```

#### `packages/talents/gateway-connect/src/schema.ts`

```typescript
import { gql } from "graphql-tag";

export const typeDefs = gql`
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.3", import: ["@key"])

  type Query {
    gatewayHealth: GatewayHealth!
    sessionInfo: SessionInfo!
  }

  type GatewayHealth {
    status: String!
    version: String!
    timestamp: String!
  }

  type SessionInfo {
    sessionToken: String!
    voiceCommand: String!
    requestedAt: String!
  }
`;
```

#### `packages/talents/gateway-connect/src/resolvers.ts`

```typescript
import { parseClaraContext, verifyClaraServiceToken } from "@claracode/marketplace-sdk";

export const resolvers = {
  Query: {
    gatewayHealth: () => ({
      status: "ok",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    }),

    sessionInfo: (_: unknown, __: unknown, ctx: { claraContext: ReturnType<typeof parseClaraContext> }) => ({
      sessionToken: ctx.claraContext.sessionToken,
      voiceCommand: ctx.claraContext.voiceCommand,
      requestedAt: ctx.claraContext.requestedAt,
    }),
  },
};
```

#### `packages/talents/gateway-connect/src/server.ts`

```typescript
import express from "express";
import { ApolloServer } from "@apollo/server";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { expressMiddleware } from "@apollo/server/express4";
import { json } from "body-parser";
import { verifyClaraServiceToken, parseClaraContext } from "@claracode/marketplace-sdk";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";

async function main() {
  const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers }),
  });
  await server.start();

  const app = express();
  app.use(
    "/graphql",
    json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const token = req.headers["x-clara-service-token"] as string;
        if (!verifyClaraServiceToken(token)) {
          throw new Error("Unauthorized: invalid Clara service token");
        }
        return { claraContext: parseClaraContext(req.headers as any) };
      },
    })
  );

  const port = parseInt(process.env.PORT ?? "4001");
  app.listen(port, () => {
    console.log(`gateway-connect Talent running at http://localhost:${port}/graphql`);
  });
}

main().catch(console.error);
```

#### `packages/talents/gateway-connect/package.json`

```json
{
  "name": "@claracode/talent-gateway-connect",
  "version": "1.0.0",
  "description": "Baseline Clara gateway integration Talent",
  "main": "./dist/index.js",
  "scripts": {
    "build": "tsup src/server.ts --format cjs",
    "start": "node dist/server.js",
    "dev": "ts-node src/server.ts"
  },
  "dependencies": {
    "@apollo/server": "^4.0.0",
    "@apollo/subgraph": "^2.0.0",
    "@claracode/marketplace-sdk": "^0.1.0",
    "body-parser": "^1.20.0",
    "express": "^4.18.0",
    "graphql": "^16.0.0",
    "graphql-tag": "^2.12.0"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.0.0"
  },
  "publishConfig": {
    "registry": "https://registry.claracode.ai"
  }
}
```

### 3. `@claracode/talent-clerk-auth`

#### `packages/talents/clerk-auth/manifest.ts`

```typescript
import { defineTalent } from "@claracode/marketplace-sdk";

export const manifest = defineTalent({
  name: "clerk-auth",
  displayName: "Clerk Auth",
  description: "Add Clerk authentication to your Talent subgraph in minutes.",
  category: "developer-tools",
  voiceCommands: [
    {
      pattern: "check my auth status",
      description: "Verify your authentication is working correctly",
      examples: ["check my auth status", "am I authenticated"],
    },
  ],
  pricingType: "free",
});
```

#### `packages/talents/clerk-auth/src/schema.ts`

```typescript
import { gql } from "graphql-tag";

export const typeDefs = gql`
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.3", import: ["@key"])

  type Query {
    authStatus: AuthStatus!
    verifyToken(token: String!): TokenVerification!
  }

  type AuthStatus {
    """
    Whether the incoming request has a valid Clara service token.
    This verifies the request is coming from Clara's gateway — not user identity.
    """
    gatewayVerified: Boolean!
    timestamp: String!
  }

  type TokenVerification {
    valid: Boolean!
    message: String
  }
`;
```

#### `packages/talents/clerk-auth/src/resolvers.ts`

```typescript
import { verifyClaraServiceToken } from "@claracode/marketplace-sdk";

export const resolvers = {
  Query: {
    authStatus: () => ({
      // At this point the request is already verified (verifyClaraServiceToken in context)
      // so this resolver only runs if verification passed
      gatewayVerified: true,
      timestamp: new Date().toISOString(),
    }),

    verifyToken: (_: unknown, args: { token: string }) => {
      // Utility for talent developers to test token verification during development
      const valid = verifyClaraServiceToken(args.token);
      return {
        valid,
        message: valid ? "Token is valid" : "Token verification failed",
      };
    },
  },
};
```

#### `packages/talents/clerk-auth/src/server.ts`

```typescript
import express from "express";
import { ApolloServer } from "@apollo/server";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { expressMiddleware } from "@apollo/server/express4";
import { json } from "body-parser";
import { verifyClaraServiceToken, parseClaraContext } from "@claracode/marketplace-sdk";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";

async function main() {
  const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers }),
  });
  await server.start();

  const app = express();
  app.use(
    "/graphql",
    json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const token = req.headers["x-clara-service-token"] as string;
        if (!verifyClaraServiceToken(token)) {
          throw new Error("Unauthorized: invalid Clara service token");
        }
        return {
          claraContext: parseClaraContext(req.headers as any),
        };
      },
    })
  );

  const port = parseInt(process.env.PORT ?? "4002");
  app.listen(port, () => {
    console.log(`clerk-auth Talent running at http://localhost:${port}/graphql`);
  });
}

main().catch(console.error);
```

#### `packages/talents/clerk-auth/package.json`

Same structure as `gateway-connect` but name `@claracode/talent-clerk-auth`, port 4002.

### 4. Database seed script

Create `backend/scripts/seed-first-party-talents.ts`:

```typescript
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const CLARA_DEVELOPER_USER_ID = "clara-internal";

const FIRST_PARTY_TALENTS = [
  {
    name: "gateway-connect",
    displayName: "Gateway Connect",
    description: "Baseline federation health and session info for Clara agents.",
    category: "developer-tools",
    pricing_type: "free",
    price_cents: null,
    // subgraph_url is set in production environment via env var
    subgraph_url: process.env.TALENT_GATEWAY_CONNECT_URL ?? "http://localhost:4001/graphql",
    voice_commands: JSON.stringify([
      { pattern: "check clara status", description: "Check connection and session status", examples: ["check clara status"] },
    ]),
    status: "approved",
    reviewed_at: new Date().toISOString(),
  },
  {
    name: "clerk-auth",
    displayName: "Clerk Auth",
    description: "Add Clerk authentication to your Talent subgraph in minutes.",
    category: "developer-tools",
    pricing_type: "free",
    price_cents: null,
    subgraph_url: process.env.TALENT_CLERK_AUTH_URL ?? "http://localhost:4002/graphql",
    voice_commands: JSON.stringify([
      { pattern: "check my auth status", description: "Verify authentication is working", examples: ["check my auth status"] },
    ]),
    status: "approved",
    reviewed_at: new Date().toISOString(),
  },
];

async function seed() {
  const db = new Pool({ connectionString: process.env.DATABASE_URL });

  // Ensure Clara internal developer exists in developer_programs
  await db.query(`
    INSERT INTO developer_programs (user_id, status, expires_at)
    VALUES ($1, 'active', '2099-12-31')
    ON CONFLICT (user_id) DO NOTHING
  `, [CLARA_DEVELOPER_USER_ID]);

  for (const talent of FIRST_PARTY_TALENTS) {
    await db.query(`
      INSERT INTO talents (
        developer_user_id, name, display_name, description, category,
        pricing_type, price_cents, subgraph_url, voice_commands, status, reviewed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11)
      ON CONFLICT (name) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        description = EXCLUDED.description,
        subgraph_url = EXCLUDED.subgraph_url,
        status = EXCLUDED.status
    `, [
      CLARA_DEVELOPER_USER_ID,
      talent.name, talent.displayName, talent.description, talent.category,
      talent.pricing_type, talent.price_cents, talent.subgraph_url,
      talent.voice_commands, talent.status, talent.reviewed_at,
    ]);
    console.log(`✓ Seeded: ${talent.displayName}`);
  }

  await db.end();
  console.log("First-party Talents seeded successfully.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
```

Add to `backend/package.json` scripts:
```json
"db:seed:talents": "ts-node scripts/seed-first-party-talents.ts"
```

### 5. Add first-party Talent URLs to env

In `backend/.env.example`:
```
# First-party Talent subgraph URLs
TALENT_GATEWAY_CONNECT_URL=http://localhost:4001/graphql
TALENT_CLERK_AUTH_URL=http://localhost:4002/graphql
```

In production these will be internal URLs (ECS Fargate service hostnames or internal ALB paths).

### 6. Supergraph composition update

After running the seed, update `apollo-router/supergraph.yaml` to include the first-party Talents:

```yaml
federation_version: =2.3.0

subgraphs:
  clara-core:
    routing_url: http://localhost:3031/graphql/clara-core
    schema:
      subgraph_url: http://localhost:3031/graphql/clara-core

  gateway-connect:
    routing_url: http://localhost:4001/graphql
    schema:
      subgraph_url: http://localhost:4001/graphql

  clerk-auth:
    routing_url: http://localhost:4002/graphql
    schema:
      subgraph_url: http://localhost:4002/graphql
```

Rerun composition:
```bash
npm run router:compose
```

---

## Tests Required

Add `packages/talents/gateway-connect/test/server.test.ts`:

- Health check: `POST /graphql { query: "{ gatewayHealth { status version } }" }` with valid service token → returns `{ status: "ok" }`
- Auth guard: same request with invalid token → throws "Unauthorized"
- Session info: with valid token and context headers → returns parsed session info

Add `packages/talents/clerk-auth/test/server.test.ts`:

- Auth status: valid token → `{ gatewayVerified: true }`
- Auth guard: invalid token → throws "Unauthorized"
- Verify token: `{ query: "{ verifyToken(token: \"correct-token\") { valid message } }" }` → `{ valid: true }`

All tests must pass.

---

## Acceptance Criteria

- [ ] `packages/talents/gateway-connect/` and `packages/talents/clerk-auth/` exist with correct structure
- [ ] Both packages build cleanly with `tsup`
- [ ] Both servers start without errors (can be tested locally)
- [ ] Both use `verifyClaraServiceToken` — requests without a valid token return an error
- [ ] Seed script inserts both Talents as `status = 'approved'` in the DB
- [ ] `apollo-router/supergraph.yaml` includes both first-party Talent subgraphs
- [ ] `npm run router:compose` succeeds after adding first-party Talents
- [ ] No internal service names appear in any exported type, error message, or schema comment
- [ ] Both manifests use `defineTalent()` from `@claracode/marketplace-sdk`

## Do NOT

- Do not add complex business logic to first-party Talents — they are reference implementations
- Do not add Clerk JWT verification to `clerk-auth` in this prompt — that is a follow-up feature
- Do not hard-code subgraph URLs — use environment variables
- Do not skip the `verifyClaraServiceToken` check — every subgraph must verify Clara service tokens on every request, no exceptions
