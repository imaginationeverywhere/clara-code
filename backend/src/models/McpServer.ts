import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({ tableName: "mcp_servers" })
export class McpServer extends Model {
	@Column({ type: DataType.STRING(100), primaryKey: true })
	declare id: string;

	@Column({ type: DataType.STRING(255), allowNull: false })
	declare displayName: string;

	@Column({ type: DataType.TEXT, allowNull: true })
	declare description: string | null;

	@Column({ type: DataType.STRING(50), allowNull: false })
	declare category: string;

	@Column({ type: DataType.STRING(20), allowNull: false, defaultValue: "clara" })
	declare ownerType: string;

	@Column({ type: DataType.STRING(255), allowNull: true })
	declare ownerUserId: string | null;

	@Column({ type: DataType.STRING(500), allowNull: false })
	declare endpointUrl: string;

	@Column({ type: DataType.STRING(50), allowNull: false })
	declare authScheme: string;

	@Column({ type: DataType.STRING(50), allowNull: false, defaultValue: "basic" })
	declare minTier: string;

	@Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
	declare isPublic: boolean;
}
