import { generateApiKey, validateApiKeyAgainstHash } from "@/utils/api-key";

describe("api-key utils", () => {
	it("generateApiKey returns cc_live format and stable prefix length", () => {
		const a = generateApiKey("pro");
		expect(a.key).toMatch(/^cc_live_[a-f0-9]{64}$/);
		expect(a.prefix).toBe(a.key.slice(0, 16));
		expect(a.hash.length).toBeGreaterThan(20);
	});

	it("validateApiKeyAgainstHash verifies bcrypt hash", async () => {
		const { key, hash } = generateApiKey("business");
		await expect(validateApiKeyAgainstHash(key, hash)).resolves.toBe(true);
		await expect(validateApiKeyAgainstHash("wrong", hash)).resolves.toBe(false);
	});
});
