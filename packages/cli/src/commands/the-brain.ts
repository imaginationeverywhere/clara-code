import type { Command } from "commander";

const QUIKNATION_ERROR = `Quik Nation Brain access is restricted to founders. You can query your tenant brain at brain-api.claracode.ai. If you need information from the platform, ask Quik Nation support at support@quiknation.com.`;

const CUSTOMER_BRAIN_BASE = "https://brain-api.claracode.ai";

/**
 * Customer-facing /the-brain: default tenant brain only; block founder target.
 * Cursor slash command lives in `.claude/commands/the-brain-customer.md`; this is the `clara` subcommand.
 */
export function registerTheBrainCustomerCommand(program: Command): void {
	program
		.command("the-brain")
		.description("Clara Code tenant brain (not Quik Nation founder brain)")
		.argument("[target]", "optional; if it references quiknation as a brain target, the command errors")
		.action((target?: string) => {
			const t = (target ?? "").toLowerCase();
			if (t === "quiknation" || t.includes("quiknation.com") || t === "qn") {
				console.error(QUIKNATION_ERROR);
				process.exit(1);
			}
			console.log(`Default brain API base: ${CUSTOMER_BRAIN_BASE}`);
			console.log(
				"MCP: merge mcp-brain-customer.example.json (in the clara package) into your MCP config; set CLARA_TENANT_JWT from the customer session.",
			);
			console.log("No outbound request performed by this subcommand.");
			process.exit(0);
		});
}
