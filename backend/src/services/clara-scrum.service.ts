import { AgentUserMemory } from "@/models/AgentUserMemory";
import { UserProfile } from "@/models/UserProfile";
import { agentMessagingService } from "@/services/agent-messaging.service";
import { sprintService } from "@/services/sprint.service";
import { logger } from "@/utils/logger";

export type AgentStandupSummary = {
	agentId: string;
	delivered: string | null;
	inProgress: string | null;
	blocked: string | null;
	messageCount: number;
	turnCount: number;
	lastSeenAt: string | null;
};

export type TeamStandupReport = {
	sprintId: string | null;
	sprintGoal: string | null;
	agents: AgentStandupSummary[];
	blockers: { agentId: string; blocker: string }[];
	totalDelivered: number;
	totalInProgress: number;
	totalBlocked: number;
	crossAgentMessages: number;
	generatedAt: string;
};

export class ClaraScrumService {
	async runTeamStandup(userId: string, sprintId?: string): Promise<TeamStandupReport> {
		const agentMemories = await AgentUserMemory.findAll({
			where: { userId },
			order: [["lastSessionAt", "DESC"]],
		});

		let sprintGoal: string | null = null;
		let resolvedSprintId = sprintId ?? null;
		if (!resolvedSprintId) {
			const activeSprint = await sprintService.getActiveSprint(userId);
			if (activeSprint) {
				resolvedSprintId = activeSprint.id;
				sprintGoal = activeSprint.goal;
			}
		}

		const agentSummaries: AgentStandupSummary[] = [];
		const blockers: { agentId: string; blocker: string }[] = [];

		for (const memory of agentMemories) {
			if (memory.agentId === "clara") continue;

			const report = await sprintService.generateStandupReport(
				userId,
				memory.agentId,
				resolvedSprintId ?? undefined,
			);

			agentSummaries.push({
				agentId: memory.agentId,
				delivered: report.delivered,
				inProgress: report.inProgress,
				blocked: report.blocked,
				messageCount: report.messageCount,
				turnCount: report.turnCount,
				lastSeenAt: memory.lastSessionAt?.toISOString() ?? null,
			});

			if (report.blocked) {
				blockers.push({ agentId: memory.agentId, blocker: report.blocked });
			}
		}

		const unreadCount = await agentMessagingService.countUnread(userId);

		await agentMessagingService.send({
			userId,
			fromAgentId: "clara",
			toAgentId: "all",
			messageType: "broadcast",
			content: `Standup held at ${new Date().toISOString()}. Review your tasks and update status.`,
			metadata: { sprintId: resolvedSprintId },
		});

		await this.updateCrossAgentLog(userId, agentSummaries);

		if (resolvedSprintId) {
			await sprintService.checkSprintCompletion(resolvedSprintId);
		}

		return {
			sprintId: resolvedSprintId,
			sprintGoal,
			agents: agentSummaries,
			blockers,
			totalDelivered: agentSummaries.filter((a) => a.delivered).length,
			totalInProgress: agentSummaries.filter((a) => a.inProgress).length,
			totalBlocked: blockers.length,
			crossAgentMessages: unreadCount,
			generatedAt: new Date().toISOString(),
		};
	}

	async getAgentSummaryForUser(
		userId: string,
		agentId: string,
	): Promise<{ summary: string | null; keyFacts: string[]; lastSessionAt: string | null }> {
		const memory = await AgentUserMemory.findOne({ where: { userId, agentId } });
		return {
			summary: memory?.summary ?? null,
			keyFacts: memory?.keyFacts ?? [],
			lastSessionAt: memory?.lastSessionAt?.toISOString() ?? null,
		};
	}

	async getUserProfile(userId: string): Promise<UserProfile> {
		const [profile] = await UserProfile.findOrCreate({
			where: { userId },
			defaults: { userId },
		});
		return profile;
	}

	async updateCrossAgentLog(userId: string, summaries: AgentStandupSummary[]): Promise<void> {
		try {
			const [profile] = await UserProfile.findOrCreate({
				where: { userId },
				defaults: { userId },
			});
			const today = new Date().toISOString().split("T")[0] ?? "";
			const newEvents = summaries
				.filter((s) => s.delivered)
				.map((s) => ({
					agent: s.agentId,
					event: s.delivered!,
					date: today,
				}));

			if (newEvents.length > 0) {
				const updatedLog = [...(profile.crossAgentLog ?? []), ...newEvents].slice(-50);
				await profile.update({ crossAgentLog: updatedLog, updatedAt: new Date() });
			}
		} catch (err) {
			logger.error("[clara-scrum] updateCrossAgentLog failed:", err);
		}
	}

	buildStandupPrompt(report: TeamStandupReport): string {
		const lines: string[] = [];
		lines.push(`[Team Standup — ${report.generatedAt}]`);
		if (report.sprintGoal) lines.push(`Sprint goal: ${report.sprintGoal}`);
		for (const agent of report.agents) {
			lines.push(`\nAgent ${agent.agentId}:`);
			if (agent.delivered) lines.push(`  ✓ Delivered: ${agent.delivered}`);
			if (agent.inProgress) lines.push(`  → In progress: ${agent.inProgress}`);
			if (agent.blocked) lines.push(`  ✗ Blocked: ${agent.blocked}`);
			if (!agent.delivered && !agent.inProgress) lines.push(`  — No activity since last standup`);
		}
		if (report.blockers.length > 0) {
			lines.push(`\nBlockers requiring attention: ${String(report.blockers.length)}`);
		}
		lines.push(`\nCross-agent messages pending: ${String(report.crossAgentMessages)}`);
		return lines.join("\n");
	}
}

export const claraScrumService = new ClaraScrumService();
