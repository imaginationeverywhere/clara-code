import type { Command } from "commander";
import { readClaraConfig, writeClaraConfig } from "../lib/config-store.js";

export function registerConfigCommand(program: Command): void {
	const config = program.command("config").description("Read or write ~/.clara/config.json");

	config
		.command("set")
		.description("Set a configuration value")
		.argument("<key>", "Configuration key (e.g. api-key)")
		.argument("<value>", "Value to store")
		.action((key: string, value: string) => {
			if (key === "api-key") {
				const next = { ...readClaraConfig(), apiKey: value };
				writeClaraConfig(next);
				console.log("Saved api-key to ~/.clara/config.json");
				return;
			}
			console.error(`clara config set: unsupported key "${key}"`);
			process.exitCode = 1;
		});

	config
		.command("get")
		.description("Print a configuration value")
		.argument("<key>", "Configuration key (e.g. api-key)")
		.action((key: string) => {
			const data = readClaraConfig();
			if (key === "api-key") {
				const v = data.apiKey;
				if (v === undefined || v === "") {
					console.log("");
					return;
				}
				console.log(v);
				return;
			}
			console.error(`clara config get: unsupported key "${key}"`);
			process.exitCode = 1;
		});
}
