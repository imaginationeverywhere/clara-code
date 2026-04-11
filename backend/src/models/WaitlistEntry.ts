import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({ tableName: "waitlist_entries", timestamps: true })
export class WaitlistEntry extends Model {
	@Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
	declare id: string;

	@Column({ type: DataType.STRING, allowNull: false, unique: true, validate: { isEmail: true } })
	declare email: string;

	@Column({ type: DataType.STRING, allowNull: true })
	declare name: string | null;

	@Column({ type: DataType.STRING, allowNull: true })
	declare role: string | null;

	@Column({ type: DataType.BOOLEAN, defaultValue: false })
	declare notified: boolean;
}
