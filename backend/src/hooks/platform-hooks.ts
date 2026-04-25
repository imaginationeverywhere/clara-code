/**
 * Default platform hook registrations. Audit / SITE_OWNER / UsageEvent DB hooks
 * are deferred until those models exist (see prompt 11 / 22).
 */
import { deflectionResponse, detectForbidden, isIntrospectionQuery, sanitize } from "@/lib/ip-firewall";
import { hookBus } from "@/services/hook-bus.service";
import { logger } from "@/utils/logger";

hookBus.register({
	hookType: "UserPromptSubmit",
	name: "ip-firewall-introspection-deflect",
	owner: "platform",
	priority: 0,
	handler: async (input, ctx) => {
		const raw =
			typeof (input as { rawPrompt?: string }).rawPrompt === "string"
				? (input as { rawPrompt: string }).rawPrompt
				: "";
		if (isIntrospectionQuery(raw)) {
			const name =
				typeof ctx.metadata.agentName === "string" && (ctx.metadata.agentName as string).length > 0
					? (ctx.metadata.agentName as string)
					: "your agent";
			return { deflectionResponse: deflectionResponse(name) };
		}
		return { sanitizedPrompt: raw };
	},
});

hookBus.register({
	hookType: "Stop",
	name: "ip-firewall-output-filter",
	owner: "platform",
	priority: 0,
	handler: async (input, _ctx) => {
		const text =
			typeof (input as { agentResponseText?: string }).agentResponseText === "string"
				? (input as { agentResponseText: string }).agentResponseText
				: "";
		const violations = detectForbidden(text);
		if (violations.length > 0) {
			logger.warn("[ip-firewall] output filter triggered", { matched: violations });
			return { sanitizedResponseText: sanitize(text) };
		}
		return {};
	},
});

/**
 * Disallow bash-style tools for deployed (SITE_OWNER) runtimes. Full standards
 * validator lives in a future `platform-standards.service` module.
 */
hookBus.register({
	hookType: "PreToolUse",
	name: "platform-standards-tool-gate",
	owner: "platform",
	priority: 0,
	handler: async (input, ctx) => {
		const toolName =
			typeof (input as { toolName?: string }).toolName === "string" ? (input as { toolName: string }).toolName : "";
		if (ctx.deploymentId && (toolName === "Bash" || toolName === "bash")) {
			return { allowed: false, reason: "bash_disallowed_on_deployed_agents" };
		}
		return { allowed: true };
	},
});
