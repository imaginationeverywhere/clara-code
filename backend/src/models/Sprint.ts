import { Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import { SprintTask } from "@/models/SprintTask";

@Table({ tableName: "sprints", createdAt: false, updatedAt: false })
export class Sprint extends Model {
	@Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
	declare id: string;

	@Column({ type: DataType.STRING(255), allowNull: false, field: "user_id" })
	declare userId: string;

	@Column({ type: DataType.TEXT, allowNull: false })
	declare goal: string;

	@Column({ type: DataType.STRING(30), allowNull: false, defaultValue: "active" })
	declare status: string;

	@Column({ type: DataType.TEXT, allowNull: true })
	declare retrospective: string | null;

	@Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW, field: "started_at" })
	declare startedAt: Date;

	@Column({ type: DataType.DATE, allowNull: true, field: "completed_at" })
	declare completedAt: Date | null;

	@Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 1, field: "sprint_number" })
	declare sprintNumber: number;

	@HasMany(() => SprintTask)
	declare tasks: SprintTask[];
}
