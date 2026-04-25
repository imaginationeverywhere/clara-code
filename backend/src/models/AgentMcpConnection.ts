import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { Agent } from "@/models/Agent";
import { McpServer } from "@/models/McpServer";

@Table({ tableName: "agent_mcp_connections" })
export class AgentMcpConnection extends Model {
	@Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
	declare id: string;

	@ForeignKey(() => Agent)
	@Column({ type: DataType.UUID, allowNull: false })
	declare agentId: string;

	@BelongsTo(() => Agent, { onDelete: "CASCADE" })
	declare agent?: Agent;

	@ForeignKey(() => McpServer)
	@Column({ type: DataType.STRING(100), allowNull: false })
	declare mcpServerId: string;

	@BelongsTo(() => McpServer)
	declare mcpServer?: McpServer;

	@Column({ type: DataType.STRING(255), allowNull: false })
	declare userId: string;

	/** AES envelope from `mcpCredsToCiphertext` (never plaintext). */
	@Column({ type: DataType.TEXT, allowNull: true })
	declare credentialsCiphertext: string | null;

	@Column({ type: DataType.JSONB, allowNull: false, defaultValue: [] })
	declare enabledTools: string[];
}
