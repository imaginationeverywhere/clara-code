import { OperationCredits } from "@/models/OperationCredits";
import {
	applyOperationCreditUsage,
	canUseOperationCredits,
	refundOperationCredits,
	reserveOperationCredits,
} from "@/services/operation-credit.service";

const mockT = { LOCK: { UPDATE: "UPDATE" } };
jest.mock("@/config/database", () => ({
	sequelize: {
		transaction: async (fn: (t: typeof mockT) => Promise<unknown>) => fn(mockT),
	},
}));

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

	it("reserve: increments for medium", async () => {
		const inc = jest.fn().mockResolvedValue(undefined);
		(OperationCredits.findOrCreate as jest.Mock).mockResolvedValueOnce([{ creditsUsed: 0, increment: inc }, true]);
		const r = await reserveOperationCredits("u1", "a1", "basic", "medium");
		expect(r.ok).toBe(true);
		if (r.ok) expect(r.didReserve).toBe(true);
		expect(inc).toHaveBeenCalled();
	});

	it("refund: decrements after reserve", async () => {
		const dec = jest.fn().mockResolvedValue(undefined);
		(OperationCredits.findOne as jest.Mock).mockResolvedValueOnce({ decrement: dec, creditsUsed: 10 });
		await refundOperationCredits("u1", "a1", "basic", "medium");
		expect(dec).toHaveBeenCalled();
	});
});
