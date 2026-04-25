import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({ tableName: "conversation_turns", updatedAt: false, createdAt: "created_at" })
export class ConversationTurn extends Model {
	@Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
	declare id: string;

	@Column({ type: DataType.STRING(255), allowNull: false, field: "user_id" })
	declare userId: string;

	@Column({ type: DataType.STRING(255), allowNull: false, defaultValue: "clara", field: "agent_id" })
	declare agentId: string;

	@Column({ type: DataType.STRING(255), allowNull: false, field: "session_id" })
	declare sessionId: string;

	@Column({ type: DataType.STRING(50), allowNull: false, defaultValue: "cli" })
	declare surface: string;

	@Column({ type: DataType.STRING(20), allowNull: false })
	declare role: string;

	@Column({ type: DataType.TEXT, allowNull: false })
	declare content: string;

	@Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW, field: "created_at" })
	declare createdAt: Date;
}
