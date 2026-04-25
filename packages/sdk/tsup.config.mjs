import { defineConfig } from "tsup";

export default defineConfig({
	entry: {
		index: "src/index.ts",
		react: "src/react/index.ts",
	},
	format: ["cjs", "esm"],
	dts: true,
	outDir: "dist",
	clean: true,
	sourcemap: true,
	outExtension({ format }) {
		return { js: format === "esm" ? ".mjs" : ".js" };
	},
});
