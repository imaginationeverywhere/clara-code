import { McpServer } from "@/models/McpServer";
import { logger } from "@/utils/logger";

function mcpUrl(envKey: string, slug: string): string {
	const v = process.env[envKey];
	return typeof v === "string" && v.length > 0 ? v : `https://mcp.clara.internal/placeholder/${slug}`;
}

const rows: Array<Record<string, unknown> & { id: string; displayName: string }> = [
	{
		id: "clara-stripe",
		displayName: "Stripe",
		description: "Charge customers, manage subscriptions, issue refunds.",
		category: "payments",
		ownerType: "clara",
		ownerUserId: null,
		endpointUrl: mcpUrl("CLARA_MCP_STRIPE_URL", "stripe"),
		authScheme: "vault",
		minTier: "basic",
		isPublic: true,
	},
	{
		id: "clara-quickbooks",
		displayName: "QuickBooks",
		description: "Draft invoices, reconcile books, tax summaries.",
		category: "accounting",
		ownerType: "clara",
		ownerUserId: null,
		endpointUrl: mcpUrl("CLARA_MCP_QUICKBOOKS_URL", "quickbooks"),
		authScheme: "oauth",
		minTier: "basic",
		isPublic: true,
	},
	{
		id: "clara-slack",
		displayName: "Slack",
		description: "Post messages, DM users, read channels.",
		category: "communications",
		ownerType: "clara",
		ownerUserId: null,
		endpointUrl: mcpUrl("CLARA_MCP_SLACK_URL", "slack"),
		authScheme: "oauth",
		minTier: "basic",
		isPublic: true,
	},
	{
		id: "clara-github",
		displayName: "GitHub",
		description: "Open PRs, comment on issues, manage branches.",
		category: "devops",
		ownerType: "clara",
		ownerUserId: null,
		endpointUrl: mcpUrl("CLARA_MCP_GITHUB_URL", "github"),
		authScheme: "oauth",
		minTier: "pro",
		isPublic: true,
	},
	{
		id: "clara-playwright",
		displayName: "Playwright",
		description: "Browser automation — navigate, click, fill forms, screenshot.",
		category: "devops",
		ownerType: "clara",
		ownerUserId: null,
		endpointUrl: mcpUrl("CLARA_MCP_PLAYWRIGHT_URL", "playwright"),
		authScheme: "bearer",
		minTier: "max",
		isPublic: true,
	},
	{
		id: "clara-sendgrid",
		displayName: "Email (SendGrid)",
		description: "Send transactional + marketing emails.",
		category: "communications",
		ownerType: "clara",
		ownerUserId: null,
		endpointUrl: mcpUrl("CLARA_MCP_SENDGRID_URL", "sendgrid"),
		authScheme: "vault",
		minTier: "basic",
		isPublic: true,
	},
	{
		id: "clara-twilio",
		displayName: "SMS + Voice (Twilio)",
		description: "Send SMS, make outbound calls.",
		category: "communications",
		ownerType: "clara",
		ownerUserId: null,
		endpointUrl: mcpUrl("CLARA_MCP_TWILIO_URL", "twilio"),
		authScheme: "vault",
		minTier: "pro",
		isPublic: true,
	},
];

/**
 * Idempotent: upserts the curated catalog. Call after `027_mcp_connections.sql` has been applied.
 */
export async function seedMcpCatalogIfEmpty(): Promise<void> {
	try {
		if ((await McpServer.count()) > 0) {
			return;
		}
		for (const r of rows) {
			await McpServer.upsert(r as Parameters<typeof McpServer.upsert>[0], {});
		}
		logger.info("[mcp] curated MCP catalog seeded");
	} catch (e) {
		logger.error("[mcp] seed failed (is migration 027 applied?)", e);
	}
}
