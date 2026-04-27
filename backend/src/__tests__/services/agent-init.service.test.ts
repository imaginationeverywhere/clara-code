import { canTierInitAgentRepo, validateAgentNameForInit } from "@/services/agent-init.service";
import type { PlanTier } from "@/services/plan-limits";

describe("agent-init.service", () => {
	describe("validateAgentNameForInit", () => {
		it("accepts kebab-case", () => {
			expect(validateAgentNameForInit("my-first-agent").valid).toBe(true);
		});
		it("rejects reserved", () => {
			expect(validateAgentNameForInit("clara").valid).toBe(false);
		});
	});

	describe("canTierInitAgentRepo", () => {
		it.each([
			["basic" as PlanTier, false],
			["pro" as PlanTier, false],
			["business" as PlanTier, true],
			["enterprise" as PlanTier, true],
		] as const)("tier %s -> %s", (tier, exp) => {
			expect(canTierInitAgentRepo(tier)).toBe(exp);
		});
	});
});
