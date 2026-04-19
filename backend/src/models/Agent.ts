import { Column, DataType, Model, Table } from "sequelize-typescript";

export type AgentRole = "frontend" | "backend" | "devops";
export type AgentModelTier = "fast" | "deep" | "high-effort";

@Table({ tableName: "agents", timestamps: true })
export class Agent extends Model {
	@Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
	declare id: string;

	@Column({ type: DataType.STRING, allowNull: false })
	declare userId: string;

	@Column({ type: DataType.STRING, allowNull: false })
	declare name: string;

	@Column({ type: DataType.TEXT, allowNull: false })
	declare soul: string;

	@Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
	declare slotIndex: number;

	@Column({
		type: DataType.ENUM("frontend", "backend", "devops"),
		allowNull: false,
		defaultValue: "frontend",
	})
	declare role: AgentRole;

	@Column({ type: DataType.STRING, allowNull: true })
	declare voiceId: string | null;

	@Column({
		type: DataType.ENUM("fast", "deep", "high-effort"),
		allowNull: false,
		defaultValue: "fast",
	})
	declare modelTier: AgentModelTier;

	@Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
	declare isActive: boolean;
}
