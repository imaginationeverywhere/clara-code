/**
 * Agent lifecycle hook types — API parity with Claude-style agent SDKs.
 * See prompts/26-agent-lifecycle-hooks.md
 */

export type HookType = "SessionStart" | "SessionEnd" | "UserPromptSubmit" | "PreToolUse" | "PostToolUse" | "Stop";

export interface HookContext {
	userId: string;
	agentId: string;
	sessionId: string;
	turnId: string;
	/** If this is a deployed runtime agent (SITE_OWNER context) */
	deploymentId?: string;
	tier: string;
	metadata: Record<string, unknown>;
}

export interface SessionStartInput {
	startingSoulMd: string;
	initialMemory: string[];
}
export interface SessionStartOutput {
	/** Replaced SOUL if hook modified it */
	soulMd?: string;
	additionalMemory?: string[];
}

export interface UserPromptSubmitInput {
	rawPrompt: string;
	modality: "text" | "voice";
}
export interface UserPromptSubmitOutput {
	sanitizedPrompt?: string;
	blocked?: boolean;
	blockReason?: string;
	/** When set, skip upstream inference and return this text to the client */
	deflectionResponse?: string;
}

export interface PreToolUseInput {
	toolName: string;
	toolInput: Record<string, unknown>;
}
export interface PreToolUseOutput {
	allowed: boolean;
	reason?: string;
	transformedInput?: Record<string, unknown>;
}

export interface PostToolUseInput {
	toolName: string;
	toolInput: Record<string, unknown>;
	toolOutput: unknown;
	error?: string;
	durationMs: number;
}
export type PostToolUseOutput = Record<never, never>;

export interface StopInput {
	agentResponseText: string;
	toolCallsExecuted: number;
}
export interface StopOutput {
	sanitizedResponseText?: string;
	shouldEmitAudio?: boolean;
}

export interface SessionEndInput {
	turnCount: number;
	durationMs: number;
	lastAgentMessage: string;
}
export type SessionEndOutput = Record<never, never>;

export type HookHandler<I, O> = (input: I, ctx: HookContext) => Promise<O> | O;

export interface HookRegistration {
	hookType: HookType;
	handler: HookHandler<unknown, unknown>;
	/** Lower runs first (within the same owner tier) */
	priority: number;
	name: string;
	/** Platform hooks always run first */
	owner: "platform" | "vp" | "deployment";
}
