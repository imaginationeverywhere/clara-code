import { apiKeyCreateLimiter, voiceLimiter, waitlistLimiter } from "@/middleware/rate-limit";

describe("rate-limit middleware", () => {
	it("exports configured limiters", () => {
		expect(typeof waitlistLimiter).toBe("function");
		expect(typeof voiceLimiter).toBe("function");
		expect(typeof apiKeyCreateLimiter).toBe("function");
	});
});
