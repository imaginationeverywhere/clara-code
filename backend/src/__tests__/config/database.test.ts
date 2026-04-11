import { sequelize, testConnection } from "@/config/database";

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
});
