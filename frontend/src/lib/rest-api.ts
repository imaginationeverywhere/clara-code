/** REST API origin derived from GraphQL URL (same host, no /graphql path). */
export function getRestApiOrigin(): string {
	const g = process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:3031/graphql";
	try {
		const u = new URL(g);
		return `${u.protocol}//${u.host}`;
	} catch {
		return "http://localhost:3031";
	}
}
