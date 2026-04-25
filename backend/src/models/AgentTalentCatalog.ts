import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({ tableName: "agent_talent_catalog" })
export class AgentTalentCatalog extends Model {
	@Column({ type: DataType.STRING(100), primaryKey: true })
	declare id: string;

	@Column({ type: DataType.STRING(255), allowNull: false, field: "display_name" })
	declare displayName: string;

	@Column({ type: DataType.TEXT, allowNull: false })
	declare description: string;

	@Column({ type: DataType.STRING(50), allowNull: false })
	declare category: string;

	@Column({ type: DataType.STRING(50), allowNull: true })
	declare domain: string | null;

	@Column({ type: DataType.STRING(50), allowNull: true, field: "industry_vertical" })
	declare industryVertical: string | null;

	@Column({ type: DataType.TEXT, allowNull: false, field: "knowledge_content" })
	declare knowledgeContent: string;

	@Column({ type: DataType.JSONB, allowNull: false, defaultValue: [], field: "associated_gears" })
	declare associatedGears: string[];

	@Column({ type: DataType.STRING(20), allowNull: false, field: "pricing_model" })
	declare pricingModel: string;

	@Column({ type: DataType.DECIMAL(8, 2), allowNull: false, defaultValue: 0, field: "price_usd" })
	declare priceUsd: string;

	@Column({ type: DataType.DECIMAL(8, 2), allowNull: true, field: "monthly_price_usd" })
	declare monthlyPriceUsd: string | null;

	@Column({ type: DataType.STRING(255), allowNull: true, field: "publisher_user_id" })
	declare publisherUserId: string | null;

	@Column({ type: DataType.DECIMAL(4, 3), allowNull: false, defaultValue: 0.85, field: "publisher_revenue_share" })
	declare publisherRevenueShare: string;

	@Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true, field: "is_public" })
	declare isPublic: boolean;
}
