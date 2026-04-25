import { Agent } from "@/models/Agent";
import { AgentUserMemory } from "@/models/AgentUserMemory";
import { ConversationTurn } from "@/models/ConversationTurn";
import { type AgentMessageView, agentMessagingService } from "@/services/agent-messaging.service";
import { agentPhaseService } from "@/services/agent-phase.service";
import { claraScrumService } from "@/services/clara-scrum.service";
import { logger } from "@/utils/logger";
import { isUuidString } from "@/utils/uuid";

const RECENT_TURNS_LIMIT = 20;

export type TurnRole = "user" | "assistant";
export type HistoryEntry = { role: TurnRole; content: string };

export type MemoryUserProfileSlice = {
	displayName: string | null;
	activeProjects: { name: string; description: string; status: string }[];
	techStack: string[];
	preferences: string[];
};

export type MemoryContext = {
	agentId: string;
	summary: string | null;
	keyFacts: string[];
	recentTurns: HistoryEntry[];
	lastSessionAt: string | null;
	lastSessionSurface: string | null;
	totalSessions: number;
	isReturningUser: boolean;
	phaseContextPrefix: string | null;
	inboxMessages: AgentMessageView[];
	userProfile: MemoryUserProfileSlice | null;
};

export class MemoryService {
	async saveTurn(
		userId: string,
		agentId: string = "clara",
		sessionId: string,
		surface: string,
		role: TurnRole,
		content: string,
	): Promise<void> {
		if (!content.trim()) {
			return;
		}
		try {
			await ConversationTurn.create({ userId, agentId, sessionId, surface, role, content });
		} catch (err) {
			logger.error("[memory] saveTurn failed:", err);
		}
	}

	async getMemoryContext(userId: string, agentId: string = "clara"): Promise<MemoryContext> {
		try {
			let phaseContextPrefix: string | null = null;
			if (isUuidString(agentId)) {
				const agent = await Agent.findOne({ where: { userId, id: agentId } });
				if (agent) {
					phaseContextPrefix = agentPhaseService.buildPhaseContext(
						agent.phase,
						agent.industryVertical ?? undefined,
					);
				}
			}

			const [memory, recentRows, inbox, profile] = await Promise.all([
				AgentUserMemory.findOne({ where: { userId, agentId } }),
				ConversationTurn.findAll({
					where: { userId, agentId },
					order: [["createdAt", "DESC"]],
					limit: RECENT_TURNS_LIMIT,
				}),
				agentMessagingService.readInbox(userId, agentId),
				claraScrumService.getUserProfile(userId),
			]);

			const recentTurns: HistoryEntry[] = recentRows
				.slice()
				.reverse()
				.map((r) => ({ role: r.role as TurnRole, content: r.content }));

			const total = memory?.totalSessions ?? 0;
			return {
				agentId,
				summary: memory?.summary ?? null,
				keyFacts: Array.isArray(memory?.keyFacts) ? (memory.keyFacts as string[]) : [],
				recentTurns,
				lastSessionAt: memory?.lastSessionAt?.toISOString() ?? null,
				lastSessionSurface: memory?.lastSessionSurface ?? null,
				totalSessions: total,
				isReturningUser: total > 0,
				phaseContextPrefix,
				inboxMessages: inbox,
				userProfile: {
					displayName: profile.displayName,
					activeProjects: profile.activeProjects ?? [],
					techStack: profile.techStack ?? [],
					preferences: profile.preferences ?? [],
				},
			};
		} catch (err) {
			logger.error("[memory] getMemoryContext failed:", err);
			return {
				agentId,
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
			};
		}
	}

	async touchSession(userId: string, agentId: string = "clara", surface: string, sessionId: string): Promise<void> {
		try {
			const existingTurns = await ConversationTurn.count({ where: { sessionId, agentId } });
			const isNewSession = existingTurns === 0;

			const [row] = await AgentUserMemory.findOrCreate({
				where: { userId, agentId },
				defaults: { userId, agentId, keyFacts: [], totalSessions: 0, summary: null },
			});

			await row.update({
				lastSessionAt: new Date(),
				lastSessionSurface: surface,
			});

			if (isNewSession) {
				await row.increment("totalSessions", { by: 1 });
			}
		} catch (err) {
			logger.error("[memory] touchSession failed:", err);
		}
	}

	buildHistory(context: MemoryContext): HistoryEntry[] {
		const history: HistoryEntry[] = [];

		if (context.phaseContextPrefix) {
			history.push({ role: "user", content: context.phaseContextPrefix });
			history.push({ role: "assistant", content: "Understood." });
		}

		if (context.userProfile) {
			const { displayName, activeProjects, techStack, preferences } = context.userProfile;
			const profileLines: string[] = [];
			if (displayName) profileLines.push(`User: ${displayName}`);
			if (activeProjects.length > 0)
				profileLines.push(`Active projects: ${activeProjects.map((p) => p.name).join(", ")}`);
			if (techStack.length > 0) profileLines.push(`Tech stack: ${techStack.join(", ")}`);
			if (preferences.length > 0) profileLines.push(`Preferences: ${preferences.join("; ")}`);
			if (profileLines.length > 0) {
				history.push({ role: "user", content: `[User Profile] ${profileLines.join(" | ")}` });
				history.push({ role: "assistant", content: "Understood." });
			}
		}

		if (context.summary) {
			history.push({ role: "user", content: `[My Memory] ${context.summary}` });
			history.push({ role: "assistant", content: "Got it." });
		}

		for (const msg of context.inboxMessages) {
			history.push({
				role: "user",
				content: `[Message from ${msg.fromAgentId}] ${msg.content}`,
			});
		}

		history.push(...context.recentTurns);
		return history;
	}
}

export const memoryService = new MemoryService();
