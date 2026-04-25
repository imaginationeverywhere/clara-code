import { Column, CreatedAt, DataType, Model, Table } from "sequelize-typescript";

@Table({ tableName: "usage_events", updatedAt: false, createdAt: "created_at" })
export class UsageEvent extends Model {
	@Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
	declare id: string;

	@Column({ type: DataType.STRING(255), allowNull: false, field: "user_id" })
	declare userId: string;

	@Column({ type: DataType.STRING(255), allowNull: true, field: "agent_id" })
	declare agentId: string | null;

	@Column({ type: DataType.STRING(50), allowNull: false, field: "model_used" })
	declare modelUsed: string;

	@Column({ type: DataType.STRING(50), allowNull: true, field: "task_type" })
	declare taskType: string | null;

	@Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0, field: "bedrock_input_tokens" })
	declare bedrockInputTokens: number;

	@Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0, field: "bedrock_output_tokens" })
	declare bedrockOutputTokens: number;

	@Column({ type: DataType.DECIMAL(8, 3), allowNull: false, defaultValue: 0, field: "modal_compute_seconds" })
	declare modalComputeSeconds: number;

	@Column({ type: DataType.DECIMAL(10, 6), allowNull: false, defaultValue: 0, field: "cogs_usd" })
	declare cogsUsd: number;

	@Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false, field: "cache_hit" })
	declare cacheHit: boolean;

	@CreatedAt
	@Column({ type: DataType.DATE, allowNull: false, field: "created_at" })
	declare createdAt: Date;
}
