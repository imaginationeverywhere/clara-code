import type { HookContext, UserPromptSubmitOutput } from "@/lib/hooks";
import { HookBus } from "@/services/hook-bus.service";

const ctx: HookContext = {
	userId: "u1",
	agentId: "a1",
	sessionId: "s1",
	turnId: "t1",
	tier: "free",
	metadata: {},
};

describe("HookBus", () => {
	let bus: HookBus;

	beforeEach(() => {
		bus = new HookBus();
	});

	it("runs platform hooks before vp hooks regardless of priority", async () => {
		const log: string[] = [];
		bus.register({
			hookType: "UserPromptSubmit",
			name: "vp-early",
			owner: "vp",
			priority: 0,
			async handler() {
				log.push("vp");
				return { sanitizedPrompt: "x" };
			},
		});
		bus.register({
			hookType: "UserPromptSubmit",
			name: "platform-late",
			owner: "platform",
			priority: 9,
			async handler() {
				log.push("platform");
				return { sanitizedPrompt: "p" };
			},
		});
		const out = await bus.runUserPromptSubmit({ rawPrompt: "a", modality: "text" }, ctx);
		expect(out.sanitizedPrompt).toBe("x");
		expect(log).toEqual(["platform", "vp"]);
	});

	it("stops UserPromptSubmit chain on deflection", async () => {
		const log: string[] = [];
		bus.register({
			hookType: "UserPromptSubmit",
			name: "a",
			owner: "platform",
			priority: 0,
			async handler() {
				log.push("a");
				return { deflectionResponse: "d" } as UserPromptSubmitOutput;
			},
		});
		bus.register({
			hookType: "UserPromptSubmit",
			name: "b",
			owner: "platform",
			priority: 1,
			async handler() {
				log.push("b");
				return {};
			},
		});
		const r = await bus.runUserPromptSubmit({ rawPrompt: "x", modality: "text" }, ctx);
		expect(r.deflectionResponse).toBe("d");
		expect(log).toEqual(["a"]);
	});

	it("composes sanitizedPrompt through multiple handlers", async () => {
		bus.register({
			hookType: "UserPromptSubmit",
			name: "one",
			owner: "platform",
			priority: 0,
			async handler(input) {
				return { sanitizedPrompt: `${(input as { rawPrompt: string }).rawPrompt}1` };
			},
		});
		bus.register({
			hookType: "UserPromptSubmit",
			name: "two",
			owner: "platform",
			priority: 1,
			async handler(input) {
				return { sanitizedPrompt: `${(input as { rawPrompt: string }).rawPrompt}2` };
			},
		});
		const r = await bus.runUserPromptSubmit({ rawPrompt: "a", modality: "text" }, ctx);
		expect(r.sanitizedPrompt).toBe("a12");
	});

	it("PreToolUse blocks on first disallowed", async () => {
		bus.register({
			hookType: "PreToolUse",
			name: "allow",
			owner: "vp",
			priority: 0,
			async handler() {
				return { allowed: true, transformedInput: { x: 1 } };
			},
		});
		bus.register({
			hookType: "PreToolUse",
			name: "deny",
			owner: "vp",
			priority: 1,
			async handler() {
				return { allowed: false, reason: "nope" };
			},
		});
		const r = await bus.runPreToolUse({ toolName: "Bash", toolInput: {} }, ctx);
		expect(r.allowed).toBe(false);
		expect(r.reason).toBe("nope");
	});

	it("Stop output filter updates text", async () => {
		bus.register({
			hookType: "Stop",
			name: "s",
			owner: "platform",
			priority: 0,
			async handler() {
				return { sanitizedResponseText: "z" };
			},
		});
		const r = await bus.runStop({ agentResponseText: "a", toolCallsExecuted: 0 }, ctx);
		expect(r.sanitizedResponseText).toBe("z");
	});

	it("skips a failed handler and continues", async () => {
		bus.register({
			hookType: "UserPromptSubmit",
			name: "blow",
			owner: "platform",
			priority: 0,
			async handler() {
				throw new Error("boom");
			},
		});
		bus.register({
			hookType: "UserPromptSubmit",
			name: "ok",
			owner: "platform",
			priority: 1,
			async handler(input) {
				return { sanitizedPrompt: `ok${(input as { rawPrompt: string }).rawPrompt}` };
			},
		});
		const r = await bus.runUserPromptSubmit({ rawPrompt: "x", modality: "text" }, ctx);
		expect(r.sanitizedPrompt).toBe("okx");
	});
});
