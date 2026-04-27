import { Op, type WhereOptions } from "sequelize";
import { AgentTalentAttachment } from "@/models/AgentTalentAttachment";
import { AgentTalentCatalog } from "@/models/AgentTalentCatalog";
import { AgentTalentPurchase } from "@/models/AgentTalentPurchase";
import { UserAgent } from "@/models/UserAgent";
import { UserTalentLibrary } from "@/models/UserTalentLibrary";
import { type PlanTier, toPlanTier } from "@/services/plan-limits";
import { TALENTS_PER_AGENT_BY_TIER } from "@/services/talent-catalog";
import { walletService } from "@/services/wallet.service";
import { logger } from "@/utils/logger";

type CatalogWithFlags = {
	id: string;
	displayName: string;
	description: string;
	category: string;
	domain: string | null;
	industryVertical: string | null;
	knowledgeContent: string;
	associatedGears: string[];
	pricingModel: string;
	priceUsd: string;
	monthlyPriceUsd: string | null;
	publisherUserId: string | null;
	owned: boolean;
	canAttach: boolean;
};

function toUsdNumber(v: string | null | undefined): number {
	if (v == null || v === "") {
		return 0;
	}
	const n = Number(v);
	return Number.isFinite(n) ? n : 0;
}

export class TalentService {
	/**
	 * Public catalog (curated) + ownership flags. Third-party and subscription Talents
	 * follow the same `agent_talent_catalog` model.
	 */
	async browseInventory(
		userId: string,
		filters?: { category?: string; domain?: string; industry?: string; industryVertical?: string },
	): Promise<CatalogWithFlags[]> {
		const where: WhereOptions<AgentTalentCatalog> = { isPublic: true };
		if (filters?.category) {
			Object.assign(where, { category: filters.category });
		}
		if (filters?.domain) {
			Object.assign(where, { domain: filters.domain });
		}
		const v = filters?.industryVertical ?? filters?.industry;
		if (v) {
			Object.assign(where, { industryVertical: v });
		}
		const talents = await AgentTalentCatalog.findAll({
			where,
			order: [
				["category", "ASC"],
				["displayName", "ASC"],
			],
		});
		const ownedRows = await UserTalentLibrary.findAll({
			where: { userId, subscriptionActive: true },
		});
		const ownedIds = new Set(ownedRows.map((r) => r.talentId));
		return talents.map((t) => {
			const cat = t.category as string;
			const inLibrary = ownedIds.has(t.id) || cat === "free";
			return {
				id: t.id,
				displayName: t.displayName,
				description: t.description,
				category: t.category,
				domain: t.domain,
				industryVertical: t.industryVertical,
				knowledgeContent: t.knowledgeContent,
				associatedGears: t.associatedGears,
				pricingModel: t.pricingModel,
				priceUsd: t.priceUsd,
				monthlyPriceUsd: t.monthlyPriceUsd,
				publisherUserId: t.publisherUserId,
				owned: inLibrary,
				canAttach: cat === "free" || ownedIds.has(t.id),
			};
		});
	}

	/**
	 * Add Talent to the user's library (and debit wallet for paid / monthly first bill).
	 */
	async acquire(
		userId: string,
		talentId: string,
	): Promise<{ acquired: boolean; userTalentId: string; alreadyOwned?: boolean }> {
		const talent = await AgentTalentCatalog.findByPk(talentId);
		if (!talent) {
			throw new Error("talent_not_found");
		}
		if (!talent.isPublic) {
			throw new Error("talent_not_public");
		}

		const existing = await UserTalentLibrary.findOne({ where: { userId, talentId } });
		if (existing?.subscriptionActive) {
			return { acquired: true, userTalentId: existing.id, alreadyOwned: true };
		}

		if (talent.category === "free") {
			if (existing) {
				await existing.update({ subscriptionActive: true, acquisitionType: "free" });
				return { acquired: true, userTalentId: existing.id };
			}
			const row = await UserTalentLibrary.create({
				userId,
				talentId,
				acquisitionType: "free",
				purchasePriceUsd: "0",
				subscriptionActive: true,
			});
			return { acquired: true, userTalentId: row.id };
		}

		const isMonthly = talent.pricingModel === "monthly";
		const price = isMonthly ? toUsdNumber(talent.monthlyPriceUsd) : toUsdNumber(talent.priceUsd);
		if (price < 0) {
			throw new Error("invalid_price");
		}
		if (price > 0) {
			await walletService.debit(userId, price, `talent:${talentId}:${talent.pricingModel}`);
		}
		const publisherUserId = talent.publisherUserId;
		const isThirdParty = publisherUserId !== null;
		const rate = isThirdParty ? Math.min(1, Math.max(0, toUsdNumber(talent.publisherRevenueShare) || 0.85)) : 0;
		const share = isThirdParty ? price * rate : 0;
		const claraRevenue = price - share;
		if (isThirdParty && share > 0) {
			await walletService.creditPublisher(publisherUserId, share, `talent_sale:${talentId}`);
		}
		await AgentTalentPurchase.create({
			userId,
			talentId,
			acquisitionType: isMonthly ? "monthly_first" : "one_time",
			amountUsd: String(price),
			publisherUserId: publisherUserId ?? null,
			publisherPayoutUsd: share > 0 ? String(share) : null,
			claraRevenueUsd: String(claraRevenue),
		});
		if (existing) {
			await existing.update({
				subscriptionActive: true,
				acquisitionType: isMonthly ? "subscription" : "purchase",
				purchasePriceUsd: String(price),
			});
			logger.info("talent_acquired", { userId, talentId, type: talent.pricingModel, price });
			return { acquired: true, userTalentId: existing.id };
		}
		const row = await UserTalentLibrary.create({
			userId,
			talentId,
			acquisitionType: isMonthly ? "subscription" : "purchase",
			purchasePriceUsd: String(price),
			subscriptionActive: true,
		});
		logger.info("talent_acquired", { userId, talentId, type: talent.pricingModel, price });
		return { acquired: true, userTalentId: row.id };
	}

	/**
	 * Lapse a monthly subscription Talent in the library (e.g. billing job).
	 */
	async setSubscriptionActive(userId: string, talentId: string, active: boolean): Promise<void> {
		const row = await UserTalentLibrary.findOne({ where: { userId, talentId } });
		if (row) {
			await row.update({ subscriptionActive: active });
		}
	}

	async attach(userId: string, tier: PlanTier, agentId: string, talentId: string): Promise<void> {
		const talent = await AgentTalentCatalog.findByPk(talentId);
		if (!talent) {
			throw new Error("talent_not_found");
		}
		if (talent.category !== "free") {
			const lib = await UserTalentLibrary.findOne({ where: { userId, talentId, subscriptionActive: true } });
			if (!lib) {
				throw new Error("talent_not_owned");
			}
		}
		const agent = await UserAgent.findOne({ where: { id: agentId, userId } });
		if (!agent) {
			throw new Error("agent_not_found_or_not_owned");
		}
		const cap = TALENTS_PER_AGENT_BY_TIER[tier];
		if (cap !== null) {
			const n = await AgentTalentAttachment.count({ where: { userAgentId: agentId } });
			if (n >= cap) {
				throw new Error(`talents_per_agent_cap_reached:${String(cap)}`);
			}
		}
		const already = await AgentTalentAttachment.findOne({ where: { userAgentId: agentId, talentId } });
		if (already) {
			if (already.userId !== userId) {
				throw new Error("agent_not_found_or_not_owned");
			}
			return;
		}
		await AgentTalentAttachment.create({ userAgentId: agentId, talentId, userId });
		logger.info("talent_attached", { userId, agentId, talentId });
	}

	async detach(userId: string, agentId: string, talentId: string): Promise<void> {
		await AgentTalentAttachment.destroy({ where: { userAgentId: agentId, talentId, userId } });
	}

	async listAgentTalents(agentId: string): Promise<AgentTalentCatalog[]> {
		const links = await AgentTalentAttachment.findAll({ where: { userAgentId: agentId } });
		if (links.length === 0) {
			return [];
		}
		return AgentTalentCatalog.findAll({
			where: { id: { [Op.in]: links.map((l) => l.talentId) } },
		});
	}

	/**
	 * List Talents attached to an agent, only if the agent belongs to the user.
	 */
	async listAgentTalentsForUser(userId: string, agentId: string): Promise<AgentTalentCatalog[] | null> {
		const agent = await UserAgent.findOne({ where: { id: agentId, userId } });
		if (!agent) {
			return null;
		}
		return this.listAgentTalents(agentId);
	}

	/**
	 * Plain-text block appended at Memory Layer 0 for voice/history.
	 */
	async getTalentBlockForUserAgent(userId: string, userAgentId: string): Promise<string> {
		const count = await UserAgent.count({ where: { id: userAgentId, userId } });
		if (count === 0) {
			return "";
		}
		const talents = await this.listAgentTalents(userAgentId);
		if (talents.length === 0) {
			return "";
		}
		return talents.map((t) => `## ${t.displayName}\n${t.knowledgeContent}`).join("\n\n");
	}
}

export const talentService = new TalentService();

/**
 * @internal Used by route layer when `req.claraUser.tier` is a string alias
 */
export function planTierForAttach(rawTier: string | undefined): PlanTier {
	return toPlanTier(rawTier);
}
