import type { Transaction } from "sequelize";
import { VoiceUsage } from "@/models/VoiceUsage";
import { toPlanTier } from "@/services/plan-limits";

export type VoiceTier = string;

function getBillingMonthKey(date: Date = new Date()): string {
	const y = date.getUTCFullYear();
	const m = String(date.getUTCMonth() + 1).padStart(2, "0");
	return `${String(y)}-${m}-01`;
}

/** First calendar day of next month (UTC), YYYY-MM-DD */
function getNextResetDateKey(from: Date = new Date()): string {
	const y = from.getUTCFullYear();
	const m = from.getUTCMonth();
	const next = new Date(Date.UTC(y, m + 1, 1));
	const ny = next.getUTCFullYear();
	const nm = String(next.getUTCMonth() + 1).padStart(2, "0");
	return `${String(ny)}-${nm}-01`;
}

export class VoiceUsageService {
	private getBillingMonth(): string {
		return getBillingMonthKey();
	}

	async getUsedCountForCurrentMonth(userId: string): Promise<number> {
		const billingMonth = this.getBillingMonth();
		const row = await VoiceUsage.findOne({
			where: { userId, billingMonth },
		});
		return row?.exchangeCount ?? 0;
	}

	/**
	 * All paid tiers: no app-facing cap (`limit: null`); `used` is recorded for product
	 * analytics. Abuse protection (rate limit, COGS) lives in `AbuseProtectionService`.
	 */
	async getUsage(
		userId: string,
		tierRaw: VoiceTier,
	): Promise<{
		used: number;
		limit: number | null;
		resetDate: string;
	}> {
		const used = await this.getUsedCountForCurrentMonth(userId);
		const resetDate = getNextResetDateKey();
		// Resolve tier defensively in case callers pass an alias.
		toPlanTier(tierRaw as string);
		return { used, limit: null, resetDate };
	}

	/** Always allowed at this layer; abuse limits enforced upstream. */
	async canAddExchange(_userId: string, _tier: VoiceTier): Promise<boolean> {
		return true;
	}

	/**
	 * @deprecated use `canAddExchange`
	 */
	async checkAndIncrement(_userId: string, _tier: VoiceTier): Promise<boolean> {
		return true;
	}

	/**
	 * Records a completed successful voice exchange (internal analytics; not shown as a user-facing cap).
	 */
	async incrementAfterSuccess(
		userId: string,
		_tier: VoiceTier,
		options?: { transaction?: Transaction },
	): Promise<void> {
		const billingMonth = this.getBillingMonth();
		const transaction = options?.transaction;
		const findOpts =
			transaction !== undefined
				? {
						where: { userId, billingMonth },
						defaults: { userId, billingMonth, exchangeCount: 0 },
						transaction,
					}
				: {
						where: { userId, billingMonth },
						defaults: { userId, billingMonth, exchangeCount: 0 },
					};
		const [row] = await VoiceUsage.findOrCreate(findOpts);
		const incOpts = transaction !== undefined ? { by: 1 as const, transaction } : { by: 1 as const };
		await row.increment("exchangeCount", incOpts);
	}
}

export const voiceUsageService = new VoiceUsageService();

export { getBillingMonthKey, getNextResetDateKey };
