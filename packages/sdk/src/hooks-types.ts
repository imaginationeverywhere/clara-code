/**
 * Subset of backend `backend/src/lib/hooks.ts` for type-safe client usage.
 * Keep in sync when changing hook types on the server.
 */
export type HookType = "SessionStart" | "SessionEnd" | "UserPromptSubmit" | "PreToolUse" | "PostToolUse" | "Stop";

export type HookHandler<I, O> = (input: I, context: { userId: string; agentId: string }) => Promise<O> | O;
