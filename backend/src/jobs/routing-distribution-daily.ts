import cron from "node-cron";
import { col, fn, Op } from "sequelize";
import { UsageEvent } from "@/models/UsageEvent";
import { logger } from "@/utils/logger";

function startOfDayUtc(d: Date): Date {
	return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

function addDays(d: Date, n: number): Date {
	return new Date(d.getTime() + n * 86_400_000);
}

type UsageAggRow = { modelUsed?: string; requestCount?: string; totalCogs?: string };

type DistributionRow = {
	model: string | null;
	requests: number;
	pct: string;
	cogs_usd: string;
};

/**
 * Nightly: aggregate `usage_events` from the prior UTC day by `model_used` for routing economics review.
 * Expected: gemma dominant, deepseek + kimi minority, premium small. See `pricing/model-routing-strategy.md`.
 */
export async function runRoutingDistributionJob(): Promise<void> {
	const today = startOfDayUtc(new Date());
	const yesterday = addDays(today, -1);

	const results = (await UsageEvent.findAll({
		attributes: ["modelUsed", [fn("COUNT", col("id")), "requestCount"], [fn("SUM", col("cogs_usd")), "totalCogs"]],
		where: {
			createdAt: {
				[Op.gte]: yesterday,
				[Op.lt]: today,
			},
		},
		group: ["modelUsed"] as const,
		raw: true,
	})) as unknown as UsageAggRow[];

	const total = results.reduce((s, r) => s + Number(r.requestCount ?? 0), 0);
	const distribution: DistributionRow[] = results.map((r) => {
		const count = Number(r.requestCount ?? 0);
		const tC = r.totalCogs;
		const cogs = typeof tC === "string" || typeof tC === "number" ? Number(tC) : 0;
		return {
			model: r.modelUsed ?? "unknown",
			requests: count,
			pct: total > 0 ? ((count / total) * 100).toFixed(1) : "0.0",
			cogs_usd: cogs.toFixed(6),
		};
	});

	logger.info("routing_distribution_daily", {
		period_utc: { from: yesterday.toISOString(), to: today.toISOString() },
		distribution,
		total_requests: total,
	});
}

if (!process.env.JEST_WORKER_ID) {
	cron.schedule(
		"0 2 * * *",
		() => {
			void runRoutingDistributionJob().catch((err: unknown) =>
				logger.error("routing_distribution_daily job failed", err),
			);
		},
		{ timezone: "UTC" },
	);
}
