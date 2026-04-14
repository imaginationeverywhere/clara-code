import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({ tableName: "subscriptions", timestamps: true })
export class Subscription extends Model {
	@Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
	declare id: string;

	@Column({ type: DataType.STRING(255), allowNull: false, unique: true })
	declare userId: string;

	@Column({ type: DataType.STRING(255), allowNull: true })
	declare stripeCustomerId: string | null;

	@Column({ type: DataType.STRING(255), allowNull: true })
	declare stripeSubscriptionId: string | null;

	@Column({ type: DataType.STRING(50), allowNull: false, defaultValue: "free" })
	declare tier: string;

	@Column({ type: DataType.STRING(50), allowNull: false, defaultValue: "active" })
	declare status: string;

	@Column({ type: DataType.DATE, allowNull: true })
	declare currentPeriodStart: Date | null;

	@Column({ type: DataType.DATE, allowNull: true })
	declare currentPeriodEnd: Date | null;
}
