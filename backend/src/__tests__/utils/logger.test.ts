describe("logger", () => {
	it("info does not throw", () => {
		const { logger } = require("@/utils/logger");
		expect(() => logger.info("test")).not.toThrow();
	});
});
