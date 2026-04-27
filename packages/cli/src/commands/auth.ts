import { Command } from "commander";
import { runClaraLogin } from "./login.js";

export function registerAuthCommand(program: Command): void {
	const auth = new Command("auth");
	auth.description("Authenticate with Clara (alias: use clara login)");

	auth
		.command("login")
		.description("Open the browser to sign in (same as clara login)")
		.action(async () => {
			try {
				await runClaraLogin();
			} catch (e) {
				const msg = e instanceof Error ? e.message : "Sign-in failed. Run `clara doctor` for help.";
				console.error(msg);
				process.exitCode = 1;
			}
		});
	program.addCommand(auth, { hidden: true });
}
