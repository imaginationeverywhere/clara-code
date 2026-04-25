import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({ tableName: "operation_credits" })
export class OperationCredits extends Model {
	@Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
	declare id: string;

	@Column({ type: DataType.STRING(255), allowNull: false, field: "user_id" })
	declare userId: string;

	@Column({ type: DataType.STRING(255), allowNull: false, field: "agent_id" })
	declare agentId: string;

	@Column({ type: DataType.DATEONLY, allowNull: false, field: "billing_month" })
	declare billingMonth: string;

	@Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0, field: "credits_used" })
	declare creditsUsed: number;

	@Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0, field: "medium_ops" })
	declare mediumOps: number;

	@Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0, field: "heavy_ops" })
	declare heavyOps: number;

	@Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0, field: "critical_ops" })
	declare criticalOps: number;

	@Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0, field: "agent_builds" })
	declare agentBuilds: number;
}
