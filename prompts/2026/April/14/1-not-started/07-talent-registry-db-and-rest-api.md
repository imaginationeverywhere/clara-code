# Talent Registry — Database Tables + REST API

**Source:** `docs/internal/CLARA_TALENT_AGENCY_ARCHITECTURE.md` — read this document before writing any code.
**Depends on:** Prompt 01 must be merged (`subscriptions` + `api_keys` tables must exist); Prompt 06 must be merged (Apollo Router + subgraph must exist)
**Branch:** `prompt/2026-04-14/07-talent-registry-db-and-rest-api`
**Scope:** `backend/src/features/talent-registry/` (new feature module) + one new migration

---

## Context

The Talent Registry is the database and REST API layer that manages the full Talent lifecycle: submission, approval, installation, usage tracking. It lives inside the existing Express backend as a feature module — not a separate service.

This prompt creates:
1. Database migration for `developer_programs`, `talents`, and `talent_installs` tables
2. REST API routes for browsing, managing, and installing Talents
3. Internal admin endpoint for Clara team to approve/reject submissions

**Do NOT build the Developer Program billing (Stripe) in this prompt** — that is Prompt 08. For now, `developer_programs` rows are inserted manually by the admin endpoint. Prompt 08 will wire up the Stripe checkout flow.

---

## Required Work

### 1. Database migration

Create `backend/migrations/006_talent_registry.sql`:

```sql
-- Talent developers who paid the $99/year Developer Program fee
CREATE TABLE developer_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL UNIQUE,
  stripe_subscription_id VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'active',  -- 'active' | 'canceled'
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Registered Talents
CREATE TABLE talents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_user_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL UNIQUE,              -- slug: "github-talent"
  display_name VARCHAR(255) NOT NULL,             -- readable: "GitHub"
  description TEXT,
  category VARCHAR(100),                          -- 'productivity' | 'data' | 'communication' | 'developer-tools' | 'other'
  pricing_type VARCHAR(50) NOT NULL DEFAULT 'free', -- 'free' | 'paid'
  price_cents INTEGER,                            -- monthly price in cents (null if free)
  subgraph_url TEXT,                              -- developer's GraphQL endpoint (INTERNAL — never returned to clients)
  voice_commands JSONB,                           -- array of voice command patterns
  status VARCHAR(50) NOT NULL DEFAULT 'pending',  -- 'pending' | 'approved' | 'rejected' | 'suspended'
  stripe_price_id VARCHAR(255),                   -- for paid Talents; set by admin after approval
  install_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- Which users have installed which Talents
CREATE TABLE talent_installs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  talent_id UUID NOT NULL REFERENCES talents(id),
  installed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  stripe_subscription_id VARCHAR(255),            -- for paid Talents
  UNIQUE(user_id, talent_id)
);

CREATE INDEX idx_talents_status ON talents(status);
CREATE INDEX idx_talents_category ON talents(category);
CREATE INDEX idx_talent_installs_user ON talent_installs(user_id);
CREATE INDEX idx_developer_programs_user ON developer_programs(user_id);
```

Run this migration on all three environments per project convention.

### 2. Feature module structure

```
backend/src/features/talent-registry/
├── talent-registry.routes.ts      # All REST routes
├── talent-registry.service.ts     # Business logic
├── talent-registry.types.ts       # TypeScript interfaces
└── index.ts                       # Exports + router mount point
```

### 3. Types

Create `backend/src/features/talent-registry/talent-registry.types.ts`:

```typescript
export type TalentStatus = "pending" | "approved" | "rejected" | "suspended";
export type TalentCategory = "productivity" | "data" | "communication" | "developer-tools" | "other";

export interface Talent {
  id: string;
  developerUserId: string;
  name: string;
  displayName: string;
  description: string | null;
  category: TalentCategory | null;
  pricingType: "free" | "paid";
  priceCents: number | null;
  // NOTE: subgraphUrl is NEVER included in any public-facing response
  voiceCommands: VoiceCommandPattern[] | null;
  status: TalentStatus;
  installCount: number;
  createdAt: Date;
  reviewedAt: Date | null;
}

export interface VoiceCommandPattern {
  pattern: string;      // e.g. "show my {resource}"
  description: string;
  examples: string[];
}

// Public shape returned to subscribers — never includes subgraphUrl or developerUserId
export interface PublicTalent {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  category: TalentCategory | null;
  pricingType: "free" | "paid";
  priceMonthly: number | null;  // dollars, not cents
  voiceCommands: VoiceCommandPattern[] | null;
  installCount: number;
}

export interface DeveloperProgram {
  id: string;
  userId: string;
  status: "active" | "canceled";
  expiresAt: Date;
}
```

### 4. Service layer

Create `backend/src/features/talent-registry/talent-registry.service.ts`:

```typescript
import { Pool } from "pg";
import type { PublicTalent, Talent, TalentStatus } from "./talent-registry.types";

export class TalentRegistryService {
  constructor(private db: Pool) {}

  // ── PUBLIC (subscriber-facing) ──────────────────────────────────────

  async listApprovedTalents(category?: string): Promise<PublicTalent[]> {
    const query = category
      ? `SELECT id, name, display_name, description, category, pricing_type, price_cents, voice_commands, install_count
         FROM talents WHERE status = 'approved' AND category = $1 ORDER BY install_count DESC`
      : `SELECT id, name, display_name, description, category, pricing_type, price_cents, voice_commands, install_count
         FROM talents WHERE status = 'approved' ORDER BY install_count DESC`;
    const result = await this.db.query(query, category ? [category] : []);
    return result.rows.map(this.toPublicTalent);
  }

  async getTalentPublic(id: string): Promise<PublicTalent | null> {
    const result = await this.db.query(
      `SELECT id, name, display_name, description, category, pricing_type, price_cents, voice_commands, install_count
       FROM talents WHERE id = $1 AND status = 'approved'`,
      [id]
    );
    return result.rows[0] ? this.toPublicTalent(result.rows[0]) : null;
  }

  async installTalent(userId: string, talentId: string, stripeSubscriptionId?: string): Promise<void> {
    await this.db.query(
      `INSERT INTO talent_installs (user_id, talent_id, stripe_subscription_id)
       VALUES ($1, $2, $3) ON CONFLICT (user_id, talent_id) DO NOTHING`,
      [userId, talentId, stripeSubscriptionId ?? null]
    );
    await this.db.query(
      `UPDATE talents SET install_count = install_count + 1 WHERE id = $1`,
      [talentId]
    );
  }

  async uninstallTalent(userId: string, talentId: string): Promise<void> {
    const result = await this.db.query(
      `DELETE FROM talent_installs WHERE user_id = $1 AND talent_id = $2`,
      [userId, talentId]
    );
    if ((result.rowCount ?? 0) > 0) {
      await this.db.query(
        `UPDATE talents SET install_count = GREATEST(install_count - 1, 0) WHERE id = $1`,
        [talentId]
      );
    }
  }

  async getUserInstalls(userId: string): Promise<PublicTalent[]> {
    const result = await this.db.query(
      `SELECT t.id, t.name, t.display_name, t.description, t.category, t.pricing_type, t.price_cents, t.voice_commands, t.install_count
       FROM talents t
       JOIN talent_installs ti ON ti.talent_id = t.id
       WHERE ti.user_id = $1 AND t.status = 'approved'
       ORDER BY ti.installed_at DESC`,
      [userId]
    );
    return result.rows.map(this.toPublicTalent);
  }

  // ── DEVELOPER PROGRAM CHECK ────────────────────────────────────────

  async hasDeveloperProgram(userId: string): Promise<boolean> {
    const result = await this.db.query(
      `SELECT 1 FROM developer_programs WHERE user_id = $1 AND status = 'active' AND expires_at > NOW()`,
      [userId]
    );
    return (result.rowCount ?? 0) > 0;
  }

  // ── DEVELOPER (talent author) ──────────────────────────────────────

  async submitTalent(developerUserId: string, data: {
    name: string;
    displayName: string;
    description?: string;
    category?: string;
    pricingType: "free" | "paid";
    priceCents?: number;
    subgraphUrl: string;
    voiceCommands?: any[];
  }): Promise<Talent> {
    const result = await this.db.query(
      `INSERT INTO talents (developer_user_id, name, display_name, description, category, pricing_type, price_cents, subgraph_url, voice_commands)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        developerUserId, data.name, data.displayName, data.description ?? null,
        data.category ?? null, data.pricingType, data.priceCents ?? null,
        data.subgraphUrl, JSON.stringify(data.voiceCommands ?? []),
      ]
    );
    return this.toTalent(result.rows[0]);
  }

  async updateTalent(talentId: string, developerUserId: string, updates: Partial<{
    displayName: string;
    description: string;
    category: string;
    voiceCommands: any[];
  }>): Promise<Talent | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (updates.displayName !== undefined) { fields.push(`display_name = $${i++}`); values.push(updates.displayName); }
    if (updates.description !== undefined) { fields.push(`description = $${i++}`); values.push(updates.description); }
    if (updates.category !== undefined) { fields.push(`category = $${i++}`); values.push(updates.category); }
    if (updates.voiceCommands !== undefined) { fields.push(`voice_commands = $${i++}`); values.push(JSON.stringify(updates.voiceCommands)); }

    if (fields.length === 0) return null;

    values.push(talentId, developerUserId);
    const result = await this.db.query(
      `UPDATE talents SET ${fields.join(", ")} WHERE id = $${i++} AND developer_user_id = $${i++} RETURNING *`,
      values
    );
    return result.rows[0] ? this.toTalent(result.rows[0]) : null;
  }

  async getDeveloperTalents(developerUserId: string): Promise<Talent[]> {
    const result = await this.db.query(
      `SELECT * FROM talents WHERE developer_user_id = $1 ORDER BY created_at DESC`,
      [developerUserId]
    );
    return result.rows.map(this.toTalent);
  }

  async getTalentAnalytics(talentId: string, developerUserId: string) {
    const result = await this.db.query(
      `SELECT id, name, display_name, install_count, status FROM talents WHERE id = $1 AND developer_user_id = $2`,
      [talentId, developerUserId]
    );
    if (!result.rows[0]) return null;
    return { ...result.rows[0], installCount: result.rows[0].install_count };
  }

  // ── ADMIN ──────────────────────────────────────────────────────────

  async setTalentStatus(talentId: string, status: TalentStatus): Promise<void> {
    await this.db.query(
      `UPDATE talents SET status = $1, reviewed_at = NOW() WHERE id = $2`,
      [status, talentId]
    );
  }

  // ── INTERNAL — used by Apollo Router hot-reload ─────────────────────

  async getApprovedSubgraphUrls(): Promise<{ name: string; subgraphUrl: string }[]> {
    const result = await this.db.query(
      `SELECT name, subgraph_url FROM talents WHERE status = 'approved' AND subgraph_url IS NOT NULL`
    );
    return result.rows.map((r: any) => ({ name: r.name, subgraphUrl: r.subgraph_url }));
  }

  // ── PRIVATE HELPERS ────────────────────────────────────────────────

  private toPublicTalent(row: any): PublicTalent {
    // CRITICAL: never include subgraph_url or developer_user_id
    return {
      id: row.id,
      name: row.name,
      displayName: row.display_name,
      description: row.description,
      category: row.category,
      pricingType: row.pricing_type,
      priceMonthly: row.price_cents ? row.price_cents / 100 : null,
      voiceCommands: row.voice_commands,
      installCount: row.install_count,
    };
  }

  private toTalent(row: any): Talent {
    return {
      id: row.id,
      developerUserId: row.developer_user_id,
      name: row.name,
      displayName: row.display_name,
      description: row.description,
      category: row.category,
      pricingType: row.pricing_type,
      priceCents: row.price_cents,
      voiceCommands: row.voice_commands,
      status: row.status,
      installCount: row.install_count,
      createdAt: row.created_at,
      reviewedAt: row.reviewed_at,
    };
  }
}
```

### 5. Routes

Create `backend/src/features/talent-registry/talent-registry.routes.ts`:

```typescript
import { Router } from "express";
import { TalentRegistryService } from "./talent-registry.service";
import { apiKeyAuth } from "../../middleware/api-key-auth";
import { adminOnly } from "../../middleware/admin-only";  // create if it doesn't exist

export function createTalentRegistryRouter(service: TalentRegistryService): Router {
  const router = Router();

  // ── PUBLIC BROWSING (no auth required) ──────────────────────────────

  // GET /api/talents — list approved talents, optional ?category= filter
  router.get("/", async (req, res) => {
    try {
      const talents = await service.listApprovedTalents(req.query.category as string | undefined);
      res.json({ talents });
    } catch (err) {
      res.status(500).json({ error: "internal_error" });
    }
  });

  // GET /api/talents/:id — single talent public metadata
  router.get("/:id", async (req, res) => {
    try {
      const talent = await service.getTalentPublic(req.params.id);
      if (!talent) return res.status(404).json({ error: "talent_not_found" });
      res.json({ talent });
    } catch (err) {
      res.status(500).json({ error: "internal_error" });
    }
  });

  // ── SUBSCRIBER: INSTALL / UNINSTALL (API key auth) ────────────────

  // POST /api/talents/:id/install
  router.post("/:id/install", apiKeyAuth, async (req, res) => {
    try {
      const talent = await service.getTalentPublic(req.params.id);
      if (!talent) return res.status(404).json({ error: "talent_not_found" });

      if (talent.pricingType === "paid") {
        // Paid talent: caller must supply stripe_subscription_id from Stripe checkout
        // The actual Stripe checkout is handled by Prompt 08 — for now return a stub
        return res.status(402).json({
          error: "payment_required",
          message: "This Talent requires a paid subscription.",
          checkoutUrl: null, // Populated in Prompt 08
        });
      }

      await service.installTalent((req as any).claraUser.userId, req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "internal_error" });
    }
  });

  // DELETE /api/talents/:id/install
  router.delete("/:id/install", apiKeyAuth, async (req, res) => {
    try {
      await service.uninstallTalent((req as any).claraUser.userId, req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "internal_error" });
    }
  });

  // GET /api/talents/me/installed — list user's installed Talents
  router.get("/me/installed", apiKeyAuth, async (req, res) => {
    try {
      const talents = await service.getUserInstalls((req as any).claraUser.userId);
      res.json({ talents });
    } catch (err) {
      res.status(500).json({ error: "internal_error" });
    }
  });

  // ── DEVELOPER MANAGEMENT (API key auth + Developer Program check) ──

  // POST /api/talents — submit a new Talent
  router.post("/", apiKeyAuth, async (req, res) => {
    try {
      const userId = (req as any).claraUser.userId;
      const hasProgram = await service.hasDeveloperProgram(userId);
      if (!hasProgram) {
        return res.status(403).json({
          error: "developer_program_required",
          message: "Submitting a Talent requires an active Developer Program membership ($99/year).",
          enrollUrl: "/api/developer-program/enroll",
        });
      }
      const { name, displayName, description, category, pricingType, priceCents, subgraphUrl, voiceCommands } = req.body;
      if (!name || !displayName || !subgraphUrl || !pricingType) {
        return res.status(400).json({ error: "missing_required_fields", required: ["name", "displayName", "subgraphUrl", "pricingType"] });
      }
      const talent = await service.submitTalent(userId, { name, displayName, description, category, pricingType, priceCents, subgraphUrl, voiceCommands });
      res.status(201).json({ talent: { id: talent.id, name: talent.name, status: talent.status } });
    } catch (err: any) {
      if (err.code === "23505") return res.status(409).json({ error: "talent_name_taken" });
      res.status(500).json({ error: "internal_error" });
    }
  });

  // PUT /api/talents/:id — update Talent metadata
  router.put("/:id", apiKeyAuth, async (req, res) => {
    try {
      const userId = (req as any).claraUser.userId;
      const talent = await service.updateTalent(req.params.id, userId, req.body);
      if (!talent) return res.status(404).json({ error: "talent_not_found" });
      res.json({ talent: { id: talent.id, status: talent.status } });
    } catch (err) {
      res.status(500).json({ error: "internal_error" });
    }
  });

  // GET /api/talents/:id/analytics — install count + revenue (developer only)
  router.get("/:id/analytics", apiKeyAuth, async (req, res) => {
    try {
      const userId = (req as any).claraUser.userId;
      const analytics = await service.getTalentAnalytics(req.params.id, userId);
      if (!analytics) return res.status(404).json({ error: "talent_not_found" });
      res.json({ analytics });
    } catch (err) {
      res.status(500).json({ error: "internal_error" });
    }
  });

  // ── ADMIN: APPROVE / REJECT (Clara team only) ────────────────────

  // PATCH /api/admin/talents/:id/status
  router.patch("/admin/:id/status", apiKeyAuth, adminOnly, async (req, res) => {
    try {
      const { status } = req.body;
      const validStatuses = ["approved", "rejected", "suspended", "pending"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "invalid_status", valid: validStatuses });
      }
      await service.setTalentStatus(req.params.id, status);
      res.json({ success: true, status });
    } catch (err) {
      res.status(500).json({ error: "internal_error" });
    }
  });

  return router;
}
```

### 6. `admin-only` middleware (create if it doesn't exist)

Create `backend/src/middleware/admin-only.ts`:

```typescript
import { Request, Response, NextFunction } from "express";

export function adminOnly(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).claraUser;
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "admin_required" });
  }
  next();
}
```

This requires that the `api_keys` table (from Prompt 01) and the `claraUser` object include a `role` field. If `role` isn't yet in the API key auth flow, add `role VARCHAR(50) NOT NULL DEFAULT 'user'` to the `api_keys` table and set `role: 'admin'` for Clara internal keys. Clara team keys are provisioned directly in the DB, not through the normal checkout flow.

### 7. Mount in app.ts

In `backend/src/app.ts`:
```typescript
import { createTalentRegistryRouter } from "./features/talent-registry";
import { TalentRegistryService } from "./features/talent-registry/talent-registry.service";

const talentService = new TalentRegistryService(db);
app.use("/api/talents", createTalentRegistryRouter(talentService));
// Admin routes are mounted under /api/talents/admin/:id/status (see routes file)
```

---

## Tests Required

Create `backend/src/__tests__/talent-registry.test.ts`:

- `GET /api/talents` → 200 with `{ talents: [] }` when table is empty
- `POST /api/talents` without auth → 401
- `POST /api/talents` with valid API key but no Developer Program → 403 `developer_program_required`
- `POST /api/talents` with Developer Program → 201, talent created with `status: "pending"`
- `POST /api/talents/:id/install` on free Talent → 200 success, install_count incremented
- `POST /api/talents/:id/install` on paid Talent → 402 `payment_required`
- `DELETE /api/talents/:id/install` → 200, install_count decremented
- `PATCH /api/admin/talents/:id/status` without admin role → 403
- `PATCH /api/admin/talents/:id/status` with admin role → 200, status updated
- `GET /api/talents/:id` for approved talent → 200, does NOT include `subgraphUrl` or `developerUserId`

All tests must pass. `npm test` exits zero.

---

## Acceptance Criteria

- [ ] Migration runs cleanly on local, dev, and production DBs
- [ ] `GET /api/talents` returns only approved Talents, never includes `subgraphUrl`
- [ ] `POST /api/talents` requires active Developer Program
- [ ] `POST /api/talents/:id/install` works for free Talents; returns 402 stub for paid (until Prompt 08)
- [ ] Admin status endpoint protected by `adminOnly` middleware
- [ ] `npm run build` — no TypeScript errors
- [ ] `npm test` — all tests pass

## Do NOT

- Do not return `subgraph_url` in ANY public-facing response — ever
- Do not return `developer_user_id` in public Talent responses
- Do not implement Stripe checkout for paid Talent installs here — that is Prompt 08
- Do not touch the Apollo Router or supergraph composition here — Prompt 06 owns that
