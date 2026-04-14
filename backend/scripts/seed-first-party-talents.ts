import path from "node:path";

import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config({ path: path.join(__dirname, "../.env.local") });

const CLARA_DEVELOPER_USER_ID = "clara-internal";

const FIRST_PARTY_TALENTS = [
	{
		name: "gateway-connect",
		displayName: "Gateway Connect",
		description: "Baseline federation health and session info for Clara agents.",
		category: "developer-tools",
		pricing_type: "free",
		price_cents: null as number | null,
		subgraph_url: process.env.TALENT_GATEWAY_CONNECT_URL ?? "http://localhost:4001/graphql",
		voice_commands: JSON.stringify([
			{
				pattern: "check clara status",
				description: "Check connection and session status",
				examples: ["check clara status"],
			},
		]),
		status: "approved",
		reviewed_at: new Date().toISOString(),
	},
	{
		name: "clerk-auth",
		displayName: "Clerk Auth",
		description: "Add Clerk authentication to your Talent subgraph in minutes.",
		category: "developer-tools",
		pricing_type: "free",
		price_cents: null as number | null,
		subgraph_url: process.env.TALENT_CLERK_AUTH_URL ?? "http://localhost:4002/graphql",
		voice_commands: JSON.stringify([
			{
				pattern: "check my auth status",
				description: "Verify authentication is working",
				examples: ["check my auth status"],
			},
		]),
		status: "approved",
		reviewed_at: new Date().toISOString(),
	},
];

async function seed() {
	const db = new Pool({ connectionString: process.env.DATABASE_URL });

	await db.query(
		`
    INSERT INTO developer_programs (user_id, status, expires_at)
    VALUES ($1, 'active', $2)
    ON CONFLICT (user_id) DO NOTHING
  `,
		[CLARA_DEVELOPER_USER_ID, "2099-12-31"],
	);

	for (const talent of FIRST_PARTY_TALENTS) {
		await db.query(
			`
      INSERT INTO talents (
        developer_user_id, name, display_name, description, category,
        pricing_type, price_cents, subgraph_url, voice_commands, status, reviewed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11)
      ON CONFLICT (name) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        description = EXCLUDED.description,
        subgraph_url = EXCLUDED.subgraph_url,
        status = EXCLUDED.status
    `,
			[
				CLARA_DEVELOPER_USER_ID,
				talent.name,
				talent.displayName,
				talent.description,
				talent.category,
				talent.pricing_type,
				talent.price_cents,
				talent.subgraph_url,
				talent.voice_commands,
				talent.status,
				talent.reviewed_at,
			],
		);
		console.log(`Seeded: ${talent.displayName}`);
	}

	await db.end();
	console.log("First-party Talents seeded successfully.");
}

seed().catch((err) => {
	console.error("Seed failed:", err);
	process.exit(1);
});
