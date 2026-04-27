import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({ tableName: "wallet_transactions", updatedAt: false, createdAt: "created_at" })
export class WalletTransaction extends Model {
	@Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
	declare id: string;

	@Column({ type: DataType.STRING(255), allowNull: false, field: "user_id" })
	declare userId: string;

	@Column({ type: DataType.DECIMAL(12, 2), allowNull: false, field: "amount_usd" })
	declare amountUsd: string;

	@Column({ type: DataType.STRING(20), allowNull: false, field: "transaction_type" })
	declare transactionType: "debit" | "credit_publisher";

	@Column({ type: DataType.STRING(255), allowNull: false })
	declare reference: string;

	@Column({ type: DataType.STRING(64), allowNull: false, unique: true, field: "idempotency_key" })
	declare idempotencyKey: string;

	@Column({ type: DataType.JSONB, allowNull: false, defaultValue: () => ({}) })
	declare metadata: object;
}
