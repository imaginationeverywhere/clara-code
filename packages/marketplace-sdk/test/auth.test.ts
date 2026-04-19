import { verifyClaraServiceToken } from "../src/auth";

describe("verifyClaraServiceToken", () => {
	beforeEach(() => {
		process.env.CLARA_SERVICE_TOKEN = "test-service-token-abc123";
	});

	afterEach(() => {
		delete process.env.CLARA_SERVICE_TOKEN;
	});

	it("returns true for the correct token", () => {
		expect(verifyClaraServiceToken("test-service-token-abc123")).toBe(true);
	});

	it("returns false for an incorrect token", () => {
		expect(verifyClaraServiceToken("wrong-token")).toBe(false);
	});

	it("returns false for an empty string", () => {
		expect(verifyClaraServiceToken("")).toBe(false);
	});

	it("throws if CLARA_SERVICE_TOKEN env var is not set", () => {
		delete process.env.CLARA_SERVICE_TOKEN;
		expect(() => verifyClaraServiceToken("any-token")).toThrow("CLARA_SERVICE_TOKEN");
	});

	it("returns false for tokens of different lengths (timing-safe)", () => {
		expect(verifyClaraServiceToken("test-service-token-abc123-extra")).toBe(false);
	});
});
