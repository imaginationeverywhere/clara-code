import { Column, DataType, Model, Table, UpdatedAt } from "sequelize-typescript";

@Table({ tableName: "user_usage", createdAt: false, updatedAt: "updated_at" })
export class UserUsage extends Model {
	@Column({ type: DataType.STRING(255), allowNull: false, primaryKey: true, field: "user_id" })
	declare userId: string;

	@Column({ type: DataType.STRING(50), allowNull: false, defaultValue: "basic", field: "tier" })
	declare tier: string;

	@Column({ type: DataType.STRING(10), allowNull: false, field: "month_key" })
	declare monthKey: string;

	@Column({ type: DataType.DECIMAL(10, 2), allowNull: false, defaultValue: 0, field: "active_hours" })
	declare activeHours: number;

	@Column({ type: DataType.DECIMAL(10, 4), allowNull: false, defaultValue: 0, field: "cogs_usd" })
	declare cogsUsd: number;

	@Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false, field: "is_flagged" })
	declare isFlagged: boolean;

	@Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false, field: "is_frozen" })
	declare isFrozen: boolean;

	@Column({ type: DataType.DATE, allowNull: true, field: "flagged_at" })
	declare flaggedAt: Date | null;

	@Column({ type: DataType.DATE, allowNull: true, field: "frozen_at" })
	declare frozenAt: Date | null;

	@UpdatedAt
	@Column({ type: DataType.DATE, allowNull: false, field: "updated_at" })
	declare updatedAt: Date;
}
