import { AgentTalentAttachment } from "@/models/AgentTalentAttachment";
import { AgentTalentPurchase } from "@/models/AgentTalentPurchase";
import { UserAgent } from "@/models/UserAgent";
import { planTierForAttach, TalentService } from "@/services/talent.service";
import { walletService } from "@/services/wallet.service";

jest.mock("@/utils/logger", () => ({
	logger: { info: jest.fn(), error: jest.fn() },
}));

jest.mock("@/services/wallet.service", () => ({
	walletService: {
		debit: jest.fn().mockResolvedValue(undefined),
		creditPublisher: jest.fn().mockResolvedValue(undefined),
	},
}));

const mockCatalogFindAll = jest.fn();
const mockCatalogFindByPk = jest.fn();
const mockLibFindAll = jest.fn();
const mockLibFindOne = jest.fn();
const mockLibCreate = jest.fn();
const mockCountAttach = jest.fn();
const mockFindOneAttach = jest.fn();
const mockUserAgentFindOne = jest.fn();

jest.mock("@/models/AgentTalentCatalog", () => ({
	AgentTalentCatalog: {
		findAll: (...a: unknown[]) => mockCatalogFindAll(...a),
		findByPk: (...a: unknown[]) => mockCatalogFindByPk(...a),
	},
}));
jest.mock("@/models/UserTalentLibrary", () => ({
	UserTalentLibrary: {
		findAll: (...a: unknown[]) => mockLibFindAll(...a),
		findOne: (...a: unknown[]) => mockLibFindOne(...a),
		create: (...a: unknown[]) => mockLibCreate(...a),
	},
}));
jest.mock("@/models/AgentTalentAttachment", () => ({
	AgentTalentAttachment: {
		count: (...a: unknown[]) => mockCountAttach(...a),
		findOne: (...a: unknown[]) => mockFindOneAttach(...a),
		create: jest.fn().mockResolvedValue({}),
		destroy: jest.fn().mockResolvedValue(1),
		findAll: jest.fn().mockResolvedValue([]),
	},
}));
jest.mock("@/models/AgentTalentPurchase", () => ({
	AgentTalentPurchase: {
		create: jest.fn().mockResolvedValue({}),
	},
}));
jest.mock("@/models/UserAgent", () => ({
	UserAgent: {
		findOne: (...a: unknown[]) => mockUserAgentFindOne(...a),
		count: jest.fn().mockResolvedValue(1),
	},
}));

function catalogRow(over: Record<string, unknown> = {}): any {
	return {
		id: "a",
		displayName: "A",
		description: "d",
		category: "free",
		domain: "personal",
		industryVertical: null,
		knowledgeContent: "k",
		associatedGears: [],
		pricingModel: "free",
		priceUsd: "0",
		monthlyPriceUsd: null,
		publisherUserId: null,
		publisherRevenueShare: "0.85",
		isPublic: true,
		...over,
	};
}

describe("TalentService", () => {
	const svc = new TalentService();
	const userId = "u1";

	beforeEach(() => {
		jest.clearAllMocks();
		(mockUserAgentFindOne as jest.Mock).mockResolvedValue({ id: "agent-uuid" });
		mockFindOneAttach.mockResolvedValue(null);
	});

	describe("browseInventory", () => {
		it("flags free and owned as attachable", async () => {
			const freeRow = catalogRow({ id: "free1", category: "free" });
			const proRow = catalogRow({
				id: "pro1",
				category: "professional",
				priceUsd: "4.99",
				pricingModel: "one_time",
			});
			mockCatalogFindAll.mockResolvedValue([freeRow, proRow]);
			mockLibFindAll.mockResolvedValue([{ talentId: "pro1" }]);
			const out = await svc.browseInventory("u1");
			expect(out).toHaveLength(2);
			expect(out.find((x) => x.id === "free1")?.canAttach).toBe(true);
			expect(out.find((x) => x.id === "pro1")?.canAttach).toBe(true);
		});
	});

	describe("acquire", () => {
		it("creates library for free without wallet debit", async () => {
			mockCatalogFindByPk.mockResolvedValue(catalogRow({ id: "p", category: "free" }));
			mockLibFindOne.mockResolvedValue(null);
			mockLibCreate.mockResolvedValue({ id: "new-lib" });
			const o = await svc.acquire(userId, "p");
			expect(o.acquired).toBe(true);
			expect(walletService.debit).not.toHaveBeenCalled();
		});

		it("debits and credits third-party publisher", async () => {
			mockCatalogFindByPk.mockResolvedValue(
				catalogRow({
					category: "third_party",
					publisherUserId: "pub1",
					publisherRevenueShare: "0.85",
					priceUsd: "4.99",
					pricingModel: "one_time",
					monthlyPriceUsd: null,
				}),
			);
			mockLibFindOne.mockResolvedValue(null);
			mockLibCreate.mockResolvedValue({ id: "lib2" });
			await svc.acquire(userId, "t1");
			expect(walletService.debit).toHaveBeenCalledWith(userId, 4.99, "talent:t1:one_time");
			expect(walletService.creditPublisher).toHaveBeenCalledWith("pub1", 4.99 * 0.85, "talent_sale:t1");
			expect(AgentTalentPurchase.create).toHaveBeenCalled();
		});
	});

	describe("attach", () => {
		it("throws at tier cap (basic=5)", async () => {
			mockCatalogFindByPk.mockResolvedValue(catalogRow({ id: "x" }));
			mockCountAttach.mockResolvedValue(5);
			await expect(svc.attach(userId, "basic", "ag", "x")).rejects.toThrow("talents_per_agent_cap_reached:5");
		});

		it("allows when under cap", async () => {
			mockCatalogFindByPk.mockResolvedValue(catalogRow({ id: "scheduling" }));
			mockCountAttach.mockResolvedValue(2);
			await svc.attach(userId, "basic", "ag", "scheduling");
			expect(AgentTalentAttachment.create).toHaveBeenCalled();
		});
	});

	describe("getTalentBlockForUserAgent", () => {
		it("returns empty when not owned", async () => {
			(UserAgent.count as jest.Mock).mockResolvedValueOnce(0);
			const t = await svc.getTalentBlockForUserAgent(userId, "u");
			expect(t).toBe("");
		});
	});
});

describe("planTierForAttach", () => {
	it("normalizes pro alias", () => {
		expect(planTierForAttach("pro")).toBe("pro");
	});
});
