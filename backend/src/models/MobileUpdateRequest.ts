import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { SiteAgentDeployment } from "@/models/SiteAgentDeployment";

export type MobileStructuredSpec = {
	restatement: string;
	title: string;
	description: string;
	acceptance_criteria: string[];
	affected_screens: string[];
	priority_guess: "low" | "normal" | "high" | "urgent";
	category?: string;
};

@Table({
	tableName: "mobile_update_requests",
	underscored: true,
	timestamps: true,
	createdAt: "created_at",
	updatedAt: false,
})
export class MobileUpdateRequest extends Model {
	@Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
	declare id: string;

	@ForeignKey(() => SiteAgentDeployment)
	@Column({ type: DataType.UUID, allowNull: false, field: "deployment_id" })
	declare deploymentId: string;

	@BelongsTo(() => SiteAgentDeployment)
	declare deployment: SiteAgentDeployment;

	@Column({ type: DataType.STRING(255), allowNull: false, field: "site_owner_user_id" })
	declare siteOwnerUserId: string;

	@Column({ type: DataType.STRING(100), allowNull: false, field: "heru_slug" })
	declare heruSlug: string;

	@Column({ type: DataType.STRING(20), allowNull: false })
	declare platform: "ios" | "android" | "both";

	@Column({ type: DataType.TEXT, allowNull: false, field: "raw_voice_transcript" })
	declare rawVoiceTranscript: string;

	@Column({ type: DataType.TEXT, allowNull: false, field: "agent_interpretation" })
	declare agentInterpretation: string;

	@Column({ type: DataType.JSONB, allowNull: false, field: "structured_spec" })
	declare structuredSpec: MobileStructuredSpec & Record<string, unknown>;

	@Column({ type: DataType.STRING(20), allowNull: false })
	declare priority: string;

	@Column({ type: DataType.STRING(30), allowNull: false, defaultValue: "pending_review" })
	declare status: string;

	@Column({ type: DataType.STRING(50), allowNull: true, field: "target_release" })
	declare targetRelease: string | null;

	@Column({ type: DataType.DATE, allowNull: true, field: "approved_at" })
	declare approvedAt: Date | null;

	@Column({ type: DataType.DATE, allowNull: true, field: "shipped_at" })
	declare shippedAt: Date | null;

	@Column({ type: DataType.TEXT, allowNull: true, field: "rejected_reason" })
	declare rejectedReason: string | null;
}
