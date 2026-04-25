import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("@/models/AgentMessage", () => ({
	AgentMessage: {
		findAll: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		count: jest.fn(),
	},
}));

import { AgentMessage } from "@/models/AgentMessage";
import { AgentMessagingService } from "@/services/agent-messaging.service";

const mockFindAll = AgentMessage.findAll as jest.MockedFunction<typeof AgentMessage.findAll>;
const mockCreate = AgentMessage.create as jest.MockedFunction<typeof AgentMessage.create>;
const mockUpdate = AgentMessage.update as jest.MockedFunction<typeof AgentMessage.update>;

describe("AgentMessagingService", () => {
	const svc = new AgentMessagingService();

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("send creates a row with required fields", async () => {
		mockCreate.mockResolvedValue({ id: "m1", threadId: "t1" } as never);
		await svc.send({
			userId: "u1",
			fromAgentId: "a",
			toAgentId: "b",
			messageType: "request",
			content: "hello",
		});
		expect(mockCreate).toHaveBeenCalled();
		const firstCall = mockCreate.mock.calls[0];
		expect(firstCall).toBeDefined();
		const arg = firstCall![0] as Record<string, unknown>;
		expect(arg.userId).toBe("u1");
		expect(arg.content).toBe("hello");
	});

	it("readInbox marks messages read and returns views", async () => {
		const created = new Date("2026-01-01T00:00:00.000Z");
		mockFindAll.mockResolvedValueOnce([
			{
				id: "1",
				fromAgentId: "x",
				messageType: "request",
				content: "c",
				threadId: "tid",
				metadata: {},
				createdAt: created,
			},
		] as never);
		mockUpdate.mockResolvedValue([1] as never);
		const rows = await svc.readInbox("u1", "agent-1");
		expect(rows).toHaveLength(1);
		expect(rows[0].fromAgentId).toBe("x");
		expect(mockUpdate).toHaveBeenCalled();
	});

	it("getThread scopes by user id", async () => {
		mockFindAll.mockResolvedValueOnce([] as never);
		await svc.getThread("u1", "thread-1");
		expect(mockFindAll).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { userId: "u1", threadId: "thread-1" },
			}),
		);
	});
});
