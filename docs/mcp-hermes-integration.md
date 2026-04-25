# Hermes and MCP (sketch)

Clara’s backend stores which MCP tool names are enabled per agent. Hermes (or any caller) should treat MCP like built-in tools:

1. On agent / session start, call `GET /api/mcp/{agentId}/tools` to obtain `{ tools: [{ mcpServerId, tools: string[] }] }`.
2. Expose only those tool names in the model’s tool schema.
3. When the model issues a `tool_call` for an MCP-backed name, `POST /api/mcp/dispatch` with a Clerk or Clara API key:

```json
{
  "user_agent_id": "<agents.id UUID>",
  "tool_name": "charge_customer",
  "tool_input": { "amount_cents": 1000 },
  "session_id": "optional-trace"
}
```

4. The dispatcher runs `PreToolUse` and `PostToolUse` on the platform hook bus, resolves credentials from the user’s sealed blob, and POSTs to `{mcpServer.endpointUrl}/tool/{toolName}`.

This keeps IP firewall, tier gates, and future audit events on one code path. Replace `endpointUrl` values via env (e.g. `CLARA_MCP_STRIPE_URL`) in production; placeholders ship for dev.
