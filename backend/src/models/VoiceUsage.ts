import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({ tableName: "voice_usage" })
export class VoiceUsage extends Model {
	@Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
	declare id: string;

	@Column({ type: DataType.STRING(255), allowNull: false, field: "user_id" })
	declare userId: string;

	@Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0, field: "exchange_count" })
	declare exchangeCount: number;

	@Column({ type: DataType.DATEONLY, allowNull: false, field: "billing_month" })
	declare billingMonth: string;
}
