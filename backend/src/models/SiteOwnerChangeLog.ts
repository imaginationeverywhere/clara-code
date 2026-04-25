import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { SiteAgentDeployment } from "@/models/SiteAgentDeployment";

@Table({
	tableName: "site_owner_change_log",
	underscored: true,
	timestamps: true,
	createdAt: "created_at",
	updatedAt: false,
})
export class SiteOwnerChangeLog extends Model {
	@Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
	declare id: string;

	@ForeignKey(() => SiteAgentDeployment)
	@Column({ type: DataType.UUID, allowNull: false, field: "deployment_id" })
	declare deploymentId: string;

	@BelongsTo(() => SiteAgentDeployment)
	declare deployment: SiteAgentDeployment;

	@Column({ type: DataType.STRING(255), allowNull: false, field: "site_owner_user_id" })
	declare siteOwnerUserId: string;

	@Column({ type: DataType.STRING(50), allowNull: false, field: "action_type" })
	declare actionType: string;

	@Column({ type: DataType.JSONB, allowNull: true, field: "before_value" })
	declare beforeValue: Record<string, unknown> | null;

	@Column({ type: DataType.JSONB, allowNull: true, field: "after_value" })
	declare afterValue: Record<string, unknown> | null;

	@Column({ type: DataType.BOOLEAN, allowNull: false })
	declare approved: boolean;
}
