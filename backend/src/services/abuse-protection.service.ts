import { type AppRedis, getRedis } from "@/lib/redis";
import { UsageEvent } from "@/models/UsageEvent";
import { UserUsage } from "@/models/UserUsage";
import type { ModelChoice } from "@/services/model-router.service";
import {
	PLAN_LIMITS,
	type PlanTier,
	RATE_LIMIT_PER_MINUTE,
	REVIEW_TRIGGER_HOURS,
	toPlanTier,
} from "@/services/plan-limits";
import { logger } from "@/utils/logger";

export type AbuseModelUsed = "gemma" | "kimi" | "deepseek" | "premium" | "user_deepest";

/**
 * Map Hermes / internal routing `ModelChoice` to COGS + usage_event labels.
 * Self-hosted and Bedrock slugs stay server-side in logs, not in client errors.
 */
export function abuseModelFromModelChoice(choice: ModelChoice): AbuseModelUsed {
	switch (choice) {
		case "gemma_27b":
			return "gemma";
		case "kimi_k2":
			return "kimi";
		case "deepseek_v3":
			return "deepseek";
		case "bedrock_premium":
			return "premium";
		case "user_deepest":
			return "user_deepest";
		default: {
			const _x: never = choice;
			return _x;
		}
	}
}

export type AbuseCheckResult =
	| { allowed: true }
	| { allowed: false; reason: "rate_limit" | "frozen"; retryAfter?: number };

function r(): AppRedis {
	return getRedis();
}

function monthKeyDb(d = new Date()): string {
	return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function utcYyyyLL(): string {
	const d = new Date();
	return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function utcMinuteKey(d = new Date()): string {
	return (
		String(d.getUTCFullYear()) +
		String(d.getUTCMonth() + 1).padStart(2, "0") +
		String(d.getUTCDate()).padStart(2, "0") +
		String(d.getUTCHours()).padStart(2, "0") +
		String(d.getUTCMinutes()).padStart(2, "0")
	);
}

function utcHourKey(d = new Date()): string {
	return (
		String(d.getUTCFullYear()) +
		String(d.getUTCMonth() + 1).padStart(2, "0") +
		String(d.getUTCDate()).padStart(2, "0") +
		String(d.getUTCHours()).padStart(2, "0")
	);
}

export class AbuseProtectionService {
	async preflight(userId: string, tier: string | PlanTier): Promise<AbuseCheckResult> {
		const t = toPlanTier(tier);
		const frozenRow = await UserUsage.findByPk(userId);
		if (frozenRow?.isFrozen) {
			return { allowed: false, reason: "frozen" };
		}
		if ((await r().exists(`frozen:${userId}`)) > 0) {
			return { allowed: false, reason: "frozen" };
		}

		const minuteKey = utcMinuteKey();
		const rlKey = `rl:${userId}:${minuteKey}`;
		const minuteCount = await r().incr(rlKey);
		if (minuteCount === 1) {
			await r().expire(rlKey, 65);
		}
		if (minuteCount > RATE_LIMIT_PER_MINUTE) {
			return { allowed: false, reason: "rate_limit", retryAfter: 60 };
		}

		const limits = PLAN_LIMITS[t] ?? PLAN_LIMITS.free;
		if (limits.monthlyCogsHardCap !== null) {
			const monthKey = utcYyyyLL();
			const cogsK = `usage:${userId}:${monthKey}:cogs_usd`;
			const monthCogs = parseFloat((await r().get(cogsK)) ?? "0");
			if (monthCogs >= limits.monthlyCogsHardCap) {
				await this.freezeAccount(userId, monthCogs, limits.monthlyCogsHardCap, t);
				return { allowed: false, reason: "frozen" };
			}
		}

		return { allowed: true };
	}

	async recordUsage(params: {
		userId: string;
		agentId?: string;
		modelUsed: AbuseModelUsed;
		taskType?: string;
		bedrockInputTokens: number;
		bedrockOutputTokens: number;
		modalComputeSeconds: number;
		cacheHit: boolean;
	}): Promise<void> {
		const {
			userId,
			agentId,
			modelUsed,
			taskType,
			bedrockInputTokens,
			bedrockOutputTokens,
			modalComputeSeconds,
			cacheHit,
		} = params;
		const cogsUsd = cacheHit
			? 0
			: this.computeCOGS(modelUsed, bedrockInputTokens, bedrockOutputTokens, modalComputeSeconds);

		const nowHourKey = utcHourKey();
		const monthKey = utcYyyyLL();
		const hourTtl = 35 * 24 * 3600;
		const cogsKey = `usage:${userId}:${monthKey}:cogs_usd`;
		const statsKey = `usage:${userId}:${monthKey}:stats`;
		const hourSetKey = `usage:${userId}:hour:${nowHourKey}`;

		const isNewHour = await r().set(hourSetKey, "1", "EX", 3700, "NX");

		const tasks: Array<Promise<unknown>> = [r().incrbyfloat(cogsKey, cogsUsd), r().expire(cogsKey, hourTtl)];
		if (isNewHour === "OK") {
			tasks.push(r().hincrbyfloat(statsKey, "hours", 1), r().expire(statsKey, hourTtl));
		}
		await Promise.all(tasks);

		const monthHours = parseFloat((await r().hget(statsKey, "hours")) ?? "0");
		if (monthHours > REVIEW_TRIGGER_HOURS) {
			void this.flagForReview(userId, monthHours);
		}

		UsageEvent.create({
			userId,
			agentId: agentId ?? null,
			modelUsed,
			taskType: taskType ?? null,
			bedrockInputTokens,
			bedrockOutputTokens,
			modalComputeSeconds,
			cogsUsd,
			cacheHit,
		}).catch((err: unknown) => {
			logger.warn("usage_event persist failed", { err });
		});
	}

	computeCOGS(model: AbuseModelUsed, inputTokens: number, outputTokens: number, modalSeconds: number): number {
		if (model === "user_deepest") {
			return 0;
		}
		const modalCost = modalSeconds * 0.0003;
		let tokenCost = 0;
		if (model === "deepseek") {
			tokenCost = (inputTokens / 1_000_000) * 0.27 + (outputTokens / 1_000_000) * 1.1;
		} else if (model === "premium") {
			tokenCost = (inputTokens / 1_000_000) * 3 + (outputTokens / 1_000_000) * 15;
		}
		return tokenCost + modalCost;
	}

	private async flagForReview(userId: string, hours: number): Promise<void> {
		if ((await r().exists(`flagged:${userId}`)) > 0) {
			return;
		}
		const mk = monthKeyDb();
		const row = await UserUsage.findByPk(userId);
		if (row?.isFlagged) {
			return;
		}
		await r().set(`flagged:${userId}`, "1", "EX", 32 * 24 * 3600);
		if (row) {
			await row.update({ isFlagged: true, flaggedAt: new Date() });
		} else {
			await UserUsage.create({
				userId,
				tier: "free",
				monthKey: mk,
				activeHours: 0,
				cogsUsd: 0,
				isFlagged: true,
				isFrozen: false,
				flaggedAt: new Date(),
			});
		}
		logger.warn("abuse_review_triggered", { userId, hours });
	}

	private async freezeAccount(userId: string, currentCogs: number, cap: number, tier: PlanTier): Promise<void> {
		if ((await r().exists(`frozen:${userId}`)) > 0) {
			return;
		}
		const mk = monthKeyDb();
		const [row, created] = await UserUsage.findOrCreate({
			where: { userId },
			defaults: {
				userId,
				tier,
				monthKey: mk,
				activeHours: 0,
				cogsUsd: 0,
				isFlagged: false,
				isFrozen: false,
			},
		});
		if (!created && row.isFrozen) {
			return;
		}
		await r().set(`frozen:${userId}`, "1");
		if (!row.isFrozen) {
			await row.update({ isFrozen: true, frozenAt: new Date() });
		}
		logger.error("account_frozen_cogs_cap", { userId, currentCogs, cap, tier });
	}
}

export const abuseProtectionService = new AbuseProtectionService();
