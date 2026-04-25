jest.mock("@/models/Agent", () => ({
	Agent: {
		findAll: jest.fn().mockResolvedValue([]),
		create: jest.fn().mockResolvedValue({ id: "a1", name: "Agent" }),
	},
}));

jest.mock("@/services/voice-usage.service", () => ({
	voiceUsageService: {
		getUsage: jest.fn().mockResolvedValue({ used: 1, limit: 100, resetDate: "2026-05-01" }),
	},
}));

import { GraphQLError } from "graphql";
import type { ClaraCoreContext } from "@/graphql/clara-core/context";
import { resolvers } from "@/graphql/clara-core/resolvers";
import { Agent } from "@/models/Agent";

const baseCtx = (tier: string): ClaraCoreContext => ({
	user: { userId: "user_cc", tier, role: "user" },
	authorization: "Bearer sk-clara-test",
});

describe("Clara Core subgraph resolvers", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(Agent.findAll as jest.Mock).mockResolvedValue([]);
		(Agent.create as jest.Mock).mockResolvedValue({ id: "a1", name: "Agent" });
		global.fetch = jest.fn() as unknown as typeof fetch;
	});

	it("Query.models returns only MAYA for free tier", async () => {
		const out = await resolvers.Query.models(null, {}, baseCtx("base"));
		expect(out.map((m: { name: string }) => m.name)).toEqual(["MAYA"]);
	});

	it("Query.models returns all models for pro tier", async () => {
		const out = await resolvers.Query.models(null, {}, baseCtx("pro"));
		const names = out.map((m: { name: string }) => m.name).sort();
		expect(names).toEqual(["MARY", "MAYA", "NIKKI"]);
	});

	it("Mutation.ask uses default model when name is invalid", async () => {
		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ message: { content: "ok" }, voiceUrl: null }),
		});
		const r = await resolvers.Mutation.ask(null, { prompt: "hi", model: "NOT_A_MODEL" }, baseCtx("base"));
		expect(r.content).toBe("ok");
		expect(global.fetch).toHaveBeenCalled();
		const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body as string);
		expect(body.model).toBe("maya");
	});

	it("Mutation.ask throws FORBIDDEN when free tier requests a pro model", async () => {
		await expect(resolvers.Mutation.ask(null, { prompt: "hi", model: "MARY" }, baseCtx("base"))).rejects.toThrow(
			GraphQLError,
		);
	});

	it("Mutation.ask throws when Clara API response is not ok", async () => {
		(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 502 });
		await expect(resolvers.Mutation.ask(null, { prompt: "hi", model: "MAYA" }, baseCtx("base"))).rejects.toThrow(
			/Clara API request failed/,
		);
	});

	it("Query.me returns usage fields", async () => {
		const row = await resolvers.Query.me(null, {}, baseCtx("base"));
		expect(row).toMatchObject({
			id: "user_cc",
			tier: "base",
			voiceExchangesUsed: 1,
			voiceExchangesLimit: 100,
		});
	});

	it("Query.agents maps Agent rows", async () => {
		(Agent.findAll as jest.Mock).mockResolvedValueOnce([{ id: "a1", name: "One" }]);
		const rows = await resolvers.Query.agents(null, {}, baseCtx("pro"));
		expect(rows).toEqual([{ id: "a1", name: "One" }]);
	});

	it("Mutation.createAgent persists an agent", async () => {
		const row = await resolvers.Mutation.createAgent(null, { name: "Z", soul: "{}" }, baseCtx("base"));
		expect(row).toEqual({ id: "a1", name: "Agent" });
		expect(Agent.create).toHaveBeenCalled();
	});

	it("Mutation.startVoiceSession returns session id", async () => {
		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ id: "vs_1" }),
		});
		const row = await resolvers.Mutation.startVoiceSession(null, {}, baseCtx("base"));
		expect(row).toEqual({ id: "vs_1" });
	});

	it("Mutation.startVoiceSession throws when response is not ok", async () => {
		(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 500 });
		await expect(resolvers.Mutation.startVoiceSession(null, {}, baseCtx("base"))).rejects.toThrow(
			/voice session failed/,
		);
	});

	it("Mutation.startVoiceSession throws when id is missing", async () => {
		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ id: "" }),
		});
		await expect(resolvers.Mutation.startVoiceSession(null, {}, baseCtx("base"))).rejects.toThrow(/missing id/);
	});

	it("Subscription.stream yields a terminal event", async () => {
		const sub = resolvers.Subscription.stream as {
			subscribe: () => AsyncGenerator<{ text: string; done: boolean }>;
		};
		const gen = sub.subscribe();
		const first = await gen.next();
		expect(first.value).toEqual({ text: "", done: true });
	});
});
