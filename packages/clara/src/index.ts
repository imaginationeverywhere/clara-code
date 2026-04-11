/**
 * @ie/clara — Clara Agent SDK
 *
 * A clean, opinionated entry point for building AI coding agents with Clara.
 * Powered by the Hermes model router with DeepSeek V3.2 via AWS Bedrock.
 *
 * @example
 * ```typescript
 * import { createClaraAgent } from '@ie/clara';
 *
 * const agent = await createClaraAgent({ name: 'my-agent' });
 * await agent.prompt('Hello Clara! What can you help me build today?');
 * ```
 */

export type {
	AgentSessionConfig,
	AgentSessionEvent,
	AgentSessionEventListener,
	CreateAgentSessionOptions,
	ModelCycleResult,
	PromptOptions,
	SessionStats,
	ToolDefinition,
} from "@mariozechner/pi-coding-agent";
export {
	AgentSession,
	AgentSessionRuntime,
	createAgentSession,
	createAgentSessionRuntime,
	getAgentDir,
	VERSION,
} from "@mariozechner/pi-coding-agent";

// ---------------------------------------------------------------------------
// Clara defaults
// ---------------------------------------------------------------------------

/** The default model for Clara agents — DeepSeek V3.2 via AWS Bedrock */
export const CLARA_DEFAULT_MODEL = "deepseek.v3.2";

/** The default provider for Clara agents */
export const CLARA_DEFAULT_PROVIDER = "amazon-bedrock";

// ---------------------------------------------------------------------------
// createClaraAgent — simplified factory
// ---------------------------------------------------------------------------

import type { CreateAgentSessionOptions } from "@mariozechner/pi-coding-agent";
import { createAgentSession } from "@mariozechner/pi-coding-agent";

export interface ClaraAgentOptions extends CreateAgentSessionOptions {
	/** Human-readable name for this agent instance (used for vault path resolution) */
	name?: string;
}

/**
 * Create a Clara agent session with sensible defaults.
 *
 * Sets the Hermes default model (DeepSeek V3.2 via Bedrock), includes vault
 * tools, and resolves the agent directory automatically.
 *
 * @example
 * ```typescript
 * const { session } = await createClaraAgent({ name: 'my-agent' });
 * await session.prompt('Build me a REST API');
 * ```
 */
export async function createClaraAgent(options: ClaraAgentOptions = {}) {
	return createAgentSession({
		...options,
	});
}
