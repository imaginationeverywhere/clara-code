import { Op } from "sequelize";
import { Agent } from "@/models/Agent";
import { AgentMcpConnection } from "@/models/AgentMcpConnection";
import { McpServer } from "@/models/McpServer";
import { mcpCredsToCiphertext } from "@/services/mcp-credential-vault.service";
import { type PlanTier, tierGte, toPlanTier } from "@/services/plan-limits";
import { logger } from "@/utils/logger";

/**
 * List catalog servers visible to the user (Clara public + that user's VP-registered private servers).
 */
export class McpConnectionService {
	async listAvailable(tier: string, userId: string): Promise<McpServer[]> {
		const t = toPlanTier(tier);
		const rows = await McpServer.findAll({
			where: {
				[Op.or]: [
					{ ownerType: "clara", isPublic: true },
					{ ownerType: "vp", ownerUserId: userId },
				],
			},
			order: [
				["category", "ASC"],
				["displayName", "ASC"],
			],
		});
		return rows.filter((s) => tierGte(t, toPlanTier(s.minTier) as PlanTier));
	}

	async connect(params: {
		userId: string;
		tier: string;
		agentId: string;
		mcpServerId: string;
		credentials?: Record<string, string>;
		enabledTools?: string[];
	}): Promise<AgentMcpConnection> {
		const tier = toPlanTier(params.tier);
		const server = await McpServer.findByPk(params.mcpServerId);
		if (!server) {
			throw new Error("mcp_server_not_found");
		}
		if (!tierGte(tier, toPlanTier(server.minTier) as PlanTier)) {
			throw new Error(`mcp_requires_tier:${server.minTier}`);
		}
		if (server.ownerType === "vp" && server.ownerUserId !== params.userId) {
			throw new Error("not_your_mcp");
		}

		const agent = await Agent.findOne({ where: { id: params.agentId, userId: params.userId } });
		if (!agent) {
			throw new Error("agent_not_found");
		}

		let credentialsCiphertext: string | null = null;
		if (params.credentials && Object.keys(params.credentials).length > 0) {
			try {
				credentialsCiphertext = mcpCredsToCiphertext(params.userId, params.credentials);
			} catch (e) {
				logger.error("mcp_connect encrypt failed", e);
				throw new Error("mcp_credential_seal_failed");
			}
		}

		return await AgentMcpConnection.create({
			agentId: params.agentId,
			mcpServerId: params.mcpServerId,
			userId: params.userId,
			credentialsCiphertext,
			enabledTools: params.enabledTools ?? [],
		});
	}

	async registerCustomMcp(params: {
		userId: string;
		tier: string;
		displayName: string;
		description?: string;
		endpointUrl: string;
		authScheme: "bearer" | "oauth" | "apikey" | "vault";
		category?: string;
	}): Promise<McpServer> {
		if (!tierGte(toPlanTier(params.tier), "business")) {
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

	async toolsFor(agentId: string): Promise<Array<{ mcpServerId: string; tools: string[] }>> {
		const conns = await AgentMcpConnection.findAll({ where: { agentId } });
		return conns.map((c) => ({
			mcpServerId: c.mcpServerId,
			tools: c.enabledTools ?? [],
		}));
	}
}

export const mcpConnection = new McpConnectionService();
