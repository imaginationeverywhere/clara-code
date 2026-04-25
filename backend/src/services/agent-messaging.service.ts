import { Op } from "sequelize";
import { AgentMessage } from "@/models/AgentMessage";

export type MessageType = "request" | "response" | "broadcast" | "escalate";

export type SendMessageInput = {
	userId: string;
	fromAgentId: string;
	toAgentId: string;
	messageType: MessageType;
	content: string;
	threadId?: string;
	metadata?: Record<string, unknown>;
};

export type AgentMessageView = {
	id: string;
	fromAgentId: string;
	messageType: string;
	content: string;
	threadId: string;
	metadata: Record<string, unknown>;
	createdAt: string;
};

export class AgentMessagingService {
	async send(input: SendMessageInput): Promise<AgentMessage> {
		return AgentMessage.create({
			userId: input.userId,
			fromAgentId: input.fromAgentId,
			toAgentId: input.toAgentId,
			...(input.threadId ? { threadId: input.threadId } : {}),
			messageType: input.messageType,
			content: input.content,
			metadata: input.metadata ?? {},
		});
	}

	async readInbox(userId: string, agentId: string): Promise<AgentMessageView[]> {
		const messages = await AgentMessage.findAll({
			where: {
				userId,
				toAgentId: { [Op.in]: [agentId, "all"] },
				readAt: null,
			},
			order: [["createdAt", "ASC"]],
		});

		if (messages.length > 0) {
			await AgentMessage.update({ readAt: new Date() }, { where: { id: { [Op.in]: messages.map((m) => m.id) } } });
		}

		return messages.map((m) => ({
			id: m.id,
			fromAgentId: m.fromAgentId,
			messageType: m.messageType,
			content: m.content,
			threadId: m.threadId,
			metadata: m.metadata,
			createdAt: m.createdAt.toISOString(),
		}));
	}

	async getThread(userId: string, threadId: string): Promise<AgentMessageView[]> {
		const messages = await AgentMessage.findAll({
			where: { userId, threadId },
			order: [["createdAt", "ASC"]],
		});
		return messages.map((m) => ({
			id: m.id,
			fromAgentId: m.fromAgentId,
			messageType: m.messageType,
			content: m.content,
			threadId: m.threadId,
			metadata: m.metadata,
			createdAt: m.createdAt.toISOString(),
		}));
	}

	async countUnread(userId: string): Promise<number> {
		return AgentMessage.count({
			where: { userId, readAt: null },
		});
	}

	async countSentThisMonth(userId: string, billingMonth: string): Promise<number> {
		const monthStart = new Date(`${billingMonth}T00:00:00Z`);
		const monthEnd = new Date(monthStart);
		monthEnd.setMonth(monthEnd.getMonth() + 1);
		return AgentMessage.count({
			where: {
				userId,
				createdAt: { [Op.gte]: monthStart, [Op.lt]: monthEnd },
				toAgentId: { [Op.ne]: "all" },
			},
		});
	}

	/** Messages this agent sent since `since` (excludes broadcasts). */
	async countFromAgentSince(userId: string, fromAgentId: string, since: Date): Promise<number> {
		return AgentMessage.count({
			where: {
				userId,
				fromAgentId,
				createdAt: { [Op.gte]: since },
				toAgentId: { [Op.ne]: "all" },
			},
		});
	}
}

export const agentMessagingService = new AgentMessagingService();
