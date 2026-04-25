/**
 * @ie/clara — Clara Agent SDK
 *
 * A clean, opinionated entry point for building AI coding agents with Clara.
 * Model selection happens server-side via the Hermes router — the SDK ships
 * with no hardcoded model defaults. Per-request routing is the single source
 * of truth; see `pricing/model-routing-strategy.md`.
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
 * @deprecated Hermes routing is the single source of truth for model selection.
 * This export remains for backwards compatibility and resolves to whatever the
 * `CLARA_DEFAULT_MODEL` environment variable supplies, or `undefined` when unset.
 * Consumers should rely on Hermes per-request routing rather than this hint.
 */
export const CLARA_DEFAULT_MODEL: string | undefined = process.env.CLARA_DEFAULT_MODEL;

/**
 * @deprecated Hermes routing is the single source of truth for provider selection.
 * This export remains for backwards compatibility and resolves to whatever the
 * `CLARA_DEFAULT_PROVIDER` environment variable supplies, or `undefined` when unset.
 */
export const CLARA_DEFAULT_PROVIDER: string | undefined = process.env.CLARA_DEFAULT_PROVIDER;

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
 * Routes through the Hermes harness — model selection is per-request and
 * driven server-side; this SDK does not pin a model. Includes vault tools
 * and resolves the agent directory automatically.
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
