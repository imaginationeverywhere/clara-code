import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({ tableName: "user_wallets" })
export class UserWallet extends Model {
	@Column({ type: DataType.STRING(255), primaryKey: true, field: "user_id" })
	declare userId: string;

	@Column({ type: DataType.DECIMAL(12, 2), allowNull: false, defaultValue: 0, field: "balance_usd" })
	declare balanceUsd: string;
}
