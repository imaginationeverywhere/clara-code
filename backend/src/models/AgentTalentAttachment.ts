import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({ tableName: "agent_talent_attachments" })
export class AgentTalentAttachment extends Model {
	@Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
	declare id: string;

	@Column({ type: DataType.UUID, allowNull: false, field: "user_agent_id" })
	declare userAgentId: string;

	@Column({ type: DataType.STRING(100), allowNull: false, field: "talent_id" })
	declare talentId: string;

	@Column({ type: DataType.STRING(255), allowNull: false, field: "user_id" })
	declare userId: string;
}
