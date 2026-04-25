import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { UserAgent } from "@/models/UserAgent";

@Table({
	tableName: "site_agent_deployments",
	underscored: true,
	timestamps: true,
	createdAt: "deployed_at",
	updatedAt: "updated_at",
})
export class SiteAgentDeployment extends Model {
	@Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
	declare id: string;

	@ForeignKey(() => UserAgent)
	@Column({ type: DataType.UUID, allowNull: false, field: "user_agent_id" })
	declare userAgentId: string;

	@BelongsTo(() => UserAgent)
	declare userAgent: UserAgent;

	@Column({ type: DataType.STRING(100), allowNull: false, field: "heru_slug" })
	declare heruSlug: string;

	@Column({ type: DataType.STRING(255), allowNull: false, field: "site_owner_user_id" })
	declare siteOwnerUserId: string;

	@Column({ type: DataType.STRING(50), allowNull: false, defaultValue: "active", field: "deployment_status" })
	declare deploymentStatus: string;
}
