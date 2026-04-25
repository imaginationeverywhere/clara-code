import { Column, DataType, Model, Table } from "sequelize-typescript";

export type UserProfileProject = { name: string; description: string; status: string };
export type UserProfileCrossLog = { agent: string; event: string; date: string };

@Table({ tableName: "user_profiles", updatedAt: "updated_at", createdAt: false })
export class UserProfile extends Model {
	@Column({ type: DataType.STRING(255), primaryKey: true, field: "user_id" })
	declare userId: string;

	@Column({ type: DataType.TEXT, allowNull: true, field: "display_name" })
	declare displayName: string | null;

	@Column({ type: DataType.JSONB, allowNull: false, defaultValue: [], field: "active_projects" })
	declare activeProjects: UserProfileProject[];

	@Column({ type: DataType.JSONB, allowNull: false, defaultValue: [], field: "tech_stack" })
	declare techStack: string[];

	@Column({ type: DataType.JSONB, allowNull: false, defaultValue: [] })
	declare preferences: string[];

	@Column({ type: DataType.JSONB, allowNull: false, defaultValue: [], field: "cross_agent_log" })
	declare crossAgentLog: UserProfileCrossLog[];

	@Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW, field: "updated_at" })
	declare updatedAt: Date;
}
