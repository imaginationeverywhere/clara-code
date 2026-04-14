import { ApiKey } from "@/models/ApiKey";

describe("ApiKey model", () => {
	it("generateLegacyKey sets sk-clara-* format", () => {
		const instance = { key: "" } as unknown as ApiKey;
		ApiKey.generateLegacyKey(instance);
		expect(instance.key).toMatch(/^sk-clara-[a-f0-9]{48}$/);
	});

	it("generates unique keys", () => {
		const a = { key: "" } as unknown as ApiKey;
		const b = { key: "" } as unknown as ApiKey;
		ApiKey.generateLegacyKey(a);
		ApiKey.generateLegacyKey(b);
		expect(a.key).not.toBe(b.key);
	});
});
