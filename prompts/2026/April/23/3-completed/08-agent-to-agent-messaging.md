# Agent-to-Agent Messaging Layer

**TARGET REPO:** imaginationeverywhere/clara-code
**Priority:** P0 — depends on prompt 00 (persistent memory)
**Packages:** `backend/`
**Milestone:** Agents can leave messages for each other, collaborate asynchronously, and build on each other's work

---

## Product Requirement

A user's agents are a team. When Agent A hits a blocker that Agent B can unblock, Agent A should be able to leave a message for Agent B. When Agent B starts its next session, it reads that message and acts on it. Agents don't need to run simultaneously — they leave messages like a team that isn't always in the same timezone.

Clara is the only agent that can broadcast to all agents at once.

---

## Architecture — Async Message Passing (Pull-Based)

```
Agent A session starts → processes task → needs Agent B
Agent A → POST /api/agents/message (to: agent-b-id, content: "...")
Message sits in agent_messages table

Agent B session starts (triggered by user, standup, or Clara)
Agent B → backend reads its inbox (unread messages addressed to agent-b-id)
Agent B processes messages → takes action → responds to Agent A
Response sits in agent_messages table

Agent A next session → reads Agent B's response
```

Agents never need to be online at the same time. This is intentional — agent-speed SDLC is async.

---

## Part 1 — Database Migration

**File:** `backend/migrations/008_agent_messaging.sql`

```sql
-- Agent-to-agent async messaging.
-- Run: psql $DATABASE_URL -f backend/migrations/008_agent_messaging.sql

CREATE TABLE IF NOT EXISTS agent_messages (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         VARCHAR(255) NOT NULL,  -- which user's harness this belongs to
  from_agent_id   VARCHAR(255) NOT NULL,  -- sender: 'clara' or harness agent UUID
  to_agent_id     VARCHAR(255) NOT NULL,  -- recipient: 'clara' or harness agent UUID
  thread_id       UUID         NOT NULL DEFAULT gen_random_uuid(), -- groups a conversation
  message_type    VARCHAR(50)  NOT NULL DEFAULT 'request',
    -- 'request'    → Agent A asks Agent B to do something
    -- 'response'   → Agent B answers Agent A
    -- 'broadcast'  → Clara to all agents (to_agent_id = 'all')
    -- 'escalate'   → Agent escalates to user via Clara
  content         TEXT         NOT NULL,
  metadata        JSONB        NOT NULL DEFAULT '{}', -- task_id, sprint_id, etc.
  read_at         TIMESTAMPTZ,          -- NULL = unread by recipient
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_messages_inbox
  ON agent_messages (user_id, to_agent_id, read_at)
  WHERE read_at IS NULL;  -- partial index — only unread messages

CREATE INDEX IF NOT EXISTS idx_agent_messages_thread
  ON agent_messages (thread_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_agent_messages_from
  ON agent_messages (user_id, from_agent_id, created_at DESC);
```

Run against all three environments.

---

## Part 2 — Sequelize Model

**File:** `backend/src/models/AgentMessage.ts`

```typescript
import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({ tableName: "agent_messages" })
export class AgentMessage extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string;

  @Column({ type: DataType.STRING(255), allowNull: false, field: "user_id" })
  declare userId: string;

  @Column({ type: DataType.STRING(255), allowNull: false, field: "from_agent_id" })
  declare fromAgentId: string;

  @Column({ type: DataType.STRING(255), allowNull: false, field: "to_agent_id" })
  declare toAgentId: string;

  @Column({ type: DataType.UUID, allowNull: false, field: "thread_id", defaultValue: DataType.UUIDV4 })
  declare threadId: string;

  @Column({ type: DataType.STRING(50), allowNull: false, defaultValue: "request", field: "message_type" })
  declare messageType: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare content: string;

  @Column({ type: DataType.JSONB, allowNull: false, defaultValue: {} })
  declare metadata: Record<string, unknown>;

  @Column({ type: DataType.DATE, allowNull: true, field: "read_at" })
  declare readAt: Date | null;

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW, field: "created_at" })
  declare createdAt: Date;
}
```

Register in Sequelize connection setup (follow VoiceUsage pattern).

---

## Part 3 — Messaging Service

**File:** `backend/src/services/agent-messaging.service.ts`

```typescript
import { Op } from "sequelize";
import { AgentMessage } from "@/models/AgentMessage";
import logger from "@/lib/logger";

export type MessageType = "request" | "response" | "broadcast" | "escalate";

export type SendMessageInput = {
  userId: string;
  fromAgentId: string;
  toAgentId: string;            // 'all' for broadcast (Clara only)
  messageType: MessageType;
  content: string;
  threadId?: string;            // pass to reply in an existing thread
  metadata?: Record<string, unknown>;
};

export type AgentMessageView = {
  id: string;
  fromAgentId: string;
  messageType: string;
  content: string;
  threadId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export class AgentMessagingService {
  /** Send a message from one agent to another. Returns the created message. */
  async send(input: SendMessageInput): Promise<AgentMessage> {
    return AgentMessage.create({
      userId: input.userId,
      fromAgentId: input.fromAgentId,
      toAgentId: input.toAgentId,
      threadId: input.threadId ?? undefined, // model default generates UUID
      messageType: input.messageType,
      content: input.content,
      metadata: input.metadata ?? {},
    });
  }

  /**
   * Read all unread messages in an agent's inbox. Marks them as read.
   * Called at the start of every agent session.
   */
  async readInbox(userId: string, agentId: string): Promise<AgentMessageView[]> {
    const messages = await AgentMessage.findAll({
      where: {
        userId,
        toAgentId: { [Op.in]: [agentId, "all"] },
        readAt: null,
      },
      order: [["created_at", "ASC"]],
    });

    if (messages.length > 0) {
      await AgentMessage.update(
        { readAt: new Date() },
        { where: { id: messages.map((m) => m.id) } },
      );
    }

    return messages.map((m) => ({
      id: m.id,
      fromAgentId: m.fromAgentId,
      messageType: m.messageType,
      content: m.content,
      threadId: m.threadId,
      metadata: m.metadata,
      createdAt: m.createdAt.toISOString(),
    }));
  }

  /** Get full thread history for context. */
  async getThread(threadId: string): Promise<AgentMessageView[]> {
    const messages = await AgentMessage.findAll({
      where: { threadId },
      order: [["created_at", "ASC"]],
    });
    return messages.map((m) => ({
      id: m.id,
      fromAgentId: m.fromAgentId,
      messageType: m.messageType,
      content: m.content,
      threadId: m.threadId,
      metadata: m.metadata,
      createdAt: m.createdAt.toISOString(),
    }));
  }

  /** Count unread messages across all agents for a user (used in standup). */
  async countUnread(userId: string): Promise<number> {
    return AgentMessage.count({
      where: { userId, readAt: null },
    });
  }

  /** Count messages sent this billing month for plan enforcement. */
  async countSentThisMonth(userId: string, billingMonth: string): Promise<number> {
    const monthStart = new Date(`${billingMonth}T00:00:00Z`);
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    return AgentMessage.count({
      where: {
        userId,
        createdAt: { [Op.gte]: monthStart, [Op.lt]: monthEnd },
        toAgentId: { [Op.ne]: "all" }, // broadcasts don't count against quota
      },
    });
  }
}

export const agentMessagingService = new AgentMessagingService();
```

---

## Part 4 — API Routes

**File:** `backend/src/routes/agents.ts` (new file)

```typescript
import { Router, type Response } from "express";
import { requireClaraOrClerk } from "@/middleware/api-key-auth";
import type { AuthenticatedRequest } from "@/middleware/clerk-auth";
import type { ApiKeyRequest } from "@/middleware/api-key-auth";
import { agentMessagingService } from "@/services/agent-messaging.service";
import logger from "@/lib/logger";

const router = Router();

// POST /api/agents/message — send a message from one agent to another
// Body: { from_agent_id, to_agent_id, message_type, content, thread_id?, metadata? }
router.post(
  "/message",
  requireClaraOrClerk,
  async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
    const userId = req.claraUser?.userId;
    if (!userId) { res.status(401).json({ error: "Authenticated user required" }); return; }

    const { from_agent_id, to_agent_id, message_type = "request", content, thread_id, metadata } =
      req.body as {
        from_agent_id?: string;
        to_agent_id?: string;
        message_type?: string;
        content?: string;
        thread_id?: string;
        metadata?: Record<string, unknown>;
      };

    if (!from_agent_id || !to_agent_id || !content) {
      res.status(400).json({ error: "from_agent_id, to_agent_id, and content are required" });
      return;
    }

    // Only Clara can broadcast
    if (to_agent_id === "all" && from_agent_id !== "clara") {
      res.status(403).json({ error: "Only Clara can broadcast to all agents" });
      return;
    }

    try {
      const message = await agentMessagingService.send({
        userId,
        fromAgentId: from_agent_id,
        toAgentId: to_agent_id,
        messageType: message_type as "request" | "response" | "broadcast" | "escalate",
        content,
        threadId: thread_id,
        metadata,
      });
      res.status(201).json({ id: message.id, thread_id: message.threadId });
    } catch (err) {
      logger.error("[agents/message] error:", err);
      res.status(500).json({ error: "Failed to send message" });
    }
  },
);

// GET /api/agents/inbox?agent_id=<uuid> — read and mark all unread messages for an agent
router.get(
  "/inbox",
  requireClaraOrClerk,
  async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
    const userId = req.claraUser?.userId;
    if (!userId) { res.status(401).json({ error: "Authenticated user required" }); return; }

    const agentId = typeof req.query.agent_id === "string" ? req.query.agent_id : null;
    if (!agentId) { res.status(400).json({ error: "agent_id is required" }); return; }

    const messages = await agentMessagingService.readInbox(userId, agentId);
    res.json({ messages, count: messages.length });
  },
);

// GET /api/agents/thread/:threadId — full thread history
router.get(
  "/thread/:threadId",
  requireClaraOrClerk,
  async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
    const userId = req.claraUser?.userId;
    if (!userId) { res.status(401).json({ error: "Authenticated user required" }); return; }

    const { threadId } = req.params;
    const messages = await agentMessagingService.getThread(threadId);
    res.json({ messages });
  },
);

export default router;
```

**Register in `backend/src/server.ts`:**
```typescript
import agentRoutes from "./routes/agents";
// ...
app.use("/api/agents", agentRoutes);
```

---

## Part 5 — Inject Inbox Into Memory Context

**File:** `backend/src/services/memory.service.ts`

Update `getMemoryContext` to include unread messages from the agent's inbox. When any agent session starts, it automatically receives messages waiting for it:

```typescript
// Add to MemoryContext type:
inboxMessages: AgentMessageView[];

// Add to getMemoryContext:
import { agentMessagingService } from "./agent-messaging.service";

// In the Promise.all:
const [memory, recentRows, inbox] = await Promise.all([
  AgentUserMemory.findOne({ where: { userId, agentId } }),
  ConversationTurn.findAll({ ... }),
  agentMessagingService.readInbox(userId, agentId),  // ← new
]);

// Return:
return {
  ...existingFields,
  inboxMessages: inbox,
};
```

Update `buildHistory` to prepend inbox messages as context before recent turns:

```typescript
buildHistory(context: MemoryContext): HistoryEntry[] {
  const history: HistoryEntry[] = [];

  if (context.summary) {
    history.push({ role: "user", content: `[Memory] ${context.summary}` });
    history.push({ role: "assistant", content: "Understood." });
  }

  // Inbox messages from other agents
  for (const msg of context.inboxMessages) {
    history.push({
      role: "user",
      content: `[Message from ${msg.fromAgentId}] ${msg.content}`,
    });
  }

  history.push(...context.recentTurns);
  return history;
}
```

---

## Part 6 — Tests

**File:** `backend/src/services/agent-messaging.service.test.ts`

```typescript
describe("AgentMessagingService", () => {
  describe("send", () => {
    it("creates a message with correct fields");
    it("auto-generates thread_id when not provided");
    it("uses provided thread_id for replies");
  });

  describe("readInbox", () => {
    it("returns only unread messages for the agent");
    it("marks messages as read after fetching");
    it("includes broadcast messages (to_agent_id = 'all')");
    it("does NOT return messages addressed to other agents");
  });

  describe("countSentThisMonth", () => {
    it("counts messages sent in the current billing month");
    it("excludes broadcasts from the count");
  });
});
```

---

## Acceptance Criteria

- [ ] `agent_messages` table with partial index on unread messages
- [ ] `POST /api/agents/message` creates a message; only Clara can broadcast to `all`
- [ ] `GET /api/agents/inbox?agent_id=<uuid>` returns unread messages and marks them read
- [ ] `GET /api/agents/thread/:threadId` returns full thread history
- [ ] Agent inbox is automatically injected into memory context at session start
- [ ] Agent receiving inbox messages has them prepended to history before voice server call
- [ ] `npm run type-check` passes
- [ ] All tests pass
- [ ] No forbidden strings in diff

## Branch + PR

```bash
git checkout -b prompt/2026-04-23/08-agent-to-agent-messaging
git commit -m "feat(agents): async agent-to-agent messaging — agents leave messages for each other across sessions"
gh pr create --base develop --title "feat(agents): agent-to-agent messaging layer"
```
