import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Command } from "commander";
import { validateAgentName } from "../lib/agent-name.js";
import { postAgentInitWithUnifiedFirst } from "../lib/agents-api.js";
import { pickBearerToken, readClaraCredentials } from "../lib/credentials-store.js";
import { writeLastClaraError } from "../lib/last-error.js";

const DEFAULT_PRICING = "https://claracode.ai/pricing";

export function registerInitCommand(program: Command): void {
	program
		.command("init")
		.description("Create a new agent repository from the platform template and clone it here")
		.argument("<name>", "Agent name in kebab-case (e.g. my-first-agent)")
		.option("--backend <url>", "Clara API base URL (overrides CLARA_BACKEND_URL and config)")
		.option("--gateway <url>", "Clara gateway base for unified POST /v1/run (overrides CLARA_GATEWAY_URL / config)")
		.action(async (name: string, opts: { backend?: string; gateway?: string }) => {
			const c = await readClaraCredentials();
			if (!c || pickBearerToken(c).length === 0) {
				console.error("Run `clara login` first.");
				process.exitCode = 1;
				return;
			}

			const v = validateAgentName(name);
			if (!v.ok) {
				console.error(v.message);
				process.exitCode = 1;
				return;
			}

			const dir = join(process.cwd(), name.trim());
			if (existsSync(dir)) {
				console.error(`Refusing to clone: a file or directory already exists at ${dir}`);
				process.exitCode = 1;
				return;
			}

			try {
				const { cloneUrl, repoUrl } = await postAgentInitWithUnifiedFirst(name.trim(), opts.backend, {
					gatewayBase: opts.gateway,
				});
				await new Promise<void>((resolve, reject) => {
					const child = spawn("git", ["clone", cloneUrl, dir], { stdio: "inherit" });
					child.on("error", reject);
					child.on("close", (code) => {
						if (code === 0) {
							resolve();
						} else {
							reject(new Error(`git clone exited with code ${code}`));
						}
					});
				});
				console.log(`Created agent ${name.trim()} at ./${name.trim()} — see ${repoUrl}`);
			} catch (e) {
				const trimmedName = name.trim();
				const recordMessage = (msg: string): void => {
					try {
						writeLastClaraError({
							command: `clara init ${trimmedName}`,
							message: msg,
							at: new Date().toISOString(),
						});
					} catch {
						// ignore write failures
					}
				};
				if (e instanceof Error) {
					if (e.message === "not_authenticated") {
						recordMessage("not_authenticated");
						console.error("Run `clara login` first.");
						process.exitCode = 1;
						return;
					}
					if (e.message === "unauthorized") {
						recordMessage("unauthorized");
						console.error("Run `clara login` first.");
						process.exitCode = 1;
						return;
					}
					if (e.message === "tier_lock") {
						recordMessage("tier_lock");
						const u = (e as Error & { upgradeUrl?: string }).upgradeUrl ?? DEFAULT_PRICING;
						console.error("Your plan does not include standalone agent repositories yet.");
						console.error(`See pricing: ${u}`);
						process.exitCode = 1;
						return;
					}
				}
				const msg = e instanceof Error ? e.message : String(e);
				recordMessage(msg);
				console.error(msg);
				process.exitCode = 1;
			}
		});
}
