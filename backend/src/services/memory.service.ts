import { AgentUserMemory } from "@/models/AgentUserMemory";
import { ConversationTurn } from "@/models/ConversationTurn";
import { logger } from "@/utils/logger";

const RECENT_TURNS_LIMIT = 20;

export type TurnRole = "user" | "assistant";
export type HistoryEntry = { role: TurnRole; content: string };

export type MemoryContext = {
	agentId: string;
	summary: string | null;
	keyFacts: string[];
	recentTurns: HistoryEntry[];
	lastSessionAt: string | null;
	lastSessionSurface: string | null;
	totalSessions: number;
	isReturningUser: boolean;
};

export class MemoryService {
	/** Save one turn. Never throws — memory is always best-effort. */
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

	/** Fetch memory context scoped to this (user, agent) pair. */
	async getMemoryContext(userId: string, agentId: string = "clara"): Promise<MemoryContext> {
		try {
			const [memory, recentRows] = await Promise.all([
				AgentUserMemory.findOne({ where: { userId, agentId } }),
				ConversationTurn.findAll({
					where: { userId, agentId },
					order: [["createdAt", "DESC"]],
					limit: RECENT_TURNS_LIMIT,
				}),
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
			};
		}
	}

	/** Touch last_session metadata and increment total_sessions on first turn of a new session_id. */
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

	/**
	 * Build history array for the voice server.
	 * Prepends the summary as implicit context so the agent greets appropriately.
	 */
	buildHistory(context: MemoryContext): HistoryEntry[] {
		const history: HistoryEntry[] = [];

		if (context.summary) {
			history.push({ role: "user", content: `[Memory] ${context.summary}` });
			history.push({ role: "assistant", content: "Understood." });
		}

		history.push(...context.recentTurns);
		return history;
	}
}

export const memoryService = new MemoryService();
