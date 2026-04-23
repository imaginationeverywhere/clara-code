import { defineConfig } from "tsup";

export default defineConfig({
	entry: {
		index: "src/index.ts",
		"converse-browser": "src/converse-browser.ts",
	},
	format: ["esm"],
	dts: true,
	outDir: "dist",
	clean: true,
	sourcemap: true,
});
