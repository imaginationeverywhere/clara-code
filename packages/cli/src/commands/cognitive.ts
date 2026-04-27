import type { Command } from "commander";
import { readCognitiveTextArg, runCognitive } from "../lib/cognitive.js";

const ONES: Array<{
	v: string;
	desc: string;
	verbKey: string;
}> = [
	{ v: "analyze", desc: "Analyze text or a file (`@path`)", verbKey: "analyze" },
	{ v: "think", desc: "POST /v1/think", verbKey: "think" },
	{ v: "critically-think", desc: "POST /v1/critically-think", verbKey: "critically-think" },
	{ v: "creative-thinking", desc: "POST /v1/creative-thinking", verbKey: "creative-thinking" },
	{ v: "truth", desc: "POST /v1/truth", verbKey: "truth" },
	{ v: "facts", desc: "POST /v1/facts", verbKey: "facts" },
];

function buildBody(verbKey: string, content: string, isFile: boolean): Record<string, unknown> {
	if (verbKey === "analyze") {
		return { text: content, ...(isFile ? { fromFile: true } : {}) };
	}
	if (verbKey === "truth") {
		return { claim: content };
	}
	if (verbKey === "facts") {
		return { topic: content };
	}
	return { prompt: content };
}

function registerOneTextVerb(program: Command, item: (typeof ONES)[number]): void {
	const c = program.command(item.v).description(item.desc);
	c.option("--json", "print raw JSON response", false);
	c.argument("<text>", "inline text, or @file path");
	c.action(async (text: string) => {
		const json = c.opts().json === true;
		try {
			const { text: content, isFile } = readCognitiveTextArg(text);
			const body = buildBody(item.verbKey, content, isFile);
			const r = await runCognitive(item.verbKey, body, json);
			if (json) {
				console.log(JSON.stringify(r.raw, null, 2));
			} else {
				console.log(r.reply);
			}
		} catch (e) {
			console.error(e instanceof Error ? e.message : String(e));
			process.exit(1);
		}
	});
}

function registerSave(program: Command): void {
	const c = program.command("save").description("POST /v1/save (key and value words)");
	c.option("--json", "print raw JSON response", false);
	c.argument("<key>", "key");
	c.argument("[value...]", "value (all remaining words)");
	c.action(async (key: string, valueParts: string[]) => {
		const json = c.opts().json === true;
		const val = Array.isArray(valueParts) ? valueParts.join(" ") : String(valueParts ?? "");
		if (!val) {
			console.error("clara save: need a value after the key");
			process.exit(1);
		}
		try {
			const r = await runCognitive("save", { key, value: val }, json);
			if (json) {
				console.log(JSON.stringify(r.raw, null, 2));
			} else {
				console.log(r.reply);
			}
		} catch (e) {
			console.error(e instanceof Error ? e.message : String(e));
			process.exit(1);
		}
	});
}

function registerRemember(program: Command): void {
	const c = program.command("remember").description("POST /v1/remember");
	c.option("--json", "print raw JSON response", false);
	c.argument("<key>", "key");
	c.action(async (key: string) => {
		const json = c.opts().json === true;
		try {
			const r = await runCognitive("remember", { key }, json);
			if (json) {
				console.log(JSON.stringify(r.raw, null, 2));
			} else {
				console.log(r.reply);
			}
		} catch (e) {
			console.error(e instanceof Error ? e.message : String(e));
			process.exit(1);
		}
	});
}

export function registerCognitiveCommands(program: Command): void {
	for (const it of ONES) {
		registerOneTextVerb(program, it);
	}
	registerSave(program);
	registerRemember(program);
}
