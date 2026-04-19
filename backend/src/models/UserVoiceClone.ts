import { Column, CreatedAt, DataType, Default, Model, PrimaryKey, Table, UpdatedAt } from "sequelize-typescript";

@Table({
	tableName: "user_voice_clones",
	timestamps: true,
	indexes: [{ fields: ["user_id"], unique: true }],
})
export class UserVoiceClone extends Model {
	@PrimaryKey
	@Default(DataType.UUIDV4)
	@Column(DataType.UUID)
	declare id: string;

	@Column({ type: DataType.STRING, allowNull: false, unique: true })
	declare userId: string;

	@Column({ type: DataType.STRING, allowNull: false })
	declare voiceId: string;

	@Column({ type: DataType.STRING, allowNull: true })
	declare sampleUrl: string | null;

	@Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
	declare isDefault: boolean;

	@CreatedAt
	declare createdAt: Date;

	@UpdatedAt
	declare updatedAt: Date;

	static async findByUserId(userId: string): Promise<UserVoiceClone | null> {
		return UserVoiceClone.findOne({ where: { userId } });
	}
}
