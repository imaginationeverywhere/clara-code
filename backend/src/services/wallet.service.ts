import { createHash } from "node:crypto";
import type { Transaction } from "sequelize";
import { sequelize } from "@/config/database";
import { UserWallet } from "@/models/UserWallet";
import { WalletTransaction } from "@/models/WalletTransaction";
import { logger } from "@/utils/logger";

function toNumber(v: string | null | undefined): number {
	if (v == null || v === "") return 0;
	const n = Number(v);
	return Number.isFinite(n) ? n : 0;
}

/**
 * 64-char hex idempotency key; stable for the same business reference.
 */
export function idempotencyKeyFromReference(reference: string): string {
	if (typeof reference !== "string" || reference.length === 0) {
		throw new Error("wallet_reference_required");
	}
	return createHash("sha256").update(reference, "utf8").digest("hex");
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
	 * Deducts USD. `reference` is required and used as the idempotency basis (hashed); retries no-op.
	 */
	async debit(userId: string, amountUsd: number, reference: string, outerTransaction?: Transaction): Promise<void> {
		if (amountUsd < 0) {
			throw new Error("invalid_debit_amount");
		}
		if (amountUsd === 0) {
			return;
		}
		const idempotencyKey = idempotencyKeyFromReference(`debit:${userId}:${reference}`);

		const run = async (t: Transaction): Promise<void> => {
			const existing = await WalletTransaction.findOne({
				where: { idempotencyKey },
				transaction: t,
				lock: t.LOCK.UPDATE,
			});
			if (existing) {
				return;
			}
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
			try {
				await WalletTransaction.create(
					{
						userId,
						amountUsd: (-amountUsd).toFixed(2),
						transactionType: "debit",
						reference,
						idempotencyKey,
						metadata: { amount_debited: amountUsd },
					},
					{ transaction: t },
				);
			} catch (e: unknown) {
				const name = e && typeof e === "object" && "name" in e ? (e as { name?: string }).name : "";
				if (name === "SequelizeUniqueConstraintError") {
					return;
				}
				throw e;
			}
		};

		if (outerTransaction) {
			await run(outerTransaction);
		} else {
			await sequelize.transaction(async (t) => {
				await run(t);
			});
		}
		logger.info("wallet_debit", { userId, amountUsd, ref: reference });
	}

	/**
	 * Credit another user's wallet (e.g. third-party talent publisher 85% share).
	 */
	async creditPublisher(
		publisherUserId: string,
		amountUsd: number,
		reference: string,
		outerTransaction?: Transaction,
	): Promise<void> {
		if (amountUsd <= 0) {
			return;
		}
		const idempotencyKey = idempotencyKeyFromReference(`credit_pub:${publisherUserId}:${reference}`);

		const run = async (t: Transaction): Promise<void> => {
			const existing = await WalletTransaction.findOne({
				where: { idempotencyKey },
				transaction: t,
				lock: t.LOCK.UPDATE,
			});
			if (existing) {
				return;
			}
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
			try {
				await WalletTransaction.create(
					{
						userId: publisherUserId,
						amountUsd: amountUsd.toFixed(2),
						transactionType: "credit_publisher",
						reference,
						idempotencyKey,
						metadata: {},
					},
					{ transaction: t },
				);
			} catch (e: unknown) {
				const name = e && typeof e === "object" && "name" in e ? (e as { name?: string }).name : "";
				if (name === "SequelizeUniqueConstraintError") {
					return;
				}
				throw e;
			}
		};

		if (outerTransaction) {
			await run(outerTransaction);
		} else {
			await sequelize.transaction(async (t) => {
				await run(t);
			});
		}
		logger.info("wallet_credit_publisher", { publisherUserId, amountUsd, ref: reference });
	}
}

const wallet = new WalletService();
export { wallet as walletService };
