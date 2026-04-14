import type { Transaction } from "sequelize";
import { VoiceUsage } from "@/models/VoiceUsage";

export type VoiceTier = "free" | "pro" | "business";

const FREE_MONTHLY_LIMIT = 100;

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

	async getUsage(
		userId: string,
		tier: VoiceTier,
	): Promise<{ used: number; limit: number | null; resetDate: string }> {
		const used = await this.getUsedCountForCurrentMonth(userId);
		const resetDate = getNextResetDateKey();
		if (tier === "pro" || tier === "business") {
			return { used, limit: null, resetDate };
		}
		return { used, limit: FREE_MONTHLY_LIMIT, resetDate };
	}

	/**
	 * Pre-flight check before starting a voice exchange. Does not increment.
	 * Returns false when a free-tier user has already reached the monthly cap.
	 */
	async checkAndIncrement(userId: string, tier: VoiceTier): Promise<boolean> {
		if (tier === "pro" || tier === "business") {
			return true;
		}
		const used = await this.getUsedCountForCurrentMonth(userId);
		return used < FREE_MONTHLY_LIMIT;
	}

	/**
	 * Records a completed successful voice exchange (increments analytics counter).
	 * Call only after the upstream voice request succeeds.
	 */
	async incrementAfterSuccess(userId: string, _tier: VoiceTier, options?: { transaction?: Transaction }): Promise<void> {
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
		const incOpts =
			transaction !== undefined ? { by: 1 as const, transaction } : { by: 1 as const };
		await row.increment("exchangeCount", incOpts);
	}

}

export const voiceUsageService = new VoiceUsageService();

export { getBillingMonthKey, getNextResetDateKey, FREE_MONTHLY_LIMIT };
