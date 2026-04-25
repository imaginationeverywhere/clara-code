# Clara as Scrum Master — Memory Coordinator + Sprint Orchestrator

**TARGET REPO:** imaginationeverywhere/clara-code
**Priority:** P0 — depends on prompts 00, 08, 09 (memory + messaging + sprints)
**Packages:** `backend/`
**Milestone:** Clara reads all agents, runs standups, writes sprint summaries, and holds the unified picture of what the user's entire team is doing

---

## Product Requirement

Clara is the only agent with a god-view of the user's whole team. When you ask "what are my agents working on?", Clara knows. When Agent A is blocked and Agent B can help, Clara sees it and routes the message. When a sprint ends, Clara writes the retrospective. When standups happen, Clara aggregates all reports into one coherent summary for the user.

Every other agent knows only its own domain. Clara knows everything.

---

## Architecture

```
User: "Clara, run standup"
     ↓
Clara reads ALL agents' recent activity:
  - Last N turns per agent (from conversation_turns)
  - Active sprint tasks per agent (from sprint_tasks)
  - Unread cross-agent messages (from agent_messages)
  - Last standup report per agent (from standup_reports)
     ↓
Clara calls voice server with aggregated context
  → Voice server generates unified standup summary
     ↓
Clara broadcasts standup trigger to all agents (agent_messages to_agent_id='all')
  → Each agent's next session starts with standup context
     ↓
Clara sends summary to user (voice + text)
     ↓
Clara updates global user_profile with what shipped
```

---

## Part 1 — Global User Profile Table

**File:** `backend/migrations/010_user_profile.sql`

```sql
-- Global user profile — readable by ALL agents, maintained by Clara.
-- One row per user. Every agent reads this at session start.
-- Run: psql $DATABASE_URL -f backend/migrations/010_user_profile.sql

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id           VARCHAR(255) PRIMARY KEY,
  display_name      TEXT,
  active_projects   JSONB NOT NULL DEFAULT '[]',
    -- [{ "name": "Clara CLI", "description": "voice coding tool", "status": "active" }]
  tech_stack        JSONB NOT NULL DEFAULT '[]',
    -- ["TypeScript", "Next.js", "PostgreSQL", "Tauri"]
  preferences       JSONB NOT NULL DEFAULT '[]',
    -- ["No verbose explanations", "Commit directly to develop when Mo is watching"]
  cross_agent_log   JSONB NOT NULL DEFAULT '[]',
    -- [{ "agent": "stripe-agent", "event": "setup webhooks", "date": "2026-04-21" }]
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Run against all three environments.

---

## Part 2 — User Profile Model + Service

**File:** `backend/src/models/UserProfile.ts`

```typescript
import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({ tableName: "user_profiles" })
export class UserProfile extends Model {
  @Column({ type: DataType.STRING(255), primaryKey: true, field: "user_id" })
  declare userId: string;

  @Column({ type: DataType.TEXT, allowNull: true, field: "display_name" })
  declare displayName: string | null;

  @Column({ type: DataType.JSONB, allowNull: false, defaultValue: [], field: "active_projects" })
  declare activeProjects: { name: string; description: string; status: string }[];

  @Column({ type: DataType.JSONB, allowNull: false, defaultValue: [], field: "tech_stack" })
  declare techStack: string[];

  @Column({ type: DataType.JSONB, allowNull: false, defaultValue: [] })
  declare preferences: string[];

  @Column({ type: DataType.JSONB, allowNull: false, defaultValue: [], field: "cross_agent_log" })
  declare crossAgentLog: { agent: string; event: string; date: string }[];

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW, field: "updated_at" })
  declare updatedAt: Date;
}
```

Register in Sequelize connection setup.

---

## Part 3 — Clara Scrum Master Service

**File:** `backend/src/services/clara-scrum.service.ts`

```typescript
import { StandupReport } from "@/models/StandupReport";
import { SprintTask } from "@/models/SprintTask";
import { AgentUserMemory } from "@/models/AgentUserMemory";
import { UserProfile } from "@/models/UserProfile";
import { agentMessagingService } from "./agent-messaging.service";
import { sprintService } from "./sprint.service";
import logger from "@/lib/logger";

export type AgentStandupSummary = {
  agentId: string;
  delivered: string | null;
  inProgress: string | null;
  blocked: string | null;
  messageCount: number;
  turnCount: number;
  lastSeenAt: string | null;
};

export type TeamStandupReport = {
  sprintId: string | null;
  sprintGoal: string | null;
  agents: AgentStandupSummary[];
  blockers: { agentId: string; blocker: string }[];
  totalDelivered: number;       // tasks marked done across all agents
  totalInProgress: number;
  totalBlocked: number;
  crossAgentMessages: number;   // messages sent between agents this standup window
  generatedAt: string;
};

export class ClaraScrumService {
  /**
   * Run a full team standup. Clara calls this when user says "standup" or on schedule.
   * Returns a unified report Clara can read to the user.
   */
  async runTeamStandup(userId: string, sprintId?: string): Promise<TeamStandupReport> {
    // Get all agents this user has memory with
    const agentMemories = await AgentUserMemory.findAll({
      where: { userId },
      order: [["last_session_at", "DESC"]],
    });

    // Get active sprint if not provided
    let sprintGoal: string | null = null;
    let resolvedSprintId = sprintId ?? null;
    if (!resolvedSprintId) {
      const activeSprint = await sprintService.getActiveSprint(userId);
      if (activeSprint) {
        resolvedSprintId = activeSprint.id;
        sprintGoal = activeSprint.goal;
      }
    }

    // Generate standup report for each agent
    const agentSummaries: AgentStandupSummary[] = [];
    const blockers: { agentId: string; blocker: string }[] = [];

    for (const memory of agentMemories) {
      if (memory.agentId === "clara") continue; // Clara doesn't report on herself in standup

      const report = await sprintService.generateStandupReport(
        userId,
        memory.agentId,
        resolvedSprintId ?? undefined,
      );

      agentSummaries.push({
        agentId: memory.agentId,
        delivered: report.delivered,
        inProgress: report.inProgress,
        blocked: report.blocked,
        messageCount: report.messageCount,
        turnCount: report.turnCount,
        lastSeenAt: memory.lastSessionAt?.toISOString() ?? null,
      });

      if (report.blocked) {
        blockers.push({ agentId: memory.agentId, blocker: report.blocked });
      }
    }

    // Count cross-agent messages since last standup
    const unreadCount = await agentMessagingService.countUnread(userId);

    // Broadcast standup trigger to all agents so they pick it up next session
    await agentMessagingService.send({
      userId,
      fromAgentId: "clara",
      toAgentId: "all",
      messageType: "broadcast",
      content: `Standup held at ${new Date().toISOString()}. Review your tasks and update status.`,
      metadata: { sprintId: resolvedSprintId },
    });

    // Update user profile with cross-agent log
    await this.updateCrossAgentLog(userId, agentSummaries);

    // Check if sprint is complete
    if (resolvedSprintId) {
      await sprintService.checkSprintCompletion(resolvedSprintId);
    }

    const report: TeamStandupReport = {
      sprintId: resolvedSprintId,
      sprintGoal,
      agents: agentSummaries,
      blockers,
      totalDelivered: agentSummaries.filter((a) => a.delivered).length,
      totalInProgress: agentSummaries.filter((a) => a.inProgress).length,
      totalBlocked: blockers.length,
      crossAgentMessages: unreadCount,
      generatedAt: new Date().toISOString(),
    };

    return report;
  }

  /**
   * Get any agent's memory summary — Clara-only view.
   * Clara can read all agents' summaries to answer "what is my Stripe agent up to?"
   */
  async getAgentSummaryForUser(
    userId: string,
    agentId: string,
  ): Promise<{ summary: string | null; keyFacts: string[]; lastSessionAt: string | null }> {
    const memory = await AgentUserMemory.findOne({ where: { userId, agentId } });
    return {
      summary: memory?.summary ?? null,
      keyFacts: memory?.keyFacts ?? [],
      lastSessionAt: memory?.lastSessionAt?.toISOString() ?? null,
    };
  }

  /**
   * Get or create the global user profile.
   * Every agent reads this at session start for shared context.
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    const [profile] = await UserProfile.findOrCreate({
      where: { userId },
      defaults: { userId },
    });
    return profile;
  }

  /** Update the cross-agent log in the user profile after standup. */
  async updateCrossAgentLog(userId: string, summaries: AgentStandupSummary[]): Promise<void> {
    try {
      const [profile] = await UserProfile.findOrCreate({
        where: { userId },
        defaults: { userId },
      });
      const today = new Date().toISOString().split("T")[0];
      const newEvents = summaries
        .filter((s) => s.delivered)
        .map((s) => ({
          agent: s.agentId,
          event: s.delivered!,
          date: today,
        }));

      if (newEvents.length > 0) {
        // Keep last 50 events in the log
        const updatedLog = [...(profile.crossAgentLog ?? []), ...newEvents].slice(-50);
        await profile.update({ crossAgentLog: updatedLog, updatedAt: new Date() });
      }
    } catch (err) {
      logger.error("[clara-scrum] updateCrossAgentLog failed:", err);
    }
  }

  /** Build the standup prompt text Clara passes to the voice server. */
  buildStandupPrompt(report: TeamStandupReport): string {
    const lines: string[] = [];
    lines.push(`[Team Standup — ${report.generatedAt}]`);
    if (report.sprintGoal) lines.push(`Sprint goal: ${report.sprintGoal}`);
    for (const agent of report.agents) {
      lines.push(`\nAgent ${agent.agentId}:`);
      if (agent.delivered) lines.push(`  ✓ Delivered: ${agent.delivered}`);
      if (agent.inProgress) lines.push(`  → In progress: ${agent.inProgress}`);
      if (agent.blocked) lines.push(`  ✗ Blocked: ${agent.blocked}`);
      if (!agent.delivered && !agent.inProgress) lines.push(`  — No activity since last standup`);
    }
    if (report.blockers.length > 0) {
      lines.push(`\nBlockers requiring attention: ${report.blockers.length}`);
    }
    lines.push(`\nCross-agent messages pending: ${report.crossAgentMessages}`);
    return lines.join("\n");
  }
}

export const claraScrumService = new ClaraScrumService();
```

---

## Part 4 — Update Memory Context to Include Global Profile

**File:** `backend/src/services/memory.service.ts`

Update `getMemoryContext` to include the global user profile. Every agent (not just Clara) reads the user profile so they have shared context without being re-told who the user is.

```typescript
import { UserProfile } from "@/models/UserProfile";
import { claraScrumService } from "./clara-scrum.service";

// Add to MemoryContext type:
userProfile: {
  displayName: string | null;
  activeProjects: { name: string; description: string; status: string }[];
  techStack: string[];
  preferences: string[];
} | null;

// Add to Promise.all in getMemoryContext:
const [memory, recentRows, inbox, profile] = await Promise.all([
  AgentUserMemory.findOne({ where: { userId, agentId } }),
  ConversationTurn.findAll({ ... }),
  agentMessagingService.readInbox(userId, agentId),
  claraScrumService.getUserProfile(userId),   // ← new
]);

// Return:
return {
  ...existingFields,
  userProfile: profile
    ? {
        displayName: profile.displayName,
        activeProjects: profile.activeProjects,
        techStack: profile.techStack,
        preferences: profile.preferences,
      }
    : null,
};
```

Update `buildHistory` to inject the user profile as the first context entry — before summary, before inbox, before turns:

```typescript
buildHistory(context: MemoryContext): HistoryEntry[] {
  const history: HistoryEntry[] = [];

  // Layer 1: Global user profile (shared across all agents)
  if (context.userProfile) {
    const { displayName, activeProjects, techStack, preferences } = context.userProfile;
    const profileLines: string[] = [];
    if (displayName) profileLines.push(`User: ${displayName}`);
    if (activeProjects.length > 0)
      profileLines.push(`Active projects: ${activeProjects.map((p) => p.name).join(", ")}`);
    if (techStack.length > 0)
      profileLines.push(`Tech stack: ${techStack.join(", ")}`);
    if (preferences.length > 0)
      profileLines.push(`Preferences: ${preferences.join("; ")}`);
    if (profileLines.length > 0) {
      history.push({ role: "user", content: `[User Profile] ${profileLines.join(" | ")}` });
      history.push({ role: "assistant", content: "Understood." });
    }
  }

  // Layer 2: This agent's memory summary (private to this agent)
  if (context.summary) {
    history.push({ role: "user", content: `[My Memory] ${context.summary}` });
    history.push({ role: "assistant", content: "Got it." });
  }

  // Layer 3: Inbox messages from other agents
  for (const msg of context.inboxMessages) {
    history.push({ role: "user", content: `[Message from ${msg.fromAgentId}] ${msg.content}` });
  }

  // Layer 4: Recent conversation turns
  history.push(...context.recentTurns);
  return history;
}
```

---

## Part 5 — Standup API Route

Add to `backend/src/routes/sprints.ts`:

```typescript
import { claraScrumService } from "@/services/clara-scrum.service";

// POST /api/sprints/standup/team — run full team standup (Clara only)
router.post("/standup/team", requireClaraOrClerk, async (req, res) => {
  const userId = req.claraUser?.userId;
  if (!userId) { res.status(401).json({ error: "Authenticated user required" }); return; }
  const { sprint_id } = req.body as { sprint_id?: string };
  const report = await claraScrumService.runTeamStandup(userId, sprint_id);
  // Build the standup prompt for Clara to speak
  const prompt = claraScrumService.buildStandupPrompt(report);
  res.json({ report, prompt });
});

// GET /api/sprints/standup/agent?agent_id=<uuid> — get a specific agent's summary (Clara only)
router.get("/standup/agent", requireClaraOrClerk, async (req, res) => {
  const userId = req.claraUser?.userId;
  if (!userId) { res.status(401).json({ error: "Authenticated user required" }); return; }
  const agentId = typeof req.query.agent_id === "string" ? req.query.agent_id : null;
  if (!agentId) { res.status(400).json({ error: "agent_id is required" }); return; }
  const summary = await claraScrumService.getAgentSummaryForUser(userId, agentId);
  res.json(summary);
});

// GET /api/sprints/profile — get the user's global profile
router.get("/profile", requireClaraOrClerk, async (req, res) => {
  const userId = req.claraUser?.userId;
  if (!userId) { res.status(401).json({ error: "Authenticated user required" }); return; }
  const profile = await claraScrumService.getUserProfile(userId);
  res.json(profile);
});
```

---

## Acceptance Criteria

- [ ] `user_profiles` table created; one row per user with global context fields
- [ ] `POST /api/sprints/standup/team` generates reports for all agents and broadcasts standup trigger
- [ ] `GET /api/sprints/standup/agent?agent_id=<uuid>` returns that agent's summary (Clara reads any agent)
- [ ] `GET /api/sprints/profile` returns global user profile
- [ ] Memory `buildHistory` injects user profile as Layer 1 before all other context
- [ ] Every agent (not just Clara) receives the global user profile in its memory context
- [ ] Standup cross-agent log updates `user_profiles.cross_agent_log` with delivered events
- [ ] Clara broadcasts standup event to all agents via `agent_messages`
- [ ] `npm run type-check` passes
- [ ] Tests cover: team standup generation, profile layer injection, agent summary read

## Branch + PR

```bash
git checkout -b prompt/2026-04-23/10-clara-as-scrum-master
git commit -m "feat(clara): Clara as scrum master — god-view standup, global user profile, team orchestration"
gh pr create --base develop --title "feat(clara): Clara as scrum master — team standup, global profile, sprint orchestration"
```
