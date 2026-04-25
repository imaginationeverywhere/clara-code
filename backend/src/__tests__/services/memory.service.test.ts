import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("@/models/ConversationTurn", () => ({
	ConversationTurn: { create: jest.fn(), findAll: jest.fn(), count: jest.fn() },
}));
jest.mock("@/models/AgentUserMemory", () => ({
	AgentUserMemory: { findOne: jest.fn(), findOrCreate: jest.fn() },
}));
jest.mock("@/models/Agent", () => ({
	Agent: { findOne: jest.fn() },
}));
jest.mock("@/services/agent-messaging.service", () => ({
	agentMessagingService: {
		readInbox: jest.fn().mockImplementation(() => Promise.resolve([])),
	},
}));
jest.mock("@/services/clara-scrum.service", () => ({
	claraScrumService: {
		getUserProfile: jest.fn().mockImplementation(() =>
			Promise.resolve({
				userId: "u1",
				displayName: null,
				activeProjects: [],
				techStack: [],
				preferences: [],
				crossAgentLog: [],
				updatedAt: new Date(),
			}),
		),
	},
}));
jest.mock("@/utils/logger", () => ({
	logger: { error: jest.fn() },
}));

import { AgentUserMemory } from "@/models/AgentUserMemory";
import { ConversationTurn } from "@/models/ConversationTurn";
import { agentMessagingService } from "@/services/agent-messaging.service";
import { type MemoryContext, MemoryService } from "@/services/memory.service";

const mockCreate = ConversationTurn.create as unknown as jest.MockedFunction<typeof ConversationTurn.create>;
const mockFindAll = ConversationTurn.findAll as unknown as jest.MockedFunction<typeof ConversationTurn.findAll>;
const mockFindOne = AgentUserMemory.findOne as unknown as jest.MockedFunction<typeof AgentUserMemory.findOne>;
const mockReadInbox = agentMessagingService.readInbox as unknown as jest.MockedFunction<
	typeof agentMessagingService.readInbox
>;

function freshService(): MemoryService {
	return new MemoryService();
}

function emptyContext(over: Partial<MemoryContext> = {}): MemoryContext {
	return {
		agentId: "clara",
		summary: null,
		keyFacts: [],
		recentTurns: [],
		lastSessionAt: null,
		lastSessionSurface: null,
		totalSessions: 0,
		isReturningUser: false,
		phaseContextPrefix: null,
		inboxMessages: [],
		userProfile: null,
		...over,
	};
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
			expect(mockReadInbox).toHaveBeenCalledWith("u1", "a1");
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
		it("prepends summary as [My Memory] when present", () => {
			const ctx = emptyContext({
				summary: "We fixed the API.",
			});
			const h = freshService().buildHistory(ctx);
			expect(h[0]).toEqual({ role: "user", content: "[My Memory] We fixed the API." });
			expect(h[1]).toEqual({ role: "assistant", content: "Got it." });
		});

		it("returns only recent turns when no summary, profile, or inbox", () => {
			const ctx = emptyContext({
				recentTurns: [{ role: "user", content: "hi" }],
				totalSessions: 1,
				isReturningUser: true,
			});
			const h = freshService().buildHistory(ctx);
			expect(h).toEqual([{ role: "user", content: "hi" }]);
		});

		it("injects user profile before memory summary", () => {
			const ctx = emptyContext({
				userProfile: {
					displayName: "Ada",
					activeProjects: [],
					techStack: ["TypeScript"],
					preferences: [],
				},
				summary: "Task done.",
			});
			const h = freshService().buildHistory(ctx);
			expect(h[0].content).toContain("[User Profile]");
			expect(h[0].content).toContain("Ada");
			const memIdx = h.findIndex((e) => e.content.startsWith("[My Memory]"));
			expect(memIdx).toBeGreaterThan(1);
		});

		it("injects inbox messages after memory summary and before recent turns", () => {
			const ctx = emptyContext({
				summary: "S",
				inboxMessages: [
					{
						id: "1",
						fromAgentId: "other",
						messageType: "request",
						content: "help",
						threadId: "t1",
						metadata: {},
						createdAt: new Date().toISOString(),
					},
				],
				recentTurns: [{ role: "user", content: "last" }],
			});
			const h = freshService().buildHistory(ctx);
			const lastTurn = h[h.length - 1];
			expect(lastTurn).toEqual({ role: "user", content: "last" });
			const inboxLine = h.find((e) => e.content.includes("[Message from other]"));
			expect(inboxLine).toBeDefined();
		});
	});

	describe("saveTurn", () => {
		it("skips empty content", async () => {
			await freshService().saveTurn("u", "clara", "s1", "cli", "user", "   ");
			expect(mockCreate).not.toHaveBeenCalled();
		});
	});
});
