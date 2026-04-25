# Clara Persistent Memory — Foundation (Agent-Aware)

**TARGET REPO:** imaginationeverywhere/clara-code
**Priority:** P0 — run before any other voice prompts
**Packages:** `backend/`, `packages/cli/`
**Milestone:** Clara and every harness agent remembers every user, across every surface, forever

---

## Product Requirement

When a user comes back to Clara — on the website, CLI, or desktop IDE — Clara picks up where they left off. Same for every harness agent the user has installed. A user on the Pro plan has a minimum of 3 harness agents. Each of those agents has its own independent relationship with the user. Agent A remembers what it worked on with the user. Agent B remembers something different. Neither bleeds into the other.

Memory is always on. No env vars, no user setup, no "start a new chat."

---

## Architecture

```
User opens clara (or opens a harness agent)
         │
         ▼
Client sends: { session_id, agent_id, surface }
  agent_id = "clara" for Clara herself
  agent_id = "<agent-uuid>" for a harness agent
         │
         ▼
Backend fetches memory scoped to (user_id, agent_id)
  - agent_user_memory.summary for THIS agent + THIS user
  - last 20 conversation_turns for THIS agent + THIS user
         │
         ▼
Backend builds history → passes to voice/converse server
         │
         ▼
Voice server generates personalized response for this agent
  (Clara: "Welcome back! We were debugging the CLI voice loop…")
  (Agent B: "Hey Mo! Last time we were setting up your Stripe webhook…")
         │
         ▼
Backend saves turn scoped to (user_id, agent_id, session_id)
         │
         ▼
After 10 turns: background summarize → update agent_user_memory for this pair
```

**Thin-client rule:** All memory lives on the backend. The CLI/website/desktop send only `session_id`, `agent_id`, `surface`, and audio/text. They NEVER store or process conversation history locally.

---

## Part 1 — Database Migration

**File:** `backend/migrations/007_user_memory.sql`

```sql
-- Agent-aware persistent memory for Clara and all harness agents.
-- Run via: psql $DATABASE_URL -f backend/migrations/007_user_memory.sql

-- Short-term: individual conversation turns, scoped per user + agent
CREATE TABLE IF NOT EXISTS conversation_turns (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      VARCHAR(255) NOT NULL,
  agent_id     VARCHAR(255) NOT NULL DEFAULT 'clara', -- 'clara' or harness agent UUID
  session_id   VARCHAR(255) NOT NULL,
  surface      VARCHAR(50)  NOT NULL DEFAULT 'cli',   -- 'cli' | 'web' | 'desktop'
  role         VARCHAR(20)  NOT NULL,                 -- 'user' | 'assistant'
  content      TEXT         NOT NULL,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_turns_user_agent_created
  ON conversation_turns (user_id, agent_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_turns_session
  ON conversation_turns (session_id, created_at ASC);

-- Long-term: AI-compressed memory, one row per (user, agent) pair
-- agent_id = 'clara' → Clara's relationship with this user
-- agent_id = '<uuid>' → a specific harness agent's relationship with this user
CREATE TABLE IF NOT EXISTS agent_user_memory (
  id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              VARCHAR(255) NOT NULL,
  agent_id             VARCHAR(255) NOT NULL DEFAULT 'clara',
  summary              TEXT,                        -- AI-written paragraph
  key_facts            JSONB        NOT NULL DEFAULT '[]',
  last_session_at      TIMESTAMPTZ,
  last_session_surface VARCHAR(50),
  total_sessions       INTEGER      NOT NULL DEFAULT 0,
  updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, agent_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_user_memory_lookup
  ON agent_user_memory (user_id, agent_id);
```

Run against all three environments:
```bash
psql $DATABASE_URL -f backend/migrations/007_user_memory.sql
# Also run against .env.local, .env.develop, .env.production DATABASE_URL values
```

---

## Part 2 — Sequelize Models

**File:** `backend/src/models/ConversationTurn.ts`

```typescript
import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({ tableName: "conversation_turns" })
export class ConversationTurn extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string;

  @Column({ type: DataType.STRING(255), allowNull: false, field: "user_id" })
  declare userId: string;

  @Column({ type: DataType.STRING(255), allowNull: false, defaultValue: "clara", field: "agent_id" })
  declare agentId: string;

  @Column({ type: DataType.STRING(255), allowNull: false, field: "session_id" })
  declare sessionId: string;

  @Column({ type: DataType.STRING(50), allowNull: false, defaultValue: "cli" })
  declare surface: string;

  @Column({ type: DataType.STRING(20), allowNull: false })
  declare role: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare content: string;

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW, field: "created_at" })
  declare createdAt: Date;
}
```

**File:** `backend/src/models/AgentUserMemory.ts`

```typescript
import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({ tableName: "agent_user_memory" })
export class AgentUserMemory extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string;

  @Column({ type: DataType.STRING(255), allowNull: false, field: "user_id" })
  declare userId: string;

  @Column({ type: DataType.STRING(255), allowNull: false, defaultValue: "clara", field: "agent_id" })
  declare agentId: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare summary: string | null;

  @Column({ type: DataType.JSONB, allowNull: false, defaultValue: [], field: "key_facts" })
  declare keyFacts: string[];

  @Column({ type: DataType.DATE, allowNull: true, field: "last_session_at" })
  declare lastSessionAt: Date | null;

  @Column({ type: DataType.STRING(50), allowNull: true, field: "last_session_surface" })
  declare lastSessionSurface: string | null;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0, field: "total_sessions" })
  declare totalSessions: number;

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW, field: "updated_at" })
  declare updatedAt: Date;
}
```

Register both models in the Sequelize connection setup (follow the exact same pattern as `VoiceUsage`).

---

## Part 3 — Memory Service

**File:** `backend/src/services/memory.service.ts`

Every method is scoped to `(userId, agentId)`. `agentId` defaults to `"clara"` everywhere so existing Clara calls require no changes.

```typescript
import { ConversationTurn } from "@/models/ConversationTurn";
import { AgentUserMemory } from "@/models/AgentUserMemory";
import logger from "@/lib/logger";

const RECENT_TURNS_LIMIT = 20;

export type TurnRole = "user" | "assistant";
export type HistoryEntry = { role: TurnRole; content: string };

export type MemoryContext = {
  agentId: string;
  summary: string | null;
  keyFacts: string[];
  recentTurns: HistoryEntry[];
  lastSessionAt: string | null;
  lastSessionSurface: string | null;
  totalSessions: number;
  isReturningUser: boolean;
};

export class MemoryService {
  /** Save one turn. Never throws — memory is always best-effort. */
  async saveTurn(
    userId: string,
    agentId: string = "clara",
    sessionId: string,
    surface: string,
    role: TurnRole,
    content: string,
  ): Promise<void> {
    if (!content.trim()) return;
    try {
      await ConversationTurn.create({ userId, agentId, sessionId, surface, role, content });
    } catch (err) {
      logger.error("[memory] saveTurn failed:", err);
    }
  }

  /** Fetch memory context scoped to this (user, agent) pair. */
  async getMemoryContext(userId: string, agentId: string = "clara"): Promise<MemoryContext> {
    try {
      const [memory, recentRows] = await Promise.all([
        AgentUserMemory.findOne({ where: { userId, agentId } }),
        ConversationTurn.findAll({
          where: { userId, agentId },
          order: [["created_at", "DESC"]],
          limit: RECENT_TURNS_LIMIT,
        }),
      ]);

      const recentTurns: HistoryEntry[] = recentRows
        .reverse()
        .map((r) => ({ role: r.role as TurnRole, content: r.content }));

      return {
        agentId,
        summary: memory?.summary ?? null,
        keyFacts: memory?.keyFacts ?? [],
        recentTurns,
        lastSessionAt: memory?.lastSessionAt?.toISOString() ?? null,
        lastSessionSurface: memory?.lastSessionSurface ?? null,
        totalSessions: memory?.totalSessions ?? 0,
        isReturningUser: (memory?.totalSessions ?? 0) > 0,
      };
    } catch (err) {
      logger.error("[memory] getMemoryContext failed:", err);
      return {
        agentId,
        summary: null,
        keyFacts: [],
        recentTurns: [],
        lastSessionAt: null,
        lastSessionSurface: null,
        totalSessions: 0,
        isReturningUser: false,
      };
    }
  }

  /** Touch last_session metadata and optionally increment session count on first turn. */
  async touchSession(
    userId: string,
    agentId: string = "clara",
    surface: string,
    sessionId: string,
  ): Promise<void> {
    try {
      const existingTurns = await ConversationTurn.count({ where: { sessionId, agentId } });
      const isNewSession = existingTurns === 0;

      await AgentUserMemory.upsert({
        userId,
        agentId,
        lastSessionAt: new Date(),
        lastSessionSurface: surface,
        updatedAt: new Date(),
        // Only bump total_sessions on first turn of a new session
        ...(isNewSession
          ? {}
          : undefined),
      });

      if (isNewSession) {
        await AgentUserMemory.increment("total_sessions", { where: { userId, agentId }, by: 1 });
      }
    } catch (err) {
      logger.error("[memory] touchSession failed:", err);
    }
  }

  /**
   * Build history array for the voice server.
   * Prepends the summary as implicit context so the agent greets appropriately.
   */
  buildHistory(context: MemoryContext): HistoryEntry[] {
    const history: HistoryEntry[] = [];

    if (context.summary) {
      history.push({ role: "user", content: `[Memory] ${context.summary}` });
      history.push({ role: "assistant", content: "Understood." });
    }

    history.push(...context.recentTurns);
    return history;
  }
}

export const memoryService = new MemoryService();
```

---

## Part 4 — Modify `/api/voice/converse`

**File:** `backend/src/routes/voice.ts`

Add import:
```typescript
import { memoryService } from "@/services/memory.service";
```

**Replace the full `/converse` handler body:**

```typescript
router.post(
  "/converse",
  requireClaraOrClerk,
  voiceLimiter,
  voiceLimitMiddleware,
  async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
    const {
      audio_base64,
      text,
      voice_id = "clara",
      max_tokens = 300,
      session_id,
      agent_id = "clara",   // 'clara' or a harness agent UUID
      surface = "cli",
    } = (req.body ?? {}) as {
      audio_base64?: string;
      text?: string;
      voice_id?: string;
      max_tokens?: number;
      session_id?: string;
      agent_id?: string;
      surface?: string;
    };

    const hasAudio = typeof audio_base64 === "string" && audio_base64.length > 0;
    const hasText = typeof text === "string";
    if (!hasAudio && !hasText) {
      res.status(400).json({ error: "audio_base64 or text is required" });
      return;
    }

    const base = converseVoiceBase();
    if (!base) {
      res.status(503).json({ error: "Voice service is not available" });
      return;
    }
    const apiKey = converseApiKey();
    if (!apiKey) {
      res.status(503).json({ error: "Voice service is not available" });
      return;
    }

    const userId = req.claraUser?.userId;
    const sessionId = session_id ?? (userId ? `${userId}-${agent_id}-fallback` : "anonymous");
    const usageTier = (req.claraUser?.tier ?? "free") as VoiceTier;

    // Fetch this agent's memory for this user (scoped: user + agent)
    let memoryHistory: HistoryEntry[] = [];
    if (userId) {
      const [context] = await Promise.all([
        memoryService.getMemoryContext(userId, agent_id),
        memoryService.touchSession(userId, agent_id, surface, sessionId),
      ]);
      memoryHistory = memoryService.buildHistory(context);
    }

    try {
      const response = await axios.post(
        `${base}/voice/converse`,
        {
          audio_base64: hasAudio ? audio_base64 : undefined,
          text: hasText ? text : undefined,
          voice_id,
          history: memoryHistory,
          max_tokens,
        },
        {
          timeout: HERMES_TIMEOUT_MS,
          headers: { Authorization: `Bearer ${apiKey}` },
          responseType: "json",
        },
      );

      if (userId) {
        await voiceUsageService.incrementAfterSuccess(userId, usageTier);
      }

      // Save turns to memory in the background — never block the response
      if (userId) {
        const userContent = hasText ? (text ?? "") : "[audio]";
        const assistantContent =
          typeof response.data?.response_text === "string"
            ? response.data.response_text
            : typeof response.data?.reply_text === "string"
              ? response.data.reply_text
              : "";

        void Promise.all([
          userContent
            ? memoryService.saveTurn(userId, agent_id, sessionId, surface, "user", userContent)
            : Promise.resolve(),
          assistantContent
            ? memoryService.saveTurn(userId, agent_id, sessionId, surface, "assistant", assistantContent)
            : Promise.resolve(),
        ]).catch((err) => logger.error("[memory] background save failed:", err));
      }

      res.json(response.data);
    } catch (error) {
      logger.error("[voice/converse] proxy error:", error);
      res.status(502).json({ error: "Voice server unreachable" });
    }
  },
);
```

---

## Part 5 — New Endpoint: `GET /api/voice/memory`

Add before the `/health` route in `voice.ts`:

```typescript
// GET /api/voice/memory?agent_id=clara
// Returns memory context for (user, agent) pair.
// agent_id defaults to 'clara'. Pass agent's UUID for a harness agent.
router.get(
  "/memory",
  requireClaraOrClerk,
  async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
    const userId = req.claraUser?.userId;
    if (!userId) {
      res.status(401).json({ error: "Authenticated user required" });
      return;
    }
    const agentId = typeof req.query.agent_id === "string" ? req.query.agent_id : "clara";
    const context = await memoryService.getMemoryContext(userId, agentId);
    res.json(context);
  },
);
```

---

## Part 6 — CLI: Persistent Session ID with Agent ID

**File:** `packages/cli/src/voice-converse-app.tsx`

Replace the random session ID with a deterministic one:

```typescript
import { readClaraConfig } from "./lib/config-store.js";

function buildSessionId(userId: string, agentId: string): string {
  const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  return `${userId}-${agentId}-${date}`;
}

// In VoiceConverseApp:
const cfg = readClaraConfig();
const userId = cfg.userId?.trim() || "guest";
const agentId = "clara"; // CLI always talks to Clara; harness agents pass their own ID
const sessionIdRef = useRef(buildSessionId(userId, agentId));
```

Pass `agent_id`, `session_id`, and `surface` in every `postVoiceConverse` call:

```typescript
const res: ConverseResult = await postVoiceConverse(
  base,
  {
    agent_id: agentId,
    session_id: sessionIdRef.current,
    surface: "cli",
    audio_base64: b64,
    mime_type: "audio/wav",
  },
  { apiKey: voiceKey() },
);
```

Update `PlayGreetingOptions` in `canonical-greeting.ts`:

```typescript
export type PlayGreetingOptions = {
  refresh?: boolean;
  agentId?: string;
  sessionId?: string;
  surface?: string;
  deps?: Partial<GreetingDeps>;
};
```

Pass through to `postVoiceConverse` in the greeting call:

```typescript
const converse: ConverseResult = await d.postVoiceConverse(
  base,
  {
    text: "",
    agent_id: options?.agentId ?? "clara",
    session_id: options?.sessionId,
    surface: options?.surface ?? "cli",
  },
  { apiKey },
);
```

In `VoiceConverseApp`, pass when calling greeting:

```typescript
const r = await playCanonicalGreeting({
  agentId,
  sessionId: sessionIdRef.current,
  surface: "cli",
});
```

---

## Part 7 — Tests

**File:** `backend/src/services/memory.service.test.ts`

```typescript
describe("MemoryService — agent-scoped memory", () => {
  describe("getMemoryContext", () => {
    it("returns empty context for brand new (user, agent) pair");
    it("scopes turns to the correct (user_id, agent_id) — agent A does not see agent B's turns");
    it("returns summary when it exists for this agent");
  });

  describe("saveTurn", () => {
    it("saves turn with correct agent_id");
    it("never throws on DB failure");
    it("skips empty content");
  });

  describe("buildHistory", () => {
    it("prepends summary as context entry when present");
    it("returns only recent turns when no summary");
  });

  describe("touchSession", () => {
    it("increments total_sessions only on the first turn of a new session_id");
    it("does NOT increment on subsequent turns in the same session");
  });
});
```

**File:** `backend/src/routes/voice.test.ts` (additions)

```typescript
describe("POST /api/voice/converse — agent-aware memory", () => {
  it("accepts text input (greeting) without audio_base64");
  it("rejects body with neither audio_base64 nor text → 400");
  it("passes agent_id and session_id through to voice server proxy");
  it("saves user and assistant turns with correct agent_id after round-trip");
});

describe("GET /api/voice/memory", () => {
  it("returns context scoped to agent_id=clara by default");
  it("returns context scoped to specific harness agent_id when provided");
  it("returns 401 for unauthenticated request");
});
```

---

## Acceptance Criteria

- [ ] `conversation_turns` has `agent_id` column; all saves include it
- [ ] `agent_user_memory` has unique `(user_id, agent_id)` index
- [ ] `GET /api/voice/memory?agent_id=clara` returns Clara's memory for the user
- [ ] `GET /api/voice/memory?agent_id=<uuid>` returns that harness agent's memory for the user — completely separate from Clara's
- [ ] `POST /api/voice/converse` accepts `agent_id` in body; memory context is scoped to that agent
- [ ] `POST /api/voice/converse` accepts `text: ""` (greeting) — no 400
- [ ] Memory failures (DB down, timeout) NEVER block the voice response
- [ ] CLI sends `agent_id: "clara"`, `session_id: "${userId}-clara-${date}"`, `surface: "cli"` on every turn
- [ ] Harness agents on the platform can pass their own `agent_id` and get isolated memory per user
- [ ] `npm run type-check` passes (backend + CLI)
- [ ] All new tests pass
- [ ] No forbidden strings in any diff (`modal.run`, `hermes-gateway`, `HERMES_GATEWAY_URL`)

## Branch + PR

```bash
git checkout develop && git pull origin develop
git checkout -b prompt/2026-04-23/00-persistent-memory-foundation
git add backend/migrations/007_user_memory.sql
git add backend/src/models/ConversationTurn.ts
git add backend/src/models/AgentUserMemory.ts
git add backend/src/services/memory.service.ts
git add backend/src/routes/voice.ts
git add packages/cli/src/voice-converse-app.tsx
git add packages/cli/src/lib/canonical-greeting.ts
git commit -m "feat(memory): agent-scoped persistent memory — Clara and every harness agent remembers every user"
git push origin prompt/2026-04-23/00-persistent-memory-foundation
gh pr create --base develop --title "feat(memory): persistent memory — every agent picks up where it left off with every user"
```
