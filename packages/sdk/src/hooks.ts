import type { HookHandler, HookType } from "./hooks-types.js";

/**
 * Business+ and Enterprise: register a custom server-side hook (enforced on backend).
 * Not implemented in the public SDK build — call the future `/api/sdk/hooks/register` API instead.
 */
export function registerHook(_options: {
	agentId: string;
	hookType: HookType;
	handler: HookHandler<unknown, unknown>;
	name: string;
}): Promise<void> {
	return Promise.reject(
		new Error(
			"registerHook is not implemented in the SDK. Use the Clara platform hook registration API when available.",
		),
	);
}

export type { HookHandler, HookType } from "./hooks-types.js";
