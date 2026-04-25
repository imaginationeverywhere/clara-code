import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { Sprint } from "@/models/Sprint";

@Table({ tableName: "sprint_tasks", updatedAt: "updated_at", createdAt: "created_at" })
export class SprintTask extends Model {
	@Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
	declare id: string;

	@ForeignKey(() => Sprint)
	@Column({ type: DataType.UUID, allowNull: false, field: "sprint_id" })
	declare sprintId: string;

	@BelongsTo(() => Sprint)
	declare sprint: Sprint;

	@Column({ type: DataType.STRING(255), allowNull: false, field: "user_id" })
	declare userId: string;

	@Column({ type: DataType.STRING(255), allowNull: false, field: "agent_id" })
	declare agentId: string;

	@Column({ type: DataType.TEXT, allowNull: false })
	declare title: string;

	@Column({ type: DataType.TEXT, allowNull: true })
	declare description: string | null;

	@Column({ type: DataType.STRING(30), allowNull: false, defaultValue: "claimed" })
	declare status: string;

	@Column({ type: DataType.TEXT, allowNull: true })
	declare blocker: string | null;

	@Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW, field: "created_at" })
	declare createdAt: Date;

	@Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW, field: "updated_at" })
	declare updatedAt: Date;
}
