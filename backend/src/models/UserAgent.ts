import { Column, DataType, Model, Table } from "sequelize-typescript";

export type AttachedSkillId = { id: string; name: string } | string;

@Table({ tableName: "user_agents", timestamps: true, createdAt: "created_at", updatedAt: "updated_at" })
export class UserAgent extends Model {
	@Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
	declare id: string;

	@Column({ type: DataType.STRING(255), allowNull: false, field: "user_id" })
	declare userId: string;

	@Column({ type: DataType.STRING(100), allowNull: false, field: "template_id" })
	declare templateId: string;

	@Column({ type: DataType.STRING(100), allowNull: false })
	declare name: string;

	@Column({ type: DataType.STRING(100), allowNull: false, field: "voice_id" })
	declare voiceId: string;

	@Column({ type: DataType.JSONB, allowNull: false, field: "attached_skills" })
	declare attachedSkills: AttachedSkillId[];

	@Column({ type: DataType.JSONB, allowNull: false, field: "personality_tweaks" })
	declare personalityTweaks: Record<string, string>;

	@Column({ type: DataType.TEXT, allowNull: false, field: "soul_md" })
	declare soulMd: string;

	@Column({ type: DataType.BOOLEAN, allowNull: false, field: "is_active" })
	declare isActive: boolean;
}
