# Standup and Sprint Engine

**TARGET REPO:** imaginationeverywhere/clara-code
**Priority:** P0 — depends on prompts 00 and 08 (memory + agent messaging)
**Packages:** `backend/`
**Milestone:** Agents operate in sprints, report at standups, and track delivery at agent speed — not human calendar speed

---

## Product Requirement

A sprint ends when the work is done, not when two weeks expire. Agents standup when there is something to report, not when a calendar says so. This is SDLC at agent speed. The standup is the memory compression event — it is when each agent summarizes what it has done and those summaries flow into the global user profile.

---

## Architecture

```
Sprint created (user or Clara initiates)
    → Sprint goal set, tasks assigned to agents
    → Each agent claims its tasks

Agents work (voice/text sessions, agent-to-agent messages)

Standup triggered (scheduled, milestone, or user command)
    → Each assigned agent generates a standup report
    → Report: delivered, in_progress, blocked, message_count
    → Report saved to standup_reports table
    → Agent's memory summary updated from report
    → Global user profile updated with cross-agent summary
    → Unread agent messages flagged for attention

Sprint completes (Clara determines all tasks done)
    → Sprint status → 'complete'
    → Retrospective generated: what shipped, what to improve
    → Next sprint created if backlog exists
```

---

## Part 1 — Database Migration

**File:** `backend/migrations/009_sprints_and_standups.sql`

```sql
-- Sprint and standup tracking for agent-speed SDLC.
-- Run: psql $DATABASE_URL -f backend/migrations/009_sprints_and_standups.sql

-- A sprint is a unit of work for an agent team
CREATE TABLE IF NOT EXISTS sprints (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         VARCHAR(255) NOT NULL,
  goal            TEXT         NOT NULL,   -- "Wire Clara voice greeting end-to-end"
  status          VARCHAR(30)  NOT NULL DEFAULT 'active',
    -- 'active' | 'standup' | 'complete' | 'retrospective'
  retrospective   TEXT,                    -- AI-written after completion
  started_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  sprint_number   INTEGER      NOT NULL DEFAULT 1  -- auto-increments per user
);

CREATE INDEX IF NOT EXISTS idx_sprints_user_status
  ON sprints (user_id, status);

-- Tasks within a sprint, each owned by one agent
CREATE TABLE IF NOT EXISTS sprint_tasks (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id       UUID         NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
  user_id         VARCHAR(255) NOT NULL,
  agent_id        VARCHAR(255) NOT NULL,   -- which agent owns this task
  title           TEXT         NOT NULL,
  description     TEXT,
  status          VARCHAR(30)  NOT NULL DEFAULT 'claimed',
    -- 'claimed' | 'in_progress' | 'blocked' | 'done'
  blocker         TEXT,                    -- what is blocking this task
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sprint_tasks_sprint
  ON sprint_tasks (sprint_id, agent_id);

CREATE INDEX IF NOT EXISTS idx_sprint_tasks_agent
  ON sprint_tasks (user_id, agent_id, status);

-- Standup report per agent per standup event
CREATE TABLE IF NOT EXISTS standup_reports (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id       UUID         REFERENCES sprints(id) ON DELETE SET NULL,
  user_id         VARCHAR(255) NOT NULL,
  agent_id        VARCHAR(255) NOT NULL,
  delivered       TEXT,                    -- what was completed
  in_progress     TEXT,                    -- what is active
  blocked         TEXT,                    -- what is stuck
  message_count   INTEGER      NOT NULL DEFAULT 0,  -- agent-to-agent messages sent
  turn_count      INTEGER      NOT NULL DEFAULT 0,  -- voice/text turns since last standup
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_standup_sprint_agent
  ON standup_reports (sprint_id, agent_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_standup_user_created
  ON standup_reports (user_id, created_at DESC);
```

Run against all three environments.

---

## Part 2 — Sequelize Models

**File:** `backend/src/models/Sprint.ts`

```typescript
import { Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import { SprintTask } from "./SprintTask";

@Table({ tableName: "sprints" })
export class Sprint extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string;

  @Column({ type: DataType.STRING(255), allowNull: false, field: "user_id" })
  declare userId: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare goal: string;

  @Column({ type: DataType.STRING(30), allowNull: false, defaultValue: "active" })
  declare status: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare retrospective: string | null;

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW, field: "started_at" })
  declare startedAt: Date;

  @Column({ type: DataType.DATE, allowNull: true, field: "completed_at" })
  declare completedAt: Date | null;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 1, field: "sprint_number" })
  declare sprintNumber: number;

  @HasMany(() => SprintTask)
  declare tasks: SprintTask[];
}
```

**File:** `backend/src/models/SprintTask.ts`

```typescript
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { Sprint } from "./Sprint";

@Table({ tableName: "sprint_tasks", timestamps: false })
export class SprintTask extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string;

  @ForeignKey(() => Sprint)
  @Column({ type: DataType.UUID, allowNull: false, field: "sprint_id" })
  declare sprintId: string;

  @BelongsTo(() => Sprint)
  declare sprint: Sprint;

  @Column({ type: DataType.STRING(255), allowNull: false, field: "user_id" })
  declare userId: string;

  @Column({ type: DataType.STRING(255), allowNull: false, field: "agent_id" })
  declare agentId: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare title: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare description: string | null;

  @Column({ type: DataType.STRING(30), allowNull: false, defaultValue: "claimed" })
  declare status: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare blocker: string | null;

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW, field: "created_at" })
  declare createdAt: Date;

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW, field: "updated_at" })
  declare updatedAt: Date;
}
```

**File:** `backend/src/models/StandupReport.ts`

```typescript
import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({ tableName: "standup_reports" })
export class StandupReport extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string;

  @Column({ type: DataType.UUID, allowNull: true, field: "sprint_id" })
  declare sprintId: string | null;

  @Column({ type: DataType.STRING(255), allowNull: false, field: "user_id" })
  declare userId: string;

  @Column({ type: DataType.STRING(255), allowNull: false, field: "agent_id" })
  declare agentId: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare delivered: string | null;

  @Column({ type: DataType.TEXT, allowNull: true, field: "in_progress" })
  declare inProgress: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare blocked: string | null;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0, field: "message_count" })
  declare messageCount: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0, field: "turn_count" })
  declare turnCount: number;

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW, field: "created_at" })
  declare createdAt: Date;
}
```

Register all three models in Sequelize connection setup.

---

## Part 3 — Sprint Service

**File:** `backend/src/services/sprint.service.ts`

```typescript
import { Sprint } from "@/models/Sprint";
import { SprintTask } from "@/models/SprintTask";
import { StandupReport } from "@/models/StandupReport";
import { ConversationTurn } from "@/models/ConversationTurn";
import { agentMessagingService } from "./agent-messaging.service";
import logger from "@/lib/logger";

export class SprintService {
  /** Create a new sprint. Sprint number auto-increments per user. */
  async createSprint(userId: string, goal: string): Promise<Sprint> {
    const count = await Sprint.count({ where: { userId } });
    return Sprint.create({ userId, goal, sprintNumber: count + 1 });
  }

  /** Add a task to a sprint, claimed by a specific agent. */
  async addTask(
    sprintId: string,
    userId: string,
    agentId: string,
    title: string,
    description?: string,
  ): Promise<SprintTask> {
    return SprintTask.create({ sprintId, userId, agentId, title, description });
  }

  /** Agent updates its task status. */
  async updateTask(
    taskId: string,
    status: "in_progress" | "blocked" | "done",
    blocker?: string,
  ): Promise<void> {
    await SprintTask.update(
      { status, blocker: blocker ?? null, updatedAt: new Date() },
      { where: { id: taskId } },
    );
  }

  /**
   * Generate a standup report for one agent.
   * Reads: tasks since last standup, turn count, message count.
   * Saves report, updates agent memory summary.
   */
  async generateStandupReport(
    userId: string,
    agentId: string,
    sprintId?: string,
  ): Promise<StandupReport> {
    // Get last standup time for this agent
    const lastStandup = await StandupReport.findOne({
      where: { userId, agentId },
      order: [["created_at", "DESC"]],
    });
    const since = lastStandup?.createdAt ?? new Date(0);

    // Count turns since last standup
    const turnCount = await ConversationTurn.count({
      where: {
        userId,
        agentId,
        createdAt: { $gte: since } as never,
      },
    });

    // Count messages sent since last standup
    const messageCount = await agentMessagingService.countSentThisMonth(
      userId,
      since.toISOString().slice(0, 7).replace("-", "-") + "-01",
    );

    // Get task status for this agent
    const tasks = sprintId
      ? await SprintTask.findAll({ where: { sprintId, agentId } })
      : [];

    const done = tasks.filter((t) => t.status === "done").map((t) => t.title);
    const active = tasks.filter((t) => t.status === "in_progress").map((t) => t.title);
    const blocked = tasks.filter((t) => t.status === "blocked");

    const report = await StandupReport.create({
      sprintId: sprintId ?? null,
      userId,
      agentId,
      delivered: done.length > 0 ? done.join("; ") : null,
      inProgress: active.length > 0 ? active.join("; ") : null,
      blocked: blocked.length > 0
        ? blocked.map((t) => `${t.title}: ${t.blocker ?? "unspecified"}`).join("; ")
        : null,
      messageCount,
      turnCount,
    });

    return report;
  }

  /** Check if all tasks in a sprint are done. If so, mark sprint complete. */
  async checkSprintCompletion(sprintId: string): Promise<boolean> {
    const tasks = await SprintTask.findAll({ where: { sprintId } });
    if (tasks.length === 0) return false;
    const allDone = tasks.every((t) => t.status === "done");
    if (allDone) {
      await Sprint.update(
        { status: "complete", completedAt: new Date() },
        { where: { id: sprintId } },
      );
    }
    return allDone;
  }

  /** Get active sprint for a user (most recent active one). */
  async getActiveSprint(userId: string): Promise<Sprint | null> {
    return Sprint.findOne({
      where: { userId, status: "active" },
      order: [["started_at", "DESC"]],
      include: [SprintTask],
    });
  }

  /** Get sprint velocity: average turns per completed sprint. */
  async getVelocity(userId: string): Promise<{ avgTurnsPerSprint: number; sprintsCompleted: number }> {
    const completed = await Sprint.count({ where: { userId, status: "complete" } });
    const reports = await StandupReport.findAll({ where: { userId } });
    const totalTurns = reports.reduce((sum, r) => sum + r.turnCount, 0);
    return {
      sprintsCompleted: completed,
      avgTurnsPerSprint: completed > 0 ? Math.round(totalTurns / completed) : 0,
    };
  }
}

export const sprintService = new SprintService();
```

---

## Part 4 — API Routes

**File:** `backend/src/routes/sprints.ts` (new file)

```typescript
import { Router, type Response } from "express";
import { requireClaraOrClerk } from "@/middleware/api-key-auth";
import type { AuthenticatedRequest } from "@/middleware/clerk-auth";
import type { ApiKeyRequest } from "@/middleware/api-key-auth";
import { sprintService } from "@/services/sprint.service";

const router = Router();

// POST /api/sprints — create a new sprint
router.post("/", requireClaraOrClerk, async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
  const userId = req.claraUser?.userId;
  if (!userId) { res.status(401).json({ error: "Authenticated user required" }); return; }
  const { goal } = req.body as { goal?: string };
  if (!goal) { res.status(400).json({ error: "goal is required" }); return; }
  const sprint = await sprintService.createSprint(userId, goal);
  res.status(201).json(sprint);
});

// GET /api/sprints/active — get current active sprint with tasks
router.get("/active", requireClaraOrClerk, async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
  const userId = req.claraUser?.userId;
  if (!userId) { res.status(401).json({ error: "Authenticated user required" }); return; }
  const sprint = await sprintService.getActiveSprint(userId);
  res.json(sprint ?? null);
});

// POST /api/sprints/:sprintId/tasks — add a task
router.post("/:sprintId/tasks", requireClaraOrClerk, async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
  const userId = req.claraUser?.userId;
  if (!userId) { res.status(401).json({ error: "Authenticated user required" }); return; }
  const { agent_id, title, description } = req.body as { agent_id?: string; title?: string; description?: string };
  if (!agent_id || !title) { res.status(400).json({ error: "agent_id and title are required" }); return; }
  const task = await sprintService.addTask(req.params.sprintId, userId, agent_id, title, description);
  res.status(201).json(task);
});

// PATCH /api/sprints/tasks/:taskId — update task status
router.patch("/tasks/:taskId", requireClaraOrClerk, async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
  const { status, blocker } = req.body as { status?: string; blocker?: string };
  if (!status) { res.status(400).json({ error: "status is required" }); return; }
  await sprintService.updateTask(req.params.taskId, status as never, blocker);
  res.json({ ok: true });
});

// POST /api/sprints/:sprintId/standup — trigger standup for one agent
router.post("/:sprintId/standup", requireClaraOrClerk, async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
  const userId = req.claraUser?.userId;
  if (!userId) { res.status(401).json({ error: "Authenticated user required" }); return; }
  const { agent_id } = req.body as { agent_id?: string };
  if (!agent_id) { res.status(400).json({ error: "agent_id is required" }); return; }
  const report = await sprintService.generateStandupReport(userId, agent_id, req.params.sprintId);
  res.json(report);
});

// GET /api/sprints/velocity — delivery speed metrics
router.get("/velocity", requireClaraOrClerk, async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
  const userId = req.claraUser?.userId;
  if (!userId) { res.status(401).json({ error: "Authenticated user required" }); return; }
  const velocity = await sprintService.getVelocity(userId);
  res.json(velocity);
});

export default router;
```

**Register in `backend/src/server.ts`:**
```typescript
import sprintRoutes from "./routes/sprints";
app.use("/api/sprints", sprintRoutes);
```

---

## Acceptance Criteria

- [ ] `sprints`, `sprint_tasks`, `standup_reports` tables created
- [ ] Sprint creates with auto-incrementing sprint number per user
- [ ] Tasks can be added to a sprint, assigned to an agent
- [ ] Agent can update task status to `in_progress`, `blocked`, `done`
- [ ] `generateStandupReport` counts turns + messages since last standup, captures task state
- [ ] Sprint auto-marks `complete` when all tasks are `done`
- [ ] `GET /api/sprints/velocity` returns throughput metrics
- [ ] All models registered in Sequelize setup
- [ ] `npm run type-check` passes
- [ ] Tests cover sprint lifecycle: create → add tasks → update → complete

## Branch + PR

```bash
git checkout -b prompt/2026-04-23/09-standup-and-sprint-engine
git commit -m "feat(sprints): agent-speed sprint engine — standups, task tracking, velocity metrics"
gh pr create --base develop --title "feat(sprints): standup and sprint engine for agent-speed SDLC"
```
