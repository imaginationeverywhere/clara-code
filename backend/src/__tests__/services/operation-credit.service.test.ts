import { OperationCredits } from "@/models/OperationCredits";
import { applyOperationCreditUsage, canUseOperationCredits } from "@/services/operation-credit.service";

jest.mock("@/models/OperationCredits", () => ({
	OperationCredits: {
		findOne: jest.fn(),
		findOrCreate: jest.fn(),
	},
}));

describe("operation-credit.service", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("canUse: passive/light are always allowed without DB", async () => {
		const a = await canUseOperationCredits("u1", "a1", "basic", "passive");
		expect(a.allowed).toBe(true);
		expect(a.creditsRemaining).toBeNull();
		const b = await canUseOperationCredits("u1", "a1", "basic", "light");
		expect(b.allowed).toBe(true);
		expect(OperationCredits.findOne).not.toHaveBeenCalled();
	});

	it("canUse: basic within budget with DB read", async () => {
		(OperationCredits.findOne as jest.Mock).mockResolvedValueOnce({ creditsUsed: 100 });
		const c = await canUseOperationCredits("u1", "a1", "basic", "medium");
		expect(c.allowed).toBe(true);
	});

	it("canUse: basic over budget", async () => {
		(OperationCredits.findOne as jest.Mock).mockResolvedValueOnce({ creditsUsed: 498 });
		const c = await canUseOperationCredits("u1", "a1", "basic", "medium");
		// 498 + 3 > 500
		expect(c.allowed).toBe(false);
	});

	it("canUse: pro cannot agent_build (plan limit)", async () => {
		const c = await canUseOperationCredits("u1", "a1", "pro", "agent_build");
		expect(c.allowed).toBe(false);
	});

	it("canUse: business allows agent_build with no credit cap (canBuild true)", async () => {
		const c = await canUseOperationCredits("u1", "a1", "business", "agent_build");
		expect(c.allowed).toBe(true);
	});

	it("apply: no-op for passive", async () => {
		await applyOperationCreditUsage("u1", "a1", "pro", "passive");
		expect(OperationCredits.findOrCreate).not.toHaveBeenCalled();
	});

	it("apply: increments for medium", async () => {
		const inc = jest.fn().mockResolvedValue(undefined);
		(OperationCredits.findOrCreate as jest.Mock).mockResolvedValueOnce([{ increment: inc }, true]);
		await applyOperationCreditUsage("u1", "a1", "basic", "medium");
		expect(inc).toHaveBeenCalled();
	});
});
