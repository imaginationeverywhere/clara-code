import { VoiceUsage } from "@/models/VoiceUsage";
import { getBillingMonthKey, getNextResetDateKey, VoiceUsageService } from "@/services/voice-usage.service";

jest.mock("@/models/VoiceUsage", () => ({
	VoiceUsage: {
		findOne: jest.fn(),
		findOrCreate: jest.fn(),
		destroy: jest.fn(),
	},
}));

describe("VoiceUsageService", () => {
	let service: VoiceUsageService;

	beforeEach(() => {
		jest.clearAllMocks();
		service = new VoiceUsageService();
	});

	it("getBillingMonthKey returns first day of current UTC month", () => {
		const d = new Date(Date.UTC(2026, 3, 14));
		expect(getBillingMonthKey(d)).toBe("2026-04-01");
	});

	it("getNextResetDateKey returns first day of next month UTC", () => {
		const d = new Date(Date.UTC(2026, 3, 14));
		expect(getNextResetDateKey(d)).toBe("2026-05-01");
	});

	it("checkAndIncrement returns true for pro tier without DB read", async () => {
		const ok = await service.checkAndIncrement("u1", "pro");
		expect(ok).toBe(true);
		expect(VoiceUsage.findOne).not.toHaveBeenCalled();
	});

	it("checkAndIncrement always allows under invisible-limits model", async () => {
		const ok = await service.checkAndIncrement("u1", "basic");
		expect(ok).toBe(true);
	});

	it("incrementAfterSuccess upserts and increments", async () => {
		const inc = jest.fn().mockResolvedValue(undefined);
		(VoiceUsage.findOrCreate as jest.Mock).mockResolvedValueOnce([{ increment: inc }, true]);
		await service.incrementAfterSuccess("u1", "basic");
		expect(inc).toHaveBeenCalledWith("exchangeCount", { by: 1, transaction: undefined });
	});

	it("getUsage: business reports limit null", async () => {
		(VoiceUsage.findOne as jest.Mock).mockResolvedValueOnce({ exchangeCount: 500 });
		const u = await service.getUsage("u1", "business");
		expect(u.limit).toBeNull();
		expect(u.used).toBe(500);
	});

	it("getUsage: every paid tier reports null limit", async () => {
		(VoiceUsage.findOne as jest.Mock).mockResolvedValueOnce({ exchangeCount: 12 });
		const u = await service.getUsage("u1", "basic");
		expect(u.limit).toBeNull();
		expect(u.used).toBe(12);
	});
});
