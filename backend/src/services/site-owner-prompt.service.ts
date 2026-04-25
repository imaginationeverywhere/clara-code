import { AGENT_IP_WRAPPER } from "@/lib/ip-firewall";
import { SiteAgentDeployment } from "@/models/SiteAgentDeployment";
import { SiteOwnerInstruction } from "@/models/SiteOwnerInstruction";
import { UserAgent } from "@/models/UserAgent";

/**
 * Builds a full system prompt for a deployed runtime agent including SITE_OWNER overlays.
 * Call at inference time; IP firewall on responses remains mandatory separately.
 */
export async function buildSiteOwnerAgentSystemPrompt(deploymentId: string): Promise<string> {
	const deployment = await SiteAgentDeployment.findByPk(deploymentId, { include: [UserAgent] });
	if (!deployment) {
		throw new Error("deployment_not_found");
	}
	const userAgent = deployment.userAgent;
	if (!userAgent) {
		throw new Error("user_agent_missing");
	}
	const baseSoul = userAgent.soulMd;

	const withEffective = await SiteOwnerInstruction.findAll({
		where: { deploymentId, approvedByPlatform: true },
		order: [["createdAt", "ASC"]],
	});

	const ownerOverlay =
		withEffective.length > 0
			? `\n\n[SITE OWNER INSTRUCTIONS — follow these in priority order]\n${withEffective.map((i) => `- ${i.instruction}`).join("\n")}`
			: "";

	return [AGENT_IP_WRAPPER, baseSoul, ownerOverlay].join("\n\n");
}
