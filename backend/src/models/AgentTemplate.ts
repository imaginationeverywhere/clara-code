import { Column, DataType, Model, Table } from "sequelize-typescript";

export type SuggestedSkill = { id: string; name: string };

@Table({ tableName: "agent_templates", timestamps: true, createdAt: "created_at", updatedAt: false })
export class AgentTemplate extends Model {
	@Column({ type: DataType.STRING(100), primaryKey: true })
	declare id: string;

	@Column({ type: DataType.STRING(255), allowNull: false, field: "display_name" })
	declare displayName: string;

	@Column({ type: DataType.TEXT, allowNull: false, field: "short_description" })
	declare shortDescription: string;

	@Column({ type: DataType.STRING(50), allowNull: false })
	declare category: string;

	@Column({ type: DataType.STRING(50), allowNull: true, field: "industry_vertical" })
	declare industryVertical: string | null;

	@Column({ type: DataType.TEXT, allowNull: false, field: "soul_md_template" })
	declare soulMdTemplate: string;

	@Column({ type: DataType.JSONB, allowNull: false, field: "suggested_skills" })
	declare suggestedSkills: SuggestedSkill[];

	@Column({ type: DataType.STRING(100), allowNull: false, field: "default_voice_id" })
	declare defaultVoiceId: string;

	@Column({ type: DataType.BOOLEAN, allowNull: false, field: "is_public" })
	declare isPublic: boolean;

	@Column({ type: DataType.INTEGER, allowNull: false, field: "sort_order" })
	declare sortOrder: number;
}
