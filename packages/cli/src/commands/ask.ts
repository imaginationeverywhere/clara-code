import type { Command } from "commander";

export function registerAskCommand(program: Command): void {
	program
		.command("ask")
		.argument("<question>", "Question to send to Clara")
		.description("Send a question to the Clara API and print the response (not yet implemented)")
		.action((_question: string) => {
			console.error("clara ask: not implemented — will send the question to the Clara API.");
			process.exitCode = 1;
		});
}
