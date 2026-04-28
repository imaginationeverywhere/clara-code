#!/usr/bin/env node
/**
 * Ensures spoken phrasings from docs/catalog/voice-intent-catalog.yaml
 * do not appear verbatim in packages/cli/src — gateway owns classification text.
 *
 * Placeholders like <name>, <topic> are stripped before substring search.
 * Very short phrases (< minLen) are skipped to reduce noise.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CATALOG = join(ROOT, "docs/catalog/voice-intent-catalog.yaml");
const CLI_SRC = join(ROOT, "packages/cli/src");

/** Ignore normalized needles shorter than this (generic fragments). */
const MIN_LEN = 20;
const SKIP_SUBSTRINGS = ["<name>", "<topic>", "<key>", "<value>", "<claim>", "<statement>", "<fact>", "<heru-name>"];

function walkTs(dir, acc = []) {
	for (const name of readdirSync(dir)) {
		const p = join(dir, name);
		const st = statSync(p);
		if (st.isDirectory()) {
			walkTs(p, acc);
		} else if (name.endsWith(".ts") || name.endsWith(".tsx")) {
			acc.push(p);
		}
	}
	return acc;
}

function normalizePhrase(raw) {
	let s = raw;
	for (const ph of SKIP_SUBSTRINGS) {
		s = s.split(ph).join("");
	}
	s = s.replace(/\s+/g, " ").trim();
	return s;
}

function extractQuotedPhrases(yamlText) {
	const phrases = [];
	for (const line of yamlText.split("\n")) {
		const m = line.match(/^\s+-\s+"([^"]*)"$/);
		if (m?.[1]) {
			phrases.push(m[1]);
		}
	}
	return phrases;
}

function main() {
	const yaml = readFileSync(CATALOG, "utf8");
	const rawPhrases = extractQuotedPhrases(yaml);
	const needles = [];
	for (const r of rawPhrases) {
		const n = normalizePhrase(r);
		if (n.length >= MIN_LEN) {
			needles.push({ raw: r, needle: n });
		}
	}

	const files = walkTs(CLI_SRC);
	const leaks = [];

	for (const { raw, needle } of needles) {
		for (const file of files) {
			const content = readFileSync(file, "utf8");
			if (content.includes(needle)) {
				leaks.push({ needle: raw, file: file.replace(ROOT + "/", "") });
			}
		}
	}

	if (leaks.length > 0) {
		console.error("audit-cli-intent-catalog: catalog phrasing leaked into CLI sources:\n");
		for (const L of leaks) {
			console.error(`  ${L.file}\n    phrase: ${L.needle}\n`);
		}
		process.exit(1);
	}

	console.log(
		`audit-cli-intent-catalog: ok (${String(needles.length)} phrases checked, minLen=${String(MIN_LEN)})`,
	);
}

main();
