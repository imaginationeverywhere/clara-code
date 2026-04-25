import type {
	HookContext,
	HookRegistration,
	HookType,
	PostToolUseInput,
	PreToolUseInput,
	PreToolUseOutput,
	SessionEndInput,
	SessionStartInput,
	SessionStartOutput,
	StopInput,
	StopOutput,
	UserPromptSubmitInput,
	UserPromptSubmitOutput,
} from "@/lib/hooks";
import { logger } from "@/utils/logger";

/**
 * Pluggable agent lifecycle chain. `hookBus` is the shared singleton; tests may
 * `new HookBus()` to avoid side effects from platform registration.
 */
export class HookBus {
	private readonly registry: Map<HookType, HookRegistration[]> = new Map();

	register(reg: HookRegistration): void {
		const list = this.registry.get(reg.hookType) ?? [];
		list.push(reg);
		list.sort((a, b) => {
			if (a.owner === "platform" && b.owner !== "platform") {
				return -1;
			}
			if (b.owner === "platform" && a.owner !== "platform") {
				return 1;
			}
			return a.priority - b.priority;
		});
		this.registry.set(reg.hookType, list);
	}

	async runSessionStart(input: SessionStartInput, ctx: HookContext): Promise<SessionStartOutput> {
		let soulMd = input.startingSoulMd;
		let memory = [...input.initialMemory];
		for (const hook of this.registry.get("SessionStart") ?? []) {
			try {
				const out = (await hook.handler(
					{ startingSoulMd: soulMd, initialMemory: memory },
					ctx,
				)) as SessionStartOutput;
				if (out?.soulMd !== undefined) {
					soulMd = out.soulMd;
				}
				if (out?.additionalMemory?.length) {
					memory = [...memory, ...out.additionalMemory];
				}
			} catch (err) {
				logger.error("hook_failed", { hook: hook.name, type: "SessionStart", err });
			}
		}
		return { soulMd, additionalMemory: memory };
	}

	async runUserPromptSubmit(input: UserPromptSubmitInput, ctx: HookContext): Promise<UserPromptSubmitOutput> {
		let prompt = input.rawPrompt;
		for (const hook of this.registry.get("UserPromptSubmit") ?? []) {
			try {
				const out = (await hook.handler({ ...input, rawPrompt: prompt }, ctx)) as UserPromptSubmitOutput;
				if (out?.blocked) {
					return out;
				}
				if (out?.deflectionResponse) {
					return out;
				}
				if (out?.sanitizedPrompt !== undefined) {
					prompt = out.sanitizedPrompt;
				}
			} catch (err) {
				logger.error("hook_failed", { hook: hook.name, type: "UserPromptSubmit", err });
			}
		}
		return { sanitizedPrompt: prompt };
	}

	async runPreToolUse(input: PreToolUseInput, ctx: HookContext): Promise<PreToolUseOutput> {
		let toolInput = input.toolInput;
		for (const hook of this.registry.get("PreToolUse") ?? []) {
			try {
				const out = (await hook.handler({ ...input, toolInput }, ctx)) as PreToolUseOutput;
				if (!out.allowed) {
					return out;
				}
				if (out.transformedInput) {
					toolInput = out.transformedInput;
				}
			} catch (err) {
				logger.error("hook_failed", { hook: hook.name, type: "PreToolUse", err });
			}
		}
		return { allowed: true, transformedInput: toolInput };
	}

	async runPostToolUse(input: PostToolUseInput, ctx: HookContext): Promise<void> {
		for (const hook of this.registry.get("PostToolUse") ?? []) {
			try {
				await hook.handler(input, ctx);
			} catch (err) {
				logger.error("hook_failed", { hook: hook.name, type: "PostToolUse", err });
			}
		}
	}

	async runStop(input: StopInput, ctx: HookContext): Promise<StopOutput> {
		let responseText = input.agentResponseText;
		let shouldEmit = true;
		for (const hook of this.registry.get("Stop") ?? []) {
			try {
				const out = (await hook.handler({ ...input, agentResponseText: responseText }, ctx)) as StopOutput;
				if (out?.sanitizedResponseText !== undefined) {
					responseText = out.sanitizedResponseText;
				}
				if (out?.shouldEmitAudio === false) {
					shouldEmit = false;
				}
			} catch (err) {
				logger.error("hook_failed", { hook: hook.name, type: "Stop", err });
			}
		}
		return { sanitizedResponseText: responseText, shouldEmitAudio: shouldEmit };
	}

	async runSessionEnd(input: SessionEndInput, ctx: HookContext): Promise<void> {
		for (const hook of this.registry.get("SessionEnd") ?? []) {
			try {
				await hook.handler(input, ctx);
			} catch (err) {
				logger.error("hook_failed", { hook: hook.name, type: "SessionEnd", err });
			}
		}
	}
}

export const hookBus = new HookBus();
