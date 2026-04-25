import { AGENT_IP_WRAPPER, detectForbidden, sanitize } from "@/lib/ip-firewall";
import { logger } from "@/utils/logger";

export class AgentConfigService {
	/**
	 * Validate and sanitize a SOUL.md before storing.
	 * Logs violations; strips forbidden substrings.
	 */
	sanitizeSoulMd(rawSoul: string, agentName: string): string {
		const violations = detectForbidden(rawSoul);

		if (violations.length > 0) {
			logger.warn(
				`[ip-firewall] SOUL.md for agent "${agentName}" contained forbidden strings: ${violations.join(", ")}`,
			);
		}

		return sanitize(rawSoul);
	}

	/**
	 * Build the full system prompt for an inference call.
	 * The IP wrapper is not stored on the agent — it is added at call time only.
	 */
	buildSystemPrompt(soulMd: string, agentName: string): string {
		return `${AGENT_IP_WRAPPER}\n\nAgent name: ${agentName}\n\n${soulMd}`;
	}
}

export const agentConfigService = new AgentConfigService();
