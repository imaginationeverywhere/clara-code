import type { Transaction } from "sequelize";
import { sequelize } from "@/config/database";
import { UserWallet } from "@/models/UserWallet";
import { logger } from "@/utils/logger";

function toNumber(v: string | null | undefined): number {
	if (v == null || v === "") return 0;
	const n = Number(v);
	return Number.isFinite(n) ? n : 0;
}

export class WalletService {
	/**
	 * Ensure a wallet row exists. Defaults to $0; fund via ops or a future top-up flow.
	 */
	private async getOrCreateWallet(userId: string, transaction: Transaction): Promise<UserWallet> {
		const [row] = await UserWallet.findOrCreate({
			where: { userId },
			defaults: { userId, balanceUsd: "0" },
			transaction,
		});
		return row;
	}

	async getBalance(userId: string): Promise<number> {
		const row = await UserWallet.findByPk(userId);
		return toNumber(row?.balanceUsd);
	}

	async ensureWallet(userId: string): Promise<void> {
		await sequelize.transaction(async (t) => {
			await this.getOrCreateWallet(userId, t);
		});
	}

	/**
	 * Deducts USD. Throws if insufficient.
	 */
	async debit(userId: string, amountUsd: number, _reference: string): Promise<void> {
		if (amountUsd < 0) {
			throw new Error("invalid_debit_amount");
		}
		if (amountUsd === 0) {
			return;
		}
		await sequelize.transaction(async (t) => {
			await this.getOrCreateWallet(userId, t);
			const w = await UserWallet.findByPk(userId, {
				transaction: t,
				lock: t.LOCK.UPDATE,
			});
			if (!w) {
				throw new Error("wallet_missing");
			}
			const bal = toNumber(w.balanceUsd);
			if (bal + 1e-6 < amountUsd) {
				throw new Error("insufficient_wallet_balance");
			}
			const next = (bal - amountUsd).toFixed(2);
			await w.update({ balanceUsd: next }, { transaction: t });
		});
		logger.info("wallet_debit", { userId, amountUsd, ref: _reference });
	}

	/**
	 * Credit another user's wallet (e.g. third-party talent publisher 85% share).
	 */
	async creditPublisher(publisherUserId: string, amountUsd: number, _reference: string): Promise<void> {
		if (amountUsd <= 0) {
			return;
		}
		await sequelize.transaction(async (t) => {
			await this.getOrCreateWallet(publisherUserId, t);
			const w = await UserWallet.findByPk(publisherUserId, {
				transaction: t,
				lock: t.LOCK.UPDATE,
			});
			if (!w) {
				return;
			}
			const next = (toNumber(w.balanceUsd) + amountUsd).toFixed(2);
			await w.update({ balanceUsd: next }, { transaction: t });
		});
		logger.info("wallet_credit_publisher", { publisherUserId, amountUsd, ref: _reference });
	}
}

const wallet = new WalletService();
export { wallet as walletService };
