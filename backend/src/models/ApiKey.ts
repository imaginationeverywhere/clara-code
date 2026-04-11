import { randomBytes } from "crypto";
import { BeforeCreate, Column, DataType, Model, Table } from "sequelize-typescript";

/**
 * API keys for Clara Code IDE access. `userId` stores the Clerk user id (`user_...`).
 */
@Table({ tableName: "api_keys", timestamps: true })
export class ApiKey extends Model {
	@Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
	declare id: string;

	@Column({ type: DataType.STRING, allowNull: false })
	declare userId: string;

	@Column({ type: DataType.STRING, allowNull: false, unique: true })
	declare key: string;

	@Column({ type: DataType.STRING, allowNull: false })
	declare name: string;

	@Column({ type: DataType.DATE, allowNull: true })
	declare lastUsedAt: Date | null;

	@Column({ type: DataType.BOOLEAN, defaultValue: true })
	declare isActive: boolean;

	@BeforeCreate
	static generateKey(instance: ApiKey): void {
		instance.key = `sk-clara-${randomBytes(24).toString("hex")}`;
	}
}
