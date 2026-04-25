/**
 * @ie/clara — Clara Agent SDK
 *
 * A clean, opinionated entry point for building AI coding agents with Clara.
 * Powered by the Hermes model router: Gemma 4 27B (Modal) primary, with
 * automatic fallback to Kimi K2, DeepSeek V3, and premium models per request.
 * The SDK does not pin a model — Hermes selects the right one per call.
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

/**
 * Informational hint only — the actual model is chosen per-request by the
 * Hermes harness (Gemma 4 27B primary on Modal; fallback to Kimi K2,
 * DeepSeek V3, premium). See `pricing/model-routing-strategy.md`.
 */
export const CLARA_DEFAULT_MODEL = "gemma.4";

/**
 * Informational hint only — Hermes routes self-hosted (Modal) primary, with
 * Bedrock used only for the heavy-reasoning and premium fallbacks.
 */
export const CLARA_DEFAULT_PROVIDER = "hermes-router";

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
 * Routes through the Hermes harness (Gemma 4 27B primary on Modal; smart
 * fallback to Kimi K2, DeepSeek V3, and premium models), includes vault
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
