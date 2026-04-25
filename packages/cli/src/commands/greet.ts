import type { Command } from "commander";
import { playCanonicalGreeting } from "../lib/canonical-greeting.js";

export function registerGreetCommand(program: Command): void {
	program
		.command("greet")
		.description("Request Clara's voice greeting from the API and play the audio")
		.option("--refresh", "Bypass cache and fetch a fresh greeting")
		.action(async (opts: { refresh?: boolean }) => {
			const result = await playCanonicalGreeting({ refresh: Boolean(opts.refresh) });
			if (result.ok) {
				return;
			}
			console.error(`clara greet: ${result.message}`);
			process.exitCode = 1;
		});
}
