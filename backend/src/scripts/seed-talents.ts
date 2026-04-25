/**
 * Idempotent: upserts rows into `agent_talent_catalog` from `ALL_CURATED_TALENTS` + one third-party demo row.
 * Prerequisite: `040_harness_talent_catalog_and_wallet.sql` applied.
 *
 * Run: `cd backend && npm run seed:talents`
 * (loads `.env.local` like other backend scripts; requires `DATABASE_URL` / Sequelize config)
 */
import "../load-env";

import { sequelize } from "@/config/database";
import { AgentTalentCatalog } from "@/models/AgentTalentCatalog";
import { ALL_CURATED_TALENTS, type TalentDef } from "@/services/talent-catalog";

function knowledgeFor(def: TalentDef): string {
	const lines: string[] = [def.description.trim(), ""];
	if (def.associatedGears.length) {
		lines.push(`Associated gears: ${def.associatedGears.join(", ")}.`);
	}
	lines.push(`Domain: ${def.domain}. Category: ${def.category}.`);
	return lines.filter(Boolean).join("\n");
}

function catalogFields(def: TalentDef) {
	return {
		id: def.id,
		displayName: def.displayName,
		description: def.description,
		category: def.category,
		domain: def.domain,
		industryVertical: def.industryVertical,
		knowledgeContent: knowledgeFor(def),
		associatedGears: def.associatedGears,
		pricingModel: def.pricingModel,
		priceUsd: def.priceUsd.toFixed(2),
		monthlyPriceUsd: def.monthlyPriceUsd != null ? def.monthlyPriceUsd.toFixed(2) : null,
		publisherUserId: null,
		publisherRevenueShare: "0.850",
		isPublic: true,
	};
}

const THIRD_PARTY_DEMO: TalentDef = {
	id: "demo-publisher-talent",
	displayName: "Publisher demo (third party)",
	description: "Wallet purchase credits publisher at 85%. Not legal/financial advice.",
	category: "third_party",
	domain: "business",
	industryVertical: "saas",
	pricingModel: "one_time",
	priceUsd: 9.99,
	monthlyPriceUsd: null,
	associatedGears: ["webhooks"],
};

async function main(): Promise<void> {
	const all = [...ALL_CURATED_TALENTS, THIRD_PARTY_DEMO];
	let n = 0;
	for (const def of all) {
		const row = catalogFields(def);
		if (def.id === "demo-publisher-talent") {
			await AgentTalentCatalog.upsert({
				...row,
				publisherUserId: "clara_publisher_demo",
			});
		} else {
			await AgentTalentCatalog.upsert(row);
		}
		n += 1;
	}
	// eslint-disable-next-line no-console
	console.log(`Seeded/updated ${n} harness catalog row(s) in agent_talent_catalog.`);
	await sequelize.close();
}

main().catch((e) => {
	// eslint-disable-next-line no-console
	console.error(e);
	process.exitCode = 1;
});
