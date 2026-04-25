import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({ tableName: "agent_messages", updatedAt: false, createdAt: "created_at" })
export class AgentMessage extends Model {
	@Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
	declare id: string;

	@Column({ type: DataType.STRING(255), allowNull: false, field: "user_id" })
	declare userId: string;

	@Column({ type: DataType.STRING(255), allowNull: false, field: "from_agent_id" })
	declare fromAgentId: string;

	@Column({ type: DataType.STRING(255), allowNull: false, field: "to_agent_id" })
	declare toAgentId: string;

	@Column({ type: DataType.UUID, allowNull: false, field: "thread_id", defaultValue: DataType.UUIDV4 })
	declare threadId: string;

	@Column({ type: DataType.STRING(50), allowNull: false, defaultValue: "request", field: "message_type" })
	declare messageType: string;

	@Column({ type: DataType.TEXT, allowNull: false })
	declare content: string;

	@Column({ type: DataType.JSONB, allowNull: false, defaultValue: {} })
	declare metadata: Record<string, unknown>;

	@Column({ type: DataType.DATE, allowNull: true, field: "read_at" })
	declare readAt: Date | null;

	@Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW, field: "created_at" })
	declare createdAt: Date;
}
