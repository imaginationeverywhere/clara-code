import { Op } from "sequelize";
import { ConversationTurn } from "@/models/ConversationTurn";
import { Sprint } from "@/models/Sprint";
import { SprintTask } from "@/models/SprintTask";
import { StandupReport } from "@/models/StandupReport";
import { agentMessagingService } from "@/services/agent-messaging.service";

export class SprintService {
	async createSprint(userId: string, goal: string): Promise<Sprint> {
		const count = await Sprint.count({ where: { userId } });
		return Sprint.create({ userId, goal, sprintNumber: count + 1 });
	}

	async addTask(
		sprintId: string,
		userId: string,
		agentId: string,
		title: string,
		description?: string,
	): Promise<SprintTask> {
		return SprintTask.create({ sprintId, userId, agentId, title, description });
	}

	async updateTask(taskId: string, status: "in_progress" | "blocked" | "done", blocker?: string): Promise<void> {
		await SprintTask.update({ status, blocker: blocker ?? null, updatedAt: new Date() }, { where: { id: taskId } });
	}

	async generateStandupReport(userId: string, agentId: string, sprintId?: string): Promise<StandupReport> {
		const lastStandup = await StandupReport.findOne({
			where: { userId, agentId },
			order: [["createdAt", "DESC"]],
		});
		const since = lastStandup?.createdAt ?? new Date(0);

		const turnCount = await ConversationTurn.count({
			where: {
				userId,
				agentId,
				createdAt: { [Op.gte]: since },
			},
		});

		const messageCount = await agentMessagingService.countFromAgentSince(userId, agentId, since);

		const tasks = sprintId ? await SprintTask.findAll({ where: { sprintId, agentId } }) : [];

		const done = tasks.filter((t) => t.status === "done").map((t) => t.title);
		const active = tasks.filter((t) => t.status === "in_progress").map((t) => t.title);
		const blocked = tasks.filter((t) => t.status === "blocked");

		return StandupReport.create({
			sprintId: sprintId ?? null,
			userId,
			agentId,
			delivered: done.length > 0 ? done.join("; ") : null,
			inProgress: active.length > 0 ? active.join("; ") : null,
			blocked:
				blocked.length > 0 ? blocked.map((t) => `${t.title}: ${t.blocker ?? "unspecified"}`).join("; ") : null,
			messageCount,
			turnCount,
		});
	}

	async checkSprintCompletion(sprintId: string): Promise<boolean> {
		const tasks = await SprintTask.findAll({ where: { sprintId } });
		if (tasks.length === 0) return false;
		const allDone = tasks.every((t) => t.status === "done");
		if (allDone) {
			await Sprint.update({ status: "complete", completedAt: new Date() }, { where: { id: sprintId } });
		}
		return allDone;
	}

	async getActiveSprint(userId: string): Promise<Sprint | null> {
		return Sprint.findOne({
			where: { userId, status: "active" },
			order: [["startedAt", "DESC"]],
			include: [SprintTask],
		});
	}

	async getVelocity(userId: string): Promise<{ avgTurnsPerSprint: number; sprintsCompleted: number }> {
		const completed = await Sprint.count({ where: { userId, status: "complete" } });
		const reports = await StandupReport.findAll({ where: { userId } });
		const totalTurns = reports.reduce((sum, r) => sum + r.turnCount, 0);
		return {
			sprintsCompleted: completed,
			avgTurnsPerSprint: completed > 0 ? Math.round(totalTurns / completed) : 0,
		};
	}
}

export const sprintService = new SprintService();
