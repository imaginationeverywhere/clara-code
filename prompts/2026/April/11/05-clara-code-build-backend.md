# Clara Code Backend — Build from Scratch

**Repo:** `/Volumes/X10-Pro/Native-Projects/AI/clara-code`
**Working dir:** `backend/` (CURRENTLY EMPTY — build it all)
**Reference implementation:** `/Volumes/X10-Pro/Native-Projects/Quik-Nation/claraagents/backend/`

## YOUR MISSION

The `backend/` directory exists but has no server — only a single stub file at `backend/src/features/ai/clara/scripts/clara-code-surface-scripts.ts`. You will build a complete Express + Apollo GraphQL + Clerk + Neon Postgres backend, port 3001, following the same pattern as `claraagents/backend/`.

**WHY THIS EXISTS:** Clara Code is an IDE (VS Code fork + web UI). Its backend handles:
- User authentication via Clerk
- API key management (users generate keys to talk to Clara Code)
- Waitlist capture
- Voice session proxying to the Modal voice server
- GraphQL API for the web dashboard

---

## PHASE 1: Create `backend/package.json`

Create `backend/package.json` — copy the structure from `/Volumes/X10-Pro/Native-Projects/Quik-Nation/claraagents/backend/package.json` but change:
- `"name"`: `"@clara-code/backend"`
- `"version"`: `"1.0.0"`
- `"main"`: `"dist/src/server.js"`
- `"scripts.start"`: `"node dist/src/server.js"`
- `"scripts.build"`: `"tsc && tsc-alias"`
- `"scripts.dev"`: `"nodemon src/server.ts"`

Keep all dependencies identical — same express, apollo, clerk, sequelize, pg, winston, etc.

---

## PHASE 2: Create `backend/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "types": ["node"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": false,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noFallthroughCasesInSwitch": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "baseUrl": "./src",
    "paths": {
      "@/*": ["./*"],
      "@/models/*": ["./models/*"],
      "@/services/*": ["./services/*"],
      "@/middleware/*": ["./middleware/*"],
      "@/utils/*": ["./utils/*"],
      "@/config/*": ["./config/*"],
      "@/graphql/*": ["./graphql/*"],
      "@/features/*": ["./features/*"],
      "@/routes/*": ["./routes/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"],
  "ts-node": {
    "require": ["tsconfig-paths/register"]
  }
}
```

---

## PHASE 3: Create `backend/src/server.ts`

The main entry point. Mirror claraagents `src/index.ts` structure exactly, adapted for Clara Code:

```typescript
import 'reflect-metadata';
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { join } from 'path';

const envFile = process.env.ENV_FILE || '.env.local';
dotenv.config({ path: join(__dirname, '..', '..', envFile) });

import { sequelize, testConnection } from '@/config/database';
import { logger } from '@/utils/logger';
import { withAuth } from '@/middleware/clerk-auth';
import { clerkMiddleware } from '@clerk/express';
import { typeDefs } from '@/graphql/schema/index';
import { resolvers } from '@/graphql/resolvers/index';
import apiRoutes from '@/routes/index';

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(clerkMiddleware());
app.use(withAuth);

// --- Health check ---
app.get('/health', async (_req, res) => {
  const dbOk = await testConnection().then(() => true).catch(() => false);
  res.json({ status: 'ok', db: dbOk ? 'connected' : 'error', service: 'clara-code-backend' });
});

// --- REST API Routes ---
app.use('/api', apiRoutes);

// --- Apollo GraphQL ---
const server = new ApolloServer({ typeDefs, resolvers });

async function bootstrap() {
  await server.start();

  app.use('/graphql', expressMiddleware(server, {
    context: async ({ req }) => ({ req }),
  }));

  await testConnection();

  app.listen(PORT, () => {
    logger.info(`Clara Code backend running on port ${PORT}`);
    logger.info(`GraphQL: http://localhost:${PORT}/graphql`);
    logger.info(`Health:  http://localhost:${PORT}/health`);
  });
}

bootstrap().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
```

---

## PHASE 4: Create Supporting Files

Mirror these files EXACTLY from `claraagents/backend/src/` (copy, don't change logic):

### `backend/src/utils/logger.ts`
Copy from `claraagents/backend/src/utils/logger.ts`

### `backend/src/utils/omit-undefined.ts`
```typescript
export function omitUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}
```

### `backend/src/config/database.ts`
Copy from `claraagents/backend/src/config/database.ts` BUT simplify the model list — only include models we actually define below.

### `backend/src/middleware/clerk-auth.ts`
Copy verbatim from `claraagents/backend/src/middleware/clerk-auth.ts` — same Clerk integration pattern.

---

## PHASE 5: Create Models

### `backend/src/models/User.ts`
Copy from `claraagents/backend/src/models/User.ts` — same schema. Clara Code has users with Clerk IDs.

### `backend/src/models/ApiKey.ts`
This is UNIQUE to Clara Code — API keys that users generate to access Clara Code from their IDE:

```typescript
import { Table, Column, Model, DataType, BelongsTo, ForeignKey, BeforeCreate } from 'sequelize-typescript';
import { User } from './User';
import { randomBytes } from 'crypto';

@Table({ tableName: 'api_keys', timestamps: true })
export class ApiKey extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.STRING, allowNull: false })
  declare userId: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  declare key: string;  // sk-clara-... format

  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @Column({ type: DataType.DATE, allowNull: true })
  declare lastUsedAt: Date | null;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare isActive: boolean;

  @BelongsTo(() => User)
  declare user: User;

  @BeforeCreate
  static generateKey(instance: ApiKey) {
    instance.key = `sk-clara-${randomBytes(24).toString('hex')}`;
  }
}
```

### `backend/src/models/WaitlistEntry.ts`
```typescript
import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'waitlist_entries', timestamps: true })
export class WaitlistEntry extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true, validate: { isEmail: true } })
  declare email: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare name: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare role: string | null;  // 'developer', 'team', 'enterprise'

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare notified: boolean;
}
```

---

## PHASE 6: Create Routes

### `backend/src/routes/index.ts`
```typescript
import { Router } from 'express';
import healthRoutes from './health';
import keysRoutes from './keys';
import waitlistRoutes from './waitlist';
import voiceRoutes from './voice';

const router = Router();

router.use('/keys', keysRoutes);
router.use('/waitlist', waitlistRoutes);
router.use('/voice', voiceRoutes);

export default router;
```

### `backend/src/routes/health.ts`
```typescript
import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

export default router;
```

### `backend/src/routes/waitlist.ts`
```typescript
import { Router, Request, Response } from 'express';
import { WaitlistEntry } from '@/models/WaitlistEntry';
import { logger } from '@/utils/logger';

const router = Router();

// POST /api/waitlist — capture waitlist signup
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, role } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const [entry, created] = await WaitlistEntry.findOrCreate({
      where: { email: email.toLowerCase().trim() },
      defaults: { email: email.toLowerCase().trim(), name: name || null, role: role || null },
    });

    if (!created) {
      res.json({ success: true, message: 'Already on the waitlist' });
      return;
    }

    logger.info(`Waitlist signup: ${email}`);
    res.status(201).json({ success: true, message: 'Added to waitlist', id: entry.id });
  } catch (error) {
    logger.error('Waitlist signup error:', error);
    res.status(500).json({ error: 'Failed to join waitlist' });
  }
});

export default router;
```

### `backend/src/routes/keys.ts`
Auth-gated API key management. Requires Clerk auth:

```typescript
import { Router, Response } from 'express';
import { requireAuth } from '@clerk/express';
import { AuthenticatedRequest } from '@/middleware/clerk-auth';
import { ApiKey } from '@/models/ApiKey';
import { User } from '@/models/User';
import { logger } from '@/utils/logger';

const router = Router();

// All key routes require authentication
router.use(requireAuth());

// GET /api/keys — list user's API keys
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const auth = await req.auth?.();
    if (!auth?.userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const keys = await ApiKey.findAll({
      where: { userId: auth.userId, isActive: true },
      attributes: ['id', 'name', 'key', 'lastUsedAt', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });

    // Mask keys — only show last 4 chars
    const maskedKeys = keys.map(k => ({
      id: k.id,
      name: k.name,
      key: `sk-clara-...${k.key.slice(-4)}`,
      lastUsedAt: k.lastUsedAt,
      createdAt: k.createdAt,
    }));

    res.json({ keys: maskedKeys });
  } catch (error) {
    logger.error('List API keys error:', error);
    res.status(500).json({ error: 'Failed to list keys' });
  }
});

// POST /api/keys — create new API key
router.post('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const auth = await req.auth?.();
    if (!auth?.userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const { name } = req.body;
    if (!name) { res.status(400).json({ error: 'Key name is required' }); return; }

    const key = await ApiKey.create({ userId: auth.userId, name });

    // Return the FULL key only on creation — never shown again
    res.status(201).json({
      id: key.id,
      name: key.name,
      key: key.key,  // Full key — user must save this
      message: 'Save this key — it will not be shown again',
    });
  } catch (error) {
    logger.error('Create API key error:', error);
    res.status(500).json({ error: 'Failed to create key' });
  }
});

// DELETE /api/keys/:id — revoke API key
router.delete('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const auth = await req.auth?.();
    if (!auth?.userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const key = await ApiKey.findOne({ where: { id: req.params.id, userId: auth.userId } });
    if (!key) { res.status(404).json({ error: 'Key not found' }); return; }

    await key.update({ isActive: false });
    res.json({ success: true });
  } catch (error) {
    logger.error('Delete API key error:', error);
    res.status(500).json({ error: 'Failed to revoke key' });
  }
});

export default router;
```

### `backend/src/routes/voice.ts`
Proxy to the Modal voice server (URL from SSM → env var `CLARA_VOICE_URL`):

```typescript
import { Router, Request, Response } from 'express';
import axios from 'axios';
import { logger } from '@/utils/logger';

const router = Router();

const VOICE_URL = process.env.CLARA_VOICE_URL || 'https://quik-nation--clara-voice-server-web.modal.run';

// POST /api/voice/greet — generate Clara greeting
router.post('/greet', async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, voice_id } = req.body;
    const response = await axios.post(`${VOICE_URL}/tts`, {
      text: text || "Hello! I'm Clara. How can I help you code today?",
      voice_id: voice_id || 'clara',
    }, { responseType: 'arraybuffer', timeout: 30000 });

    res.set('Content-Type', 'audio/wav');
    res.send(response.data);
  } catch (error) {
    logger.error('Voice greet error:', error);
    res.status(500).json({ error: 'Voice generation failed' });
  }
});

// POST /api/voice/speak — general TTS
router.post('/speak', async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, voice_id } = req.body;
    if (!text) { res.status(400).json({ error: 'text is required' }); return; }

    const response = await axios.post(`${VOICE_URL}/tts`, { text, voice_id }, {
      responseType: 'arraybuffer',
      timeout: 30000,
    });

    res.set('Content-Type', 'audio/wav');
    res.send(response.data);
  } catch (error) {
    logger.error('Voice speak error:', error);
    res.status(500).json({ error: 'Voice generation failed' });
  }
});

export default router;
```

---

## PHASE 7: Create GraphQL Schema + Resolvers

### `backend/src/graphql/schema/index.ts`
```typescript
import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type User {
    id: ID!
    clerkId: String!
    email: String!
    firstName: String
    lastName: String
    createdAt: String!
  }

  type ApiKey {
    id: ID!
    name: String!
    keyPreview: String!
    lastUsedAt: String
    createdAt: String!
  }

  type WaitlistEntry {
    id: ID!
    email: String!
    createdAt: String!
  }

  type Query {
    me: User
    myApiKeys: [ApiKey!]!
    health: String!
  }

  type Mutation {
    joinWaitlist(email: String!, name: String, role: String): WaitlistEntry!
    createApiKey(name: String!): String!
    revokeApiKey(id: ID!): Boolean!
  }
`;
```

### `backend/src/graphql/resolvers/index.ts`
```typescript
import { WaitlistEntry } from '@/models/WaitlistEntry';
import { ApiKey } from '@/models/ApiKey';
import { logger } from '@/utils/logger';

export const resolvers = {
  Query: {
    health: () => 'ok',
    me: async (_: unknown, __: unknown, { req }: { req: any }) => {
      const userId = req.auth?.userId;
      if (!userId) return null;
      // Return basic user info from Clerk
      return { id: userId, clerkId: userId, email: '', createdAt: new Date().toISOString() };
    },
    myApiKeys: async (_: unknown, __: unknown, { req }: { req: any }) => {
      const userId = req.auth?.userId;
      if (!userId) return [];
      const keys = await ApiKey.findAll({ where: { userId, isActive: true } });
      return keys.map(k => ({
        id: k.id,
        name: k.name,
        keyPreview: `sk-clara-...${k.key.slice(-4)}`,
        lastUsedAt: k.lastUsedAt?.toISOString() || null,
        createdAt: k.createdAt.toISOString(),
      }));
    },
  },
  Mutation: {
    joinWaitlist: async (_: unknown, { email, name, role }: { email: string; name?: string; role?: string }) => {
      const [entry] = await WaitlistEntry.findOrCreate({
        where: { email: email.toLowerCase().trim() },
        defaults: { email: email.toLowerCase().trim(), name: name ?? null, role: role ?? null },
      });
      return entry;
    },
    createApiKey: async (_: unknown, { name }: { name: string }, { req }: { req: any }) => {
      const userId = req.auth?.userId;
      if (!userId) throw new Error('Unauthorized');
      const key = await ApiKey.create({ userId, name });
      return key.key;  // Return full key once
    },
    revokeApiKey: async (_: unknown, { id }: { id: string }, { req }: { req: any }) => {
      const userId = req.auth?.userId;
      if (!userId) throw new Error('Unauthorized');
      const key = await ApiKey.findOne({ where: { id, userId } });
      if (!key) throw new Error('Key not found');
      await key.update({ isActive: false });
      return true;
    },
  },
};
```

---

## PHASE 8: Create Database Migrations

Create `backend/src/database/migrations/` with two migration files:

### `001-create-users.js`
Standard Clerk-based users table (same as claraagents).

### `002-create-api-keys.js`
```javascript
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('api_keys', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      userId: { type: Sequelize.STRING, allowNull: false },
      key: { type: Sequelize.STRING(200), allowNull: false, unique: true },
      name: { type: Sequelize.STRING, allowNull: false },
      lastUsedAt: { type: Sequelize.DATE, allowNull: true },
      isActive: { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('api_keys', ['userId']);
    await queryInterface.addIndex('api_keys', ['key']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('api_keys');
  },
};
```

### `003-create-waitlist.js`
```javascript
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('waitlist_entries', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      name: { type: Sequelize.STRING, allowNull: true },
      role: { type: Sequelize.STRING, allowNull: true },
      notified: { type: Sequelize.BOOLEAN, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('waitlist_entries');
  },
};
```

---

## PHASE 9: Create `.sequelizerc` and `sequelize.config.js`

### `backend/.sequelizerc`
```javascript
const path = require('path');
module.exports = {
  'config': path.resolve('src/database', 'config.js'),
  'migrations-path': path.resolve('src/database', 'migrations'),
  'seeders-path': path.resolve('src/database', 'seeders'),
};
```

### `backend/src/database/config.js`
```javascript
require('dotenv').config({ path: process.env.ENV_FILE || '.env.local' });
module.exports = {
  development: { url: process.env.DATABASE_URL, dialect: 'postgres', dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } },
  production: { url: process.env.DATABASE_URL, dialect: 'postgres', dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } },
};
```

---

## PHASE 10: Create `.env.local` template

Create `backend/.env.local.example`:
```bash
# Clara Code Backend — Local Development
# Get actual values from AWS SSM /clara-code/develop/*

DATABASE_URL=postgresql://neondb_owner:...@ep-...neon.tech/develop?sslmode=require
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
ANTHROPIC_API_KEY=sk-ant-...
CLARA_VOICE_URL=https://quik-nation--clara-voice-server-web.modal.run
NODE_ENV=development
PORT=3001
```

---

## PHASE 11: REWRITE `Dockerfile.backend`

The current `Dockerfile.backend` at the ROOT of the clara-code repo (not inside backend/) builds the wrong thing. **Replace it entirely** with:

```dockerfile
# Clara Code Backend — Express + Apollo + Clerk + Neon Postgres
# Standard Heru pattern — multi-stage Docker build

FROM node:20-alpine AS builder

WORKDIR /app/backend

# Install build dependencies
RUN apk add --no-cache python3 build-base

# Copy package files and install ALL dependencies (dev included, for tsc)
COPY backend/package*.json ./
RUN npm ci

# Copy source and build
COPY backend/tsconfig.json ./
COPY backend/src ./src
RUN npm run build

# Remove dev dependencies for production
RUN npm prune --production

# ─── Production stage ───────────────────────────────────────────────────────

FROM node:20-alpine AS production

RUN apk upgrade --update-cache --available && \
    apk add --no-cache dumb-init curl && \
    rm -rf /var/cache/apk/*

# Non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

COPY --from=builder --chown=nodejs:nodejs /app/backend/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/backend/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/backend/package*.json ./

USER nodejs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/src/server.js"]
```

---

## PHASE 12: UPDATE `.github/workflows/deploy-backend.yml`

The current workflow triggers on `packages/mom/**`. Update the `paths:` section to trigger on `backend/**` instead:

```yaml
on:
  push:
    branches: [main, develop]
    paths:
      - 'backend/**'
      - 'Dockerfile.backend'
      - '.github/workflows/deploy-backend.yml'
```

Keep everything else in the workflow the same — the ECR push and ECS force-new-deployment are correct.

---

## PHASE 13: Run `npm install` and verify TypeScript compiles

```bash
cd /Volumes/X10-Pro/Native-Projects/AI/clara-code/backend
npm install
npm run build
```

**TypeScript must compile with zero errors.** If there are errors, fix them before finishing. The most common issues will be:
- Missing type imports from `@clerk/express`
- `noUnusedLocals` errors — use `_` prefix for unused params
- `exactOptionalPropertyTypes` errors — use `?? null` not `|| null`

---

## PHASE 14: Verify Health Endpoint Works Locally

```bash
cd /Volumes/X10-Pro/Native-Projects/AI/clara-code
# Copy SSM values to .env.local:
aws ssm get-parameter --name '/clara-code/develop/DATABASE_URL' --with-decryption --query 'Parameter.Value' --output text
# Put values in backend/.env.local
node backend/dist/src/server.js &
curl http://localhost:3001/health
# Expected: {"status":"ok","db":"connected","service":"clara-code-backend"}
```

---

## PHASE 15: Commit and Push

```bash
cd /Volumes/X10-Pro/Native-Projects/AI/clara-code
git add backend/ Dockerfile.backend .github/workflows/deploy-backend.yml
git commit -m "feat(backend): build Express+Apollo+Clerk+Neon backend from scratch

- Express 5 + Apollo Server v4 + GraphQL
- Clerk authentication middleware
- Neon Postgres via Sequelize
- API key management (sk-clara-... format)
- Waitlist capture endpoint
- Voice API proxy to Modal voice server
- /health endpoint for ECS health checks
- Port 3001
- Replaces packages/mom Slack bot (wrong architecture)
- Updates Dockerfile.backend to build backend/ directory
- Updates GitHub Actions to trigger on backend/** changes

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

git push origin develop
```

---

## SUCCESS CRITERIA

1. `npm run build` in `backend/` exits with code 0, zero TypeScript errors
2. `curl http://localhost:3001/health` returns `{"status":"ok","db":"connected"}`
3. `curl http://localhost:3001/api/waitlist -d '{"email":"test@test.com"}' -H 'Content-Type: application/json'` returns 201
4. Docker build succeeds: `docker build -f Dockerfile.backend -t clara-code-backend:test .`
5. `git push origin develop` triggers GitHub Actions `deploy-backend.yml`

## WHAT HAPPENS AFTER YOU PUSH

The GitHub Actions workflow will:
1. Build the Docker image from the new `Dockerfile.backend`
2. Push `clara-code-backend:develop` to ECR
3. Force a new ECS deployment on `clara-code-backend-dev` in `quik-nation-dev` cluster
4. ECS will pull the new image and the service goes healthy on `/health`

---

## NOTES

- **SSM params already exist** at `/clara-code/develop/`: DATABASE_URL, CLERK_SECRET_KEY, CLERK_WEBHOOK_SECRET, ANTHROPIC_API_KEY, NODE_ENV, PORT — the ECS task definition already pulls these
- **Neon database:** The develop database already exists. Just run the migrations after the first successful deploy.
- **CLARA_VOICE_URL** is at `/quik-nation/shared/CLARA_VOICE_URL` — add this to the ECS task definition's `secrets` array if it isn't there
- **Do NOT touch `packages/`** — leave the existing workspace packages alone
- **Do NOT touch the web-ui** — this is backend only
