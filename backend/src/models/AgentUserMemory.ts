import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({ tableName: "agent_user_memory", createdAt: false, updatedAt: "updated_at" })
export class AgentUserMemory extends Model {
	@Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
	declare id: string;

	@Column({ type: DataType.STRING(255), allowNull: false, field: "user_id" })
	declare userId: string;

	@Column({ type: DataType.STRING(255), allowNull: false, defaultValue: "clara", field: "agent_id" })
	declare agentId: string;

	@Column({ type: DataType.TEXT, allowNull: true })
	declare summary: string | null;

	@Column({ type: DataType.JSONB, allowNull: false, defaultValue: [], field: "key_facts" })
	declare keyFacts: string[];

	@Column({ type: DataType.DATE, allowNull: true, field: "last_session_at" })
	declare lastSessionAt: Date | null;

	@Column({ type: DataType.STRING(50), allowNull: true, field: "last_session_surface" })
	declare lastSessionSurface: string | null;

	@Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0, field: "total_sessions" })
	declare totalSessions: number;

	@Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW, field: "updated_at" })
	declare updatedAt: Date;
}
