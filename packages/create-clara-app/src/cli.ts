#!/usr/bin/env node
/**
 * create-clara-app — Bootstrap a new Clara AI coding agent project
 *
 * Usage:
 *   npx create-clara-app my-agent
 *   npx create-clara-app          # interactive mode
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { createInterface } from "node:readline/promises";

// ---------------------------------------------------------------------------
// Prompt helper
// ---------------------------------------------------------------------------

async function ask(rl: ReturnType<typeof createInterface>, question: string, fallback: string): Promise<string> {
	const answer = await rl.question(`${question} (${fallback}): `);
	return answer.trim() || fallback;
}

// ---------------------------------------------------------------------------
// Template files
// ---------------------------------------------------------------------------

function agentTs(agentName: string): string {
	return `import { createClaraAgent } from "@ie/clara";

const { session } = await createClaraAgent({ name: "${agentName}" });

// Start your agent
await session.prompt("Hello Clara! What should we build today?");
`;
}

function packageJson(projectName: string): string {
	return JSON.stringify(
		{
			name: projectName,
			version: "0.1.0",
			type: "module",
			scripts: {
				start: "npx tsx src/agent.ts",
				build: "tsgo -p tsconfig.json",
			},
			dependencies: {
				"@ie/clara": "^0.1.0",
			},
			devDependencies: {
				typescript: "^5.0.0",
				"@tsgo/tsgo": "latest",
				tsx: "^4.0.0",
			},
		},
		null,
		2,
	);
}

function tsconfig(): string {
	return JSON.stringify(
		{
			compilerOptions: {
				target: "ES2022",
				module: "Node16",
				moduleResolution: "Node16",
				strict: true,
				esModuleInterop: true,
				skipLibCheck: true,
				outDir: "./dist",
				rootDir: "./src",
			},
			include: ["src/**/*"],
			exclude: ["node_modules", "dist"],
		},
		null,
		2,
	);
}

function gitignore(): string {
	return `node_modules/
dist/
.env
*.jsonl
`;
}

function readme(projectName: string, agentName: string): string {
	return `# ${projectName}

A Clara AI coding agent built with [@ie/clara](https://github.com/imaginationeverywhere/clara-code).

## Getting started

\`\`\`bash
npm install
npm start
\`\`\`

## Your agent

Edit \`src/agent.ts\` to customize what your agent does.

**Agent name:** ${agentName}
**Default model:** Hermes router — Gemma 4 27B primary (self-hosted on Modal), with smart fallback to Kimi K2, DeepSeek V3, and premium models

## Documentation

- [Clara Code](https://github.com/imaginationeverywhere/clara-code)
- [@ie/clara SDK](https://github.com/imaginationeverywhere/clara-code/tree/main/packages/clara)
`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
	const args = process.argv.slice(2);

	const rl = createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	console.log("\n  Clara — AI Coding Agent Builder\n");
	console.log("  Coming soon. GitHub beta: npx create-clara-app@beta\n");
	console.log("  Creating your project...\n");

	let projectName = args[0] ?? "";

	if (!projectName) {
		projectName = await ask(rl, "  Project name", "my-clara-agent");
	}

	const agentName = await ask(rl, "  Agent name", projectName);

	rl.close();

	const projectDir = resolve(process.cwd(), projectName);

	if (existsSync(projectDir)) {
		console.error(`\n  Error: Directory "${projectName}" already exists.\n`);
		process.exit(1);
	}

	// Create project structure
	mkdirSync(join(projectDir, "src"), { recursive: true });

	writeFileSync(join(projectDir, "src", "agent.ts"), agentTs(agentName));
	writeFileSync(join(projectDir, "package.json"), packageJson(projectName));
	writeFileSync(join(projectDir, "tsconfig.json"), tsconfig());
	writeFileSync(join(projectDir, ".gitignore"), gitignore());
	writeFileSync(join(projectDir, "README.md"), readme(projectName, agentName));

	console.log(`\n  Created: ${projectDir}\n`);
	console.log("  Next steps:\n");
	console.log(`    cd ${projectName}`);
	console.log("    npm install");
	console.log("    npm start\n");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
