import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { SiteAgentDeployment } from "@/models/SiteAgentDeployment";

@Table({
	tableName: "site_owner_instructions",
	underscored: true,
	timestamps: true,
	createdAt: "created_at",
	updatedAt: false,
})
export class SiteOwnerInstruction extends Model {
	@Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
	declare id: string;

	@ForeignKey(() => SiteAgentDeployment)
	@Column({ type: DataType.UUID, allowNull: false, field: "deployment_id" })
	declare deploymentId: string;

	@BelongsTo(() => SiteAgentDeployment)
	declare deployment: SiteAgentDeployment;

	@Column({ type: DataType.TEXT, allowNull: false })
	declare instruction: string;

	@Column({ type: DataType.STRING(50), allowNull: false })
	declare category: string;

	@Column({ type: DataType.BOOLEAN, allowNull: false, field: "approved_by_platform" })
	declare approvedByPlatform: boolean;

	@Column({ type: DataType.TEXT, allowNull: true, field: "platform_rejection_reason" })
	declare platformRejectionReason: string | null;

	@Column({ type: DataType.DATE, allowNull: true, field: "effective_at" })
	declare effectiveAt: Date | null;
}
