import { sequelize, testConnection } from "@/config/database";
import { logger } from "@/utils/logger";

describe("database", () => {
	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("testConnection resolves true when authenticate succeeds", async () => {
		jest.spyOn(sequelize, "authenticate").mockResolvedValue(undefined);
		await expect(testConnection({ silent: true })).resolves.toBe(true);
	});

	it("testConnection resolves false when authenticate fails", async () => {
		jest.spyOn(sequelize, "authenticate").mockRejectedValue(new Error("econnrefused"));
		await expect(testConnection({ silent: true })).resolves.toBe(false);
	});

	it("testConnection logs on success when not silent", async () => {
		jest.spyOn(sequelize, "authenticate").mockResolvedValue(undefined);
		await testConnection({ silent: false });
	});

	it("testConnection logs error when authenticate fails and not silent", async () => {
		jest.spyOn(sequelize, "authenticate").mockRejectedValue(new Error("econnrefused"));
		const errSpy = jest.spyOn(logger, "error").mockReturnValue(logger);
		await expect(testConnection({ silent: false })).resolves.toBe(false);
		expect(errSpy).toHaveBeenCalled();
		errSpy.mockRestore();
	});
});
