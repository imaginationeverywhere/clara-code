import { Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { UserAgent } from "@/models/UserAgent";

@Table({ tableName: "ejections", timestamps: true, createdAt: "created_at", updatedAt: "updated_at" })
export class Ejection extends Model {
	@Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
	declare id: string;

	@Column({ type: DataType.STRING(255), allowNull: false, field: "user_id" })
	declare userId: string;

	@ForeignKey(() => UserAgent)
	@Column({ type: DataType.UUID, allowNull: false, field: "user_agent_id" })
	declare userAgentId: string;

	@Column({ type: DataType.STRING(10), allowNull: false, field: "month_key" })
	declare monthKey: string;

	@Column({ type: DataType.STRING(128), allowNull: false, unique: true, field: "fingerprint_hash" })
	declare fingerprintHash: string;

	@Column({ type: DataType.STRING(500), allowNull: false, field: "s3_key" })
	declare s3Key: string;

	@Column({ type: DataType.DATE, allowNull: true, field: "attestation_signed_at" })
	declare attestationSignedAt: Date | null;

	@Column({ type: DataType.STRING(500), allowNull: true, field: "attestation_s3_key" })
	declare attestationS3Key: string | null;

	@Column({ type: DataType.STRING(50), allowNull: false, defaultValue: "pending_attestation" })
	declare status: string;

	@Column({ type: DataType.DATE, allowNull: false, field: "exported_at" })
	declare exportedAt: Date;

	@Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true, field: "subscription_active" })
	declare subscriptionActive: boolean;

	@Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false, field: "detected_double_hosting" })
	declare detectedDoubleHosting: boolean;

	@Column({ type: DataType.JSONB, allowNull: true, field: "double_hosting_evidence" })
	declare doubleHostingEvidence: Record<string, unknown> | null;
}
