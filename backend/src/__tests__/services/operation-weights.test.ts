import { CREDIT_BUDGETS, classifyOperation } from "@/services/operation-weights";
import type { PlanTier } from "@/services/plan-limits";

describe("operation-weights", () => {
	describe("classifyOperation", () => {
		it("passive for explain / read patterns", () => {
			expect(classifyOperation("Explain this function please")).toBe("passive");
			expect(classifyOperation("What does the router do?")).toBe("passive");
			expect(classifyOperation("Show me the log output")).toBe("passive");
		});

		it("agent_build for new agent / soul", () => {
			expect(classifyOperation("I need to build a new agent for sales")).toBe("agent_build");
			expect(classifyOperation("Create a SOUL for my harness")).toBe("agent_build");
		});

		it("critical for scaffold / full app", () => {
			expect(classifyOperation("Scaffold a full app with auth")).toBe("critical");
		});

		it("heavy for research / full feature", () => {
			expect(classifyOperation("Research the competitors and full feature page")).toBe("heavy");
		});

		it("medium for build / implement / fix", () => {
			expect(classifyOperation("Build a small React page")).toBe("medium");
			expect(classifyOperation("Fix the typo in the header")).toBe("medium");
		});

		it("defaults to light for neutral text", () => {
			expect(classifyOperation("maybe")).toBe("light");
		});
	});

	it("CREDIT_BUDGETS keys every PlanTier", () => {
		const tiers: PlanTier[] = ["free", "basic", "pro", "max", "business", "enterprise"];
		for (const t of tiers) {
			expect(CREDIT_BUDGETS[t] !== undefined).toBe(true);
		}
	});
});
