import type { Config } from "jest";

const config: Config = {
	preset: "ts-jest",
	testEnvironment: "node",
	setupFiles: ["<rootDir>/jest.setup.js"],
	transform: {
		"^.+\\.tsx?$": [
			"ts-jest",
			{
				tsconfig: "<rootDir>/tsconfig.jest.json",
			},
		],
	},
	roots: ["<rootDir>/src"],
	testMatch: ["**/__tests__/**/*.test.ts", "**/*.test.ts"],
	moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
	collectCoverageFrom: [
		"src/**/*.ts",
		"!src/**/*.d.ts",
		"!src/**/__tests__/**",
		"!src/load-env.ts",
		"!src/database/config.js",
		"!src/database/migrations/**",
		// Bootstrap / wiring — covered by integration smoke; branch-heavy env branches skew totals
		"!src/server.ts",
		"!src/utils/logger.ts",
	],
	coverageThreshold: { global: { lines: 80, branches: 80, functions: 80, statements: 80 } },
	coverageReporters: ["text", "json-summary"],
	testTimeout: 30000,
};

export default config;
