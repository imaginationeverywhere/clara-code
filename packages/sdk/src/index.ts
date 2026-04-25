export { createClient } from "./client.js";
export type { HarnessTalentListItem, HarnessTalentsConfig } from "./harness-talents.js";
export {
	acquireHarnessTalent,
	attachHarnessTalent,
	listHarnessTalentInventory,
} from "./harness-talents.js";
export { registerHook } from "./hooks.js";
export type { HookHandler, HookType } from "./hooks-types.js";
export type {
	Agent,
	AgentSession,
	ClaraClient,
	ClaraConfig,
	ClaraMessage,
	ClaraMessageRole,
	VoiceSession,
} from "./types.js";
