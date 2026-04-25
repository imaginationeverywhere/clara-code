import { resolveRequestTier } from "@/utils/request-tier";

jest.mock("@/models/ApiKey", () => ({
	ApiKey: { findOne: jest.fn(), findAll: jest.fn() },
}));
jest.mock("@/models/Subscription", () => ({
	Subscription: { findOne: jest.fn() },
}));
jest.mock("@/utils/api-key", () => ({
	validateApiKeyAgainstHash: jest.fn(),
}));

import { ApiKey } from "@/models/ApiKey";
import { Subscription } from "@/models/Subscription";
import { validateApiKeyAgainstHash } from "@/utils/api-key";

describe("resolveRequestTier", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("resolves sk-clara- key to its tier", async () => {
		(ApiKey.findOne as jest.Mock).mockResolvedValueOnce({ tier: "pro", isActive: true });
		const req = { headers: { authorization: "Bearer sk-clara-abc123" } };
		const tier = await resolveRequestTier(req as never);
		expect(tier).toBe("pro");
	});

	it("returns base when sk-clara- key is not found", async () => {
		(ApiKey.findOne as jest.Mock).mockResolvedValueOnce(null);
		const req = { headers: { authorization: "Bearer sk-clara-notfound" } };
		const tier = await resolveRequestTier(req as never);
		expect(tier).toBe("base");
	});

	it("resolves cc_live_ key to its tier via hash", async () => {
		(ApiKey.findAll as jest.Mock).mockResolvedValueOnce([{ tier: "business", keyHash: "hashvalue" }]);
		(validateApiKeyAgainstHash as jest.Mock).mockResolvedValueOnce(true);
		const req = { headers: { authorization: "Bearer cc_live_abcdefghijklmno" } };
		const tier = await resolveRequestTier(req as never);
		expect(tier).toBe("business");
	});

	it("returns base when cc_live_ hash does not match", async () => {
		(ApiKey.findAll as jest.Mock).mockResolvedValueOnce([{ tier: "pro", keyHash: "hashvalue" }]);
		(validateApiKeyAgainstHash as jest.Mock).mockResolvedValueOnce(false);
		const req = { headers: { authorization: "Bearer cc_live_abcdefghijklmno" } };
		const tier = await resolveRequestTier(req as never);
		expect(tier).toBe("base");
	});

	it("returns base when cc_live_ has no matching candidates", async () => {
		(ApiKey.findAll as jest.Mock).mockResolvedValueOnce([]);
		const req = { headers: { authorization: "Bearer cc_live_abcdefghijklmno" } };
		const tier = await resolveRequestTier(req as never);
		expect(tier).toBe("base");
	});

	it("resolves Clerk session to subscription tier", async () => {
		(Subscription.findOne as jest.Mock).mockResolvedValueOnce({ tier: "pro" });
		const req = {
			headers: { authorization: "" },
			auth: jest.fn().mockResolvedValueOnce({ userId: "clerk_user_123" }),
		};
		const tier = await resolveRequestTier(req as never);
		expect(tier).toBe("pro");
	});

	it("returns base when Clerk user has no subscription", async () => {
		(Subscription.findOne as jest.Mock).mockResolvedValueOnce(null);
		const req = {
			headers: { authorization: "" },
			auth: jest.fn().mockResolvedValueOnce({ userId: "clerk_user_no_sub" }),
		};
		const tier = await resolveRequestTier(req as never);
		expect(tier).toBe("base");
	});

	it("returns base when no Authorization header", async () => {
		const req = { headers: {} };
		const tier = await resolveRequestTier(req as never);
		expect(tier).toBe("base");
	});

	it("returns base when auth() throws", async () => {
		const req = {
			headers: { authorization: "" },
			auth: jest.fn().mockRejectedValueOnce(new Error("auth failure")),
		};
		const tier = await resolveRequestTier(req as never);
		expect(tier).toBe("base");
	});
});
