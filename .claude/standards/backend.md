# Backend Stack Standard

**Version:** 1.0.0
**Enforced by:** `/pickup-prompt --backend`

**Canonical stack:** Node.js 20 · Express.js · TypeScript (strict) · Sequelize ORM · Apollo Server (GraphQL) · Clerk JWT auth · PostgreSQL

This standard enforces the exact technology choices, package versions, file structure, and patterns for ALL Quik Nation backend projects. Any prompt executed with `--backend` MUST produce code matching this stack exactly — no substitutions.

---

## CRITICAL RULES

### 1. Stack — exact packages and versions

```json
// package.json (backend workspace)
{
  "dependencies": {
    "express": "^4.21.0",
    "typescript": "^5.6.0",
    "@apollo/server": "^4.11.0",
    "graphql": "^16.9.0",
    "sequelize": "^6.37.0",
    "pg": "^8.13.0",
    "pg-hstore": "^2.3.4",
    "dataloader": "^2.2.0",
    "@clerk/clerk-sdk-node": "^5.0.0",
    "helmet": "^8.0.0",
    "cors": "^2.8.5",
    "express-rate-limit": "^7.4.0",
    "compression": "^1.7.4",
    "morgan": "^1.10.0",
    "dotenv": "^16.4.0",
    "jsonwebtoken": "^9.0.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/express": "^5.0.0",
    "@types/node": "^22.0.0",
    "@types/cors": "^2.8.17",
    "@types/compression": "^1.7.5",
    "@types/morgan": "^1.9.9",
    "@types/jsonwebtoken": "^9.0.0",
    "ts-node": "^10.9.2",
    "ts-node-dev": "^2.0.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.13",
    "ts-jest": "^29.2.0"
  }
}

// ❌ NestJS — always Express
// ❌ TypeORM / Prisma — always Sequelize
// ❌ REST-only — always GraphQL via Apollo Server
// ❌ Mongoose / MongoDB — always PostgreSQL
// ❌ any without comment justification
```

---

### 2. TypeScript — strict mode, always

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "exactOptionalPropertyTypes": true,
    "moduleResolution": "node",
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "incremental": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
// ❌ strict: false
// ❌ any types without explicit comment justification
// ❌ // @ts-ignore (use // @ts-expect-error with explanation)
```

---

### 3. File structure — standard layout

```
backend/
├── src/
│   ├── server.ts                  # Express app setup (no listen here)
│   ├── index.ts                   # Entry point — app.listen()
│   ├── middleware/
│   │   ├── auth.ts                # Clerk JWT verification → requireAuth
│   │   ├── requireAdmin.ts        # Role check middleware
│   │   ├── errorHandler.ts        # Global error handler
│   │   └── rateLimiter.ts         # Rate limiting configs
│   ├── graphql/
│   │   ├── schema.ts              # Merged typeDefs
│   │   ├── resolvers.ts           # Merged resolvers
│   │   ├── context.ts             # Context builder — wires auth + dataloaders
│   │   └── modules/               # Feature-specific type/resolver sets
│   │       ├── user/
│   │       │   ├── user.typedefs.ts
│   │       │   └── user.resolvers.ts
│   │       └── [feature]/
│   │           ├── [feature].typedefs.ts
│   │           └── [feature].resolvers.ts
│   ├── models/                    # Sequelize model definitions
│   │   ├── index.ts               # Sequelize connection + model sync
│   │   ├── User.ts
│   │   └── [Feature].ts
│   ├── routes/                    # Express REST routes (Stripe webhooks, file upload)
│   │   ├── health.ts              # GET /health
│   │   ├── webhooks-stripe.ts     # POST /api/webhooks/stripe (raw body)
│   │   └── profile-avatar.ts     # POST /api/profile/avatar (multipart)
│   ├── services/                  # Business logic (called from resolvers + routes)
│   │   └── [feature].service.ts
│   ├── dataloaders/               # DataLoader factories (prevent N+1)
│   │   └── index.ts
│   └── types/
│       └── index.ts               # Shared TypeScript types
├── migrations/                    # Sequelize migration files
├── seeders/                       # Sequelize seed files
├── .env.local
├── .env.develop
├── .env.production
├── package.json
└── tsconfig.json
```

---

### 4. Express server — standard middleware order

```typescript
// src/server.ts
import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { expressMiddleware } from "@apollo/server/express4";
import { json } from "express";

const app = express();

// 1. Security headers
app.use(helmet());

// 2. CORS — restrict to known origins
app.use(cors({
  origin: [
    process.env.FRONTEND_URL ?? "http://localhost:3000",
    process.env.NEXT_PUBLIC_APP_URL ?? "",
  ].filter(Boolean),
  credentials: true,
}));

// 3. Compression
app.use(compression());

// 4. Logging (skip in test)
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("combined"));
}

// 5. Raw body for Stripe webhooks — MUST come BEFORE express.json()
app.use("/api/webhooks/stripe", express.raw({ type: "application/json" }));

// 6. JSON body for everything else
app.use(express.json({ limit: "1mb" }));

// 7. Rate limiting — default
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
}));

// 8. Health check (public, before auth)
app.get("/health", (_, res) => res.json({ status: "ok", ts: Date.now() }));

// 9. REST routes (auth, webhooks, file uploads)
import healthRouter     from "./routes/health";
import stripeRouter     from "./routes/webhooks-stripe";

app.use("/api", stripeRouter);

// 10. Apollo Server GraphQL endpoint (auth-aware)
// Mounted in index.ts AFTER Apollo initialization

// 11. Global error handler (MUST be last)
import { errorHandler } from "./middleware/errorHandler";
app.use(errorHandler);

export { app };

// ❌ Never put express.json() before the Stripe raw body route
// ❌ Never skip helmet
// ❌ Never use wildcard CORS in production
```

---

### 5. Apollo Server — standard context with Clerk auth + DataLoaders

```typescript
// src/graphql/context.ts
import { Request, Response } from "express";
import { createClerkClient } from "@clerk/clerk-sdk-node";
import jwt from "jsonwebtoken";
import { createDataLoaders } from "../dataloaders";
import { User } from "../models/User";

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export interface GraphQLContext {
  userId: string | null;
  userRole: string | null;
  userEmail: string | null;
  dataloaders: ReturnType<typeof createDataLoaders>;
  req: Request;
}

export async function buildContext(
  { req }: { req: Request; res: Response }
): Promise<GraphQLContext> {
  const token = req.headers.authorization?.replace("Bearer ", "") ?? null;

  let userId: string | null     = null;
  let userRole: string | null   = null;
  let userEmail: string | null  = null;

  if (token) {
    try {
      const decoded = jwt.decode(token) as { sub: string; sid: string } | null;
      if (decoded?.sub) {
        const clerkUser = await clerk.users.getUser(decoded.sub);
        userId    = decoded.sub;
        userRole  = (clerkUser.publicMetadata?.role as string) ?? "USER";
        userEmail = clerkUser.emailAddresses[0]?.emailAddress ?? null;
      }
    } catch {
      // Token invalid — userId stays null
    }
  }

  return {
    userId,
    userRole,
    userEmail,
    dataloaders: createDataLoaders(),
    req,
  };
}

// ✅ Auth guard helpers — use in resolvers
export function requireAuthCtx(ctx: GraphQLContext): string {
  if (!ctx.userId) throw new Error("UNAUTHENTICATED");
  return ctx.userId;
}

export function requireAdminCtx(ctx: GraphQLContext): string {
  const userId = requireAuthCtx(ctx);
  if (!["ADMIN", "SITE_OWNER"].includes(ctx.userRole ?? "")) {
    throw new Error("FORBIDDEN");
  }
  return userId;
}

// ❌ Never skip auth check in resolvers that return user data
// ❌ Never pass userId via args — always read from context
```

---

### 6. Apollo Server initialization

```typescript
// src/index.ts
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import http from "http";
import { app } from "./server";
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import { buildContext } from "./graphql/context";
import { sequelize } from "./models";

const PORT = parseInt(process.env.PORT ?? "3031", 10);

async function start() {
  // Verify DB connection
  await sequelize.authenticate();
  await sequelize.sync({ alter: process.env.NODE_ENV === "development" });
  console.log("✓ PostgreSQL connected");

  const httpServer = http.createServer(app);

  const apollo = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    formatError: (formattedError) => {
      // Don't leak stack traces in production
      if (process.env.NODE_ENV === "production") {
        return { message: formattedError.message, code: formattedError.extensions?.code };
      }
      return formattedError;
    },
  });

  await apollo.start();

  app.use(
    "/graphql",
    expressMiddleware(apollo, { context: buildContext }),
  );

  httpServer.listen(PORT, () => {
    console.log(`✓ Server running at http://localhost:${PORT}/graphql`);
  });
}

start().catch((err) => {
  console.error("Server failed to start:", err);
  process.exit(1);
});
```

---

### 7. Sequelize — model pattern

```typescript
// src/models/User.ts
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

interface UserAttributes {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN" | "STAFF" | "SITE_OWNER" | "SITE_ADMIN";
  walletBalance: number;
  createdAt?: Date;
  updatedAt?: Date;
}

type UserCreationAttributes = Optional<UserAttributes, "id" | "name" | "role" | "walletBalance">;

export class User extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes {
  declare id: string;
  declare clerkId: string;
  declare email: string;
  declare name: string | null;
  declare role: "USER" | "ADMIN" | "STAFF" | "SITE_OWNER" | "SITE_ADMIN";
  declare walletBalance: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

User.init({
  id:            { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  clerkId:       { type: DataTypes.STRING, allowNull: false, unique: true },
  email:         { type: DataTypes.STRING, allowNull: false },
  name:          { type: DataTypes.STRING },
  role:          { type: DataTypes.ENUM("USER", "ADMIN", "STAFF", "SITE_OWNER", "SITE_ADMIN"), defaultValue: "USER" },
  walletBalance: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
}, {
  sequelize,
  tableName: "users",
  underscored: true,  // snake_case columns in DB
});

// ❌ Never use DataTypes.STRING for IDs — always UUID
// ❌ Never use .sync({ force: true }) in any environment
// ❌ Never store raw passwords or auth tokens
```

---

### 8. Sequelize connection — models/index.ts

```typescript
// src/models/index.ts
import { Sequelize } from "sequelize";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: process.env.NODE_ENV === "production"
      ? { require: true, rejectUnauthorized: false }
      : false,
  },
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// Import all models here so associations load
export { User } from "./User";
// export { [FeatureModel] } from "./[Feature]";

// ❌ Never use { force: true } with sync
// ❌ Never use direct URL for app connections — use pooler URL (Neon)
// ❌ Never log queries in production (leaks PII)
```

---

### 9. Resolver pattern — always check auth in context

```typescript
// src/graphql/modules/user/user.resolvers.ts
import { GraphQLContext, requireAuthCtx, requireAdminCtx } from "../../context";

export const userResolvers = {
  Query: {
    // ✅ Protected query — requires auth
    me: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const userId = requireAuthCtx(ctx);
      return ctx.dataloaders.userById.load(userId);
    },

    // ✅ Admin-only query
    adminUsers: async (_: unknown, args: { page?: number }, ctx: GraphQLContext) => {
      requireAdminCtx(ctx);
      const page  = args.page ?? 1;
      const limit = 50;
      return User.findAndCountAll({
        order: [["createdAt", "DESC"]],
        limit,
        offset: (page - 1) * limit,
      });
    },
  },

  Mutation: {
    // ✅ Mutation with validation
    updateProfile: async (
      _: unknown,
      args: { name?: string; bio?: string },
      ctx: GraphQLContext
    ) => {
      const userId = requireAuthCtx(ctx);
      const { name, bio } = args;
      await User.update({ name, bio }, { where: { clerkId: userId } });
      return ctx.dataloaders.userById.load(userId);
    },
  },
};

// ❌ Never trust args.userId — always use context.userId
// ❌ Never skip auth check on mutations
// ❌ Never query DB directly from resolvers — use services or dataloaders
```

---

### 10. DataLoaders — required for all N+1-prone relationships

```typescript
// src/dataloaders/index.ts
import DataLoader from "dataloader";
import { User } from "../models/User";
import { Op } from "sequelize";

// ✅ New DataLoader instance per request (created in context.ts)
export function createDataLoaders() {
  return {
    userById: new DataLoader<string, User | null>(async (clerkIds) => {
      const users = await User.findAll({
        where: { clerkId: { [Op.in]: [...clerkIds] } },
      });
      const map = new Map(users.map((u) => [u.clerkId, u]));
      return clerkIds.map((id) => map.get(id) ?? null);
    }),

    // Add feature-specific loaders below
    // ordersByUserId: new DataLoader<string, Order[]>(...)
  };
}

// ❌ Never share DataLoader instances across requests (stale cache)
// ❌ Never query related records in a loop — always use DataLoader
```

---

### 11. Auth middleware — for REST routes

```typescript
// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import { createClerkClient } from "@clerk/clerk-sdk-node";
import jwt from "jsonwebtoken";

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export interface ApiKeyRequest extends Request {
  claraUser?: {
    userId: string;
    sessionId: string;
    role: string;
    email: string;
  };
}

export async function requireAuth(
  req: ApiKeyRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  try {
    const decoded = jwt.decode(token) as { sub: string; sid: string } | null;
    if (!decoded?.sub) throw new Error("invalid token");

    const user = await clerk.users.getUser(decoded.sub);
    req.claraUser = {
      userId:    decoded.sub,
      sessionId: decoded.sid,
      role:      (user.publicMetadata?.role as string) ?? "USER",
      email:     user.emailAddresses[0]?.emailAddress ?? "",
    };
    next();
  } catch {
    res.status(401).json({ error: "unauthorized" });
  }
}
```

---

### 12. Environment variables — required per environment

```bash
# backend/.env.local
DATABASE_URL=postgresql://localhost:5432/[project]_dev
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:3000
PORT=3031
NODE_ENV=development

# backend/.env.develop
DATABASE_URL=[Neon dev branch pooler URL]
CLERK_SECRET_KEY=[from SSM /[project]/dev/CLERK_SECRET_KEY]
CLERK_WEBHOOK_SECRET=[from SSM /[project]/dev/CLERK_WEBHOOK_SECRET]
FRONTEND_URL=https://develop.[project].com
PORT=3031
NODE_ENV=development

# backend/.env.production
DATABASE_URL=[Neon main branch pooler URL]
CLERK_SECRET_KEY=[from SSM /[project]/prod/CLERK_SECRET_KEY]
CLERK_WEBHOOK_SECRET=[from SSM /[project]/prod/CLERK_WEBHOOK_SECRET]
FRONTEND_URL=https://[project].com
PORT=3031
NODE_ENV=production

# ❌ Never commit .env.* files
# ❌ Never use DATABASE_URL pointing to direct URL (use pooler for app)
# ❌ Never hardcode credentials
```

---

### Heru-specific tech doc required

Each Heru backend MUST have `docs/standards/backend.md` documenting:
- Node version in use
- Database connection strategy (pooler vs direct)
- GraphQL schema overview (key types + mutations)
- Sequelize models and their relationships
- Auth middleware: Clerk JWT vs API key fallback
- Rate limiting configuration per route group
- Any deviations from the standard stack (rare — document why)

If `docs/standards/backend.md` does not exist, create it.
