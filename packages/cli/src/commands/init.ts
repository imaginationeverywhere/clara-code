import { execFile as execFileCb } from "node:child_process";
import { existsSync } from "node:fs";
import { promisify } from "node:util";

const execFile = promisify(execFileCb);

import { join } from "node:path";
import type { Command } from "commander";
import { validateAgentName } from "../lib/agent-name.js";
import { postAgentInit } from "../lib/agents-api.js";
import { readClaraCredentials } from "../lib/credentials-store.js";

const DEFAULT_PRICING = "https://claracode.ai/pricing";

export function registerInitCommand(program: Command): void {
	program
		.command("init")
		.description("Create a new agent repository from the platform template and clone it here")
		.argument("<name>", "Agent name in kebab-case (e.g. my-first-agent)")
		.option("--backend <url>", "Clara API base URL (overrides CLARA_BACKEND_URL and config)")
		.action(async (name: string, opts: { backend?: string }) => {
			const c = readClaraCredentials();
			if (!c?.token) {
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
				const { cloneUrl, repoUrl } = await postAgentInit(name.trim(), opts.backend);
				await execFile("git", ["clone", cloneUrl, dir], { stdio: "inherit" });
				console.log(`Created agent ${name.trim()} at ./${name.trim()} — see ${repoUrl}`);
			} catch (e) {
				if (e instanceof Error) {
					if (e.message === "not_authenticated") {
						console.error("Run `clara login` first.");
						process.exitCode = 1;
						return;
					}
					if (e.message === "unauthorized") {
						console.error("Run `clara login` first.");
						process.exitCode = 1;
						return;
					}
					if (e.message === "tier_lock") {
						const u = (e as Error & { upgradeUrl?: string }).upgradeUrl ?? DEFAULT_PRICING;
						console.error("Your plan does not include standalone agent repositories yet.");
						console.error(`See pricing: ${u}`);
						process.exitCode = 1;
						return;
					}
				}
				console.error(e instanceof Error ? e.message : String(e));
				process.exitCode = 1;
			}
		});
}
