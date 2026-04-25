import { Sequelize } from "sequelize-typescript";
import { Agent } from "@/models/Agent";
import { AgentUserMemory } from "@/models/AgentUserMemory";
import { ApiKey } from "@/models/ApiKey";
import { ConversationTurn } from "@/models/ConversationTurn";
import { Subscription } from "@/models/Subscription";
import { User } from "@/models/User";
import { UserVoiceClone } from "@/models/UserVoiceClone";
import { VoiceUsage } from "@/models/VoiceUsage";
import { WaitlistEntry } from "@/models/WaitlistEntry";
import { logger } from "@/utils/logger";

const environment = process.env.NODE_ENV || "development";
const isDevelopment = environment === "development";

let databaseUrl = process.env.DATABASE_URL || "";
if (environment === "production") {
	databaseUrl = process.env.DATABASE_URL_PRODUCTION || process.env.DATABASE_URL || "";
} else {
	databaseUrl = process.env.DATABASE_URL_STAGING || process.env.DATABASE_URL || "";
}

if (!databaseUrl) {
	throw new Error(
		"Database URL is not configured. Set DATABASE_URL (or DATABASE_URL_STAGING / DATABASE_URL_PRODUCTION).",
	);
}

const sslEnabled = process.env.DB_SSL !== "false";

export const sequelize = new Sequelize(databaseUrl, {
	dialect: "postgres",
	logging: isDevelopment ? console.log : false,
	dialectOptions: sslEnabled
		? {
				ssl: {
					require: true,
					rejectUnauthorized: false,
				},
			}
		: {},
	pool: {
		max: isDevelopment ? 5 : 10,
		min: 0,
		acquire: 30000,
		idle: 10000,
	},
	models: [
		User,
		ApiKey,
		Agent,
		Subscription,
		UserVoiceClone,
		VoiceUsage,
		WaitlistEntry,
		ConversationTurn,
		AgentUserMemory,
	],
	define: {
		underscored: true,
		timestamps: true,
		createdAt: "created_at",
		updatedAt: "updated_at",
	},
});

export async function testConnection(options?: { silent?: boolean }): Promise<boolean> {
	const silent = options?.silent ?? false;
	try {
		await sequelize.authenticate();
		if (!silent) {
			logger.info("Database connection established successfully");
		}
		return true;
	} catch (error) {
		if (!silent) {
			logger.error("Unable to connect to database:", error);
		}
		return false;
	}
}
