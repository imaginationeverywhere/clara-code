/**
 * Idempotent: applies SQL migration files for the agent template catalog (CREATE + INSERT … ON CONFLICT).
 * Run: `npm run seed:templates` from `backend/` with DATABASE_URL set.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { sequelize } from "@/config/database";

const migrationFiles = [
	"032_agent_templates.sql",
	"034_agent_templates_expand.sql",
	"035_site_owner_interactions.sql",
	"036_mobile_update_queue.sql",
	"037_ejections.sql",
] as const;

async function main(): Promise<void> {
	const migDir = join(__dirname, "..", "..", "migrations");
	for (const f of migrationFiles) {
		const sql = readFileSync(join(migDir, f), "utf8");
		await sequelize.query(sql);
	}
	console.log("Migrations applied (032, 034, 035, 036, 037).");
	await sequelize.close();
}

main().catch((e) => {
	console.error(e);
	process.exitCode = 1;
});
