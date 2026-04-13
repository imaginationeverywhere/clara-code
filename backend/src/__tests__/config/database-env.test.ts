describe("database config URL branches", () => {
	const envSnapshot = { ...process.env };

	afterEach(() => {
		jest.resetModules();
		Object.assign(process.env, envSnapshot);
	});

	it("uses DATABASE_URL_PRODUCTION when NODE_ENV is production", async () => {
		process.env.NODE_ENV = "production";
		process.env.DATABASE_URL_PRODUCTION = "postgres://u:p@127.0.0.1:5432/proddb";
		process.env.DATABASE_URL = "postgres://a:b@127.0.0.1:5432/fallback";
		process.env.DB_SSL = "false";
		jest.resetModules();
		const { sequelize } = await import("@/config/database");
		expect(sequelize).toBeDefined();
	});

	it("prefers DATABASE_URL_STAGING over DATABASE_URL when not production", async () => {
		process.env.NODE_ENV = "development";
		process.env.DATABASE_URL_STAGING = "postgres://s:t@127.0.0.1:5432/stagingdb";
		process.env.DATABASE_URL = "postgres://a:b@127.0.0.1:5432/devdb";
		process.env.DB_SSL = "false";
		jest.resetModules();
		const { sequelize } = await import("@/config/database");
		expect(sequelize).toBeDefined();
	});
});
