import type { Command } from "commander";
import { writeClaraCredentials } from "../lib/credentials-store.js";
import { type CliAuthPayload, startCliAuthLoopback } from "../lib/login-loopback.js";
import { openBrowser } from "../lib/open-browser.js";

const CLI_AUTH_BASE = "https://claracode.ai/cli-auth";
const SIGN_IN_TIMEOUT_MS = 5 * 60_000;

/**
 * Browser-mediated sign-in: local loopback receives JSON from claracode.ai, then creds go to the OS keyring.
 */
export async function runClaraLogin(): Promise<void> {
	const { port, waitForCallback, close } = await startCliAuthLoopback({
		timeoutMs: SIGN_IN_TIMEOUT_MS,
	});
	const url = `${CLI_AUTH_BASE}?cli_port=${port}`;
	try {
		console.log(`Opening ${url} in your browser…`);
		await openBrowser(url);
	} catch (err) {
		console.error("Could not open a browser automatically. Open this URL manually:", url);
		if (err instanceof Error) {
			console.error(err.message);
		}
	}
	let payload: CliAuthPayload;
	try {
		payload = await waitForCallback();
	} catch (e) {
		close();
		throw e instanceof Error ? e : new Error(String(e));
	}
	await writeClaraCredentials({
		token: payload.sessionToken,
		apiKey: payload.apiKey,
	});
	console.log(`Signed in as ${payload.email}`);
}

export function registerLoginCommand(program: Command): void {
	program
		.command("login")
		.description("Sign in in the browser; store session and API key in the OS keyring (not plain files)")
		.action(async () => {
			try {
				await runClaraLogin();
			} catch (e) {
				const msg = e instanceof Error ? e.message : "Sign-in failed. Run `clara doctor` for help.";
				console.error(msg);
				process.exitCode = 1;
			}
		});
}
