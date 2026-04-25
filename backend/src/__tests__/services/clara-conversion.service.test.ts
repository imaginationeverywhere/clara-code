import { buildConversionPrompt } from "@/services/clara-conversion.service";

describe("clara-conversion.service", () => {
	it("buildConversionPrompt includes the exchange count and CTA", () => {
		const t = buildConversionPrompt(100);
		expect(t).toContain("100");
		expect(t).toMatch(/claracode\.ai/);
	});
});
