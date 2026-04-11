/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("node:path");

/** @type {import("webpack").Configuration[]} */
module.exports = [
	{
		target: "node",
		entry: "./src/extension.ts",
		output: {
			path: path.resolve(__dirname, "dist"),
			filename: "extension.js",
			library: { type: "commonjs2" },
		},
		externals: { vscode: "commonjs vscode" },
		resolve: {
			extensions: [".ts", ".js"],
		},
		module: {
			rules: [
				{
					test: /\.ts$/,
					use: [
						{
							loader: "ts-loader",
							options: {
								configFile: "tsconfig.json",
								transpileOnly: true,
							},
						},
					],
					exclude: /node_modules|webview/,
				},
			],
		},
	},
	{
		target: "web",
		entry: "./src/webview/main.tsx",
		output: {
			path: path.resolve(__dirname, "dist"),
			filename: "webview.js",
		},
		resolve: { extensions: [".ts", ".tsx", ".js"] },
		module: {
			rules: [
				{
					test: /\.tsx?$/,
					use: [
						{
							loader: "ts-loader",
							options: {
								configFile: "tsconfig.webview.json",
								transpileOnly: true,
							},
						},
					],
					exclude: /node_modules/,
				},
				{
					test: /\.css$/,
					use: ["style-loader", "css-loader"],
				},
			],
		},
	},
];
