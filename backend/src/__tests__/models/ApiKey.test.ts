import { ApiKey } from "@/models/ApiKey";

describe("ApiKey model", () => {
	it("generateKey sets sk-clara-* format", () => {
		const instance = { key: "" } as unknown as ApiKey;
		ApiKey.generateKey(instance);
		expect(instance.key).toMatch(/^sk-clara-[a-f0-9]{48}$/);
	});

	it("generates unique keys", () => {
		const a = { key: "" } as unknown as ApiKey;
		const b = { key: "" } as unknown as ApiKey;
		ApiKey.generateKey(a);
		ApiKey.generateKey(b);
		expect(a.key).not.toBe(b.key);
	});
});
