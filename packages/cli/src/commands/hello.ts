import type { Command } from "commander";

export function registerHelloCommand(program: Command): void {
	program
		.command("hello")
		.description("Play Clara's voice greeting from the API (not yet implemented)")
		.action(() => {
			console.error("clara hello: not implemented — will play Clara's voice greeting from the API.");
			process.exitCode = 1;
		});
}
