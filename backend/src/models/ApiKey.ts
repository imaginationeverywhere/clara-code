import { randomBytes } from "crypto";
import { BeforeCreate, Column, DataType, Model, Table } from "sequelize-typescript";

/**
 * API keys for Clara Code IDE access. `userId` stores the Clerk user id (`user_...`).
 * Legacy keys use plaintext `sk-clara-*` in `key`. Subscription keys use `cc_live_*` with `key_hash`.
 */
@Table({ tableName: "api_keys", timestamps: true })
export class ApiKey extends Model {
	@Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
	declare id: string;

	@Column({ type: DataType.STRING, allowNull: false })
	declare userId: string;

	/** Legacy plaintext key (sk-clara-*). Null when using hashed cc_live keys. */
	@Column({ type: DataType.STRING, allowNull: true, unique: true })
	declare key: string | null;

	@Column({ type: DataType.STRING, allowNull: false })
	declare name: string;

	@Column({ type: DataType.STRING, allowNull: true, unique: true })
	declare keyHash: string | null;

	@Column({ type: DataType.STRING(20), allowNull: true })
	declare keyPrefix: string | null;

	@Column({ type: DataType.STRING(50), allowNull: false, defaultValue: "free" })
	declare tier: string;

	@Column({ type: DataType.DATE, allowNull: true })
	declare lastUsedAt: Date | null;

	@Column({ type: DataType.BOOLEAN, defaultValue: true })
	declare isActive: boolean;

	@BeforeCreate
	static generateLegacyKey(instance: ApiKey): void {
		if (!instance.keyHash && !instance.key) {
			instance.key = `sk-clara-${randomBytes(24).toString("hex")}`;
		}
	}
}
