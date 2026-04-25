import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({ tableName: "user_talent_library" })
export class UserTalentLibrary extends Model {
	@Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
	declare id: string;

	@Column({ type: DataType.STRING(255), allowNull: false, field: "user_id" })
	declare userId: string;

	@Column({ type: DataType.STRING(100), allowNull: false, field: "talent_id" })
	declare talentId: string;

	@Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW, field: "acquired_at" })
	declare acquiredAt: Date;

	@Column({ type: DataType.STRING(20), allowNull: false, field: "acquisition_type" })
	declare acquisitionType: string;

	@Column({ type: DataType.DECIMAL(8, 2), allowNull: true, field: "purchase_price_usd" })
	declare purchasePriceUsd: string | null;

	@Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true, field: "subscription_active" })
	declare subscriptionActive: boolean;
}
