import { randomUUID } from "node:crypto";
import { Router } from "express";
import type { HookContext } from "@/lib/hooks";
import { type ApiKeyRequest, requireClaraOrClerk } from "@/middleware/api-key-auth";
import { mcpConnection } from "@/services/mcp-connection.service";
import { mcpDispatcher } from "@/services/mcp-dispatcher.service";

const router: ReturnType<typeof Router> = Router();

/**
 * Public catalog: Clara + VP-owned (filtered by min tier in service).
 * Static route — must stay before /:agentId
 */
router.get("/available", requireClaraOrClerk, async (req: ApiKeyRequest, res): Promise<void> => {
	if (!req.claraUser) {
		res.status(401).json({ error: "Unauthorized" });
		return;
	}
	const servers = await mcpConnection.listAvailable(req.claraUser.tier, req.claraUser.userId);
	res.json({ servers });
});

router.post("/connect", requireClaraOrClerk, async (req: ApiKeyRequest, res): Promise<void> => {
	if (!req.claraUser) {
		res.status(401).json({ error: "Unauthorized" });
		return;
	}
	const body = req.body as {
		agent_id?: string;
		user_agent_id?: string;
		mcp_server_id?: string;
		credentials?: Record<string, string>;
		enabled_tools?: string[];
	};
	const agentId = body.user_agent_id ?? body.agent_id;
	if (typeof agentId !== "string" || agentId.length === 0) {
		res.status(400).json({ error: "agent_id (or user_agent_id) is required" });
		return;
	}
	if (typeof body.mcp_server_id !== "string" || body.mcp_server_id.length === 0) {
		res.status(400).json({ error: "mcp_server_id is required" });
		return;
	}
	try {
		const connectParams: Parameters<typeof mcpConnection.connect>[0] = {
			userId: req.claraUser.userId,
			tier: req.claraUser.tier,
			agentId,
			mcpServerId: body.mcp_server_id,
		};
		if (body.credentials) {
			connectParams.credentials = body.credentials;
		}
		if (body.enabled_tools) {
			connectParams.enabledTools = body.enabled_tools;
		}
		const conn = await mcpConnection.connect(connectParams);
		res.status(201).json({ connection: conn });
	} catch (err) {
		const message = err instanceof Error ? err.message : "error";
		res.status(400).json({ error: message });
	}
});

router.post("/register-custom", requireClaraOrClerk, async (req: ApiKeyRequest, res): Promise<void> => {
	if (!req.claraUser) {
		res.status(401).json({ error: "Unauthorized" });
		return;
	}
	const b = req.body as {
		display_name?: string;
		description?: string;
		endpoint_url?: string;
		auth_scheme?: "bearer" | "oauth" | "apikey" | "vault";
		category?: string;
	};
	if (typeof b.display_name !== "string" || typeof b.endpoint_url !== "string" || !b.auth_scheme) {
		res.status(400).json({ error: "display_name, endpoint_url, and auth_scheme are required" });
		return;
	}
	try {
		const reg: Parameters<typeof mcpConnection.registerCustomMcp>[0] = {
			userId: req.claraUser.userId,
			tier: req.claraUser.tier,
			displayName: b.display_name,
			endpointUrl: b.endpoint_url,
			authScheme: b.auth_scheme,
		};
		if (b.description !== undefined) {
			reg.description = b.description;
		}
		if (b.category !== undefined) {
			reg.category = b.category;
		}
		const server = await mcpConnection.registerCustomMcp(reg);
		res.status(201).json({ server });
	} catch (err) {
		const message = err instanceof Error ? err.message : "error";
		res.status(400).json({ error: message });
	}
});

router.post("/dispatch", requireClaraOrClerk, async (req: ApiKeyRequest, res): Promise<void> => {
	if (!req.claraUser) {
		res.status(401).json({ error: "Unauthorized" });
		return;
	}
	const b = req.body as {
		agent_id?: string;
		user_agent_id?: string;
		tool_name?: string;
		tool_input?: Record<string, unknown>;
		session_id?: string;
	};
	const agentId = b.user_agent_id ?? b.agent_id;
	if (typeof agentId !== "string" || !b.tool_name) {
		res.status(400).json({ error: "user_agent_id (or agent_id) and tool_name are required" });
		return;
	}
	const ctx: HookContext = {
		userId: req.claraUser.userId,
		agentId: agentId,
		sessionId: typeof b.session_id === "string" && b.session_id.length > 0 ? b.session_id : "mcp",
		turnId: randomUUID(),
		tier: req.claraUser.tier,
		metadata: { source: "mcp-dispatch" },
	};
	try {
		const out = await mcpDispatcher.callTool({
			ctx,
			agentId,
			toolName: b.tool_name,
			toolInput: b.tool_input ?? {},
		});
		res.json({ result: out });
	} catch (e) {
		const message = e instanceof Error ? e.message : "error";
		if (message.startsWith("tool_blocked:")) {
			res.status(403).json({ error: message });
			return;
		}
		if (message.startsWith("no_mcp_exposes_tool:")) {
			res.status(404).json({ error: message });
			return;
		}
		res.status(502).json({ error: message });
	}
});

router.get("/:agentId/tools", requireClaraOrClerk, async (req: ApiKeyRequest, res): Promise<void> => {
	if (!req.claraUser) {
		res.status(401).json({ error: "Unauthorized" });
		return;
	}
	const { agentId } = req.params;
	const tools = await mcpConnection.toolsFor(agentId);
	res.json({ tools });
});

export default router;
