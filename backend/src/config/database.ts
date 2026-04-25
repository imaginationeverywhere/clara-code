import { Sequelize } from "sequelize-typescript";
import { Agent } from "@/models/Agent";
import { AgentMcpConnection } from "@/models/AgentMcpConnection";
import { AgentMessage } from "@/models/AgentMessage";
import { AgentTalentAttachment } from "@/models/AgentTalentAttachment";
import { AgentTalentCatalog } from "@/models/AgentTalentCatalog";
import { AgentTalentPurchase } from "@/models/AgentTalentPurchase";
import { AgentTemplate } from "@/models/AgentTemplate";
import { AgentUserMemory } from "@/models/AgentUserMemory";
import { ApiKey } from "@/models/ApiKey";
import { ConversationTurn } from "@/models/ConversationTurn";
import { Ejection } from "@/models/Ejection";
import { McpServer } from "@/models/McpServer";
import { MobileUpdateRequest } from "@/models/MobileUpdateRequest";
import { OperationCredits } from "@/models/OperationCredits";
import { SiteAgentDeployment } from "@/models/SiteAgentDeployment";
import { SiteOwnerChangeLog } from "@/models/SiteOwnerChangeLog";
import { SiteOwnerInstruction } from "@/models/SiteOwnerInstruction";
import { Sprint } from "@/models/Sprint";
import { SprintTask } from "@/models/SprintTask";
import { StandupReport } from "@/models/StandupReport";
import { Subscription } from "@/models/Subscription";
import { UsageEvent } from "@/models/UsageEvent";
import { User } from "@/models/User";
import { UserAgent } from "@/models/UserAgent";
import { UserProfile } from "@/models/UserProfile";
import { UserTalentLibrary } from "@/models/UserTalentLibrary";
import { UserUsage } from "@/models/UserUsage";
import { UserVoiceClone } from "@/models/UserVoiceClone";
import { UserWallet } from "@/models/UserWallet";
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
		AgentTemplate,
		UserAgent,
		Ejection,
		SiteAgentDeployment,
		SiteOwnerInstruction,
		SiteOwnerChangeLog,
		MobileUpdateRequest,
		Subscription,
		UserVoiceClone,
		VoiceUsage,
		WaitlistEntry,
		ConversationTurn,
		AgentUserMemory,
		McpServer,
		AgentMcpConnection,
		AgentMessage,
		Sprint,
		SprintTask,
		StandupReport,
		UserProfile,
		UserUsage,
		UsageEvent,
		OperationCredits,
		AgentTalentCatalog,
		UserTalentLibrary,
		AgentTalentAttachment,
		AgentTalentPurchase,
		UserWallet,
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
