# MCP Tool Extension — External Tools Via Model Context Protocol

**TARGET REPO:** imaginationeverywhere/clara-code
**Priority:** P1 — Beta parity with Claude Agent SDK; extensibility for VPs who need integrations
**Packages:** `backend/`, `packages/sdk/`
**Depends on:** prompt 11 (PLAN_LIMITS), prompt 18 (model routing), prompt 26 (lifecycle hooks)
**Milestone:** Clara agents can invoke tools served by MCP (Model Context Protocol) servers — Stripe API, QuickBooks, Slack, custom webhooks, any MCP-compliant integration. Tool invocations flow through the hook bus (PreToolUse / PostToolUse) so the IP firewall + audit log + standards validator all apply. Tiered: Basic gets a curated set of Clara-provided MCP servers; Business+ can connect any MCP server of their choice.

---

## What MCP Gives Us

MCP (Model Context Protocol) is Anthropic's open standard for connecting AI agents to external tools. Any service that exposes an MCP server can be called by a Clara agent as if it were a built-in tool:

- **Stripe MCP** — charge customers, refund, issue invoices
- **QuickBooks MCP** — draft invoices, reconcile books, pull tax summaries
- **Slack MCP** — post messages, DM users, read channels
- **GitHub MCP** — open PRs, comment on issues, merge branches
- **Playwright MCP** — browser automation
- **Custom MCP** — any HTTP service the VP wraps in an MCP server

The agent's SOUL.md declares which MCP tools it has permission to use; Hermes routes tool calls to the right MCP server.

---

## Part 1 — Migration

**File:** `backend/migrations/027_mcp_connections.sql`

```sql
-- MCP servers available in Clara's curated catalog + VP-added custom servers.
CREATE TABLE IF NOT EXISTS mcp_servers (
  id                   VARCHAR(100)  PRIMARY KEY,          -- e.g., "clara-stripe", "clara-quickbooks"
  display_name         VARCHAR(255)  NOT NULL,
  description          TEXT,
  category             VARCHAR(50)   NOT NULL,             -- payments / communications / devops / custom
  owner_type           VARCHAR(20)   NOT NULL DEFAULT 'clara',  -- clara (curated) / vp (custom, Business+)
  owner_user_id        VARCHAR(255),                        -- set if owner_type='vp'
  endpoint_url         VARCHAR(500)  NOT NULL,              -- stored encrypted
  auth_scheme          VARCHAR(50)   NOT NULL,              -- bearer / oauth / apikey / vault
  min_tier             VARCHAR(50)   NOT NULL DEFAULT 'basic',  -- tier required to use
  is_public            BOOLEAN       NOT NULL DEFAULT TRUE, -- true for Clara-curated, false for VP private
  created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Per-agent MCP connections (which MCP servers an agent has access to).
CREATE TABLE IF NOT EXISTS agent_mcp_connections (
  id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_agent_id        UUID          NOT NULL REFERENCES user_agents(id) ON DELETE CASCADE,
  mcp_server_id        VARCHAR(100)  NOT NULL REFERENCES mcp_servers(id),
  user_id              VARCHAR(255)  NOT NULL,
  credentials_vault_key VARCHAR(255),                       -- pointer to encrypted creds (user's Stripe key, etc.)
  enabled_tools        JSONB         NOT NULL DEFAULT '[]', -- subset of tools the server offers
  created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE (user_agent_id, mcp_server_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_mcp_agent ON agent_mcp_connections (user_agent_id);
```

---

## Part 2 — Seed Clara-Curated MCP Catalog

**File:** `backend/src/seeds/mcp-servers.seed.ts`

```typescript
export const MCP_SEEDS = [
  {
    id: "clara-stripe",
    displayName: "Stripe",
    description: "Charge customers, manage subscriptions, issue refunds.",
    category: "payments",
    ownerType: "clara",
    endpointUrl: process.env.CLARA_MCP_STRIPE_URL,           // internal
    authScheme: "vault",
    minTier: "basic",
  },
  {
    id: "clara-quickbooks",
    displayName: "QuickBooks",
    description: "Draft invoices, reconcile books, tax summaries.",
    category: "accounting",
    ownerType: "clara",
    endpointUrl: process.env.CLARA_MCP_QUICKBOOKS_URL,
    authScheme: "oauth",
    minTier: "basic",
  },
  {
    id: "clara-slack",
    displayName: "Slack",
    description: "Post messages, DM users, read channels.",
    category: "communications",
    ownerType: "clara",
    endpointUrl: process.env.CLARA_MCP_SLACK_URL,
    authScheme: "oauth",
    minTier: "basic",
  },
  {
    id: "clara-github",
    displayName: "GitHub",
    description: "Open PRs, comment on issues, manage branches.",
    category: "devops",
    ownerType: "clara",
    endpointUrl: process.env.CLARA_MCP_GITHUB_URL,
    authScheme: "oauth",
    minTier: "pro",
  },
  {
    id: "clara-playwright",
    displayName: "Playwright",
    description: "Browser automation — navigate, click, fill forms, screenshot.",
    category: "devops",
    ownerType: "clara",
    endpointUrl: process.env.CLARA_MCP_PLAYWRIGHT_URL,
    authScheme: "bearer",
    minTier: "max",
  },
  {
    id: "clara-sendgrid",
    displayName: "Email (SendGrid)",
    description: "Send transactional + marketing emails.",
    category: "communications",
    ownerType: "clara",
    endpointUrl: process.env.CLARA_MCP_SENDGRID_URL,
    authScheme: "vault",
    minTier: "basic",
  },
  {
    id: "clara-twilio",
    displayName: "SMS + Voice (Twilio)",
    description: "Send SMS, make outbound calls.",
    category: "communications",
    ownerType: "clara",
    endpointUrl: process.env.CLARA_MCP_TWILIO_URL,
    authScheme: "vault",
    minTier: "pro",
  },
];
```

---

## Part 3 — MCPConnectionService

**File:** `backend/src/services/mcp-connection.service.ts`

```typescript
import { AgentMcpConnection, McpServer, UserAgent } from "@/models";
import { PLAN_LIMITS, type PlanTier } from "./plan-limits";
import { vaultService } from "./vault.service";
import logger from "@/lib/logger";

const TIER_ORDER: Record<PlanTier, number> = {
  basic: 1, pro: 2, max: 3, business: 4, enterprise: 5,
};

export class McpConnectionService {
  async listAvailable(tier: PlanTier, userId: string) {
    return await McpServer.findAll({
      where: {
        [Op.or]: [
          { ownerType: "clara", isPublic: true },
          { ownerType: "vp", ownerUserId: userId },
        ],
      },
      order: [["category", "ASC"], ["displayName", "ASC"]],
    });
  }

  async connect(params: {
    userId: string;
    tier: PlanTier;
    userAgentId: string;
    mcpServerId: string;
    credentials?: Record<string, string>;  // user-supplied secrets (Stripe keys, etc.)
    enabledTools?: string[];
  }) {
    const server = await McpServer.findByPk(params.mcpServerId);
    if (!server) throw new Error("mcp_server_not_found");

    // Tier gate
    if (TIER_ORDER[params.tier] < TIER_ORDER[server.minTier as PlanTier]) {
      throw new Error(`mcp_requires_tier:${server.minTier}`);
    }

    // Verify ownership: VP custom MCP must belong to them; curated MCPs are open
    if (server.ownerType === "vp" && server.ownerUserId !== params.userId) {
      throw new Error("not_your_mcp");
    }

    // Verify agent ownership
    const agent = await UserAgent.findOne({ where: { id: params.userAgentId, userId: params.userId } });
    if (!agent) throw new Error("agent_not_found");

    // Store credentials (encrypted) if provided
    let credentialsVaultKey: string | undefined;
    if (params.credentials) {
      credentialsVaultKey = await vaultService.storeSecret(
        params.userId,
        `mcp:${params.mcpServerId}:${agent.id}`,
        params.credentials,
      );
    }

    return await AgentMcpConnection.create({
      userAgentId: params.userAgentId,
      mcpServerId: params.mcpServerId,
      userId: params.userId,
      credentialsVaultKey,
      enabledTools: params.enabledTools ?? [],
    });
  }

  async registerCustomMcp(params: {
    userId: string;
    tier: PlanTier;
    displayName: string;
    description?: string;
    endpointUrl: string;
    authScheme: "bearer" | "oauth" | "apikey" | "vault";
    category?: string;
  }) {
    // Only Business+ can register custom MCPs
    if (TIER_ORDER[params.tier] < TIER_ORDER.business) {
      throw new Error("custom_mcp_requires_business_tier");
    }

    const id = `vp-${params.userId}-${Date.now()}`;
    return await McpServer.create({
      id,
      displayName: params.displayName,
      description: params.description ?? "",
      category: params.category ?? "custom",
      ownerType: "vp",
      ownerUserId: params.userId,
      endpointUrl: params.endpointUrl,
      authScheme: params.authScheme,
      minTier: "business",
      isPublic: false,
    });
  }

  async toolsFor(userAgentId: string): Promise<Array<{ mcpServerId: string; tools: string[] }>> {
    const conns = await AgentMcpConnection.findAll({
      where: { userAgentId },
      include: [{ model: McpServer }],
    });
    return conns.map((c: any) => ({
      mcpServerId: c.mcpServerId,
      tools: c.enabledTools,
    }));
  }
}

export const mcpConnection = new McpConnectionService();
```

---

## Part 4 — Tool Dispatcher (Hermes Invokes MCP Via Hook Bus)

**File:** `backend/src/services/mcp-dispatcher.service.ts`

When an agent calls a tool, Hermes hits this dispatcher. It looks up which MCP server owns the tool, runs the PreToolUse hooks, invokes the remote MCP, runs PostToolUse hooks, and returns the result.

```typescript
import axios from "axios";
import { AgentMcpConnection, McpServer } from "@/models";
import { vaultService } from "./vault.service";
import { hookBus } from "./hook-bus.service";
import type { HookContext } from "@/lib/hooks";
import logger from "@/lib/logger";

export class McpDispatcher {
  async callTool(params: {
    ctx: HookContext;
    userAgentId: string;
    toolName: string;
    toolInput: Record<string, unknown>;
  }): Promise<unknown> {
    const { ctx, userAgentId, toolName, toolInput } = params;

    // 1. PreToolUse hook chain
    const preResult = await hookBus.runPreToolUse({ toolName, toolInput }, ctx);
    if (!preResult.allowed) {
      throw new Error(`tool_blocked:${preResult.reason}`);
    }

    // 2. Find which MCP server owns this tool
    const conns = await AgentMcpConnection.findAll({
      where: { userAgentId },
      include: [{ model: McpServer }],
    });
    const owning = conns.find((c: any) => c.enabledTools.includes(toolName));
    if (!owning) throw new Error(`no_mcp_exposes_tool:${toolName}`);

    // 3. Resolve credentials from vault (if any)
    const creds = owning.credentialsVaultKey
      ? await vaultService.getSecret(ctx.userId, owning.credentialsVaultKey)
      : {};

    // 4. Call the MCP server
    const start = Date.now();
    let toolOutput: unknown;
    let error: string | undefined;
    try {
      const response = await axios.post(
        `${(owning as any).mcpServer.endpointUrl}/tool/${toolName}`,
        { input: preResult.transformedInput ?? toolInput },
        {
          headers: this.buildAuthHeaders((owning as any).mcpServer.authScheme, creds),
          timeout: 30_000,
        },
      );
      toolOutput = response.data;
    } catch (err) {
      error = (err as Error).message;
      throw err;
    } finally {
      const durationMs = Date.now() - start;
      // 5. PostToolUse hook chain (observability, audit)
      await hookBus.runPostToolUse(
        { toolName, toolInput, toolOutput, error, durationMs },
        ctx,
      );
    }

    return toolOutput;
  }

  private buildAuthHeaders(scheme: string, creds: Record<string, string>): Record<string, string> {
    switch (scheme) {
      case "bearer": return { Authorization: `Bearer ${creds.token}` };
      case "apikey": return { "X-API-Key": creds.key };
      case "vault":  return { Authorization: `Bearer ${creds.apiKey}` };
      case "oauth":  return { Authorization: `Bearer ${creds.access_token}` };
      default: return {};
    }
  }
}

export const mcpDispatcher = new McpDispatcher();
```

---

## Part 5 — Routes

**File:** `backend/src/routes/mcp.ts`

```typescript
import { Router } from "express";
import { requireClaraOrClerk } from "@/middleware/api-key-auth";
import { mcpConnection } from "@/services/mcp-connection.service";

const router = Router();

router.get("/available", requireClaraOrClerk, async (req, res) => {
  const servers = await mcpConnection.listAvailable(req.claraUser!.tier, req.claraUser!.userId);
  res.json({ servers });
});

router.post("/connect", requireClaraOrClerk, async (req, res) => {
  try {
    const conn = await mcpConnection.connect({
      userId: req.claraUser!.userId,
      tier: req.claraUser!.tier,
      userAgentId: req.body.user_agent_id,
      mcpServerId: req.body.mcp_server_id,
      credentials: req.body.credentials,
      enabledTools: req.body.enabled_tools,
    });
    res.status(201).json({ connection: conn });
  } catch (err) {
    const message = err instanceof Error ? err.message : "error";
    res.status(400).json({ error: message });
  }
});

router.post("/register-custom", requireClaraOrClerk, async (req, res) => {
  try {
    const server = await mcpConnection.registerCustomMcp({
      userId: req.claraUser!.userId,
      tier: req.claraUser!.tier,
      displayName: req.body.display_name,
      description: req.body.description,
      endpointUrl: req.body.endpoint_url,
      authScheme: req.body.auth_scheme,
      category: req.body.category,
    });
    res.status(201).json({ server });
  } catch (err) {
    const message = err instanceof Error ? err.message : "error";
    res.status(400).json({ error: message });
  }
});

router.get("/:agentId/tools", requireClaraOrClerk, async (req, res) => {
  const tools = await mcpConnection.toolsFor(req.params.agentId);
  res.json({ tools });
});

export default router;
```

---

## Part 6 — Hermes Integration

Hermes needs to know which tools each agent can call. On agent load, Hermes fetches `GET /api/mcp/:agentId/tools` and registers the MCP tools in the model's tool-use schema. When the model emits a tool call for an MCP tool, Hermes proxies to the dispatcher above.

Sketch (Hermes side):

```typescript
// When serving an agent:
const agentTools = await fetchMcpTools(agentId);
const toolSchema = buildToolSchemaFor(agentTools);

// When model emits tool_use:
if (isMcpTool(toolCall.name)) {
  return await claraBackend.post("/api/mcp/dispatch", {
    user_agent_id: agentId,
    tool_name: toolCall.name,
    tool_input: toolCall.input,
    context: sessionContext,
  });
}
```

---

## Part 7 — Tests

```typescript
describe("McpConnectionService", () => {
  it("listAvailable returns Clara-curated MCPs + VP's custom MCPs");
  it("connect tier-gates (basic can't connect GitHub if min_tier=pro)");
  it("connect requires ownership of custom MCPs");
  it("registerCustomMcp rejects below Business tier");
  it("stores credentials in vault, not in DB");
});

describe("McpDispatcher", () => {
  it("runs PreToolUse hooks before the MCP call");
  it("blocks the call if PreToolUse returns allowed:false");
  it("calls the MCP server with correct auth headers");
  it("runs PostToolUse hooks regardless of success/error");
  it("throws no_mcp_exposes_tool if tool not in any connection");
});

describe("Routes", () => {
  it("GET /mcp/available filters by tier");
  it("POST /mcp/connect tier-gates correctly");
  it("POST /mcp/register-custom rejects Pro tier");
});
```

---

## Acceptance Criteria

- [ ] `mcp_servers` + `agent_mcp_connections` tables in all three environments
- [ ] Seven Clara-curated MCP servers seeded (Stripe, QuickBooks, Slack, GitHub, Playwright, SendGrid, Twilio)
- [ ] Tier gate enforced on connect (`minTier` per server)
- [ ] Custom MCP registration restricted to Business+ tier
- [ ] Credentials stored in Clara vault, never in plaintext in DB
- [ ] `McpDispatcher.callTool` runs PreToolUse + PostToolUse hook chains
- [ ] `GET /mcp/:agentId/tools` returns agent's available MCP tools for Hermes registration
- [ ] Hermes documented integration pattern (sketch in Part 6)
- [ ] `npm run type-check` passes
- [ ] All tests pass
- [ ] CI thin-client gate passes

## Branch + PR

```bash
git checkout -b prompt/2026-04-23/27-mcp-tool-extension
git commit -m "feat(mcp): MCP tool extension — Clara-curated + Business+ custom MCP servers, routed via hook bus"
gh pr create --base develop --title "feat(mcp): external tool extension via Model Context Protocol"
```
