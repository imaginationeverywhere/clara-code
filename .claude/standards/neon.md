# Neon PostgreSQL Standard

**Version:** 1.0.0
**Enforced by:** `/pickup-prompt --neon`

Covers: Neon project provisioning, branch strategy (prod/dev), connection string management, pooling, and migration workflow.

---

## CRITICAL RULES

### 1. Connection strings from SSM — never hardcoded

```typescript
// ✅ Connection strings from SSM (injected as env vars)
const databaseUrl    = process.env.DATABASE_URL;      // SSM: /[project]/prod/DATABASE_URL (pooler)
const devDatabaseUrl = process.env.DEV_DATABASE_URL;  // SSM: /[project]/dev/DATABASE_URL  (pooler)

// ✅ Direct connection (for migrations only — bypasses pgbouncer)
const directUrl = process.env.DATABASE_URL_DIRECT; // SSM: /[project]/prod/DATABASE_URL_DIRECT

// ❌ NEVER hardcode Neon connection strings
const pool = new Pool({ connectionString: "postgresql://user:pass@ep-xyz.us-east-2.aws.neon.tech/neondb" });
```

**SSM paths:**
```
/[project]/prod/DATABASE_URL              # Pooler URL (pgbouncer) — use in app
/[project]/prod/DATABASE_URL_DIRECT       # Direct URL — migrations only
/[project]/dev/DATABASE_URL               # Pooler URL for dev branch
/[project]/dev/DATABASE_URL_DIRECT        # Direct URL for dev migrations
```

---

### 2. Neon project provisioning — two branches required

```bash
# ✅ Provision via Neon API (requires NEON_API_KEY from SSM)
NEON_API_KEY=$(aws ssm get-parameter --name /quik-nation/shared/NEON_API_KEY \
  --with-decryption --query Parameter.Value --output text)

# Step 1: Create project
curl -X POST https://console.neon.tech/api/v2/projects \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"project": {"name": "[project]-db", "region_id": "aws-us-east-2"}}'

# → Save project_id from response

# Step 2: main branch = production (already created by default)
# Step 3: Create dev branch from main
curl -X POST "https://console.neon.tech/api/v2/projects/$PROJECT_ID/branches" \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"endpoints": [{"type": "read_write"}], "branch": {"name": "dev", "parent_id": "[main-branch-id]"}}'

# Step 4: Store connection strings in SSM
# Get connection strings from the Neon console or API, then:
aws ssm put-parameter --name "/[project]/prod/DATABASE_URL" \
  --value "postgresql://[user]:[pass]@[endpoint].us-east-2.aws.neon.tech/neondb?sslmode=require" \
  --type "SecureString" --region us-east-1

# → Repeat for dev branch and direct URLs
```

---

### 3. Use pgbouncer pooler URL in the app — never the direct URL

```typescript
// ✅ App always connects through pgbouncer (pooler URL ends with -pooler)
// Example pooler URL format:
// postgresql://user:pass@ep-xyz-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require

const DATABASE_URL = process.env.DATABASE_URL; // Always the pooler URL

// ✅ Prisma config example
// schema.prisma:
// datasource db {
//   provider  = "postgresql"
//   url       = env("DATABASE_URL")        // pooler (for app)
//   directUrl = env("DATABASE_URL_DIRECT") // direct (for migrations)
// }

// ✅ Drizzle config example
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // pooler
  ssl: { rejectUnauthorized: false },
});

// ❌ Using the direct (non-pooler) URL in the app — exhausts connection limit fast
// ❌ Setting ssl: false — Neon requires SSL
```

---

### 4. Migrations run against direct URL — on the correct branch

```bash
# ✅ Prisma migrations
# Set DATABASE_URL_DIRECT in env for migration commands
DATABASE_URL=$DATABASE_URL_DIRECT npx prisma migrate deploy

# ✅ Drizzle migrations
DATABASE_URL=$DATABASE_URL_DIRECT npx drizzle-kit migrate

# Dev branch migrations (isolated from prod)
DATABASE_URL=$DEV_DATABASE_URL_DIRECT npx prisma migrate dev --name "add_user_table"

# Production migrations (from CI/CD only)
DATABASE_URL=$PROD_DATABASE_URL_DIRECT npx prisma migrate deploy

# ❌ Running migrations against the pooler URL — will fail (pooler doesn't support DDL)
# ❌ Running prod migrations locally by hand (must go through CI/CD pipeline)
```

---

### 5. SSL required — enforce in all connection configs

```typescript
// ✅ SSL always enabled for Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Neon uses a valid cert — rejectUnauthorized can be true
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// ✅ Prisma — sslmode=require is in the connection string
// DATABASE_URL="postgresql://...?sslmode=require"

// ❌ ssl: false or no ssl config — Neon will reject the connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL }); // missing SSL
```

---

### 6. Connection pool sizing — respect Neon limits

```typescript
// ✅ Neon free tier: 10 connections / paid: higher — size pool conservatively
// Rule: max = min(10, expected_concurrent_requests / 2)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,             // Safe default for serverless (Neon + Next.js/Vercel)
  idleTimeoutMillis: 20000,
  connectionTimeoutMillis: 3000,
});

// ✅ For serverless (Next.js Edge, Cloudflare Workers) — use Neon serverless driver
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

const result = await sql`SELECT * FROM users WHERE id = ${userId}`;

// ❌ Using pg Pool in serverless Edge functions — each invocation opens new connections
```

---

### 7. Branch strategy — dev branch isolates from prod

```
Neon Branch Structure:
├── main (production)
│   └── endpoint: ep-[id].us-east-2.aws.neon.tech
│       Schema: same as last migration
│       Data: live production data
│
└── dev (development)
    └── endpoint: ep-[id]-dev.us-east-2.aws.neon.tech
        Schema: may be ahead of main (in-progress migrations)
        Data: snapshot from main at branch creation (NOT live)
```

```bash
# ✅ Reset dev branch to latest prod snapshot when starting a feature
curl -X POST "https://console.neon.tech/api/v2/projects/$PROJECT_ID/branches/$DEV_BRANCH_ID/restore" \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"source_branch_id": "[main-branch-id]"}'

# ❌ Testing migrations directly against production
```

---

### Heru-specific tech doc required

Each Heru using Neon MUST have `docs/standards/neon.md` documenting:
- Neon project name and project ID (non-secret)
- Region used (`aws-us-east-2` default)
- Branch names and their purposes
- Connection pool size configured and rationale
- Migration tool used (Prisma / Drizzle / raw SQL) and migration run process
- CI/CD migration step (which GitHub Action step runs migrations before deploy)

If `docs/standards/neon.md` does not exist, create it.
