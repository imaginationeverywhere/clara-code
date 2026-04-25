import { _resetInMemoryRedisForTests, type AppRedis, getRedis } from "@/lib/redis";
import { UserUsage } from "@/models/UserUsage";
import { abuseProtectionService } from "@/services/abuse-protection.service";
import { PLAN_LIMITS, RATE_LIMIT_PER_MINUTE, UNIVERSAL_INCLUSIONS } from "@/services/plan-limits";

jest.mock("@/models/UsageEvent", () => ({
	UsageEvent: { create: jest.fn().mockResolvedValue(undefined) },
}));

jest.mock("@/models/UserUsage", () => ({
	UserUsage: {
		findByPk: jest.fn(),
		create: jest.fn().mockResolvedValue(undefined),
	},
}));

const mockUserUsage = UserUsage as jest.Mocked<typeof UserUsage>;

const redis = (): AppRedis => getRedis();

describe("AbuseProtectionService", () => {
	beforeEach(() => {
		_resetInMemoryRedisForTests();
		jest.clearAllMocks();
		(mockUserUsage.findByPk as jest.Mock).mockResolvedValue(null);
	});

	describe("preflight", () => {
		it("allows the first preflight in a new minute window", async () => {
			const o = await abuseProtectionService.preflight("u1", "basic");
			expect(o).toEqual({ allowed: true });
		});

		it("blocks on rate limit on the 121st preflight in the same clock minute", async () => {
			_resetInMemoryRedisForTests();
			let last = { allowed: true } as { allowed: false; reason: string; retryAfter?: number } | { allowed: true };
			for (let i = 0; i < RATE_LIMIT_PER_MINUTE + 1; i += 1) {
				// eslint-disable-next-line no-await-in-loop
				last = await abuseProtectionService.preflight("u-rate", "basic");
			}
			expect(last.allowed).toBe(false);
			if (last.allowed === false) {
				expect(last.reason).toBe("rate_limit");
			}
		});

		it("blocks when isFrozen in user_usage (DB)", async () => {
			(mockUserUsage.findByPk as jest.Mock).mockResolvedValueOnce({ isFrozen: true, userId: "z" });
			const o = await abuseProtectionService.preflight("z", "basic");
			expect(o.allowed).toBe(false);
			if (!o.allowed) {
				expect(o.reason).toBe("frozen");
			}
		});

		it("does not apply COGS auto-freeze for enterprise (cap null)", async () => {
			_resetInMemoryRedisForTests();
			const d = new Date();
			const monthKey = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
			const k = `usage:u-ent:${monthKey}:cogs_usd`;
			await redis().set(k, "1e9");
			const o = await abuseProtectionService.preflight("u-ent", "enterprise");
			expect(o).toEqual({ allowed: true });
		});

		it("computeCOGS is zero for user_deepest", () => {
			expect(abuseProtectionService.computeCOGS("user_deepest", 1_000_000, 1_000_000, 1000)).toBe(0);
		});
	});

	describe("PLAN_LIMITS and UNIVERSAL_INCLUSIONS", () => {
		it("Basic is $39 with 3 configurable agents", () => {
			expect(PLAN_LIMITS.basic.price).toBe(39);
			expect(PLAN_LIMITS.basic.configurableAgents).toBe(3);
		});
		it("Pro is $69 with 6 agents, canBuildAgents=false", () => {
			expect(PLAN_LIMITS.pro).toMatchObject({ price: 69, configurableAgents: 6, canBuildAgents: false });
		});
		it("Max is $99 with list marketplace", () => {
			expect(PLAN_LIMITS.max).toMatchObject({ price: 99, marketplaceTier: "list" });
		});
		it("Business is $299, canBuild, publish", () => {
			expect(PLAN_LIMITS.business).toMatchObject({ price: 299, canBuildAgents: true, marketplaceTier: "publish" });
		});
		it("Enterprise has null configurableAgents, talentsPerAgent, monthlyCogsHardCap", () => {
			expect(PLAN_LIMITS.enterprise.configurableAgents).toBeNull();
			expect(PLAN_LIMITS.enterprise.talentsPerAgent).toBeNull();
			expect(PLAN_LIMITS.enterprise.monthlyCogsHardCap).toBeNull();
		});
		it("UNIVERSAL_INCLUSIONS includes premium voice + custom cloning", () => {
			expect(UNIVERSAL_INCLUSIONS.premiumVoice).toBe(true);
			expect(UNIVERSAL_INCLUSIONS.customVoiceCloning).toBe(true);
		});
	});

	describe("computeCOGS", () => {
		it("applies deepseek per-token cost", () => {
			const z = abuseProtectionService.computeCOGS("deepseek", 1_000_000, 0, 0);
			expect(z).toBeCloseTo(0.27, 2);
		});
	});
});
