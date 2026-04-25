import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("@/models/ConversationTurn", () => ({
	ConversationTurn: { create: jest.fn(), findAll: jest.fn(), count: jest.fn() },
}));
jest.mock("@/models/AgentUserMemory", () => ({
	AgentUserMemory: { findOne: jest.fn(), findOrCreate: jest.fn() },
}));
jest.mock("@/utils/logger", () => ({
	logger: { error: jest.fn() },
}));

import { AgentUserMemory } from "@/models/AgentUserMemory";
import { ConversationTurn } from "@/models/ConversationTurn";
import { type MemoryContext, MemoryService } from "@/services/memory.service";

const mockCreate = ConversationTurn.create as unknown as jest.MockedFunction<typeof ConversationTurn.create>;
const mockFindAll = ConversationTurn.findAll as unknown as jest.MockedFunction<typeof ConversationTurn.findAll>;
const mockFindOne = AgentUserMemory.findOne as unknown as jest.MockedFunction<typeof AgentUserMemory.findOne>;

function freshService(): MemoryService {
	return new MemoryService();
}

describe("MemoryService — agent-scoped memory", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("getMemoryContext", () => {
		it("returns empty context for brand new (user, agent) pair", async () => {
			mockFindOne.mockResolvedValueOnce(null);
			mockFindAll.mockResolvedValueOnce([] as never);

			const c = await freshService().getMemoryContext("u1", "a1");
			expect(c.recentTurns).toEqual([]);
			expect(c.summary).toBeNull();
			expect(c.isReturningUser).toBe(false);
		});

		it("scopes queries by (user, agent) when loading turns", async () => {
			mockFindOne.mockResolvedValue(null);
			mockFindAll.mockResolvedValue([] as never);

			const svc = freshService();
			await svc.getMemoryContext("u1", "agentA");
			await svc.getMemoryContext("u1", "agentB");

			expect(mockFindAll).toHaveBeenNthCalledWith(1, {
				where: { userId: "u1", agentId: "agentA" },
				order: [["createdAt", "DESC"]],
				limit: 20,
			});
			expect(mockFindAll).toHaveBeenNthCalledWith(2, {
				where: { userId: "u1", agentId: "agentB" },
				order: [["createdAt", "DESC"]],
				limit: 20,
			});
		});
	});

	describe("buildHistory", () => {
		it("prepends summary as context entry when present", () => {
			const ctx: MemoryContext = {
				agentId: "clara",
				summary: "We fixed the API.",
				keyFacts: [],
				recentTurns: [],
				lastSessionAt: null,
				lastSessionSurface: null,
				totalSessions: 0,
				isReturningUser: false,
			};
			const h = freshService().buildHistory(ctx);
			expect(h[0]).toEqual({ role: "user", content: "[Memory] We fixed the API." });
			expect(h[1]).toEqual({ role: "assistant", content: "Understood." });
		});

		it("returns only recent turns when no summary", () => {
			const ctx: MemoryContext = {
				agentId: "clara",
				summary: null,
				keyFacts: [],
				recentTurns: [{ role: "user", content: "hi" }],
				lastSessionAt: null,
				lastSessionSurface: null,
				totalSessions: 1,
				isReturningUser: true,
			};
			const h = freshService().buildHistory(ctx);
			expect(h).toEqual([{ role: "user", content: "hi" }]);
		});
	});

	describe("saveTurn", () => {
		it("skips empty content", async () => {
			await freshService().saveTurn("u", "clara", "s1", "cli", "user", "   ");
			expect(mockCreate).not.toHaveBeenCalled();
		});
	});
});
