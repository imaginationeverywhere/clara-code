import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

/** @type {import("eslint").Linter.Config[]} */
const nextCoreWebVitals = require("eslint-config-next/core-web-vitals");

const eslintConfig = [
	{
		ignores: [".next/**", ".open-next/**"],
	},
	...nextCoreWebVitals,
];

export default eslintConfig;
