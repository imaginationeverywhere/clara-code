import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
	tableName: "agent_talent_purchases",
	updatedAt: false,
	createdAt: "purchased_at",
	timestamps: true,
})
export class AgentTalentPurchase extends Model {
	@Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
	declare id: string;

	@Column({ type: DataType.STRING(255), allowNull: false, field: "user_id" })
	declare userId: string;

	@Column({ type: DataType.STRING(100), allowNull: false, field: "talent_id" })
	declare talentId: string;

	@Column({ type: DataType.STRING(20), allowNull: false, field: "acquisition_type" })
	declare acquisitionType: string;

	@Column({ type: DataType.DECIMAL(8, 2), allowNull: false, field: "amount_usd" })
	declare amountUsd: string;

	@Column({ type: DataType.STRING(255), allowNull: true, field: "publisher_user_id" })
	declare publisherUserId: string | null;

	@Column({ type: DataType.DECIMAL(8, 2), allowNull: true, field: "publisher_payout_usd" })
	declare publisherPayoutUsd: string | null;

	@Column({ type: DataType.DECIMAL(8, 2), allowNull: false, field: "clara_revenue_usd" })
	declare claraRevenueUsd: string;

	@Column({ type: DataType.STRING(255), allowNull: true, field: "stripe_payment_id" })
	declare stripePaymentId: string | null;
}
