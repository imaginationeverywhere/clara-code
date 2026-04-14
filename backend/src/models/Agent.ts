import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({ tableName: "agents", timestamps: true })
export class Agent extends Model {
	@Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
	declare id: string;

	@Column({ type: DataType.STRING, allowNull: false })
	declare userId: string;

	@Column({ type: DataType.STRING, allowNull: false })
	declare name: string;

	@Column({ type: DataType.TEXT, allowNull: false })
	declare soul: string;
}
