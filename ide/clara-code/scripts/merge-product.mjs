#!/usr/bin/env node
/**
 * Deep-merge Clara product fragment and default settings into a vscode product.json.
 * Usage: node merge-product.mjs <path-to-product.json> [--in-place|--out <file>]
 */
import { readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function isPlainObject(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

function deepMerge(target, source) {
	if (!isPlainObject(target) || !isPlainObject(source)) {
		return source;
	}
	const out = { ...target };
	for (const [key, value] of Object.entries(source)) {
		if (value === undefined) {
			continue;
		}
		if (isPlainObject(value) && isPlainObject(out[key])) {
			out[key] = deepMerge(out[key], value);
		} else {
			out[key] = value;
		}
	}
	return out;
}

function readJson(path) {
	return JSON.parse(readFileSync(path, "utf8"));
}

function main() {
	const productPath = process.argv[2];
	if (!productPath) {
		console.error("Usage: merge-product.mjs <product.json> [--in-place|--out <file>]");
		process.exit(1);
	}
	const inPlace = process.argv.includes("--in-place");
	const outIdx = process.argv.indexOf("--out");
	const outPath = outIdx >= 0 ? process.argv[outIdx + 1] : null;

	const fragmentPath = join(__dirname, "../product/clara-product-fragment.json");
	const defaultSettingsPath = join(__dirname, "../product/default-settings.json");

	const base = readJson(productPath);
	const fragment = readJson(fragmentPath);
	const defaultSettings = readJson(defaultSettingsPath);

	const merged = deepMerge(base, fragment);
	merged.defaultSettings = deepMerge(merged.defaultSettings ?? {}, defaultSettings);

	const output = `${JSON.stringify(merged, null, "\t")}\n`;
	if (inPlace) {
		const backup = `${productPath}.pre-clara.bak`;
		copyFileSync(productPath, backup);
		writeFileSync(productPath, output, "utf8");
		console.error(`Wrote ${productPath} (backup: ${backup})`);
	} else if (outPath) {
		writeFileSync(outPath, output, "utf8");
		console.error(`Wrote ${outPath}`);
	} else {
		process.stdout.write(output);
	}
}

main();
