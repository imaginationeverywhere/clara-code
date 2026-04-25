import axios from "axios";
import type { HookContext } from "@/lib/hooks";
import { AgentMcpConnection } from "@/models/AgentMcpConnection";
import { McpServer } from "@/models/McpServer";
import { hookBus } from "@/services/hook-bus.service";
import { mcpCredsFromCiphertext } from "@/services/mcp-credential-vault.service";
import { logger } from "@/utils/logger";

/**
 * Resolves a tool call to an attached MCP server and runs PreToolUse / PostToolUse hooks.
 * Hermes is expected to POST to `/api/mcp/dispatch` (see `docs/mcp-hermes-integration.md`).
 */
export class McpDispatcher {
	async callTool(params: {
		ctx: HookContext;
		agentId: string;
		toolName: string;
		toolInput: Record<string, unknown>;
	}): Promise<unknown> {
		const { ctx, agentId, toolName, toolInput } = params;

		const preResult = await hookBus.runPreToolUse({ toolName, toolInput }, ctx);
		if (!preResult.allowed) {
			throw new Error(`tool_blocked:${preResult.reason ?? "unknown"}`);
		}
		const effectiveInput = preResult.transformedInput ?? toolInput;

		const conns = await AgentMcpConnection.findAll({
			where: { agentId, userId: ctx.userId },
			include: [{ model: McpServer }],
		});
		const owning = conns.find((c) => (c.enabledTools as string[] | undefined)?.includes(toolName));
		if (!owning?.mcpServer) {
			throw new Error(`no_mcp_exposes_tool:${toolName}`);
		}

		let creds: Record<string, string> = {};
		if (owning.credentialsCiphertext) {
			try {
				creds = mcpCredsFromCiphertext(owning.credentialsCiphertext, ctx.userId);
			} catch (e) {
				logger.error("mcp_dispatch unseal failed", e);
				throw new Error("mcp_credential_unseal_failed");
			}
		}
		const server = owning.mcpServer;
		const start = Date.now();
		let toolOutput: unknown;
		let error: string | undefined;
		try {
			const res = await axios.post(
				`${server.endpointUrl}/tool/${encodeURIComponent(toolName)}`,
				{ input: effectiveInput },
				{ headers: this.buildAuthHeaders(server.authScheme, creds), timeout: 30_000, validateStatus: () => true },
			);
			if (res.status >= 400) {
				throw new Error(res.data?.message ?? `mcp_http_${res.status}`);
			}
			toolOutput = res.data;
			return toolOutput;
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
			throw e;
		} finally {
			const durationMs = Date.now() - start;
			const post: Parameters<typeof hookBus.runPostToolUse>[0] = {
				toolName,
				toolInput,
				toolOutput,
				durationMs,
			};
			if (error !== undefined) {
				post.error = error;
			}
			await hookBus.runPostToolUse(post, ctx).catch((e) => logger.error("mcp postToolUse hook", e));
		}
	}

	private buildAuthHeaders(scheme: string, creds: Record<string, string>): Record<string, string> {
		switch (scheme) {
			case "bearer":
				return { Authorization: `Bearer ${creds.token ?? ""}` };
			case "apikey":
				return { "X-API-Key": creds.key ?? "" };
			case "vault":
				return { Authorization: `Bearer ${creds.apiKey ?? creds.token ?? ""}` };
			case "oauth":
				return { Authorization: `Bearer ${creds.access_token ?? ""}` };
			default:
				return {};
		}
	}
}

export const mcpDispatcher = new McpDispatcher();
