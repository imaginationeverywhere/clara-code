import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({ tableName: "standup_reports", updatedAt: false, createdAt: "created_at" })
export class StandupReport extends Model {
	@Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
	declare id: string;

	@Column({ type: DataType.UUID, allowNull: true, field: "sprint_id" })
	declare sprintId: string | null;

	@Column({ type: DataType.STRING(255), allowNull: false, field: "user_id" })
	declare userId: string;

	@Column({ type: DataType.STRING(255), allowNull: false, field: "agent_id" })
	declare agentId: string;

	@Column({ type: DataType.TEXT, allowNull: true })
	declare delivered: string | null;

	@Column({ type: DataType.TEXT, allowNull: true, field: "in_progress" })
	declare inProgress: string | null;

	@Column({ type: DataType.TEXT, allowNull: true })
	declare blocked: string | null;

	@Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0, field: "message_count" })
	declare messageCount: number;

	@Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0, field: "turn_count" })
	declare turnCount: number;

	@Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW, field: "created_at" })
	declare createdAt: Date;
}
