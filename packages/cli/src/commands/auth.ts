import { createInterface } from "node:readline";
import type { Command } from "commander";
import { writeClaraCredentials } from "../lib/credentials-store.js";
import { openBrowser } from "../lib/open-browser.js";

const CLI_AUTH_URL = "https://claracode.ai/cli-auth";

function promptLine(question: string): Promise<string> {
	const rl = createInterface({ input: process.stdin, output: process.stdout });
	return new Promise((resolve) => {
		rl.question(question, (answer) => {
			rl.close();
			resolve(answer.trim());
		});
	});
}

export function registerAuthCommand(program: Command): void {
	const auth = program.command("auth").description("Authenticate with Clara");

	auth
		.command("login")
		.description("Open the browser to sign in and save your CLI token to ~/.clara/credentials.json")
		.action(async () => {
			console.log(`Opening ${CLI_AUTH_URL} in your browser...`);
			try {
				await openBrowser(CLI_AUTH_URL);
			} catch (err) {
				console.error("Could not open a browser automatically. Open this URL manually:", CLI_AUTH_URL);
				if (err instanceof Error) {
					console.error(err.message);
				}
			}
			const token = await promptLine("Paste your CLI token and press Enter: ");
			if (token.length === 0) {
				console.error("clara auth login: no token provided");
				process.exitCode = 1;
				return;
			}
			writeClaraCredentials({ token });
			console.log("Saved token to ~/.clara/credentials.json");
		});
}
